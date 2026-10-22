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
const path = require('node:path'), root = path.resolve(__dirname, '../../../../../..');
const unitEvidence = require(path.join(root, 'nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyReadEvidenceService'));
const rewardOperations = require(path.join(root, 'nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyRewardOperationService'));
const loyaltyAmount = require(path.join(root, 'nodics.loyalty/modules/loyaltyCore/src/service/defaultLoyaltyAmountService'));
const loyaltyDefaults = require(path.join(root, 'nodics.loyalty/modules/loyaltyCore/config/properties'));
const installLoyaltyEnums = require(path.join(root, 'nodics.loyalty/modules/loyaltyWallet/test/helpers/runtimeEnums'));
const runtimeTokens = require(path.join(root, 'nodics.foundation/modules/nAuth/src/service/identity/defaultServiceTokenService'));

function fixture(t) {
  const before = ['SERVICE', 'CONFIG', 'NODICS', 'UTILS', 'ENUMS'].map(key => [key, Object.hasOwn(global, key), global[key]]);
  t.after(() => {
    for (const [key, present, value] of before) {
      if (present) global[key] = value;
      else delete global[key];
    }
  });
  global.ENUMS = {};
  installLoyaltyEnums();
  const policy = clone(defaults.digitalCore); policy.bundleListings.enabled = true;
  const loyaltyPolicy = clone(loyaltyDefaults.loyalty);
  policy.bundles.ownerAuthorityService = 'Authority'; policy.bundles.componentProviders.CERTIFICATE = 'Components';
  const rows = {}, effects = [], holds = new Map(); let failPublish = false, failWithdraw = false;
  global.CONFIG = { get: k => k === 'digitalCore' ? policy : k === 'loyalty' ? loyaltyPolicy : k === 'authSecurity' ?
    { internalToken: { runtimeAccessGroups: ['serviceAccountUserGroup'] } } : undefined };
  global.UTILS = { createModelName: n => n };
  global.NODICS = { getInternalAuthToken: () => 'runtime', getModels: () => Object.fromEntries(['digitalBundleManifest', 'digitalBundleOperation']
    .map(n => [n, { primaryKey: 'code', rawSchema: {}, compareAndSetItem() {} }])) };
  global.SERVICE = { DefaultDigitalBundleService: bundles, DefaultDigitalCommerceEntitlementService: persistence,
    DefaultLoyaltyReadEvidenceService: unitEvidence, DefaultLoyaltyRewardOperationService: rewardOperations,
    DefaultLoyaltyAmountService: loyaltyAmount,
    DefaultServiceTokenService: runtimeTokens, DefaultLoggerService: { hasPrivateCaptureProtection: () => true },
    DefaultDigitalCommerceAuctionService: listing,
    DefaultDigitalBundleCompositionService: require('../src/service/defaultDigitalBundleCompositionService'),
    DefaultDigitalBundleRecoveryService: require('../src/service/defaultDigitalBundleRecoveryService'),
    DefaultDigitalBundleGiftService: require('../src/service/defaultDigitalBundleGiftService'),
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
        return { code: 'SUC_TEST', count: result.length, result };
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
  rows.DefaultLoyaltyProgramService = [{ code: 'program', active: true, status: 'ACTIVE', spendEnabled: true, revision: 1 }];
  rows.DefaultLoyaltyRewardTypeService = [{ code: 'points', active: true, status: 'ACTIVE', precision: 2, revision: 2 }];
  for (const name of ['DefaultLoyaltyProgramService', 'DefaultLoyaltyRewardTypeService']) SERVICE[name] = { get: async r => {
    assert.equal(r.authData.principalId, 'loyaltyRewardOperationService');
    assert.equal(r.searchOptions.pageSize, 2);
    const result = clone(rows[name].filter(row => Object.entries(r.query).every(([k,v]) => row[k] === v)));
    return { code: 'SUC_TEST', count: result.length, result };
  } };
  const request = { tenant: 'tenant', enterpriseCode: 'seller-enterprise', authData: { tenant: 'tenant', enterpriseCode: 'seller-enterprise', loginId: 'seller' } };
  const row = () => rows.DefaultDigitalBundleOperationService[0];
  SERVICE.DefaultBiddingAuctionService = { open: async () => {
    effects.push('open-round'); return { code: 'auction', publicationCode: row().code, productCode: 'product' };
  } };
  SERVICE.DefaultModuleService = { invokeModule: async call => {
    if (call.apiName === '/reward-unit-evidence') {
      assert.equal(call.requireInternalAuth, true);
      // Transport authentication is isolated; canonical Loyalty admission, record reads and precision validation are real.
      return unitEvidence.rewardUnitEvidence({ tenant: 'tenant', payload: clone(call.requestBody), authData: {
        tokenType: 'service', principalType: 'service', serviceId: 'commerce-runtime', principalId: 'commerce-runtime',
        tenant: 'tenant', entCode: 'seller-enterprise', runtimeInstanceId: 'instance',
        runtimeScope: { projectCode: 'project', environmentCode: 'local', serverCode: 'commerce', instanceCode: 'instance', assignmentCode: 'grant' },
        modules: ['loyaltyApi'], permissions: ['loyalty.wallet.read'], userGroups: [], groups: [],
      } });
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
  const create = composition => bundles.create(request, { ownerRef: { module: 'profile', schema: 'enterprise', code: 'seller-enterprise' },
    ...(composition ? { composition } : {}),
    idempotencyKey: 'manifest', components: [{ kind: 'CERTIFICATE', reference: { module: 'wasteCore', schema: 'wasteAsset', code: 'asset' },
      quantity: '1', expectedRevision: 1 }] });
  const command = manifest => ({ manifestCode: manifest.code, manifestRevision: manifest.revision, idempotencyKey: 'listing', confirmed: true,
    listingContextRef: { code: 'binding', revision: 3 },
    name: 'Bundle', amount: '10', currency: 'POINTS', priceBookCode: 'rewards', storeCode: 'store', saleMode: 'AUCTION',
    startsAt: '2999-01-01T00:00:00.000Z', endsAt: null, categoryCodes: [], reward: { programCode: 'program', rewardTypeCode: 'points', scale: 2 } });
  return { request, policy, create, command, rows, row, holds, effects, failPublish: value => { failPublish = value; },
    failWithdraw: value => { failWithdraw = value; } };
}

module.exports = fixture;
