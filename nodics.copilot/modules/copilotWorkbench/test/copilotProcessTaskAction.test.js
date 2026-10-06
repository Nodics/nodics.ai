/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module copilotWorkbench/test/copilotProcessTaskAction @description Exercises real Core, approval, executor, recovery and native task receipt protocol with isolated persistence/transport. Not live runtime acceptance. @layer test @owner copilotWorkbench */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { isDeepStrictEqual } = require("node:util");
const core = require("../../copilotCore/src/service/defaultCopilotOrchestrationService");
const adapter = require("../src/service/defaultCopilotProcessTaskActionService");
const protocol = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelCommandReceiptService");
const native = require("../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessTaskCommandReceiptService");

/** Builds a composed test boundary with original native receipt persistence. @param {Object} t Test context. @param {string} kind Native suffix. @returns {Object} Fixture. */
function fixture(t, kind = "claim") {
  const globals = {
    SERVICE: global.SERVICE,
    CONFIG: global.CONFIG,
    NODICS: global.NODICS,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, globals));
  const state = {
    action: null,
    receipt: null,
    dispatches: 0,
    calls: [],
    lose: false,
    malformed: false,
    nativeFailure: false,
    nativeEnabled: true,
  };
  const configuration = {
    api: { enabled: true },
    core: {},
    conversation: {},
    workbench: {
      processTaskTarget: {
        enabled: true,
        moduleName: "workflow",
        connectionName: "processOwner",
        targetAuthority: { runtimeRole: "PROCESS" },
      },
      receiptRecovery: {
        enabled: true,
        label: "Inspect original result",
        continuation: "Review remaining work",
      },
    },
  };
  const commands = {
    claim: {},
    assign: { assignee: "reviewer" },
    complete: { decision: { approved: true, reason: "Checked evidence" } },
    cancel: { reason: "Duplicate task" },
  };
  const request = {
    tenant: "tenant",
    authData: {
      tenant: "tenant",
      enterpriseCode: "enterprise",
      loginId: "employee",
      principalType: "human",
      tokenType: "access",
      permissions: [
        "copilot.mutation.prepare",
        "copilot.mutation.execute",
        "copilot.mutation.reconcile",
        "process.backoffice.view",
        "process.task." + kind,
      ],
    },
    httpRequest: { headers: { authorization: "Bearer employee" } },
    body: {
      operation: "process.task." + kind,
      taskCode: "task-one",
      ...commands[kind],
    },
  };
  const envelope = (result) => ({
    code: "SUC_DB",
    result: structuredClone(result),
  });
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.CONFIG = {
    get: (key) =>
      key === "commandReceipts"
        ? { enabled: state.nativeEnabled, owners: { workflow: true } }
        : configuration,
  };
  global.NODICS = {
    getModule: (name) =>
      name === "workflow"
        ? {
            rawSchema: {
              processCommandReceipt: {
                commandReceiptJournal: true,
                model: true,
                cache: { enabled: false },
                router: { enabled: false },
                event: { enabled: false },
                service: { enabled: true },
                backoffice: { enabled: false },
              },
            },
          }
        : null,
  };
  const lifecycle = {
    bodyOf: (r) => r.runtimeOperation || {},
    assertCode: (code) => code,
    getActor: (r) => r.authData.loginId,
  };
  for (const operation of ["claim", "assign", "complete", "cancel"])
    lifecycle[operation + "Task"] = async (r) => {
      state.dispatches++;
      if (state.nativeFailure)
        throw new Error("owner denied or advancement failed");
      const body = r.runtimeOperation;
      const task = {
        code: state.malformed ? "foreign" : r.taskCode,
        status: {
          claim: "CLAIMED",
          assign: "OPEN",
          complete: "COMPLETED",
          cancel: "CANCELLED",
        }[operation],
        ...(operation === "claim" ? { assignee: "employee" } : {}),
        ...(operation === "assign" ? { assignee: body.assignee } : {}),
        ...(operation === "complete"
          ? { decision: body.decision, completedBy: "employee" }
          : {}),
        ...(operation === "cancel"
          ? { cancellationReason: body.reason, cancelledBy: "employee" }
          : {}),
      };
      return {
        code: "SUC_PROCESS_00008",
        data:
          operation === "complete"
            ? { task, instance: { status: "COMPLETED" } }
            : task,
      };
    };
  global.SERVICE = {
    DefaultCopilotOrchestrationService: core,
    DefaultCopilotProcessTaskActionService: adapter,
    DefaultCopilotPolicyService: require("../../copilotPolicy/src/service/defaultCopilotPolicyService"),
    DefaultCopilotWorkbenchService: require("../src/service/defaultCopilotWorkbenchService"),
    DefaultCopilotActionExecutionService: require("../src/service/defaultCopilotActionExecutionService"),
    DefaultCopilotActionRecoveryService: require("../src/service/defaultCopilotActionRecoveryService"),
    DefaultModelCommandReceiptService: protocol,
    DefaultProcessRuntimeLifecycleService: lifecycle,
    DefaultSchemaUtilityService: { getIdempotencyKey: (r) => r.idempotencyKey },
    DefaultLoggerService: { inheritRequestPrivacy: () => {} },
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: (r) => r.authData.permissions,
      getRouteActionAuthorizationConfig: () => ({}),
      isPermissionGranted: (permission, grants) => grants.includes(permission),
    },
    DefaultCopilotActionService: {
      save: async (r) => {
        state.action = structuredClone(r.model);
        return envelope(r.model);
      },
      get: async () => envelope(state.action ? [state.action] : []),
      update: async (r) => {
        const matches = Object.entries(r.query).every(
          ([key, value]) =>
            (key === "audit.revision"
              ? state.action.audit.revision
              : state.action[key]) === value,
        );
        if (matches) Object.assign(state.action, structuredClone(r.model));
        return envelope({ matchedCount: matches ? 1 : 0 });
      },
    },
    DefaultProcessCommandReceiptService: {
      get: async (r) =>
        envelope(
          state.receipt &&
            Object.entries(r.query).every(([key, value]) =>
              isDeepStrictEqual(state.receipt[key], value),
            )
            ? [state.receipt]
            : [],
        ),
      save: async (r) => {
        assert.equal(r.options.insertOnly, true);
        assert.equal(r.internalPersistence, "DURABLE_JOURNAL");
        if (state.receipt) throw new Error("duplicate");
        state.receipt = structuredClone(r.model);
        return envelope(state.receipt);
      },
      update: async (r) => {
        const matches =
          state.receipt &&
          Object.entries(r.query).every(([key, value]) =>
            isDeepStrictEqual(state.receipt[key], value),
          );
        if (matches) Object.assign(state.receipt, structuredClone(r.model));
        return envelope({ matchedCount: matches ? 1 : 0 });
      },
    },
    DefaultModuleService: {
      invokeModule: async (r) => {
        state.calls.push(r);
        assert.equal(r.local, false);
        assert.equal(r.maxAttempts, 1);
        assert.equal(r.moduleName, "workflow");
        assert.equal(r.header.Authorization, "Bearer employee");
        assert.equal(r.header["x-enterprise-code"], "enterprise");
        if (r.apiName.endsWith("/receipt/query"))
          return native.inspect({
            ...request,
            taskCode: "task-one",
            command: kind,
            httpRequest: undefined,
            runtimeOperation: r.request,
          });
        assert.equal(r.apiName, "/tasks/task-one/" + kind);
        const response = await native.execute(
          {
            ...request,
            taskCode: "task-one",
            runtimeOperation: r.requestBody,
            idempotencyKey: r.idempotencyKey,
          },
          kind,
        );
        if (state.lose) throw new Error("lost response");
        return response;
      },
    },
  };
  return { state, configuration, request };
}

/** Approves via real Core with exact current revision/digest. @param {Object} f Fixture. @returns {Promise<Object>} Prepared plan projection. */
async function approve(f) {
  const prepared = await core.prepareProcessTaskPlan(f.request);
  Object.assign(f.request, {
    confirmationCode: prepared.actionCode,
    expectedRevision: prepared.confirmation.revision,
    argumentsDigest: prepared.confirmation.argumentsDigest,
  });
  const approved = await core.approveConfirmation(f.request);
  f.request.expectedRevision = approved.confirmation.revision;
  return prepared;
}

for (const kind of ["claim", "assign", "complete", "cancel"]) {
  test(
    kind + ": full review and single native dispatch with original receipt",
    async (t) => {
      const f = fixture(t, kind);
      const prepared = await approve(f);
      assert.equal(f.state.dispatches, 0);
      assert.match(JSON.stringify(prepared.preview.review), /task-one/);
      for (const value of Object.values(f.request.body.decision || {}))
        assert.match(
          JSON.stringify(prepared.preview.review),
          new RegExp(String(value)),
        );
      assert.equal(
        (await core.executeConfirmation(f.request)).state,
        "CONSUMED",
      );
      assert.equal(f.state.receipt.state, "COMPLETED");
      await assert.rejects(core.executeConfirmation(f.request));
      assert.equal(f.state.dispatches, 1);
    },
  );
  test(
    kind +
      ": lost reply reconciles original receipt after disabling new writes, without replay",
    async (t) => {
      const f = fixture(t, kind);
      await approve(f);
      f.state.lose = true;
      assert.equal(
        (await core.executeConfirmation(f.request)).state,
        "OUTCOME_UNKNOWN",
      );
      f.configuration.workbench.processTaskTarget.enabled = false;
      f.state.nativeEnabled = false;
      f.request.expectedRevision = f.state.action.audit.revision;
      assert.equal(
        (await core.getConfirmation(f.request)).confirmation.recovery.label,
        "Inspect original result",
      );
      assert.equal(
        (await core.reconcileConfirmation(f.request)).confirmation.state,
        "CONSUMED",
      );
      assert.equal(f.state.dispatches, 1);
      await assert.rejects(core.executeConfirmation(f.request));
    },
  );
  test(
    kind +
      ": native failure or mismatched acknowledgement never proves completion",
    async (t) => {
      const f = fixture(t, kind);
      await approve(f);
      f.state.malformed = true;
      assert.equal(
        (await core.executeConfirmation(f.request)).state,
        "OUTCOME_UNKNOWN",
      );
      assert.equal(f.state.receipt.state, "STARTED");
      f.request.expectedRevision = f.state.action.audit.revision;
      assert.equal(
        (await core.reconcileConfirmation(f.request)).confirmation.state,
        "OUTCOME_UNKNOWN",
      );
      await assert.rejects(core.executeConfirmation(f.request));
      assert.equal(f.state.dispatches, 1);
    },
  );
}
test("changed actor, enterprise, target, grant, revision and input cannot dispatch", async (t) => {
  const f = fixture(t);
  await approve(f);
  for (const [object, key, value] of [
    [f.request.authData, "loginId", "other"],
    [f.request.authData, "enterpriseCode", "foreign"],
    [f.configuration.workbench.processTaskTarget, "connectionName", "other"],
    [f.request.authData, "permissions", []],
    [f.request, "expectedRevision", -1],
    [f.state.action.audit.plan.records[0], "code", "other"],
  ]) {
    const original = object[key];
    object[key] = value;
    await assert.rejects(core.executeConfirmation(f.request));
    object[key] = original;
  }
  assert.equal(f.state.calls.length, 0);
});
test("disabled native receipts prevent any task mutation and cannot be bypassed by payload flags", async (t) => {
  const f = fixture(t);
  await approve(f);
  f.state.nativeEnabled = false;
  assert.equal(
    (await core.executeConfirmation(f.request)).state,
    "OUTCOME_UNKNOWN",
  );
  assert.equal(f.state.dispatches, 0);
  f.configuration.workbench.processTaskTarget.enabled = false;
  f.request.inspection = true;
  await assert.rejects(core.prepareProcessTaskPlan(f.request));
});
test("bounded language and typed inputs clarify rather than invent decisions", (t) => {
  fixture(t);
  assert.deepEqual(adapter.parseIntent("claim task task-one"), {
    operation: "process.task.claim",
    taskCode: "task-one",
  });
  assert.deepEqual(
    adapter.input(adapter.parseIntent("complete task task-one")).missing,
    ["decision"],
  );
  assert.deepEqual(
    adapter.input(adapter.parseIntent("assign task task-one to reviewer")).body,
    { assignee: "reviewer" },
  );
  for (const body of [
    { operation: "process.task.start", taskCode: "task-one" },
    { operation: "process.task.claim", taskCode: "../foreign" },
    {
      operation: "process.task.claim",
      taskCode: "task-one",
      targetAuthority: {},
    },
    {
      operation: "process.task.complete",
      taskCode: "task-one",
      decision: { approved: "true" },
    },
    {
      operation: "process.task.complete",
      taskCode: "task-one",
      decision: { emergencyOverride: true },
    },
  ])
    assert.throws(() => adapter.input(body));
});
test("conversation remains outside provider context and never invokes a model or task before approval", async (t) => {
  const f = fixture(t),
    events = [];
  SERVICE.DefaultCopilotConversationService = {
    getOwned: async () => ({ code: "conversation" }),
    acceptTurn: async (_c, r) => {
      assert.equal(r.providerContextEligible, false);
      return { code: "turn", state: "ACCEPTED" };
    },
    appendEvent: async (_t, type) => events.push(type),
    complete: async () => {},
    fail: async () => assert.fail("unexpected turn failure"),
  };
  f.request.message = "claim task task-one";
  const result = await core.performTurn(f.request);
  assert.equal(result.confirmation.operationId, "process.task.claim");
  assert.deepEqual(events, ["CONFIRMATION_REQUIRED"]);
  assert.equal(f.state.dispatches, 0);
});

test("native receipt keys cannot silently fall back to unjournaled execution", async (t) => {
  const f = fixture(t);
  for (const key of ["", null, 12, "x".repeat(513), "invalid\nkey"]) {
    await assert.rejects(
      native.execute(
        {
          ...f.request,
          taskCode: "task-one",
          runtimeOperation: {},
          idempotencyKey: key,
        },
        "claim",
      ),
    );
    assert.equal(f.state.dispatches, 0);
  }
  const key = "key-" + "x".repeat(190);
  const request = {
    ...f.request,
    taskCode: "task-one",
    runtimeOperation: {},
    idempotencyKey: key,
  };
  await native.execute(request, "claim");
  await assert.rejects(native.execute(request, "claim"));
  assert.equal(f.state.dispatches, 1);
});

test("native disabled recording preserves only genuinely unkeyed calls", async (t) => {
  const f = fixture(t);
  f.state.nativeEnabled = false;
  await native.execute(
    { ...f.request, taskCode: "task-one", runtimeOperation: {} },
    "claim",
  );
  assert.equal(f.state.dispatches, 1);
  assert.equal(f.state.receipt, null);
});

test("task intent planning cannot invent decisions, identifiers or another operation", (t) => {
  const f = fixture(t);
  const planner = require("../../copilotCore/src/service/defaultCopilotIntentPlanningService");
  assert.deepEqual(planner.allowed(f.request, f.configuration), [
    "process.task.claim",
  ]);
  const command = {
    operation: "process.task.complete",
    taskCode: "task-one",
    decision: { approved: true, reason: "checked" },
  };
  planner.assertEvidence(
    command,
    "Please complete task task-one with approved true and reason checked",
  );
  for (const message of [
    "claim task task-one with approved true reason checked",
    "complete task task-one reason checked",
    "complete task task-one-more approved true reason checked",
    "complete task task-one approved false reason checked",
  ])
    assert.throws(() => planner.assertEvidence(command, message));
  f.configuration.workbench.processTaskTarget.targetAuthority.runtimeRole = "";
  assert.deepEqual(planner.allowed(f.request, f.configuration), []);
});
