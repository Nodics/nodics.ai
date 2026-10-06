/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotWorkbench/test/copilotStandaloneActions @description Exercises standalone invitations and prices through actual Core, policy, review, execution and receipt recovery with isolated persistence and native transport. @layer test @owner copilotWorkbench */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const core = require("../../copilotCore/src/service/defaultCopilotOrchestrationService");
const policy = require("../../copilotPolicy/src/service/defaultCopilotPolicyService");
const execution = require("../src/service/defaultCopilotActionExecutionService");
const recovery = require("../src/service/defaultCopilotActionRecoveryService");
const protocol = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelCommandReceiptService");
const invitation = require("../src/service/defaultCopilotInvitationActionService");
const price = require("../src/service/defaultCopilotPriceActionService");

/** Builds two-row owner commands without customer data or live calls. @param {string} kind Adapter selection. @returns {Object} Isolated state. */
function fixture(kind) {
  const configuration = {
    api: { enabled: true },
    core: {},
    conversation: {},
    workbench: {
      standaloneInvitationsEnabled: true,
      standalonePricesEnabled: true,
      enterpriseTarget: {
        enabled: true,
        moduleName: "profile",
        connectionName: "owner",
      },
      target: { pricingModule: "pricing", connectionName: "owner" },
      receiptRecovery: {
        enabled: true,
        label: "Inspect original results",
        continuation: "Review remaining rows.",
      },
    },
  };
  const body =
    kind === "invitation"
      ? {
          operation: "profile.enterprise.invite",
          enterpriseCode: "ACME",
          employees: [
            { email: "one@example.invalid", roleCode: "OPERATOR" },
            { email: "two@example.invalid", roleCode: "VIEWER" },
          ],
        }
      : {
          operation: "commerce.price.create",
          prices: ["ONE", "TWO"].map((code) => ({
            code: "PRICE-" + code,
            priceBookCode: "BOOK",
            productCode: "PRODUCT-" + code,
            unitAmount: "12.3400",
            currency: "AED",
            minQuantity: "1",
          })),
        };
  const request = {
    tenant: "tenant",
    authData: {
      loginId: "employee",
      enterpriseCode: "platform",
      permissions: [
        "copilot.mutation.prepare",
        "copilot.mutation.execute",
        "copilot.mutation.reconcile",
        "profile.enterpriseAccess.assign",
      ],
    },
    httpRequest: { headers: { authorization: "Bearer employee" } },
    body,
  };
  const calls = [],
    receipts = new Map();
  const state = { action: null, lose: false, revoke: false, incomplete: false };
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
    DefaultCopilotOrchestrationService: core,
    DefaultCopilotPolicyService: policy,
    DefaultCopilotWorkbenchService: require("../src/service/defaultCopilotWorkbenchService"),
    DefaultCopilotEnterpriseActionService: require("../src/service/defaultCopilotEnterpriseActionService"),
    DefaultCopilotInvitationActionService: invitation,
    DefaultCopilotPriceActionService: price,
    DefaultCopilotActionExecutionService: execution,
    DefaultCopilotActionRecoveryService: recovery,
    DefaultModelCommandReceiptService: protocol,
    DefaultCopilotActionService: {
      save: async (r) => {
        state.action = structuredClone(r.model);
        return { code: "SUC_DB", result: r.model };
      },
      get: async () => ({
        code: "SUC_DB",
        result: state.action ? [structuredClone(state.action)] : [],
      }),
      update: async (r) => {
        const matches = Object.entries(r.query).every(
          ([key, value]) =>
            (key === "audit.revision"
              ? state.action.audit.revision
              : state.action[key]) === value,
        );
        if (matches) Object.assign(state.action, structuredClone(r.model));
        return { code: "SUC_DB", result: { matchedCount: matches ? 1 : 0 } };
      },
    },
    DefaultModuleService: {
      invokeModule: async (r) => {
        calls.push(r);
        assert.equal(r.header.Authorization, "Bearer employee");
        assert.equal(r.header["x-enterprise-code"], "platform");
        assert.equal(r.local, false);
        assert.equal(r.maxAttempts, 1);
        if (r.apiName.endsWith("/commands/inspect"))
          return {
            code: "SUC_DB",
            data: receipts.get(r.request.idempotencyKey),
          };
        assert.equal(
          r.apiName,
          kind === "invitation"
            ? "/enterprises/ACME/access-assignments"
            : "/pricerow",
        );
        const selected = recovery.target(
          request,
          state.action,
          execution
            .rows(state.action.audit.plan)
            .find(
              (row) =>
                state.action.audit.plan.id +
                  ":" +
                  row.schema +
                  ":" +
                  row.record.code ===
                r.idempotencyKey,
            ),
          configuration,
        );
        const scope = {
          tenantCode: "tenant",
          enterpriseCode: "platform",
          principalCode: "employee",
          moduleName: selected.moduleName,
          operation: selected.operation,
        };
        const argumentsDigest = protocol.digest(selected.input),
          resultIdentity =
            kind === "invitation" ? "native-invitation" : r.request.code;
        receipts.set(r.idempotencyKey, {
          contractVersion: 1,
          ...scope,
          state: state.incomplete ? "OUTCOME_UNKNOWN" : "COMPLETED",
          commandCode:
            "command-" + protocol.digest({ scope, key: r.idempotencyKey }),
          argumentsDigest,
          resultIdentity,
          resultDigest: protocol.digest({ argumentsDigest, resultIdentity }),
        });
        if (state.revoke) request.authData.permissions = [];
        if (state.lose) throw new Error("response lost");
        return kind === "invitation"
          ? {
              code: "SUC_PROFILE",
              data: {
                code: resultIdentity,
                enterpriseCode: "ACME",
                email: r.request.email,
                roleCode: r.request.roleCode,
                status: "PENDING",
              },
            }
          : { code: "SUC_PRICING", result: { code: r.request.code } };
      },
    },
  };
  return {
    configuration,
    request,
    state,
    calls,
    receipts,
    adapter: kind === "invitation" ? invitation : price,
    prepare: () =>
      core[
        kind === "invitation" ? "prepareInvitationPlan" : "preparePricePlan"
      ](request),
  };
}

/** Approves through the real scoped lifecycle, never by editing the saved challenge. @param {Object} f Fixture. @returns {Promise<Object>} Preview. */
async function approve(f) {
  const prepared = await f.prepare();
  Object.assign(f.request, {
    confirmationCode: prepared.actionCode,
    expectedRevision: prepared.confirmation.revision,
    argumentsDigest: prepared.confirmation.argumentsDigest,
  });
  const result = await core.approveConfirmation(f.request);
  f.request.expectedRevision = result.confirmation.revision;
  return prepared;
}

for (const kind of ["invitation", "price"]) {
  test(
    kind +
      ": disabling new writes preserves original inspection but cannot execute remaining rows",
    async () => {
      const f = fixture(kind);
      await approve(f);
      f.state.lose = true;
      await core.executeConfirmation(f.request);
      f.configuration.workbench[
        kind === "invitation"
          ? "standaloneInvitationsEnabled"
          : "standalonePricesEnabled"
      ] = false;
      if (kind === "invitation")
        f.configuration.workbench.enterpriseTarget.enabled = false;
      f.request.expectedRevision = f.state.action.audit.revision;
      const result = await core.reconcileConfirmation(f.request);
      assert.equal(result.confirmation.state, "PENDING");
      assert.deepEqual(
        result.confirmation.outcomes.map((row) => row.state),
        ["COMPLETED", "NOT_STARTED"],
      );
      f.request.expectedRevision = result.confirmation.revision;
      const approved = await core.approveConfirmation(f.request);
      f.request.expectedRevision = approved.confirmation.revision;
      f.request.body.inspection = true;
      f.request.inspection = true;
      await assert.rejects(core.executeConfirmation(f.request));
      await assert.rejects(f.prepare());
      assert.equal(
        f.calls.filter((call) => !call.apiName.endsWith("/inspect")).length,
        1,
      );
    },
  );
  test(
    kind +
      ": disabled-write inspection still rejects target drift and revoked recovery authority",
    async () => {
      const f = fixture(kind);
      await approve(f);
      f.state.lose = true;
      await core.executeConfirmation(f.request);
      f.request.expectedRevision = f.state.action.audit.revision;
      f.configuration.workbench[
        kind === "invitation"
          ? "standaloneInvitationsEnabled"
          : "standalonePricesEnabled"
      ] = false;
      const target =
        kind === "invitation"
          ? f.configuration.workbench.enterpriseTarget
          : f.configuration.workbench.target;
      target.connectionName = "other";
      await assert.rejects(core.reconcileConfirmation(f.request));
      target.connectionName = "owner";
      f.request.authData.permissions = f.request.authData.permissions.filter(
        (value) => value !== "copilot.mutation.reconcile",
      );
      await assert.rejects(core.reconcileConfirmation(f.request));
      assert.equal(f.calls.length, 1);
    },
  );
  test(
    kind +
      ": complete review, explicit approval and native single dispatch without unrelated creation",
    async () => {
      const f = fixture(kind),
        preview = await approve(f);
      assert.equal(f.calls.length, 0);
      assert.equal(preview.preview.review.length, 2);
      if (kind === "price") {
        assert.match(
          preview.preview.summary,
          /Reference existence has not been verified/,
        );
        assert.doesNotMatch(preview.preview.summary, /validates references/);
      }
      for (const [index, row] of f.state.action.audit.plan.records.entries())
        assert.deepEqual(
          preview.preview.review[index].fields.map((field) => field.value),
          Object.values(row).map(String),
        );
      const result = await core.executeConfirmation(f.request);
      assert.equal(result.state, "CONSUMED");
      assert.equal(result.result.operationsCompleted, 2);
      assert.equal(f.calls.length, 2);
      await assert.rejects(core.executeConfirmation(f.request));
      if (kind === "price")
        assert.equal(f.calls[0].request.unitAmount, "12.3400");
      else
        assert.equal(
          f.request.authData.permissions.includes("profile.enterprise.create"),
          false,
        );
    },
  );
  test(
    kind +
      ": original native completion renews approval for unstarted rows without repeating the lost write",
    async () => {
      const f = fixture(kind);
      await approve(f);
      f.state.lose = true;
      const lost = await core.executeConfirmation(f.request);
      assert.equal(lost.state, "OUTCOME_UNKNOWN");
      assert.deepEqual(
        lost.rows.map((row) => row.state),
        ["OUTCOME_UNKNOWN", "NOT_STARTED"],
      );
      await assert.rejects(core.executeConfirmation(f.request));
      f.request.expectedRevision = f.state.action.audit.revision;
      const restored = await core.reconcileConfirmation(f.request);
      assert.equal(restored.confirmation.state, "PENDING");
      assert.ok(restored.confirmation.recovery);
      f.request.expectedRevision = restored.confirmation.revision;
      await assert.rejects(core.executeConfirmation(f.request));
      const approved = await core.approveConfirmation(f.request);
      f.request.expectedRevision = approved.confirmation.revision;
      f.state.lose = false;
      assert.equal(
        (await core.executeConfirmation(f.request)).state,
        "CONSUMED",
      );
      assert.equal(
        f.calls.filter((call) => !call.apiName.endsWith("/inspect")).length,
        2,
      );
    },
  );
  test(
    kind + ": incomplete native receipt stays unknown and never allows retry",
    async () => {
      const f = fixture(kind);
      await approve(f);
      f.state.lose = true;
      f.state.incomplete = true;
      await core.executeConfirmation(f.request);
      f.request.expectedRevision = f.state.action.audit.revision;
      assert.equal(
        (await core.reconcileConfirmation(f.request)).confirmation.state,
        "OUTCOME_UNKNOWN",
      );
      assert.equal(f.state.action.audit.continuation, undefined);
      await assert.rejects(core.executeConfirmation(f.request));
    },
  );
  test(
    kind +
      ": changed target, enterprise, revision or reviewed field cannot dispatch",
    async () => {
      const f = fixture(kind);
      await approve(f);
      const target =
        kind === "invitation"
          ? f.configuration.workbench.enterpriseTarget
          : f.configuration.workbench.target;
      target.connectionName = "changed";
      await assert.rejects(core.executeConfirmation(f.request));
      target.connectionName = "owner";
      f.request.authData.enterpriseCode = "foreign";
      await assert.rejects(core.executeConfirmation(f.request));
      f.request.authData.enterpriseCode = "platform";
      f.request.expectedRevision--;
      await assert.rejects(core.executeConfirmation(f.request));
      f.request.expectedRevision++;
      f.state.action.audit.plan.records[0].code = "tampered";
      await assert.rejects(core.executeConfirmation(f.request));
      assert.equal(f.calls.length, 0);
    },
  );
  test(
    kind +
      ": disabling admission or removing bearer/grants rejects preparation",
    async () => {
      const f = fixture(kind),
        flag =
          kind === "invitation"
            ? "standaloneInvitationsEnabled"
            : "standalonePricesEnabled";
      f.configuration.workbench[flag] = false;
      await assert.rejects(f.prepare());
      f.configuration.workbench[flag] = true;
      f.request.httpRequest.headers = {};
      await assert.rejects(f.prepare());
      f.request.httpRequest.headers.authorization = "Bearer employee";
      f.request.authData.permissions = [];
      await assert.rejects(f.prepare());
      assert.equal(f.state.action, null);
    },
  );
  test(
    kind +
      ": revocation after the first native response prevents subsequent calls",
    async () => {
      const f = fixture(kind);
      await approve(f);
      f.state.revoke = true;
      await core.executeConfirmation(f.request);
      assert.equal(f.calls.length, 1);
    },
  );
  test(
    kind +
      ": typed conversation emits review without invoking a provider or business API",
    async () => {
      const f = fixture(kind),
        events = [];
      SERVICE.DefaultCopilotConversationService = {
        getOwned: async () => ({ code: "conversation" }),
        acceptTurn: async () => ({ code: "turn", state: "ACCEPTED" }),
        appendEvent: async (_t, type, data) => events.push({ type, data }),
        complete: async () => {},
        fail: async () => assert.fail("unexpected turn failure"),
      };
      f.request.message = JSON.stringify(f.request.body);
      const result = await core.performTurn(f.request);
      assert.equal(result.confirmation.operationId, f.request.body.operation);
      assert.equal(events[0].type, "CONFIRMATION_REQUIRED");
      assert.equal(f.calls.length, 0);
    },
  );
}

test("invitation inputs reject unknown roles, duplicates, mixed enterprise overrides and empty batches", () => {
  const f = fixture("invitation");
  assert.deepEqual(
    invitation.input({
      ...f.request.body,
      employees: [{ email: "one@example.invalid" }],
    }).missing,
    ["employees.0.roleCode"],
  );
  for (const employees of [
    [],
    [{ email: "one@example.invalid", roleCode: "ROOT" }],
    [
      {
        email: "one@example.invalid",
        roleCode: "VIEWER",
        enterpriseCode: "other",
      },
    ],
    [
      f.request.body.employees[0],
      { ...f.request.body.employees[0], email: "ONE@example.invalid" },
    ],
  ])
    assert.throws(() => invitation.input({ ...f.request.body, employees }));
  assert.equal(
    invitation.input({ operation: f.request.body.operation }).state,
    "CLARIFICATION_REQUIRED",
  );
});
test("prices clarify missing fields and reject rounding-prone numbers, exponent amounts, zero quantities and injected fields", () => {
  const f = fixture("price"),
    row = f.request.body.prices[0];
  for (const patch of [
    { unitAmount: 12.34 },
    { unitAmount: "1e2" },
    { unitAmount: "-1" },
    { minQuantity: "0.000" },
    { currency: "aed" },
    { tenant: "foreign" },
    { revision: 2 },
  ])
    assert.throws(() =>
      price.input({ ...f.request.body, prices: [{ ...row, ...patch }] }),
    );
  assert.throws(() => price.input({ ...f.request.body, prices: [row, row] }));
  assert.deepEqual(
    price.input({
      ...f.request.body,
      prices: [{ ...row, currency: undefined }],
    }).missing,
    ["prices.0.currency"],
  );
});
