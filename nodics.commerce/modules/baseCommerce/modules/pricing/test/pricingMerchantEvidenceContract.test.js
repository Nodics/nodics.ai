/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module pricing/test/pricingMerchantEvidenceContract @description Isolated native published pricing, exact runtime/business admission, source membership and no-fallback fixtures. @layer test @owner pricing */
const test = require("node:test"),
  assert = require("node:assert/strict");
const owner = require("../src/service/defaultPricingMerchantEvidenceService");
const exact = require("../src/service/defaultExactAmountService");
const selector = require("../src/service/defaultPriceSelectionService");
const decision = require("../src/service/defaultPricingDecisionService");
/** Creates canonical fixture doubles, not runtime/sample imports. @param {Object} t Test context. @returns {Object} Source records and signed input. */
function fixture(t) {
  const previous = {
    SERVICE: global.SERVICE,
    CONFIG: global.CONFIG,
    CLASSES: global.CLASSES,
    UTILS: global.UTILS,
    NODICS: global.NODICS,
  };
  t.after(() => Object.assign(global, previous));
  global.CLASSES = { NodicsError: class extends Error {} };
  const auth = {
      principalType: "service",
      entCode: "issuer",
      modules: ["pricing", "promotion"],
      permissions: ["commerce.pricing.merchant.evidence"],
    },
    coupon = {
      code: "coupon",
      tenant: "tenant",
      active: true,
      soldTo: "buyer",
      soldAt: "2026-01-01T00:00:00Z",
      validTo: "2099-01-01T00:00:00Z",
      status: "DELIVERED",
      promotionCode: "offer",
      issuerEnterpriseRef: {
        moduleName: "profile",
        schemaName: "enterprise",
        code: "issuer",
      },
    },
    store = {
      code: "outlet",
      tenant: "tenant",
      active: true,
      status: "ACTIVE",
      revision: 1,
      defaultCurrency: "AED",
      enterpriseRef: {
        moduleName: "profile",
        schemaName: "enterprise",
        code: "issuer",
      },
    },
    cart = {
      code: "basket",
      tenant: "tenant",
      enterpriseCode: "issuer",
      ownerId: "buyer",
      storeCode: "outlet",
      active: true,
      status: "CALCULATED",
      revision: 2,
      currency: "AED",
      totalAmount: "0.01",
    },
    entries = [
      {
        code: "line",
        tenant: "tenant",
        enterpriseCode: "issuer",
        ownerId: "buyer",
        cartCode: "basket",
        active: true,
        status: "ACTIVE",
        revision: 1,
        productCode: "product",
        quantity: "2",
        unitAmount: "0.01",
      },
    ],
    records = [
      {
        schema: "priceBook",
        policy: {
          code: "book",
          tenant: "tenant",
          enterpriseCode: "issuer",
          currency: "AED",
          status: "ACTIVE",
        },
      },
      {
        schema: "priceRow",
        policy: {
          code: "price",
          tenant: "tenant",
          enterpriseCode: "issuer",
          priceBookCode: "book",
          productCode: "product",
          currency: "AED",
          unitAmount: "12.5",
        },
      },
    ];
  const generated = (get) => ({
    get: async ({ query }) => ({
      code: "SUC_READ",
      result: get().filter((row) =>
        Object.keys(query).every((key) => row[key] === query[key]),
      ),
    }),
  });
  global.CONFIG = { get: () => ({ merchantEvidence: { qualified: true } }) };
  global.SERVICE = {
    DefaultLoggerService: { hasPrivateCaptureProtection: () => true },
    DefaultServiceTokenService: { requireRuntimePrincipal: () => auth },
    DefaultModuleService: { isLocalModuleActive: () => true },
    DefaultModuleRegistrationAgentService: {
      assertModuleOperational: async () => {},
    },
    DefaultPromotionOperationService: { requireOperationalRuntime: () => true },
    DefaultCouponService: generated(() => [coupon]),
    DefaultStoreService: generated(() => [store]),
    DefaultCartService: generated(() => [cart]),
    DefaultCartEntryService: generated(() => entries),
    DefaultPricingPublicationService: {
      deliveryEnabled: () => true,
      readConfigured: async () => records,
    },
    DefaultExactAmountService: exact,
    DefaultPriceSelectionService: selector,
    DefaultPricingDecisionService: decision,
    DefaultPriceRowService: {
      get: () => assert.fail("mutable source fallback"),
    },
  };
  return {
    auth,
    coupon,
    store,
    cart,
    entries,
    records,
    input: {
      tenant: "tenant",
      authData: auth,
      payload: {
        couponCode: "coupon",
        storeCode: "outlet",
        sourceReference: "CART:basket",
      },
    },
  };
}
test("native default uses canonical membership and published prices, not stored/client totals", async (t) => {
  const f = fixture(t),
    result = await owner.evaluate(f.input);
  assert.equal(result.ownerId, "buyer");
  assert.equal(result.subtotalAmount, "25");
  assert.equal(result.sourceStage, "PRICED_CART");
  assert.match(result.sourceHash, /^[a-f0-9]{64}$/);
  await assert.rejects(
    owner.evaluate({
      ...f.input,
      payload: { ...f.input.payload, subtotalAmount: "1" },
    }),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
});
test("wrong caller, buyer, outlet and unqualified/local-shadow owners refuse", async (t) => {
  const f = fixture(t);
  f.auth.permissions = [];
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  f.auth.permissions = ["commerce.pricing.merchant.evidence"];
  f.cart.ownerId = "other";
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  f.cart.ownerId = "buyer";
  f.store.enterpriseRef.code = "other";
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  f.store.enterpriseRef.code = "issuer";
  global.CONFIG.get = () => ({ merchantEvidence: { qualified: false } });
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  global.CONFIG.get = () => ({ merchantEvidence: { qualified: true } });
  global.SERVICE.DefaultModuleService.isLocalModuleActive = () => false;
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
});
test("publication disabled, competing tiers, variants and incomplete envelopes never fall back", async (t) => {
  const f = fixture(t);
  global.SERVICE.DefaultPricingPublicationService.deliveryEnabled = () => false;
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  global.SERVICE.DefaultPricingPublicationService.deliveryEnabled = () => true;
  f.records.push({
    schema: "priceRow",
    policy: { ...f.records[1].policy, code: "competing" },
  });
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  f.records.pop();
  f.entries[0].variantCode = "unsupported";
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
  delete f.entries[0].variantCode;
  global.SERVICE.DefaultCartEntryService.get = async () => ({
    code: "SUC_READ",
    result: f.entries,
    total: 2,
  });
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
});
test("canonical source drift during evidence evaluation refuses", async (t) => {
  const f = fixture(t);
  let reads = 0;
  global.SERVICE.DefaultCartService.get = async () => ({
    code: "SUC_READ",
    result: [{ ...f.cart, revision: ++reads === 1 ? 2 : 3 }],
  });
  await assert.rejects(
    owner.evaluate(f.input),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
});
test("private capture absence and caller flags do not authorize source reads", async (t) => {
  const f = fixture(t);
  global.SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => false;
  global.SERVICE.DefaultCouponService.get = () =>
    assert.fail("no private source read");
  await assert.rejects(
    owner.evaluate({ ...f.input, requestPrivacy: { sensitive: true } }),
    /ERR_PRICING_MERCHANT_UNCONFIRMED/,
  );
});
test("native handle rejects at-sign and invalid delimiters before canonical reads", async (t) => {
  const f = fixture(t);
  global.SERVICE.DefaultCouponService.get = () =>
    assert.fail("invalid handle cannot read coupon");
  for (const sourceReference of [
    "CART:bad@code",
    "CART:bad/code",
    "CART:bad:code",
    "CART:bad code",
    "CART:",
    "CART:" + "a".repeat(115),
  ])
    await assert.rejects(
      owner.evaluate({
        ...f.input,
        payload: { ...f.input.payload, sourceReference },
      }),
      /ERR_PRICING_MERCHANT_UNCONFIRMED/,
    );
});

/** Combines real Promotion receipt/consent owners with the native Pricing fixture; installed/native ports remain explicit isolated doubles. @param {Object} t Test context. @returns {Object} Exact delegated issuance and canonical source state. */
function delegatedFixture(t) {
  const f = fixture(t);
  const secure = require('../../promotion/src/service/defaultCouponSecureIssuanceService');
  const seller = require('../../promotion/src/service/defaultCouponSellerAuthorizationService');
  const scope = require('../../promotion/src/service/defaultPromotionMerchantScopeService');
  const policy = require('../../promotion/src/service/defaultPromotionSellerPolicyService');
  const publication = require('../../promotion/src/service/defaultPromotionPublicationService');
  const operation = require('../../promotion/src/service/defaultPromotionOperationService');
  const runtime = require('../../../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService');
  const generatedGet = require('../../../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');
  const access = require('../../../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
  const ownership = require('../../../../../../nodics.foundation/modules/nDatabase/database/src/service/access/defaultRecordOwnershipPolicyService');
  const readPolicy = require('../../../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService');
  const schemas = require('../../promotion/src/schemas/schemas').promotion;
  const schemaPolicy = require('../../promotion/config/properties').schemaPolicies.promotion.tenantOwned;
  Object.assign(f.auth, { tokenType: 'service', tenant: 'tenant', serviceId: 'promotion-runtime',
    runtimeInstanceId: 'fixture-runtime', runtimeScope: { instanceCode: 'fixture-runtime', projectCode: 'fixture',
      environmentCode: 'test', serverCode: 'commerce', assignmentCode: 'fixture-assignment' },
    userGroups: ['serviceAccountUserGroup'] });
  global.UTILS = { isBlank: value => !value || !Object.keys(value).length };
  global.NODICS = { getServerState: () => 'started' };
  f.couponReads = [];
  const ref = code => ({ moduleName: 'profile', schemaName: 'enterprise', code });
  const proof = { issuerEnterpriseCode: 'issuer', sellerEnterpriseCode: 'vendor', promotionCode: 'offer', grantRevision: 1 };
  Object.assign(f.coupon, { code: 'batch:1', enterpriseCode: 'vendor', enterpriseRef: ref('vendor'),
    vendorEnterpriseRef: ref('vendor'), productCode: 'coupon-product', orderCode: 'original-order', batchCode: 'batch',
    secureIssuanceCode: 'batch', revision: 2, tokenHash: 'a'.repeat(64), protectedToken: { ciphertext: 'retained-ciphertext' },
    sellerAuthorizationProof: proof });
  f.input.payload.couponCode = f.coupon.code;
  f.batch = { code: 'batch', tenant: 'tenant', enterpriseCode: 'vendor', enterpriseRef: ref('vendor'),
    issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('vendor'), promotionCode: 'offer', issuedCount: 1,
    secureIssuance: { createdAt: '2026-01-01T00:00:00.000Z', command: {
      tenant: 'tenant', enterpriseCode: 'issuer', promotionCode: 'offer', batchCode: 'batch', storeCode: 'marketplace',
      rootCode: 'offer', actorId: 'issuer-admin', commandReference: 'issuance-original', quantity: 1,
      policyFingerprint: 'b'.repeat(64), contribution: { moduleName: 'fixture', releaseCode: 'sample-v001', version: '0.0.1', checksum: 'c'.repeat(64) },
      issuanceAuthority: { issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('vendor'), sellerAuthorizationProof: proof },
    }, units: [{ code: f.coupon.code, tokenHash: f.coupon.tokenHash,
      protectedFingerprint: publication.fingerprint(f.coupon.protectedToken) }] } };
  f.campaign = { tenant: 'tenant', code: 'offer', enterpriseCode: 'issuer', active: true, status: 'ACTIVE', revision: 1,
    issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('vendor'), sellerAuthorizations: [{
      issuerEnterpriseCode: 'issuer', sellerEnterpriseCode: 'vendor', status: 'ACTIVE', revision: 1,
      expiresAt: '2099-01-01T00:00:00.000Z' }] };
  const protectedRead = schemaName => async request => {
    const model = { moduleName: 'promotion', schemaName, rawSchema: { ...structuredClone(schemas[schemaName]), ...schemaPolicy } };
    const receiver = { ...generatedGet, LOG: { debug() {} } };
    request.schemaModel = model;
    await new Promise((resolve, reject) => receiver.checkAccess(request, {}, {
      nextSuccess: resolve, error: (_request, _response, error) => reject(error) }));
    await readPolicy.providerRead(request, model);
    const row = schemaName === 'coupon' ? f.coupon : f.batch;
    const response = { success: { result: Object.entries(request.query).every(([key, value]) => row[key] === value)
      ? [structuredClone(row)] : [] } };
    if (schemaName === 'coupon') f.couponReads.push({ query: structuredClone(request.query), authData: structuredClone(request.authData) });
    await readPolicy.providerResult(request, response, model);
    return { code: 'SUC_READ', result: response.success.result };
  };
  CONFIG.get = key => key === 'accessPoints' ? { readAccessPoint: 1, fullAccessPoint: 10 }
    : key === 'promotion' ? { sellerAuthorization: { enabled: true, qualified: true, maximumSellers: 10 } }
    : { merchantEvidence: { qualified: true } };
  Object.assign(SERVICE, {
    DefaultCouponService: { get: protectedRead('coupon') }, DefaultCouponBatchService: { get: protectedRead('couponBatch') },
    DefaultServiceTokenService: runtime,
    DefaultSchemaAccessHandlerService: access, DefaultRecordOwnershipPolicyService: ownership,
    DefaultCouponSecureIssuanceService: { ...secure, persistence: async () => {} },
    DefaultPromotionSellerPolicyService: policy, DefaultPromotionMerchantScopeService: scope,
    DefaultPromotionPublicationService: { ...publication, deliveryEnabled: r => r.storeCode === 'marketplace',
      deliveryRoots: r => r.storeCode === 'marketplace' ? ['offer'] : [] },
    DefaultCouponSellerAuthorizationService: seller,
    DefaultPromotionOperationService: { ...operation, requireOperationalRuntime() {} },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultPromotionDistributionAdmissionService: { assertInstalled: async () => true },
    DefaultPromotionService: { get: async () => ({ code: 'SUC_READ', result: [structuredClone(f.campaign)] }) },
    DefaultLoggerService: { hasPrivateCaptureProtection: () => true, isRequestPrivacyQualified: () => true,
      runSensitiveOperation: (_r, action) => action() },
  });
  SERVICE.DefaultModuleService.invokeModule = async request => {
    assert.equal(request.apiName, '/references/read');
    assert.equal(request.methodName, 'POST');
    const code = request.requestBody?.codes?.[0];
    assert.ok(['issuer', 'vendor'].includes(code));
    assert.deepEqual(request.requestBody, { type: 'enterprise', codes: [code] });
    assert.equal(request.tenant, 'tenant');
    assert.deepEqual(request.request, { tenant: 'tenant' });
    assert.equal(request.header, undefined);
    return [{ code, active: true }];
  };
  return f;
}

test('delegated priced evidence retains issuer Cart/Store/Pricing authority and exact original vendor receipt', async t => {
  const f = delegatedFixture(t), original = structuredClone(f.auth);
  let reads = 0;
  const layered = { ...owner, readCoupon: async function (...args) { reads++; return owner.readCoupon.apply(this, args); } };
  const result = await layered.evaluate(f.input);
  assert.equal(reads, 2, 'Both initial and fresh reads use the effective later-layer owner');
  assert.equal(result.enterpriseCode, 'issuer');
  assert.equal(result.vendorEnterpriseCode, 'vendor');
  assert.equal(result.ownerId, 'buyer');
  assert.equal(result.couponCode, 'batch:1');
  assert.equal(result.subtotalAmount, '25');
  assert.deepEqual(f.auth, original);
  assert.equal(f.couponReads.length, 4);
  for (const read of [f.couponReads[0], f.couponReads[2]]) {
    assert.deepEqual(read.query, { code: 'batch:1', tenant: 'tenant' });
    assert.deepEqual(read.authData, original, 'Initial observation retains exact signed issuer authority');
  }
  for (const read of [f.couponReads[1], f.couponReads[3]])
    assert.deepEqual(read.query, { tenant: 'tenant', enterpriseCode: 'vendor', code: 'batch:1' });
  assert.equal(JSON.stringify(result).includes('retained-ciphertext'), false);
  assert.equal(JSON.stringify(result).includes('sellerAuthorizations'), false);
  await assert.rejects(owner.readCoupon({ tenant: 'tenant', enterpriseCode: 'issuer', authData: f.auth }, 'batch:1'));
});

test('real native runtime admission remains mandatory before any delegated canonical coupon read', async t => {
  for (const mutate of [
    f => { f.auth.tokenType = 'access'; },
    f => { f.auth.tenant = 'foreign'; },
    f => { delete f.auth.runtimeInstanceId; },
    f => { f.auth.runtimeScope.instanceCode = 'foreign'; },
    f => { f.auth.modules = ['pricing']; },
    f => { f.auth.permissions = []; },
    f => { f.auth.principalType = 'human'; },
    f => { f.auth.enterpriseCode = 'vendor'; },
  ]) {
    const f = delegatedFixture(t); mutate(f);
    await assert.rejects(owner.evaluate(f.input), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
    assert.equal(f.couponReads.length, 0);
  }
});

test('generated exact selectors and real access policy never hide a vendor coupon behind an issuer query', async t => {
  const f = delegatedFixture(t), original = structuredClone(f.auth);
  assert.equal((await SERVICE.DefaultCouponService.get({ tenant: 'tenant', authData: f.auth,
    query: { tenant: 'tenant', code: f.coupon.code, enterpriseCode: 'issuer' } })).result.length, 0);
  assert.equal((await owner.evaluate(f.input)).vendorEnterpriseCode, 'vendor');
  assert.deepEqual(f.auth, original);
  f.auth.userGroups = ['customerUserGroup'];
  await assert.rejects(owner.evaluate(f.input), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
});

test('delegated receipt, encrypted membership, issuer, consent and installed-owner failures refuse', async t => {
  for (const mutate of [
    f => { f.batch.secureIssuance.units[0].tokenHash = 'd'.repeat(64); },
    f => { f.coupon.protectedToken.ciphertext = 'changed'; },
    f => { f.coupon.issuerEnterpriseRef.code = 'other'; },
    f => { f.coupon.vendorEnterpriseRef.code = 'other'; },
    f => { f.coupon.enterpriseCode = 'other'; },
    f => { f.batch.secureIssuance.command.enterpriseCode = 'other'; },
    f => { f.batch.secureIssuance.command.storeCode = 'other'; },
    f => { f.campaign.sellerAuthorizations[0].status = 'REVOKED'; },
    f => { f.campaign.sellerAuthorizations[0].revision = 2; },
    f => { f.campaign.sellerAuthorizations[0].expiresAt = '2020-01-01T00:00:00Z'; },
    () => { delete SERVICE.DefaultPromotionMerchantScopeService; },
    () => { SERVICE.DefaultPromotionDistributionAdmissionService.assertInstalled = async () => { throw new Error('not installed'); }; },
  ]) {
    const f = delegatedFixture(t); mutate(f);
    await assert.rejects(owner.evaluate(f.input), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
  }
});

test('delegated consent drift is reread and issuer ownership cannot be changed to the marketplace', async t => {
  const f = delegatedFixture(t);
  let reads = 0;
  SERVICE.DefaultPricingPublicationService.readConfigured = async () => {
    if (++reads === 1) f.campaign.sellerAuthorizations[0].status = 'REVOKED';
    return f.records;
  };
  await assert.rejects(owner.evaluate(f.input), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
  f.campaign.sellerAuthorizations[0].status = 'ACTIVE';
  SERVICE.DefaultPricingPublicationService.readConfigured = async () => f.records;
  f.cart.enterpriseCode = 'vendor';
  await assert.rejects(owner.evaluate(f.input), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
});

test('priced-source body and signed enterprise cannot change during runtime qualification', async t => {
  const f = fixture(t);
  SERVICE.DefaultModuleRegistrationAgentService.assertModuleOperational = async () => {
    f.input.payload.couponCode = 'other';
  };
  await assert.rejects(owner.evaluate(f.input), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
  SERVICE.DefaultModuleRegistrationAgentService.assertModuleOperational = async () => { f.auth.entCode = 'other'; };
  await assert.rejects(owner.evaluate(f.input), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
});

test('vendor merchant benefit sends issuer body selection without signed enterprise override and pins vendor response', async t => {
  const f = businessFixture(t);
  const benefit = require('../../promotion/src/service/defaultPromotionMerchantBenefitService');
  const adapter = require('../../promotion/src/service/defaultPromotionPricedTransactionAdapterService');
  const existingConfig = CONFIG.get;
  CONFIG.get = key => key === 'promotion' ? { ...existingConfig(key), merchantBenefits: {
    enabled: true, qualified: true, evidenceService: 'DefaultPromotionPricedTransactionAdapterService',
    pricedSource: { qualified: true, connectionName: 'pricing', timeoutMilliseconds: 10000 },
  } } : existingConfig(key);
  SERVICE.DefaultPromotionMerchantBenefitService = benefit;
  SERVICE.DefaultPromotionPricedTransactionAdapterService = adapter;
  const profile = SERVICE.DefaultModuleService.invokeModule;
  let forged = false, calls = 0;
  SERVICE.DefaultModuleService.invokeModule = async command => {
    if (command.moduleName !== 'pricing') return profile(command);
    calls++;
    assert.equal(command.header, undefined);
    assert.equal(command.requireInternalAuth, true);
    assert.equal(command.apiName, '/internal/merchant/priced-transaction');
    assert.deepEqual(Object.keys(command.requestBody).sort(), ['couponCode', 'enterpriseCode', 'sourceReference', 'storeCode']);
    assert.equal(command.requestBody.enterpriseCode, 'issuer');
    const proof = await owner.evaluate({ ...f.input, payload: command.requestBody });
    return { data: forged ? { ...proof, vendorEnterpriseCode: 'other' } : proof };
  };
  f.campaign.actions = { discountAmount: '5' };
  const merchant = { tenant: 'tenant', enterpriseCode: 'vendor', storeCode: 'outlet',
    payload: { merchantReceiptReference: 'CART:basket' } };
  const scope = SERVICE.DefaultPromotionMerchantScopeService;
  SERVICE.DefaultPromotionMerchantScopeService = { ...scope, evidenceEnterprise: (r, coupon) =>
    r === merchant && coupon === f.coupon ? 'issuer' : undefined };
  const before = structuredClone({ auth: f.auth, merchant });
  const result = await benefit.validate(merchant, f.campaign, f.coupon);
  assert.equal(result.discountAmount, '5');
  assert.equal(result.sourceStage, 'PRICED_CART');
  assert.deepEqual({ auth: f.auth, merchant }, before);
  await assert.rejects(benefit.validate({ ...merchant }, f.campaign, f.coupon), /ERR_PROMOTION_BENEFIT_UNCONFIRMED/);
  forged = true;
  await assert.rejects(benefit.validate(merchant, f.campaign, f.coupon), /ERR_PROMOTION_BENEFIT_UNCONFIRMED/);
  assert.equal(calls, 2);
});

/** Uses the real runtime/access owners with a distinct signed deployment namespace. @param {Object} t Test context. @returns {Object} Exact isolated admission. */
function businessFixture(t) {
  const f = delegatedFixture(t), get = CONFIG.get;
  SERVICE.DefaultIdentityGovernanceService = { ...require('../../../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultIdentityGovernanceService') };
  f.auth.entCode = 'deployment';
  f.auth.userGroups = [];
  f.input.entCode = 'deployment';
  f.input.httpRequest = { headers: { 'x-enterprise-code': 'deployment', 'x-tenant-code': 'tenant' } };
  f.input.payload.enterpriseCode = 'issuer';
  f.grant = { tenant: 'tenant', principalEnterpriseCode: 'deployment', enterpriseCode: 'issuer',
    serviceId: f.auth.serviceId, ...f.auth.runtimeScope };
  f.pricing = { merchantEvidence: { qualified: true, businessCallers: {
    enabled: true, runtimeRole: 'COMMERCE', callers: [f.grant] } } };
  f.role = { code: 'COMMERCE' };
  f.environment = 'test';
  CONFIG.get = key => key === 'pricing' ? f.pricing : key === 'runtimeRole' ? f.role
    : key === 'identityGovernance' ? require('../../../../../../nodics.foundation/modules/nAuth/config/properties').identityGovernance : get(key);
  NODICS.getSelectedEnvironmentName = () => f.environment;
  return f;
}

test('exact group-free business admission keeps signed runtime unchanged and bounds private owner reads', async t => {
  const f = businessFixture(t), original = structuredClone(f.auth), input = structuredClone(f.input);
  const canonical = SERVICE.DefaultIdentityGovernanceService.getSystemAuthData();
  for (const name of ['DefaultStoreService', 'DefaultCartService', 'DefaultCartEntryService']) {
    const get = SERVICE[name].get;
    SERVICE[name].get = async request => {
      assert.deepEqual(request.authData, canonical);
      if (name !== 'DefaultStoreService') assert.equal(request.query.enterpriseCode, 'issuer');
      return get(request);
    };
  }
  const read = SERVICE.DefaultPricingPublicationService.readConfigured;
  SERVICE.DefaultPricingPublicationService.readConfigured = async context => {
    assert.equal(context.enterpriseCode, 'issuer');
    assert.deepEqual(context.authData, canonical);
    return read(context);
  };
  let captured;
  const layered = { ...owner, readCoupon: async function (scope, code) {
    captured = scope;
    await assert.rejects(owner.readCoupon.call(this, { ...scope }, code), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
    for (const [service, query] of [
      [SERVICE.DefaultPromotionService, { code: 'offer' }],
      [SERVICE.DefaultCouponService, { code: 'foreign-coupon' }],
      [SERVICE.DefaultCouponService, {}],
      [SERVICE.DefaultStoreService, { code: 'foreign-outlet' }],
      [SERVICE.DefaultCartService, { code: 'foreign-cart', enterpriseCode: 'issuer', ownerId: 'buyer', storeCode: 'outlet' }],
      [SERVICE.DefaultCartEntryService, { cartCode: 'basket', enterpriseCode: 'issuer', ownerId: 'foreign-buyer', status: 'ACTIVE' }],
    ]) await assert.rejects(owner.read.call(this, service, scope, query), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
    return owner.readCoupon.call(this, scope, code);
  } };
  const proof = await layered.evaluate(f.input);
  assert.equal(proof.enterpriseCode, 'issuer');
  assert.equal(proof.vendorEnterpriseCode, 'vendor');
  assert.equal(proof.subtotalAmount, '25');
  assert.deepEqual(f.auth, original);
  assert.deepEqual(f.input, input);
  for (const read of [f.couponReads[0], f.couponReads[2]]) assert.deepEqual(read.authData, canonical);
  assert.equal(owner.admit, undefined, 'Private registration is not a generic authority helper');
  await assert.rejects(owner.readCoupon(captured, f.coupon.code), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
  await assert.rejects(owner.readCoupon({ ...captured }, f.coupon.code), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
});

test('same-enterprise body selection needs no cross-enterprise policy and preserves legacy three selectors', async t => {
  const f = delegatedFixture(t), get = CONFIG.get;
  CONFIG.get = key => key === 'pricing' ? { merchantEvidence: { qualified: true,
    businessCallers: { enabled: false, runtimeRole: 'COMMERCE', callers: [] } } } : get(key);
  assert.equal((await owner.evaluate(f.input)).enterpriseCode, 'issuer');
  f.input.payload.enterpriseCode = 'issuer';
  assert.equal((await owner.evaluate(f.input)).enterpriseCode, 'issuer');
});

test('business allowlist is exact, bounded, unambiguous and never supplies runtime permission', async t => {
  const mutations = [
    f => { f.pricing.merchantEvidence.businessCallers.enabled = false; },
    f => { f.pricing.merchantEvidence.qualified = false; },
    f => { delete f.pricing.merchantEvidence.businessCallers; },
    f => { f.pricing.merchantEvidence.businessCallers.runtimeRole = 'COMMERCE_STAGED'; },
    f => { f.pricing.merchantEvidence.businessCallers.callers = []; },
    f => { f.pricing.merchantEvidence.businessCallers.callers.push({ ...f.grant }); },
    f => { f.pricing.merchantEvidence.businessCallers.callers = Array.from({ length: 101 }, () => ({ ...f.grant })); },
    f => { f.grant.anyEnterprise = true; },
    f => { f.grant.enterpriseCode = '*'; },
    f => { f.role.code = 'COMMERCE_STAGED'; },
    f => { f.environment = 'other'; },
    f => { f.auth.permissions = []; },
    f => { f.auth.modules = ['pricing']; },
    f => { f.auth.isSystem = true; },
    () => { delete SERVICE.DefaultIdentityGovernanceService; },
    () => { SERVICE.DefaultIdentityGovernanceService.getSystemAuthData = () => ({}); },
    f => { f.input.entCode = 'issuer'; },
    f => { f.input.enterpriseCode = 'issuer'; },
    f => { f.input.tenantCode = 'other'; },
    f => { f.input.httpRequest.headers['x-enterprise-code'] = 'issuer'; },
    f => { f.input.httpRequest.headers['x-tenant-code'] = 'other'; },
    f => { f.input.payload.enterpriseCode = 'vendor'; },
    f => { f.input.payload.ownerId = 'buyer'; },
    f => { f.input.query = { enterpriseCode: 'issuer' }; },
    ...['tenant', 'principalEnterpriseCode', 'enterpriseCode', 'serviceId', 'projectCode',
      'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode'].flatMap(key => [
      f => { f.grant[key] = 'foreign'; }, f => { delete f.grant[key]; },
    ]),
  ];
  for (const mutate of mutations) {
    const f = businessFixture(t);
    mutate(f);
    await assert.rejects(owner.evaluate(f.input), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
  }
});

test('request, policy, runtime, privacy and publication-context drift refuse across awaited owner reads', async t => {
  for (const phase of ['qualification', 'coupon', 'publication', 'freshPublication']) {
    for (const mutate of [
      f => { f.input.payload.enterpriseCode = 'other'; },
      f => { f.input.httpRequest.headers['x-enterprise-code'] = 'other'; },
      f => { f.input.authData.permissions = []; },
      f => { f.grant.assignmentCode = 'other'; },
      f => { f.pricing.merchantEvidence.qualified = false; },
      f => { f.pricing.publication = { delivery: { enabled: false } }; },
      f => { f.role.code = 'COMMERCE_STAGED'; },
      f => { f.environment = 'other'; },
      () => { SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = () => false; },
    ]) {
      const f = businessFixture(t);
      if (phase === 'qualification') {
        SERVICE.DefaultModuleRegistrationAgentService.assertModuleOperational = async () => mutate(f);
      } else if (phase === 'coupon') {
        const get = SERVICE.DefaultCouponService.get;
        SERVICE.DefaultCouponService.get = async request => { const result = await get(request); mutate(f); return result; };
      } else {
        let count = 0;
        SERVICE.DefaultPricingPublicationService.readConfigured = async () => {
          if (++count === (phase === 'publication' ? 1 : 2)) mutate(f);
          return f.records;
        };
      }
      await assert.rejects(owner.evaluate(f.input), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
    }
  }
  for (const key of ['enterpriseCode', 'tenant', 'storeCode', 'currency']) {
    const f = businessFixture(t);
    SERVICE.DefaultPricingPublicationService.readConfigured = async context => {
      context[key] = 'other';
      return f.records;
    };
    await assert.rejects(owner.evaluate(f.input), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
  }
});

test('HTTP controller preserves signed scope aliases and private identity; body cannot override a conflicting header', async t => {
  const f = businessFixture(t), controller = require('../src/controller/defaultPricingMerchantEvidenceController');
  const previous = global.FACADE;
  t.after(() => { global.FACADE = previous; });
  const protectedRequests = new WeakSet();
  const raw = { tenant: f.input.tenant, entCode: f.auth.entCode, authData: f.auth,
    httpRequest: { body: f.input.payload, query: {}, headers: f.input.httpRequest.headers },
    httpResponse: { setHeader: (name, value) => { assert.equal(name, 'Cache-Control'); assert.equal(value, 'no-store'); } } };
  protectedRequests.add(raw);
  SERVICE.DefaultLoggerService.assertSensitiveRequest = r => assert.ok(protectedRequests.has(r));
  SERVICE.DefaultLoggerService.inheritRequestPrivacy = (mapped, r) => {
    assert.ok(protectedRequests.has(r)); protectedRequests.add(mapped);
  };
  SERVICE.DefaultLoggerService.hasPrivateCaptureProtection = r => protectedRequests.has(r);
  global.FACADE = { DefaultPricingMerchantEvidenceFacade: owner };
  assert.equal((await controller.evaluate(raw)).data.enterpriseCode, 'issuer');
  raw.httpRequest.headers['x-enterprise-code'] = 'issuer';
  await assert.rejects(controller.evaluate(raw), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
});

test('group-free merchant admission reads actual activated Pricing pointer/receipt/release without widening ordinary reads', async t => {
  const f = businessFixture(t), publication = require('../src/service/defaultPricingPublicationService');
  f.pricing.publication = { runtimeRole: 'ONLINE', delivery: { enabled: true,
    storeCodes: ['outlet'], rootCodesByStore: { outlet: ['book'] } } };
  SERVICE.DefaultPricingPublicationService = publication;
  const scope = { tenant: 'tenant', enterpriseCode: 'issuer' },
    payload = { ...scope, rootType: 'priceBook', rootCode: 'book', records: f.records },
    version = publication.fingerprint(payload),
    pointerCode = publication.pointerCode({ rootType: 'priceBook', rootCode: 'book' }, scope);
  const records = {
    pointer: { ...scope, code: pointerCode, version, receiptCode: 'activation', revision: 1 },
    receipt: { ...scope, code: 'activation', pointerCode, targetVersion: version, expectedRevision: 0, fingerprint: version },
    release: { ...scope, code: version, fingerprint: version, rootType: 'priceBook', rootCode: 'book', payload },
  };
  const getOwner = require('../../../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');
  const groups = require('../config/properties').schemaPolicies.pricing.operational.accessGroups;
  let reads = 0;
  for (const [kind, name] of [['pointer', 'DefaultPricingPolicyPointerService'],
    ['receipt', 'DefaultPricingPolicyReceiptService'], ['release', 'DefaultPricingPolicyReleaseService']]) {
    SERVICE[name] = {
      get: async request => {
        request.schemaModel = { moduleName: 'pricing', schemaName: 'pricingPolicy' + kind,
          rawSchema: { accessGroups: groups } };
        await new Promise((resolve, reject) => getOwner.checkAccess.call({ ...getOwner, LOG: { debug() {} } }, request, {}, {
          nextSuccess: resolve, error: (_request, _response, error) => reject(error) }));
        reads++;
        assert.equal(request.authData.isSystem, true);
        assert.deepEqual(request.query, { ...scope, code: records[kind].code });
        return { code: 'SUC_READ', result: [structuredClone(records[kind])] };
      },
      save: () => assert.fail('merchant read cannot retain policy'),
      update: () => assert.fail('merchant read cannot activate policy'),
    };
  }
  const original = structuredClone(f.auth);
  assert.equal((await owner.evaluate(f.input)).subtotalAmount, '25');
  assert.equal(reads, 6, 'Both passes verify real activated pointer, receipt and immutable release');
  assert.deepEqual(f.auth, original);
  const ordinary = { ...scope, authData: f.auth };
  assert.equal(publication.activatedReadAuth(ordinary, SERVICE.DefaultPricingPolicyReleaseService), f.auth);
  await assert.rejects(publication.readConfigured({ ...ordinary, storeCode: 'outlet' }));
  records.receipt.targetVersion = 'other';
  await assert.rejects(owner.evaluate(f.input), /ERR_PRICING_MERCHANT_UNCONFIRMED/);
});

test('framework merchant admission, exposure and monetary qualification defaults remain disabled', () => {
  const pricing = require('../config/properties'), promotion = require('../../promotion/config/properties');
  assert.equal(pricing.pricing.merchantEvidence.qualified, false);
  assert.deepEqual(pricing.pricing.merchantEvidence.businessCallers, { enabled: false, runtimeRole: 'COMMERCE', callers: [] });
  assert.equal(pricing.apiExposure.categories.commerceMerchantPricing.enabled, false);
  assert.equal(promotion.promotion.merchantBenefits.qualified, false);
  assert.equal(promotion.promotion.merchantBenefits.pricedSource.qualified, false);
  assert.equal(promotion.promotion.merchantBenefits.pricedSource.allowInsecureLoopback, false);
});
