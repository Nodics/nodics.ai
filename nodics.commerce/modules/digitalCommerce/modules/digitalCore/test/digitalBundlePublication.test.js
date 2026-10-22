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
  const before = { SERVICE: global.SERVICE, CONFIG: global.CONFIG, NODICS: global.NODICS, UTILS: global.UTILS };
  t.after(() => Object.assign(global, before));
  const policy = clone(defaults.digitalCore); policy.bundleListings.enabled = true;
  policy.bundles.ownerAuthorityService = 'Authority'; policy.bundles.componentProviders.CERTIFICATE = 'Components';
  const rows = {}, effects = [], holds = new Map(); let failPublish = false, failWithdraw = false;
  global.CONFIG = { get: k => k === 'digitalCore' ? policy : undefined };
  global.UTILS = { createModelName: n => n };
  global.NODICS = { getInternalAuthToken: () => 'runtime', getModels: () => Object.fromEntries(['digitalBundleManifest', 'digitalBundleOperation']
    .map(n => [n, { primaryKey: 'code', rawSchema: {}, compareAndSetItem() {} }])) };
  global.SERVICE = { DefaultDigitalBundleService: bundles, DefaultDigitalCommerceEntitlementService: persistence,
    DefaultDigitalCommerceAuctionService: listing,
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
      get: async r => ({ code: 'SUC_TEST', result: clone(rows[name].filter(row => Object.entries(r.query).every(([k, v]) => row[k] === v))) }),
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
  return { request, create, command, rows, row, holds, effects, failPublish: value => { failPublish = value; },
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
