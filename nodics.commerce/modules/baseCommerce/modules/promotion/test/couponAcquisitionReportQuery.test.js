/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module promotion/test/couponAcquisitionReportQuery @description Exercises actual persisted report query, all-time cohorts, typed owners, related suppression and exact rates over isolated owners. @owner promotion @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('./helpers/couponAcquisitionFixture');
const report = require('../src/service/defaultCouponAcquisitionReportingService');
const reportScope = require('../src/service/defaultCouponAcquisitionReportScopeService');

/** Canonical event fixture; owner ids never appear in returned projections. */
function event(owner, id, day, values = {}) {
    return { sourceId: id, kind: 'REDEMPTION', confirmedAt: day + 'T00:00:00.000Z', promotionCode: 'offer',
        issuerEnterpriseCode: 'issuer', redeemerEnterpriseCode: 'redeemer', storeCode: 'outlet',
        ownerRef: { type: 'CUSTOMER', code: owner }, channel: 'circa', confirmed: true, historyKnown: true, ...values };
}
/** Persists canonical facts and resolves query scope through the real Profile/Store owner boundary. */
async function setup(t, events) {
    const f = fixture(t); f.settings.acquisitionReporting.enabled = true;
    SERVICE.DefaultSecuredRequestPipelineService = { hasAccessGroup: () => true, getGrantedPermissions: () => ['commerce.promotion.read'],
        isPermissionGranted: () => true };
    SERVICE.DefaultDigitalCommerceCouponAcquisitionService.reportingEvents = async () => ({ tenant: 't', snapshotId: 'snapshot',
        coverageThrough: '2026-10-17T00:00:00.000Z', historyComplete: true, events, complete: true, nextCursor: null });
    await report.refresh({ tenant: 't', channelCode: 'circa', authData: { tenant: 't', principalType: 'service', tokenType: 'internal' } });
    SERVICE.DefaultCouponAcquisitionReportScopeService = reportScope;
    SERVICE.DefaultEnterpriseAdministrationConsentService = { visibleEnterpriseCodes: async () => ['redeemer', 'redeemer2'] };
    SERVICE.DefaultStoreService = { get: async request => ({ code: 'SUC_FIND', count: 1, result: [{
        code: request.query.code, tenant: request.tenant, status: 'ACTIVE', revision: 1,
        enterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: request.query.code === 'outlet2' ? 'redeemer2' : 'redeemer' }
    }] }) };
    const request = (payload = {}, enterpriseCode = 'redeemer') => ({ tenant: 't', promotionCode: 'offer', authorization: 'Bearer original',
        authData: { tenant: 't', enterpriseCode, loginId: 'employee', principalType: 'human', tokenType: 'access' },
        payload: { view: 'REDEEMER', channelCode: 'circa', ...payload } });
    return { ...f, request };
}
/** Five distinct people with equivalent disclosure footprints meet the framework privacy default. */
function five(build) { return Array.from({ length: 5 }, (_, index) => build('owner-' + index, index)).flat(); }

test('all-time classification precedes period and campaign filters; totals and day rows count typed owners once', async t => {
    const events = five((owner, i) => [event(owner, 'old-' + i, '2026-09-01', { promotionCode: 'older-campaign' }),
        event(owner, 'new-' + i, '2026-10-01'), event(owner, 'repeat-' + i, '2026-10-02')]);
    const f = await setup(t, events);
    const value = await report.query(f.request({ fromDate: '2026-10-01', toDate: '2026-10-03', breakdown: 'DAY' }));
    assert.equal(value.protected, false); assert.equal(value.counts.redemptions, 10); assert.equal(value.counts.distinctOwners, 5);
    assert.equal(value.counts.newThroughChannel, 0); assert.equal(value.counts.returningThroughChannel, 5);
    assert.equal(value.rates.returningThroughChannelRate.percent, '100.0000');
    assert.deepEqual(value.rows.map(r => [r.key, r.counts.returningThroughChannel]), [['2026-10-01', 5], ['2026-10-02', 5]]);
    assert.equal(JSON.stringify(value).includes('owner-'), false);
});

test('outlet and group deduplication use different canonical dimensions, not employee actors', async t => {
    const events = five((owner, i) => [event(owner, 'old-' + i, '2026-09-01'),
        event(owner, 'new-' + i, '2026-10-01', { redeemerEnterpriseCode: 'redeemer2', storeCode: 'outlet2' })]);
    const f = await setup(t, events);
    const group = await report.query(f.request({ scopeType: 'GROUP', scopeCode: 'redeemer', fromDate: '2026-10-01' }));
    assert.equal(group.counts.returningThroughChannel, 5);
    const enterprise = await report.query(f.request({ fromDate: '2026-10-01' }, 'redeemer2'));
    assert.equal(enterprise.counts.newThroughChannel, 5);
    const scoped = report.classify(events, { type: 'OUTLET', code: 'outlet2' }).filter(e => e.storeCode === 'outlet2');
    assert.ok(scoped.every(e => e.classification === 'NEW_THROUGH_CHANNEL'));
});

test('linked purchase cohort conversion uses all-time redemption evidence, not an unrelated period ratio', async t => {
    const events = five((owner, i) => [event(owner, 'p-' + i, '2026-09-01', { kind: 'PURCHASE', acquisitionCode: 'acq-' + i }),
        event(owner, 'r-' + i, '2026-10-01', { acquisitionCode: 'acq-' + i })]);
    const f = await setup(t, events);
    const value = await report.query(f.request({ view: 'ISSUER', fromDate: '2026-09-01', toDate: '2026-09-02' }, 'issuer'));
    assert.equal(value.counts.purchases, 5); assert.equal(value.counts.redemptions, 0);
    assert.deepEqual(value.rates.redemptionRate, { numerator: 5, denominator: 5, percent: '100.0000' });
    assert.equal(value.counts.issuances, null);
});

test('small complementary footprints suppress total, every related rate and breakdown key across alternate filters', async t => {
    const events = five((owner, i) => event(owner, 'r-' + i, '2026-10-01'));
    events.push(event('owner-0', 'later', '2026-10-02'));
    const f = await setup(t, events);
    for (const payload of [{}, { toDate: '2026-10-02' }, { fromDate: '2026-10-02' }, { breakdown: 'OUTLET' }, { breakdown: 'DAY' }]) {
        const result = await report.query(f.request(payload));
        assert.equal(result.protected, true); assert.deepEqual(result.rows, []);
        assert.ok(Object.values(result.counts).every(v => v === null));
        assert.ok(Object.values(result.rates).every(v => Object.values(v).every(n => n === null)));
    }
});

test('incomplete history is Unknown until a prior confirmed redemption proves a repeat; legacy linkage is not zero conversion', async t => {
    const events = five((owner, i) => [event(owner, 'r1-' + i, '2026-09-01', { historyKnown: false }),
        event(owner, 'r2-' + i, '2026-10-01', { historyKnown: false })]);
    const f = await setup(t, events);
    assert.equal((await report.query(f.request({ toDate: '2026-10-01' }))).counts.unknown, 5);
    assert.equal((await report.query(f.request({ fromDate: '2026-10-01' }))).counts.returningThroughChannel, 5);
    assert.deepEqual((await report.query(f.request({ view: 'ISSUER' }, 'issuer'))).rates.redemptionRate,
        { numerator: null, denominator: null, percent: null });
});

test('typed Enterprise and Customer equal codes remain distinct; unknown owner suppresses every view', async t => {
    const f = await setup(t, five((owner, i) => [event(owner, 'c-' + i, '2026-10-01'),
        event(owner, 'e-' + i, '2026-10-01', { ownerRef: { type: 'ENTERPRISE', code: owner } })]));
    assert.equal((await report.query(f.request())).counts.distinctOwners, 10);
    const result = report.aggregate([event(null, 'x', '2026-10-01', { ownerRef: null })], 5, 'ISSUER');
    assert.equal(result.protected, true);
});

test('scope denial/drift, request mutation, malformed dates and absent defaults fail closed', async t => {
    const f = await setup(t, []);
    const scopeOwner = SERVICE.DefaultCouponAcquisitionReportScopeService;
    delete SERVICE.DefaultCouponAcquisitionReportScopeService;
    await assert.rejects(report.query(f.request()), error => error.code === 'ERR_PROMOTION_COUPON_REPORT_UNCONFIRMED');
    SERVICE.DefaultCouponAcquisitionReportScopeService = scopeOwner;
    for (const payload of [{ fromDate: '2026-02-30' }, { fromDate: '2026-10-02', toDate: '2026-10-01' },
        { scopeType: 'ENTERPRISE', scopeCode: 'foreign' }, { scopeType: 'GROUP' }, { privacyThreshold: 1 }])
        await assert.rejects(report.query(f.request(payload)));
    let count = 0;
    SERVICE.DefaultCouponAcquisitionReportScopeService.resolve = async () => ({ basis: 'SIGNED_ENTERPRISE', enterpriseCodes: [++count === 1 ? 'redeemer' : 'foreign'] });
    await assert.rejects(report.query(f.request()));
    SERVICE.DefaultCouponAcquisitionReportScopeService.resolve = async () => { throw new Error('DENIED'); };
    await assert.rejects(report.query(f.request()), /DENIED/);
    delete f.settings.acquisitionReportQuery;
    assert.throws(() => report.querySettings());
});

test('zero denominator is explicitly unknown; exact percentages obey effective framework scale', t => {
    const f = fixture(t);
    assert.deepEqual(report.rate(0, 0), { numerator: 0, denominator: 0, percent: null });
    assert.equal(report.rate(1, 3).percent, '33.3333');
    f.settings.acquisitionReportQuery.rateScale = 6;
    assert.equal(report.rate(1, 3).percent, '33.333333');
    assert.throws(() => report.rate(6, 5));
});
