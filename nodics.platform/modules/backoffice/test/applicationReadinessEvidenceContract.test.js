/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/applicationReadinessEvidenceContract
 * @description Separates owner failures from unavailable readiness without replaying writes.
 * @layer test
 * @owner backoffice
 */
const assert = require("node:assert/strict");
const { test, after } = require("node:test");
const service = require("../src/service/defaultBackofficeApplicationInitializationService");
const previous = {
  CLASSES: global.CLASSES,
  SERVICE: global.SERVICE,
  NODICS: global.NODICS,
  CONFIG: global.CONFIG,
  UTILS: global.UTILS,
};
global.CLASSES = {
  NodicsError: class extends Error {
    constructor(input) {
      super(input.message);
      Object.assign(this, input);
    }
    static cleanContext(value) {
      return value;
    }
  },
};
after(() => {
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete global[key];
    else global[key] = value;
  }
});
const profile = {
  code: "untouched",
  owner: "cms",
  baselineCode: "untouched",
  target: {
    moduleName: "cms",
    connectionName: "contentStaged",
    runtimeRole: "WCMS_STAGED",
  },
};
const step = {
  code: "untouched:content",
  type: "DATA_RELEASE",
  required: true,
  targetServer: "contentStaged",
  targetRuntimeRole: "WCMS_STAGED",
  dataType: "sample",
};
function owner() {
  return Object.assign(Object.create(service), {
    profile: () => profile,
    preparationSteps: () => [step],
    functionalModulePreparationStatus: async () => [],
    preparationGroups: () => [{ ...step, steps: [step] }],
    describe: () => ({ code: profile.code }),
    capabilityProjection: (profile, projection) => ({
      blockers: service.capabilityBlockers(projection),
    }),
    applicationTargetBinding: () => ({ connectionName: "contentStaged" }),
  });
}

test("unavailable and unknown evidence never claim an import failure", async () => {
  for (const [response, expected] of [
    [{ releases: [] }, "READINESS_UNKNOWN"],
    [
      { releases: [{ releaseCode: step.code, status: "unrecognized" }] },
      "READINESS_UNKNOWN",
    ],
    [
      Object.assign(new Error("private provider content"), {
        code: "ERR_PROFILE_ELIGIBILITY_CONFIGURATION",
      }),
      "READINESS_UNAVAILABLE",
    ],
    [
      Object.assign(new Error("rate limit"), {
        code: "ERR_RTR_00004",
        status: 429,
      }),
      "READINESS_RATE_LIMITED",
    ],
  ]) {
    const selected = owner();
    selected.invokeDataReleaseOperation = async (mode) => {
      assert.equal(mode, "preflight");
      if (response instanceof Error) throw response;
      return response;
    };
    const preparation = await selected.preparationStatus(profile, {});
    assert.equal(preparation.status, "BLOCKED");
    const blockers = selected.capabilityBlockers({ preparation });
    assert.equal(blockers[0].code, expected);
    assert.equal(
      blockers[0].repair.operation,
      "applicationInitialization.status",
    );
    assert.equal(blockers[0].repair.action, "REFRESH_READINESS");
    assert(!JSON.stringify(blockers).includes("private provider content"));
  }
});

test("only the selected release owner FAILED status advertises import history", async () => {
  const selected = owner();
  selected.invokeDataReleaseOperation = async () => ({
    releases: [
      {
        releaseCode: "nexus:content",
        status: "FAILED",
        lastRunId: "run-nexus",
      },
      { releaseCode: step.code, status: "NOT_INSTALLED" },
    ],
  });
  let preparation = await selected.preparationStatus(profile, {});
  assert.equal(
    selected.capabilityBlockers({ preparation })[0].code,
    "IMPORT_NOT_STARTED",
  );
  selected.invokeDataReleaseOperation = async () => ({
    releases: [
      { releaseCode: step.code, status: "FAILED", lastRunId: "run-selected" },
    ],
  });
  preparation = await selected.preparationStatus(profile, {});
  const blocker = selected.capabilityBlockers({ preparation })[0];
  assert.equal(blocker.code, "IMPORT_FAILED");
  assert.equal(blocker.releaseReceipt.lastRunId, "run-selected");
  assert.equal(blocker.repair.action, "REVIEW_IMPORT_HISTORY");
});

test("typed rate limit on status projects transient readiness, never publication failure or write retry", async () => {
  const selected = owner();
  selected.preparationStatus = async () => ({ status: "CURRENT", steps: [] });
  const calls = [];
  global.NODICS = { getInternalAuthToken: () => "inert-test-token" };
  global.SERVICE = {
    DefaultModuleService: {
      invokeModule: async (request) => {
        calls.push(request.methodName);
        throw Object.assign(new Error("private rate provider text"), {
          code: "ERR_RTR_00004",
          status: 429,
        });
      },
    },
  };
  const result = await selected.invoke("status", profile.code, {});
  assert.deepEqual(calls, ["GET"]);
  assert.equal(result.readiness, "BLOCKED");
  assert.equal(result.publication, undefined);
  assert.deepEqual(result.allowedActions, []);
  assert.equal(result.capability.blockers[0].code, "READINESS_RATE_LIMITED");
  assert(!JSON.stringify(result).includes("private rate provider text"));
});

test("generic 500 and authorization denials never gain transient replay authority", async () => {
  const selected = owner();
  selected.preparationStatus = async () => ({ status: "CURRENT", steps: [] });
  for (const [code, status] of [
    ["ERR_SYS_00000", 500],
    ["ERR_AUTH_00001", 403],
  ]) {
    let calls = 0;
    global.NODICS = { getInternalAuthToken: () => "inert-test-token" };
    global.SERVICE = {
      DefaultModuleService: {
        invokeModule: async () => {
          calls++;
          throw Object.assign(new Error("target failed"), { code, status });
        },
      },
    };
    await assert.rejects(
      selected.invoke("status", profile.code, {}),
      (error) =>
        error.code === "ERR_BOF_00085" && error.metadata.targetCode === code,
    );
    assert.equal(calls, 1);
  }
});

test("actual import normalization and public error projection retain a validation hold, not a runtime outage", async () => {
  const importOwner = require("../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService");
  const handler = require("../../../../nodics.foundation/modules/nRouter/src/service/handlers/response/defaultJsonResponseHandlerService");
  const NodicsError = require("../../../../nodics.foundation/modules/nCommon/src/lib/nodicsError");
  const definitions = require("../../../../nodics.foundation/modules/nData/nImport/import/src/utils/statusDefinitions");
  const saved = Object.fromEntries(["CONFIG", "UTILS", "SERVICE", "CLASSES"].map(key => [key, global[key]]));
  try {
    global.CONFIG = { get: key => key === "defaultErrorCodes" ? { NodicsError: "ERR_IMP_00003" } : {} };
    global.UTILS = { isObject: value => value && typeof value === "object" };
    global.SERVICE = { DefaultStatusService: { get: code => definitions[code] } };
    global.CLASSES = { NodicsError };
    const normalized = importOwner.targetAdmissionError(Object.assign(new Error("private owner evidence"), {
      code: "ERR_PROFILE_ELIGIBILITY_CONFIGURATION",
    }));
    const transported = handler.publicError(normalized);
    assert.equal(transported.code, "ERR_IMP_00003");
    assert.equal(transported.metadata, undefined);
    const selected = owner();
    const grouped = [step, { ...step, code: "untouched:address" }, { ...step, code: "untouched:access" }];
    selected.preparationGroups = () => [{ ...step, steps: grouped }];
    let reads = 0;
    selected.invokeDataReleaseOperation = async mode => {
      assert.equal(mode, "preflight");
      reads++;
      throw transported;
    };
    const preparation = await selected.preparationStatus(profile, {});
    assert.equal(reads, 1);
    assert.equal(preparation.status, "BLOCKED");
    assert.deepEqual(preparation.steps.map(item => item.status), Array(3).fill("VALIDATION_BLOCKED"));
    assert(preparation.steps.every(item => item.runtimeDiagnostic === undefined));
    assert(preparation.steps.every(item => item.message.includes("3 releases") &&
      item.message.includes("does not identify a failure in every member")));
    const blockers = selected.capabilityBlockers({ preparation });
    assert(blockers.every(item => item.code === "READINESS_VALIDATION_BLOCKED"));
    assert(blockers.every(item => item.repair.available === false && item.repair.operation === undefined));
    assert(!JSON.stringify(preparation).includes("private owner evidence"));
    assert(!JSON.stringify(preparation).includes("runtime outage has occurred"));
    for (const error of [
      { code: "ERR_IMP_00003", responseCode: 500 },
      { code: "ERR_PROFILE_ELIGIBILITY_CONFIGURATION", responseCode: 400 },
      { code: "ERR_AUTH_00001", responseCode: 403, message: "ERR_IMP_00003" },
    ]) assert.equal(Boolean(selected.preparationValidationDenied(error)), false);
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete global[key]; else global[key] = value;
    }
  }
});

test("one blocked Platform group does not erase a successful publication runtime preflight", async () => {
  const selected = owner();
  selected.applicationTargetBinding = () => ({ connectionName: "contentStagedServer" });
  const current = { ...step, status: "NOT_INSTALLED" };
  const projection = { readiness: "BLOCKED", preparation: { steps: [
    { ...step, targetServer: "platformServer", targetRuntimeRole: "PLATFORM", status: "VALIDATION_BLOCKED" }, current,
  ] } };
  const runtime = selected.capabilityDependencies(profile, projection)[0];
  assert.equal(runtime.status, "AVAILABLE");
  assert.equal(runtime.server, "contentStagedServer");
  assert.equal(runtime.code, "contentStagedServer");
  for (const replacement of [
    { ...current, status: "UNKNOWN" },
    { ...current, status: "UNAVAILABLE" },
    { ...current, targetRuntimeRole: "WCMS_ONLINE" },
    { ...current, targetServer: "differentServer" },
  ]) assert.equal(selected.capabilityDependencies(profile, {
    ...projection, preparation: { steps: [replacement] },
  })[0].status, "UNKNOWN");
  assert.equal(selected.capabilityDependencies(profile, {
    publicationTargetResponded: true,
  })[0].status, "AVAILABLE");
  selected.applicationTargetBinding = () => { throw new Error("ambiguous deployment"); };
  assert.equal(selected.capabilityDependencies(profile, projection)[0].status, "UNKNOWN");
});

test("actual nService normalization with installed plain-object utilities preserves typed HTTP refusal evidence", async () => {
  const fs = require("node:fs"), vm = require("node:vm");
  const NodicsError = require("../../../../nodics.foundation/modules/nCommon/src/lib/nodicsError");
  const utilities = require("../../../../nodics.foundation/modules/nDatabase/database/src/utils/utils");
  const importDefinitions = require("../../../../nodics.foundation/modules/nData/nImport/import/src/utils/statusDefinitions");
  const saved = Object.fromEntries(["CONFIG", "UTILS", "SERVICE", "CLASSES"].map(key => [key, global[key]]));
  let outcome, calls = 0;
  try {
    global.CONFIG = { get: key => key === "defaultErrorCodes" ? { NodicsError: "ERR_SYS_00000" } : {} };
    global.UTILS = { ...utilities };
    global.SERVICE = { DefaultStatusService: { get: code => importDefinitions[code] || { code: "500", message: "Internal error" } } };
    global.CLASSES = { NodicsError };
    const sandbox = { module: { exports: {} },
      require: name => name === "node-fetch" ? async () => { calls++; return outcome; } : require(name),
      CLASSES: global.CLASSES, CONFIG: global.CONFIG, SERVICE: global.SERVICE,
      URL, AbortController, setTimeout, clearTimeout, process, Buffer,
    };
    vm.runInNewContext(fs.readFileSync(require.resolve("../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService"), "utf8"), sandbox);
    const transport = Object.assign(Object.create(sandbox.module.exports), {
      LOG: { debug() {} },
      getTransportConfiguration: () => ({ timeoutMs: 100, retry: { maxAttempts: 1, statuses: [], errorCodes: [] }, circuitBreaker: { enabled: false }, connectionPool: {} }),
      buildFetchErrorContext: () => ({ layer: "isolated-test" }),
    });
    for (const [code, status, expected] of [
      ["ERR_IMP_00003", 400, "VALIDATION_BLOCKED"],
      ["ERR_IMP_00004", 404, "VALIDATION_BLOCKED"],
      ["ERR_IMP_00003", 500, "UNAVAILABLE"],
      ["ERR_IMP_00003", 403, "UNAVAILABLE"],
      ["ERR_AUTH_00001", 400, "UNAVAILABLE"],
    ]) {
      outcome = { ok: false, status, json: async () => ({ code,
        message: "private-owner-sentinel", metadata: { remoteHttpFailure: { code: "ERR_IMP_00003", httpStatus: 400 } },
      }) };
      const selected = owner();
      selected.invokeDataReleaseOperation = async mode => {
        assert.equal(mode, "preflight");
        try { await transport.fetch({ uri: "http://127.0.0.1:1/isolated-stub", method: "POST", json: true }); }
        catch (error) {
          assert.equal(error.responseCode, "500", "real Error normalization loses native HTTP status");
          assert.equal(error.metadata.remoteHttpFailure.code, code);
          assert.equal(error.metadata.remoteHttpFailure.httpStatus, status);
          assert(!JSON.stringify(error.metadata.remoteHttpFailure).includes("private-owner-sentinel"));
          throw error;
        }
      };
      const preparation = await selected.preparationStatus(profile, {});
      assert.equal(preparation.steps[0].status, expected);
      const blocker = selected.capabilityBlockers({ preparation })[0];
      if (expected === "VALIDATION_BLOCKED") {
        assert.equal(blocker.repair.available, false);
        assert.equal(blocker.repair.operation, undefined);
        assert.equal(blocker.repair.eligibility, "NOT_AVAILABLE");
        assert.equal(blocker.repair.action, "REVIEW_SETUP_PREREQUISITES");
        assert.equal(blocker.repair.requiresConfirmation, false);
      } else assert.equal(blocker.repair.operation, "applicationInitialization.status");
      assert(!JSON.stringify(preparation).includes("private-owner-sentinel"));
    }
    assert.equal(calls, 5, "no HTTP failure permits automatic replay");
    await transport.closeTransport();
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete global[key]; else global[key] = value;
    }
  }
});
