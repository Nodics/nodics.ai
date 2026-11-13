/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module checkoutCore/test/localOwnershipPublicationGuards @description Exercises Commerce local admission with the actual DMS ownership boundary and isolated authority doubles; no servers or persistence. @layer test @owner checkoutCore */
const test = require("node:test"), assert = require("node:assert/strict");
const path = require("node:path"), root = path.resolve(__dirname, "../../../../../..");
const load = file => require(path.join(root, file));
const dms = load("nodics.foundation/modules/nService/src/service/module/defaultModuleService");
const modules = "nodics.commerce/modules/";
const owner = (base, file) => load(modules + base + "/src/service/" + file);
const digital = file => owner("digitalCommerce/modules/digitalCore", file);
const cases = [
  ["digitalCore", "merchant", r => digital("defaultDigitalCommerceMerchantService").context(r)],
  ["digitalCore", "private entitlement", r => digital("defaultDigitalCommerceEntitlementService").revealContext.call({
    ...digital("defaultDigitalCommerceEntitlementService"), freshCouponOwner: async () => ({ code: "enterprise", type: "ENTERPRISE" }) }, r)],
  ["bidding", "participant", r => owner("bidding", "defaultBiddingService").participantContext.call({
    ...owner("bidding", "defaultBiddingService"), identity: () => ({ resolve: async input => input }) }, r)],
  ["bidding", "scheduler", r => owner("bidding", "defaultBiddingAuctionService").scheduler({ ...r, authData: {
    ...r.authData, principalType: "service", tokenType: "service", groups: ["serviceAccountUserGroup"] } })],
  ["promotion", "budget", r => owner("baseCommerce/modules/promotion", "defaultPromotionBudgetMutationService").context(r)],
  ["inventory", "opening receipt", r => owner("baseCommerce/modules/inventory", "defaultInventoryOpeningReceiptService").context(r)],
  ["order", "refund", r => owner("checkout/modules/order", "defaultOrderRefundRecoveryService").context(r)],
  ["order", "exception", () => owner("checkout/modules/order", "defaultOrderRefundExceptionService").settings()],
  ["fulfillmentCore", "physical reversal", r => owner("fulfillment/modules/fulfillmentCore", "defaultPhysicalOrderReversalService").operator(r)],
];
function fixture(t, moduleName) {
  const names = ["SERVICE", "CONFIG", "NODICS", "CLASSES"], previous = Object.fromEntries(names.map(k => [k, Object.getOwnPropertyDescriptor(global, k)]));
  t.after(() => names.forEach(k => previous[k] ? Object.defineProperty(global, k, previous[k]) : delete global[k]));
  const state = { active: true, remoteOnly: false, permission: true, publication: "OPERATIONAL", code: "UNRELATED", inventoryPublication: "ONLINE" };
  global.NODICS = { isModuleActive: name => name === moduleName && state.active, getSelectedEnvironmentName: () => "unit" };
  const policy = { enabled: true, merchantRedemption: { enabled: true }, refunds: { enabled: true,
    policyExceptions: { enabled: true, environmentNames: ["unit"], approvals: [{}] } },
    physicalReversal: { enabled: true, evidenceMode: "MANUAL_ATTESTATION", maximumLines: 10, maximumReceipts: 10 } };
  global.CONFIG = { get: key => key === "runtimeRole" ? { code: state.code, publication: state.publication }
    : key === "inventory" ? { publication: { runtimeRole: state.inventoryPublication } } : policy };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  global.SERVICE = {
      DefaultPaymentProviderSelectionService: { resolve: (...args) => require('../../../../payment/modules/paymentCore/src/service/defaultPaymentProviderSelectionService').resolve.call({ configuration: () => require('../../../../payment/modules/paymentCore/config/properties').paymentCore }, ...args) },
    DefaultModuleService: dms,
    DefaultRouterService: { getModuleServerConfig: name => ({ getOptions: () => ({ remoteOnly: name !== moduleName || state.remoteOnly }) }) },
    DefaultSecuredRequestPipelineService: { getGrantedPermissions: () => [], isPermissionGranted: () => state.permission },
    DefaultLoggerService: { hasPrivateCaptureProtection: () => true, inheritRequestPrivacy() {} },
    DefaultPromotionOperationService: { requireOperationalRuntime() {} },
    DefaultPromotionPublicationService: { deliveryEnabled: () => true },
    DefaultOrderDisputeService: { staff: async r => r },
  };
  const request = { tenant: "tenant", enterpriseCode: "enterprise", authData: { tenant: "tenant", enterpriseCode: "enterprise",
    principalType: "human", tokenType: "access", loginId: "actor" }, payload: {} };
  return { state, request, policy };
}
for (const [moduleName, label, invoke] of cases) {
  test(`${moduleName} ${label}: actual local owner and explicit operational publication, independent of role code`, async t => {
    const f = fixture(t, moduleName);
    if (moduleName === "fulfillmentCore") f.policy.physicalOperations = f.policy.physicalReversal;
    await invoke(f.request);
    for (const publication of ["STAGED", "ONLINE", undefined]) {
      f.state.publication = publication;
      await assert.rejects(async () => invoke(f.request), `${publication} is not operational admission`);
    }
    f.state.publication = "OPERATIONAL";
    f.state.remoteOnly = true;
    await assert.rejects(async () => invoke(f.request));
    f.state.remoteOnly = false; f.state.active = false;
    await assert.rejects(async () => invoke(f.request));
    f.state.active = true; f.state.code = undefined;
    await invoke(f.request);
    if (["private entitlement", "scheduler", "opening receipt", "physical reversal"].includes(label)) {
      f.state.permission = false;
      await assert.rejects(async () => invoke(f.request), "ownership never grants permission");
    }
    if (moduleName === "inventory") {
      f.state.permission = true; f.state.inventoryPublication = "STAGED";
      await assert.rejects(async () => invoke(f.request), "module ONLINE publication remains independent");
    }
  });
}
test("Checkout sandbox capture keeps exact adapter qualification and explicit local operational ownership", async t => {
  const f = fixture(t, "checkoutCore"), ports = owner("checkout/modules/checkoutCore", "defaultCheckoutPlacementPortsService");
  const adapter = {}, policy = { enabled: true, sandboxOnly: true, liveQualified: false, maturity: "OFFLINE_CONFORMANCE" };
  const get = CONFIG.get; CONFIG.get = key => key === "stripeProvider" ? policy : get(key);
  SERVICE.DefaultStripeSandboxAdapterService = adapter;
  SERVICE.DefaultPaymentExecutionService = { execute: async r => r };
  const boundary = { ...ports, serviceAuthData: r => r.authData, paymentAdapter: () => adapter };
  const capture = boundary.create().capturePayment;
  const run = () => capture({ ...f.request, payload: { cartCode: "cart" } }, { code: "order" }, { methodCode: "CARD", providerCode: "stripe-sandbox" });
  assert.equal((await run()).sandboxMode, "LOCAL_SANDBOX_DEMO");
  for (const publication of ["STAGED", "ONLINE", undefined]) {
    f.state.publication = publication; assert.equal((await run()).sandboxMode, undefined);
  }
  f.state.publication = "OPERATIONAL"; f.state.remoteOnly = true;
  assert.equal((await run()).sandboxMode, undefined);
  f.state.remoteOnly = false; f.state.active = false;
  assert.equal((await run()).sandboxMode, undefined);
  f.state.active = true; policy.liveQualified = true;
  assert.equal((await run()).sandboxMode, undefined);
  policy.liveQualified = false; SERVICE.DefaultStripeSandboxAdapterService = {};
  assert.equal((await run()).sandboxMode, undefined);
});
