/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const assert = require("node:assert/strict");
const fixture = require("../../../../../baseCommerce/modules/promotion/test/helpers/couponAcquisitionFixture");
const acquisition = require("../../src/service/defaultDigitalCommerceCouponAcquisitionService");
const checkout = require("../../src/service/defaultDigitalCommerceCheckoutService");
const digital = require("../../src/service/defaultDigitalCommerceEntitlementService");
const notifications = require("../../src/service/defaultDigitalCommerceNotificationService");
const refund = require("../../src/service/defaultDigitalCommerceRefundService");
const defaults = require("../../config/properties");
const cart = require("../../../../../checkout/modules/cart/src/facade/defaultCartCustomerFacade");
const wasteCoupon = require("../../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteCertificateCouponService");
const wasteOperations = require("../../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteAssetTransferOperationService");
const wasteComponents = require("../../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteCertificateBundleComponentService");
const wasteDefaults = require("../../../../../../../nodics.waste/modules/wasteCore/config/properties");
const installWasteEnums = require("../../../../../../../nodics.waste/modules/wasteCore/test/helpers/runtimeEnums");
/** @module digitalCore/test/helpers/couponCheckoutFixture @description Composes actual Digital checkout/acquisition/entitlement and Promotion allocation/private persistence with isolated generated records and domain transport. No installed provider or database is exercised. @owner digitalCore @layer test */
/** Installs the actual coupon acquisition owners with isolated persistence and transport. */
function setup(t, type = "CERTIFICATES", enterprise = false, buyerEnterprise = "issuer") {
  const f = fixture(t), priorFacade = global.FACADE, priorEnums = global.ENUMS, hadEnums = Object.hasOwn(global, "ENUMS");
  t.after(() => {
    global.FACADE = priorFacade;
    if (hadEnums) global.ENUMS = priorEnums;
    else delete global.ENUMS;
  });
  global.ENUMS = { ...priorEnums };
  installWasteEnums();
  const config = structuredClone(defaults.digitalCore), previous = CONFIG.get;
  CONFIG.get = name => name === "digitalCore" ? config : name === "cart" ? { participation: { profile: config.couponAccess.profile } } : previous(name);
  f.campaign.couponOffer.supply = { mode: "UNLIMITED" };
  f.campaign.conditions.sourceProductCode = "product";
  f.campaign.couponOffer.requirements = { type, ...(type === "CERTIFICATES" ? {} : { priceRef: "price" }),
    ...(type === "REWARDS" ? {} : { certificates: { quantity: 1, categoryCode: "phone", milestoneCode: "RECYCLED" } }) };
  const ownerRef = { type: enterprise ? "ENTERPRISE" : "CUSTOMER", code: enterprise ? buyerEnterprise : "buyer" };
  const canonical = { module: "profile", schema: ownerRef.type.toLowerCase(), code: ownerRef.code };
  const r = { tenant: "t", enterpriseCode: "issuer", participantEnterpriseCode: buyerEnterprise, storeCode: "store", ownerId: enterprise ? buyerEnterprise : "buyer", ownerRef: canonical,
    authorization: "Bearer original", idempotencyKey: "checkout", authData: { tokenType: "access", principalType: enterprise ? "human" : "customer",
      tenant: "t", enterpriseCode: buyerEnterprise, loginId: "actor", principalId: enterprise ? "actor" : "buyer" },
    payload: { cartCode: "cart", orderCode: "order", couponSelections: { entry: [type === "REWARDS" ? [] : ["certificate"]] } } };
  const scope = { tenant: "t", enterpriseCode: "issuer", ownerId: r.ownerId, active: true };
  const entry = { ...scope, code: "entry", cartCode: "cart", status: "ACTIVE", ownerRef: canonical, productCode: "product", sku: "sku", quantity: "1",
    priceDecision: { tenant: "t", productCode: "product", currency: "PTS", storeCode: "store", priceRowCode: "price" },
    availability: { strategy: "COUPON_CODE_POOL", promotionCode: "offer", purchaseRequirements: f.campaign.couponOffer.requirements } };
  const db = { DefaultCartService: [{ ...scope, code: "cart", status: "PLACED", ownerRef: canonical, channelCode: "channel", participantEnterpriseCode: buyerEnterprise,
    storeCode: "store", merchantScope: { contractVersion: 1, storeCode: "store", enterpriseCode: "issuer", revision: 1 } }],
    DefaultCartEntryService: [entry], DefaultCartCalculationService: [{ ...scope, code: "calculation", cartCode: "cart", entries: [entry] }],
    DefaultCommerceOrderService: [{ ...scope, code: "order", cartCode: "cart", status: "PLACED", currency: "PTS", totalAmount: type === "CERTIFICATES" ? "0" : "10",
      evidence: { ownerRef: canonical, participantEnterpriseCode: buyerEnterprise, calculationCode: "calculation", storeCode: "store" } }],
    DefaultCommerceOrderEntryService: [{ ...scope, code: "order:entry", orderCode: "order", productCode: "product", quantity: "1" }],
    DefaultPaymentTransactionEntryService: type === "CERTIFICATES" ? [] : [{ ...scope, enterpriseCode: buyerEnterprise, code: "capture", orderCode: "order", cartCode: "cart",
      status: "CAPTURED", currency: "PTS", totalAmount: "10", methodCode: "LOYALTY_REWARD", evidence: { operation: "CAPTURE", participant: { ownerRef: canonical } } }],
    DefaultDigitalEntitlementService: [], DefaultDigitalDeliveryService: [], DefaultCheckoutCheckpointService: [] };
  const state = { reserved: false, consumed: false, phases: [], denied: false, failReserve: false };
  const permissions = ["commerce.checkout.place", "commerce.digital.own.read", "commerce.digital.own.reveal"];
  SERVICE.DefaultSecuredRequestPipelineService = { getGrantedPermissions: () => permissions, isPermissionGranted: (p, grants) => grants.includes(p) };
  SERVICE.DefaultModuleService = { invokeModule: async () => enterprise ? { principalCode: "actor",
    scopes: [{ scopeType: "ENTERPRISE", scopeCode: buyerEnterprise }], deniedScopes: state.denied ? [{ scopeType: "ENTERPRISE", scopeCode: buyerEnterprise }] : [] }
    : { contractVersion: 1, tenant: "t", enterpriseCode: "issuer", customer: { code: "buyer", loginId: "actor" } } };
  global.FACADE = { DefaultCartCustomerFacade: cart };
  SERVICE.DefaultCartMerchantScopeService = require("../../../../../checkout/modules/cart/src/service/defaultCartMerchantScopeService");
  SERVICE.DefaultStoreContextService = { resolveStoreCode: (r, code) => { assert.equal(r.storeCode, code); return code; } };
  SERVICE.DefaultCouponSecureRevealService = require("../../../../../baseCommerce/modules/promotion/src/service/defaultCouponSecureRevealService");
  SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => ({ isSystem: true }) };
  SERVICE.DefaultExactAmountService = require("../../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService");
  SERVICE.DefaultDigitalCommerceCouponAcquisitionService = acquisition;
  SERVICE.DefaultDigitalCommerceCheckoutService = checkout;
  SERVICE.DefaultDigitalCommerceEntitlementService = digital;
  SERVICE.DefaultDigitalCommerceNotificationService = notifications;
  SERVICE.DefaultDigitalCommerceRefundService = refund;
  const participation = require('./participationFixture')();
  const privateRequests = new WeakSet();
  SERVICE.DefaultLoggerService = { hasPrivateCaptureProtection: r => privateRequests.has(r), isSensitiveRequest: r => privateRequests.has(r),
    inheritRequestPrivacy: (r, input) => { if (!privateRequests.has(input)) throw Error("No private provenance"); privateRequests.add(r); } };
  const runtimeScope = { projectCode: "project", environmentCode: "local", serverCode: "waste", instanceCode: "instance", assignmentCode: "assignment" };
  const runtime = { tenant: "t", principalType: "service", entCode: "runtime", serviceId: "waste-service", runtimeInstanceId: "instance",
    runtimeScope, permissions: ["commerce.digital.own.read"] };
  config.couponAcquisition.sourceProof = { enabled: true, runtimeRole: "COMMERCE", callers: [{ ...runtimeScope, tenant: "t",
    principalEnterpriseCode: "runtime", enterpriseCode: "issuer", serviceId: "waste-service", phases: ["reserve", "consume", "release"] }] };
  NODICS.getSelectedEnvironmentName = () => "local";
  SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: input => input.authData };
  const sourceRequest = { tenant: "t", authData: runtime }; privateRequests.add(sourceRequest);
  SERVICE.DefaultDigitalCommerceOwnershipService = { remote: async (input, phase, command) => {
    state.phases.push(phase);
    const action = phase.slice("coupon-".length);
    if (action !== "inspect") {
      const proof = await acquisition.sourceProof(sourceRequest, { ...command, enterpriseCode: input.enterpriseCode, phase: action });
      assert.deepEqual(proof.command, command); assert.equal(proof.allowed, true);
    }
    if (phase === "coupon-reserve") { state.reserved = true; if (state.failReserve) throw Error("lost hold acknowledgement"); }
    if (phase === "coupon-consume") { assert.equal(state.reserved, true); state.consumed = true; }
    if (phase === "coupon-release") { assert.equal(state.consumed, false); state.reserved = false; }
    return { contractVersion: 1, tenant: "t", enterpriseCode: "issuer", orderCode: command.orderCode, operationKey: command.operationKey,
      ownerRef: command.ownerRef, certificates: command.certificateCodes.map(code => ({ code, ownerRef: command.ownerRef,
        valid: true, consumed: state.consumed, available: !state.reserved && !state.consumed, categoryCode: "phone", milestoneCodes: ["RECYCLED"],
        ...(state.reserved && !state.consumed ? { reservationCode: command.operationKey } : {}),
        ...(state.consumed ? { consumedBy: command.operationKey, consumedOrderCode: command.orderCode } : {}) })) };
  } };
  for (const name of Object.keys(db)) SERVICE[name] = { get: async input => {
    const rows = db[name].filter(row => Object.entries(input.query || {}).every(([k, v]) => k.split('.').reduce((a, k) => a?.[k], row) === v));
    const start = ((input.searchOptions?.pageNumber || 1) - 1) * (input.searchOptions?.pageSize || 101);
    return { code: "SUC_READ", count: rows.length, result: structuredClone(rows.slice(start, start + (input.searchOptions?.pageSize || 101))) };
  }, save: async input => {
    if (db[name].some(v => v.code === input.model.code)) throw Error("duplicate");
    db[name].push(structuredClone(input.model)); return { code: "SUC_SAVE", result: structuredClone(input.model) };
  } };
  const finish = async () => {
    const reservations = await checkout.reserveForCheckout(r, { entries: [entry] });
    const sales = await checkout.confirmSale(r, db.DefaultCommerceOrderService[0], reservations);
    const deliveries = await checkout.deliver(r, db.DefaultCommerceOrderService[0], sales);
    db.DefaultCartService[0].active = false;
    db.DefaultCheckoutCheckpointService.push({ ...scope, code: "order", orderCode: "order", status: "COMPLETED",
      evidence: { orderCode: "order", digitalDeliveryCodes: deliveries.map(d => d.code) } });
    return { reservations, sales, deliveries, entitlement: db.DefaultDigitalEntitlementService[0] };
  };
  return { ...f, r, entry, db, state, config, finish, ownerRef, sourceRequest, privateRequests, participation, permissions };
}
/** Installs actual Waste coupon and revision owners behind the isolated transport; generated storage remains in memory. */
function realWaste(f) {
  const rows = { wasteAsset: new Map(), wasteAssetOwnershipEvent: new Map() };
  const original = { code: "certificate", active: true, revision: 0, assetStatus: "OWNED",
    ownerRef: { module: "profile", schema: f.ownerRef.type.toLowerCase(), code: f.ownerRef.code },
    originalOwnerRef: { module: "profile", schema: "customer", code: "contributor" }, physicalOwnerRef: { code: "custodian" },
    rewardSettlementRefs: [{ code: "original-reward" }], carbonSettlementRefs: [{ code: "original-carbon" }],
    custodyStatus: "RECYCLED", sourceSubmissionCode: "submission", metadata: {},
    verificationRef: { module: "wasteVerification", schema: "wasteVerification", code: "verification" } };
  rows.wasteAsset.set(original.code, structuredClone(original));
  const repositories = Object.fromEntries(Object.keys(rows).map(schema => [schema, {
    get: async r => ({ code: "SUC_GET", result: [...rows[schema].values()].filter(row => row.code === r.query.code).map(row => structuredClone(row)) }),
    save: async r => { assert.equal(r.options.insertOnly, true); if (rows[schema].has(r.model.code)) throw Error("duplicate");
      rows[schema].set(r.model.code, structuredClone(r.model)); return { code: "SUC_SAVE" }; },
    update: async r => { const row = rows[schema].get(r.query.code), matches = row?.revision === r.query.revision;
      if (schema === "wasteAsset" && r.query.code === f.state.failConsumeCode && r.model.assetStatus === "REDEEMED") throw Error("lost second certificate consume");
      if (matches) Object.assign(row, structuredClone(r.model), { revision: row.revision + 1 });
      return { code: "SUC_UPDATE", result: { matchedCount: matches ? 1 : 0 } }; },
  }]));
  SERVICE.DefaultWasteAssetTransferOperationService = wasteOperations;
  SERVICE.DefaultWasteCertificateBundleComponentService = wasteComponents;
  SERVICE.DefaultWastePersistenceService = { repository: s => repositories[s], context: r => ({ tenant: r.tenant }), records: r => r.result,
    list: async () => [{ code: "verification", active: true, submissionCode: "submission", verificationStatus: "APPROVED", verifiedCategoryCode: "phone" }] };
  const getModels = NODICS.getModels;
  NODICS.getModels = (module, tenant) => module !== "wasteCore" ? getModels(module, tenant) :
    Object.fromEntries(Object.keys(rows).map(s => [s, { primaryKey: "code", compareAndSetItem: () => {}, rawSchema: { waste: true } }]));
  SERVICE.DefaultModelConcurrencyService.getField = schema => schema?.waste ? "revision" : undefined;
  const getConfig = CONFIG.get;
  CONFIG.get = name => name === "waste" ? wasteDefaults.waste : getConfig(name);
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async r => r.apiName === "/internal/coupons/acquisition/source"
    ? { data: await acquisition.sourceProof(f.sourceRequest, r.requestBody) } : invoke(r);
  SERVICE.DefaultDigitalCommerceOwnershipService.remote = async (r, phase, command) => {
    f.state.phases.push(phase);
    const admitted = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, authData: { tokenType: "service", tenant: r.tenant },
      validateAuthority: () => { assert.equal(r.tenant, "t"); assert.equal(r.enterpriseCode, "issuer"); } };
    return wasteCoupon.invoke(admitted, command, phase.slice("coupon-".length));
  };
  return { rows, original };
}
module.exports = { setup, realWaste };
