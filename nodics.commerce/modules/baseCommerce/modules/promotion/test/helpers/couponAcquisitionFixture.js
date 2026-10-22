/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/**
 * @module promotion/test/helpers/couponAcquisitionFixture
 * @description Composes real coupon acquisition owners over isolated generated persistence and explicit external-owner doubles; does not qualify installed transactions or runtime delivery.
 * @layer test
 * @owner promotion
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const offer = require('../../src/service/defaultCouponOfferService');
const allocation = require('../../src/service/defaultCouponOfferAllocationService');
const persistence = require('../../src/service/defaultCouponAcquisitionPersistenceService');
const participation = require('../../src/service/defaultCouponRedeemerParticipationService');
const reporting = require('../../src/service/defaultCouponAcquisitionReportingService');
const operation = require('../../src/service/defaultPromotionOperationService');
const secure = require('../../src/service/defaultCouponSecureIssuanceService');
const publication = require('../../src/service/defaultPromotionPublicationService');
const defaults = require('../../config/properties');
const schemas = require('../../src/schemas/schemas').promotion;
const hooks = require('../../src/interceptors/interceptors');

/** Installs isolated acquisition storage and owner dependencies, restoring globals after each test. */
function fixture(t, overrides = {}) {
    const previous = Object.fromEntries(['CONFIG', 'SERVICE', 'CLASSES', 'NODICS', 'UTILS'].map(key => [key, global[key]]));
    t.after(() => Object.assign(global, previous));
    const settings = structuredClone(defaults.promotion);
    global.CONFIG = { get: key => key === 'promotion' ? settings : key === 'runtimeRole' ? { code: 'COMMERCE', publication: 'ONLINE' } :
        key === 'databaseTransactions' ? { enabled: true, failClosed: true, maximumCommitTimeMs: 1000 } : undefined };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    const ref = code => ({ moduleName: 'profile', schemaName: 'enterprise', code });
    const campaign = { code: 'offer', tenant: 't', enterpriseCode: 'issuer', revision: 0, versionId: 0, status: 'ACTIVE',
        issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('issuer'), name: 'Offer', actions: { discountAmount: '5' },
        conditions: {}, couponOffer: { version: 1, supply: { mode: 'LIMITED', quantity: 2 }, ownerLimit: 1,
            expiry: { mode: 'NONE' }, requirements: { type: 'REWARDS', priceRef: 'price' }, terms: ['Single use'] }, ...overrides };
    const tables = new Map(), models = {};
    let queue = Promise.resolve();
    const state = { eligibility: [], failure: undefined, captured: [], failNextWrite: undefined };
    global.UTILS = { createModelName: name => name };
    global.NODICS = { getModels: () => models };
    global.SERVICE = {
        DefaultCouponOfferService: offer, DefaultCouponOfferAllocationService: allocation,
        DefaultCouponAcquisitionPersistenceService: persistence, DefaultCouponRedeemerParticipationService: participation,
        DefaultCouponAcquisitionReportingService: reporting,
        DefaultPromotionPublicationService: { ...publication, deliveryEnabled: () => false },
        DefaultPromotionOperationService: { ...operation, serviceAuthData: r => r.authData, withSchemaBase: model => ({ active: true, ...model }),
            promotions: async () => [structuredClone(campaign)],
            assertSupportedCouponBenefit: () => {}, couponPurchaseCampaign: async () => ({ campaign, activated: true }) },
        DefaultCouponSecureIssuanceService: { ...secure, persistence: async () => {}, privateOperation: (_r, action) => action() },
        DefaultSecretProtectionService: { assertReady: async () => true, unprotect: async () => assert.fail('No reveal during reservation'), protect: async r => {
            state.captured.push(r.binding); return { ciphertext: crypto.createHash('sha256').update(r.value).digest('hex') };
        } },
        DefaultCouponSellerAuthorizationService: { authorizeSale: async () => undefined,
            campaign: async () => structuredClone(campaign), activeEnterprise: async () => {},
            issuer: async (r, code) => { assert.equal(r.authData.enterpriseCode, code); },
            writeCoupon: r => SERVICE.DefaultCouponService.update(r) },
        DefaultDigitalCommerceCouponAcquisitionService: {
            authorize: async r => ({ tenant: r.tenant, ownerId: r.ownerId, ownerRef: r.ownerRef, orderCode: r.payload.orderCode }),
            readCertificateEligibility: async () => structuredClone(state.eligibility),
            completion: async r => ({ status: 'COMPLETED', orderCode: r.payload.orderCode, ownerRef: r.ownerRef,
                certificateCodes: r.payload.certificateCodes || [], ...(campaign.couponOffer.requirements.type === 'CERTIFICATES' ? {} :
                    { rewardCaptureReference: 'capture' }) }),
            failed: async () => state.failure,
        },
        DefaultModelConcurrencyService: { getField: () => undefined },
        DefaultModelSaveInitializerService: { applyDefaultValues: (_r, _response, pipeline) => pipeline.nextSuccess() },
        DefaultDatabaseConfigurationService: { getSchemaInterceptors: name => Object.fromEntries(['preSave', 'preUpdate', 'preRemove']
            .map(trigger => [trigger, Object.values(hooks).filter(hook => hook.item === name && hook.trigger === trigger)])) },
        DefaultDatabaseModelHandlerService: { inspectIndexes: async () => ({ versioned: false, indexes: [{ key: { code: 1 }, unique: true }] }) },
        DefaultDatabaseTransactionService: { capabilities: () => ({ multiRecordAtomic: true }), execute: (_r, action) => {
            const run = queue.then(async () => {
                const before = structuredClone(tables);
                try { return await action({ session: 'isolated-test-transaction' }); }
                catch (error) { tables.clear(); before.forEach((value, key) => tables.set(key, value)); throw error; }
            }); queue = run.catch(() => {}); return run;
        } },
    };
    for (const name of [...persistence.schemas(), 'coupon', 'couponBatch', 'promotion']) {
        tables.set(name, new Map());
        models[name] = { rawSchema: schemas[name], versioned: false, primaryKey: 'code', compareAndSetItem: () => {},
            guardProtectedRead: () => {}, projectReadResult: () => {}, moduleName: 'promotion', schemaName: name };
        const generated = {
            get: async r => {
                if (persistence.schemas().includes(name)) persistence.providerRead(r, models[name]);
                const rows = [...tables.get(name).values()].filter(row => Object.entries(r.query || {}).every(([key, value]) =>
                    key.split('.').reduce((current, part) => current?.[part], row) === value));
                return { code: 'SUC_FIND', result: structuredClone(rows), count: rows.length };
            },
            save: async r => {
                if (persistence.schemas().includes(name)) persistence.protect(r);
                if (state.failNextWrite === name) { state.failNextWrite = undefined; throw new Error('lost write'); }
                if (tables.get(name).has(r.model.code)) throw new Error('duplicate');
                tables.get(name).set(r.model.code, structuredClone(r.model));
                return { code: 'SUC_SAVE', result: structuredClone(r.model) };
            },
            update: async r => {
                if (persistence.schemas().includes(name)) persistence.protect(r);
                if (state.failNextWrite === name) { state.failNextWrite = undefined; throw new Error('lost write'); }
                const row = tables.get(name).get(r.query.code);
                if (!row || !Object.entries(r.query).every(([key, value]) => row[key] === value))
                    return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 0 } };
                const next = { ...row, ...structuredClone(r.model.$set || r.model) };
                for (const key of Object.keys(r.model.$unset || {})) delete next[key];
                tables.get(name).set(next.code, next);
                return { code: 'SUC_UPDATE', result: { acknowledged: true, matchedCount: 1 } };
            },
        };
        SERVICE['Default' + name[0].toUpperCase() + name.slice(1) + 'Service'] = generated;
    }
    tables.get('promotion').set(campaign.code, structuredClone(campaign));
    for (let i = 1; i <= 4; i++) tables.get('coupon').set('coupon' + i, { code: 'coupon' + i, tenant: 't', enterpriseCode: 'issuer',
        issuerEnterpriseRef: ref('issuer'), vendorEnterpriseRef: ref('issuer'), batchCode: 'batch', promotionCode: campaign.code,
        status: 'ACTIVE', saleStatus: 'AVAILABLE', revision: 0, maxUses: 1, usedCount: 0 });
    const request = (ownerCode = 'buyer', key = 'key') => ({ tenant: 't', enterpriseCode: 'issuer', ownerId: ownerCode,
        ownerRef: { type: 'CUSTOMER', code: ownerCode }, idempotencyKey: key, authData: { tenant: 't', principalType: 'customer', loginId: ownerCode },
        storeCode: 'store', payload: { orderCode: 'order-' + key, entryCode: 'entry', productCode: 'product', batchCode: 'batch', promotionCode: campaign.code } });
    return { campaign, settings, state, tables, models, request, operation: SERVICE.DefaultPromotionOperationService };
}
module.exports = fixture;
