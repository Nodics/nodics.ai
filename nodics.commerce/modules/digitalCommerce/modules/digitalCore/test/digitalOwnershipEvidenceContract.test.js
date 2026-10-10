/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/test/digitalOwnershipEvidenceContract
 * @description Actual Profile/runtime/privacy/schema admission with isolated generated persistence ports; not installed/native qualification.
 * @layer test @owner digitalCore
 */
const test = require("node:test"), assert = require("node:assert/strict");
const path = require("node:path");
const root = path.resolve(__dirname, "../../../../../..");
const owner = require("../src/service/defaultDigitalCommerceOwnershipEvidenceService");
const logger = require(path.join(root, "nodics.foundation/modules/nConfig/src/service/DefaultLoggerService"));
const runtime = require(path.join(root, "nodics.platform/modules/profile/src/service/identity/defaultRuntimeAuthorizationService"));
const token = require(path.join(root, "nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService"));
const identity = require(path.join(root, "nodics.foundation/modules/nAuth/src/service/identity/defaultIdentityGovernanceService"));
const access = require(path.join(root, "nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService"));
const pipeline = require(path.join(root, "nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService"));
const authDefaults = require(path.join(root, "nodics.foundation/modules/nAuth/config/properties"));
const routes = require("../src/router/routers").digitalCore.ownershipEvidence;
const copy = value => structuredClone(value);
const hash = "a".repeat(64), version = "b".repeat(64), digest = "c".repeat(64);

async function fixture(t) {
  const keys = ["CONFIG", "NODICS", "SERVICE", "CLASSES", "UTILS", "FACADE"];
  const prior = keys.map(key => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => prior.forEach(([key, value]) => value ? Object.defineProperty(global, key, value) : delete global[key]));
  global.CLASSES = { NodicsError: class extends Error { constructor(input) { super(typeof input === "object" ? input.message : input); this.code = typeof input === "object" ? input.code : input; } } };
  global.UTILS = { isBlank: object => !Object.keys(object).length };
  const policy = { enabled: true, runtimeRole: "COMMERCE", callers: [], bindingAdmission: {
    enabled: true, moduleName: "eWaste", connectionName: "waste", targetAuthority: "WASTE", apiName: "/internal/digital-listings/plan",
  } };
  const config = { digitalCore: { ownershipEvidence: policy }, runtimeRole: { code: "COMMERCE", publication: "OPERATIONAL" },
    product: { publication: { target: { runtimeRole: "COMMERCE" } } },
    log: { requestPrivacy: { qualified: true, captureMode: "disabled" } },
    identityGovernance: authDefaults.identityGovernance, authSecurity: authDefaults.authSecurity };
  global.CONFIG = { get: key => config[key] };
  global.NODICS = { getSelectedEnvironmentName: () => "circaLocal", getServerState: () => "started" };
  const assignment = { code: "waste-assignment", principalType: "service", principalCode: "waste-runtime", scopeType: "RUNTIME_DEPLOYMENT",
    tenantCode: "default", enterpriseCode: "default", status: "ACTIVE", effect: "ALLOW", inheritanceMode: "DIRECT",
    runtimeScope: { projectCode: "circa", environmentCode: "circaLocal", serverCode: "wasteCoreServer", instanceCode: "waste-instance",
      modules: ["digitalCore"], permissions: ["commerce.digital.own.read", "commerce.product.publish"] } };
  const groups = require("../config/properties").schemaPolicies.digitalCore.tenantOwned.accessGroups;
  const scope = { tenant: "default", enterpriseCode: "GREENPERKS_ONLINE" };
  const purchaseScope = { ...scope, ownerId: "circa-customer" };
  const providerReference = { assetCode: "asset", projectionCode: "waste-projection", storeCode: "circaMainStore",
    transferPolicyCode: "transfer-policy", rewardSettlementPolicyCode: "reward-policy", carbonSettlementPolicyCode: "carbon-policy",
    sellerRef: { module: "profile", schema: "customer", code: "seller" } };
  const pins = [{ locale: "en", code: "retained-product", sourceHash: hash, publicationVersion: version }];
  const records = {
    DefaultDigitalProductBindingService: [{ ...scope, code: "binding", active: true, revision: 0, status: "ACTIVE", productCode: "product", variantCode: "variant", sku: "sku",
      providerOwner: "wasteCore", digitalDeliveryType: "DIGITAL_OWNERSHIP", inventoryStrategy: "DIGITAL_COMMERCE", providerReference, evidence: { retainedProducts: pins } }],
    DefaultProductSearchProjectionService: [{ ...scope, code: "retained-product", active: true, status: "CURRENT", productCode: "product", storeCode: "circaMainStore", locale: "en",
      publicationVersion: version, sourceHash: hash, payload: { variantCodes: ["variant"], variantSkuMap: { variant: "sku" },
        localizedAttributes: { assetCode: "asset", productType: "DIGITAL", inventoryStrategy: "DIGITAL_COMMERCE", digitalDeliveryType: "DIGITAL_OWNERSHIP" } } }],
    DefaultStoreService: [{ tenant: "default", code: "circaMainStore", active: true, status: "ACTIVE", revision: 1,
      enterpriseRef: { module: "profile", schema: "enterprise", code: "GREENPERKS_ONLINE" } }],
    DefaultProductPublicationPointerService: [],
    DefaultCommerceOrderService: [{ ...purchaseScope, code: "order", active: true, status: "PLACED", cartCode: "cart", idempotencyKey: "checkout", evidence: { storeCode: "circaMainStore" } }],
    DefaultCommerceOrderEntryService: [{ ...purchaseScope, code: "order:original|entry", active: true, orderCode: "order", productCode: "product", sku: "sku", quantity: "1",
      idempotencyKey: "checkout:order-entry:original|entry", evidence: { digitalReservationCodes: ["transfer"] } }],
    DefaultPaymentTransactionEntryService: [{ ...purchaseScope, code: "order:capture", active: true, orderCode: "order", cartCode: "cart", status: "CAPTURED", evidence: { operation: "CAPTURE" } }],
    DefaultCheckoutCheckpointService: [{ ...purchaseScope, code: "checkout", active: true, idempotencyKey: "checkout", cartCode: "cart", status: "COMPLETED",
      evidence: { orderCode: "order", digitalReservationCodes: ["transfer"] } }],
    DefaultDigitalEntitlementService: [{ ...purchaseScope, code: "entitlement", active: true, orderCode: "order", orderEntryCode: "original|entry", productCode: "product", sku: "sku",
      digitalDeliveryType: "DIGITAL_OWNERSHIP", providerOwner: "wasteCore", providerCode: "transfer", evidence: { bindingCode: "binding", assetCode: "asset" } }],
    DefaultOrderLifecycleRequestService: [{ ...purchaseScope, code: "refund", active: true, orderCode: "order", requestType: "REFUND", status: "PENDING",
      evidence: { caseCode: "case", steps: { PAYMENT: { transactionCode: "refund-payment" } } } },
    { ...purchaseScope, code: "case", active: true, orderCode: "order", requestType: "DISPUTE", status: "OPEN" }],
    DefaultPaymentTransactionService: [{ ...purchaseScope, code: "refund-payment", active: true, orderCode: "order", status: "PENDING" }],
  };
  const calls = [], writes = [], remote = [];
  global.SERVICE = { DefaultLoggerService: logger, DefaultIdentityGovernanceService: identity, DefaultServiceTokenService: token,
    DefaultPrincipalScopeAssignmentService: { get: async () => ({ code: "SUC_TEST", result: [copy(assignment)] }) },
    DefaultProductPublicationTargetService: require(path.join(root, "nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductPublicationTargetService")),
    DefaultProductPublicationGraphService: require(path.join(root, "nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductPublicationGraphService")),
  };
  const pointerScope = { tenant: "default", productCode: "product", storeCode: "circaMainStore" };
  records.DefaultProductPublicationPointerService.push({ ...pointerScope, active: true, revision: 1, version, receipts: [],
    code: SERVICE.DefaultProductPublicationTargetService.scopeCode(pointerScope, { tenant: "default" }) });
  for (const name of Object.keys(records)) SERVICE[name] = { get: async request => {
    assert.equal(access.getAccessPoint(request.authData, groups), 10);
    assert.equal(request.authData.isSystem, true); assert.equal(request.options.recursive, false);
    calls.push({ name, request: copy(request) });
    const result = copy(records[name].filter(row => Object.entries(request.query).every(([key, value]) => row[key] === value)));
    return { code: "SUC_TEST", result, count: result.length };
  } };
  SERVICE.DefaultDigitalProductBindingService.save = async request => {
    assert.equal(request.options.insertOnly, true);
    assert.equal(access.getAccessPoint(request.authData, groups), 10);
    writes.push(copy(request));
    if (records.DefaultDigitalProductBindingService.some(row => row.code === request.model.code)) throw Error("duplicate");
    records.DefaultDigitalProductBindingService.push(copy(request.model));
    return { code: "SUC_TEST", result: copy(request.model) };
  };
  const claims = await runtime.authorize({ tenant: "default", authData: { tenant: "default", entCode: "default", principalType: "service", serviceId: "waste-runtime",
    permissions: assignment.runtimeScope.permissions }, headers: { "x-nodics-project": "circa", "x-nodics-environment": "circaLocal",
    "x-nodics-server": "wasteCoreServer", "x-nodics-runtime-instance": "waste-instance", "x-nodics-modules": "digitalCore" } });
  claims.tokenType = "service"; // ServiceToken.issue adds this field after Profile resolves the assignment.
  policy.callers.push({ tenant: claims.tenant, principalEnterpriseCode: claims.entCode, enterpriseCode: scope.enterpriseCode, serviceId: claims.serviceId,
    ...claims.runtimeScope, kinds: ["LISTING", "BINDING", "PURCHASE", "REFUND", "ADMIT_BINDING"] });
  const bindingInput = { contractVersion: 1, kind: "BINDING", enterpriseCode: scope.enterpriseCode,
    bindingCode: "binding", productCode: "product", sku: "sku", storeCode: "circaMainStore", locale: "en" };
  const purchaseInput = { ...bindingInput, kind: "PURCHASE", ownerId: "circa-customer", orderCode: "order", entryCode: "original|entry", checkoutIdempotencyKey: "checkout", providerCode: "transfer" };
  const selectors = { assetCode: "asset", productCode: "product", variantCode: "variant", sku: "sku", storeCode: "circaMainStore", transferPolicyCode: "transfer-policy",
    rewardSettlementPolicyCode: "reward-policy", carbonSettlementPolicyCode: "carbon-policy", idempotencyKey: "listing", locales: ["en"], expectedAssetRevision: 2 };
  const plan = { state: "READ_ONLY_DOMAIN_LISTING_PLAN", planDigest: digest, productCode: "product", variantCode: "variant", sku: "sku", expectedAssetRevision: 2,
    providerOwner: "wasteCore", digitalDeliveryType: "DIGITAL_OWNERSHIP", inventoryStrategy: "DIGITAL_COMMERCE", providerReference: copy(providerReference), evidence: { retainedProducts: copy(pins) } };
  SERVICE.DefaultModuleService = { invokeModule: async options => {
    remote.push(options); assert.deepEqual(options.targetAuthority, policy.bindingAdmission.targetAuthority); assert.equal(options.moduleName, "eWaste");
    assert.equal(options.apiName, "/internal/digital-listings/plan"); assert.equal(options.maxAttempts, 1);
    assert.equal(options.request.authData, undefined); assert.equal(options.header?.Authorization, undefined);
    assert.equal(options.header?.["X-Enterprise-Code"], undefined);
    assert.deepEqual(options.requestBody, { ...selectors, enterpriseCode: scope.enterpriseCode });
    return { data: copy(plan) };
  } };
  const request = () => ({ tenant: claims.tenant, authData: copy(claims), httpRequest: { headers: { "x-enterprise-code": claims.entCode } } });
  const run = (input = bindingInput, r = request(), operation = "query") => logger.runSensitiveOperation(r, () => owner[operation](r, input));
  return { policy, config, records, calls, writes, remote, claims, groups, request, run, bindingInput, purchaseInput, selectors, plan,
    admission: { contractVersion: 1, kind: "ADMIT_BINDING", enterpriseCode: scope.enterpriseCode, selectors, reviewedPlanDigest: digest } };
}

test("actual Profile group-free runtime passes protected route; generated ACL remains closed to original principal", async t => {
  const f = await fixture(t), r = f.request();
  assert.deepEqual(r.authData.userGroups, []);
  assert.equal(access.getAccessPoint(r.authData, f.groups), 0);
  for (const route of Object.values(routes)) {
    r.router = route; r.moduleName = "digitalCore";
    assert.equal(pipeline.hasAcceptedTokenType(r), true);
    assert.equal(pipeline.hasAccessGroup(r), true);
    assert.equal(pipeline.hasRoutePermission(r), true);
    assert.deepEqual(route.requestPrivacy, { sensitive: true }); assert.equal(route.cache.enabled, false);
  }
  const before = copy(r.authData), result = await f.run(f.bindingInput, r);
  assert.equal(result.binding.code, "binding"); assert.deepEqual(r.authData, before); assert.equal(f.writes.length, 0);
  assert.deepEqual(Object.keys(owner).sort(), ["admitBinding", "query"]);
});

test("real nAuth service issuance and signature verification preserve Profile's group-free approved claims", async t => {
  const f = await fixture(t), jwt = require("jsonwebtoken");
  const security = require(path.join(root, "nodics.foundation/modules/nAuth/src/service/security/defaultAuthSecurityService"));
  const signing = require(path.join(root, "nodics.foundation/modules/nAuth/src/service/authentication/defaultAuthenticationProviderService"));
  f.config.authSecurity = copy(f.config.authSecurity);
  f.config.authSecurity.jwt.secret = require("node:crypto").randomBytes(64).toString("hex");
  SERVICE.DefaultAuthSecurityService = security; SERVICE.DefaultAuthenticationProviderService = signing;
  // Only the security-stamp persistence port is isolated; Profile resolution, issuance, payload construction and JWT crypto are real source owners.
  const stamps = [];
  SERVICE.DefaultPrincipalSecurityStampService = { register: async (...args) => stamps.push(args) };
  const credential = await token.issue(f.claims);
  const verified = jwt.verify(credential, security.getJwtSecret(CONFIG), security.getVerifyOptions(CONFIG));
  assert.deepEqual(stamps, [["default", "waste-runtime", 1]]);
  assert.deepEqual(verified.userGroups || [], []); assert.deepEqual(verified.runtimeScope, f.claims.runtimeScope);
  const request = f.request(); request.authData = verified;
  assert.equal((await f.run(f.purchaseInput, request)).orders[0].ownerId, "circa-customer");
  const parts = credential.split("."); const changed = JSON.parse(Buffer.from(parts[1], "base64url").toString()); changed.entCode = "foreign";
  parts[1] = Buffer.from(JSON.stringify(changed)).toString("base64url");
  assert.throws(() => jwt.verify(parts.join("."), security.getJwtSecret(CONFIG), security.getVerifyOptions(CONFIG)));
});

for (const [label, change] of Object.entries({
  disabled: f => f.policy.enabled = false,
  role: f => f.config.runtimeRole.code = "WASTE",
  grant: f => f.policy.callers = [],
  duplicateGrant: f => f.policy.callers.push(copy(f.policy.callers[0])),
  permission: (f, r) => r.authData.permissions = [],
  module: (f, r) => r.authData.modules = ["eWaste"],
  human: (f, r) => r.authData.principalType = "customer",
  system: (f, r) => r.authData.isSystem = true,
  tenant: (f, r) => r.tenant = "foreign",
  tenantAlias: (f, r) => r.httpRequest.headers["x-tenant-code"] = "foreign",
  issuerAlias: (f, r) => r.httpRequest.headers["x-enterprise-code"] = "foreign",
  businessAsHeader: (f, r) => r.httpRequest.headers["x-enterprise-code"] = f.bindingInput.enterpriseCode,
  businessAsRequestEnterprise: (f, r) => r.enterpriseCode = f.bindingInput.enterpriseCode,
  businessAsRequestEntCode: (f, r) => r.entCode = f.bindingInput.enterpriseCode,
  deployment: (f, r) => r.authData.runtimeScope.assignmentCode = "foreign",
  staleInstance: (f, r) => r.authData.runtimeInstanceId = "foreign",
  foreignIssuer: (f, r, input) => input.enterpriseCode = "foreign",
  callerQuery: (f, r, input) => input.query = { tenant: "default" },
  callerSystem: (f, r, input) => input.authData = { isSystem: true },
  malformedSelector: (f, r, input) => input.bindingCode = { $ne: null },
})) test("refuses " + label + " before generated owner access", async t => {
  const f = await fixture(t), r = f.request(), input = copy(f.bindingInput); change(f, r, input);
  await assert.rejects(f.run(input, r)); assert.equal(f.calls.length, 0); assert.equal(f.writes.length, 0);
});

test("privacy flag and copied private request cannot admit a read", async t => {
  const f = await fixture(t), r = f.request(); r.sensitive = true;
  await assert.rejects(owner.query(r, f.bindingInput));
  await logger.runSensitiveOperation(r, () => assert.rejects(owner.query({ ...r }, f.bindingInput)));
  assert.equal(f.calls.length, 0);
});

for (const [label, change] of Object.entries({
  missingBinding: f => f.records.DefaultDigitalProductBindingService = [],
  duplicateBinding: f => f.records.DefaultDigitalProductBindingService.push(copy(f.records.DefaultDigitalProductBindingService[0])),
  foreignStore: f => f.records.DefaultStoreService[0].enterpriseRef.code = "foreign",
  foreignProduct: f => f.records.DefaultProductSearchProjectionService[0].enterpriseCode = "foreign",
  wrongSku: f => f.records.DefaultProductSearchProjectionService[0].payload.variantSkuMap.variant = "other",
  changedPin: f => f.records.DefaultProductSearchProjectionService[0].sourceHash = "f".repeat(64),
  wrongAsset: f => f.records.DefaultProductSearchProjectionService[0].payload.localizedAttributes.assetCode = "other",
  wrongProvider: f => f.records.DefaultDigitalProductBindingService[0].providerOwner = "other",
  wrongBuyer: f => f.records.DefaultCommerceOrderEntryService[0].ownerId = "other",
  wrongTransfer: f => f.records.DefaultCommerceOrderEntryService[0].evidence.digitalReservationCodes = ["other"],
  extraEntry: f => f.records.DefaultCommerceOrderEntryService.push({ ...f.records.DefaultCommerceOrderEntryService[0], code: "unrelated" }),
  wrongCheckout: f => f.records.DefaultCommerceOrderService[0].idempotencyKey = "other",
  wrongCheckpoint: f => f.records.DefaultCheckoutCheckpointService[0].evidence.orderCode = "other",
})) test("refuses retained evidence drift: " + label, async t => {
  const f = await fixture(t); change(f); await assert.rejects(f.run(f.purchaseInput)); assert.equal(f.writes.length, 0);
});

test("exact purchase preserves original buyer and entry identity; historical pins do not read current publication", async t => {
  const f = await fixture(t); f.records.DefaultProductSearchProjectionService[0].status = "STALE";
  const result = await f.run(f.purchaseInput);
  assert.equal(result.orders[0].ownerId, "circa-customer"); assert.equal(result.entries[0].code, "order:original|entry");
  assert.equal(result.payments[0].status, "CAPTURED"); assert.equal(f.calls.some(call => call.name === "DefaultProductPublicationPointerService"), false); assert.equal(f.writes.length, 0);
});

test("compensation checkpoint uses retained intent rather than nonexistent enterprise/order columns", async t => {
  const f = await fixture(t); f.records.DefaultCommerceOrderService = []; f.records.DefaultCommerceOrderEntryService = [];
  f.records.DefaultCheckoutCheckpointService = [{ tenant: "default", ownerId: "circa-customer", code: "checkout", idempotencyKey: "checkout", status: "COMPENSATION_REQUIRED",
    evidence: { paymentCompensationIntent: { tenant: "default", enterpriseCode: "GREENPERKS_ONLINE", ownerId: "circa-customer", orderCode: "order", cartCode: "cart" },
      compensation: [{ type: "DIGITAL_OWNERSHIP_RELEASE", code: "transfer", status: "FAILED" }] } }];
  const result = await f.run(f.purchaseInput); assert.equal(result.orders.length, 0); assert.equal(result.checkpoints[0].status, "COMPENSATION_REQUIRED");
  f.records.DefaultCheckoutCheckpointService[0].evidence.paymentCompensationIntent.enterpriseCode = "foreign";
  await assert.rejects(f.run(f.purchaseInput));
});

test("compensation purchase reads require explicit original-order entitlement absence evidence", async t => {
  const f = await fixture(t);
  const checkpoint = f.records.DefaultCheckoutCheckpointService[0];
  checkpoint.status = "COMPENSATION_REQUIRED";
  checkpoint.evidence = { paymentCompensationIntent: { tenant: "default", enterpriseCode: "GREENPERKS_ONLINE",
    ownerId: "circa-customer", orderCode: "order", cartCode: "cart" },
    compensation: [{ type: "DIGITAL_OWNERSHIP_RELEASE", code: "transfer", status: "FAILED" }] };
  const present = await f.run(f.purchaseInput);
  assert.equal(present.entitlements[0].code, "entitlement");
  f.records.DefaultDigitalEntitlementService = [];
  assert.deepEqual((await f.run(f.purchaseInput)).entitlements, []);
  const read = f.calls.filter(call => call.name === "DefaultDigitalEntitlementService").at(-1);
  assert.deepEqual(read.request.query, { tenant: "default", enterpriseCode: "GREENPERKS_ONLINE", ownerId: "circa-customer", orderCode: "order" });
  assert.equal(f.writes.length, 0);
  const get = SERVICE.DefaultDigitalEntitlementService.get;
  for (const change of [result => { delete result.count; }, result => { result.count = "0"; }, result => { result.count = 1; },
    result => { result.code = "ERR_GET"; }, result => { result.acknowledged = false; }]) {
    SERVICE.DefaultDigitalEntitlementService.get = async request => { const result = await get(request); change(result); return result; };
    await assert.rejects(f.run(f.purchaseInput));
  }
});

test("compensation entitlement evidence refuses a different original reservation or duplicate order unit", async t => {
  const f = await fixture(t), checkpoint = f.records.DefaultCheckoutCheckpointService[0];
  checkpoint.status = "COMPENSATION_REQUIRED";
  checkpoint.evidence = { paymentCompensationIntent: { tenant: "default", enterpriseCode: "GREENPERKS_ONLINE",
    ownerId: "circa-customer", orderCode: "order", cartCode: "cart" },
    compensation: [{ type: "DIGITAL_OWNERSHIP_RELEASE", code: "transfer", status: "FAILED" }] };
  const entitlement = f.records.DefaultDigitalEntitlementService[0];
  entitlement.providerCode = "other-transfer";
  await assert.rejects(f.run(f.purchaseInput));
  entitlement.providerCode = "transfer";
  f.records.DefaultDigitalEntitlementService.push({ ...copy(entitlement), code: "other" });
  await assert.rejects(f.run(f.purchaseInput));
});

test("refund query reads persisted pending evidence without granting approval or mutating owners", async t => {
  const f = await fixture(t), result = await f.run({ ...f.purchaseInput, kind: "REFUND", entitlementCode: "entitlement", refundCode: "refund" });
  assert.equal(result.refunds[0].status, "PENDING"); assert.equal(result.cases[0].code, "case"); assert.equal(result.transactions[0].status, "PENDING");
  assert.equal(f.writes.length, 0); assert.equal(f.remote.length, 0);
});

test("foreign generated row, failed envelope and authorization drift refuse before success", async t => {
  const f = await fixture(t), original = SERVICE.DefaultStoreService.get;
  SERVICE.DefaultStoreService.get = async () => ({ code: "SUC_TEST", result: [{ ...copy(f.records.DefaultStoreService[0]), tenant: "foreign" }] });
  await assert.rejects(f.run());
  SERVICE.DefaultStoreService.get = async () => ({ code: "ERR_TEST", result: copy(f.records.DefaultStoreService) });
  await assert.rejects(f.run());
  const r = f.request(); SERVICE.DefaultStoreService.get = async request => { const result = await original(request); r.authData.permissions = []; return result; };
  await assert.rejects(f.run(f.bindingInput, r)); assert.equal(f.writes.length, 0);
});

test("LISTING reads current exact Product pins without requiring an existing binding", async t => {
  const f = await fixture(t); f.records.DefaultDigitalProductBindingService = [];
  const result = await f.run({ contractVersion: 1, kind: "LISTING", enterpriseCode: "GREENPERKS_ONLINE",
    productCode: "product", variantCode: "variant", sku: "sku", storeCode: "circaMainStore", assetCode: "asset", locales: ["en"] });
  assert.deepEqual(result.retainedProducts, f.plan.evidence.retainedProducts); assert.equal(f.calls.filter(value => value.name === "DefaultProductPublicationPointerService").length, 2);
  assert.equal(f.writes.length, 0);
});

test("binding admission persists insert-only exact domain-reviewed model, replays and recovers lost response", async t => {
  const f = await fixture(t); f.records.DefaultDigitalProductBindingService = [];
  const original = SERVICE.DefaultDigitalProductBindingService.save;
  SERVICE.DefaultDigitalProductBindingService.save = async request => { await original(request); throw Error("lost response"); };
  const result = await f.run(f.admission, f.request(), "admitBinding");
  assert.equal(result.state, "BINDING_ADMITTED"); assert.match(result.binding.code, /^digitalBinding:[a-f0-9]{64}$/);
  const again = await f.run(f.admission, f.request(), "admitBinding");
  assert.equal(again.binding.code, result.binding.code); assert.equal(f.writes.length, 1); assert.equal(f.remote.length, 2);
  const binding = await f.run({ ...f.bindingInput, bindingCode: result.binding.code }); assert.equal(binding.binding.code, result.binding.code);
});

test("outgoing listing and all sale/refund phases retain default runtime authority and exact body business scope", async t => {
  const f = await fixture(t);
  const ownership = require("../src/service/defaultDigitalCommerceOwnershipService");
  const sale = require(path.join(root, "nodics.accelerators/modules/waste/modules/eWaste/src/service/defaultEWasteDigitalSaleService"));
  const saleController = require(path.join(root, "nodics.accelerators/modules/waste/modules/eWaste/src/controller/defaultEWasteDigitalSaleController"));
  const listingController = require(path.join(root, "nodics.accelerators/modules/waste/modules/eWaste/src/controller/defaultEWasteDigitalListingController"));
  const runtimeScope = { projectCode: "circa", environmentCode: "circaLocal", serverCode: "commerceServer", instanceCode: "commerce-instance",
    modules: ["eWaste"], permissions: ["waste.asset.sale.transfer", "waste.asset.marketplace.project"] };
  SERVICE.DefaultPrincipalScopeAssignmentService.get = async () => ({ code: "SUC_TEST", result: [{ code: "commerce-assignment",
    principalType: "service", principalCode: "commerce-runtime", scopeType: "RUNTIME_DEPLOYMENT", tenantCode: "default", enterpriseCode: "default",
    status: "ACTIVE", effect: "ALLOW", inheritanceMode: "DIRECT", runtimeScope }] });
  const claims = await runtime.authorize({ tenant: "default", authData: { tenant: "default", entCode: "default", principalType: "service",
    serviceId: "commerce-runtime", permissions: runtimeScope.permissions }, headers: { "x-nodics-project": "circa", "x-nodics-environment": "circaLocal",
    "x-nodics-server": "commerceServer", "x-nodics-runtime-instance": "commerce-instance", "x-nodics-modules": "eWaste" } });
  claims.tokenType = "service";
  const before = copy(claims), calls = [];
  f.config.eWaste = { marketplace: { digitalOwnership: { allowedServicePrincipals: [claims.serviceId], businessCallers: [{
    tenant: claims.tenant, principalEnterpriseCode: claims.entCode, enterpriseCode: "GREENPERKS_ONLINE", serviceId: claims.serviceId,
    ...claims.runtimeScope, permissions: runtimeScope.permissions,
  }] } } };
  f.config.digitalCore.digitalOwnership = { enabled: true, qualified: true, owner: { moduleName: "eWaste", connectionName: "waste",
    targetAuthority: "WASTE", apiPrefix: "/internal/digital-sales" } };
  SERVICE.DefaultSecuredRequestPipelineService = pipeline;
  // Transport and domain dispatch are isolated; actual Profile claims, private provenance and eWaste admission execute.
  SERVICE.DefaultEWasteDigitalSaleService = { invoke: async (input, phase) => {
    const admitted = sale.authority(input, "waste.asset.sale.transfer"); sale.recheckAuthority(admitted);
    assert.equal(admitted.enterpriseCode, "GREENPERKS_ONLINE"); assert.equal(admitted.authData.entCode, "default");
    return { phase, enterpriseCode: admitted.enterpriseCode };
  } };
  SERVICE.DefaultEWasteDigitalListingService = { plan: async input => {
    const admitted = sale.authority(input, "waste.asset.marketplace.project"); sale.recheckAuthority(admitted);
    assert.deepEqual(admitted.payload, f.selectors);
    return copy(f.plan);
  } };
  SERVICE.DefaultModuleService.invokeModule = async options => {
    calls.push(copy(options));
    assert.equal(options.header?.["X-Enterprise-Code"], undefined); assert.equal(options.header?.["x-enterprise-code"], undefined);
    assert.equal(options.header?.Authorization, undefined); assert.equal(options.authToken, undefined);
    assert.deepEqual(options.request, { tenant: "default" }); assert.equal(options.requestBody.enterpriseCode, "GREENPERKS_ONLINE");
    assert.equal(options.maxAttempts, 1);
    const listing = options.apiName === "/internal/digital-listings/plan";
    const request = { tenant: "default", enterpriseCode: "default", entCode: "default", authData: claims,
      httpRequest: { headers: { "x-enterprise-code": "default" }, body: options.requestBody,
        params: { phase: listing ? "plan" : options.apiName.split("/").at(-1) } } };
    return logger.runSensitiveOperation(request, () => (listing ? listingController : saleController).invoke(request));
  };
  const request = { tenant: "default", enterpriseCode: "GREENPERKS_ONLINE",
    authData: { tenant: "default", entCode: "GREENPERKS_ONLINE", principalType: "customer", tokenType: "access", loginId: "circa-customer" } };
  const original = copy(request), payload = { idempotencyKey: "original-key" };
  for (const phase of ["availability", "reserve", "confirm", "deliver", "cancel", "refund-preview", "refund-prepare", "refund-settle", "refund-complete"])
    assert.equal((await ownership.remote(request, phase, payload)).phase, phase);
  assert.deepEqual(request, original); assert.deepEqual(payload, { idempotencyKey: "original-key" });
  const count = calls.length;
  await assert.rejects(ownership.remote(request, "reserve", { ...payload, enterpriseCode: "foreign" }), /business scope changed/);
  assert.equal(calls.length, count);
  f.records.DefaultDigitalProductBindingService = [];
  assert.equal((await f.run(f.admission, f.request(), "admitBinding")).state, "BINDING_ADMITTED");
  assert.equal(calls.length, count + 1); assert.deepEqual(claims, before); assert.deepEqual(claims.userGroups, []);
  f.config.eWaste.marketplace.digitalOwnership.businessCallers = [];
  await assert.rejects(ownership.remote(request, "reserve", payload), /authority is unavailable/);
});

for (const alias of ["enterpriseCode", "entCode", "header"]) test("binding admission rechecks original principal " + alias + " after domain await", async t => {
  const f = await fixture(t), request = f.request(); f.records.DefaultDigitalProductBindingService = [];
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async options => {
    const result = await invoke(options);
    if (alias === "header") request.httpRequest.headers["x-enterprise-code"] = "GREENPERKS_ONLINE";
    else request[alias] = "GREENPERKS_ONLINE";
    return result;
  };
  await assert.rejects(f.run(f.admission, request, "admitBinding"), { code: "ERR_DIGITAL_OWNERSHIP_EVIDENCE" });
  assert.equal(f.calls.length, 0); assert.equal(f.writes.length, 0);
});

for (const [label, change] of Object.entries({
  digest: f => f.plan.planDigest = "f".repeat(64),
  assetRevision: f => f.plan.expectedAssetRevision = 3,
  policy: f => f.plan.providerReference.transferPolicyCode = "foreign",
  pins: f => f.plan.evidence.retainedProducts[0].sourceHash = "f".repeat(64),
  callerRecord: f => f.admission.selectors.model = { isSystem: true },
  disabledAdmission: f => f.policy.bindingAdmission.enabled = false,
  missingPublishPermission: f => f.claims.permissions = ["commerce.digital.own.read"],
  pointerDrift: () => { let calls = 0; const original = SERVICE.DefaultProductPublicationPointerService.get;
    SERVICE.DefaultProductPublicationPointerService.get = async request => { const result = await original(request); result.result[0].revision = ++calls; return result; }; },
  failedPointer: () => SERVICE.DefaultProductPublicationPointerService.get = async () => ({ code: "ERR_TEST", result: [] }),
  failedEnvelope: () => SERVICE.DefaultModuleService.invokeModule = async () => ({ code: "ERR_TEST", data: {} }),
})) test("binding admission refuses " + label + " without a write", async t => {
  const f = await fixture(t); f.records.DefaultDigitalProductBindingService = []; change(f);
  await assert.rejects(f.run(f.admission, f.request(), "admitBinding")); assert.equal(f.writes.length, 0);
});

test("conflicting existing binding and absent save readback cannot be admitted", async t => {
  const f = await fixture(t);
  await assert.rejects(f.run(f.admission, f.request(), "admitBinding")); assert.equal(f.writes.length, 0);
  f.records.DefaultDigitalProductBindingService = []; SERVICE.DefaultDigitalProductBindingService.save = async () => ({ code: "SUC_TEST", result: {} });
  await assert.rejects(f.run(f.admission, f.request(), "admitBinding"));
});

test("controller preserves exact private request and response is no-store; unprotected entry refuses", async t => {
  const f = await fixture(t), controller = require("../src/controller/defaultDigitalCommerceOwnershipEvidenceController");
  global.FACADE = { DefaultDigitalCommerceOwnershipEvidenceFacade: require("../src/facade/defaultDigitalCommerceOwnershipEvidenceFacade") };
  SERVICE.DefaultDigitalCommerceOwnershipEvidenceService = owner;
  const r = f.request(), headers = {}; r.httpRequest.body = f.bindingInput; r.httpResponse = { setHeader: (name, value) => headers[name] = value };
  assert.equal((await logger.runSensitiveOperation(r, () => controller.query(r))).data.binding.code, "binding");
  assert.equal(headers["Cache-Control"], "no-store");
  await assert.rejects(controller.query(f.request()), { code: "ERR_DIGITAL_OWNERSHIP_EVIDENCE" });
});

test("independent binding admissions race without updating an existing binding", async t => {
  const f = await fixture(t); f.records.DefaultDigitalProductBindingService = [];
  const results = await Promise.all([f.run(f.admission, f.request(), "admitBinding"), f.run(f.admission, f.request(), "admitBinding")]);
  assert.equal(results[0].binding.code, results[1].binding.code); assert.equal(f.records.DefaultDigitalProductBindingService.length, 1);
  assert(f.writes.every(write => write.options.insertOnly === true));
});

test("binding admission preserves canonical exact target server/role selection and refuses incomplete authority", async t => {
  const f = await fixture(t); f.records.DefaultDigitalProductBindingService = [];
  f.policy.bindingAdmission.targetAuthority = { server: "wasteServer", runtimeRole: { code: "WASTE", publication: "OPERATIONAL" } };
  assert.equal((await f.run(f.admission, f.request(), "admitBinding")).state, "BINDING_ADMITTED");
  assert.deepEqual(f.remote[0].targetAuthority, f.policy.bindingAdmission.targetAuthority);
  for (const authority of [{}, { server: "wasteServer" }, { server: "wasteServer", runtimeRole: { code: "WASTE", publication: "STAGED" } }]) {
    f.policy.bindingAdmission.targetAuthority = authority;
    const before = f.remote.length; await assert.rejects(f.run(f.admission, f.request(), "admitBinding"));
    assert.equal(f.remote.length, before);
  }
});

test("current eWaste consumer selectors and fixed transport interoperate with actual protected Commerce owner", async t => {
  const f = await fixture(t);
  const sale = require(path.join(root, "nodics.accelerators/modules/waste/modules/eWaste/src/service/defaultEWasteDigitalSaleService"));
  const event = { code: "transfer", metadata: { digitalSale: { command: { ...f.purchaseInput, binding: { code: "binding" } } } } };
  SERVICE.DefaultModuleService.invokeModule = async options => {
    assert.equal(options.moduleName, "digitalCore"); assert.equal(options.apiName, "/internal/ownership/evidence/query");
    assert.equal(options.request.authData, undefined); assert.equal(options.header["X-Enterprise-Code"], undefined);
    assert.equal(options.requestBody.enterpriseCode, "GREENPERKS_ONLINE");
    return { data: await f.run(options.requestBody) };
  };
  const r = { tenant: "default", enterpriseCode: "GREENPERKS_ONLINE", settings: { targets: { commerce: "COMMERCE" } }, payload: { idempotencyKey: "checkout" } };
  const result = await sale.purchaseEvidence(r, event);
  assert.equal(result.orders[0].ownerId, "circa-customer"); assert.equal(result.entries[0].code, "order:original|entry");
  assert.equal(f.writes.length, 0);
});

test("actual generated insert-only initializer accepts admitted binding with create-only semantics", async t => {
  const f = await fixture(t); f.records.DefaultDigitalProductBindingService = [];
  const saveOwner = require(path.join(root, "nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService"));
  const operations = [];
  SERVICE.DefaultModelConcurrencyService = { getField: () => undefined };
  SERVICE.DefaultDigitalProductBindingService.save = async request => {
    assert.equal(access.getAccessPoint(request.authData, f.groups), 10);
    const schemaModel = { rawSchema: {}, versioned: false, compareAndSetItem: async operation => {
      operations.push(copy(operation)); f.records.DefaultDigitalProductBindingService.push(copy(operation.model));
      return { acknowledged: true, matchedCount: 1 };
    } };
    return saveOwner.insertModel({ ...request, schemaModel });
  };
  assert.equal((await f.run(f.admission, f.request(), "admitBinding")).state, "BINDING_ADMITTED");
  assert.equal(operations.length, 1); assert.equal(operations[0].insertOnly, true); assert.equal(operations[0].operation, "create");
});
