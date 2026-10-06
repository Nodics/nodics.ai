/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";

/**
 * @module copilotCapability/test/copilotImportInspection
 * @description Verifies scoped nImport catalogue, history and preflight calls, bounded projection, original employee authority and post-read policy checks.
 * @layer test
 * @owner copilotCapability
 * @override Preserve provider exclusion and mutation-free validation when extending Import inspection.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const service = require("../src/service/defaultCopilotImportInspectionService");
const defaults = require("../config/properties");
const enums = require("../src/utils/enums");

/** Builds an admitted employee fixture with a recording native transport. @param {Object} t Test lifetime. @returns {Object} Fixture. */
function fixture(t) {
  const previous = {
    SERVICE: global.SERVICE,
    CLASSES: global.CLASSES,
    ENUMS: global.ENUMS,
  };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.ENUMS = {
    copilotImportIntent: {
      INSPECT: { value: enums.copilotImportIntent.definition.INSPECT },
    },
  };
  const configuration = structuredClone(defaults.copilot);
  Object.assign(configuration.capability.importInspection, {
    enabled: true,
    connectionName: "importRuntime",
    targetAuthority: { runtimeRole: "IMPORT" },
    scopes: [
      {
        tenant: "default",
        enterprise: "acme",
        environment: "local",
        initReleaseCodes: ["foundation:init-v001"],
        coreReleaseCodes: ["foundation:core-v001"],
        sampleReleaseCodes: ["project:sample-v001"],
        profileCodes: ["foundationSetup"],
        historyDataTypes: ["init", "core", "sample"],
      },
    ],
  });
  const request = {
    tenant: "default",
    authData: {
      loginId: "employee",
      enterpriseCode: "acme",
      permissions: [
        "copilot.data.query",
        "import.release.view",
        "import.release.validate",
        "import.history.view",
      ],
    },
    httpRequest: { headers: { authorization: "Bearer original-employee" } },
  };
  const f = { configuration, request, calls: [], response: null };
  const orchestration = {
    configuration: () => configuration,
    securityContext: (input) => ({
      actor: input.authData.loginId,
      tenant: input.tenant,
      enterprise: input.authData.enterpriseCode,
      environment: "local",
      channel: "EMPLOYEE",
      permissions: input.authData.permissions,
    }),
    employeeExecutionHeaders: () => ({
      Authorization: "Bearer original-employee",
      "x-enterprise-code": "acme",
    }),
  };
  global.SERVICE = {
    DefaultCopilotOrchestrationService: orchestration,
    DefaultCopilotPolicyService: {
      hasPermission: (context, permission) =>
        context.permissions.includes(permission),
    },
    DefaultModuleService: {
      invokeModule: async (input) => {
        f.calls.push(input);
        return f.response;
      },
    },
    DefaultCopilotProviderService: {
      invoke: () => assert.fail("Import evidence reached a provider"),
    },
  };
  return f;
}

/** Creates one native response for every fixed operation kind. @param {Object} operation Operation declaration. @param {string} code Selected code. @returns {Object} Native envelope. */
function responseFor(operation, code) {
  const release = {
    releaseCode: code,
    displayName: "Foundation data",
    moduleName: "foundation",
    dataType: operation.scope.replace("ReleaseCodes", ""),
    version: "1.0.0",
    status: "NOT_INSTALLED",
    nextAction: "Install release",
    sourcePath: "/private/source",
  };
  if (operation.kind === "CATALOGUE")
    return {
      code: "SUC_IMP_00000",
      data: [release, { ...release, releaseCode: "foreign:release" }],
    };
  if (operation.kind === "PROFILES")
    return {
      code: "SUC_IMP_00000",
      data: [
        {
          profileCode: code,
          label: "Foundation setup",
          description: "Install foundation releases.",
          status: "ACTION_REQUIRED",
          blocked: false,
          steps: [{ private: true }],
        },
        { profileCode: "foreignProfile", label: "Hidden" },
      ],
    };
  if (operation.kind === "HISTORY")
    return {
      code: "SUC_IMP_00000",
      data: [
        {
          runId: "run-one",
          status: "COMPLETED",
          dataType: "core",
          totalRecords: 5,
          requestedBy: "private",
        },
        { runId: "run-hidden", status: "COMPLETED", dataType: "local" },
      ],
    };
  if (operation.kind === "PREFLIGHT")
    return {
      code: "SUC_IMP_00000",
      data: {
        releases: [release],
        validation: {
          validationOnly: true,
          importExecuted: false,
          ready: true,
          skipped: false,
          reason: "Validated",
        },
        dryRun: {
          summary: {
            install: 1,
            update: 0,
            retry: 0,
            skip: 0,
            blocked: 0,
            wait: 0,
          },
          contributionPlans: [{ private: true }],
        },
      },
    };
  return {
    code: "SUC_IMP_00000",
    data: {
      profileCode: code,
      mode: "VALIDATE",
      results: [
        {
          dataType: "core",
          validation: {
            validationOnly: true,
            importExecuted: false,
            ready: true,
          },
          contributionPlans: [{ private: true }],
        },
      ],
      profile: {
        profileCode: code,
        label: "Foundation setup",
        description: "Install foundation releases.",
        status: "ACTION_REQUIRED",
        blocked: false,
        steps: [{ private: true }],
      },
    },
  };
}

test("nine fixed Import inspections preserve employee authority and never expose owner internals", async (t) => {
  const f = fixture(t);
  for (const operation of service.operations()) {
    const code =
      f.configuration.capability.importInspection.scopes[0][operation.scope][0];
    const command = {
      intent: "copilot.import.inspect",
      operation: operation.code,
      ...(operation.requiresCode === false ? {} : { code }),
    };
    f.response = responseFor(operation, code);
    const answer = await service.execute(command, f.request, f.configuration);
    assert.match(answer.content, /Import inspection/);
    assert.doesNotMatch(
      answer.content,
      /private|sourcePath|contributionPlans|requestedBy|foreign/,
    );
    const call = f.calls.at(-1);
    assert.equal(call.moduleName, "import");
    assert.equal(call.maxAttempts, 1);
    assert.equal(call.local, false);
    assert.equal(call.methodName, operation.method);
    assert.equal(
      call.apiName,
      operation.path +
        (operation.routeCode
          ? encodeURIComponent(code) + operation.suffix
          : ""),
    );
    assert.deepEqual(call.header, {
      Authorization: "Bearer original-employee",
      "x-enterprise-code": "acme",
    });
    if (operation.kind === "PREFLIGHT")
      assert.deepEqual(call.requestBody, { releaseCodes: [code] });
    else assert.equal(call.requestBody, undefined);
  }
  assert.equal(f.calls.length, 9);
});

test("catalogue exposes only configured choices with native grants", (t) => {
  const f = fixture(t);
  const catalogue = service.catalogue(
    global.SERVICE.DefaultCopilotOrchestrationService.securityContext(
      f.request,
    ),
    f.configuration,
  );
  assert.equal(catalogue.operations.length, 9);
  assert.deepEqual(
    catalogue.operations.find(
      (operation) => operation.code === "import.release.core.validate",
    ).codes,
    ["foundation:core-v001"],
  );
  f.request.authData.permissions = ["copilot.data.query"];
  assert.equal(
    service.catalogue(
      global.SERVICE.DefaultCopilotOrchestrationService.securityContext(
        f.request,
      ),
      f.configuration,
    ).operations.length,
    0,
  );
});

test("invalid commands, foreign selections and policy drift fail before evidence is accepted", async (t) => {
  const f = fixture(t);
  assert.throws(
    () =>
      service.parse(
        JSON.stringify({
          intent: "copilot.import.inspect",
          operation: "import.release.core.validate",
          code: "../private",
        }),
      ),
    /ERR_CPT_00005/,
  );
  assert.throws(
    () =>
      service.authorize(
        {
          intent: "copilot.import.inspect",
          operation: "import.release.core.validate",
          code: "foreign:release",
        },
        f.request,
        f.configuration,
      ),
    /ERR_CPT_00006/,
  );
  f.response = responseFor(service.operations()[0], "foundation:init-v001");
  global.SERVICE.DefaultModuleService.invokeModule = async (input) => {
    f.calls.push(input);
    f.configuration.capability.importInspection.enabled = false;
    return f.response;
  };
  await assert.rejects(
    service.execute(
      {
        intent: "copilot.import.inspect",
        operation: "import.release.init.catalogue",
      },
      f.request,
      f.configuration,
    ),
    /ERR_CPT_00006|ERR_CPT_00008/,
  );
});

test("malformed validation evidence cannot claim a mutation-free result", async (t) => {
  const f = fixture(t);
  f.response = responseFor(
    service
      .operations()
      .find((operation) => operation.code === "import.release.core.validate"),
    "foundation:core-v001",
  );
  f.response.data.validation.importExecuted = true;
  await assert.rejects(
    service.execute(
      {
        intent: "copilot.import.inspect",
        operation: "import.release.core.validate",
        code: "foundation:core-v001",
      },
      f.request,
      f.configuration,
    ),
    /ERR_CPT_00007/,
  );
});
