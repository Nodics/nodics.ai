/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module product/test/productListingAuthoringAdmission @description Exercises private listing admission with real runtime, privacy, identity and generated-save schema access owners; persistence is isolated, not native qualification. @layer test @owner product */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const owner = require("../src/service/defaultProductListingAuthoringService");
const controller = require("../src/controller/defaultProductListingAuthoringController");
const routes = require("../src/router/routers");
const properties = require("../config/properties");
const schemas = require("../src/schemas/schemas").product;
const foundation = "../../../../../../nodics.foundation/modules/";
const runtime = require(foundation + "nAuth/src/service/identity/defaultServiceTokenService");
const identity = require(foundation + "nAuth/src/service/identity/defaultIdentityGovernanceService");
const logger = require(foundation + "nConfig/src/service/DefaultLoggerService");
const schemaAccess = require(foundation + "nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService");
const saveInitializer = require(foundation + "nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService");
const concurrency = require(foundation + "nDatabase/database/src/service/schema/defaultModelConcurrencyService");
const security = require(foundation + "nRouter/src/service/request/defaultSecuredRequestPipelineService");
const router = require(foundation + "nRouter/src/service/router/defaultRouterOperationService");
const validator = require(foundation + "nRouter/src/service/tooling/defaultOpenapiContractGeneratorService");
const versionedWriter = require(foundation + "nService/vService/src/service/procs/save/defaultModelSaveInitializerService");
const mongodb = require(foundation + "nDatabase/mongodb/src/schemas/model").default;
const versionedMongodb = require(foundation + "nDatabase/mongodb/vMongodb/src/schemas/model").default;
const fs = require('node:fs'), vm = require('node:vm');

/** Reuses the actual versioned writer with artificial human/source proof and exact Store ports. @param {Object} t Test lifecycle. @returns {Object} Isolated authoring fixture. */
function humanFixture(t) {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, NODICS: global.NODICS, UTILS: global.UTILS, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  const f = fixture(false, true), selectors = { contractVersion: 1, assetCode: 'asset-a', listingKey: 'a'.repeat(64),
    expectedRevision: 5, intentDigest: 'b'.repeat(64), storeCode: 'store-a' };
  const command = { ...f.request.payload, idempotencyKey: selectors.listingKey };
  f.request.authData = { tenant: 'tenant-a', entCode: 'enterprise-a', principalType: 'human', tokenType: 'access',
    principalId: 'employee-a', userGroups: ['employeeUserGroup'], permissions: ['commerce.product.publish'] };
  f.request.router = routes.product.operator.createHumanListing;
  f.request.payload = selectors;
  f.request.httpRequest.body = selectors;
  f.request.httpRequest.headers.Authorization = 'Bearer artificial-human-never-forward';
  const proof = { ...selectors, tenant: 'tenant-a', assetRevision: 5, requestRevision: 3, sourceRef: command.sourceRef, ownerRef: command.ownerRef,
    storeContext: { code: 'store-a', enterpriseCode: 'enterprise-a', revision: 3 },
    authoringContext: { catalogVersion: 'catalogStaged', locales: ['en', 'ar'] }, productCommand: command };
  delete proof.expectedRevision; delete proof.storeCode;
  const store = { tenant: 'tenant-a', code: 'store-a', active: true, status: 'ACTIVE', revision: 3,
    enterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: 'enterprise-a' } };
  const transports = [], stores = [], storeReads = [];
  let afterProof = () => {}, afterStore = () => {}, storeResponse;
  f.configuration.product.marketplaceAuthoring.intentSource = { moduleName: 'sourceOwner', connectionName: 'source-owner',
    connectionType: 'abstract', runtimeRole: 'WASTE', timeoutMs: 15000, allowInsecureLoopback: false };
  f.configuration.product.marketplaceAuthoring.storeSource = { moduleName: 'store', connectionName: 'commerce',
    connectionType: 'abstract', runtimeRole: 'COMMERCE', timeoutMs: 15000, allowInsecureLoopback: false };
  const staged = { principalType: 'service', tokenType: 'service', serviceId: 'staged-runtime', tenant: 'tenant-a', entCode: 'default',
    runtimeInstanceId: 'staged-instance', runtimeScope: { projectCode: 'project-a', environmentCode: 'projectLocal', serverCode: 'staged',
      instanceCode: 'staged-instance', assignmentCode: 'staged-assignment' }, modules: ['store'], permissions: ['commerce.store.read'] };
  const placementPair = { storeCode: 'store-a', enterpriseCode: 'enterprise-a' };
  const storeConfig = { placementRead: { enabled: true, runtimeRole: 'COMMERCE', callers: [{ tenant: staged.tenant,
    principalEnterpriseCode: staged.entCode, serviceId: staged.serviceId, ...staged.runtimeScope, placements: [placementPair] }] } };
  // Separate receiver globals model the operational Store owner; only its generated I/O is synthetic.
  const receiver = { exports: {}, require, structuredClone, CONFIG: { get: key => key === 'store' ? storeConfig :
    key === 'runtimeRole' ? { code: 'COMMERCE', publication: 'OPERATIONAL' } : f.configuration[key] },
    SERVICE: { DefaultServiceTokenService: runtime, DefaultIdentityGovernanceService: identity, DefaultLoggerService: logger,
      DefaultStoreService: { get: async request => { storeReads.push(structuredClone(request));
        return { code: 'SUC_FIND_00000', result: [structuredClone(store)], count: 1 }; } } } };
  receiver.module = { exports: receiver.exports };
  vm.createContext(receiver);
  vm.runInContext('structuredClone = value => JSON.parse(JSON.stringify(value));', receiver);
  vm.runInContext(fs.readFileSync(require.resolve('../../store/src/service/defaultStorePlacementService'), 'utf8'), receiver);
  receiver.SERVICE.DefaultStorePlacementService = receiver.module.exports;
  const storeController = { exports: {}, require, SERVICE: receiver.SERVICE };
  storeController.module = { exports: storeController.exports };
  vm.runInNewContext(fs.readFileSync(require.resolve('../../store/src/controller/defaultStorePlacementController'), 'utf8'), storeController);
  NODICS.getInternalAuthToken = tenant => tenant === 'tenant-a' ? 'artificial-runtime-token' : undefined;
  Object.assign(SERVICE, { DefaultSecuredRequestPipelineService: security,
    DefaultStoreService: { get: async () => assert.fail('Product must never read a Staged-local Store') },
    DefaultModuleService: { invokeModule: async input => {
      if (input.apiName === '/internal/stores/placement') {
        stores.push(structuredClone(input));
        const request = { tenant: staged.tenant, authData: structuredClone(staged),
          router: require('../../store/src/router/routers').store.internal.placement,
          httpRequest: { body: structuredClone(input.requestBody), headers: { tenant: staged.tenant } } };
        logger.runRequestPrivacy(request, () => { logger.resolveRequestPrivacy(request, true); logger.admitPrivateRoute(request); });
        const response = storeResponse === undefined
          ? { code: 'SUC_SYS_00000', result: await storeController.module.exports.placement(request) }
          : typeof storeResponse === 'function' ? await storeResponse(input) : structuredClone(storeResponse);
        await afterStore(stores.length); return response;
      }
      assert.equal(input.apiName, '/internal/listing-requests/proof');
      transports.push(structuredClone(input));
      const response = { code: 'SUC_SYS_00000', result: { data: structuredClone(proof) } };
      await afterProof(transports.length); return response;
    } } });
  logger.runRequestPrivacy(f.request, () => {
    assert.equal(logger.resolveRequestPrivacy(f.request, router.isPrivateRoute(f.request.router)), true);
    assert.equal(logger.admitPrivateRoute(f.request), true);
  });
  return { ...f, selectors, proof, store, transports, stores, storeReads, placementPair, storeConfig,
    setStoreResponse: value => { storeResponse = value; }, setAfterStore: fn => { afterStore = fn; },
    setAfterProof: fn => { afterProof = fn; } };
}

test('human listing uses independent original proof and actual version-zero writer without changing human claims', async t => {
  const f = humanFixture(t), original = structuredClone(f.request), result = await controller.createHuman(f.request);
  assert.equal(result.data.publicationRequired, true);
  assert.equal(result.data.versionId, 0);
  assert.equal(result.data.sourceProof.requestRevision, 3);
  assert.equal(f.inserts.length, 6);
  assert(f.inserts.every(item => item.model.versionId === 0));
  assert.deepEqual(f.request, original);
  assert.equal(f.transports.length, 2); assert.equal(f.stores.length, 2);
  for (const input of f.transports) {
    assert.equal(input.apiName, '/internal/listing-requests/proof'); assert.equal(input.local, false);
    assert.equal(input.header.Authorization, 'Bearer artificial-runtime-token');
    assert.deepEqual(Object.keys(input.header).sort(), ['Authorization', 'tenant']);
    assert.equal(input.maxAttempts, 1); assert.equal(input.followRedirects, false);
    assert.deepEqual(input.requestBody, f.selectors);
    assert.deepEqual(input.targetAuthority, { runtimeRole: 'WASTE' });
  }
  for (const input of f.stores) {
    assert.equal(input.apiName, '/internal/stores/placement'); assert.equal(input.local, false);
    assert.equal(input.moduleName, 'store'); assert.equal(input.connectionName, 'commerce');
    assert.equal(input.connectionType, 'abstract'); assert.equal(input.methodName, 'POST');
    assert.equal(input.header.Authorization, 'Bearer artificial-runtime-token');
    assert.deepEqual(Object.keys(input.header).sort(), ['Authorization', 'tenant']);
    assert.equal(input.header.tenant, 'tenant-a'); assert.equal(input.tenant, 'tenant-a');
    assert.equal(input.maxAttempts, 1); assert.equal(input.timeoutMs, 15000);
    assert.equal(input.followRedirects, false); assert.equal(input.rejectUnauthorized, true);
    assert.deepEqual(input.secureTransport, { required: true, allowInsecureLoopback: false });
    assert.deepEqual(input.requestBody, { contractVersion: 1, storeCode: 'store-a' });
    assert.deepEqual(input.targetAuthority, { runtimeRole: 'COMMERCE' });
  }
  const root = f.records.get('DefaultProductService:' + result.data.productCode);
  assert.deepEqual(root.listingAuthoring.sourceProof, result.data.sourceProof);
  assert.equal(root.listingAuthoring.ownerRef.code, 'customer-a');
  assert.equal(result.data.processReference, undefined); assert.equal(result.data.publicationReference, undefined);
  assert.deepEqual((await owner.createHuman(f.request)).productCode, result.data.productCode);
  assert.equal(f.inserts.length, 6, 'Same original proof cannot append graph versions');
  await assert.rejects(owner.create(f.request), /runtime|authority/i);
  await assert.rejects(owner.readIntentProof(f.request, f.selectors), /Private listing/);
  await assert.rejects(owner.readStore(f.request, 'store-a'), /Private listing/);
});

test('human route preserves existing employee permission/privacy and rejects copied admission', async t => {
  const f = humanFixture(t), route = routes.product.operator.createHumanListing;
  assert.deepEqual(route.authTokenTypes, ['access']); assert.deepEqual(route.accessGroups, ['employeeUserGroup']);
  assert.equal(route.permission, 'commerce.product.publish'); assert.equal(route.requestPrivacy.sensitive, true);
  assert.equal(route.cache.enabled, false); assert.equal(validator.isValidRoute('createHumanListing', route), true);
  assert.equal(security.hasAccessGroup(f.request), true); assert.equal(security.hasRoutePermission(f.request), true);
  await assert.rejects(owner.createHuman({ ...f.request }), /human Product publisher/);
  f.request.authData.permissions = [];
  await assert.rejects(owner.createHuman(f.request), /human Product publisher/);
  assert.equal(f.inserts.length, 0); assert.equal(f.transports.length, 0);
});

test('human selectors, namespace, proof binding and authoring mismatches fail before graph writes', async t => {
  for (const mutate of [f => { f.request.payload.enterpriseCode = 'foreign'; },
    f => { f.request.payload.productCommand = f.proof.productCommand; }, f => { f.request.payload.expectedRevision = 3; },
    f => { f.proof.productCommand.ownerRef = { ...f.proof.ownerRef, code: 'foreign' }; },
    f => { f.proof.productCommand.idempotencyKey = 'c'.repeat(64); }, f => { f.proof.assetRevision = 4; },
    f => { f.proof.requestRevision = 6; }, f => { f.proof.intentDigest = 'c'.repeat(64); },
    f => { f.proof.tenant = 'foreign'; },
    f => { f.proof.storeContext.enterpriseCode = 'foreign'; }, f => { f.store.enterpriseRef.code = 'foreign'; },
    f => { f.proof.authoringContext.locales = ['en']; }, f => { delete f.proof.productCommand; },
    f => { f.proof.productCommand.tenant = 'foreign'; }, f => { f.request.httpRequest.headers['X-Tenant-Code'] = 'foreign'; }]) {
    const f = humanFixture(t); mutate(f);
    await assert.rejects(owner.createHuman(f.request)); assert.equal(f.inserts.length, 0);
  }
});

test('partner source authors without Pricing or settlement semantics and retains opaque intent identity', async t => {
  const f = humanFixture(t);
  const sourceRef = { module: 'partnerAssets', schema: 'ownedAsset', code: f.selectors.assetCode };
  f.proof.sourceRef = sourceRef; f.proof.productCommand.sourceRef = structuredClone(sourceRef);
  f.configuration.product.marketplaceAuthoring.intentSource.moduleName = 'partnerAssets';
  f.configuration.product.marketplaceAuthoring.intentSource.runtimeRole = 'PARTNER_ASSETS';
  const before = structuredClone(f.proof);
  const result = await owner.createHuman(f.request);
  assert.equal(f.inserts.length, 6);
  assert.equal(result.sourceProof.intentDigest, before.intentDigest);
  assert.deepEqual(f.proof, before);
  assert(f.transports.every(input => input.moduleName === 'partnerAssets' && input.targetAuthority.runtimeRole === 'PARTNER_ASSETS'));
  assert.equal(Object.hasOwn(before, 'policyRefs'), false);
  assert.equal(Object.hasOwn(before, 'priceRowIntent'), false);
  assert.deepEqual(f.records.get('DefaultProductService:' + result.productCode).listingAuthoring.sourceRef, sourceRef);
  await owner.createHuman(f.request);
  assert.equal(f.inserts.length, 6, 'Original proof replay must not add versions');
});

test('Product proof remains exact and bounded, rejecting domain payloads and malformed Product commands before writes', async t => {
  for (const mutate of [
    f => { f.proof.policyRefs = { carbonSettlementPolicyCode: 'carbon' }; },
    f => { f.proof.priceRowIntent = { unitAmount: '6' }; },
    f => { f.proof.productCommand.policyRefs = {}; },
    f => { f.proof.productCommand.name = 'x'.repeat(181); },
    f => { f.proof.productCommand.description = 'x'.repeat(2001); },
    f => { f.proof.authoringContext.locales = Array.from({ length: 33 }, (_, i) => 'locale' + i); },
    f => { f.proof.unbounded = 'x'.repeat(32769); },
  ]) {
    const f = humanFixture(t); mutate(f);
    await assert.rejects(owner.createHuman(f.request));
    assert.equal(f.inserts.length, 0);
  }
});

test('inert proof transport, unavailable runtime auth and failed owner reads cannot authorize source writes', async t => {
  for (const mutate of [f => { f.configuration.product.marketplaceAuthoring.enabled = false; },
    f => { delete f.configuration.product.marketplaceAuthoring.intentSource; },
    f => { f.configuration.product.marketplaceAuthoring.intentSource.connectionName = 'default'; },
    f => { NODICS.getInternalAuthToken = () => undefined; },
    f => { SERVICE.DefaultModuleService.invokeModule = async () => ({ code: 'ERR_SOURCE_UNAVAILABLE' }); },
    f => { f.setStoreResponse({ code: 'SUC_GET', result: [] }); }]) {
    const f = humanFixture(t); mutate(f);
    await assert.rejects(owner.createHuman(f.request)); assert.equal(f.inserts.length, 0);
  }
  assert.equal(properties.product.marketplaceAuthoring.enabled, false);
  assert.equal(properties.product.marketplaceAuthoring.intentSource.connectionName, null);
});

test('human authority/proof drift retires admission and genuine partial versioned graphs recover original key', async t => {
  const f = humanFixture(t);
  f.setAfterProof(count => { if (count === 1) f.request.authData.principalId = 'another-employee'; });
  await assert.rejects(owner.createHuman(f.request), /authority changed/); assert.equal(f.inserts.length, 0);
  f.request.authData.principalId = 'employee-a'; f.setAfterProof(() => {});
  f.setAfterSave(() => { if (f.inserts.length === 2) throw new Error('Artificial interruption'); });
  f.setReadFailure(true);
  await assert.rejects(owner.createHuman(f.request), /read failure/i);
  f.setReadFailure(false);
  f.setAfterSave(() => { if (f.inserts.length === 2) f.request.authData.principalId = 'changed'; });
  await assert.rejects(owner.createHuman(f.request), /authority changed/); assert.equal(f.inserts.length, 2);
  f.request.authData.principalId = 'employee-a'; f.setAfterSave(() => {});
  const result = await owner.createHuman(f.request); assert.equal(f.inserts.length, 6);
  f.proof.productCommand.name = 'Changed retained terms';
  await assert.rejects(owner.createHuman(f.request), /idempotency conflict/);
  assert.equal(f.inserts.length, 6); assert.equal(result.publicationRequired, true);
});

test('fresh source/Store drift after writes rejects acknowledgment and preserves original immutable graph', async t => {
  for (const mutate of [f => { f.proof.assetRevision++; }, f => { f.store.revision++; }]) {
    const f = humanFixture(t);
    f.setAfterSave(() => { if (f.inserts.length === 6) mutate(f); });
    await assert.rejects(owner.createHuman(f.request), /proof|source/i);
    assert.equal(f.inserts.length, 6);
    await assert.rejects(owner.create(f.request), /runtime|authority/i);
  }
});

test('simultaneous humans retain their own admission and converge only on the same independently proven graph', async t => {
  const f = humanFixture(t), second = structuredClone(f.request);
  second.authData.principalId = 'employee-b';
  logger.runRequestPrivacy(second, () => { logger.resolveRequestPrivacy(second, true); logger.admitPrivateRoute(second); });
  const before = [structuredClone(f.request), structuredClone(second)];
  const results = await Promise.all([owner.createHuman(f.request), owner.createHuman(second)]);
  assert.equal(results[0].productCode, results[1].productCode); assert.equal(f.inserts.length, 6);
  assert.deepEqual([f.request, second], before);
  let release;
  const held = new Promise(resolve => { release = resolve; });
  f.setAfterProof(async count => { if (count === 5) await held; });
  const pending = owner.createHuman(f.request);
  await assert.rejects(owner.createHuman(f.request), /already admitted/);
  release(); await pending;
  await assert.rejects(owner.readIntentProof(second, f.selectors), /Private listing/);
});

test('effective proof-consumer overrides retain exact runtime transport and failure cleanup', async t => {
  const f = humanFixture(t);
  let calls = 0;
  const layered = { ...owner, readIntentProof: function (request, selectors) {
    calls++; return owner.readIntentProof.call(this, request, selectors);
  } };
  f.setAfterProof(() => { throw new Error('Artificial source outage'); });
  await assert.rejects(layered.createHuman(f.request), /Artificial source outage/);
  assert.equal(f.inserts.length, 0);
  f.setAfterProof(() => {});
  assert.equal((await layered.createHuman(f.request)).publicationRequired, true);
  assert.equal(calls, 3);
  await assert.rejects(owner.readStore(f.request, 'store-a'), /Private listing/);
});

/** Admits a separate artificial original runtime entry without reusing human privacy/admission. @param {Object} f Source fixture. @param {Object} payload Exact selectors. @param {string} operation Route key. @returns {Object} Admitted runtime request. */
function listingRuntimeRequest(f, payload, operation) {
  const request = { tenant: 'tenant-a', entCode: 'enterprise-a', payload: structuredClone(payload),
    authData: { principalType: 'service', tokenType: 'service', serviceId: 'runtime-service', tenant: 'tenant-a', entCode: 'enterprise-a',
      runtimeInstanceId: 'instance-a', runtimeScope: { projectCode: 'project-a', environmentCode: 'projectLocal', serverCode: 'waste',
        instanceCode: 'instance-a', assignmentCode: 'assignment-a' }, modules: ['product'], permissions: ['commerce.product.read'] },
    httpRequest: { headers: { 'x-enterprise-code': 'enterprise-a' } }, router: routes.product.operator[operation] };
  request.httpRequest.body = request.payload;
  logger.runRequestPrivacy(request, () => { logger.resolveRequestPrivacy(request, true); logger.admitPrivateRoute(request); });
  return request;
}

test('automatic held-bundle preparation uses original private runtime and real versioned Product writes', async t => {
  const f = humanFixture(t), automatic = require('../src/service/defaultProductBundlePublicationService');
  f.configuration.product.marketplaceAuthoring.bundlePublication = structuredClone(properties.product.marketplaceAuthoring.bundlePublication);
  f.configuration.product.marketplaceAuthoring.bundlePublication.enabled = true;
  SERVICE.DefaultProductBundlePublicationService = automatic;
  SERVICE.DefaultProductListingAuthoringService = owner;
  const operationCode = 'bundle-operation:' + 'a'.repeat(64);
  const proof = { confirmed: true, tenant: 'tenant-a', enterpriseCode: 'enterprise-a', operationCode,
    ownerRef: { module: 'profile', schema: 'enterprise', code: 'seller-enterprise' }, termsDigest: 'b'.repeat(64),
    manifest: { code: 'bundle:' + 'c'.repeat(64), revision: 0, digest: 'd'.repeat(64) },
    terms: { storeCode: 'store-a', name: 'Original bundle', saleMode: 'AUCTION',
      startsAt: '2999-01-01T00:00:00.000Z', endsAt: null, categoryCodes: [] }, product: null, price: null, release: null };
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  SERVICE.DefaultModuleService.invokeModule = async input => input.apiName === '/internal/bundle-listings/proof'
    ? { data: structuredClone(proof) } : invoke(input);
  const r = listingRuntimeRequest(f, { operationCode, storeCode: 'store-a' }, 'bundleListingprepare');
  r.authData.permissions.push('commerce.product.publish');
  const before = structuredClone(r);
  const result = await automatic.execute(r, 'prepare');
  assert.equal(result.confirmed, true); assert.equal(result.versionId, 0); assert.equal(f.inserts.length, 6);
  const localized = f.records.get('DefaultProductLocalizationService:' + result.productCode + '-en');
  assert.deepEqual(localized.attributes.listingWindow, { startsAt: proof.terms.startsAt, endsAt: null });
  assert.equal(localized.attributes.commerceBidding.mode, 'AUCTION');
  assert.equal(localized.attributes.commerceBidding.publicationCode, operationCode);
  assert.deepEqual(localized.attributes.commerceBidding.sellerRef, proof.ownerRef);
  assert.deepEqual(r, before); assert.equal(automatic.admission(r), undefined);
  assert.deepEqual(await automatic.execute(r, 'prepare'), result); assert.equal(f.inserts.length, 6);
  await assert.rejects(automatic.execute({ ...r }, 'prepare'), /authority/);
  proof.terms.name = 'Changed';
  await assert.rejects(automatic.execute(r, 'prepare'), /idempotency conflict/);
});

test('Product dates remain explicit in discovery and invalid calendar normalization is rejected', () => {
  const discovery = require('../src/service/defaultProductDiscoveryService');
  const card = discovery.card.call({ ...discovery, media: () => ({}), price: value => value, availability: value => value },
    { productCode: 'p', payload: { localizedAttributes: { listingWindow: { startsAt: '2999-01-01T00:00:00.000Z', endsAt: null } } } });
  assert.equal(card.startDate, '2999-01-01T00:00:00.000Z'); assert.equal(card.endDate, null);
  assert.throws(() => owner.listingTerms({ listingWindow: { startsAt: '2026-02-30T00:00:00Z', endsAt: null } }), /real UTC/);
  assert.throws(() => discovery.card({ payload: { localizedAttributes: { listingWindow: { startsAt: null } } } }), /window/);
});

test('fixed runtime Store context returns only bounded placement/configuration and cannot grant human membership', async t => {
  const f = humanFixture(t), request = listingRuntimeRequest(f, { contractVersion: 1, storeCode: 'store-a' }, 'listingStoreContext');
  f.store.enterpriseRef.code = 'foreign-enterprise';
  f.placementPair.enterpriseCode = 'foreign-enterprise';
  const before = structuredClone(request), result = await controller.storeContext(request);
  assert.deepEqual(result.data, { contractVersion: 1, tenant: 'tenant-a',
    store: { code: 'store-a', enterpriseCode: 'foreign-enterprise', revision: 3, active: true, status: 'ACTIVE' },
    authoring: { catalogVersion: 'catalogStaged', locales: ['ar', 'en'] } });
  assert.deepEqual(request, before); assert.equal(f.inserts.length, 0); assert.equal(f.transports.length, 0);
  assert.equal(f.stores.length, 1); assert.equal(f.storeReads.length, 2);
  assert.deepEqual(f.stores[0].requestBody, { contractVersion: 1, storeCode: 'store-a' });
  assert.deepEqual(f.storeReads[0].query, { tenant: 'tenant-a', code: 'store-a', status: 'ACTIVE' });
  assert.equal(validator.isValidRoute('listingStoreContext', request.router), true);
  await assert.rejects(owner.storeContext({ ...request }), /authority/);
  await assert.rejects(owner.readStore(request, 'store-a'), /Private listing/);
  request.payload.enterpriseCode = 'foreign-enterprise';
  await assert.rejects(owner.storeContext(request), /selection/);
});

test('Product remote placement accepts canonical enterprise reference forms only through the real Store owner', async t => {
  for (const enterpriseRef of [{ moduleName: 'profile', schemaName: 'enterprise', code: 'enterprise-a' },
    { module: 'profile', schema: 'enterprise', code: 'enterprise-a' }, { code: 'enterprise-a' }, 'enterprise-a',
    { moduleName: 'profile', module: 'profile', schemaName: 'enterprise', schema: 'enterprise', code: 'enterprise-a' }]) {
    const f = humanFixture(t);
    f.store.enterpriseRef = enterpriseRef;
    const original = structuredClone(f.store), request = listingRuntimeRequest(f,
      { contractVersion: 1, storeCode: 'store-a' }, 'listingStoreContext');
    const result = await owner.storeContext(request);
    assert.equal(result.store.enterpriseCode, 'enterprise-a');
    assert.equal(result.store.revision, 3);
    assert.equal(f.storeReads.length, 2);
    assert.deepEqual(f.store, original); assert.equal(f.inserts.length, 0);
    await assert.rejects(owner.storeContext({ ...request }), /authority/);
  }
});

test('Product placement refuses contradictory reference aliases and malformed scope/activity/revision evidence', async t => {
  for (const enterpriseRef of [null, [], {}, { code: '' }, { code: 'invalid enterprise' },
    { moduleName: 'profile', module: 'foreign', code: 'enterprise-a' },
    { moduleName: 'foreign', module: 'profile', code: 'enterprise-a' },
    { schemaName: 'enterprise', schema: 'customer', code: 'enterprise-a' },
    { schemaName: 'customer', schema: 'enterprise', code: 'enterprise-a' },
    { module: '', code: 'enterprise-a' }, { moduleName: null, code: 'enterprise-a' },
    { schema: undefined, code: 'enterprise-a' }]) {
    const f = humanFixture(t);
    f.store.enterpriseRef = enterpriseRef;
    const request = listingRuntimeRequest(f, { contractVersion: 1, storeCode: 'store-a' }, 'listingStoreContext');
    await assert.rejects(owner.storeContext(request), /Store placement/); assert.equal(f.inserts.length, 0);
  }
  for (const patch of [{ tenant: 'foreign' }, { code: 'foreign' }, { active: false }, { status: 'INACTIVE' },
    { revision: 0 }, { revision: '3' }]) {
    const f = humanFixture(t);
    Object.assign(f.store, patch, { enterpriseRef: { code: 'enterprise-a' } });
    const request = listingRuntimeRequest(f, { contractVersion: 1, storeCode: 'store-a' }, 'listingStoreContext');
    await assert.rejects(owner.storeContext(request), /Store placement/); assert.equal(f.inserts.length, 0);
  }
});

test('remote Store transport defaults and invalid bindings refuse without local fallback or graph writes', async t => {
  for (const [name, mutate] of Object.entries({
    absent: f => { delete f.configuration.product.marketplaceAuthoring.storeSource; },
    defaults: f => { f.configuration.product.marketplaceAuthoring.storeSource = structuredClone(properties.product.marketplaceAuthoring.storeSource); },
    module: f => { f.configuration.product.marketplaceAuthoring.storeSource.moduleName = 'product'; },
    connection: f => { f.configuration.product.marketplaceAuthoring.storeSource.connectionName = 'default'; },
    wildcard: f => { f.configuration.product.marketplaceAuthoring.storeSource.connectionName = '*'; },
    type: f => { f.configuration.product.marketplaceAuthoring.storeSource.connectionType = 'http'; },
    role: f => { f.configuration.product.marketplaceAuthoring.storeSource.runtimeRole = ''; },
    timeout: f => { f.configuration.product.marketplaceAuthoring.storeSource.timeoutMs = 15001; },
    loopback: f => { f.configuration.product.marketplaceAuthoring.storeSource.allowInsecureLoopback = 'true'; },
    extra: f => { f.configuration.product.marketplaceAuthoring.storeSource.Authorization = 'do-not-forward'; },
    token: () => { NODICS.getInternalAuthToken = () => undefined; },
    transport: () => { delete SERVICE.DefaultModuleService.invokeModule; },
  })) await t.test(name, async child => {
    const f = humanFixture(child); mutate(f);
    await assert.rejects(owner.createHuman(f.request));
    assert.equal(f.stores.length, 0); assert.equal(f.storeReads.length, 0); assert.equal(f.inserts.length, 0);
    await assert.rejects(owner.readStore(f.request, 'store-a'), /Private listing/);
  });
  assert.equal(properties.product.marketplaceAuthoring.storeSource.moduleName, 'store');
  assert.equal(properties.product.marketplaceAuthoring.storeSource.connectionName, null);
  assert.equal(properties.product.marketplaceAuthoring.storeSource.runtimeRole, 'COMMERCE');
  assert.equal(properties.product.marketplaceAuthoring.storeSource.allowInsecureLoopback, false);
});

test('remote Store consumer rejects failed malformed ambiguous and wrong-identity evidence without fallback', async t => {
  const dto = () => ({ contractVersion: 1, tenant: 'tenant-a', store: {
    code: 'store-a', enterpriseCode: 'enterprise-a', revision: 3, active: true, status: 'ACTIVE' } });
  for (const [name, response] of Object.entries({
    failed: { code: 'ERR_SYS_00000', data: dto() },
    nestedFailure: { result: { success: false, data: dto() } },
    unacknowledged: { acknowledged: false, data: dto() },
    errors: { errors: ['private-detail'], data: dto() },
    unknownCode: { code: 'UNKNOWN', data: dto() },
    status: { statusCode: 500, data: dto() },
    ambiguous: { data: dto(), result: dto() },
    array: [dto()],
    duplicate: { data: [dto(), dto()] },
    deep: Array.from({ length: 7 }).reduce(value => ({ data: value }), dto()),
    version: { ...dto(), contractVersion: 2 },
    tenant: { ...dto(), tenant: 'foreign' },
    extra: { ...dto(), privateField: 'must-not-escape' },
    wrongStore: { ...dto(), store: { ...dto().store, code: 'foreign' } },
    emptyEnterprise: { ...dto(), store: { ...dto().store, enterpriseCode: '' } },
    revision: { ...dto(), store: { ...dto().store, revision: 0 } },
    typedRevision: { ...dto(), store: { ...dto().store, revision: '3' } },
    inactive: { ...dto(), store: { ...dto().store, active: false } },
    statusAlias: { ...dto(), store: { ...dto().store, status: 'ONLINE' } },
    rawReference: { ...dto(), store: { ...dto().store, enterpriseRef: { code: 'enterprise-a' } } },
    missingField: { ...dto(), store: { code: 'store-a', enterpriseCode: 'enterprise-a', revision: 3, status: 'ACTIVE' } },
  })) await t.test(name, async child => {
    const f = humanFixture(child); f.setStoreResponse(response);
    await assert.rejects(owner.createHuman(f.request), /Store placement/);
    assert.equal(f.stores.length, 1); assert.equal(f.inserts.length, 0);
    assert.equal(f.storeReads.length, 0);
    await assert.rejects(owner.readStore(f.request, 'store-a'), /Private listing/);
    f.setStoreResponse(undefined);
    assert.equal((await owner.createHuman(f.request)).publicationRequired, true);
  });
});

test('remote Store transport failure is fixed private-safe, single attempt and retires admission until explicit retry', async t => {
  const f = humanFixture(t);
  f.setStoreResponse(() => { throw new Error('PRIVATE_PROVIDER_TOKEN_SENTINEL'); });
  await assert.rejects(owner.createHuman(f.request), error => {
    assert.equal(error.message, 'Product Store placement is unavailable');
    assert.equal(error.cause, undefined); return true;
  });
  assert.equal(f.stores.length, 1); assert.equal(f.inserts.length, 0);
  await assert.rejects(owner.readStore(f.request, 'store-a'), /Private listing/);
  f.setStoreResponse(undefined);
  assert.equal((await owner.createHuman(f.request)).publicationRequired, true);
  assert.equal(f.inserts.length, 6);
});

test('later-layer Store transport selection preserves the fixed owner route and original runtime credential', async t => {
  const f = humanFixture(t);
  Object.assign(f.configuration.product.marketplaceAuthoring.storeSource,
    { connectionName: 'reviewed-commerce', timeoutMs: 3000, allowInsecureLoopback: true });
  const original = structuredClone(f.request);
  const layered = { ...owner, readStore: function (request, storeCode) { return owner.readStore.call(this, request, storeCode); } };
  assert.equal((await layered.createHuman(f.request)).publicationRequired, true);
  assert.deepEqual(f.request, original);
  assert.equal(f.stores.length, 2);
  for (const input of f.stores) {
    assert.equal(input.connectionName, 'reviewed-commerce'); assert.equal(input.timeoutMs, 3000);
    assert.deepEqual(input.secureTransport, { required: true, allowInsecureLoopback: true });
    assert.equal(input.apiName, '/internal/stores/placement'); assert.equal(input.moduleName, 'store');
    assert.equal(input.header.Authorization, 'Bearer artificial-runtime-token');
    assert.equal(input.maxAttempts, 1); assert.equal(input.followRedirects, false); assert.equal(input.rejectUnauthorized, true);
  }
});

test('deferred remote Store replies retire caller configuration selectors and privacy drift in every handoff entry', async t => {
  for (const entry of ['human', 'storeContext', 'sourceEvidence']) {
    for (const drift of ['actor', 'authReplacement', 'permission', 'alias', 'tenantAlias', 'selector', 'config', 'privacy', 'router']) {
      await t.test(entry + ':' + drift, { timeout: 3000 }, async child => {
        const f = humanFixture(child), request = entry === 'human' ? f.request : listingRuntimeRequest(f,
          entry === 'storeContext' ? { contractVersion: 1, storeCode: 'store-a' } : f.selectors,
          entry === 'storeContext' ? 'listingStoreContext' : 'listingSourceEvidence');
        let release, started;
        const held = new Promise(resolve => { release = resolve; }), entered = new Promise(resolve => { started = resolve; });
        f.setAfterStore(async () => { started(); await held; });
        const pending = entry === 'human' ? owner.createHuman(request) : owner[entry](request);
        await entered;
        if (drift === 'actor') request.authData.principalId = 'changed';
        if (drift === 'authReplacement') request.authData = structuredClone(request.authData);
        if (drift === 'permission') request.authData.permissions = [];
        if (drift === 'alias') request.httpRequest.headers['X-Enterprise-Code'] = 'foreign';
        if (drift === 'tenantAlias') request.httpRequest.headers['X-Tenant-Code'] = 'foreign';
        if (drift === 'selector') request.payload.storeCode = 'foreign';
        if (drift === 'config') f.configuration.product.marketplaceAuthoring.storeSource.connectionName = 'changed';
        if (drift === 'privacy') f.configuration.log.requestPrivacy.qualified = false;
        if (drift === 'router') request.router = { ...request.router };
        release();
        await assert.rejects(pending, /authority|publisher|runtime/i);
        assert.equal(f.inserts.length, 0); assert.equal(f.stores.length, 1);
        await assert.rejects(owner.readStore(request, 'store-a'), /Private listing/);
      });
    }
  }
});

test('runtime Store context refuses conflicting namespace aliases and query selectors before transport', async t => {
  for (const mutate of [request => { request.httpRequest.headers['X-Enterprise-Code'] = 'foreign'; },
    request => { request.httpRequest.headers.entCode = 'foreign'; },
    request => { request.httpRequest.headers['X-Tenant-Code'] = 'foreign'; },
    request => { request.httpRequest.headers.tenant = 'foreign'; },
    request => { request.query = { storeCode: 'foreign' }; },
    request => { request.httpRequest.query = { enterpriseCode: 'foreign' }; }]) {
    const f = humanFixture(t), request = listingRuntimeRequest(f, { contractVersion: 1, storeCode: 'store-a' }, 'listingStoreContext');
    mutate(request); await assert.rejects(owner.storeContext(request));
    assert.equal(f.stores.length, 0); assert.equal(f.inserts.length, 0);
  }
});

test('source evidence qualifies absence or the whole original versioned graph without authoring or publication', async t => {
  const f = humanFixture(t), request = listingRuntimeRequest(f, f.selectors, 'listingSourceEvidence');
  assert.equal((await controller.sourceEvidence(request)).data.product, null);
  assert.equal(f.inserts.length, 0);
  const created = await owner.createHuman(f.request), before = f.inserts.length;
  const result = await owner.sourceEvidence(request);
  assert.deepEqual(result.product, { productCode: created.productCode, variantCode: created.variantCode, sku: created.sku,
    catalogVersion: 'catalogStaged', locales: ['ar', 'en'], versionId: 0 });
  assert.equal(result.productReference, null); assert.deepEqual(result.publicationReferences, []);
  assert.equal(f.inserts.length, before);
  assert.equal(validator.isValidRoute('listingSourceEvidence', request.router), true);
  await assert.rejects(owner.sourceEvidence({ ...request }), /authority/);
  await assert.rejects(owner.create(request), /authority/);
  await assert.rejects(owner.listingPublicationEvidence(request, {}), /Private listing/);
  const missing = [...f.records.keys()].find(key => key.startsWith('DefaultProductLocalizationService:'));
  f.records.delete(missing);
  await assert.rejects(owner.sourceEvidence(request), /incomplete/);
  assert.equal(f.inserts.length, before, 'Inspection must not recover a partial graph');
});

test('foreign source graph inspection requires original runtime business admission and never rewrites signed namespace', async t => {
  const f = humanFixture(t), request = listingRuntimeRequest(f, f.selectors, 'listingSourceEvidence'), original = structuredClone(request);
  f.store.enterpriseRef.code = 'foreign-enterprise'; f.proof.storeContext.enterpriseCode = 'foreign-enterprise';
  f.placementPair.enterpriseCode = 'foreign-enterprise';
  const workflow = require(foundation + 'nPublish/src/service/defaultPublicationApprovalWorkflowService');
  SERVICE.DefaultPublicationApprovalWorkflowService = workflow;
  await assert.rejects(owner.sourceEvidence(request), /business enterprise/);
  f.configuration.publish = { approvalWorkflow: { runtimeEnterpriseScope: { enabled: true, enterpriseCodes: ['foreign-enterprise'] } } };
  assert.equal((await owner.sourceEvidence(request)).product, null);
  assert.deepEqual(request, original); assert.equal(f.inserts.length, 0);
  f.configuration.publish.approvalWorkflow.runtimeEnterpriseScope.enabled = false;
  await assert.rejects(owner.sourceEvidence(request), /business enterprise/);
});

test('source publication evidence uses only the exact sealed nPublish/Process and independently confirmed target version', async t => {
  const f = humanFixture(t), created = await owner.createHuman(f.request);
  const request = listingRuntimeRequest(f, f.selectors, 'listingSourceEvidence');
  const root = f.records.get('DefaultProductService:' + created.productCode);
  root.versionId = 1; root.publicationReferences = { publicationCode: 'publication-a', capturedFromVersion: 0, storeCode: 'store-a', records: [] };
  const scope = { tenant: 'tenant-a', productCode: created.productCode, storeCode: 'store-a' }, version = 'c'.repeat(64);
  const publication = { code: 'publication-a', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', domain: 'product', rootType: 'product',
    rootCode: created.productCode, sourceVersion: '1', targetVersion: version, state: 'ONLINE', auditTrail: [{ toState: 'APPROVED' }],
    activationOperation: { key: 'original-activation' }, workflow: { instanceCode: 'actual-process' } };
  const status = { scope, version, revision: 2, receipt: { scope, committed: true, operationKey: 'original-activation',
    publicationCode: publication.code, sourceVersion: '1', targetVersion: version } };
  let statuses = 0;
  SERVICE.DefaultPublicationLifecycleService = { get: async context => {
    assert.equal(context.publicationCode, 'publication-a'); assert.equal(context.enterpriseCode, 'enterprise-a');
    assert.equal(context.authData.isSystem, true); return structuredClone(publication);
  } };
  SERVICE.DefaultProductPublicationVersionProviderService = { getVersion: async () => ({ scope, version, root: structuredClone(root) }),
    transport: () => ({ getStatus: async () => { statuses++; return structuredClone(status); } }) };
  const result = await owner.sourceEvidence(request);
  assert.deepEqual(result.productReference, { publicationCode: 'publication-a', productCode: created.productCode,
    storeCode: 'store-a', sourceVersion: '1', targetVersion: version });
  assert.deepEqual(result.publicationReferences, [{ domain: 'product', code: 'publication-a', state: 'ONLINE', processCode: 'actual-process' }]);
  assert.equal(statuses, 2); assert.equal(f.inserts.length, 6);
  status.receipt.committed = false;
  await assert.rejects(owner.sourceEvidence(request), /activation is unconfirmed/);
  status.receipt.committed = true;
  publication.state = 'APPROVAL_PENDING';
  assert.equal((await owner.sourceEvidence(request)).productReference, null);
  SERVICE.DefaultPublicationLifecycleService.get = async () => { throw new Error('Publication owner unavailable'); };
  await assert.rejects(owner.sourceEvidence(request), /Publication owner unavailable/);
  assert.equal(f.inserts.length, 6);
});

test('proof locale order is a set while original immutable source terms remain unchanged', async t => {
  const f = humanFixture(t);
  f.proof.authoringContext.locales.reverse();
  const result = await owner.createHuman(f.request);
  assert.deepEqual(result.locales, ['ar', 'en']);
  assert.deepEqual(f.records.get('DefaultProductService:' + result.productCode).listingAuthoring.locales, ['en', 'ar']);
});

test('real Product and Pricing evidence projections cross the Waste consumer boundary without DTO fixtures', async t => {
  const f = humanFixture(t), created = await owner.createHuman(f.request);
  const wasteRoot = '../../../../../../nodics.accelerators/modules/waste/modules/eWaste/';
  const handoff = require(wasteRoot + 'src/service/defaultEWasteListingHandoffService');
  const listing = require(wasteRoot + 'src/service/defaultEWasteDigitalListingService');
  const sale = require(wasteRoot + 'src/service/defaultEWasteDigitalSaleService');
  const pricing = require('../../pricing/src/service/defaultPricingPublicationService');
  const pricingController = require('../../pricing/src/controller/defaultPricingPublicationTargetController');
  const productRequest = listingRuntimeRequest(f, f.selectors, 'listingSourceEvidence');
  const root = f.records.get('DefaultProductService:' + created.productCode);
  root.versionId = 1;
  root.publicationReferences = { publicationCode: 'publication-a', capturedFromVersion: 0, storeCode: 'store-a', records: [] };
  const scope = { tenant: 'tenant-a', productCode: created.productCode, storeCode: 'store-a' }, version = 'c'.repeat(64);
  const publication = { code: 'publication-a', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', domain: 'product', rootType: 'product',
    rootCode: created.productCode, sourceVersion: '1', targetVersion: version, state: 'STAGED', auditTrail: [{ toState: 'APPROVED' }],
    activationOperation: { key: 'original-activation' }, workflow: { instanceCode: 'actual-process' } };
  const status = { scope, version, revision: 2, receipt: { scope, committed: true, operationKey: 'original-activation',
    publicationCode: publication.code, sourceVersion: '1', targetVersion: version } };
  SERVICE.DefaultPublicationLifecycleService = { get: async () => structuredClone(publication) };
  SERVICE.DefaultProductPublicationVersionProviderService = { getVersion: async () => ({ scope, version, root: structuredClone(root) }),
    transport: () => ({ getStatus: async () => structuredClone(status) }) };
  f.configuration.eWaste = { targetAuthorities: { commerceStaged: { runtimeRole: 'COMMERCE_STAGED' } } };
  const proofTransport = SERVICE.DefaultModuleService.invokeModule;
  const storeRequest = listingRuntimeRequest(f, { contractVersion: 1, storeCode: 'store-a' }, 'listingStoreContext');
  // Replace transport only: real controllers, envelope unwrapping and DTO projections execute.
  SERVICE.DefaultModuleService.invokeModule = async input => {
    if (['/internal/listing-requests/proof', '/internal/stores/placement'].includes(input.apiName)) return proofTransport(input);
    assert.equal(input.connectionName, 'commerceStaged'); assert.equal(input.moduleName, 'product');
    if (input.apiName === '/internal/products/listings/store-context') {
      assert.deepEqual(input.requestBody, storeRequest.payload);
      return { code: 'SUC_SYS_00000', result: await controller.storeContext(storeRequest) };
    }
    assert.equal(input.apiName, '/internal/products/listings/source-evidence'); assert.deepEqual(input.requestBody, f.selectors);
    return { code: 'SUC_SYS_00000', result: await controller.sourceEvidence(productRequest) };
  };
  const consumerRequest = { tenant: 'tenant-a' };
  await t.test('Store placement and authoring context survive the real response envelope', async () => {
    assert.deepEqual(await handoff.storeContext(consumerRequest, 'store-a', () => {}), {
      storeContext: f.proof.storeContext, authoringContext: { catalogVersion: 'catalogStaged', locales: ['ar', 'en'] },
    });
  });
  for (const state of ['STAGED', 'APPROVAL_PENDING', 'ONLINE']) await t.test(state, async () => {
    publication.state = state;
    const result = await handoff.sourceEvidence(consumerRequest, f.selectors, () => {});
    assert.equal(result.product.versionId, root.versionId);
    assert.deepEqual(result.product.locales, ['ar', 'en']);
    assert.deepEqual(result.publicationReferences, [{ domain: 'product', code: publication.code, state, processCode: 'actual-process' }]);
    assert.equal(result.productReference?.targetVersion ?? null, state === 'ONLINE' ? version : null);
  });
  publication.state = 'ONLINE';
  const reference = (await owner.sourceEvidence(productRequest)).productReference;
  const settings = { runtimeRole: 'ONLINE', maxDependencies: 10,
    delivery: { enabled: true, rowReleases: true, storeCodes: ['store-a'], rootCodesByStore: { 'store-a': ['book-a'] } } };
  f.configuration.pricing = { publication: settings };
  f.configuration.authSecurity.internalToken.routePermission = 'internal.policy.read';
  const context = { tenant: 'tenant-a', enterpriseCode: 'enterprise-a' };
  const book = { ...context, code: 'book-a', versionId: 0, revision: 1, active: true, status: 'ACTIVE', currency: 'PTS' };
  const row = { ...context, code: 'row-a', versionId: 0, revision: 1, active: true, priceBookCode: book.code,
    productCode: created.productCode, currency: 'PTS', unitAmount: '6', minQuantity: '1' };
  const records = [{ schema: 'priceBook', policy: book }, { schema: 'priceRow', policy: row }];
  const snapshots = { release: [], pointer: [], receipt: [] };
  for (const rootType of ['priceBook', 'priceRow']) {
    const rootCode = rootType === 'priceBook' ? book.code : row.code;
    const payload = { ...context, rootType, rootCode, records, ...(rootType === 'priceRow' ?
      { productReference: reference, productEvidence: { operationKey: 'original-activation', revision: status.revision } } : {}) };
    const digest = pricing.fingerprint(payload), pointerCode = pricing.pointerCode({ rootType, rootCode }, context);
    const operationKey = rootType + '-activation', receiptCode = pricing.fingerprint({ ...context, pointerCode, operationKey });
    snapshots.release.push({ ...context, code: digest, rootType, rootCode, payload, fingerprint: digest });
    snapshots.pointer.push({ ...context, code: pointerCode, rootType, rootCode, version: digest, revision: 2, receiptCode,
      ...(rootType === 'priceRow' ? { priceBookCode: book.code, productCode: row.productCode, storeCode: 'store-a' } : {}) });
    snapshots.receipt.push({ ...context, code: receiptCode, pointerCode, operationKey, publicationCode: rootType + '-publication',
      sourceVersion: digest, targetVersion: digest, fingerprint: digest, expectedRevision: 1, applied: true });
  }
  for (const [kind, name] of [['release', 'Release'], ['pointer', 'Pointer'], ['receipt', 'Receipt']]) {
    SERVICE['DefaultPricingPolicy' + name + 'Service'] = {
      get: async input => { const result = snapshots[kind].filter(value => Object.entries(input.query).every(([key, expected]) =>
        value[key] === expected)).map(value => structuredClone(value)); return { code: 'SUC_GET_00000', result, count: result.length }; },
      save: async () => assert.fail('Cross-owner evidence must not save'), update: async () => assert.fail('Cross-owner evidence must not update'),
    };
  }
  SERVICE.DefaultPriceSelectionService = require('../../pricing/src/service/defaultPriceSelectionService');
  SERVICE.DefaultExactAmountService = require('../../pricing/src/service/defaultExactAmountService');
  SERVICE.DefaultProductPublicationTargetService = { getStatus: async () => structuredClone(status) };
  SERVICE.DefaultPricingPublicationService = pricing;
  const pricingRequest = listingRuntimeRequest(f, { contractVersion: 1, enterpriseCode: context.enterpriseCode,
    priceRowCode: row.code, priceBookCode: book.code, productReference: reference }, 'listingSourceEvidence');
  pricingRequest.authData.modules = ['pricing']; pricingRequest.authData.permissions = ['internal.policy.read'];
  const original = structuredClone(pricingRequest);
  const saleRequest = { ...context, settings: { targets: { commerce: { runtimeRole: 'COMMERCE_ONLINE' } } },
    payload: { idempotencyKey: f.selectors.listingKey } };
  SERVICE.DefaultEWasteDigitalSaleService = { ...sale, recheckAuthority: value => assert.equal(value, saleRequest) };
  SERVICE.DefaultModuleService.invokeModule = async input => {
    assert.equal(input.moduleName, 'pricing'); assert.equal(input.apiName, '/publication/policy/row-evidence');
    assert.deepEqual(input.requestBody, pricingRequest.payload);
    return { code: 'SUC_SYS_00000', result: await pricingController.rowEvidence(pricingRequest) };
  };
  await t.test('Pricing retained digest and exact Product pin survive the real response envelope', async () => {
    const intent = { priceRowIntent: { code: row.code, priceBookCode: book.code, currency: row.currency,
      unitAmount: row.unitAmount, minQuantity: row.minQuantity } };
    const result = await listing.priceRowEvidence(saleRequest, intent, reference);
    assert.match(result.sourceVersion, /^[a-f0-9]{64}$/);
    assert.deepEqual(result.productReference, reference); assert.equal(result.row.unitAmount, '6');
    assert.deepEqual(pricingRequest, original); assert.equal(f.inserts.length, 6);
    status.receipt.committed = false;
    await assert.rejects(listing.priceRowEvidence(saleRequest, intent, reference), /unconfirmed/);
  });
});

function fixture(protectedEntry = true, versioned = false) {
  const request = {
    tenant: "tenant-a", entCode: "enterprise-a",
    authData: {
      principalType: "service", tokenType: "service", serviceId: "runtime-service",
      tenant: "tenant-a", entCode: "enterprise-a", runtimeInstanceId: "instance-a",
      runtimeScope: { projectCode: "project-a", environmentCode: "projectLocal", serverCode: "waste",
        instanceCode: "instance-a", assignmentCode: "assignment-a" },
      modules: ["product"], permissions: ["commerce.product.publish"],
    },
    payload: { sourceRef: { module: "wasteCore", schema: "wasteAsset", code: "asset-a" },
      ownerRef: { module: "profile", schema: "customer", code: "customer-a" },
      name: "Isolated sample listing", description: "Not a native asset", sample: true,
      biddingEnabled: true, idempotencyKey: "original-listing-key" },
    httpRequest: { headers: { "x-enterprise-code": "enterprise-a" } },
    router: routes.product.operator.createListing,
  };
  const configuration = {
    product: { marketplaceAuthoring: { enabled: true, catalogVersion: "catalogStaged", locales: ["en", "ar"] } },
    runtimeRole: { code: "COMMERCE_STAGED", publication: "STAGED" },
    log: { requestPrivacy: { qualified: true, captureMode: "disabled" } },
    identityGovernance: { systemAccessGroups: ["serviceAccountUserGroup"] },
    authSecurity: { internalToken: { runtimeAccessGroups: ["serviceAccountUserGroup"] } },
    accessPoints: { fullAccessPoint: 10, writeAccessPoint: 5, readAccessPoint: 1 },
  };
  global.CONFIG = { get: key => configuration[key] };
  global.UTILS = { isBlank: value => !value || !Object.keys(value).length,
    isArray: Array.isArray, isObject: value => value !== null && typeof value === "object" };
  const models = {};
  global.NODICS = { getServerState: () => "started", getModels: () => models };
  global.CLASSES = { NodicsError: class extends Error {
    constructor(error, message, code) { super(message || error?.message || String(error)); this.code = code || error?.code || (typeof error === "string" ? error : undefined); }
  } };
  const calls = [], reads = [], records = new Map(), history = new Map(), inserts = [];
  const writer = { ...saveInitializer, ...(versioned ? versionedWriter : {}), LOG: { debug() {}, error() {} } };
  let afterSave = () => {};
  let afterRead = () => {};
  let readFailure = false;
  global.SERVICE = {
    DefaultProductListingAuthoringService: owner,
    DefaultServiceTokenService: runtime, DefaultIdentityGovernanceService: identity,
    DefaultLoggerService: logger, DefaultSchemaAccessHandlerService: schemaAccess,
    DefaultModelConcurrencyService: concurrency,
    DefaultModelSaveInitializerService: writer,
    DefaultRecordOwnershipPolicyService: { enforce: async () => true },
  };
  SERVICE.DefaultPipelineService = { start: async (pipeline, input) => {
    assert.equal(pipeline, "modelSaveInitializerPipeline");
    const response = {};
    // Execute actual generated save admission and the selected canonical writer; only driver I/O is isolated.
    for (const step of ["validateModel", "checkAccess", "applyDefaultValues", "removeVirtualProperties", "saveModel"])
      await new Promise((resolve, reject) => writer[step](input, response,
        { nextSuccess: resolve, error: (_request, _response, error) => reject(error) }));
    return response.success;
  } };
  for (const name of ["DefaultProductService", "DefaultProductVariantService", "DefaultProductLocalizationService", "DefaultProductVariantLocalizationService"]) {
    const modelName = name.replace(/^Default/, "").replace(/Service$/, "Model");
    const wrapper = models[modelName] = { rawSchema: { ...properties.schemaPolicies.product.tenantOwned,
      ...(versioned ? { versionedReadMode: "CURRENT" } : {}) }, versioned, primaryKey: "code" };
    if (versioned) Object.assign(wrapper, mongodb, versionedMongodb, {
      find(query, options = {}) {
        let rows = [...history.entries()].filter(([key, row]) => key.startsWith(name + ":") &&
          Object.entries(query).every(([field, value]) => row[field] === value)).map(([, row]) => structuredClone(row));
        return { sort(sort) { if (sort.versionId) rows.sort((a, b) => sort.versionId * (a.versionId - b.versionId)); return this; },
          count: async () => rows.length,
          toArray: async () => rows.slice(0, options.limit || rows.length) };
      },
      insertOne: async model => {
        const key = name + ":" + model.code + ":" + model.versionId;
        if (history.has(key)) throw Object.assign(Error("Duplicate immutable identity"), { code: 11000 });
        inserts.push({ name, model: structuredClone(model) });
        history.set(key, structuredClone(model)); records.set(name + ":" + model.code, structuredClone(model));
        return { acknowledged: true, insertedId: key };
      },
    });
    SERVICE[name] = { get: async input => {
      assert(schemaAccess.getAccessPoint(input.authData, properties.schemaPolicies.product.tenantOwned.accessGroups) >= configuration.accessPoints.readAccessPoint);
      assert.equal(input.options.skipItemCache, true);
      assert.equal(input.searchOptions.pageSize, 2);
      reads.push({ name, ...structuredClone(input) });
      if (readFailure) throw Error("Isolated read failure");
      const row = records.get(name + ":" + input.query.code);
      const result = row && Object.entries(input.query).every(([key, value]) => row[key] === value) ? [structuredClone(row)] : [];
      const response = { code: "SUC_GET_00000", result, count: result.length };
      await afterRead(response);
      return response;
    }, save: async input => {
      await new Promise((resolve, reject) => saveInitializer.checkAccess.call({ LOG: { debug() {} } },
        { ...input, schemaModel: { rawSchema: properties.schemaPolicies.product.tenantOwned } }, {},
        { nextSuccess: resolve, error: (_request, _response, error) => reject(error) }));
      assert.deepEqual(input.query, { tenant: "tenant-a", enterpriseCode: "enterprise-a", code: input.model.code });
      assert.equal(input.model.tenant, "tenant-a");
      assert.equal(input.model.enterpriseCode, "enterprise-a");
      calls.push({ name, ...structuredClone(input) });
      const key = name + ":" + input.model.code;
      if (versioned) {
        const generated = require(foundation + "nService/src/service/gen/" + name);
        const result = await generated.save(input);
        await afterSave(input);
        return result;
      }
      await saveInitializer.persistModel.call(saveInitializer, { ...input,
        schemaModel: { rawSchema: properties.schemaPolicies.product.tenantOwned, versioned: false,
          compareAndSetItem: async command => {
            assert.equal(command.operation, "create");
            assert.equal(command.insertOnly, true);
            if (records.has(key)) throw Error("Existing scope conflict or duplicate identity");
            records.set(key, structuredClone(command.model));
            return command.model;
          } } });
      await afterSave(input);
      return { code: "SUC_SAVE_00000", model: input.model };
    } };
  }
  if (protectedEntry) logger.runRequestPrivacy(request, () => {
    assert.equal(logger.resolveRequestPrivacy(request, router.isPrivateRoute(request.router)), true);
    assert.equal(logger.admitPrivateRoute(request), true);
  });
  return { request, configuration, calls, reads, records, models, history, inserts, writer,
    setAfterSave: fn => { afterSave = fn; }, setAfterRead: fn => { afterRead = fn; },
    setReadFailure: value => { readFailure = value; } };
}

test("group-free admitted runtime authors only the exact Product graph without acquiring schema groups", async () => {
  const f = fixture(), original = structuredClone(f.request);
  assert.equal(security.hasAccessGroup(f.request), true);
  assert.equal(security.hasRoutePermission(f.request), true);
  assert.throws(() => schemaAccess.getAccessPoint(f.request.authData, properties.schemaPolicies.product.tenantOwned.accessGroups));
  const result = await owner.create(f.request);
  const expected = "LISTING_" + crypto.createHash("sha256")
    .update("tenant-a:wasteCore:asset-a:original-listing-key").digest("hex").slice(0, 24).toUpperCase();
  assert.equal(result.productCode, expected);
  assert.equal(result.variantCode, expected + "_VARIANT");
  assert.equal(result.sku, expected + "_SKU");
  assert.equal(f.calls.length, 6);
  assert(f.calls.every(call => call.authData.isSystem === true && call.authData.serviceId === original.authData.serviceId));
  assert.deepEqual(f.request, original);
  assert.equal(f.request.authData.userGroups, undefined);
  assert.throws(() => schemaAccess.getAccessPoint(f.request.authData, properties.schemaPolicies.product.tenantOwned.accessGroups));
  assert.deepEqual(await owner.create(f.request), result);
  assert.equal(f.records.size, 6);
  assert.equal(f.calls.length, 6);
  assert(f.reads.every(call => call.authData.isSystem === true && call.tenant === original.tenant));
  assert.equal(schemas.product.definition.listingAuthoring.type, "object");
  assert.equal(schemas.productLocalization.definition.enterpriseCode.type, "string");
  assert.equal(schemas.productVariantLocalization.definition.enterpriseCode.type, "string");
});

test("the real controller preserves exact private admission and the route retains service-only permission", async () => {
  const f = fixture();
  assert.equal(validator.isValidRoute("createListing", f.request.router), true);
  assert.equal(f.request.router.secured, true);
  assert.deepEqual(f.request.router.authTokenTypes, ["service"]);
  assert.deepEqual(f.request.router.accessGroups, ["serviceAccountUserGroup"]);
  assert.equal(f.request.router.permission, "commerce.product.publish");
  assert.deepEqual(f.request.router.cache, { enabled: false });
  f.request.httpRequest.body = f.request.payload;
  const result = await controller.create(f.request);
  assert(result.data.productCode.startsWith("LISTING_"));
  assert.equal(f.calls.length, 6);
});

test("forged or copied private flags cannot admit a detached listing request", async () => {
  for (const copy of [false, true]) {
    const f = fixture(copy);
    const request = copy ? { ...f.request } : f.request;
    request.privateCaptureQualified = true;
    request.requestPrivacy = { sensitive: true };
    await assert.rejects(owner.create(request), /authority/);
    assert.equal(f.calls.length, 0);
  }
});

test("invalid principal, permission, capability and deployment scope refuse before persistence", async () => {
  for (const mutate of [
    r => { r.authData.tokenType = "access"; }, r => { r.authData.principalType = "customer"; },
    r => { r.authData.isSystem = true; }, r => { r.authData.permissions = []; },
    r => { r.authData.modules = []; }, r => { delete r.authData.serviceId; },
    r => { r.authData.runtimeScope.instanceCode = "other"; }, r => { delete r.authData.runtimeScope.assignmentCode; },
    r => { r.tenant = "foreign"; }, r => { r.tenantCode = "foreign"; },
    r => { r.authData.enterpriseCode = "foreign"; }, r => { r.entCode = "foreign"; },
    r => { r.httpRequest.headers["x-enterprise-code"] = "foreign"; },
  ]) {
    const f = fixture(); mutate(f.request);
    await assert.rejects(owner.create(f.request));
    assert.equal(f.calls.length, 0);
  }
});

test("payload tenant or enterprise selection never widens the signed namespace", async () => {
  for (const location of ["root", "sourceRef", "ownerRef"]) for (const key of ["tenant", "enterpriseCode"]) {
    const f = fixture();
    (location === "root" ? f.request.payload : f.request.payload[location])[key] = "foreign";
    await assert.rejects(owner.create(f.request), /scope/);
    assert.equal(f.calls.length, 0);
  }
});

test("disabled, non-Staged and unqualified installations do not mint persistence authority", async () => {
  for (const mutate of [
    f => { f.configuration.product.marketplaceAuthoring.enabled = false; },
    f => { f.configuration.runtimeRole.publication = "ONLINE"; },
    f => { f.configuration.log.requestPrivacy.qualified = false; },
    f => { delete SERVICE.DefaultIdentityGovernanceService; },
  ]) {
    const f = fixture(); mutate(f);
    await assert.rejects(owner.create(f.request));
    assert.equal(f.calls.length, 0);
  }
});

test("local owner requests still traverse generated schema enforcement", async () => {
  const f = fixture(); f.configuration.identityGovernance.systemAccessGroups = [];
  await assert.rejects(owner.create(f.request));
  assert.equal(f.calls.length, 0);
  assert.equal(f.request.authData.userGroups, undefined);
});

test("listing recovery cannot adopt or overwrite an existing foreign-enterprise Product", async () => {
  const f = fixture();
  const code = "LISTING_" + crypto.createHash("sha256")
    .update("tenant-a:wasteCore:asset-a:original-listing-key").digest("hex").slice(0, 24).toUpperCase();
  const foreign = { code, tenant: "tenant-a", enterpriseCode: "foreign", name: "Unrelated Product" };
  f.records.set("DefaultProductService:" + code, foreign);
  await assert.rejects(owner.create(f.request), /scope conflict/);
  assert.equal(f.records.size, 1);
  assert.deepEqual(f.records.get("DefaultProductService:" + code), foreign);
  assert.equal(f.calls.length, 1);
});

test("authority, input, policy or private-capture drift stops the remaining graph saves", async () => {
  for (const mutate of [
    f => { f.request.authData.permissions = []; }, f => { f.request.tenant = "foreign"; },
    f => { f.request.payload.ownerRef.code = "other"; },
    f => { f.configuration.product.marketplaceAuthoring.catalogVersion = "other"; },
    f => { f.configuration.log.requestPrivacy.qualified = false; },
    f => { f.configuration.runtimeRole.code = "other"; },
  ]) {
    const f = fixture(); f.setAfterSave(async () => mutate(f));
    await assert.rejects(owner.create(f.request));
    assert.equal(f.calls.length, 1);
    assert.equal(f.request.authData.userGroups, undefined);
  }
});

test("interrupted authoring recovers the original deterministic graph without changing the command", async () => {
  const f = fixture(), original = structuredClone(f.request);
  f.setAfterSave(async () => { f.setReadFailure(true); throw Error("Isolated lost acknowledgement"); });
  await assert.rejects(owner.create(f.request), /read failure/);
  assert.equal(f.records.size, 1);
  f.setAfterSave(async () => {});
  f.setReadFailure(false);
  await owner.create(f.request);
  assert.equal(f.records.size, 6);
  assert.equal(f.calls.length, 6);
  assert.deepEqual(f.request, original);
});

test("changed owner, source schema or authored terms conflict without rewriting an existing graph", async () => {
  for (const mutate of [
    p => { p.name = "Changed title"; }, p => { p.ownerRef.code = "other-owner"; },
    p => { p.sourceRef.schema = "other-source"; }, p => { p.description = "Changed terms"; },
    p => { p.biddingEnabled = false; }, p => { p.imageUrl = "https://example.test/other.png"; },
    p => { p.issuer = "Other issuer"; }, p => { p.sample = false; },
  ]) {
    const f = fixture();
    await owner.create(f.request);
    const before = structuredClone([...f.records.entries()]);
    const calls = f.calls.length;
    mutate(f.request.payload);
    await assert.rejects(owner.create(f.request), /idempotency conflict/);
    assert.equal(f.calls.length, calls);
    assert.deepEqual([...f.records.entries()], before);
  }
});

test("unbound same-scope roots and unrelated graph components cannot be adopted", async () => {
  for (const change of ["unbound-root", "variant-owner", "localization-title"]) {
    const f = fixture();
    await owner.create(f.request);
    if (change === "unbound-root") delete [...f.records.values()].find(row => row.listingAuthoring).listingAuthoring;
    if (change === "variant-owner") [...f.records.values()].find(row => row.sku).attributes.ownerRef.code = "other";
    if (change === "localization-title") [...f.records.values()].find(row => row.locale && row.name).name = "Unrelated";
    const before = structuredClone([...f.records.entries()]), calls = f.calls.length;
    await assert.rejects(owner.create(f.request), /idempotency conflict/);
    assert.equal(f.calls.length, calls);
    assert.deepEqual([...f.records.entries()], before);
  }
});

test("every genuine partial graph resumes with missing inserts only and immutable root terms", async () => {
  for (let completed = 1; completed < 6; completed++) {
    const f = fixture();
    await owner.create(f.request);
    const entries = [...f.records.entries()];
    entries.slice(completed).forEach(([key]) => f.records.delete(key));
    const before = structuredClone([...f.records.entries()]), calls = f.calls.length;
    await owner.create(f.request);
    assert.equal(f.records.size, 6);
    assert.equal(f.calls.length - calls, 6 - completed);
    before.forEach(([key, row]) => assert.deepEqual(f.records.get(key), row));
  }
});

test("an orphan graph without an original root fails before inserting anything", async () => {
  const f = fixture();
  await owner.create(f.request);
  const root = [...f.records.entries()].find(([, row]) => row.listingAuthoring);
  f.records.delete(root[0]);
  const calls = f.calls.length;
  await assert.rejects(owner.create(f.request), /no original root/);
  assert.equal(f.calls.length, calls);
  assert.equal(f.records.size, 5);
});

test("lost insert acknowledgements use exact readback rather than an overwrite", async () => {
  const f = fixture();
  f.setAfterSave(async () => { throw Error("Isolated lost acknowledgement"); });
  await owner.create(f.request);
  assert.equal(f.records.size, 6);
  assert.equal(f.calls.length, 6);
});

test("concurrent changed terms cannot overwrite the winning insert-only root", async () => {
  const f = fixture();
  const other = { ...f.request, authData: structuredClone(f.request.authData), payload: structuredClone(f.request.payload) };
  other.payload.name = "Conflicting title";
  logger.runRequestPrivacy(other, () => {
    logger.resolveRequestPrivacy(other, true);
    assert.equal(logger.admitPrivateRoute(other), true);
  });
  const results = await Promise.allSettled([owner.create(f.request), owner.create(other)]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(results.filter(result => result.status === "rejected").length, 1);
  assert.equal(f.records.size, 6);
  const root = [...f.records.values()].find(row => row.listingAuthoring);
  assert([...f.records.values()].filter(row => row.name).every(row => row.name === root.name));
});

test("concurrent original commands converge on one insert-only graph", async () => {
  const f = fixture();
  const other = { ...f.request, authData: structuredClone(f.request.authData), payload: structuredClone(f.request.payload) };
  logger.runRequestPrivacy(other, () => {
    logger.resolveRequestPrivacy(other, true);
    assert.equal(logger.admitPrivateRoute(other), true);
  });
  const [first, second] = await Promise.all([owner.create(f.request), owner.create(other)]);
  assert.deepEqual(first, second);
  assert.equal(f.records.size, 6);
  assert(f.calls.every(call => call.options.insertOnly === true));
});

test("malformed readback and read-boundary authority drift fail before saving", async () => {
  for (const mutate of [
    response => { response.code = "ERR_GET_00000"; }, response => { response.count = 2; },
    response => { response.result = [{}, {}]; },
  ]) {
    const f = fixture(); f.setAfterRead(async response => mutate(response));
    await assert.rejects(owner.create(f.request), /readback/);
    assert.equal(f.calls.length, 0);
  }
  const f = fixture(); f.setAfterRead(async () => { f.request.authData.permissions = []; });
  await assert.rejects(owner.create(f.request));
  assert.equal(f.calls.length, 0);
});

test("actual merged writer rejects insertOnly on a versioned model before driver writes", async () => {
  const f = fixture(true, true);
  await assert.rejects(f.writer.persistModel({ schemaModel: f.models.ProductModel,
    query: { code: "probe" }, model: { code: "probe", versionId: 0 },
    options: { recursive: false, insertOnly: true } }), { code: "ERR_SAVE_00003" });
  assert.equal(f.inserts.length, 0);
});

test("generated versioned listing saves use real base/vService and vMongodb first-version persistence", async () => {
  const f = fixture(true, true), original = structuredClone(f.request);
  const result = await owner.create(f.request);
  assert.equal(f.records.size, 6);
  assert.equal(f.history.size, 6);
  assert(f.inserts.every(entry => entry.model.versionId === 0));
  assert(f.calls.every(call => call.model.versionId === 0 && call.options.insertOnly === undefined));
  const before = structuredClone([...f.history.entries()]);
  assert.deepEqual(await owner.create(f.request), result);
  assert.equal(f.inserts.length, 6);
  assert.deepEqual([...f.history.entries()], before);
  assert.deepEqual(f.request, original);
});

test("real versioned writer recovery retains each original graph prefix and lost acknowledgements", async () => {
  for (let completed = 1; completed < 6; completed++) {
    const f = fixture(true, true);
    f.setAfterSave(async () => {
      if (f.inserts.length === completed) { f.setReadFailure(true); throw Error("Lost versioned acknowledgement"); }
    });
    await assert.rejects(owner.create(f.request), /read failure/);
    assert.equal(f.history.size, completed);
    const before = structuredClone([...f.history.entries()]);
    f.setReadFailure(false); f.setAfterSave(async () => {});
    await owner.create(f.request);
    assert.equal(f.history.size, 6);
    assert.equal(f.inserts.length, 6);
    before.forEach(([key, row]) => assert.deepEqual(f.history.get(key), row));
  }
  const f = fixture(true, true);
  f.setAfterSave(async () => { throw Error("Lost versioned acknowledgement"); });
  await owner.create(f.request);
  assert.equal(f.inserts.length, 6);
});

test("real versioned writer never appends a successor for changed listing owner or terms", async () => {
  for (const mutate of [p => { p.ownerRef.code = "other"; }, p => { p.name = "Other"; },
    p => { p.sourceRef.schema = "other"; }, p => { p.description = "Other"; }]) {
    const f = fixture(true, true);
    await owner.create(f.request);
    const before = structuredClone([...f.history.entries()]);
    mutate(f.request.payload);
    await assert.rejects(owner.create(f.request), /idempotency conflict/);
    assert.equal(f.inserts.length, 6);
    assert.deepEqual([...f.history.entries()], before);
  }
});

test("real immutable version-zero uniqueness resolves identical and conflicting concurrent listings", async () => {
  for (const changed of [false, true]) {
    const f = fixture(true, true);
    const other = { ...f.request, authData: structuredClone(f.request.authData), payload: structuredClone(f.request.payload) };
    if (changed) other.payload.name = "Concurrent other terms";
    logger.runRequestPrivacy(other, () => { logger.resolveRequestPrivacy(other, true); logger.admitPrivateRoute(other); });
    const results = await Promise.allSettled([owner.create(f.request), owner.create(other)]);
    assert.equal(results.filter(result => result.status === "fulfilled").length, changed ? 1 : 2);
    assert.equal(f.inserts.length, 6);
    assert.equal(f.history.size, 6);
    const root = [...f.records.values()].find(row => row.listingAuthoring);
    assert([...f.records.values()].filter(row => row.name).every(row => row.name === root.name));
    assert(f.inserts.every(entry => entry.model.versionId === 0));
  }
});

test("unqualified versioned storage and writer drift fail closed without ordinary persistence", async () => {
  for (const mutate of [
    f => { delete f.models.ProductVariantModel.saveVersionedItems; },
    f => { f.models.ProductVariantModel.rawSchema.versionedReadMode = "HISTORY"; },
    f => { delete f.models.ProductVariantModel.getCurrentVersionItems; },
    f => { f.models.ProductVariantModel.primaryKey = "other"; },
    f => { f.writer.resolveSaveMethod = saveInitializer.resolveSaveMethod; },
  ]) {
    const f = fixture(true, true); mutate(f);
    await assert.rejects(owner.create(f.request));
    assert.equal(f.inserts.length, 0);
    assert.equal(f.calls.length, 0);
  }
  const f = fixture(true, true);
  f.setAfterSave(async () => { f.models.ProductVariantModel.versioned = false; });
  await assert.rejects(owner.create(f.request), /authority changed/);
  assert.equal(f.inserts.length, 1);
});

test("actual version history read failure cannot become empty history or an ordinary upsert", async () => {
  const f = fixture(true, true);
  f.models.ProductModel.find = () => { throw Object.assign(Error("History unavailable"), { code: "ERR_MDL_00000" }); };
  await assert.rejects(owner.create(f.request), { code: "ERR_SAVE_00000" });
  assert.equal(f.inserts.length, 0);
});

test("canonical versioned provider accepts only identical version-zero replay without appending history", async () => {
  const f = fixture(true, true);
  await owner.create(f.request);
  const row = structuredClone([...f.history.values()].find(value => value.listingAuthoring));
  const input = { schemaModel: f.models.ProductModel, query: { tenant: row.tenant, enterpriseCode: row.enterpriseCode, code: row.code },
    model: { ...row, created: new Date(0), updated: new Date(0) }, options: { recursive: false } };
  assert.deepEqual(await f.writer.persistModel(input), row);
  assert.equal(f.inserts.length, 6);
  input.model.name = "Cannot append changed version zero";
  await assert.rejects(f.writer.persistModel(input), { code: "ERR_MDL_00004" });
  assert.equal(f.inserts.length, 6);
});

test("versioned readback cannot adopt an installed row with missing version identity", async () => {
  const f = fixture(true, true);
  await owner.create(f.request);
  delete [...f.records.values()].find(row => row.listingAuthoring).versionId;
  await assert.rejects(owner.create(f.request), /idempotency conflict/);
  assert.equal(f.inserts.length, 6);
});

test("versioned authoring refuses forged admission and foreign-scope immutable identity collisions", async () => {
  const forged = fixture(false, true);
  await assert.rejects(owner.create(forged.request));
  assert.equal(forged.inserts.length, 0);
  const f = fixture(true, true);
  const code = "LISTING_" + crypto.createHash("sha256").update("tenant-a:wasteCore:asset-a:original-listing-key")
    .digest("hex").slice(0, 24).toUpperCase();
  await f.writer.persistModel({ schemaModel: f.models.ProductModel,
    query: { code, tenant: "tenant-a", enterpriseCode: "enterprise-other" }, options: { recursive: false },
    model: { code, tenant: "tenant-a", enterpriseCode: "enterprise-other", versionId: 0, name: "Unrelated foreign root" } });
  const before = structuredClone([...f.history.entries()]);
  await assert.rejects(owner.create(f.request), { code: "ERR_SAVE_00000" });
  assert.equal(f.inserts.length, 1);
  assert.deepEqual([...f.history.entries()], before);
});

test("actual projection builder retains complete digital ownership classification in every listing locale", async () => {
  const f = fixture(true, true);
  const result = await owner.create(f.request);
  const builder = require("../src/service/defaultProductLocalizedProjectionBuilderService");
  SERVICE.DefaultProductLocalizationPolicyService = require("../src/service/defaultProductLocalizationPolicyService");
  const digital = require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceCheckoutService");
  SERVICE.DefaultDigitalCommerceOwnershipService = require("../../../../digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceOwnershipService");
  global.ENUMS = { DigitalOwnershipAvailabilityReason: {
    DIGITAL_OWNERSHIP_NOT_SELECTED: { key: "DIGITAL_OWNERSHIP_NOT_SELECTED" },
    DIGITAL_OWNERSHIP_NOT_QUALIFIED: { key: "DIGITAL_OWNERSHIP_NOT_QUALIFIED" },
  } };
  let physicalCalls = 0, couponCalls = 0;
  SERVICE.DefaultInventoryOperationService = { availability: () => { physicalCalls++; throw Error("Physical fallback"); } };
  SERVICE.DefaultPromotionOperationService = { couponPoolAvailability: () => { couponCalls++; throw Error("Coupon fallback"); } };
  const product = f.records.get("DefaultProductService:" + result.productCode);
  const variant = f.records.get("DefaultProductVariantService:" + result.variantCode);
  const localizations = [...f.records.entries()].filter(([key]) => key.startsWith("DefaultProductLocalizationService:")).map(([, row]) => row);
  assert.equal(product.digitalDeliveryType, "DIGITAL_OWNERSHIP");
  for (const locale of ["en", "ar"]) {
    const r = { tenant: "tenant-a", enterpriseCode: "enterprise-a", productCode: result.productCode,
      variantCode: result.variantCode, sku: result.sku, storeCode: "store-a", locale, quantity: 1 };
    const projection = builder.build(r, { product, variants: [variant], variantCodes: [variant.code], localizations, locale, storeCode: r.storeCode });
    assert.equal(projection.payload.localizedAttributes.productType, "DIGITAL");
    assert.equal(projection.payload.localizedAttributes.digitalDeliveryType, "DIGITAL_OWNERSHIP");
    assert.equal(projection.payload.localizedAttributes.inventoryStrategy, "DIGITAL_COMMERCE");
    assert.equal(projection.payload.localizedAttributes.assetCode, f.request.payload.sourceRef.code);
    const availability = await digital.availabilityFromProjection(r, projection);
    assert.equal(availability.digitalDeliveryType, "DIGITAL_OWNERSHIP");
    assert.equal(availability.available, false, "classification is not configured owner/binding authority");
    assert.equal(availability.reasonCode, "DIGITAL_OWNERSHIP_NOT_SELECTED");
  }
  assert.equal(physicalCalls, 0); assert.equal(couponCalls, 0);
});
