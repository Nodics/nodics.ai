/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Enterprise journey tests use isolated action storage and Profile envelopes, never live business writes. */
"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const enterprise = require("../src/service/defaultCopilotEnterpriseActionService");
const execution = require("../src/service/defaultCopilotActionExecutionService");
const core = require("../../copilotCore/src/service/defaultCopilotOrchestrationService");
const policy = require("../../copilotPolicy/src/service/defaultCopilotPolicyService");
let configuration, request, action, commands;
beforeEach(() => {
  configuration = {
    api: { enabled: true },
    core: {},
    conversation: {},
    workbench: {
      enterpriseTarget: {
        enabled: true,
        moduleName: "profile",
        connectionName: "profile-owner",
      },
    },
  };
  request = {
    tenant: "tenant",
    authData: {
      loginId: "operator",
      enterpriseCode: "platform",
      permissions: [
        "copilot.mutation.prepare",
        "copilot.mutation.execute",
        "profile.enterprise.create",
        "profile.enterpriseAccess.assign",
      ],
    },
    httpRequest: { headers: { authorization: "Bearer employee-only" } },
    body: {
      operation: "profile.enterprise.onboard",
      enterprise: {
        code: "ACME",
        name: "Synthetic enterprise",
        adminEmail: "admin@example.invalid",
      },
      employees: [
        { email: "one@example.invalid", roleCode: "OPERATOR" },
        { email: "two@example.invalid", roleCode: "VIEWER" },
      ],
    },
  };
  commands = [];
  action = undefined;
  global.CONFIG = { get: () => configuration };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultCopilotPolicyService: policy,
    DefaultCopilotOrchestrationService: core,
    DefaultCopilotEnterpriseActionService: enterprise,
    DefaultCopilotActionExecutionService: execution,
    DefaultCopilotWorkbenchService: require("../src/service/defaultCopilotWorkbenchService"),
    DefaultCopilotActionService: {
      save: async (r) => {
        action = structuredClone(r.model);
        return { code: "SUC_TEST", result: r.model };
      },
      get: async () => ({
        code: "SUC_TEST",
        result: action ? [structuredClone(action)] : [],
      }),
      update: async (r) => {
        const matches =
          action.state === r.query.state &&
          action.audit.revision === r.query["audit.revision"];
        if (matches) Object.assign(action, structuredClone(r.model));
        return {
          code: "SUC_TEST",
          result: { matchedCount: matches ? 1 : 0 },
        };
      },
    },
    DefaultModuleService: {
      invokeModule: async (r) => {
        commands.push(r);
        assert.equal(r.header.Authorization, "Bearer employee-only");
        assert.equal(r.header["x-enterprise-code"], "platform");
        assert.equal(r.local, false);
        assert.equal(r.maxAttempts, 1);
        if (r.apiName === "/enterprises")
          return {
            code: "SUC_PROFILE",
            data: { code: "ACME", name: "Synthetic enterprise" },
          };
        assert.equal(r.apiName, "/enterprises/ACME/access-assignments");
        return {
          code: "SUC_PROFILE",
          data: {
            code: "owner-assignment",
            enterpriseCode: "ACME",
            email: r.request.email,
            roleCode: r.request.roleCode,
            status: "PENDING",
          },
        };
      },
    },
  };
});

/** Uses the existing approval contract rather than manufacturing confirmed authority. */
async function approve() {
  const prepared = await core.prepareEnterprisePlan(request);
  request.confirmationCode = prepared.actionCode;
  request.expectedRevision = prepared.confirmation.revision;
  request.argumentsDigest = prepared.confirmation.argumentsDigest;
  const approved = await core.approveConfirmation(request);
  request.expectedRevision = approved.confirmation.revision;
  return prepared;
}

test("explicit preview and approval create no business records; execution uses Profile and reports invitations, not accounts", async () => {
  const prepared = await approve();
  assert.equal(commands.length, 0);
  assert.equal(
    prepared.preview.employeeActivation,
    "INVITEE_REGISTRATION_REQUIRED",
  );
  const result = await core.executeConfirmation(request);
  assert.equal(result.state, "CONSUMED");
  assert.equal(result.result.operationsCompleted, 3);
  assert.equal(result.result.productsCreated, undefined);
  assert.deepEqual(
    result.rows.map((row) => row.state),
    ["COMPLETED", "COMPLETED", "COMPLETED"],
  );
  assert.equal(commands[0].request.model.adminEmail, "admin@example.invalid");
  assert.equal(commands[1].request.roleCode, "OPERATOR");
  await assert.rejects(core.executeConfirmation(request));
  assert.equal(commands.length, 3);
});

test("lost invitation acknowledgement stops later writes and cannot be replayed", async () => {
  await approve();
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async (r) => {
    const result = await invoke(r);
    if (commands.length === 2) throw new Error("response lost");
    return result;
  };
  const result = await core.executeConfirmation(request);
  assert.equal(result.state, "OUTCOME_UNKNOWN");
  assert.deepEqual(
    result.rows.map((row) => row.state),
    ["COMPLETED", "OUTCOME_UNKNOWN", "NOT_STARTED"],
  );
  await assert.rejects(core.executeConfirmation(request));
  assert.equal(commands.length, 2);
});

test("empty native invitation identity cannot acknowledge a completed row", async () => {
  await approve();
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async (r) => {
    const result = await invoke(r);
    if (r.apiName.endsWith("/access-assignments")) result.data.code = "";
    return result;
  };
  const result = await core.executeConfirmation(request);
  assert.equal(result.state, "OUTCOME_UNKNOWN");
  assert.equal(commands.length, 2);
  assert.deepEqual(
    result.rows.map((row) => row.state),
    ["COMPLETED", "OUTCOME_UNKNOWN", "NOT_STARTED"],
  );
});

test("contradictory Profile acknowledgements stop execution rather than becoming normalized success", async () => {
  await approve();
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async (r) => ({
    ...(await invoke(r)),
    errors: ["partial failure"],
  });
  const result = await core.executeConfirmation(request);
  assert.equal(result.state, "OUTCOME_UNKNOWN");
  assert.equal(commands.length, 1);
  assert.deepEqual(
    result.rows.map((row) => row.state),
    ["OUTCOME_UNKNOWN", "NOT_STARTED", "NOT_STARTED"],
  );
  await assert.rejects(core.executeConfirmation(request));
  assert.equal(commands.length, 1);
});

for (const location of ["envelope", "data"])
  test(`negative ${location} acknowledgement cannot confirm enterprise creation`, async () => {
    await approve();
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    SERVICE.DefaultModuleService.invokeModule = async (r) => {
      const result = await invoke(r);
      return location === "data"
        ? { ...result, data: { ...result.data, acknowledged: false } }
        : { ...result, acknowledged: false };
    };
    const result = await core.executeConfirmation(request);
    assert.equal(result.state, "OUTCOME_UNKNOWN");
    assert.equal(commands.length, 1);
  });

test("missing values clarify; duplicate email, injected authority, missing grants and lost save acknowledgement cannot prepare", async () => {
  const missing = await enterprise.prepare(
    { ...request, body: { operation: request.body.operation } },
    configuration,
  );
  assert.ok(missing.plan.missing.includes("enterprise.adminEmail"));
  assert.equal(action, undefined);
  await assert.rejects(
    enterprise.prepare(
      { ...request, body: { ...request.body, tenant: "other" } },
      configuration,
    ),
  );
  const duplicate = structuredClone(request.body);
  duplicate.employees[0].email = duplicate.enterprise.adminEmail;
  assert.throws(() => enterprise.input(duplicate));
  request.authData.permissions = ["copilot.mutation.prepare"];
  await assert.rejects(core.prepareEnterprisePlan(request));
  request.authData.permissions = ["*"];
  SERVICE.DefaultCopilotActionService.save = async () => ({
    code: "SUC_TEST",
  });
  await assert.rejects(core.prepareEnterprisePlan(request));
  assert.equal(commands.length, 0);
});

test("changed target, stale revision, role tampering and missing bearer fail before any domain call", async () => {
  await approve();
  configuration.workbench.enterpriseTarget.connectionName = "other";
  await assert.rejects(core.executeConfirmation(request));
  configuration.workbench.enterpriseTarget.connectionName = "profile-owner";
  request.expectedRevision--;
  await assert.rejects(core.executeConfirmation(request));
  request.expectedRevision++;
  action.audit.plan.relatedRecords.invitations.records[0].roleCode =
    "ENTERPRISE_ADMIN";
  await assert.rejects(core.executeConfirmation(request));
  action.audit.plan.relatedRecords.invitations.records[0].roleCode = "OPERATOR";
  request.httpRequest.headers = {};
  await assert.rejects(core.executeConfirmation(request));
  assert.equal(commands.length, 0);
});

test("explicit JSON chat intent produces the existing confirmation event without a model or domain call", async () => {
  request.message = JSON.stringify(request.body);
  assert.equal(enterprise.parseIntent("Please describe an enterprise"), null);
  assert.equal(enterprise.parseIntent("{invalid"), null);
  const events = [];
  SERVICE.DefaultCopilotConversationService = {
    getOwned: async () => ({ code: "conversation" }),
    acceptTurn: async () => ({ code: "turn", state: "ACCEPTED" }),
    appendEvent: async (_t, kind, value) => events.push({ kind, value }),
    complete: async () => {},
    fail: async () => assert.fail("Unexpected turn failure"),
  };
  const result = await core.performTurn(request);
  assert.equal(events[0].kind, "CONFIRMATION_REQUIRED");
  assert.equal(result.confirmation.operationId, "profile.enterprise.onboard");
  assert.equal(commands.length, 0);
});
