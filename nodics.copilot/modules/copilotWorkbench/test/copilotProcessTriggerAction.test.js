/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module copilotWorkbench/test/copilotProcessTriggerAction @description Composed Core/approval/execution/recovery, real native trigger metadata lifecycle and receipt protocol; isolated stores are not live acceptance. @layer test @owner copilotWorkbench */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { isDeepStrictEqual } = require("node:util");
const core = require("../../copilotCore/src/service/defaultCopilotOrchestrationService");
const adapter = require("../src/service/defaultCopilotProcessTriggerActionService");
const native = require("../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessTriggerCommandReceiptService");
const lifecycle = require("../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessRuntimeLifecycleService");
const protocol = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelCommandReceiptService");

/** Creates an isolated composition using real owning services. @param {Object} t Test context. @param {string} kind Fixed command. @returns {Object} Fixture. */
function fixture(t, kind = "create") {
  const globals = Object.fromEntries(
    ["SERVICE", "CONFIG", "NODICS", "CLASSES"].map((key) => [key, global[key]]),
  );
  t.after(() => Object.assign(global, globals));
  const state = {
    action: null,
    receipt: null,
    trigger:
      kind === "create"
        ? null
        : {
            code: "trigger-one",
            definitionCode: "definition-one",
            name: "Original",
            status: "ACTIVE",
            active: true,
            triggerType: "MANUAL",
            ownerModule: "nodics.process",
            schedule: {},
          },
    calls: [],
    writes: 0,
    starts: 0,
    audits: 0,
    lose: false,
    failure: null,
    nativeEnabled: true,
  };
  const configuration = {
    api: { enabled: true },
    core: {},
    conversation: {},
    workbench: {
      ...structuredClone(require("../config/properties").copilot.workbench),
      processTriggerTarget: {
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
    create: {
      definitionCode: "definition-one",
      name: "New trigger",
      status: "DRAFT",
      active: false,
      triggerType: "MANUAL",
      schedule: { expression: "0 0 * * *" },
    },
    update: { name: "Changed", status: "PAUSED", active: false },
    archive: {},
    execute: { instanceCode: "instance-one", context: {} },
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
        "process.trigger.manage",
        "process.trigger.execute",
      ],
    },
    httpRequest: { headers: { authorization: "Bearer employee" } },
    body: {
      operation: "process.trigger." + kind,
      triggerCode: "trigger-one",
      ...commands[kind],
    },
  };
  const envelope = (result) => ({
    code: "SUC_DB",
    result: structuredClone(result),
  });
  const matches = (row, query) =>
    row &&
    Object.entries(query).every(([key, value]) => {
      const actual = key === "audit.revision" ? row.audit.revision : row[key];
      return value?.$exists === false
        ? actual === undefined
        : isDeepStrictEqual(
            actual,
            value && Object.hasOwn(value, "$eq") ? value.$eq : value,
          );
    });
  const store = (key) => ({
    get: async (r) =>
      envelope(matches(state[key], r.query) ? [state[key]] : []),
    save: async (r) => {
      if (state[key]) throw new Error("duplicate");
      state[key] = structuredClone(r.model);
      return envelope(state[key]);
    },
    update: async (r) => {
      const found = matches(state[key], r.query);
      if (found) Object.assign(state[key], structuredClone(r.model));
      return envelope({ acknowledged: true, matchedCount: found ? 1 : 0 });
    },
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
  const triggers = {
    get: async (r) => {
      assert.equal(r.options.skipItemCache, true);
      assert.equal(r.searchOptions.pageSize, 2);
      return envelope(
        state.trigger
          ? [
              state.failure === "foreign-read"
                ? { ...state.trigger, code: "foreign" }
                : state.trigger,
            ]
          : [],
      );
    },
    save: async (r) => {
      assert.equal(r.options.insertOnly, true);
      if (state.trigger) throw new Error("duplicate trigger");
      state.writes++;
      state.trigger = structuredClone(r.model);
      return state.failure === "save-envelope"
        ? { code: "ERR_DB", result: state.trigger }
        : envelope(state.trigger);
    },
    update: async (r) => {
      assert.ok(Object.hasOwn(r.query, "schedule"));
      const found =
        state.failure !== "zero-match" && matches(state.trigger, r.query);
      if (found) {
        state.writes++;
        Object.assign(state.trigger, structuredClone(r.model.$set));
      }
      return envelope({
        acknowledged: state.failure !== "unacknowledged",
        matchedCount: found ? 1 : 0,
      });
    },
  };
  const scopedLifecycle = {
    ...lifecycle,
    triggerService: () => triggers,
    requireDefinition: async () => ({ code: "definition-one" }),
    audit: async () => {
      state.audits++;
    },
    startInstance: async (r) => {
      state.starts++;
      return {
        code: "SUC_PROCESS_00007",
        data: {
          instance: {
            code: r.runtimeOperation.instanceCode,
            definitionCode: r.runtimeOperation.definitionCode,
            status: "COMPLETED",
            startCompleted: true,
          },
        },
      };
    },
  };
  global.SERVICE = {
    DefaultCopilotOrchestrationService: core,
    DefaultCopilotProcessTriggerActionService: adapter,
    DefaultCopilotPolicyService: require("../../copilotPolicy/src/service/defaultCopilotPolicyService"),
    DefaultCopilotWorkbenchService: require("../src/service/defaultCopilotWorkbenchService"),
    DefaultCopilotActionExecutionService: require("../src/service/defaultCopilotActionExecutionService"),
    DefaultCopilotActionRecoveryService: require("../src/service/defaultCopilotActionRecoveryService"),
    DefaultModelCommandReceiptService: protocol,
    DefaultProcessRuntimeLifecycleService: scopedLifecycle,
    DefaultModelsUpdateInitializerService: {
      getAffectedCount: (r) => r.result?.matchedCount,
    },
    DefaultLoggerService: { inheritRequestPrivacy: () => {} },
    DefaultSecuredRequestPipelineService: {
      getGrantedPermissions: (r) => r.authData.permissions,
      getRouteActionAuthorizationConfig: () => ({}),
      isPermissionGranted: (grant, grants) => grants.includes(grant),
    },
    DefaultCopilotActionService: store("action"),
    DefaultProcessCommandReceiptService: store("receipt"),
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
            httpRequest: undefined,
            triggerCode: "trigger-one",
            command: kind,
            runtimeOperation: r.request,
          });
        assert.equal(r.methodName, kind === "update" ? "PATCH" : "POST");
        assert.equal(
          r.apiName,
          kind === "create"
            ? "/triggers"
            : "/triggers/trigger-one" + (kind === "update" ? "" : "/" + kind),
        );
        const result = await native.execute(
          {
            ...request,
            triggerCode: "trigger-one",
            runtimeOperation: r.requestBody,
            idempotencyKey: r.idempotencyKey,
          },
          kind,
        );
        if (state.lose) throw new Error("lost original response");
        return result;
      },
    },
  };
  return { state, configuration, request, lifecycle: scopedLifecycle };
}
/** Prepares and approves without dispatching business work. @param {Object} f Fixture. @returns {Promise<Object>} Prepared review. */
async function approve(f) {
  const prepared = await core.prepareProcessTriggerPlan(f.request);
  Object.assign(f.request, {
    confirmationCode: prepared.actionCode,
    expectedRevision: prepared.confirmation.revision,
    argumentsDigest: prepared.confirmation.argumentsDigest,
  });
  const approved = await core.approveConfirmation(f.request);
  f.request.expectedRevision = approved.confirmation.revision;
  assert.equal(f.state.writes + f.state.starts, 0);
  return prepared;
}
for (const kind of ["create", "update", "archive", "execute"]) {
  test(
    kind +
      " reviews every command field, dispatches once and rejects duplicate execution",
    async (t) => {
      const f = fixture(t, kind);
      const prepared = await approve(f);
      assert.match(JSON.stringify(prepared.preview.review), /trigger-one/);
      for (const field of adapter.reviewValue(
        f.state.action.audit.plan.records[0].command,
        "Command",
      ))
        assert.ok(
          prepared.preview.review[0].fields.some((item) =>
            isDeepStrictEqual(item, field),
          ),
        );
      assert.equal(
        (await core.executeConfirmation(f.request)).state,
        "CONSUMED",
      );
      assert.equal(f.state.receipt.state, "COMPLETED");
      await assert.rejects(core.executeConfirmation(f.request));
      assert.equal(f.state.writes + f.state.starts, 1);
    },
  );
  test(
    kind +
      " recovers original receipt after lost response with new writes disabled",
    async (t) => {
      const f = fixture(t, kind);
      await approve(f);
      f.state.lose = true;
      assert.equal(
        (await core.executeConfirmation(f.request)).state,
        "OUTCOME_UNKNOWN",
      );
      f.state.nativeEnabled = false;
      f.configuration.workbench.processTriggerTarget.enabled = false;
      f.request.expectedRevision = f.state.action.audit.revision;
      assert.equal(
        (await core.getConfirmation(f.request)).confirmation.recovery.label,
        "Inspect original result",
      );
      assert.equal(
        (await core.reconcileConfirmation(f.request)).confirmation.state,
        "CONSUMED",
      );
      assert.equal(f.state.writes + f.state.starts, 1);
    },
  );
  test(
    kind +
      " rejects changed actor, tenant, enterprise, grant, revision, input and target before dispatch",
    async (t) => {
      const f = fixture(t, kind);
      await approve(f);
      for (const [object, key, value] of [
        [f.request.authData, "loginId", "foreign"],
        [f.request.authData, "enterpriseCode", "foreign"],
        [f.request, "tenant", "foreign"],
        [f.request.authData, "permissions", []],
        [f.request, "expectedRevision", -1],
        [f.state.action.audit.plan.records[0], "code", "foreign"],
        [
          f.configuration.workbench.processTriggerTarget,
          "connectionName",
          "foreign",
        ],
      ]) {
        const original = object[key];
        object[key] = value;
        await assert.rejects(core.executeConfirmation(f.request));
        object[key] = original;
      }
      assert.equal(f.state.calls.length, 0);
    },
  );
}
for (const failure of ["zero-match", "unacknowledged", "foreign-read"])
  test(
    "native trigger " +
      failure +
      " cannot generate a successful receipt or audit",
    async (t) => {
      const f = fixture(t, "update");
      await approve(f);
      f.state.failure = failure;
      assert.equal(
        (await core.executeConfirmation(f.request)).state,
        "OUTCOME_UNKNOWN",
      );
      assert.equal(f.state.receipt.state, "STARTED");
      assert.equal(f.state.audits, 0);
      f.request.expectedRevision = f.state.action.audit.revision;
      assert.equal(
        (await core.reconcileConfirmation(f.request)).confirmation.state,
        "OUTCOME_UNKNOWN",
      );
    },
  );
test("native create cannot upsert a duplicate or accept an error-shaped save", async (t) => {
  const f = fixture(t);
  f.state.failure = "save-envelope";
  await approve(f);
  assert.equal(
    (await core.executeConfirmation(f.request)).state,
    "OUTCOME_UNKNOWN",
  );
  assert.equal(f.state.audits, 0);
  const before = structuredClone(f.state.trigger);
  await assert.rejects(
    f.lifecycle.createTrigger({
      ...f.request,
      runtimeOperation: { ...before, name: "Overwrite" },
    }),
  );
  assert.deepEqual(f.state.trigger, before);
});
test("explicit choices, unknown fields, metadata bounds and missing references fail closed", (t) => {
  fixture(t);
  assert.deepEqual(
    adapter.input(adapter.parseIntent("execute trigger trigger-one")).missing,
    ["instanceCode", "context"],
  );
  assert.deepEqual(
    adapter.input(adapter.parseIntent("update trigger trigger-one")).missing,
    ["at least one trigger field to update"],
  );
  for (const input of [
    { operation: "process.trigger.delete", triggerCode: "one" },
    { operation: "process.trigger.archive", triggerCode: "../one" },
    {
      operation: "process.trigger.archive",
      triggerCode: "one",
      url: "foreign",
    },
    { operation: "process.trigger.update", triggerCode: "one", active: "true" },
    {
      operation: "process.trigger.execute",
      triggerCode: "one",
      instanceCode: "new",
      context: { password: "secret" },
    },
  ])
    assert.throws(() => adapter.input(input));
});
test("native disabled recording and malformed keys never downgrade keyed commands", async (t) => {
  const f = fixture(t);
  f.state.nativeEnabled = false;
  for (const key of ["", null, 12, "x".repeat(513), "bad\nkey", "valid-key"])
    await assert.rejects(
      native.execute(
        {
          ...f.request,
          runtimeOperation: adapter.input(f.request.body).body,
          idempotencyKey: key,
        },
        "create",
      ),
    );
  assert.equal(f.state.writes, 0);
});
test("conversation command is excluded from provider history and stops at review", async (t) => {
  const f = fixture(t, "archive"),
    events = [];
  SERVICE.DefaultCopilotConversationService = {
    getOwned: async () => ({ code: "conversation" }),
    acceptTurn: async (_c, r) => {
      assert.equal(r.providerContextEligible, false);
      return { code: "turn", state: "ACCEPTED" };
    },
    appendEvent: async (_t, type) => events.push(type),
    complete: async () => {},
    fail: async () => assert.fail("turn failed"),
  };
  f.request.message = "archive trigger trigger-one";
  assert.equal(
    (await core.performTurn(f.request)).confirmation.operationId,
    "process.trigger.archive",
  );
  assert.deepEqual(events, ["CONFIRMATION_REQUIRED"]);
  assert.equal(f.state.writes, 0);
});
test("natural-language proposals retain literal identity and explicit activation/context choices", (t) => {
  const f = fixture(t),
    planner = require("../../copilotCore/src/service/defaultCopilotIntentPlanningService");
  assert.equal(planner.allowed(f.request, f.configuration).length, 4);
  planner.assertEvidence(
    {
      operation: "process.trigger.execute",
      triggerCode: "trigger-one",
      instanceCode: "instance-one",
      context: {},
    },
    "Please execute trigger trigger-one with instanceCode instance-one and context {}",
  );
  for (const message of [
    "execute trigger trigger-one-more with instanceCode instance-one and context {}",
    "execute trigger trigger-one with instanceCode instance-one",
    "archive trigger trigger-one with instanceCode instance-one and context {}",
  ])
    assert.throws(() =>
      planner.assertEvidence(
        {
          operation: "process.trigger.execute",
          triggerCode: "trigger-one",
          instanceCode: "instance-one",
          context: {},
        },
        message,
      ),
    );
  f.request.authData.permissions = ["copilot.mutation.prepare"];
  assert.deepEqual(planner.allowed(f.request, f.configuration), []);
});
test("later-layer review copy and timeout customize presentation/transport without expanding authority", async (t) => {
  const f = fixture(t);
  f.configuration.workbench.processTriggerPresentation.title =
    "Reviewed workflow trigger";
  f.configuration.workbench.processTriggerPresentation.summary =
    "Review every field before executing.";
  f.configuration.workbench.processTriggerTimeoutMs = 12000;
  const review = await approve(f);
  assert.equal(review.preview.summary, "Review every field before executing.");
  assert.equal(
    review.preview.review[0].title,
    "Reviewed workflow trigger create",
  );
  await core.executeConfirmation(f.request);
  assert.equal(f.state.calls[0].timeoutMs, 12000);
  assert.equal(f.state.calls[0].maxAttempts, 1);
});
test("malformed native receipt and changed input cannot reconcile original execution", async (t) => {
  const f = fixture(t, "execute");
  await approve(f);
  f.state.lose = true;
  await core.executeConfirmation(f.request);
  f.request.expectedRevision = f.state.action.audit.revision;
  for (const [key, value] of [
    ["resultIdentity", "foreign"],
    ["enterpriseCode", "foreign"],
    ["argumentsDigest", "tampered"],
    ["resultDigest", "tampered"],
  ]) {
    const original = f.state.receipt[key];
    f.state.receipt[key] = value;
    let result;
    try {
      result = await core.reconcileConfirmation(f.request);
    } catch (error) {
      assert.ok(error.code);
    }
    if (result) assert.equal(result.confirmation.state, "OUTCOME_UNKNOWN");
    assert.notEqual(f.state.action.state, "EXECUTED");
    f.request.expectedRevision = f.state.action.audit.revision;
    f.state.receipt[key] = original;
  }
  assert.equal(f.state.starts, 1);
});
test("contradictory trigger/start envelopes never establish original completion", (t) => {
  const f = fixture(t, "execute");
  const command = native.command(
    {
      ...f.request,
      triggerCode: "trigger-one",
      runtimeOperation: adapter.input(f.request.body).body,
    },
    "execute",
    "original-key",
  );
  const result = {
    code: "SUC_PROCESS_00011",
    data: {
      trigger: { code: "trigger-one", definitionCode: "definition-one" },
      execution: {
        instance: {
          code: "instance-one",
          definitionCode: "definition-one",
          status: "COMPLETED",
          startCompleted: true,
        },
      },
    },
  };
  assert.equal(command.resultIdentity(result), "trigger-one");
  for (const [object, key, value] of [
    [result.data.trigger, "error", "failed"],
    [result.data.execution, "success", false],
    [result.data.execution.instance, "acknowledged", false],
    [result.data.execution.instance, "startCompleted", "true"],
    [result.data.execution.instance, "code", "foreign"],
  ]) {
    const original = object[key];
    object[key] = value;
    assert.throws(() => command.resultIdentity(result));
    if (original === undefined) delete object[key];
    else object[key] = original;
  }
});
test("native trigger CAS treats persisted metadata as literal values, never query operators", (t) => {
  const f = fixture(t, "update");
  const schedule = { $ne: null };
  assert.deepEqual(
    f.lifecycle.triggerPredicate({ ...f.state.trigger, schedule }).schedule,
    { $eq: schedule },
  );
});
test("large nested context retains every reviewed leaf inside Axis section bounds", async (t) => {
  const f = fixture(t, "execute");
  f.request.body.context = Object.fromEntries(
    ["one", "two", "three"].map((name) => [
      name,
      Object.fromEntries(
        Array.from({ length: 30 }, (_, index) => [
          "field" + index,
          "value" + index,
        ]),
      ),
    ]),
  );
  const prepared = await approve(f);
  const sections = prepared.preview.review;
  assert.equal(sections.length, 5);
  assert.ok(
    sections.every(
      (section) => section.fields.length <= 20 && section.title.length <= 128,
    ),
  );
  const fields = sections.flatMap((section) => section.fields);
  assert.equal(fields.length, 94);
  assert.ok(
    fields.every(
      (field) => field.label.length <= 128 && field.value.length <= 2000,
    ),
  );
  assert.equal(
    fields.filter((field) => field.label.startsWith("Command.context.")).length,
    90,
  );
  assert.throws(() =>
    adapter.reviewValue(
      { ["a".repeat(64)]: { ["b".repeat(64)]: "value" } },
      "Command",
    ),
  );
});
test("native metadata acknowledgements do not broaden update/archive result visibility", async (t) => {
  const f = fixture(t, "update");
  f.state.trigger.privateMetadata = "not part of this command";
  const updated = await f.lifecycle.updateTrigger({
    ...f.request,
    triggerCode: "trigger-one",
    runtimeOperation: { name: "Changed" },
  });
  assert.deepEqual(Object.keys(updated.data).sort(), [
    "code",
    "lastObservedAt",
    "name",
  ]);
  const archived = await f.lifecycle.archiveTrigger({
    ...f.request,
    triggerCode: "trigger-one",
    runtimeOperation: {},
  });
  assert.deepEqual(Object.keys(archived.data).sort(), [
    "active",
    "archivedAt",
    "code",
    "status",
  ]);
});
