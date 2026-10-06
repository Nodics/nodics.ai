/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Verifies sensitive coupon preparation and governed one-attempt execution with synthetic Commerce evidence and isolated action persistence. */
"use strict";
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const coupon = require("../src/service/defaultCopilotCouponActionService");
const core = require("../../copilotCore/src/service/defaultCopilotOrchestrationService");
const policy = require("../../copilotPolicy/src/service/defaultCopilotPolicyService");
const executor = require("../src/service/defaultCopilotActionExecutionService");
let request, configuration, action, calls, evidence;
beforeEach(() => {
  configuration = {
    api: { enabled: true },
    core: {},
    conversation: {},
    workbench: {
      ...require("../config/properties").copilot.workbench,
      couponTarget: {
        enabled: true,
        moduleName: "digitalCore",
        connectionName: "commerce-owner",
        targetAuthority: { runtimeRole: "COMMERCE" },
      },
    },
  };
  request = {
    tenant: "tenant",
    sensitive: true,
    authData: {
      loginId: "employee",
      enterpriseCode: "ACME",
      permissions: [
        "copilot.data.query",
        "copilot.mutation.prepare",
        "copilot.mutation.execute",
        "commerce.coupon.pos.redeem",
      ],
    },
    httpRequest: { headers: { authorization: "Bearer employee" } },
    body: {
      couponToken: "PRIVATE-COUPON-1234",
      merchantReceiptReference: "SALE-123",
    },
  };
  evidence = {
    eligible: true,
    status: "ACTIVE",
    entitlementCode: "ENTITLEMENT_1",
    productCode: "PRODUCT_1",
    claimStatus: "UNCLAIMED",
    merchantCode: "ISSUER",
    merchantLabel: "Authorized issuer",
    mode: "MERCHANT_SCREEN",
    revision: 1,
    validationCode: "a".repeat(64),
    validationExpiresAt: new Date(Date.now() + 280000).toISOString(),
    conditions: {
      name: { en: "Purchased benefit" },
      discountType: "FIXED",
      discountValue: "10",
    },
  };
  action = undefined;
  calls = [];
  global.CONFIG = { get: () => configuration };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message || code);
        this.code = code;
      }
    },
  };
  global.SERVICE = {
    DefaultCopilotOrchestrationService: core,
    DefaultCopilotCouponActionService: coupon,
    DefaultCopilotPolicyService: policy,
    DefaultCopilotActionExecutionService: executor,
    DefaultCopilotWorkbenchService: require("../src/service/defaultCopilotWorkbenchService"),
    DefaultLoggerService: {
      assertSensitiveRequest: (r) => {
        if (!r.sensitive) throw new Error("sensitive transport required");
      },
      inheritRequestPrivacy: (target, source) => {
        target.sensitive = source.sensitive;
      },
    },
    DefaultCopilotActionService: {
      save: async (r) => {
        action = structuredClone(r.model);
        return { code: "SUC_TEST", result: structuredClone(action) };
      },
      get: async () => ({
        code: "SUC_TEST",
        result: action ? [structuredClone(action)] : [],
      }),
      update: async (r) => {
        const matched =
          action.state === r.query.state &&
          action.audit.revision === r.query["audit.revision"];
        if (matched) Object.assign(action, structuredClone(r.model));
        return {
          code: "SUC_TEST",
          result: { matchedCount: matched ? 1 : 0 },
        };
      },
    },
    DefaultModuleService: {
      invokeModule: async (r) => {
        calls.push(r);
        if (r.apiName.endsWith("/workspace"))
          return {
            data: {
              storeRequired: false,
              pricedSourceRequired: false,
              storeLabel: "Outlet",
              stores: [],
            },
          };
        if (r.apiName.endsWith("/validate"))
          return { data: structuredClone(evidence) };
        if (r.apiName === "/merchant/redemptions")
          return {
            data: {
              redemptions: [
                {
                  entitlementCode: "ENTITLEMENT_1",
                  productCode: "PRODUCT_1",
                  claimStatus: "REDEEMED",
                  status: "ACTIVE",
                  revision: 2,
                  merchantCode: "ISSUER",
                  merchantLabel: "Authorized issuer",
                  mode: "MERCHANT_SCREEN",
                  redemptionCode: "POS_1",
                  merchantReceiptReference: "SALE-123",
                  receiptCode: "RECEIPT_1",
                  recoveryRequired: false,
                  confirmationKey: "private-command-key",
                  customerCode: "private-customer",
                },
              ],
            },
          };
        return {
          data: {
            entitlementCode: "ENTITLEMENT_1",
            claimStatus: "REDEEMED",
            receiptCode: "RECEIPT_1",
            merchantReceiptReference: "SALE-123",
            merchantCode: "ISSUER",
            mode: "MERCHANT_SCREEN",
          },
        };
      },
    },
  };
});
/** Uses real Core approval and immutable challenge binding. @returns {Promise<Object>} Preparation. */
async function approve() {
  const prepared = await core.prepareCouponPlan(request);
  request.confirmationCode = prepared.actionCode;
  request.expectedRevision = prepared.confirmation.revision;
  request.argumentsDigest = prepared.confirmation.argumentsDigest;
  const approved = await core.approveConfirmation(request);
  request.expectedRevision = approved.confirmation.revision;
  return prepared;
}
test("failed, foreign and duplicate action reads cannot authorize confirmation", async () => {
  await approve();
  const original = structuredClone(action);
  for (const response of [
    { code: "ERR_TEST", result: [original] },
    { code: "SUC_TEST", success: false, result: [original] },
    { code: "SUC_TEST", errors: {}, result: [original] },
    {
      code: "SUC_TEST",
      result: [{ ...original, code: "coupon-plan-other" }],
    },
    { code: "SUC_TEST", result: [{ ...original, error: "failed" }] },
    { code: "SUC_TEST", result: [original, original] },
  ]) {
    SERVICE.DefaultCopilotActionService.get = async () => response;
    await assert.rejects(core.executeConfirmation(request));
    assert.equal(calls.length, 1);
  }
});
test("raw token reaches only one sensitive owner validation; reviewed proof uses original employee and atomic execution", async () => {
  const prepared = await approve();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].requestBody.couponToken, request.body.couponToken);
  assert.equal(calls[0].sensitive, true);
  assert.equal(calls[0].header.Authorization, "Bearer employee");
  assert.equal(calls[0].header["x-enterprise-code"], "ACME");
  assert.equal(calls[0].maxAttempts, 1);
  assert.doesNotMatch(JSON.stringify(action), /PRIVATE-COUPON|couponToken/);
  assert.doesNotMatch(
    JSON.stringify(prepared),
    /PRIVATE-COUPON|validationCode|customer|ownerId/,
  );
  assert.equal(
    prepared.preview.review[0].fields.find(
      (field) => field.label === "Enterprise code",
    ).value,
    "ISSUER",
  );
  const result = await core.executeConfirmation(request);
  assert.equal(result.state, "CONSUMED");
  assert.equal(calls.length, 2);
  assert.equal(calls[1].apiName, "/merchant/redemptions/ENTITLEMENT_1/confirm");
  assert.equal(calls[1].requestBody.confirmed, true);
  assert.match(
    calls[1].header["Idempotency-Key"],
    /^coupon-confirm:[a-f0-9]{64}$/,
  );
  assert.doesNotMatch(JSON.stringify(calls[1]), /PRIVATE-COUPON|couponToken/);
  await assert.rejects(core.executeConfirmation(request));
  assert.equal(calls.length, 2);
});
test("missing grants, sensitive handling or enabled target deny before sending the token", async () => {
  request.authData.permissions = ["copilot.mutation.prepare"];
  await assert.rejects(core.prepareCouponPlan(request));
  request.authData.permissions.push("commerce.coupon.pos.redeem");
  request.sensitive = false;
  await assert.rejects(core.prepareCouponPlan(request), /sensitive/);
  request.sensitive = true;
  configuration.workbench.couponTarget.enabled = false;
  await assert.rejects(core.prepareCouponPlan(request));
  assert.equal(calls.length, 0);
});
test("owner refusal, prior instruction, raw token echo, malformed benefit and stale validation never create plans", async () => {
  for (const patch of [
    { eligible: false },
    { recoveryRequired: true },
    { confirmationKey: "original-command" },
    { merchantLabel: request.body.couponToken },
    { conditions: { unexpected: "unsafe" } },
    { validationExpiresAt: "2000-01-01T00:00:00Z" },
    {
      conditions: {
        benefit: { sourceStage: "UNQUALIFIED_EXTERNAL_POS" },
      },
    },
  ]) {
    const before = structuredClone(evidence);
    Object.assign(evidence, patch);
    await assert.rejects(core.prepareCouponPlan(request));
    assert.equal(action, undefined);
    evidence = before;
  }
});
test("lost or mismatched owner completion remains unknown and cannot retry the command", async () => {
  await approve();
  SERVICE.DefaultModuleService.invokeModule = async (r) => {
    calls.push(r);
    throw new Error("private provider error");
  };
  const result = await core.executeConfirmation(request);
  assert.equal(result.state, "OUTCOME_UNKNOWN");
  assert.equal(action.state, "OUTCOME_UNKNOWN");
  await assert.rejects(core.executeConfirmation(request));
  assert.equal(calls.length, 2);
  assert.doesNotMatch(
    JSON.stringify(action),
    /private provider error|PRIVATE-COUPON/,
  );
});
test("changed routing, revoked execution grant and expired owner proof block before dispatch", async () => {
  await approve();
  configuration.workbench.couponTarget.connectionName = "other";
  await assert.rejects(core.executeConfirmation(request));
  configuration.workbench.couponTarget.connectionName = "commerce-owner";
  request.authData.permissions = [
    "copilot.mutation.prepare",
    "commerce.coupon.pos.redeem",
  ];
  await assert.rejects(core.executeConfirmation(request));
  request.authData.permissions.push("copilot.mutation.execute");
  action.audit.plan.records[0].validationExpiresAt = "2000-01-01T00:00:00Z";
  await assert.rejects(core.executeConfirmation(request));
  assert.equal(calls.length, 1);
});
test("workspace exposes bounded owner choices and rejects policy revocation during transport", async () => {
  const workspace = await core.getCouponWorkspace(request);
  assert.equal(workspace.enterpriseCode, "ACME");
  assert.deepEqual(workspace.stores, []);
  SERVICE.DefaultModuleService.invokeModule = async () => {
    configuration.workbench.couponTarget.enabled = false;
    return {
      data: {
        storeRequired: false,
        pricedSourceRequired: false,
        storeLabel: "Outlet",
        stores: [],
      },
    };
  };
  await assert.rejects(core.getCouponWorkspace(request));
});
test("merchant queue is independently authorized, bounded and minimized", async () => {
  const queue = await core.getCouponRedemptions(request);
  assert.equal(queue.contractVersion, 1);
  assert.equal(queue.enterpriseCode, "ACME");
  assert.equal(queue.redemptions.length, 1);
  assert.equal(queue.redemptions[0].receiptCode, "RECEIPT_1");
  assert.doesNotMatch(
    JSON.stringify(queue),
    /private-command-key|private-customer|confirmationKey|customerCode/,
  );
  assert.equal(calls.at(-1).apiName, "/merchant/redemptions");
  assert.equal(calls.at(-1).methodName, "GET");
  assert.equal(calls.at(-1).maxAttempts, 1);
  request.authData.permissions = ["commerce.coupon.pos.redeem"];
  await assert.rejects(core.getCouponRedemptions(request));
  assert.equal(calls.length, 1);
});
test("merchant queue rejects oversized, malformed and post-read revoked evidence", async () => {
  for (const redemptions of [
    Array.from({ length: 101 }, () => ({})),
    [{ entitlementCode: "ENTITLEMENT_1" }],
    [
      {
        entitlementCode: "ENTITLEMENT_1",
        productCode: "PRODUCT_1",
        claimStatus: "REDEEMED",
        status: "ACTIVE",
        revision: 2,
        merchantCode: "ISSUER",
        merchantLabel: "Authorized issuer",
        mode: "MERCHANT_SCREEN",
        recoveryRequired: "false",
      },
    ],
  ]) {
    SERVICE.DefaultModuleService.invokeModule = async (r) => {
      calls.push(r);
      return { data: { redemptions } };
    };
    await assert.rejects(core.getCouponRedemptions(request));
  }
  SERVICE.DefaultModuleService.invokeModule = async (r) => {
    calls.push(r);
    configuration.workbench.couponTarget.enabled = false;
    return { data: { redemptions: [] } };
  };
  await assert.rejects(core.getCouponRedemptions(request));
});
test("coupon redemption text is minimized before conversation persistence and never invokes a provider", async () => {
  const saved = [];
  request.message = 'Coupon code "PRIVATE-COUPON-1234" mark redeemed.';
  SERVICE.DefaultCopilotConversationService = {
    getOwned: async () => ({ code: "conversation" }),
    acceptTurn: async (_conversation, r) => {
      saved.push({
        message: r.message,
        eligible: r.providerContextEligible,
      });
      return { code: "turn", state: "ACCEPTED" };
    },
    complete: async (_conversation, _turn, content, result) =>
      saved.push({ content, result }),
  };
  SERVICE.DefaultCopilotProviderService = {
    invoke: () => {
      throw new Error("provider must not run");
    },
  };
  await core.performTurn(request);
  assert.equal(saved[0].message, "Open secure coupon fulfillment");
  assert.equal(saved[0].eligible, false);
  assert.doesNotMatch(JSON.stringify(saved), /PRIVATE-COUPON/);
  assert.equal(calls.length, 0);
});
/** Creates an uncertain action and exposes only its original receipt evidence. @returns {Promise<Object>} Mutable synthetic owner evidence. */
async function uncertain() {
  await approve();
  const original = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async (r) => {
    calls.push(r);
    throw new Error("lost acknowledgement");
  };
  const result = await core.executeConfirmation(request);
  request.expectedRevision = result.revision;
  const receipt = {
    contractVersion: 1,
    state: "COMPLETED",
    entitlementCode: "ENTITLEMENT_1",
    confirmationKey: calls.at(-1).idempotencyKey,
    receiptCode: "RECEIPT_1",
    merchantReceiptReference: "SALE-123",
    merchantCode: "ISSUER",
    mode: "MERCHANT_SCREEN",
  };
  SERVICE.DefaultModuleService.invokeModule = async (r) => {
    if (!r.apiName.endsWith("/receipt/query")) return original(r);
    calls.push(r);
    return { data: structuredClone(receipt) };
  };
  return receipt;
}
test("original receipt reconciles an uncertain action once without a new fulfillment command", async () => {
  await uncertain();
  const result = await core.reconcileCouponReceipt(request);
  assert.equal(result.receiptState, "COMPLETED");
  assert.equal(result.confirmation.state, "CONSUMED");
  assert.equal(action.audit.result.receiptCode, "RECEIPT_1");
  assert.equal(
    calls.filter((call) => call.apiName.endsWith("/confirm")).length,
    1,
  );
  assert.equal(calls.at(-1).sensitive, true);
  assert.doesNotMatch(
    JSON.stringify(calls.at(-1)),
    /PRIVATE-COUPON|validationCode/,
  );
  await assert.rejects(core.reconcileCouponReceipt(request));
});
test("unconfirmed receipt never unlocks retry and mismatched evidence cannot complete an action", async () => {
  const receipt = await uncertain();
  const original = structuredClone(receipt);
  receipt.state = "UNCONFIRMED";
  assert.equal(
    (await core.reconcileCouponReceipt(request)).receiptState,
    "UNCONFIRMED",
  );
  assert.equal(action.state, "OUTCOME_UNKNOWN");
  for (const patch of [
    { confirmationKey: "another" },
    { storeCode: "OTHER" },
    { merchantReceiptReference: "OTHER" },
    { merchantCode: "OTHER" },
    { contractVersion: 2 },
    { receiptCode: "" },
  ]) {
    Object.assign(receipt, original, patch);
    await assert.rejects(core.reconcileCouponReceipt(request));
    assert.equal(action.state, "OUTCOME_UNKNOWN");
  }
  await assert.rejects(core.executeConfirmation(request));
});
test("expired approval can inspect original evidence; revoked permission and stale intent cannot", async () => {
  await uncertain();
  action.audit.challenge.expiresAt = Date.now() - 1;
  request.expectedRevision--;
  await assert.rejects(core.reconcileCouponReceipt(request));
  request.expectedRevision++;
  const permissions = request.authData.permissions;
  request.authData.permissions = ["copilot.mutation.prepare"];
  await assert.rejects(core.reconcileCouponReceipt(request));
  request.authData.permissions = permissions;
  assert.equal(
    (await core.reconcileCouponReceipt(request)).receiptState,
    "COMPLETED",
  );
});
test("concurrent inspections require one acknowledged CAS and policy is checked after owner lookup", async () => {
  await uncertain();
  const results = await Promise.allSettled([
    core.reconcileCouponReceipt(request),
    core.reconcileCouponReceipt(request),
  ]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    results.filter((result) => result.status === "rejected").length,
    1,
  );
});
test("permission revocation during receipt lookup leaves the action uncertain", async () => {
  const receipt = await uncertain();
  SERVICE.DefaultModuleService.invokeModule = async () => {
    request.authData.permissions = [];
    return { data: receipt };
  };
  await assert.rejects(core.reconcileCouponReceipt(request));
  assert.equal(action.state, "OUTCOME_UNKNOWN");
});
