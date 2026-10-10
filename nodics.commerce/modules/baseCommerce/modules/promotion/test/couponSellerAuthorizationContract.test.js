/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module promotion/test/couponSellerAuthorizationContract @description Authored consent revision, generic-write and customization regression fixtures; execution remains a joint acceptance gate. @layer test @owner promotion */
const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/defaultCouponSellerAuthorizationService");
const operation = require("../src/service/defaultPromotionOperationService");
const admission = require("../src/service/defaultPromotionBudgetAdmissionService");
const publication = require("../src/service/defaultPromotionPublicationService");
const hooks = require("../src/interceptors/interceptors");
const path = require("node:path");
const foundation = path.resolve(__dirname, "../../../../../../nodics.foundation/modules");
const update = require(path.join(foundation, "nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService"));
const interceptors = require(path.join(foundation, "nCommon/src/service/interceptor/defaultInterceptorService"));
const ref = (code) => ({
  moduleName: "profile",
  schemaName: "enterprise",
  code,
});
/** Installs isolated owner doubles without database, runtime or communications. @param {Object} t Test context. @returns {Object} Customizable owner fixture. */
function fixture(t) {
  const previous = {
    CONFIG: global.CONFIG,
    SERVICE: global.SERVICE,
    CLASSES: global.CLASSES,
  };
  t.after(() => Object.assign(global, previous));
  global.CONFIG = {
    get: () => ({
      sellerAuthorization: {
        enabled: true,
        qualified: true,
        maximumSellers: 10,
      },
    }),
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      /** Preserves failure text in the isolated fixture. */
      constructor(_code, message) {
        super(message);
      }
    },
  };
  global.SERVICE = {
    DefaultPromotionOperationService: { requireOperationalRuntime: () => true },
    DefaultPromotionDistributionAdmissionService: { ...require('../src/service/defaultPromotionDistributionAdmissionService'),
      assertInstalled: async () => true },
  };
  return { ...owner, activeEnterprise: async () => {}, issuer: async () => {} };
}
test("current issuer consent is required and retained reservation revision cannot revive", async (t) => {
  const service = fixture(t),
    r = { tenant: "t", enterpriseCode: "seller" },
    coupon = {
      issuerEnterpriseRef: ref("issuer"),
      vendorEnterpriseRef: ref("seller"),
      promotionCode: "offer",
    };
  let grant = {
    sellerEnterpriseCode: "seller",
    issuerEnterpriseCode: "issuer",
    status: "ACTIVE",
    revision: 1,
    expiresAt: "2099-01-01T00:00:00.000Z",
  };
  service.campaign = async () => ({
    code: "offer",
    active: true,
    status: "ACTIVE",
    issuerEnterpriseRef: ref("issuer"),
    sellerAuthorizations: [grant],
  });
  const proof = await service.authorizeSale(r, coupon);
  assert.equal(proof.grantRevision, 1);
  grant = { ...grant, status: "REVOKED", revision: 2 };
  await assert.rejects(
    service.authorizeSale(r, { ...coupon, sellerAuthorizationProof: proof }),
    /unavailable/,
  );
  grant = { ...grant, status: "ACTIVE", revision: 3 };
  await assert.rejects(
    service.authorizeSale(r, { ...coupon, sellerAuthorizationProof: proof }),
    /changed/,
  );
  await assert.rejects(
    service.authorizeSale({ ...r, enterpriseCode: "other" }, coupon),
    /does not match/,
  );
});
test("issuer review uses campaign CAS and reconciles lost acknowledgement without another write", async (t) => {
  const service = fixture(t);
  let row = { code: "offer", revision: 0, issuerEnterpriseRef: ref("issuer") },
    writes = 0;
  service.campaign = async () => row;
  global.SERVICE.DefaultPromotionOperationService = {
    serviceAuthData: () => ({}),
    requireOperationalRuntime: () => true,
  };
  global.SERVICE.DefaultPromotionService = {
    update: async (command) => {
      assert.equal(await service.protect(command), true);
      assert.equal(command.query.revision, 0);
      writes++;
      row = { ...row, ...command.model };
      throw new Error("lost acknowledgement");
    },
  };
  const r = {
    tenant: "t",
    promotionCode: "offer",
    authData: { loginId: "issuer-admin" },
    payload: {
      action: "GRANT",
      sellerEnterpriseCode: "seller",
      expiresAt: "2099-01-01T00:00:00.000Z",
      expectedRevision: 0,
      commandReference: "review-0001",
    },
  };
  const result = await service.manage(r);
  assert.equal(result.promotionRevision, 1);
  assert.equal(result.seller.status, "ACTIVE");
  assert.equal((await service.manage(r)).seller.revision, 1);
  assert.equal(writes, 1);
  await assert.rejects(
    service.manage({ ...r, payload: { ...r.payload, action: "REVOKE" } }),
    /Revocation|conflicts/,
  );
});
test("body authority flags cannot manufacture consent and coupon generic writes retain an atomic proof fence", async (t) => {
  const service = fixture(t);
  await assert.rejects(
    service.protect({
      model: { $set: { "sellerAuthorizations.0.status": "ACTIVE" } },
    }),
    /issuer command/,
  );
  assert.throws(
    () =>
      service.protectCoupon({
        model: { $unset: { sellerAuthorizationProof: true } },
      }),
    /owner-managed/,
  );
  await assert.rejects(
    service.protect({ model: { $replaceWith: { code: "offer" } } }),
    /explicit field/,
  );
  const request = { query: { code: "unit" }, model: { status: "AVAILABLE" } };
  service.protectCoupon(request);
  assert.deepEqual(request.query.sellerAuthorizationProof, { $exists: false });
  global.CONFIG.get = () => ({
    sellerAuthorization: {
      enabled: true,
      qualified: false,
      maximumSellers: 10,
    },
  });
  assert.throws(() => service.policy(), /not qualified/);
});

/** Exercises the real declared generated pre-update chain and signed issuer checks with isolated Profile/CAS ports only. @param {Object} t Test context. @returns {Object} Mutable isolated state and reviewed command. */
function guardedFixture(t) {
  fixture(t);
  const descriptor = Object.getOwnPropertyDescriptor(String.prototype, "toUpperCaseFirstChar");
  Object.defineProperty(String.prototype, "toUpperCaseFirstChar", {
    configurable: true, value: function () { return this.charAt(0).toUpperCase() + this.slice(1); },
  });
  t.after(() => {
    if (descriptor) Object.defineProperty(String.prototype, "toUpperCaseFirstChar", descriptor);
    else delete String.prototype.toUpperCaseFirstChar;
  });
  CLASSES.NodicsError.enrich = error => error;
  const state = { writes: 0, commands: [], denied: false, row: {
    code: "offer", tenant: "t", active: true, status: "ACTIVE", revision: 4,
    issuerEnterpriseRef: ref("issuer"), vendorEnterpriseRef: ref("seller"),
    budget: { limit: "100", spent: "37" }, budgetAdmission: { command: { actorId: "original" } },
  } };
  CONFIG.get = () => ({ publication: { runtimeRole: "ONLINE" },
    sellerAuthorization: { enabled: true, qualified: true, maximumSellers: 10 } });
  const ordered = Object.values(hooks).filter(item => item.item === "promotion" &&
    item.trigger === "preUpdate" && [true, "true"].includes(item.active)).sort((a, b) => a.index - b.index);
  SERVICE.DefaultCouponSellerAuthorizationService = owner;
  SERVICE.DefaultPromotionOperationService = operation;
  SERVICE.DefaultPromotionBudgetAdmissionService = admission;
  SERVICE.DefaultPromotionPublicationService = publication;
  SERVICE.DefaultInterceptorService = interceptors;
  SERVICE.DefaultDatabaseConfigurationService = { getSchemaInterceptors: () => ({ preUpdate: ordered }) };
  SERVICE.DefaultSecuredRequestPipelineService = {
    getGrantedPermissions: () => ["commerce.coupon.seller.manage"],
    isPermissionGranted: (_permission, granted) => granted.includes("commerce.coupon.seller.manage"),
  };
  const scope = { scopeType: "ENTERPRISE", scopeCode: "issuer", tenantCode: "t" };
  SERVICE.DefaultModuleService = { invokeModule: async request => {
    assert.equal(request.tenant, "t");
    if (request.apiName === "/identity/scopes/me") {
      assert.equal(request.header.Authorization, "Bearer isolated-fixture");
      assert.equal(request.header["X-Enterprise-Code"], "issuer");
      return { principalCode: "issuer-admin", scopes: [scope], deniedScopes: state.denied ? [scope] : [] };
    }
    assert.equal(request.apiName, "/references/read");
    assert.equal(request.requestBody.type, "enterprise");
    assert.equal(request.requestBody.codes.length, 1);
    return [{ code: request.requestBody.codes[0], active: true }];
  } };
  SERVICE.DefaultPromotionService = {
    get: async request => {
      assert.equal(request.options.skipItemCache, true);
      return { code: "SUC_TEST", result: [structuredClone(state.row)] };
    },
    update: async command => {
      state.commands.push(command);
      if (state.beforeGuard) await state.beforeGuard(command);
      command.schemaModel = { schemaName: "promotion" };
      await new Promise((resolve, reject) => ({ ...update, LOG: { debug() {} } }).applyPreInterceptors(command, {}, {
        nextSuccess: resolve, error: (_request, _response, error) => reject(error),
      }));
      const matched = Object.entries(command.query).every(([key, value]) =>
        value && typeof value === "object" && "$exists" in value
          ? (state.row[key] !== undefined) === value.$exists : state.row[key] === value);
      if (matched) { state.writes++; state.row = { ...state.row, ...structuredClone(command.model) }; }
      if (state.lost) throw new Error("lost acknowledgement");
      return { code: "SUC_TEST", result: { acknowledged: true, matchedCount: matched ? 1 : 0 } };
    },
  };
  return { state, ordered, request: { tenant: "t", promotionCode: "offer", authorization: "Bearer isolated-fixture",
    authData: { tenant: "t", enterpriseCode: "issuer", loginId: "issuer-admin", tokenType: "access", principalType: "human" },
    payload: { action: "GRANT", sellerEnterpriseCode: "seller", expiresAt: "2099-01-01T00:00:00.000Z",
      expectedRevision: 4, commandReference: "review-guard-0001" } } };
}

test("enterprise activity uses the existing Profile reference owner with a group-free signed runtime", async t => {
  fixture(t);
  const profile = require("../../../../../../nodics.platform/modules/profile/src/service/identity/defaultProfileReferenceService");
  const settings = require("../../../../../../nodics.platform/modules/profile/config/properties").profileReferenceRead;
  const runtime = { tenant: "t", tokenType: "service", principalType: "service", userGroups: [],
    runtimeScope: { instanceCode: "commerce-1" }, modules: ["profile"], permissions: ["profile.enterprise.reference.read"] };
  const persistenceAuth = { userGroups: ["owner-persistence"] };
  let records = [{ code: "issuer", active: true, name: "Issuer", privateField: "not-returned" }], reads = 0;
  CONFIG.get = key => key === "profileReferenceRead" ? settings : undefined;
  SERVICE.DefaultIdentityGovernanceService = { getSystemAuthData: () => persistenceAuth };
  SERVICE.DefaultEnterpriseService = { get: async request => {
    reads++;
    assert.equal(request.authData, persistenceAuth);
    assert.deepEqual(request.query, { code: { $in: ["issuer"] }, active: true });
    assert.equal(request.tenant, "t");
    return { code: "SUC_TEST", result: records };
  } };
  SERVICE.DefaultModuleService = { invokeModule: async request => {
    assert.equal(request.apiName, "/references/read");
    assert.deepEqual(request.requestBody, { type: "enterprise", codes: ["issuer"] });
    assert.equal(request.header, undefined);
    assert.equal(request.maxAttempts, 1);
    return { data: await profile.read({ tenant: request.tenant, authData: runtime, payload: request.requestBody }) };
  } };
  const original = { tenant: "t", authData: { tenant: "t", entCode: "issuer", principalType: "human", tokenType: "access" } };
  const before = structuredClone(original);
  await owner.activeEnterprise(original, "issuer");
  assert.deepEqual(original, before);
  assert.deepEqual(runtime.userGroups, []);
  for (const invalid of [[], [{ code: "other", active: true }], [{ code: "issuer", active: false }],
    [{ code: "issuer" }], [{ code: "issuer", active: true }, { code: "issuer", active: true }]]) {
    records = invalid;
    await assert.rejects(owner.activeEnterprise(original, "issuer"));
  }
  assert.equal(reads, 6);
  runtime.permissions = [];
  await assert.rejects(owner.activeEnterprise(original, "issuer"));
  assert.equal(reads, 6);
});

test("consent does not require monetary pricing or completed journeys, but writes require installed admission", async t => {
  const f = guardedFixture(t);
  const config = CONFIG.get;
  CONFIG.get = key => ({ ...config(key), merchantBenefits: { enabled: false, qualified: false },
    purchasedRights: { enabled: false, qualified: false } });
  const unavailable = new Proxy({}, { get() { assert.fail("Consent must not invoke a priced or journey owner"); } });
  for (const name of ["DefaultPromotionMerchantBenefitService", "DefaultPricingMerchantEvidenceService",
    "DefaultPromotionPricedTransactionAdapterService", "DefaultDigitalCommerceMerchantService"])
    SERVICE[name] = unavailable;
  let installedChecks = 0;
  SERVICE.DefaultPromotionDistributionAdmissionService.assertInstalled = async () => {
    installedChecks++; return true;
  };
  const inspection = await owner.inspect({ ...f.request, payload: {} });
  assert.equal(inspection.promotionRevision, 4);
  assert.equal(installedChecks, 0);
  assert.equal((await owner.manage(f.request)).seller.status, "ACTIVE");
  assert.equal(installedChecks, 1);
  SERVICE.DefaultPromotionDistributionAdmissionService.assertInstalled = async () => false;
  await assert.rejects(owner.manage(f.request));
  assert.equal(f.state.writes, 1);
});

test("ordered budget and seller guards admit only issuer consent CAS while retaining spend and opening receipt", async t => {
  const f = guardedFixture(t), original = structuredClone(f.state.row);
  assert.deepEqual(f.ordered.map(item => item.handler), [
    "DefaultPromotionBudgetAdmissionService.protect", "DefaultCouponSellerAuthorizationService.protect",
    "DefaultPromotionPublicationService.validateSourceAuthoring", "DefaultPromotionOperationService.validatePolicyAuthoring",
  ]);
  f.state.beforeGuard = command => {
    assert.equal(owner.isSellerConsentWrite(command), true);
    assert.equal(owner.isSellerConsentWrite({ ...command }), false);
    const copy = { ...command, query: { ...command.query }, model: structuredClone(command.model) };
    admission.protect(copy);
    assert.deepEqual(copy.query.budgetAdmission, { $exists: false });
    assert.equal(owner.isCouponWrite(command), false);
  };
  f.state.lost = true;
  const result = await owner.manage(f.request);
  assert.equal(result.seller.status, "ACTIVE");
  assert.equal(f.state.writes, 1);
  assert.deepEqual(f.state.row.budget, original.budget);
  assert.deepEqual(f.state.row.budgetAdmission, original.budgetAdmission);
  assert.equal(owner.isSellerConsentWrite(f.state.commands[0]), false);
  assert.equal((await owner.manage(f.request)).seller.revision, 1);
  assert.equal(f.state.writes, 1);
  await owner.manage({ ...f.request, payload: { action: "REVOKE", sellerEnterpriseCode: "seller",
    expectedRevision: 5, commandReference: "review-revoke-0001" } });
  assert.equal(f.state.row.sellerAuthorizations[0].status, "REVOKED");
  assert.equal(f.state.writes, 2);
  assert.deepEqual(f.state.row.budget, original.budget);
  f.state.beforeGuard = undefined;
  const copied = structuredClone(f.state.commands[0]);
  copied.isSellerConsentWrite = true;
  await assert.rejects(SERVICE.DefaultPromotionService.update(copied));
  await assert.rejects(SERVICE.DefaultPromotionService.update(f.state.commands[0]));
  assert.equal(f.state.writes, 2);
  assert.deepEqual(f.state.row.budgetAdmission, original.budgetAdmission);
});

test("private consent CAS cannot change budget, receipt, selector, identity or replacement fields", async t => {
  const f = guardedFixture(t), original = structuredClone(f.state.row);
  for (const mutate of [
    command => { command.model.budget = { spent: "0" }; },
    command => { command.model.budgetAdmission = {}; },
    command => { command.model["budget.spent"] = "0"; },
    command => { command.model.$unset = { budgetAdmission: "" }; },
    command => { command.models = [command.model]; },
    command => { command.query.tenant = "foreign"; },
    command => { command.query.code = "other"; },
    command => { command.model.revision++; },
    command => { command.tenant = "foreign"; },
  ]) {
    f.state.beforeGuard = mutate;
    await assert.rejects(owner.manage(f.request), /unconfirmed/);
    assert.equal(owner.isSellerConsentWrite(f.state.commands.at(-1)), false);
    assert.deepEqual(f.state.row, original);
    assert.equal(f.state.writes, 0);
  }
});

test("signed issuer Profile denial and competing campaign CAS never grant consent", async t => {
  const f = guardedFixture(t);
  f.state.denied = true;
  await assert.rejects(owner.manage(f.request), /does not authorize/);
  assert.equal(f.state.commands.length, 0);
  f.state.denied = false;
  await assert.rejects(owner.manage({ ...f.request, authData: { ...f.request.authData, enterpriseCode: "seller" } }), /issuer administration/);
  assert.equal(f.state.commands.length, 0);
  f.state.beforeGuard = () => { f.state.row.revision++; };
  await assert.rejects(owner.manage(f.request), /unconfirmed/);
  assert.equal(f.state.writes, 0);
  assert.equal(f.state.row.sellerAuthorizations, undefined);
  assert.equal(owner.isSellerConsentWrite(f.state.commands[0]), false);
});

test("explicit benefit GRANT retains exact purpose, safe projection and replay without changing existing budget", async t => {
  const f = guardedFixture(t), original = structuredClone(f.state.row);
  f.request.payload.benefitConsumption = "ISSUED_COUPON_BENEFIT_V1";
  const result = await owner.manage(f.request), retained = structuredClone(f.state.row.sellerAuthorizations[0]);
  assert.equal(result.seller.benefitConsumption, "ISSUED_COUPON_BENEFIT_V1");
  assert.equal(result.seller.revision, 1); assert.equal(result.seller.actorId, undefined); assert.equal(result.seller.commandHash, undefined);
  assert.equal((await owner.manage(f.request)).seller.benefitConsumption, result.seller.benefitConsumption);
  assert.deepEqual(f.state.row.sellerAuthorizations[0], retained); assert.equal(f.state.writes, 1);
  assert.deepEqual(f.state.row.budget, original.budget); assert.deepEqual(f.state.row.budgetAdmission, original.budgetAdmission);
  const inspection = await owner.inspect({ ...f.request, payload: {} });
  assert.equal(inspection.sellers[0].benefitConsumption, result.seller.benefitConsumption);
  assert.equal(inspection.sellers[0].commandReference, undefined);
});

test("absent benefit purpose keeps distribution-only legacy command hashes and never upgrades on retry", async t => {
  const f = guardedFixture(t), result = await owner.manage(f.request), grant = structuredClone(f.state.row.sellerAuthorizations[0]);
  const originalHash = require("node:crypto").createHash("sha256").update(JSON.stringify([
    "offer", "issuer", "issuer-admin", "seller", "GRANT", "2099-01-01T00:00:00.000Z", 4, "review-guard-0001",
  ])).digest("hex");
  assert.equal(Object.hasOwn(result.seller, "benefitConsumption"), false);
  assert.equal(Object.hasOwn(grant, "benefitConsumption"), false); assert.equal(grant.commandHash, originalHash);
  await owner.manage(f.request); assert.equal(f.state.writes, 1);
  await assert.rejects(owner.manage({ ...f.request, payload: { ...f.request.payload,
    benefitConsumption: "ISSUED_COUPON_BENEFIT_V1" } }), /replay conflicts/);
  assert.deepEqual(f.state.row.sellerAuthorizations[0], grant); assert.equal(f.state.writes, 1);
});

test("same-command purpose removal or change refuses instead of silently adopting the original grant", async t => {
  const f = guardedFixture(t);
  f.request.payload.benefitConsumption = "ISSUED_COUPON_BENEFIT_V1"; await owner.manage(f.request);
  const original = structuredClone(f.state.row);
  const { benefitConsumption, ...withoutPurpose } = f.request.payload;
  await assert.rejects(owner.manage({ ...f.request, payload: withoutPurpose }), /replay conflicts/);
  await assert.rejects(owner.manage({ ...f.request, payload: { ...f.request.payload, benefitConsumption: "OTHER" } }), /Invalid reviewed/);
  assert.deepEqual(f.state.row, original); assert.equal(f.state.writes, 1);
});

test("malformed or revoke-selected benefit purposes cannot create or alter consent", async t => {
  const f = guardedFixture(t);
  for (const purpose of [undefined, null, false, true, 1, "", "issued_coupon_benefit_v1", " ISSUED_COUPON_BENEFIT_V1",
    "ISSUED_COUPON_BENEFIT_V1 ", "ISSUED_COUPON_BENEFIT_V2", {}, [], ["ISSUED_COUPON_BENEFIT_V1"]]) {
    await assert.rejects(owner.manage({ ...f.request, payload: { ...f.request.payload, benefitConsumption: purpose } }), /Invalid reviewed/);
  }
  assert.equal(f.state.writes, 0); await owner.manage({ ...f.request, payload: { ...f.request.payload, benefitConsumption: "ISSUED_COUPON_BENEFIT_V1" } });
  await assert.rejects(owner.manage({ ...f.request, payload: { action: "REVOKE", sellerEnterpriseCode: "seller", expectedRevision: 5,
    commandReference: "revoke-purpose-0001", benefitConsumption: "ISSUED_COUPON_BENEFIT_V1" } }), /Invalid reviewed/);
  assert.equal(f.state.writes, 1);
});

test("REVOKE preserves original purpose and expiry while a fresh GRANT explicitly selects its new revision purpose", async t => {
  const f = guardedFixture(t);
  f.request.payload.benefitConsumption = "ISSUED_COUPON_BENEFIT_V1"; await owner.manage(f.request);
  const revoke = { ...f.request, payload: { action: "REVOKE", sellerEnterpriseCode: "seller", expectedRevision: 5,
    commandReference: "revoke-purpose-0001" } };
  const result = await owner.manage(revoke), retained = structuredClone(f.state.row.sellerAuthorizations[0]);
  assert.equal(result.seller.revision, 2); assert.equal(result.seller.status, "REVOKED");
  assert.equal(result.seller.benefitConsumption, "ISSUED_COUPON_BENEFIT_V1"); assert.equal(result.seller.expiresAt, f.request.payload.expiresAt);
  await owner.manage(revoke); assert.deepEqual(f.state.row.sellerAuthorizations[0], retained); assert.equal(f.state.writes, 2);
  const { benefitConsumption, ...distributionOnly } = f.request.payload;
  const regrant = await owner.manage({ ...f.request, payload: { ...distributionOnly, expectedRevision: 6, commandReference: "distribution-only-0002" } });
  assert.equal(regrant.seller.revision, 3); assert.equal(Object.hasOwn(regrant.seller, "benefitConsumption"), false);
  const explicit = await owner.manage({ ...f.request, payload: { ...f.request.payload, expectedRevision: 7, commandReference: "benefit-purpose-0003" } });
  assert.equal(explicit.seller.revision, 4); assert.equal(explicit.seller.benefitConsumption, "ISSUED_COUPON_BENEFIT_V1");
});

test("benefit purpose retains fresh signed human issuer permission and Profile DENY precedence", async t => {
  const f = guardedFixture(t); f.request.payload.benefitConsumption = "ISSUED_COUPON_BENEFIT_V1";
  f.state.denied = true; await assert.rejects(owner.manage(f.request), /does not authorize/); f.state.denied = false;
  for (const changes of [{ principalType: "customer" }, { principalType: "service" }, { tokenType: "refresh" }, { enterpriseCode: "seller" }])
    await assert.rejects(owner.manage({ ...f.request, authData: { ...f.request.authData, ...changes } }), /issuer administration/);
  SERVICE.DefaultSecuredRequestPipelineService.getGrantedPermissions = () => [];
  await assert.rejects(owner.manage(f.request), /issuer administration/);
  assert.equal(f.state.writes, 0); assert.equal(f.state.commands.length, 0);
});

test("benefit purpose is detached before awaits and private grant CAS rejects in-flight purpose tampering", async t => {
  const f = guardedFixture(t); f.request.payload.benefitConsumption = "ISSUED_COUPON_BENEFIT_V1";
  f.state.beforeGuard = () => { f.request.payload.benefitConsumption = "OTHER"; };
  await owner.manage(f.request); assert.equal(f.state.row.sellerAuthorizations[0].benefitConsumption, "ISSUED_COUPON_BENEFIT_V1");
  const original = structuredClone(f.state.row);
  f.state.beforeGuard = command => { command.model.sellerAuthorizations[0].benefitConsumption = "OTHER"; };
  await assert.rejects(owner.manage({ ...f.request, payload: { ...f.request.payload, benefitConsumption: "ISSUED_COUPON_BENEFIT_V1",
    expectedRevision: 5, commandReference: "benefit-purpose-0002" } }), /unconfirmed/);
  assert.deepEqual(f.state.row, original); assert.equal(f.state.writes, 1);
});

test("competing distribution and benefit GRANT commands cannot merge purposes or bypass campaign CAS", async t => {
  const f = guardedFixture(t);
  const results = await Promise.allSettled([owner.manage(f.request), owner.manage({ ...f.request, payload: { ...f.request.payload,
    benefitConsumption: "ISSUED_COUPON_BENEFIT_V1", commandReference: "benefit-purpose-0002" } })]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1); assert.equal(f.state.writes, 1);
  assert.equal(f.state.row.revision, 5); assert.equal(f.state.row.sellerAuthorizations.length, 1);
  assert.equal(f.state.row.sellerAuthorizations[0].revision, 1);
});

test("safe projection and administration refuse malformed retained purpose without disclosing private fields", async t => {
  const f = guardedFixture(t); await owner.manage(f.request);
  const grant = f.state.row.sellerAuthorizations[0];
  grant.benefitConsumption = "UNREVIEWED_PURPOSE";
  assert.throws(() => owner.project(grant), /purpose is invalid/);
  await assert.rejects(owner.inspect({ ...f.request, payload: {} }), /purpose is invalid/);
  await assert.rejects(owner.manage({ ...f.request, payload: { ...f.request.payload, expectedRevision: 5, commandReference: "benefit-purpose-0002" } }), /purpose is invalid/);
  assert.equal(f.state.writes, 1);
});

test("consent commands require the installed Distribution owner, not selection flags or successful-looking readiness", async t => {
  for (const failure of ["owner", "member", "false", "undefined", "envelope", "throw", "actual-uninstalled"])
    await t.test(failure, async t => {
      const f = guardedFixture(t), original = structuredClone(f.state.row);
      SERVICE.DefaultPromotionPublicationService = { deliveryEnabled: () => false };
      if (failure === "owner") delete SERVICE.DefaultPromotionDistributionAdmissionService;
      if (failure === "member") SERVICE.DefaultPromotionDistributionAdmissionService = {};
      if (failure === "false") SERVICE.DefaultPromotionDistributionAdmissionService.assertInstalled = async () => false;
      if (failure === "undefined") SERVICE.DefaultPromotionDistributionAdmissionService.assertInstalled = async () => undefined;
      if (failure === "envelope") SERVICE.DefaultPromotionDistributionAdmissionService.assertInstalled = async () => ({ qualified: true });
      if (failure === "throw") SERVICE.DefaultPromotionDistributionAdmissionService.assertInstalled = async () => { throw new Error("uninstalled"); };
      if (failure === "actual-uninstalled") SERVICE.DefaultPromotionDistributionAdmissionService =
        require("../src/service/defaultPromotionDistributionAdmissionService");
      for (const benefitConsumption of [undefined, "ISSUED_COUPON_BENEFIT_V1"]) {
        const payload = { ...f.request.payload };
        if (benefitConsumption) payload.benefitConsumption = benefitConsumption;
        await assert.rejects(owner.manage({ ...f.request, payload }));
      }
      assert.deepEqual(f.state.row, original); assert.equal(f.state.writes, 0); assert.equal(f.state.commands.length, 0);
    });
});

test("installed consent check preserves signed inputs and is required again for exact replay and REVOKE", async t => {
  const f = guardedFixture(t); f.request.payload.benefitConsumption = "ISSUED_COUPON_BENEFIT_V1";
  const original = structuredClone(f.request); let calls = 0;
  SERVICE.DefaultPromotionDistributionAdmissionService.assertInstalled = async request => {
    calls++; assert.equal(f.state.writes, 0); assert.deepEqual(request.authData, original.authData);
    assert.equal(request.authorization, original.authorization); assert.equal(request.tenant, original.tenant);
    return true;
  };
  await owner.manage(f.request); assert.equal(calls, 1); assert.deepEqual(f.request, original);
  const retained = structuredClone(f.state.row);
  SERVICE.DefaultPromotionDistributionAdmissionService.assertInstalled = async () => { calls++; return false; };
  await assert.rejects(owner.manage(f.request));
  await assert.rejects(owner.manage({ ...f.request, payload: { action: "REVOKE", sellerEnterpriseCode: "seller",
    expectedRevision: 5, commandReference: "revoke-installed-0001" } }));
  assert.equal(calls, 3); assert.equal(f.state.writes, 1); assert.deepEqual(f.state.row, retained);
});
