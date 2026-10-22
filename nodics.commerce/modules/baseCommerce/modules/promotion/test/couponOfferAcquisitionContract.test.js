/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const offer = require('../src/service/defaultCouponOfferService');
const allocation = require('../src/service/defaultCouponOfferAllocationService');
const persistence = require('../src/service/defaultCouponAcquisitionPersistenceService');
const participation = require('../src/service/defaultCouponRedeemerParticipationService');
const reporting = require('../src/service/defaultCouponAcquisitionReportingService');
const operation = require('../src/service/defaultPromotionOperationService');
const secure = require('../src/service/defaultCouponSecureIssuanceService');
const publication = require('../src/service/defaultPromotionPublicationService');
const defaults = require('../config/properties');
const schemas = require('../src/schemas/schemas').promotion;
const hooks = require('../src/interceptors/interceptors');
const capability = require('../src/service/defaultPromotionBackofficeCapabilityService');
const presentation = require('../data/backoffice/promotionCouponOfferPresentationData');

const fixture = require('./helpers/couponAcquisitionFixture');

test('workspace preserves its DTO through owner data contribution and effective provider overrides', t => {
    const f = fixture(t);
    let checked = 0;
    SERVICE.DefaultPromotionBusinessWorkbenchService = { context: () => { checked++; } };
    SERVICE.DefaultPromotionBackofficeCapabilityService = { ...capability };
    SERVICE.DefaultPromotionDraftService = { available: () => true };
    SERVICE.DefaultSecuredRequestPipelineService = {
        getGrantedPermissions: () => ['commerce.promotion.manage'],
        isPermissionGranted: (permission, permissions) => permissions.includes(permission),
    };
    const result = offer.workspace(f.request());
    assert.equal(checked, 1);
    assert.deepEqual(result, { ...structuredClone(presentation), limits: structuredClone(f.settings.couponOffers), canCreate: true });
    assert.equal(defaults.promotion.couponOfferPresentation, undefined);
    result.labels.title = 'MUTATED';
    assert.equal(offer.workspace(f.request()).labels.title, presentation.labels.title);
    SERVICE.DefaultPromotionBackofficeCapabilityService.couponOfferPresentationData = function () {
        return { ...capability.couponOfferPresentationData(), labels: { ...presentation.labels, title: 'Partner offers' } };
    };
    assert.equal(offer.workspace(f.request()).labels.title, 'Partner offers');
    SERVICE.DefaultPromotionDraftService.available = () => false;
    assert.equal(offer.workspace(f.request()).canCreate, false);
    delete SERVICE.DefaultPromotionBackofficeCapabilityService;
    assert.throws(() => offer.workspace(f.request()), { code: 'ERR_PROMOTION_COUPON_OFFER_INVALID' });
});

test('workspace source contribution is hash-declared separately from executable releases', () => {
    const fs = require('node:fs'), path = require('node:path');
    const manifest = require('../data/manifest.json'), section = manifest.sections.couponOfferPresentation;
    assert.equal(section.kind, 'SOURCE_CONTRIBUTION');
    assert.equal(section.sourceRoot, 'backoffice');
    assert.equal(section.dataType, undefined);
    const file = 'backoffice/promotionCouponOfferPresentationData.js';
    assert.deepEqual(Object.keys(section.files), [file]);
    assert.equal(section.files[file], crypto.createHash('sha256')
        .update(fs.readFileSync(path.join(__dirname, '../data', file))).digest('hex'));
});

test('explicit NONE/fixed validity and supported requirements inherit validated bounds', t => {
    const f = fixture(t);
    assert.equal(offer.validate(f.campaign.couponOffer).expiry.mode, 'NONE');
    for (const change of [{ expiry: {} }, { supply: { mode: 'UNLIMITED', quantity: 9999 } },
        { ownerLimit: 0 }, { requirements: { type: 'REWARDS', priceRef: 'price', customRule: true } }])
        assert.throws(() => offer.validate({ ...f.campaign.couponOffer, ...change }));
    f.settings.couponOffers.maximumCertificates = 1;
    assert.throws(() => offer.requirements({ type: 'CERTIFICATES', certificates: { quantity: 2, categoryCode: 'c', milestoneCode: 'm' } }));
    delete f.settings.couponOffers.maximumCertificates;
    assert.throws(() => offer.validate(f.campaign.couponOffer));
});

test('offer-wide supply and lifetime owner caps commit with sale, including concurrent final units and replay', async t => {
    const f = fixture(t), first = f.request();
    const reserved = await f.operation.reserveCouponCodeForCheckout(first);
    assert.equal(reserved.status, 'RESERVED');
    assert.equal((await f.operation.reserveCouponCodeForCheckout(first)).code, reserved.code);
    await assert.rejects(f.operation.reserveCouponCodeForCheckout(f.request('buyer', 'second')));
    const sale = { ...first, payload: { ...first.payload, couponCode: reserved.code } };
    const sold = await f.operation.confirmCouponCodeSale(sale);
    assert.equal(sold.status, 'SOLD');
    assert.equal(sold.purchasePolicy.version, 2);
    assert.equal(sold.validTo, undefined);
    assert.equal((await f.operation.confirmCouponCodeSale(sale)).soldAt.getTime(), sold.soldAt.getTime());
    const results = await Promise.allSettled([f.operation.reserveCouponCodeForCheckout(f.request('two', 'two')),
        f.operation.reserveCouponCodeForCheckout(f.request('three', 'three'))]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.deepEqual([...f.tables.get('couponOfferSupply').values()].map(row => [row.evidence.reserved, row.evidence.completed]), [[1, 1]]);
    await assert.rejects(f.operation.revokePurchasedCoupon({ ...sale, couponCode: sold.code, orderCode: sold.orderCode, refundCode: 'refund' }));
});

test('failed receipt persistence rolls back coupon and both counters; uncertainty retains holds', async t => {
    const f = fixture(t), r = f.request();
    f.state.failNextWrite = 'couponAcquisitionReservation';
    await assert.rejects(f.operation.reserveCouponCodeForCheckout(r));
    assert.equal(f.tables.get('couponOfferSupply').size, 0);
    assert.equal([...f.tables.get('coupon').values()].filter(row => row.status === 'RESERVED').length, 0);
    const coupon = await f.operation.reserveCouponCodeForCheckout(r), command = { ...r, payload: { ...r.payload, couponCode: coupon.code } };
    await assert.rejects(f.operation.releaseCouponCodeReservation(command));
    assert.equal(f.tables.get('coupon').get(coupon.code).status, 'RESERVED');
    f.state.failure = { status: 'FAILED', orderCode: r.payload.orderCode, couponUsable: false, inputsReconciled: true };
    const released = await f.operation.releaseCouponCodeReservation(command);
    assert.equal(released.status, 'ACTIVE');
    assert.equal(released.offerAllocationCode, undefined);
    assert.equal([...f.tables.get('couponOwnerAllowance').values()][0].evidence.reserved, 0);
    await assert.rejects(f.operation.reserveCouponCodeForCheckout(r));
});

test('unlimited offers issue one real protected unit per command while preserving lifetime owner caps', async t => {
    const f = fixture(t);
    f.campaign.couponOffer.supply = { mode: 'UNLIMITED' };
    const r = f.request(), coupon = await f.operation.reserveCouponCodeForCheckout(r);
    assert.ok(coupon.protectedToken.ciphertext);
    assert.equal(f.tables.get('couponBatch').size, 1);
    assert.equal(f.state.captured.length, 1);
    assert.equal((await f.operation.reserveCouponCodeForCheckout(r)).code, coupon.code);
    assert.equal(f.state.captured.length, 1);
    await assert.rejects(f.operation.reserveCouponCodeForCheckout(f.request('buyer', 'different')));
    const availability = await allocation.availability(r, f.campaign);
    assert.equal(availability.supplyMode, 'UNLIMITED');
    assert.equal(availability.availableQuantity, null);
});

test('delegated unlimited offers refuse before holds or issuance and do not advertise availability', async t => {
    const f = fixture(t), r = f.request();
    f.campaign.couponOffer.supply = { mode: 'UNLIMITED' };
    f.campaign.issuerEnterpriseRef.code = 'other-issuer';
    await assert.rejects(allocation.reserve(r, f.campaign), { code: 'ERR_PROMOTION_COUPON_ALLOCATION_UNCONFIRMED' });
    assert.equal(f.tables.get('couponOfferSupply').size, 0);
    assert.equal(f.tables.get('couponOwnerAllowance').size, 0);
    assert.equal(f.tables.get('couponBatch').size, 0);
    assert.equal(f.state.captured.length, 0);
    const available = await allocation.availability(r, f.campaign);
    assert.equal(available.available, false);
    assert.equal(available.availableQuantity, null);
    SERVICE.DefaultCouponOfferAllocationService = { ...allocation, issuance: () => true };
    await assert.rejects(secure.issueOfferUnit({ ...r, transactionContext: {} }, f.campaign, 'allocation'),
        { code: 'ERR_PROMOTION_SECURE_ISSUANCE_UNCONFIRMED' });
    assert.equal(f.state.captured.length, 0);
});

test('certificate-only consumes exact selected eligibility without fake capture', async t => {
    const f = fixture(t), r = f.request();
    f.campaign.couponOffer.requirements = { type: 'CERTIFICATES', certificates: { quantity: 2, categoryCode: 'phone', milestoneCode: 'RECYCLED' } };
    r.payload.certificateCodes = ['c1', 'c2'];
    f.state.eligibility = r.payload.certificateCodes.map(code => ({ code, ownerRef: r.ownerRef, valid: true, consumed: false,
        available: true, categoryCode: 'phone', milestoneCodes: ['RECYCLED'] }));
    const coupon = await f.operation.reserveCouponCodeForCheckout(r);
    const sold = await f.operation.confirmCouponCodeSale({ ...r, payload: { ...r.payload, couponCode: coupon.code } });
    assert.equal(sold.purchasePolicy.couponOffer.requirements.type, 'CERTIFICATES');
    const receipt = [...f.tables.get('couponAcquisitionReservation').values()][0];
    assert.equal(receipt.evidence.completion.rewardCaptureReference, undefined);
    const other = f.request('other', 'other'); other.payload.certificateCodes = ['c1', 'c1'];
    await assert.rejects(f.operation.reserveCouponCodeForCheckout(other));
});

test('combined acquisition requires exact selected certificates and a completed reward capture', async t => {
    const f = fixture(t), r = f.request();
    f.campaign.couponOffer.requirements = { type: 'BOTH', priceRef: 'price', certificates: {
        quantity: 1, categoryCode: 'phone', milestoneCode: 'RECYCLED' } };
    r.payload.certificateCodes = ['selected'];
    f.state.eligibility = [{ code: 'different', ownerRef: r.ownerRef, valid: true, consumed: false,
        available: true, categoryCode: 'phone', milestoneCodes: ['RECYCLED'] }];
    await assert.rejects(f.operation.reserveCouponCodeForCheckout(r));
    assert.equal(f.tables.get('couponOfferSupply').size, 0);
    f.state.eligibility[0].code = 'selected';
    const coupon = await f.operation.reserveCouponCodeForCheckout(r);
    const complete = SERVICE.DefaultDigitalCommerceCouponAcquisitionService.completion;
    SERVICE.DefaultDigitalCommerceCouponAcquisitionService.completion = async input => {
        const proof = await complete(input); delete proof.rewardCaptureReference; return proof;
    };
    const command = { ...r, payload: { ...r.payload, couponCode: coupon.code } };
    await assert.rejects(f.operation.confirmCouponCodeSale(command));
    assert.equal(f.tables.get('coupon').get(coupon.code).status, 'RESERVED');
    assert.equal([...f.tables.get('couponOfferSupply').values()][0].evidence.completed, 0);
    SERVICE.DefaultDigitalCommerceCouponAcquisitionService.completion = complete;
    assert.equal((await f.operation.confirmCouponCodeSale(command)).status, 'SOLD');
});

test('Enterprise cap is canonical across employee actors and owner object key order', async t => {
    const f = fixture(t), first = f.request('enterprise', 'first'), second = f.request('enterprise', 'second');
    SERVICE.DefaultDigitalParticipationService = { couponUnit: async () => {} }; // Digital admission is separately composed in its owner tests.
    first.ownerRef = { type: 'ENTERPRISE', code: 'enterprise' };
    second.ownerRef = { code: 'enterprise', type: 'ENTERPRISE' };
    first.authData = { tenant: 't', principalType: 'employee', loginId: 'employee-one' };
    second.authData = { tenant: 't', principalType: 'employee', loginId: 'employee-two' };
    await f.operation.reserveCouponCodeForCheckout(first);
    await assert.rejects(f.operation.reserveCouponCodeForCheckout(second));
    assert.equal(f.tables.get('couponOwnerAllowance').size, 1);
    assert.deepEqual([...f.tables.get('couponOwnerAllowance').values()][0].evidence.ownerRef, first.ownerRef);
});

test('fixed rights do not slide with purchase time or mutable campaign edits', async t => {
    const f = fixture(t), r = f.request(), purchasedAt = new Date('2026-10-18T10:00:00Z');
    f.campaign.couponOffer.expiry = { mode: 'FIXED', at: '2027-01-01T00:00:00.000Z' };
    const coupon = f.tables.get('coupon').get('coupon1');
    const patch = await offer.capture(r, f.campaign, coupon, purchasedAt);
    const saved = { ...coupon, ...patch, soldAt: purchasedAt };
    assert.equal(patch.validTo.toISOString(), '2027-01-01T00:00:00.000Z');
    assert.equal(offer.retained(saved, { ...f.campaign, actions: { discountAmount: '999' } }).actions.discountAmount, '5');
    assert.throws(() => offer.retained({ ...saved, validTo: new Date('2028-01-01') }));
    const none = { ...saved, purchasePolicy: structuredClone(saved.purchasePolicy) };
    none.purchasePolicy.couponOffer.expiry = { mode: 'NONE' };
    assert.throws(() => offer.retained(none));
});

test('private records refuse generic reads/writes and unqualified topology', async t => {
    const f = fixture(t);
    await assert.rejects(SERVICE.DefaultCouponOwnerAllowanceService.get({ query: {} }));
    await assert.rejects(SERVICE.DefaultCouponOwnerAllowanceService.save({ model: {} }));
    SERVICE.DefaultDatabaseTransactionService.capabilities = () => ({ multiRecordAtomic: false });
    await assert.rejects(f.operation.reserveCouponCodeForCheckout(f.request()));
    assert.equal(f.tables.get('couponOfferSupply').size, 0);
});

test('benefit/supply edits and imported replacements cannot change existing offers; prefill removes identities', async t => {
    const f = fixture(t), r = f.request();
    for (const model of [{ actions: { discountAmount: '9' } }, { couponOffer: { ...f.campaign.couponOffer, supply: { mode: 'UNLIMITED' } } }])
        await assert.rejects(offer.protect({ ...r, query: { code: 'offer' }, model }));
    const cosmetic = { ...r, query: { code: 'offer' }, model: { name: 'Corrected' } };
    await offer.protect(cosmetic); assert.equal(cosmetic.query.revision, 0);
    await assert.rejects(offer.protect({ ...r, query: { code: 'offer', revision: 99 }, model: { name: 'Stale correction' } }),
        { code: 'ERR_PROMOTION_COUPON_OFFER_INVALID' });
    SERVICE.DefaultPromotionDraftService = { scope: () => ({ tenant: 't', enterpriseCode: 'issuer' }) };
    SERVICE.DefaultPromotionBusinessWorkbenchService = { context: () => ({ tenant: 't', enterpriseCode: 'issuer' }),
        persistenceAuth: () => r.authData };
    const prefill = await offer.prefill({ ...r, promotionCode: 'offer' });
    assert.deepEqual(Object.keys(prefill).sort(), ['actions', 'conditions', 'couponOffer', 'name']);
});

test('offer inspection and prefill read scoped inactive drafts without borrowing active sales admission', async t => {
    const f = fixture(t), r = { ...f.request(), promotionCode: 'offer' };
    const scope = { tenant: 't', enterpriseCode: 'issuer' };
    SERVICE.DefaultPromotionBusinessWorkbenchService = { context: () => structuredClone(scope), persistenceAuth: () => r.authData };
    SERVICE.DefaultPromotionDraftService = { scope: () => structuredClone(scope) };
    const campaign = f.tables.get('promotion').get('offer');
    campaign.active = false; campaign.status = 'DRAFT';
    SERVICE.DefaultCouponSellerAuthorizationService.campaign = async () => { throw new Error('Sales admission is not draft inspection'); };
    assert.equal((await offer.inspect(r)).status, 'DRAFT');
    assert.equal((await offer.prefill(r)).couponOffer.version, 1);
    campaign.enterpriseCode = 'foreign';
    await assert.rejects(offer.inspect(r), { code: 'ERR_PROMOTION_COUPON_OFFER_INVALID' });
    campaign.enterpriseCode = 'issuer';
    const get = SERVICE.DefaultPromotionService.get;
    SERVICE.DefaultPromotionService.get = async input => {
        assert.deepEqual(input.query, { tenant: 't', enterpriseCode: 'issuer', code: 'offer' });
        const result = await get(input); scope.enterpriseCode = 'changed'; return result;
    };
    await assert.rejects(offer.inspect(r), { code: 'ERR_PROMOTION_COUPON_OFFER_INVALID' });
});

test('bilateral participation requires acceptance, retains scopes after withdrawal, and refuses stale commands', async t => {
    const f = fixture(t);
    SERVICE.DefaultStoreMerchantReadService = { read: async (_r, code) => ({ code, enterpriseRef: { code: 'redeemer' } }) };
    const r = { tenant: 't', promotionCode: 'offer', enterpriseCode: 'issuer', authData: { enterpriseCode: 'issuer', loginId: 'issuer-staff' },
        payload: { action: 'AUTHORIZE', redeemerEnterpriseCode: 'redeemer', scope: { mode: 'SELECTED', storeCodes: ['outlet'] }, expectedRevision: 0, commandReference: 'invite' } };
    await participation.decide(r);
    assert.equal((await participation.capture(r, f.campaign)).length, 1);
    const accept = { ...r, enterpriseCode: 'redeemer', authData: { enterpriseCode: 'redeemer', loginId: 'redeemer-staff' },
        payload: { action: 'ACCEPT', redeemerEnterpriseCode: 'redeemer', expectedRevision: 0, commandReference: 'accept' } };
    await participation.decide(accept);
    const retained = await participation.capture(r, f.campaign);
    assert.equal(retained.length, 2);
    await assert.rejects(participation.decide({ ...accept, payload: { ...accept.payload, commandReference: 'stale' } }));
    await participation.decide({ ...accept, payload: { action: 'WITHDRAW', redeemerEnterpriseCode: 'redeemer', expectedRevision: 1, commandReference: 'withdraw' } });
    assert.equal((await participation.capture(r, f.campaign)).length, 1);
    assert.deepEqual(retained[1].scope.storeCodes, ['outlet']);
});

test('report refresh pages complete history, uses event time and actual redeemer, protects all related cells and retains failed watermark', async t => {
    const f = fixture(t); f.settings.acquisitionReporting.enabled = true; f.settings.acquisitionReporting.pageSize = 1;
    const base = { kind: 'REDEMPTION', promotionCode: 'offer', issuerEnterpriseCode: 'issuer', redeemerEnterpriseCode: 'redeemer',
        storeCode: 'outlet', ownerRef: { type: 'ENTERPRISE', code: 'buyer-enterprise' }, channel: 'circa', confirmed: true, historyKnown: true };
    let events = [{ ...base, sourceId: 'later', confirmedAt: '2026-10-16T00:00:00.000Z' },
        { ...base, sourceId: 'earlier', confirmedAt: '2026-10-15T00:00:00.000Z' }];
    const coverageThrough = '2026-10-17T00:00:00.000Z';
    SERVICE.DefaultDigitalCommerceCouponAcquisitionService.reportingEvents = async r => {
        const index = r.cursor ? Number(r.cursor) : 0;
        return { tenant: 't', snapshotId: 'snapshot', historyComplete: true, coverageThrough, events: [events[index]],
            complete: index === events.length - 1, nextCursor: index === events.length - 1 ? null : String(index + 1) };
    };
    const request = { tenant: 't', channelCode: 'circa', authData: { tenant: 't', principalType: 'service', tokenType: 'internal' } };
    await reporting.refresh(request);
    const projection = [...f.tables.get('couponAcquisitionProjection').values()][0];
    assert.equal(projection.evidence.events[0].sourceId, 'earlier');
    assert.equal(projection.evidence.events[0].classification, 'NEW_THROUGH_CHANNEL');
    assert.equal(projection.evidence.events[1].classification, 'RETURNING_THROUGH_CHANNEL');
    const result = reporting.aggregate(projection.evidence.events, 5, 'REDEEMER');
    assert.equal(result.protected, true); assert.ok(Object.values(result.counts).every(value => value === null));
    const issuer = reporting.aggregate(projection.evidence.events, 5, 'ISSUER');
    assert.equal(issuer.counts.newThroughChannel, null);
    events = [events[0], { ...events[0], confirmedAt: '2026-10-14T00:00:00.000Z' }];
    await assert.rejects(reporting.refresh(request));
    assert.deepEqual([...f.tables.get('couponAcquisitionProjection').values()][0], projection);
});

test('reporting reconciles over one thousand facts and counts a known Enterprise once across employee events', async t => {
    const f = fixture(t); f.settings.acquisitionReporting.enabled = true;
    const events = Array.from({ length: 1001 }, (_, index) => ({ sourceId: 'source-' + String(index).padStart(4, '0'),
        kind: 'REDEMPTION', promotionCode: 'offer', issuerEnterpriseCode: 'issuer', redeemerEnterpriseCode: 'redeemer',
        storeCode: 'outlet', ownerRef: index % 2 ? { code: 'enterprise', type: 'ENTERPRISE' } : { type: 'ENTERPRISE', code: 'enterprise' },
        confirmedAt: new Date(Date.UTC(2026, 9, 1, 0, 0, index)).toISOString(), channel: 'circa', confirmed: true, historyKnown: index !== 0 }));
    let pages = 0;
    SERVICE.DefaultDigitalCommerceCouponAcquisitionService.reportingEvents = async r => {
        pages++; const offset = Number(r.cursor || 0), next = offset + r.pageSize;
        return { tenant: 't', snapshotId: 'snapshot-large', coverageThrough: '2026-10-17T00:00:00.000Z', historyComplete: true,
            events: events.slice(offset, next), complete: next >= events.length, nextCursor: next >= events.length ? null : String(next) };
    };
    await reporting.refresh({ tenant: 't', channelCode: 'circa', authData: { tenant: 't', principalType: 'service', tokenType: 'internal' } });
    assert.equal(pages, 6);
    const rows = [...f.tables.get('couponAcquisitionProjection').values()][0].evidence.events;
    assert.equal(rows.length, 1001);
    assert.equal(rows[0].classification, 'UNKNOWN');
    assert.equal(rows[1].classification, 'RETURNING_THROUGH_CHANNEL');
    assert.equal(rows.filter(row => row.classification === 'NEW_THROUGH_CHANNEL').length, 0);
    assert.equal(reporting.aggregate(rows, 5, 'REDEEMER').protected, true);
});
