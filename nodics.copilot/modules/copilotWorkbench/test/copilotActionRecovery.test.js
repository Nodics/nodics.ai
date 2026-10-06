/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotWorkbench/test/copilotActionRecovery @description Original native receipts, current authority, revision races and approval-bound continuation without replay. @layer test @owner copilotWorkbench */
const test = require("node:test");
const assert = require("node:assert/strict");
const recovery = require("../src/service/defaultCopilotActionRecoveryService");
const execution = require("../src/service/defaultCopilotActionExecutionService");
const policy = require("../../copilotPolicy/src/service/defaultCopilotPolicyService");
const core = require("../../copilotCore/src/service/defaultCopilotOrchestrationService");
const protocol = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelCommandReceiptService");

/** Installs exact scoped native evidence and revision-aware action persistence. */
function fixture(t) {
  const previous = { SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const context = {
    channel: "EMPLOYEE",
    tenant: "tenant",
    enterprise: "enterprise",
    actor: "employee",
    permissions: [
      "copilot.mutation.prepare",
      "copilot.mutation.execute",
      "copilot.mutation.reconcile",
    ],
  };
  const target = {
    connectionName: "commerce",
    productModule: "product",
    pricingModule: "pricing",
  };
  const configuration = {
    workbench: {
      receiptRecovery: {
        enabled: true,
        label: "Inspect original results",
        continuation: "Review the remaining rows.",
      },
    },
  };
  const plan = {
    id: "plan",
    schema: "product",
    state: "VALIDATED",
    executionTarget: target,
    records: [{ code: "one" }],
    relatedRecords: {
      prices: { schema: "priceRow", records: [{ code: "price-one" }] },
    },
  };
  let action = {
    code: "plan",
    conversationCode: "conversation",
    capability: "commerce.product.create",
    state: "OUTCOME_UNKNOWN",
    tenantCode: "tenant",
    enterpriseCode: "enterprise",
    principalCode: "employee",
    preview: {},
    audit: {
      plan,
      challenge: policy.createConfirmation(plan, context),
      revision: 3,
      rows: [
        { index: 0, schema: "product", code: "one", state: "OUTCOME_UNKNOWN" },
        {
          index: 1,
          schema: "priceRow",
          code: "price-one",
          state: "NOT_STARTED",
        },
      ],
    },
  };
  const calls = [];
  const state = { completed: true, tamper: null, race: false, revoke: false };
  const request = {
    tenant: "tenant",
    conversationCode: "conversation",
    authData: { tenant: "tenant", entCode: "enterprise", loginId: "employee" },
    expectedRevision: 3,
    argumentsDigest: action.audit.challenge.planDigest,
  };
  const scope = {
    tenantCode: "tenant",
    enterpriseCode: "enterprise",
    principalCode: "employee",
    moduleName: "product",
    operation: "product.create",
  };
  global.SERVICE = {
    DefaultCopilotPolicyService: policy,
    DefaultModelCommandReceiptService: protocol,
    DefaultCopilotActionExecutionService: execution,
    DefaultCopilotOrchestrationService: {
      ...core,
      configuration: () => configuration,
      assertEnabled: () => {},
      securityContext: () => context,
      actionTarget: () => target,
      employeeExecutionHeaders: () => ({ Authorization: "Bearer employee" }),
    },
    DefaultCopilotActionService: {
      get: async () => ({ code: "SUC_DB", result: [structuredClone(action)] }),
      update: async (r) => {
        const matched =
          !state.race &&
          Object.entries(r.query).every(
            ([key, value]) =>
              (key === "audit.revision"
                ? action.audit.revision
                : action[key]) === value,
          );
        if (matched) action = { ...action, ...structuredClone(r.model) };
        return { code: "SUC_DB", result: { matchedCount: matched ? 1 : 0 } };
      },
    },
    DefaultModuleService: {
      invokeModule: async (input) => {
        calls.push(input);
        const argumentsDigest = protocol.digest(plan.records[0]);
        const data = {
          contractVersion: 1,
          ...scope,
          state: state.completed ? "COMPLETED" : "OUTCOME_UNKNOWN",
          commandCode:
            "command-" + protocol.digest({ scope, key: "plan:product:one" }),
          argumentsDigest,
          resultIdentity: "one",
          resultDigest: protocol.digest({
            argumentsDigest,
            resultIdentity: "one",
          }),
        };
        if (state.tamper) state.tamper(data);
        if (state.revoke) context.permissions = [];
        return { code: "SUC_DB", data };
      },
    },
  };
  return {
    request,
    context,
    configuration,
    target,
    state,
    calls,
    action: () => action,
  };
}

test("verified original completion renews approval only for rows never started", async (t) => {
  const f = fixture(t);
  const result = await recovery.reconcile(f.action(), f.request);
  assert.equal(result.confirmation.state, "PENDING");
  assert.equal(f.action().audit.challenge.confirmed, false);
  assert.deepEqual(
    result.confirmation.outcomes.map((row) => row.state),
    ["COMPLETED", "NOT_STARTED"],
  );
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].apiName, "/product/commands/inspect");
  assert.equal(f.calls[0].maxAttempts, 1);
  assert.equal(f.calls[0].header.Authorization, "Bearer employee");
  assert.equal(
    f.action().audit.continuation.planDigest,
    f.request.argumentsDigest,
  );
  const submitted = [];
  await assert.rejects(
    execution.execute(
      f.action(),
      { ...f.request, expectedRevision: 4 },
      f.context,
      f.request,
      () => assert.fail("no approval"),
      policy,
    ),
  );
  f.action().state = "APPROVED";
  f.action().audit.challenge.confirmed = true;
  await execution.execute(
    f.action(),
    { ...f.request, expectedRevision: 4 },
    f.context,
    f.request,
    async (row) => {
      submitted.push(row.schema);
      return { code: "SUC_DB", result: { code: row.record.code } };
    },
    policy,
  );
  assert.deepEqual(submitted, ["priceRow"]);
  assert.equal(f.action().state, "EXECUTED");
});

test("missing native completion remains unknown and cannot unlock a continuation", async (t) => {
  const f = fixture(t);
  f.state.completed = false;
  assert.equal(
    (await recovery.reconcile(f.action(), f.request)).confirmation.state,
    "OUTCOME_UNKNOWN",
  );
  assert.equal(f.action().audit.continuation, undefined);
  assert.equal(f.calls.length, 1);
});

test("all original work proven complete needs no new approval or execution", async (t) => {
  const f = fixture(t);
  f.action().audit.rows[1].state = "COMPLETED";
  assert.equal(
    (await recovery.reconcile(f.action(), f.request)).confirmation.state,
    "CONSUMED",
  );
  assert.equal(f.calls.length, 1);
});

test("tampered scope, result digest, command and arguments never become completion", async (t) => {
  const f = fixture(t);
  for (const field of [
    "principalCode",
    "enterpriseCode",
    "tenantCode",
    "moduleName",
    "operation",
    "argumentsDigest",
    "commandCode",
    "resultDigest",
  ]) {
    f.state.tamper = (value) => {
      value[field] = "changed";
    };
    await assert.rejects(recovery.reconcile(f.action(), f.request));
    assert.equal(f.action().audit.revision, 3);
  }
});

test("revocation during native inspection and competing action claims fail closed", async (t) => {
  const f = fixture(t);
  f.state.race = true;
  await assert.rejects(recovery.reconcile(f.action(), f.request));
  f.state.race = false;
  f.state.revoke = true;
  await assert.rejects(recovery.reconcile(f.action(), f.request));
  assert.equal(f.action().state, "OUTCOME_UNKNOWN");
  assert.equal(f.action().audit.revision, 3);
});

test("current history restores only the exact owned private action", async (t) => {
  const f = fixture(t);
  assert.equal((await recovery.history(f.request))[0].state, "OUTCOME_UNKNOWN");
  f.action().principalCode = "other";
  await assert.rejects(recovery.history(f.request));
});

test("original target inspection ignores only write admission, not routing qualification", (t) => {
  fixture(t);
  const enterprise = require("../src/service/defaultCopilotEnterpriseActionService");
  const waste = require("../src/service/defaultCopilotCollectionCentreActionService");
  for (const [owner, property, moduleName] of [
    [enterprise, "enterpriseTarget", "profile"],
    [waste, "collectionCentreTarget", "wasteCollection"],
  ]) {
    const configuration = {
      workbench: {
        [property]: { enabled: false, moduleName, connectionName: "owner" },
      },
    };
    assert.throws(() => owner.target(configuration));
    assert.equal(owner.target(configuration, true).moduleName, moduleName);
    configuration.workbench[property].connectionName = "https://caller.invalid";
    assert.throws(() => owner.target(configuration, true));
    assert.throws(() => owner.target({ workbench: {} }, true));
  }
});

test("fixed owner routes bind Product, Pricing, Profile and Waste original arguments", (t) => {
  const f = fixture(t);
  const action = f.action();
  assert.equal(
    recovery.target(
      f.request,
      action,
      { schema: "priceRow", record: { code: "price" } },
      f.configuration,
    ).operation,
    "priceRow.create",
  );
  for (const [capability, serviceName, schema, expected] of [
    [
      "profile.enterprise.onboard",
      "DefaultCopilotEnterpriseActionService",
      "enterprise",
      "/enterprises/commands/inspect",
    ],
    [
      "profile.enterprise.onboard",
      "DefaultCopilotEnterpriseActionService",
      "enterpriseAccessAssignment",
      "/enterprises/customer/access-assignments/commands/inspect",
    ],
    [
      "waste.collectionCentre.create",
      "DefaultCopilotCollectionCentreActionService",
      "wasteCollectionPoint",
      "/wastecollectionpoint/commands/inspect",
    ],
  ]) {
    const target = {
      moduleName:
        schema === "wasteCollectionPoint" ? "wasteCollection" : "profile",
      connectionName: "owner",
    };
    SERVICE[serviceName] = {
      authorize: () => {},
      target: () => target,
      input: () => {},
    };
    const next = structuredClone(action);
    next.capability = capability;
    next.audit.plan.executionTarget = target;
    const selected = recovery.target(
      f.request,
      next,
      {
        schema,
        record: {
          code: "record",
          enterpriseCode: "customer",
          email: "employee@example.invalid",
          roleCode: "employee",
        },
      },
      f.configuration,
    );
    assert.equal(selected.apiName, expected);
    if (schema === "enterpriseAccessAssignment")
      assert.equal(selected.input.body.idempotencyKey, selected.key);
  }
});
