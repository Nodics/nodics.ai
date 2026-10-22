/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module product/test/productBundlePublication @description Composes automatic bundle policy with actual nPublish transitions and isolated immutable-source/target I/O. @owner product @layer test */
const test = require('node:test'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const automatic = require('../src/service/defaultProductBundlePublicationService');
const governed = require('../src/service/defaultProductGovernedPublicationService');
const lifecycle = require('../../../../../../nodics.foundation/modules/nPublish/src/service/defaultPublicationLifecycleService');
const publishDefaults = require('../../../../../../nodics.foundation/modules/nPublish/config/properties');
const productDefaults = require('../config/properties');
const clone = structuredClone;

test('listing windows use effective Product date validation and preserve strict UTC semantics', () => {
  const authoring = require('../src/service/defaultProductListingAuthoringService');
  const seen = [];
  const effective = { ...authoring, listingDate(value) {
    seen.push(value);
    return authoring.listingDate.call(this, value);
  } };
  assert.deepEqual(effective.listingTerms({ listingWindow: {
    startsAt: '2028-02-29T00:00:00Z', endsAt: '',
  } }).listingWindow, { startsAt: '2028-02-29T00:00:00.000Z', endsAt: null });
  assert.deepEqual(seen, ['2028-02-29T00:00:00Z', '']);
  for (const value of [undefined, 0, '2026-02-30T00:00:00Z', '2026-01-01T00:00:00+00:00']) {
    assert.throws(() => authoring.listingDate(value), /Listing dates/);
  }
  assert.equal(authoring.listingDate(null), null);
  assert.throws(() => effective.listingTerms({ listingWindow: {
    startsAt: '2026-01-02T00:00:00Z', endsAt: '2026-01-01T00:00:00Z',
  } }), /end must follow/);
  effective.listingDate = () => { throw Error('Stricter effective date policy'); };
  assert.throws(() => effective.listingTerms({ listingWindow: { startsAt: null, endsAt: null } }),
    /Stricter effective date policy/);
});

function fixture(t) {
  const previous = { CONFIG: global.CONFIG, NODICS: global.NODICS, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  const productPolicy = clone(productDefaults.product), publishPolicy = clone(publishDefaults.publish);
  productPolicy.marketplaceAuthoring.bundlePublication.enabled = true;
  publishPolicy.providers.repositoryProvider = 'Repository';
  publishPolicy.providers.domainAdapters = { product: 'Adapter' };
  publishPolicy.providers.versionProviders = { product: 'Version' };
  const code = 'bundle-operation:' + 'a'.repeat(64), manifestCode = 'bundle:' + 'b'.repeat(64);
  const productCode = 'LISTING_' + crypto.createHash('sha256').update('t:digitalCore:' + manifestCode + ':' + code).digest('hex').slice(0, 24).toUpperCase();
  const proof = { confirmed: true, tenant: 't', enterpriseCode: 'market', operationCode: code, ownerRef: { module: 'profile', schema: 'customer', code: 'seller' },
    termsDigest: 'c'.repeat(64), terms: { name: 'Bundle', storeCode: 'store', saleMode: 'AUCTION', amount: '10', currency: 'POINTS',
      startsAt: null, endsAt: null, categoryCodes: [] }, manifest: { code: manifestCode, revision: 0, digest: 'd'.repeat(64) },
    product: { productCode, variantCode: productCode + '_VARIANT', sku: productCode + '_SKU', versionId: 0 },
    price: { confirmed: true, operationCode: code, productCode, variantCode: productCode + '_VARIANT', amount: '10', currency: 'POINTS', storeCode: 'store', receiptCode: 'price' },
    release: null };
  let record, current = { tenant: 't', enterpriseCode: 'market', code: productCode, versionId: 0, catalogVersion: 'catalog' },
    activated = false, badReceipt = false, loseActivation = false, loseWithdrawal = false;
  const keys = [], rows = new Map([[0, clone(current)]]), scope = { tenant: 't', productCode, storeCode: 'store' };
  const manifest = () => ({ version: 'immutable-version', scope, root: clone(current), references: [] });
  global.CONFIG = { get: key => key === 'product' ? productPolicy : key === 'publish' ? publishPolicy :
    key === 'runtimeRole' ? { publication: 'STAGED' } : undefined };
  global.NODICS = { getInternalAuthToken: () => 'runtime' };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, text) { super(text); this.code = code; } } };
  const request = { tenant: 't', authData: { tenant: 't', entCode: 'market', principalType: 'service', tokenType: 'service' },
    payload: { operationCode: code, storeCode: 'store' } };
  global.SERVICE = { DefaultProductBundlePublicationService: automatic, DefaultProductGovernedPublicationService: governed,
    DefaultPublicationLifecycleService: lifecycle,
    DefaultProductListingAuthoringService: {
      runtimeScope: r => { assert.equal(r.authData.principalType, 'service'); return { tenant: 't', enterpriseCode: 'market' }; },
      requestState: r => clone(r), listingTerms: () => {},
      storeContext: async () => ({ store: { enterpriseCode: 'market' } }),
    },
    DefaultModuleService: { invokeModule: async () => ({ data: clone(proof) }) },
    DefaultProductPublicationGraphService: {
      hash: value => JSON.stringify(value), publisherScope: r => automatic.admission(r).scope,
      read: async (_, ref) => clone(rows.get(ref.versionId)), current: async () => [clone(current)],
      captureReferences: async () => ({ storeCode: 'store' }),
      sealRoot: async (_, __, version, references) => { current = { ...current, versionId: version + 1, publicationReferences: references }; rows.set(current.versionId, clone(current)); },
      resolve: async () => manifest(),
    },
    Repository: {
      get: async () => record && clone(record),
      create: async value => { record ||= clone(value); return clone(record); }, appendAudit: async () => {},
      transitionWithAudit: async (_, expected, patch, audit) => {
        assert.equal(record.revision, expected); record = { ...record, ...clone(patch), revision: expected + 1,
          auditTrail: [...record.auditTrail, { ...clone(audit), revision: expected + 1 }] }; return clone(record);
      },
    },
    Adapter: { resolveDependencies: async () => [], validate: async () => ({ valid: true, manifestVersion: 'immutable-version' }) },
  };
  const receipt = publication => ({ committed: true, operationKey: publication.activationOperation.key,
    publicationCode: publication.code, sourceVersion: publication.sourceVersion, targetVersion: 'immutable-version', previousOnlineVersion: null });
  const provider = { targetReceiptContract: 'v1', assertStaged() {}, getVersion: async () => manifest(),
    getOnlineVersion: async () => activated ? 'immutable-version' : null,
    activate: async publication => {
      keys.push(publication.activationOperation.key); activated = true;
      if (loseActivation) { loseActivation = false; throw Error('Activation acknowledgement lost'); }
      return { version: 'immutable-version', receipt: receipt(publication) };
    },
    reconcile: async publication => ({ version: badReceipt ? 'foreign' : 'immutable-version', receipt: receipt(publication) }),
    operationKey: () => 'withdraw-original',
    withdraw: async () => { activated = false; if (loseWithdrawal) { loseWithdrawal = false; throw Error('Withdrawal acknowledgement lost'); }
      return { activeVersion: null, receipt: { committed: true } }; },
    transport: () => ({ getStatus: async () => ({ version: activated ? 'immutable-version' : null,
      receipt: { committed: true, operationKey: 'withdraw-original', publicationCode: code, operation: 'WITHDRAW' } }) }),
  };
  SERVICE.Version = provider; SERVICE.DefaultProductPublicationVersionProviderService = provider;
  return { request, proof, keys, record: () => record, badReceipt: value => { badReceipt = value; },
    loseActivation: () => { loseActivation = true; }, loseWithdrawal: () => { loseWithdrawal = true; } };
}

test('automatic publication uses real nPublish audit and exact activation without a human approval task', async t => {
  const f = fixture(t), result = await automatic.execute(f.request, 'publish');
  assert.equal(result.status, 'ONLINE'); assert.equal(f.record().state, 'ONLINE');
  const approved = f.record().auditTrail.find(row => row.toState === 'APPROVED');
  assert.equal(approved.details.automatic.policy, 'HELD_BUNDLE_LISTING');
  assert.equal(approved.details.automatic.termsDigest, f.proof.termsDigest);
  assert.equal(f.record().workflowRef, undefined);
  assert.equal((await automatic.execute(f.request, 'inspect')).receiptCode, result.receiptCode);
  f.badReceipt(true); await assert.rejects(automatic.execute(f.request, 'inspect'), /activation is unconfirmed/);
});
test('lost activation retries the original immutable operation and withdrawal uncertainty retains its fence', async t => {
  const f = fixture(t); f.loseActivation();
  await assert.rejects(automatic.execute(f.request, 'publish'), /acknowledgement lost/);
  assert.equal(f.record().state, 'FAILED');
  await automatic.execute(f.request, 'publish'); assert.equal(new Set(f.keys).size, 1);
  f.proof.release = { roundCode: 'round', idempotencyKey: 'round:listing-release' }; f.loseWithdrawal();
  await assert.rejects(automatic.execute(f.request, 'withdraw'), /acknowledgement lost/);
  assert.equal(f.record().state, 'WITHDRAWING');
  assert.equal((await automatic.execute(f.request, 'withdraw')).status, 'WITHDRAWN');
});
test('missing original Pricing proof cannot approve or activate', async t => {
  const f = fixture(t); f.proof.price.amount = '11';
  await assert.rejects(automatic.execute(f.request, 'publish'), /Pricing/);
  assert.equal(f.record(), undefined);
});
