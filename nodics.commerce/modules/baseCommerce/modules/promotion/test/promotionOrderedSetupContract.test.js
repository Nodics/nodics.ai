/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fixture = require('./helpers/secureIssuanceFixture');
const setup = require('../src/service/defaultPromotionSetupContributionService');
const secure = require('../src/service/defaultCouponSecureIssuanceService');

/** @module promotion/test/promotionOrderedSetupContract @description Tests separately pinned budget and issuance packs through generated owners and isolated atomic persistence, not live acceptance. @layer test @owner promotion */

/** Selects a later immutable issuance pack referencing the first admission; no receipt is changed. @param {Object} f Isolated fixture. @returns {Object} Original provenance. */
function selectIssuance(f) {
    const original = setup.contributionIdentity(f.request.contribution);
    f.request.contribution.releaseCode = 'referencePack:issuance';
    f.request.contribution.checksum = 'b'.repeat(64);
    f.campaign.admissionContribution = original;
    f.payload.couponBatches = [f.intent];
    return original;
}

test('separate issuance retains original budget and current issuance provenance, spend and original actors', async t => {
    const f = fixture.create(t);
    f.payload.couponBatches = [];
    await setup.installContribution(f.request);
    f.rows.promotion[0].budget.spent = '17'; f.rows.promotion[0].revision = 2;
    const budget = structuredClone(f.rows.promotion[0]), original = selectIssuance(f);
    f.request.authData.loginId = 'operatorB';
    const plan = await setup.preflightContribution(f.request);
    assert.equal(plan.plan.campaigns[0].action, 'CURRENT');
    assert.equal(plan.plan.couponBatches[0].action, 'ISSUE'); assert.equal(f.state.writes, 1);
    const result = await setup.installContribution(f.request);
    assert.equal(result.data.campaigns[0].replayed, true);
    assert.equal(result.data.campaigns[0].currentSpent, '17');
    assert.deepEqual(f.rows.promotion[0], budget);
    const command = f.rows.couponBatch[0].secureIssuance.command;
    assert.deepEqual(command.contribution, setup.contributionIdentity(f.request.contribution));
    assert.deepEqual(command.admissionContribution, original);
    assert.equal(command.admissionCommandReference, f.campaign.commandReference);
    assert.equal(command.actorId, 'operatorB');
    const rows = structuredClone(f.rows), writes = f.state.writes;
    f.request.authData.loginId = 'operatorC';
    assert.equal((await setup.preflightContribution(f.request)).plan.couponBatches[0].action, 'CURRENT');
    assert.equal((await setup.installContribution(f.request)).data.couponBatches[0].replayed, true);
    assert.deepEqual(f.rows, rows); assert.equal(f.state.writes, writes);
});

test('an absent referenced admission cannot initialize a budget through installer or direct issuance', async t => {
    const f = fixture.create(t); selectIssuance(f);
    for (const action of [() => setup.preflightContribution(f.request), () => setup.installContribution(f.request),
        () => secure.prepare(f.request, f.intent, f.campaign), () => secure.issue(f.request, f.intent, f.campaign)])
        await assert.rejects(action, { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    assert.equal(f.state.writes, 0); assert.equal(f.state.commits, 0);
});

test('wrong original provenance, command or policy cannot adopt an installed budget', async t => {
    const f = fixture.create(t); f.payload.couponBatches = [];
    await setup.installContribution(f.request);
    const original = selectIssuance(f), rows = structuredClone(f.rows);
    for (const [key, value] of Object.entries({ moduleName: 'foreign', releaseCode: 'referencePack:foreign',
        version: '0.0.2', checksum: 'c'.repeat(64) })) {
        f.campaign.admissionContribution = { ...original, [key]: value };
        await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    }
    f.campaign.admissionContribution = original;
    for (const key of ['commandReference', 'rootCode', 'storeCode', 'policyFingerprint']) {
        const value = f.campaign[key]; f.campaign[key] = key === 'policyFingerprint' ? 'd'.repeat(64) : 'foreign';
        await assert.rejects(setup.installContribution(f.request), key === 'storeCode'
            ? /exact Store mapping/ : { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
        f.campaign[key] = value;
    }
    delete f.campaign.admissionContribution;
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    assert.equal(f.state.writes, 1); assert.deepEqual(f.rows, rows);
});

test('reference shape cannot carry actor, scope, counters, approval or descriptor authority', async t => {
    const f = fixture.create(t), original = selectIssuance(f);
    for (const value of [null, [], {}, { ...original, actorId: 'operatorA' }, { ...original, spent: '0' },
        { ...original, tenant: 'tenantA' }, { ...original, qualified: true }, { ...original, version: 1 },
        { ...original, moduleName: '../foreign' }, { ...original, checksum: '0' },
        { ...original, version: '1'.repeat(129) + '.0.0' }]) {
        f.campaign.admissionContribution = value;
        await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_SETUP_INVALID' });
    }
    f.campaign.admissionContribution = original;
    f.request.contribution.checksum = 'invalid';
    await assert.rejects(secure.prepare(f.request, f.intent, f.campaign), { code: 'ERR_PROMOTION_SETUP_INVALID' });
    assert.equal(f.state.writes, 0);
});

test('admission disappearance after complete preflight never becomes first-use authority', async t => {
    const f = fixture.create(t); f.payload.couponBatches = [];
    await setup.installContribution(f.request); selectIssuance(f);
    const effective = { ...setup, preflightContribution: async function (request) {
        const result = await setup.preflightContribution.call(this, request);
        f.rows.promotion.splice(0); return result;
    } };
    await assert.rejects(effective.installContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED' });
    assert.equal(f.rows.promotion.length, 0); assert.equal(f.state.writes, 1);
    assert.equal(f.rows.coupon.length, 0); assert.equal(f.state.commits, 0);
});

test('failed issuance and lost acknowledgment replay never replace original admitted budget', async t => {
    const f = fixture.create(t); f.payload.couponBatches = [];
    await setup.installContribution(f.request); selectIssuance(f);
    const budget = structuredClone(f.rows.promotion[0]); f.state.failCoupon = true;
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED' });
    assert.deepEqual(f.rows.promotion[0], budget); assert.equal(f.rows.coupon.length, 0);
    f.state.failCoupon = false; f.state.lost = true;
    assert.equal((await setup.installContribution(f.request)).data.couponBatches[0].replayed, true);
    assert.deepEqual(f.rows.promotion[0], budget); assert.equal(f.rows.coupon.length, 3);
    const rows = structuredClone(f.rows), writes = f.state.writes;
    await setup.installContribution(f.request);
    assert.deepEqual(f.rows, rows); assert.equal(f.state.writes, writes);
});

test('changed current release bytes and current permission remain mandatory for referenced admission', async t => {
    const f = fixture.create(t); f.payload.couponBatches = [];
    await setup.installContribution(f.request); selectIssuance(f);
    f.state.changedBytes = true;
    await assert.rejects(setup.installContribution(f.request), /immutable bytes changed/);
    f.state.changedBytes = false; f.state.allowed = false;
    await assert.rejects(setup.installContribution(f.request), { code: 'ERR_PROMOTION_BUDGET_ADMISSION_FORBIDDEN' });
    assert.equal(f.state.writes, 1); assert.equal(f.rows.coupon.length, 0);
});

test('existing and referenced release identities retain the nImport per-component bounds', async t => {
    const f = fixture.create(t);
    f.request.contribution.moduleName = 'm'.repeat(128);
    f.request.contribution.releaseCode = f.request.contribution.moduleName + ':' + 's'.repeat(128);
    f.payload.couponBatches = [];
    await setup.installContribution(f.request);
    const original = setup.contributionIdentity(f.request.contribution);
    assert.equal(original.releaseCode.length, 257);
    f.campaign.admissionContribution = original;
    f.request.contribution.releaseCode = 'referencePack:issuance';
    f.request.contribution.checksum = 'b'.repeat(64);
    f.payload.couponBatches = [f.intent];
    await setup.installContribution(f.request);
    assert.deepEqual(f.rows.couponBatch[0].secureIssuance.command.admissionContribution, original);
    for (const releaseCode of ['m'.repeat(129) + ':s', 'm:' + 's'.repeat(129), 'm:s:extra', 'm:s.path']) {
        f.campaign.admissionContribution = { ...original, releaseCode };
        await assert.rejects(setup.preflightContribution(f.request), { code: 'ERR_PROMOTION_SETUP_INVALID' });
    }
    assert.equal(f.rows.promotion.length, 1); assert.equal(f.rows.coupon.length, 3);
});
