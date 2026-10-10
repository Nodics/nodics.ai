/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/applicationPreparationOrder
 * @description Protects declared dependency order and complete preflight before preparation writes.
 * @layer test
 * @owner backoffice
 */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const service = require("../src/service/defaultBackofficeApplicationInitializationService");
test("layered prerequisites precede existing packages without copying or replacing the application plan", () => {
  const original = [
    {
      code: "site:content",
      dataType: "sample",
      targetServer: "wcmsStaged",
      targetRuntimeRole: "WCMS_STAGED",
    },
  ];
  const prerequisite = {
    code: "media:mediaPublicationWorkflow",
    dataType: "init",
    targetServer: "process",
    targetRuntimeRole: "PROCESS",
  };
  const profile = {
    dataPackages: original,
    preparation: { prerequisites: [prerequisite] },
  };
  assert.deepEqual(
    service.preparationSteps(profile).map((step) => step.code),
    [prerequisite.code, original[0].code],
  );
  assert.equal(original.length, 1);
  assert.equal(prerequisite.order, undefined);
  assert.equal(original[0].order, undefined);
});
test("disabled prerequisites never become selected preparation steps", () => {
  const profile = {
    preparation: {
      prerequisites: [{ enabled: false }],
      steps: [
        {
          code: "site:content",
          dataType: "sample",
          targetServer: "wcmsStaged",
          targetRuntimeRole: "WCMS_STAGED",
        },
      ],
    },
  };
  assert.deepEqual(
    service.preparationSteps(profile).map((step) => step.code),
    ["site:content"],
  );
});
test("malformed or oversized prerequisite lists fail before an owner invocation", () => {
  const previous = global.CLASSES;
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
  };
  try {
    for (const prerequisites of [{}, "media", new Array(257).fill({})])
      assert.throws(
        () => service.preparationSteps({ preparation: { prerequisites } }),
        /bounded step list/,
      );
  } finally {
    if (previous === undefined) delete global.CLASSES;
    else global.CLASSES = previous;
  }
});
const step = (code, server, order, dataType = "core") => ({
  code,
  order,
  type: "DATA_RELEASE",
  required: true,
  targetServer: server,
  targetRuntimeRole: server === "waste" ? "WASTE" : "PLATFORM",
  dataType,
});
test("keeps Waste foundation and policy before Profile despite reverse server/type lexical order", () => {
  const steps = [
    step("profile:employees", "platform", 30),
    step("waste:policy", "waste", 20, "sample"),
    step("waste:reference", "waste", 10),
  ];
  const groups = service.preparationGroups(
    { code: "circa" },
    { requestId: "request-1" },
    steps,
  );
  assert.deepEqual(
    groups.flatMap((group) => group.steps.map((item) => item.code)),
    ["waste:reference", "waste:policy", "profile:employees"],
  );
  assert.deepEqual(
    steps.map((item) => item.code),
    ["profile:employees", "waste:policy", "waste:reference"],
  );
});
test("does not collapse a repeated runtime around another owner and preserves stable distinct operation keys", () => {
  const steps = [
    step("profile:foundation", "platform", 1),
    step("waste:policy", "waste", 2),
    step("profile:employees", "platform", 3),
    step("profile:contacts", "platform", 4),
  ];
  const groups = service.preparationGroups(
    { code: "circa" },
    { requestId: "request-1" },
    steps,
  );
  assert.deepEqual(
    groups.map((group) => group.steps.map((item) => item.code)),
    [
      ["profile:foundation"],
      ["waste:policy"],
      ["profile:employees", "profile:contacts"],
    ],
  );
  assert.equal(new Set(groups.map((group) => group.idempotencyKey)).size, 3);
  assert.deepEqual(
    service.preparationGroups(
      { code: "circa" },
      { requestId: "request-1" },
      steps,
    ),
    groups,
  );
});
test("all configured release groups are preflighted before a blocked group can allow any write", async () => {
  const owner = Object.create(service);
  const steps = [
    step("waste:reference", "waste", 1),
    step("profile:employees", "platform", 2),
  ];
  const calls = [];
  owner.profile = () => ({ code: "circa" });
  owner.human = () => "operator";
  owner.preparationSteps = () => steps;
  owner.functionalModulePreparationStatus = async () => [];
  owner.invokeDataReleaseOperation = async (mode, group) => {
    calls.push([mode, group.steps[0].code]);
    return {
      releases: group.steps.map((item) => ({
        releaseCode: item.code,
        status:
          item.targetServer === "platform"
            ? "INVALID_RELEASE"
            : "NOT_INSTALLED",
      })),
    };
  };
  owner.prepareMediaAssets = async () => {
    throw new Error("Must not write Media");
  };
  owner.prepareApplication = async () => {
    throw new Error("Must not execute preparation");
  };
  owner.blockedProjection = (_profile, preparation) => ({
    readiness: "BLOCKED",
    preparation,
    allowedActions: [],
  });
  const result = await owner.prepareCapability("circa", {});
  assert.deepEqual(calls, [
    ["preflight", "waste:reference"],
    ["preflight", "profile:employees"],
  ]);
  assert.equal(result.readiness, "BLOCKED");
  assert.deepEqual(result.allowedActions, []);
  assert.equal(result.preparationOperation.attempted, false);
});
test("successful preparation writes only after every group preflight and then executes in declared order", async () => {
  const owner = Object.create(service);
  const steps = [
    step("waste:reference", "waste", 1),
    step("profile:employees", "platform", 2),
  ];
  const calls = [];
  const installed = new Set();
  owner.profile = () => ({ code: "circa" });
  owner.human = () => "operator";
  owner.preparationSteps = () => steps;
  owner.functionalModulePreparationStatus = async () => [];
  owner.prepareMediaAssets = async () => {
    calls.push(["media", "assets"]);
  };
  owner.invokeDataReleaseOperation = async (mode, group) => {
    calls.push([mode, group.steps[0].code]);
    if (mode === "execute")
      group.steps.forEach((item) => installed.add(item.code));
    return {
      releases: group.steps.map((item) => ({
        releaseCode: item.code,
        status: installed.has(item.code) ? "CURRENT" : "NOT_INSTALLED",
        version: "1.0.0",
      })),
    };
  };
  owner.status = async () => ({
    readiness: "NOT_IMPORTED",
    preparation: await owner.preparationStatus({ code: "circa" }, {}),
  });
  const result = await owner.prepareCapability("circa", {});
  assert.deepEqual(calls.slice(0, 5), [
    ["preflight", "waste:reference"],
    ["preflight", "profile:employees"],
    ["media", "assets"],
    ["execute", "waste:reference"],
    ["execute", "profile:employees"],
  ]);
  assert.equal(result.preparation.status, "CURRENT");
  assert.deepEqual(
    result.preparation.groupReceipts.map((item) => item.status),
    ["COMPLETE", "COMPLETE"],
  );
});

test("fresh human preparation preflights and installs once despite enabled shared observation reporting no installations", async () => {
  const owner = Object.create(service);
  const profile = { code: "circa" };
  const steps = [step("profile:employees", "platform", 1), step("waste:policy", "waste", 2, "sample"),
    step("profile:staff", "platform", 100, "sample")].map(item => ({ ...item, phase: "BEFORE_PUBLICATION" }));
  const request = { tenant: "default", authData: { principalId: "administrator", tokenType: "access" },
    httpRequest: { headers: { authorization: "Bearer original-human" } } };
  const original = JSON.stringify(request), installed = new Set(), calls = [];
  owner.profile = () => profile;
  owner.preparationSteps = () => steps;
  owner.hasSetupObservation = () => true;
  owner.functionalModulePreparationStatus = async () => [];
  owner.setupObservation = async (_profile, actualRequest, selected, mode) => {
    assert.equal(actualRequest, request);
    assert.equal(mode, "INSTALLATION");
    calls.push(["observe", selected.code]);
    return { ready: installed.has(selected.code), version: "0.0.1" };
  };
  owner.invokeDataReleaseOperation = async (mode, group, actualRequest) => {
    assert.equal(actualRequest, request);
    assert.equal(owner.authorizationHeader(actualRequest, true), "Bearer original-human");
    calls.push([mode, group.steps[0].code]);
    if (mode === "execute") {
      if (group.steps.some(item => item.code === "profile:staff")) assert(installed.has("profile:employees"));
      group.steps.forEach(item => installed.add(item.code));
    }
    return { releases: group.steps.map(item => ({ releaseCode: item.code,
      status: installed.has(item.code) ? "CURRENT" : "NOT_INSTALLED", version: "0.0.1" })) };
  };
  owner.prepareMediaAssets = async () => calls.push(["media", "assets"]);
  owner.status = async () => ({ readiness: "NOT_IMPORTED", preparation: await owner.preparationStatus(profile, request) });
  const freshGet = await owner.preparationStatus(profile, request);
  assert.equal(freshGet.status, "BLOCKED");
  assert(freshGet.steps.every(item => item.status === "VALIDATION_BLOCKED"));
  calls.length = 0;
  const result = await owner.prepareCapability(profile.code, request);
  assert.deepEqual(calls.slice(0, 7), [
    ["preflight", "profile:employees"], ["preflight", "waste:policy"], ["preflight", "profile:staff"],
    ["media", "assets"], ["execute", "profile:employees"], ["execute", "waste:policy"], ["execute", "profile:staff"],
  ]);
  assert.equal(calls.filter(([mode]) => mode === "execute").length, 3);
  assert.equal(result.preparation.status, "CURRENT");
  assert.equal(result.preparationOperation.attempted, true);
  assert(result.preparation.groupReceipts.every(receipt => receipt.status === "COMPLETE"));
  assert(calls.slice(7).every(([mode]) => mode === "observe"), "post-write status remains shared read-only observation");
  assert.equal(JSON.stringify(request), original);
});

test("shared CURRENT proof cannot authorize human preparation rejected by the ordinary owner preflight", async () => {
  const owner = Object.create(service), profile = { code: "circa" };
  const selected = step("profile:staff", "platform", 100, "sample"), calls = [];
  owner.profile = () => profile;
  owner.preparationSteps = () => [selected];
  owner.hasSetupObservation = () => true;
  owner.functionalModulePreparationStatus = async () => [];
  owner.setupObservation = async () => { calls.push("observe"); return { ready: true }; };
  owner.invokeDataReleaseOperation = async mode => {
    calls.push(mode);
    assert.equal(mode, "preflight");
    throw Object.assign(new Error("Denied"), { code: "ERR_AUTH_00003" });
  };
  owner.prepareMediaAssets = async () => assert.fail("No Media writes after owner refusal");
  owner.runtimeInvocationDiagnostic = () => undefined;
  owner.blockedProjection = (_profile, preparation) => ({ readiness: "BLOCKED", preparation });
  const result = await owner.prepareCapability(profile.code, { tenant: "default",
    authData: { principalId: "administrator", tokenType: "access" } });
  assert.deepEqual(calls, ["preflight"]);
  assert.equal(result.readiness, "BLOCKED");
  assert.equal(result.preparationOperation.attempted, false);
});
