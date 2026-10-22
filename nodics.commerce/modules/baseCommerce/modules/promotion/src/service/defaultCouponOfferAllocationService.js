/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
const { isDeepStrictEqual } = require('node:util');
const issuance = new WeakMap();
/** @module promotion/service/defaultCouponOfferAllocationService @description Owns transactional offer-wide supply, lifetime purchasing-owner allowance and recovery through the existing coupon lifecycle. @layer service @owner promotion */
module.exports = {
    /** Refuses uncertain authority or acquisition outcomes. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PROMOTION_COUPON_ALLOCATION_UNCONFIRMED'); },
    /** Stable opaque identity includes tenant, offer and canonical owner or command. */
    code: function (kind, values) { return kind + ':' + crypto.createHash('sha256').update(JSON.stringify(values)).digest('hex'); },
    /** Requires a typed canonical owner; employee identity never becomes Enterprise allowance identity. */
    owner: function (r) {
        const owner = r.ownerRef;
        if (!owner || Object.keys(owner).sort().join(',') !== 'code,type' || !['CUSTOMER', 'ENTERPRISE'].includes(owner.type)) this.fail();
        SERVICE.DefaultCouponOfferService.identifier(owner.code);
        return { type: owner.type, code: owner.code };
    },
    /** Delegates current buyer/actor authority to Digital's common acquisition boundary. */
    context: async function (r) {
        SERVICE.DefaultPromotionOperationService.requireOperationalRuntime();
        const owner = this.owner(r), auth = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
        if (!r.tenant || !r.ownerId || !r.idempotencyKey || !r.payload?.orderCode ||
            typeof auth?.authorize !== 'function') this.fail();
        const proof = await auth.authorize(r);
        if (!proof || !isDeepStrictEqual(proof.ownerRef, owner) || proof.ownerId !== r.ownerId ||
            proof.tenant !== r.tenant || proof.orderCode !== r.payload.orderCode) this.fail();
        await SERVICE.DefaultCouponSecureIssuanceService.persistence(r);
        return { ...r, ownerRef: owner, authData: structuredClone(r.authData), payload: structuredClone(r.payload) };
    },
    /** Captures the reservation identity including exact inputs, independent of later employee retries. */
    identity: function (r, campaign) {
        return { tenant: r.tenant, promotionCode: campaign.code, ownerRef: this.owner(r), ownerId: r.ownerId,
            orderCode: r.payload.orderCode, entryCode: r.payload.entryCode, productCode: r.payload.productCode,
            idempotencyKey: r.idempotencyKey, certificateCodes: (r.payload.certificateCodes || []).slice().sort() };
    },
    /** Builds a generated private record with explicit issuer association. */
    record: function (r, campaign, code, evidence, current) {
        return { code, tenant: r.tenant, enterpriseCode: campaign.issuerEnterpriseRef.code, promotionCode: campaign.code,
            revision: current ? current.revision + 1 : 0, evidence };
    },
    /** Checks and changes both counters in the same transaction as coupon and reservation evidence. */
    counters: async function (r, campaign, reserveDelta, completedDelta) {
        const persistence = SERVICE.DefaultCouponAcquisitionPersistenceService, offer = SERVICE.DefaultCouponOfferService.validate(campaign.couponOffer);
        const entries = [
            ['couponOfferSupply', this.code('offer', [r.tenant, campaign.code]), offer.supply.mode === 'LIMITED' ? offer.supply.quantity : undefined],
            ['couponOwnerAllowance', this.code('owner', [r.tenant, campaign.code, this.owner(r)]), offer.ownerLimit],
        ];
        for (const [schema, code, limit] of entries) {
            const current = await persistence.read(schema, r, code), prior = current?.evidence || { reserved: 0, completed: 0,
                offer, ...(schema === 'couponOwnerAllowance' ? { ownerRef: this.owner(r) } : {}) };
            if (!isDeepStrictEqual(prior.offer, offer) || schema === 'couponOwnerAllowance' && !isDeepStrictEqual(prior.ownerRef, this.owner(r))) this.fail();
            const evidence = { ...prior, reserved: prior.reserved + reserveDelta, completed: prior.completed + completedDelta };
            if (![evidence.reserved, evidence.completed, evidence.reserved + evidence.completed].every(value => Number.isSafeInteger(value) && value >= 0) ||
                limit !== undefined && evidence.reserved + evidence.completed > limit) this.fail();
            await persistence.write(schema, r, current, this.record(r, campaign, code, evidence, current));
        }
    },
    /** Recognizes only a private in-flight unlimited issuance request under the allocation transaction. */
    issuance: function (r, campaign, allocationCode) {
        const expected = issuance.get(r);
        return !!expected && expected.transactionContext === r.transactionContext && expected.allocationCode === allocationCode &&
            isDeepStrictEqual(expected.campaign, campaign);
    },
    /** Reserves one secure coupon with shared supply/owner holds; retries preserve exact input selection. */
    reserve: async function (input, campaign) {
        const r = await this.context(input), rules = SERVICE.DefaultCouponOfferService, operation = SERVICE.DefaultPromotionOperationService;
        campaign = structuredClone(campaign);
        const offer = rules.validate(campaign.couponOffer), identity = this.identity(r, campaign);
        // On-demand receipts have no delegated publication/setup provenance.
        if (offer.supply.mode === 'UNLIMITED' &&
            campaign.issuerEnterpriseRef?.code !== campaign.vendorEnterpriseRef?.code) this.fail();
        const code = this.code('acquisition', [r.tenant, campaign.code, r.idempotencyKey]);
        const persistence = SERVICE.DefaultCouponAcquisitionPersistenceService;
        return persistence.transaction(r, ['couponOfferSupply', 'couponOwnerAllowance', 'couponAcquisitionReservation', 'couponRedeemerAgreement'], async scoped => {
            const existing = await persistence.read('couponAcquisitionReservation', scoped, code);
            if (existing) {
                if (!isDeepStrictEqual(existing.evidence.identity, identity) || existing.evidence.status === 'RELEASED') this.fail();
                const coupon = await operation.readLifecycleCoupon(scoped, existing.evidence.couponCode);
                if (coupon.offerAllocationCode !== code || coupon.idempotencyKey !== r.idempotencyKey) this.fail();
                return coupon;
            }
            if (r.ownerRef.type === 'ENTERPRISE') await SERVICE.DefaultDigitalParticipationService.couponUnit(r);
            await rules.eligibility(r, campaign);
            const participation = await SERVICE.DefaultCouponRedeemerParticipationService.capture(scoped, campaign);
            if (offer.expiry.mode === 'FIXED' && Date.parse(offer.expiry.at) <= Date.now()) this.fail();
            await this.counters(scoped, campaign, 1, 0);
            let coupon;
            if (offer.supply.mode === 'UNLIMITED') {
                const secure = SERVICE.DefaultCouponSecureIssuanceService;
                issuance.set(scoped, { transactionContext: scoped.transactionContext, campaign: structuredClone(campaign), allocationCode: code });
                try { coupon = await secure.issueOfferUnit(scoped, campaign, code); }
                finally { issuance.delete(scoped); }
            } else {
                coupon = (await operation.loadCouponPool(scoped)).find(item => operation.couponSaleAvailable(item) && item.promotionCode === campaign.code);
                if (!coupon) this.fail();
            }
            const now = new Date(), seconds = rules.settings().reservationSeconds;
            const saved = await operation.commitLifecycleCoupon(scoped, coupon, { ...coupon, status: 'RESERVED', saleStatus: 'RESERVED',
                benefitStatus: 'UNCLAIMED', reservedFor: r.ownerId, orderCode: r.payload.orderCode, cartCode: r.payload.cartCode,
                entryCode: r.payload.entryCode, productCode: r.payload.productCode, sku: r.payload.sku, idempotencyKey: r.idempotencyKey,
                reservedAt: now, reservedUntil: new Date(now.getTime() + seconds * 1000), offerAllocationCode: code, revision: coupon.revision + 1 });
            await persistence.write('couponAcquisitionReservation', scoped, undefined, this.record(scoped, campaign, code,
                { status: 'RESERVED', identity, couponCode: coupon.code, campaign, participation }));
            await this.context(r);
            return saved;
        });
    },
    /** Reads and validates the original command, never current mutable offer terms for recovery. */
    reservation: async function (r, coupon) {
        const saved = await SERVICE.DefaultCouponAcquisitionPersistenceService.read('couponAcquisitionReservation', r, coupon.offerAllocationCode);
        if (!saved || saved.evidence.couponCode !== coupon.code ||
            !isDeepStrictEqual(saved.evidence.identity, this.identity(r, saved.evidence.campaign))) this.fail();
        return saved;
    },
    /** Atomically selects forward completion or release for the entire original coupon set before any financial compensation. */
    fenceInputSet: async function (inputs) {
        if (!Array.isArray(inputs) || !inputs.length || inputs.length > SERVICE.DefaultDigitalCommerceCheckoutService.maximumCouponUnits()) this.fail();
        const contexts = [];
        for (const input of inputs) contexts.push(await this.context(input));
        const first = contexts[0], persistence = SERVICE.DefaultCouponAcquisitionPersistenceService;
        if (contexts.some(r => r.tenant !== first.tenant || r.enterpriseCode !== first.enterpriseCode || r.ownerId !== first.ownerId ||
            r.payload.orderCode !== first.payload.orderCode || !isDeepStrictEqual(r.ownerRef, first.ownerRef))) this.fail();
        return persistence.transaction(first, ['couponAcquisitionReservation'], async scoped => {
            const rows = [];
            for (const r of contexts) {
                const unit = await SERVICE.DefaultPromotionOperationService.readLifecycleCoupon(r, r.couponCode || r.payload.couponCode);
                rows.push(await this.reservation({ ...r, transactionContext: scoped.transactionContext }, unit));
            }
            if (new Set(rows.map(row => row.code)).size !== rows.length) this.fail();
            const direction = rows.some(row => row.evidence.status === 'COMPLETED' || row.evidence.inputDisposition === 'COMMIT') ? 'COMMIT' : 'RELEASE';
            for (const row of rows) {
                const e = row.evidence;
                if (!['RESERVED', 'COMPLETED', 'RELEASED'].includes(e.status) ||
                    e.inputDisposition && !['COMMIT', 'RELEASE'].includes(e.inputDisposition) ||
                    direction === 'COMMIT' && (e.status === 'RELEASED' || e.inputDisposition === 'RELEASE')) this.fail();
                if (!e.inputDisposition && e.status === 'RESERVED') await persistence.write('couponAcquisitionReservation', scoped, row,
                    this.record(scoped, e.campaign, row.code, { ...e, inputDisposition: direction }, row));
            }
            return { disposition: direction === 'COMMIT' ? 'FORWARD_REQUIRED' : 'RELEASE_ALLOWED',
                outcomes: rows.map(row => ({ code: row.evidence.couponCode, disposition: direction === 'COMMIT' ? 'FORWARD_REQUIRED' : 'RELEASE_ALLOWED' })) };
        });
    },
    /** Fences an original unit before any irreversible input attempt; a release fence cannot be reopened. */
    fenceInputs: async function (input, coupon, direction) {
        if (!['COMMIT', 'RELEASE'].includes(direction)) this.fail();
        const r = await this.context(input), persistence = SERVICE.DefaultCouponAcquisitionPersistenceService;
        return persistence.transaction(r, ['couponAcquisitionReservation'], async scoped => {
            const row = await this.reservation(scoped, coupon), e = row.evidence;
            if (e.inputDisposition && !['COMMIT', 'RELEASE'].includes(e.inputDisposition)) this.fail();
            if (e.status === 'COMPLETED' || e.inputDisposition === 'COMMIT') return 'COMMIT';
            if (e.status === 'RELEASED' || e.inputDisposition === 'RELEASE') return 'RELEASE';
            if (e.status !== 'RESERVED') this.fail();
            await persistence.write('couponAcquisitionReservation', scoped, row,
                this.record(scoped, e.campaign, row.code, { ...e, inputDisposition: direction }, row));
            return direction;
        });
    },
    /** Commits lifetime allowance only with authoritative complete consideration; lost responses replay the original sale. */
    complete: async function (input, coupon) {
        const r = await this.context(input), persistence = SERVICE.DefaultCouponAcquisitionPersistenceService;
        return persistence.transaction(r, ['couponOfferSupply', 'couponOwnerAllowance', 'couponAcquisitionReservation', 'couponRedeemerAgreement'], async scoped => {
            const current = await this.reservation(scoped, coupon), e = current.evidence;
            const operation = SERVICE.DefaultPromotionOperationService;
            if (e.status === 'COMPLETED') {
                const live = await operation.readLifecycleCoupon(scoped, e.couponCode);
                if (!['SOLD', 'DELIVERED', 'CLAIMED', 'REDEEMED'].includes(live.status) || live.soldTo !== r.ownerId ||
                    live.offerAllocationCode !== current.code || live.orderCode !== r.payload.orderCode) this.fail();
                return live;
            }
            if (e.status !== 'RESERVED' || e.inputDisposition === 'RELEASE') this.fail();
            const source = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
            if (typeof source?.completion !== 'function') this.fail();
            const proof = await source.completion({ ...r, couponCode: coupon.code, requirements: e.campaign.couponOffer.requirements });
            if (!proof || proof.status !== 'COMPLETED' || proof.orderCode !== r.payload.orderCode ||
                !isDeepStrictEqual(proof.ownerRef, this.owner(r)) ||
                !isDeepStrictEqual((proof.certificateCodes || []).slice().sort(), e.identity.certificateCodes) ||
                (e.campaign.couponOffer.requirements.type === 'CERTIFICATES' ? proof.rewardCaptureReference !== undefined :
                    typeof proof.rewardCaptureReference !== 'string' || !proof.rewardCaptureReference)) this.fail();
            const saved = await operation.transitionReservedCouponSale(scoped, 'SOLD', {
                saleStatus: 'SOLD', benefitStatus: 'UNCLAIMED', orderCode: r.payload.orderCode, soldAt: new Date() });
            await this.counters(scoped, e.campaign, -1, 1);
            await persistence.write('couponAcquisitionReservation', scoped, current, this.record(scoped, e.campaign, current.code,
                { ...e, status: 'COMPLETED', completion: structuredClone(proof), completedAt: saved.soldAt }, current));
            return saved;
        });
    },
    /** Releases only owner-confirmed incomplete acquisitions; completed/uncertain outcomes retain all holds. */
    release: async function (input, coupon) {
        const r = await this.context(input), persistence = SERVICE.DefaultCouponAcquisitionPersistenceService;
        return persistence.transaction(r, ['couponOfferSupply', 'couponOwnerAllowance', 'couponAcquisitionReservation'], async scoped => {
            const current = await this.reservation(scoped, coupon), e = current.evidence, operation = SERVICE.DefaultPromotionOperationService;
            if (e.status === 'RELEASED') return operation.readLifecycleCoupon(scoped, e.couponCode);
            if (e.status !== 'RESERVED' || e.inputDisposition === 'COMMIT') this.fail();
            const source = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
            if (typeof source?.failed !== 'function') this.fail();
            const proof = await source.failed({ ...r, couponCode: coupon.code });
            if (!proof || proof.status !== 'FAILED' || proof.orderCode !== r.payload.orderCode || proof.couponUsable !== false ||
                proof.inputsReconciled !== true) this.fail();
            const live = await operation.readLifecycleCoupon(scoped, coupon.code);
            if (live.status !== 'RESERVED' || live.idempotencyKey !== r.idempotencyKey) this.fail();
            const saved = await operation.commitLifecycleCoupon(scoped, live, { ...live, status: 'ACTIVE', saleStatus: 'AVAILABLE',
                reservedFor: undefined, reservedAt: undefined, reservedUntil: undefined, idempotencyKey: undefined,
                orderCode: undefined, cartCode: undefined, entryCode: undefined, productCode: undefined, sku: undefined,
                benefitStatus: undefined, offerAllocationCode: undefined, revision: live.revision + 1 });
            await this.counters(scoped, e.campaign, -1, 0);
            await persistence.write('couponAcquisitionReservation', scoped, current, this.record(scoped, e.campaign, current.code,
                { ...e, status: 'RELEASED', failure: structuredClone(proof) }, current));
            return saved;
        });
    },
    /** Exposes a non-reserving secret-free offer summary; unlimited is explicit, never a fabricated quantity. */
    availability: async function (r, campaign) {
        const offer = SERVICE.DefaultCouponOfferService.validate(campaign.couponOffer);
        const current = await SERVICE.DefaultCouponAcquisitionPersistenceService.read('couponOfferSupply', r, this.code('offer', [r.tenant, campaign.code]));
        if (current && !isDeepStrictEqual(current.evidence.offer, offer)) this.fail();
        if (current && ![current.evidence.reserved, current.evidence.completed].every(value => Number.isSafeInteger(value) && value >= 0)) this.fail();
        let remaining = offer.supply.mode === 'UNLIMITED' ? null : offer.supply.quantity -
            (current?.evidence.reserved || 0) - (current?.evidence.completed || 0);
        if (remaining !== null && (!Number.isSafeInteger(remaining) || remaining < 0)) this.fail();
        if (remaining !== null) {
            const operation = SERVICE.DefaultPromotionOperationService;
            const units = await operation.loadCouponPool({ ...r, payload: { promotionCode: campaign.code } });
            remaining = Math.min(remaining, units.filter(unit => operation.couponSaleAvailable(unit)).length);
        }
        return { available: !(offer.supply.mode === 'UNLIMITED' &&
                campaign.issuerEnterpriseRef?.code !== campaign.vendorEnterpriseRef?.code) &&
            (remaining === null || remaining > 0) &&
            (offer.expiry.mode === 'NONE' || Date.parse(offer.expiry.at) > Date.now()), availableQuantity: remaining === null ? null : String(remaining),
            supplyMode: offer.supply.mode, strategy: 'COUPON_CODE_POOL', inventoryStrategy: 'COUPON_CODE_POOL', guaranteed: false,
            reservableAt: 'CHECKOUT_BEFORE_PAYMENT', promotionCode: campaign.code, purchaseRequirements: offer.requirements };
    },
};
