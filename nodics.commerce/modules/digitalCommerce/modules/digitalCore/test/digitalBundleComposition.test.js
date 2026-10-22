/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/test/digitalBundleComposition @description Exercises real read-only composition, governed records, actor isolation and framework-only defaults. @owner digitalCore @layer test */
const test = require('node:test'), assert = require('node:assert/strict');
const service = require('../src/service/defaultDigitalBundleCompositionService');
const authority = require('../src/service/defaultDigitalBundleAuthorityService');
const bundles = require('../src/service/defaultDigitalBundleService');
const auction = require('../src/service/defaultDigitalCommerceAuctionService');
const persistence = require('../src/service/defaultDigitalCommerceEntitlementService');
const defaults = require('../config/properties');
function fixture(t, enterprise = false) {
  const prior = { SERVICE: global.SERVICE, CONFIG: global.CONFIG, NODICS: global.NODICS };
  t.after(() => Object.assign(global, prior));
  const config = structuredClone(defaults), effects = [];
  const r = { tenant: 'tenant', enterpriseCode: 'participant', authorization: 'Bearer original',
    authData: { tenant: 'tenant', enterpriseCode: 'participant', principalType: enterprise ? 'human' : 'customer',
      loginId: 'actor', tokenType: 'access' } };
  const ownerRef = { module: 'profile', schema: enterprise ? 'enterprise' : 'customer', code: enterprise ? 'participant' : 'customer' };
  const row = { tenant: 'tenant', enterpriseCode: 'participant', code: 'binding', revision: 4, active: true, status: 'ACTIVE',
    name: 'Reviewed marketplace', storeCode: 'store', categoryCodes: ['category'], currency: 'POINT',
    priceBookCode: 'book', reward: { programCode: 'program', rewardTypeCode: 'points' }, privateNote: 'hidden' };
  const state = { rows: [row], denied: false, onRead: () => {}, onPlacement: () => {}, count: undefined };
  global.CONFIG = { get: key => config[key] };
  global.NODICS = { getInternalAuthToken: tenant => { assert.equal(tenant, 'tenant'); return 'runtime-token'; } };
  global.SERVICE = {
    DefaultDigitalBundleAuthorityService: { ...authority, profile: async (request, path) => {
      effects.push(path); assert.equal(request.authorization, 'Bearer original');
      return { contractVersion: 1, tenant: request.tenant, enterpriseCode: 'participant', customer: { loginId: 'actor', code: 'customer' } };
    } },
    DefaultDigitalBundleService: { ...bundles, authorize: async (request, owner, action) => {
      effects.push(action); assert.deepEqual(owner, ownerRef); if (state.denied) throw Error('permission revoked');
      return { authorized: true, ownerRef: owner };
    } },
    DefaultDigitalCommerceEntitlementService: persistence,
    DefaultDigitalBundleSettlementService: require('../src/service/defaultDigitalBundleSettlementService'),
    DefaultDigitalBundleListingContextService: { get: async request => {
      effects.push('read'); assert.deepEqual(request.query, { tenant: 'tenant', enterpriseCode: 'participant', active: true, status: 'ACTIVE' });
      assert.deepEqual(request.searchOptions, { pageSize: config.digitalCore.bundleListings.contexts.maximumRecords + 1, pageNumber: 1 });
      state.onRead(); return { code: 'SUC_OWNER', result: state.rows, count: state.count === undefined ? state.rows.length : state.count };
    } },
    DefaultDigitalCommerceAuctionService: auction,
    DefaultPricingBundleListingService: { publish: () => assert.fail('No publishing in selector'), inspect: () => assert.fail('No price command in selector') },
    DefaultModuleService: { invokeModule: async request => {
      if (request.apiName === '/reward-unit-evidence') {
        assert.equal(request.requireInternalAuth, true);
        assert.deepEqual(request.requestBody, { enterpriseCode: 'participant', programCode: 'program', rewardTypeCode: 'points' });
        return { contractVersion: 1, tenant: 'tenant', enterpriseCode: 'participant', programCode: 'program',
          rewardTypeCode: 'points', scale: 3, programRevision: 1, rewardTypeRevision: 4 };
      }
      effects.push('placement'); state.onPlacement();
      assert.equal(request.apiName, '/internal/products/listings/store-context');
      assert.equal(request.header.Authorization, 'Bearer runtime-token');
      assert.deepEqual(request.requestBody, { contractVersion: 1, storeCode: 'store' });
      return { contractVersion: 1, tenant: 'tenant', store: { code: 'store', enterpriseCode: 'merchant', revision: 2, active: true, status: 'ACTIVE' } };
    } },
  };
  return { config, effects, r, ownerRef, row, state };
}
test('framework defaults keep Gift reachable without any listing/model/runtime reads', async t => {
  const f = fixture(t); assert.deepEqual(await service.read(f.r, {}), {
    contractVersion: 1, ownerRef: f.ownerRef, listings: { state: 'DISABLED', items: [] },
  });
  assert.deepEqual(f.effects, ['/customer/identity', 'BUNDLE_CREATE', 'BUNDLE_CREATE']);
});
for (const enterprise of [false, true]) test('governed contexts use current typed owner and independent Store placement: ' + enterprise, async t => {
  const f = fixture(t, enterprise); f.config.digitalCore.bundleListings.enabled = true;
  const result = await service.read(f.r, {});
  assert.deepEqual(result.ownerRef, f.ownerRef); assert.equal(result.listings.state, 'AVAILABLE');
  assert.deepEqual(result.listings.items, [{ code: 'binding', revision: 4, name: f.row.name, storeCode: 'store',
    categoryCodes: ['category'], currency: 'POINT', priceBookCode: 'book', reward: { ...f.row.reward, scale: 3 } }]);
  assert.equal(f.r.enterpriseCode, 'participant'); assert.equal(f.r.authData.loginId, 'actor');
  assert.equal(f.effects.filter(x => x === 'BUNDLE_CREATE').length, 2);
});
test('custom mechanics are honored without defining any business selection defaults', async t => {
  const f = fixture(t); f.config.digitalCore.bundleListings.enabled = true;
  Object.assign(f.config.digitalCore.bundleListings.contexts, { maximumRecords: 1, maximumCategories: 1 });
  assert.equal((await service.read(f.r, {})).listings.items.length, 1);
  f.state.rows.push({ ...f.row, code: 'second' });
  assert.deepEqual((await service.read(f.r, {})).listings, { state: 'UNAVAILABLE', items: [] });
});
for (const patch of [
  { tenant: 'foreign' }, { enterpriseCode: 'merchant' }, { active: false }, { status: 'DRAFT' },
  { reward: { programCode: 'program', rewardTypeCode: 'points', scale: 3 } }, { currency: '' },
  { categoryCodes: ['duplicate', 'duplicate'] }, { revision: -1 }, { name: {} },
]) test('invalid or foreign governed records do not leak choices: ' + JSON.stringify(patch), async t => {
  const f = fixture(t); f.config.digitalCore.bundleListings.enabled = true; Object.assign(f.row, patch);
  assert.deepEqual((await service.read(f.r, {})).listings, { state: 'UNAVAILABLE', items: [] });
});
test('duplicate identities and missing Pricing owner fail closed while Gift remains independent', async t => {
  const f = fixture(t); f.config.digitalCore.bundleListings.enabled = true;
  f.state.rows.push(structuredClone(f.row));
  assert.equal((await service.read(f.r, {})).listings.state, 'UNAVAILABLE');
  f.state.rows.pop(); delete SERVICE.DefaultPricingBundleListingService;
  assert.equal((await service.read(f.r, {})).listings.state, 'UNAVAILABLE');
});
test('placement failure does not fabricate a Store or prevent separately authorized gifting', async t => {
  const f = fixture(t); f.config.digitalCore.bundleListings.enabled = true; f.state.onPlacement = () => { throw Error('offline'); };
  const result = await service.read(f.r, {}); assert.equal(result.listings.state, 'UNAVAILABLE'); assert.deepEqual(result.ownerRef, f.ownerRef);
});
test('revocation across a read rejects the entire response', async t => {
  const f = fixture(t); f.config.digitalCore.bundleListings.enabled = true; f.state.onRead = () => { f.state.denied = true; };
  await assert.rejects(service.read(f.r, {}), /revoked/);
});
test('runtime/auth/config drift cannot be disguised as a listing outage', async t => {
  const f = fixture(t); f.config.digitalCore.bundleListings.enabled = true;
  f.state.onRead = () => { f.r.authData.loginId = 'changed'; }; await assert.rejects(service.read(f.r, {}), /changed/);
  f.r.authData.loginId = 'actor'; f.state.onRead = () => { f.config.digitalCore.bundleListings.contexts.maximumRecords++; };
  await assert.rejects(service.read(f.r, {}), /changed/);
});
test('missing/invalid configuration and caller-selected scope reject before records are read', async t => {
  const f = fixture(t);
  await assert.rejects(service.read(f.r, { ownerRef: f.ownerRef }), /no selectors/);
  f.r.query = { tenant: 'other' }; await assert.rejects(service.read(f.r, {}), /no selectors/); delete f.r.query;
  delete f.config.digitalCore.bundleListings.contexts;
  await assert.rejects(service.read(f.r, {}), /configuration/); assert.deepEqual(f.effects, []);
});
test('empty governed set is explicit, not a demo Store or pricebook fallback', async t => {
  const f = fixture(t); f.config.digitalCore.bundleListings.enabled = true; f.state.rows = [];
  assert.deepEqual((await service.read(f.r, {})).listings, { state: 'AVAILABLE', items: [] });
});
test('a provider-truncated or count-less result never becomes a complete choice set', async t => {
  const f = fixture(t); f.config.digitalCore.bundleListings.enabled = true;
  for (const count of [2, null, -1, '1']) {
    f.state.count = count; assert.deepEqual((await service.read(f.r, {})).listings, { state: 'UNAVAILABLE', items: [] });
  }
});
test('missing, foreign or malformed Loyalty precision fails closed without stored precision fallback', async t => {
  const f = fixture(t); f.config.digitalCore.bundleListings.enabled = true;
  const remote = SERVICE.DefaultModuleService.invokeModule;
  for (const patch of [{ scale: undefined }, { scale: -1 }, { programCode: 'foreign' }, { tenant: 'foreign' }, { rewardTypeRevision: undefined }]) {
    SERVICE.DefaultModuleService.invokeModule = async request => ({ ...await remote(request), ...(request.apiName === '/reward-unit-evidence' ? patch : {}) });
    assert.equal((await service.read(f.r, {})).listings.state, 'UNAVAILABLE');
  }
});
test('direct service invocation cannot substitute a merchant namespace for the original participant', async t => {
  const f = fixture(t, true); f.r.enterpriseCode = 'merchant';
  await assert.rejects(service.read(f.r, {}), /participant namespace/); assert.deepEqual(f.effects, []);
});
test('loader-visible route dispatch is original-token/no-store and schema writes stay privileged', async t => {
  const f = fixture(t); const controller = require('../src/controller/defaultDigitalBundleListingController');
  const route = require('../src/router/routers').digitalCore.customer.bundleCompositionContext;
  assert.equal(route.key, '/bundles/composition-context'); assert.equal(route.controller, 'DefaultDigitalBundleListingController');
  assert.equal(route.operation, 'composition'); assert.equal(route.permission, 'commerce.digital.bundle.manage');
  assert.deepEqual(route.authTokenTypes, ['access']); assert.equal(route.cache.enabled, false); assert.equal(route.requestPrivacy.sensitive, true);
  SERVICE.DefaultDigitalBundleCompositionService = service;
  let cache; const result = await controller.composition({ ...f.r, httpRequest: { body: {}, headers: { authorization: f.r.authorization } },
    httpResponse: { setHeader: (name, value) => { assert.equal(name, 'Cache-Control'); cache = value; } } });
  assert.equal(cache, 'no-store'); assert.deepEqual(result.data.ownerRef, f.ownerRef);
  const schema = require('../src/schemas/schemas').digitalCore.digitalBundleListingContext;
  assert.equal(schema.service.enabled, true); assert.deepEqual(schema.schemaPolicies, ['listingContext']);
  assert.equal(defaults.schemaPolicies.digitalCore.listingContext.accessGroups.customerUserGroup, undefined);
  assert.equal(defaults.schemaPolicies.digitalCore.listingContext.accessGroups.employeeUserGroup, undefined);
});
