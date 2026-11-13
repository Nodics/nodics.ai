/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/test/circaLocalUnusedRefundException @description Verifies exact native-only original-purchase exception selection and immutable campaign sources. @layer test @owner circa.ewaste */
const test = require("node:test"), assert = require("node:assert/strict");
const { frameworkRoot, loadRuntime } = require("../../../test/helpers/configuration");

test("native Commerce selects only the original 50-POINTS unused purchase for explicit owner adjudication", () => {
  const runtime = loadRuntime("commerceServer");
  assert.equal(runtime.order.refunds.enabled, true);
  assert.deepEqual(runtime.order.refunds.policyExceptions, {
    enabled: true,
    environmentNames: ["kickoffLocal"],
    approvals: [{ tenant: "default", enterpriseCode: "GREENPERKS_ONLINE", ownerId: "customer@circa.local",
      orderCode: "CIRCA_ORDER_261009:GP-A01-UNUSED-REFUND:order", caseCode: "ORDER_REVIEW_EBAABBBC41098AF799F44B680CDDD130",
      amount: "50.00", currency: "POINTS", entitlementCode: "digitalEntitlement:5ea8973f942b650766948c9ef9b163fbe84a4a28",
      couponCode: "CIRCA_COUPON_GP-A01_BATCH:1" }],
  });
  assert.equal(runtime.enterpriseManagement?.accessAssignments?.roles, undefined);
  const role = Object.values(require(frameworkRoot + "/nodics.commerce/modules/checkout/modules/order/data/init-v001/records/identity/orderSpecialAccessRoleData"))
    .find(row => row.code === "COMMERCE_REFUND_EXCEPTION_REVIEW");
  assert.equal(role.groupCodes[0],
    "commerceRefundExceptionReviewerUserGroup");
});

test("sibling runtimes and Docker do not enable original unused-coupon exceptions", () => {
  for (const [server, environment] of [["commerceServer", "kickoffDockerLocal"], ["platformServer", "kickoffLocal"],
    ["commerceStagedServer", "kickoffLocal"], ["wasteServer", "kickoffLocal"]]) {
    const selected = loadRuntime(server, environment).order?.refunds?.policyExceptions;
    assert.notEqual(selected?.enabled, true, server + ":" + environment);
  }
});

test("original campaign and price fixture pins remain unchanged by exception setup", context => {
  require("./helpers/reviewedCampaign").useReviewedCampaign(context);
  require("./fixtures/circaItemCouponJourneySelectionFactory").verifyCircaItemCouponSelectionSources();
});
