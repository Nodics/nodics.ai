/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module digitalCore/test/digitalBundlePublication @description Exercises persisted bundle publication checkpoints with real Digital owners and isolated generated storage/remote owner I/O. @layer test @owner digitalCore */
const test = require('node:test'), assert = require('node:assert/strict');
const listing = require('../src/service/defaultDigitalCommerceAuctionService');
const bundles = require('../src/service/defaultDigitalBundleService');
const persistence = require('../src/service/defaultDigitalCommerceEntitlementService');
const defaults = require('../config/properties');
const exact = require('../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService');
const clone = structuredClone;

test('bundle publication has one secured owner adapter and no duplicate customer alias', () => {
  const customer = require('../src/router/routers').digitalCore.customer;
  const publicationRoutes = Object.values(customer).filter(route =>
    route.key === '/bundle-listings' || route.key === '/bundles/listings');
  assert.equal(publicationRoutes.length, 1);
  assert.equal(publicationRoutes[0].key, '/bundle-listings');
  assert.equal(publicationRoutes[0].controller, 'DefaultDigitalBundleListingController');
  assert.equal(publicationRoutes[0].operation, 'publish');
  assert.equal(publicationRoutes[0].permission, 'commerce.digital.bundle.manage');
  assert.equal(publicationRoutes[0].secured, true);
  assert.equal(publicationRoutes[0].cache.enabled, false);
  assert.equal(publicationRoutes[0].requestPrivacy.sensitive, true);
  assert.equal(customer.publishBundle, undefined);
  assert.equal(require('../src/controller/defaultDigitalCommerceCustomerController').publishBundle, undefined);
  assert.equal(require('../src/facade/defaultDigitalCommerceCustomerFacade').publishBundle, undefined);
});

function fixture(t) {
  const before = { SERVICE: global.SERVICE, CONFIG: global.CONFIG, NODICS: global.NODICS, UTILS: global.UTILS, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, before));
  const policy = clone(defaults.digitalCore); policy.bundleListings.enabled = true;
  policy.bundles.ownerAuthorityService = 'Authority'; policy.bundles.componentProviders.CERTIFICATE = 'Components';
  const rows = {}, effects = [], holds = new Map(); let failPublish = false, failWithdraw = false;
  const publishPolicy = clone(require('../../../../../../nodics.foundation/modules/nPublish/config/properties').publish);
  global.CONFIG = { get: k => k === 'digitalCore' ? policy : k === 'publish' ? publishPolicy : undefined };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
  global.UTILS = { createModelName: n => n };
  global.NODICS = { getInternalAuthToken: () => 'runtime', getModels: () => Object.fromEntries(['digitalBundleManifest', 'digitalBundleOperation']
    .map(n => [n, { primaryKey: 'code', rawSchema: {}, compareAndSetItem() {} }])) };
  global.SERVICE = { DefaultDigitalBundleService: bundles, DefaultDigitalCommerceEntitlementService: persistence,
    DefaultDigitalCommerceAuctionService: listing,
    DefaultServiceTokenService: { requireRuntimePrincipal: r => r.authData },
    DefaultPublicationApprovalWorkflowService: require('../../../../../../nodics.foundation/modules/nPublish/src/service/defaultPublicationApprovalWorkflowService'),
    DefaultDigitalBundleCompositionService: require('../src/service/defaultDigitalBundleCompositionService'),
    DefaultDigitalBundleSettlementService: require('../src/service/defaultDigitalBundleSettlementService'),
    DefaultExactAmountService: exact, DefaultDigitalBundleAuthorityService: require('../src/service/defaultDigitalBundleAuthorityService'),
    DefaultModelConcurrencyService: { getField: () => 'revision' },
    DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ unique: true, key: { code: 1 } }] }) },
    Authority: { authorize: async (r, input) => {
      if (r.authData.loginId !== 'seller') throw Error('Owner denied');
      return { authorized: true, tenant: r.tenant, ownerRef: input.ownerRef, actorRef: { code: 'seller' } };
    } },
  };
  for (const name of ['DefaultDigitalBundleManifestService', 'DefaultDigitalBundleOperationService', 'DefaultDigitalProductBindingService']) {
    rows[name] = [];
    SERVICE[name] = {
      get: async r => {
        const result = clone(rows[name].filter(row => Object.entries(r.query).every(([k, v]) => row[k] === v)));
        return { code: 'SUC_TEST', result, count: result.length };
      },
      save: async r => { if (rows[name].some(row => row.code === r.model.code)) throw Error('Duplicate');
        rows[name].push(clone(r.model)); return { code: 'SUC_TEST', result: clone(r.model) }; },
      update: async r => {
        const row = rows[name].find(row => Object.entries(r.query).every(([k, v]) => row[k] === v));
        if (row) Object.assign(row, clone(r.model), { revision: r.query.revision + 1 });
        return { code: 'SUC_TEST', result: { matchedCount: row ? 1 : 0 } };
      },
    };
  }
  const receipt = (i, status) => ({ status, operationKey: i.operationKey, reference: i.component.reference,
    quantity: i.component.quantity, receiptCode: i.operationKey + ':' + status });
  SERVICE.Components = {
    inspect: async (_, i) => ({ available: !holds.has(i.component.reference.code), ownerRef: i.ownerRef, revision: 1 }),
    reserve: async (_, i) => { const held = holds.get(i.component.reference.code);
      if (held && held !== i.operationKey) throw Error('Competing hold');
      holds.set(i.component.reference.code, i.operationKey); effects.push('reserve'); return receipt(i, 'RESERVED'); },
    release: async (_, i) => { holds.delete(i.component.reference.code); effects.push('release'); return receipt(i, 'RELEASED'); },
    transfer: async () => { throw Error('Not a publication operation'); }, finalize: async () => { throw Error('Not a publication operation'); },
  };
  rows.DefaultDigitalBundleListingContextService = [{ code: 'binding', revision: 3, tenant: 'tenant', enterpriseCode: 'seller-enterprise',
    active: true, status: 'ACTIVE', name: 'Marketplace', storeCode: 'store', categoryCodes: [], currency: 'POINTS',
    priceBookCode: 'rewards', reward: { programCode: 'program', rewardTypeCode: 'points' } }];
  SERVICE.DefaultDigitalBundleListingContextService = { get: async r => {
    const result = clone(rows.DefaultDigitalBundleListingContextService.filter(row => Object.entries(r.query).every(([k,v]) => row[k] === v)));
    return { code: 'SUC_TEST', result, count: result.length };
  } };
  const request = { tenant: 'tenant', enterpriseCode: 'seller-enterprise', authData: { tenant: 'tenant', enterpriseCode: 'seller-enterprise', loginId: 'seller' } };
  const row = () => rows.DefaultDigitalBundleOperationService[0];
  SERVICE.DefaultBiddingAuctionService = { open: async () => {
    effects.push('open-round'); return { code: 'auction', publicationCode: row().code, productCode: 'product' };
  } };
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    if (call.apiName === '/reward-unit-evidence') {
      assert.equal(call.requireInternalAuth, true);
      return { contractVersion: 1, tenant: 'tenant', enterpriseCode: 'seller-enterprise', programCode: 'program',
        rewardTypeCode: 'points', scale: 2, programRevision: 1, rewardTypeRevision: 2 };
    }
    assert.equal(call.header.Authorization, 'Bearer runtime');
    if (call.apiName.endsWith('/store-context')) return { contractVersion: 1, tenant: 'tenant', store: {
      code: 'store', enterpriseCode: 'market', revision: 1, active: true, status: 'ACTIVE' } };
    assert.equal(row().status === 'HELD' || ['RELEASING', 'RELEASED'].includes(row().status), true);
    const phase = call.apiName.split('/').pop(); effects.push(phase);
    if (phase === 'prepare') return { confirmed: true, publicationCode: row().code, productCode: 'product', variantCode: 'unit', sku: 'sku', versionId: 0 };
    if (phase === 'withdraw') {
      if (failWithdraw) throw Error('Withdrawal unknown');
      return { confirmed: true, status: 'WITHDRAWN', publicationCode: row().code, activeVersion: null, receiptCode: 'withdrawal' };
    }
    if (failPublish) throw Error('Activation unknown');
    return { confirmed: true, status: 'ONLINE', publicationCode: row().code, productCode: 'product', variantCode: 'unit',
      storeCode: 'store', targetVersion: 'exact', receiptCode: 'activation' };
  } };
  const price = async (_, input) => {
    effects.push('price'); assert.equal(holds.size, 1);
    return { confirmed: true, operationCode: input.operationCode, productCode: 'product', variantCode: 'unit',
      storeCode: 'store', amount: input.terms.amount, currency: 'POINTS', receiptCode: 'price' };
  };
  SERVICE.DefaultPricingBundleListingService = { publish: price, inspect: price };
  const create = () => bundles.create(request, { ownerRef: { module: 'profile', schema: 'enterprise', code: 'seller-enterprise' },
    idempotencyKey: 'manifest', components: [{ kind: 'CERTIFICATE', reference: { module: 'wasteCore', schema: 'wasteAsset', code: 'asset' },
      quantity: '1', expectedRevision: 1 }] });
  const command = manifest => ({ manifestCode: manifest.code, manifestRevision: manifest.revision, idempotencyKey: 'listing', confirmed: true,
    listingContextRef: { code: 'binding', revision: 3 },
    name: 'Bundle', amount: '10', currency: 'POINTS', priceBookCode: 'rewards', storeCode: 'store', saleMode: 'AUCTION',
    startsAt: '2999-01-01T00:00:00.000Z', endsAt: null, categoryCodes: [], reward: { programCode: 'program', rewardTypeCode: 'points', scale: 2 } });
  return { request, create, command, rows, row, holds, effects, publishPolicy, failPublish: value => { failPublish = value; },
    failWithdraw: value => { failWithdraw = value; } };
}

test('framework publication wiring is complete but activation remains an explicit override', t => {
  assert.equal(defaults.digitalCore.bundleListings.enabled, false);
  fixture(t);
  const settings = listing.settings();
  assert.equal(settings.pricingService, 'DefaultPricingBundleListingService');
  assert.equal(settings.productTarget.connectionName, 'commerceStaged');
  assert.equal(settings.productTarget.apiVersion, 'v0');
});

test('future publication immediately holds original contents and retains a single quantity-one binding', async t => {
  const f = fixture(t), command = f.command(await f.create());
  const result = await listing.publish(f.request, command);
  assert.equal(result.status, 'PUBLISHED'); assert.equal(result.endsAt, null); assert.equal(f.holds.size, 1);
  assert.equal(f.row().enterpriseCode, 'market'); assert.equal(f.row().evidence.manifestEnterpriseCode, 'seller-enterprise');
  assert.equal(f.effects[0], 'reserve'); assert.equal(f.rows.DefaultDigitalProductBindingService.length, 1);
  assert.equal(f.rows.DefaultDigitalProductBindingService[0].providerReference.quantity, '1');
  await listing.publish(f.request, command);
  assert.equal(f.rows.DefaultDigitalProductBindingService.length, 1);
  assert.equal(f.effects.filter(x => x === 'reserve').length, 1);
  assert.equal(f.effects.filter(x => x === 'open-round').length, 1);
  await assert.rejects(listing.publish(f.request, { ...command, amount: '11' }), /conflicts/);
});
test('unknown activation retains holds and resumes original authoring and price receipts', async t => {
  const f = fixture(t), command = f.command(await f.create()); f.failPublish(true);
  await assert.rejects(listing.publish(f.request, command), /Activation unknown/);
  assert.equal(f.holds.size, 1); assert.equal(f.row().evidence.listing.phase, 'PUBLISHING');
  f.failPublish(false); await listing.publish(f.request, command);
  assert.equal(f.effects.filter(x => x === 'prepare').length, 1); assert.equal(f.effects.includes('release'), false);
});
test('release requires persisted terminal auction, loser receipts and confirmed withdrawal before component release', async t => {
  const f = fixture(t), result = await listing.publish(f.request, f.command(await f.create()));
  const r = { ...f.request, enterpriseCode: 'market' };
  const round = { code: 'auction', tenant: 'tenant', enterpriseCode: 'market', publicationCode: result.publicationCode,
    status: 'CANCELLED', productCode: 'product', sellerRef: f.row().ownerRef,
    bids: { loser: { code: 'loser', reservation: { code: 'funds' } } } };
  SERVICE.DefaultBiddingAuctionService = { participant: async () => r, isSeller: () => true, load: async () => clone(round) };
  const input = { round, idempotencyKey: 'auction:listing-release' };
  await assert.rejects(listing.release(r, input), /loser funds/);
  round.bids.loser.release = { status: 'RELEASED', reservationCode: 'funds' }; f.failWithdraw(true);
  await assert.rejects(listing.release(r, input), /Withdrawal unknown/); assert.equal(f.holds.size, 1);
  f.failWithdraw(false); assert.equal((await listing.release(r, input)).status, 'RELEASED');
  await listing.release(r, input); assert.equal(f.effects.filter(x => x === 'release').length, 1);
});
test('unknown window, malformed date and blank price reject before holdings change', async t => {
  const f = fixture(t), command = f.command(await f.create());
  for (const patch of [{ startsAt: undefined }, { endsAt: '2026-02-30T00:00:00.000Z' }, { amount: '' }])
    await assert.rejects(listing.publish(f.request, { ...command, ...patch }));
  assert.equal(f.holds.size, 0);
});
test('governed context revision and exact terms are revalidated before any holdings operation', async t => {
  const f = fixture(t), command = f.command(await f.create());
  for (const patch of [{ listingContextRef: undefined }, { listingContextRef: { code: 'binding', revision: 2 } },
    { listingContextRef: { code: 'foreign', revision: 3 } }, { currency: 'OTHER' }, { storeCode: 'foreign' },
    { priceBookCode: 'foreign' }, { categoryCodes: ['foreign'] },
    { reward: { ...command.reward, programCode: 'foreign' } }, { reward: { ...command.reward, scale: 3 } }]) {
    await assert.rejects(listing.publish(f.request, { ...command, ...patch }));
    assert.equal(f.holds.size, 0); assert.equal(f.rows.DefaultDigitalBundleOperationService.length, 0);
  }
  const published = await listing.publish(f.request, command);
  assert.deepEqual(published.listingContextRef, command.listingContextRef);
  assert.deepEqual(f.row().evidence.listing.contextRef, command.listingContextRef);
  assert.equal(f.row().evidence.listing.rewardEvidence.rewardTypeRevision, 2);
});
test('context changes during owner proof fail before reservation and persisted publication identity', async t => {
  const f = fixture(t), command = f.command(await f.create()), get = SERVICE.DefaultDigitalBundleListingContextService.get;
  let first = true;
  SERVICE.DefaultDigitalBundleListingContextService.get = async r => { const value = await get(r);
    if (first) { first = false; f.rows.DefaultDigitalBundleListingContextService[0].revision++; } return value; };
  await assert.rejects(listing.publish(f.request, command), /context changed/);
  assert.equal(f.holds.size, 0); assert.equal(f.rows.DefaultDigitalBundleOperationService.length, 0);
});

async function proofFixture(t) {
  const f = fixture(t), command = f.command(await f.create());
  f.failPublish(true);
  await assert.rejects(listing.publish(f.request, command), /Activation unknown/);
  f.publishPolicy.approvalWorkflow.runtimeEnterpriseScope = { enabled: true, enterpriseCodes: ['market'] };
  const request = { tenant: 'tenant', enterpriseCode: 'deployment', authorization: 'Bearer original-runtime',
    authData: { tenant: 'tenant', entCode: 'deployment', enterpriseCode: 'deployment', tokenType: 'service',
      principalType: 'service', runtimeScope: { module: 'product' }, permissions: ['commerce.digital.bundle.publish'] },
    payload: { operationCode: f.row().code, storeCode: 'store' } };
  return { ...f, proofRequest: request };
}

test('proof resolves the selected Store namespace with exact bounded reads and unchanged runtime aliases', async t => {
  const f = await proofFixture(t), r = f.proofRequest, original = clone(r), before = clone(f.effects);
  const get = SERVICE.DefaultDigitalBundleOperationService.get, queries = [];
  SERVICE.DefaultDigitalBundleOperationService.get = async request => {
    queries.push(clone(request.query));
    assert.deepEqual(request.searchOptions, { pageNumber: 1, pageSize: 2 });
    assert.equal(request.tenant, 'tenant');
    return get(request);
  };
  const proof = await listing.proof(r, r.payload);
  assert.equal(proof.enterpriseCode, 'market');
  assert.equal(proof.operationCode, f.row().code);
  assert.equal(proof.manifest.code, f.row().manifestCode);
  assert.deepEqual(queries, Array(2).fill({ tenant: 'tenant', enterpriseCode: 'market', code: f.row().code }));
  assert.deepEqual(r, original);
  assert.deepEqual(f.effects, before);
  assert.equal(f.holds.size, 1);
});

test('denied or absent business qualification refuses before operation lookup', async t => {
  const f = await proofFixture(t), r = f.proofRequest;
  SERVICE.DefaultDigitalBundleOperationService.get = async () => { assert.fail('Denied scope reached persistence'); };
  for (const policy of [undefined, { enabled: false, enterpriseCodes: ['market'] }, { enabled: true, enterpriseCodes: ['other'] }]) {
    f.publishPolicy.approvalWorkflow.runtimeEnterpriseScope = policy;
    await assert.rejects(listing.proof(r, r.payload), /not selected/);
  }
  f.publishPolicy.approvalWorkflow.runtimeEnterpriseScope = { enabled: true, enterpriseCodes: ['market'] };
  delete SERVICE.DefaultPublicationApprovalWorkflowService;
  await assert.rejects(listing.proof(r, r.payload), /not qualified/);
});

test('proof rejects tenant and Enterprise alias contradictions before Store access', async t => {
  const f = await proofFixture(t), r = f.proofRequest;
  SERVICE.DefaultModuleService.invokeModule = async () => { assert.fail('Invalid aliases reached Store'); };
  for (const patch of [{ enterpriseCode: 'market' }, { tenantCode: 'foreign' },
    { httpRequest: { headers: { 'x-enterprise-code': 'market' } } },
    { httpRequest: { headers: { 'X-Tenant-Code': 'foreign' } } },
    { authData: { ...r.authData, enterpriseCode: 'market' } }]) {
    await assert.rejects(listing.proof({ ...r, ...patch }, r.payload), /runtime is required/);
  }
  await assert.rejects(listing.proof(r, { ...r.payload, enterpriseCode: 'market' }), /Exact bundle/);
  await assert.rejects(listing.proof(r, { ...r.payload, operationCode: { $ne: null } }), /Exact bundle/);
});

test('proof rejects duplicate, truncated, foreign and unrelated Store evidence', async t => {
  const f = await proofFixture(t), r = f.proofRequest, get = SERVICE.DefaultDigitalBundleOperationService.get;
  for (const change of [
    response => { response.result.push(clone(response.result[0])); response.count = 2; },
    response => { response.count = 2; },
    response => { delete response.count; },
    response => { response.acknowledged = false; },
    response => { response.result[0].tenant = 'foreign'; },
    response => { response.result[0].enterpriseCode = 'foreign'; },
    response => { response.result[0].code = 'bundle-operation:' + 'f'.repeat(64); },
    response => { const listing = response.result[0].evidence.listing;
      listing.terms.storeCode = 'other'; listing.termsDigest = bundles.digest(listing.terms); },
  ]) {
    SERVICE.DefaultDigitalBundleOperationService.get = async request => { const response = await get(request); change(response); return response; };
    await assert.rejects(listing.proof(r, r.payload), /evidence|terms|Store changed/);
  }
});

test('proof rechecks original authority and retained row across asynchronous reads', async t => {
  const f = await proofFixture(t), r = f.proofRequest, get = SERVICE.DefaultDigitalBundleOperationService.get;
  SERVICE.DefaultDigitalBundleOperationService.get = async request => {
    const response = await get(request); r.authData.enterpriseCode = 'market'; return response;
  };
  await assert.rejects(listing.proof(r, r.payload), /runtime is required/);
  r.authData.enterpriseCode = 'deployment';
  SERVICE.DefaultDigitalBundleOperationService.get = async request => {
    const response = await get(request); f.publishPolicy.approvalWorkflow.runtimeEnterpriseScope.enterpriseCodes.push('other'); return response;
  };
  await assert.rejects(listing.proof(r, r.payload), /authority changed/);
  SERVICE.DefaultDigitalBundleOperationService.get = get;
  const manifestGet = SERVICE.DefaultDigitalBundleManifestService.get;
  SERVICE.DefaultDigitalBundleManifestService.get = async request => {
    const response = await manifestGet(request); f.row().revision++; return response;
  };
  await assert.rejects(listing.proof(r, r.payload), /Listing changed/);
});

test('same-Enterprise proof retains its existing admission without cross-scope selection', async t => {
  const f = await proofFixture(t), r = f.proofRequest;
  r.enterpriseCode = r.authData.entCode = r.authData.enterpriseCode = 'market';
  delete f.publishPolicy.approvalWorkflow.runtimeEnterpriseScope;
  delete SERVICE.DefaultPublicationApprovalWorkflowService;
  assert.equal((await listing.proof(r, r.payload)).enterpriseCode, 'market');
});

test('Store placement must be same-tenant, exact and stable through proof readback', async t => {
  const f = await proofFixture(t), r = f.proofRequest, invoke = SERVICE.DefaultModuleService.invokeModule;
  for (const mutate of [result => { result.tenant = 'foreign'; }, result => { result.store.code = 'other'; }]) {
    SERVICE.DefaultModuleService.invokeModule = async input => { const result = await invoke(input); mutate(result); return result; };
    await assert.rejects(listing.proof(r, r.payload), /placement is unavailable/);
  }
  let reads = 0;
  SERVICE.DefaultModuleService.invokeModule = async input => {
    const result = await invoke(input);
    if (++reads === 2) result.store.revision++;
    return result;
  };
  await assert.rejects(listing.proof(r, r.payload), /Store placement changed/);
});
