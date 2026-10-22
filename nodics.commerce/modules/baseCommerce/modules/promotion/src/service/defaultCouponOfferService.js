/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const { isDeepStrictEqual } = require('node:util');
/** @module promotion/service/defaultCouponOfferService @description Validates governed coupon offers, immutable promises, acquisition requirements and retained fixed rights. @layer service @owner promotion */
module.exports = {
    /** Rejects an unproved or malformed offer without including private inputs. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PROMOTION_COUPON_OFFER_INVALID'); },
    /** Reads complete framework defaults after layering; missing or invalid settings fail closed. */
    settings: function () {
        const value = CONFIG.get('promotion')?.couponOffers;
        if (!value || Object.values(value).some(item => !Number.isSafeInteger(item) || item < 1) ||
            !['maximumCertificates', 'maximumTerms', 'maximumTermLength', 'maximumPolicyBytes', 'maximumParticipants',
                'maximumStores', 'reservationSeconds', 'maximumReservationSeconds'].every(key => Number.isSafeInteger(value[key])) ||
            value.reservationSeconds > value.maximumReservationSeconds) this.fail();
        return value;
    },
    /** Validates exact record keys, rejecting unsupported rules instead of ignoring them. */
    object: function (value, keys) {
        if (!value || Object.getPrototypeOf(value) !== Object.prototype || Object.keys(value).some(key => !keys.includes(key))) this.fail();
        return value;
    },
    /** Validates canonical scalar references. */
    identifier: function (value) {
        if (typeof value !== 'string' || !/^[A-Za-z0-9_.:@-]{1,256}$/.test(value)) this.fail();
        return value;
    },
    /** Normalizes bounded unique canonical selections without inventing business defaults. */
    codes: function (value, maximum) {
        if (!Array.isArray(value) || !value.length || value.length > maximum || new Set(value).size !== value.length) this.fail();
        value.forEach(code => this.identifier(code));
        return value.slice().sort();
    },
    /** Checks explicit fixed/no-expiry terms; absence is never inferred as no expiry. */
    expiry: function (value) {
        this.object(value, ['mode', 'at']);
        if (value.mode === 'NONE' && Object.keys(value).length === 1) return { mode: 'NONE' };
        if (value.mode !== 'FIXED' || typeof value.at !== 'string' || !Number.isFinite(Date.parse(value.at)) ||
            new Date(value.at).toISOString() !== value.at) this.fail();
        return { mode: 'FIXED', at: value.at };
    },
    /** Keeps requirements typed and Pricing authoritative for any points cost. */
    requirements: function (value) {
        this.object(value, ['type', 'priceRef', 'certificates']);
        const result = this.acquisitionRequirements({ type: value.type,
            ...(value.certificates !== undefined ? { certificates: value.certificates } : {}) });
        if (value.type !== 'CERTIFICATES') result.priceRef = this.identifier(value.priceRef);
        else if (value.priceRef !== undefined) this.fail();
        return result;
    },
    /** Validates and detaches the public requirements DTO without exposing Pricing references or accepting inferred defaults. */
    acquisitionRequirements: function (value) {
        const limits = this.settings();
        this.object(value, ['type', 'certificates']);
        if (Reflect.ownKeys(value).some(key => !['type', 'certificates'].includes(key) ||
            !Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value')) ||
            !['REWARDS', 'CERTIFICATES', 'BOTH'].includes(value.type)) this.fail();
        const result = { type: value.type };
        if (value.type !== 'REWARDS') {
            const c = this.object(value.certificates, ['quantity', 'categoryCode', 'brandCodes', 'modelCodes', 'milestoneCode']);
            if (Reflect.ownKeys(c).some(key => !['quantity', 'categoryCode', 'brandCodes', 'modelCodes', 'milestoneCode'].includes(key) ||
                !Object.hasOwn(Object.getOwnPropertyDescriptor(c, key), 'value'))) this.fail();
            if (!Number.isSafeInteger(c.quantity) || c.quantity < 1 || c.quantity > limits.maximumCertificates) this.fail();
            result.certificates = { quantity: c.quantity, categoryCode: this.identifier(c.categoryCode),
                milestoneCode: this.identifier(c.milestoneCode) };
            for (const key of ['brandCodes', 'modelCodes']) if (c[key] !== undefined)
                result.certificates[key] = this.codes(c[key], limits.maximumCertificates);
        } else if (value.certificates !== undefined) this.fail();
        return result;
    },
    /** Projects canonical supply into public purchase requirements; a legacy or missing policy remains explicitly unknown and unavailable. */
    publicSupply: function (supply) {
        if (!supply || typeof supply.available !== 'boolean') this.fail();
        let acquisitionRequirements = null;
        if (supply.purchaseRequirements !== undefined && supply.purchaseRequirements !== null) {
            const { priceRef, ...safe } = this.requirements(supply.purchaseRequirements);
            acquisitionRequirements = safe;
        }
        const available = supply.available && acquisitionRequirements !== null;
        return { available, status: available ? 'IN_STOCK' : 'OUT_OF_STOCK', acquisitionRequirements };
    },
    /** Validates a complete governed offer and preserves optional lifetime caps as explicit records. */
    validate: function (value) {
        const limits = this.settings();
        this.object(value, ['version', 'supply', 'ownerLimit', 'expiry', 'requirements', 'terms']);
        if (value.version !== 1) this.fail();
        const supply = this.object(value.supply, ['mode', 'quantity']);
        if (supply.mode === 'LIMITED') {
            if (!Number.isSafeInteger(supply.quantity) || supply.quantity < 1) this.fail();
        } else if (supply.mode !== 'UNLIMITED' || supply.quantity !== undefined) this.fail();
        if (value.ownerLimit !== undefined && (!Number.isSafeInteger(value.ownerLimit) || value.ownerLimit < 1)) this.fail();
        if (!Array.isArray(value.terms) || value.terms.length > limits.maximumTerms || value.terms.some(line =>
            typeof line !== 'string' || !line.trim() || line.length > limits.maximumTermLength)) this.fail();
        const result = { version: 1, supply: structuredClone(supply), expiry: this.expiry(value.expiry),
            requirements: this.requirements(value.requirements), terms: value.terms.slice(),
            ...(value.ownerLimit !== undefined ? { ownerLimit: value.ownerLimit } : {}) };
        if (Buffer.byteLength(JSON.stringify(result)) > limits.maximumPolicyBytes) this.fail();
        return result;
    },
    /** Validates trusted certificate-owner observations; never treats a browser DTO as owner proof. */
    evaluate: function (campaign, evidence, ownerRef, reservationCode) {
        const requirements = this.validate(campaign.couponOffer).requirements;
        if (!Array.isArray(evidence)) this.fail();
        if (requirements.type === 'REWARDS') { if (evidence.length) this.fail(); return requirements; }
        const condition = requirements.certificates;
        if (evidence.length !== condition.quantity || new Set(evidence.map(item => item.code)).size !== evidence.length) this.fail();
        for (const item of evidence) {
            this.identifier(item.code);
            if (!isDeepStrictEqual(item.ownerRef, ownerRef) || item.valid !== true || item.consumed !== false ||
                item.available !== true && (!reservationCode || item.reservationCode !== reservationCode) ||
                item.categoryCode !== condition.categoryCode || !Array.isArray(item.milestoneCodes) ||
                !item.milestoneCodes.includes(condition.milestoneCode) ||
                condition.brandCodes && !condition.brandCodes.includes(item.brandCode) ||
                condition.modelCodes && !condition.modelCodes.includes(item.modelCode)) this.fail();
        }
        return requirements;
    },
    /** Reads selected certificates through the component owner, retaining earned, bought and gifted equivalence. */
    eligibility: async function (request, campaign) {
        const offer = this.validate(campaign.couponOffer), ids = request.payload?.certificateCodes || [];
        const ownerRef = SERVICE.DefaultCouponOfferAllocationService.owner(request);
        if (offer.requirements.type === 'REWARDS') return this.evaluate(campaign, ids, ownerRef);
        this.codes(ids, this.settings().maximumCertificates);
        const source = SERVICE.DefaultDigitalCommerceCouponAcquisitionService;
        if (typeof source?.readCertificateEligibility !== 'function') this.fail();
        const evidence = await source.readCertificateEligibility({ ...request, ownerRef, certificateCodes: ids.slice(),
            promotionCode: campaign.code, requirements: structuredClone(offer.requirements) });
        if (!Array.isArray(evidence) || !isDeepStrictEqual(evidence.map(item => item?.code).sort(), ids.slice().sort())) this.fail();
        return this.evaluate(campaign, evidence, ownerRef, request.idempotencyKey);
    },
    /** Captures the immutable promise at purchase, including bilateral accepted redemption scopes. */
    capture: async function (request, campaign, coupon, purchasedAt) {
        const offer = this.validate(campaign.couponOffer), time = purchasedAt?.getTime();
        if (!Number.isFinite(time) || offer.expiry.mode === 'FIXED' && Date.parse(offer.expiry.at) <= time ||
            !Number.isSafeInteger(campaign.revision) || campaign.revision < 0) this.fail();
        const participation = await SERVICE.DefaultCouponRedeemerParticipationService.capture(request, campaign);
        const purchasePolicy = { version: 2, promotionCode: campaign.code, promotionRevision: campaign.revision,
            purchasedAt: purchasedAt.toISOString(), name: campaign.name, conditions: structuredClone(campaign.conditions || {}),
            actions: structuredClone(campaign.actions || {}), couponOffer: offer, participation,
            originalOwnerRef: SERVICE.DefaultCouponOfferAllocationService.owner(request),
            finality: { refundable: false, transferable: false, singleUse: true },
            issuerEnterpriseRef: structuredClone(coupon.issuerEnterpriseRef), vendorEnterpriseRef: structuredClone(coupon.vendorEnterpriseRef) };
        if (Buffer.byteLength(JSON.stringify(purchasePolicy)) > this.settings().maximumPolicyBytes) this.fail();
        return { validFrom: purchasedAt, validTo: offer.expiry.mode === 'FIXED' ? new Date(offer.expiry.at) : undefined, purchasePolicy };
    },
    /** Verifies retained rights independently of mutable offer activity and later participation withdrawal. */
    retained: function (coupon, campaign) {
        const p = coupon.purchasePolicy, offer = this.validate(p?.couponOffer);
        if (p.version !== 2 || p.promotionCode !== coupon.promotionCode || campaign && campaign.code !== coupon.promotionCode ||
            !isDeepStrictEqual(p.issuerEnterpriseRef, coupon.issuerEnterpriseRef) ||
            !isDeepStrictEqual(p.vendorEnterpriseRef, coupon.vendorEnterpriseRef) ||
            !isDeepStrictEqual(p.finality, { refundable: false, transferable: false, singleUse: true }) ||
            !Number.isFinite(Date.parse(p.purchasedAt)) || Date.parse(p.purchasedAt) !== new Date(coupon.soldAt).getTime() ||
            new Date(coupon.validFrom).getTime() !== Date.parse(p.purchasedAt) ||
            offer.expiry.mode === 'NONE' && coupon.validTo !== undefined && coupon.validTo !== null ||
            offer.expiry.mode === 'FIXED' && new Date(coupon.validTo).toISOString() !== offer.expiry.at ||
            !Number.isSafeInteger(p.promotionRevision) || p.promotionRevision < 0 ||
            !p.originalOwnerRef || !Array.isArray(p.participation) || !p.participation.length) this.fail();
        return { ...structuredClone(p), code: p.promotionCode, status: 'ACTIVE', active: true,
            validFrom: coupon.validFrom, validTo: coupon.validTo };
    },
    /** Returns only reusable unsaved content; creation must still pass normal owner authoring. */
    workspace: function (request) {
        SERVICE.DefaultPromotionBusinessWorkbenchService.context(request);
        const presentation = SERVICE.DefaultPromotionBackofficeCapabilityService?.couponOfferPresentationData?.();
        if (presentation?.contractVersion !== 1 || !presentation.labels ||
            Object.values(presentation.labels).some(value => typeof value !== 'string' || !value || value.length > 512) ||
            !Array.isArray(presentation.benefitOptions) || !Array.isArray(presentation.requirementOptions)) this.fail();
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        return { ...structuredClone(presentation), limits: structuredClone(this.settings()),
            canCreate: SERVICE.DefaultPromotionDraftService.available(request) === true &&
                security.isPermissionGranted('commerce.promotion.manage', security.getGrantedPermissions(request), {}) === true };
    },
    /**
     * Reads one scoped current offer, including inactive drafts, without sales or mutation authority.
     * @param {Object} request Original signed employee request with promotionCode.
     * @returns {Promise<Object>} Detached owner record for the fixed inspect/prefill projections.
     * @throws {CLASSES.NodicsError} On missing, ambiguous, foreign or changed authority evidence.
     * @override Preserve exact generated reads, signed scope and post-read checks; never fall back to version history.
     */
    authoringOffer: async function (request) {
        const workbench = SERVICE.DefaultPromotionBusinessWorkbenchService, scope = workbench.context(request);
        const code = this.identifier(request.promotionCode);
        const response = await SERVICE.DefaultPromotionService.get({ tenant: scope.tenant, authData: workbench.persistenceAuth(),
            query: { tenant: scope.tenant, enterpriseCode: scope.enterpriseCode, code },
            options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, pageNumber: 1 } });
        SERVICE.DefaultPromotionOperationService.assertLifecycleEnvelope(response);
        if (!isDeepStrictEqual(workbench.context(request), scope) || request.promotionCode !== code ||
            !Array.isArray(response.result) || response.result.length !== 1 || response.count !== 1) this.fail();
        const campaign = response.result[0];
        if (campaign.code !== code || campaign.tenant !== scope.tenant || campaign.enterpriseCode !== scope.enterpriseCode ||
            [campaign.enterpriseRef?.code, campaign.issuerEnterpriseRef?.code].some(value => value !== undefined && value !== scope.enterpriseCode) ||
            !campaign.couponOffer || !Number.isSafeInteger(campaign.revision) || campaign.revision < 0 ||
            !Number.isSafeInteger(campaign.versionId) || campaign.versionId < 0) this.fail();
        return structuredClone(campaign);
    },
    /** Returns exact owner-visible offer content without purchase, recipient, consent or counter records. */
    inspect: async function (request) {
        const campaign = await this.authoringOffer(request);
        return { code: campaign.code, name: campaign.name, status: campaign.status, revision: campaign.revision,
            versionId: campaign.versionId, actions: structuredClone(campaign.actions), conditions: structuredClone(campaign.conditions),
            couponOffer: this.validate(campaign.couponOffer) };
    },
    /** Returns only reusable unsaved content; creation must still pass normal owner authoring. */
    prefill: async function (request) {
        const scope = SERVICE.DefaultPromotionDraftService.scope(request);
        const campaign = await this.authoringOffer(request);
        if (!isDeepStrictEqual(SERVICE.DefaultPromotionDraftService.scope(request), scope)) this.fail();
        return { name: campaign.name, actions: structuredClone(campaign.actions), conditions: structuredClone(campaign.conditions),
            couponOffer: this.validate(campaign.couponOffer) };
    },
    /** Enforces immutable benefits/terms from initial creation across generic/import/versioned writes. */
    protect: async function (request) {
        const operation = SERVICE.DefaultPromotionOperationService;
        for (const model of [].concat(request.models || request.model || [])) {
            if (!model || typeof model !== 'object' || Array.isArray(model)) this.fail();
            if (Object.keys(model).some(key => key.startsWith('$') || key.includes('.'))) {
                // Operator writes may update unrelated budget/consent fields only on ordinary campaigns.
                request.query = { ...(request.query || {}), couponOffer: { $exists: false } };
                continue;
            }
            const code = model.code || request.query?.code;
            if (typeof code !== 'string') {
                if (model.couponOffer !== undefined) this.fail();
                request.query = { ...(request.query || {}), couponOffer: { $exists: false } };
                continue;
            }
            const draft = SERVICE.DefaultPromotionDraftService?.couponOfferWriteState?.(request);
            let current = draft?.current;
            if (!draft) {
                const enterpriseCode = request.query?.enterpriseCode || model.enterpriseCode;
                const response = await SERVICE.DefaultPromotionService.get({ tenant: request.tenant, authData: operation.serviceAuthData(request),
                    query: { tenant: request.tenant, code, ...(enterpriseCode ? { enterpriseCode } : {}) },
                    options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, pageNumber: 1 } });
                operation.assertLifecycleEnvelope(response);
                if (!Array.isArray(response.result) || response.result.length > 1 || response.result.some(row => row.code !== code || row.tenant !== request.tenant)) this.fail();
                current = response.result[0];
            }
            if (model.couponOffer !== undefined) {
                this.validate(model.couponOffer);
                if (model.purchasedCouponPolicy !== undefined) this.fail();
            }
            if (current?.couponOffer) {
                if (request.query?.revision !== undefined && request.query.revision !== current.revision) this.fail();
                for (const key of ['actions', 'conditions', 'couponOffer', 'issuerEnterpriseRef', 'vendorEnterpriseRef', 'validFrom', 'validTo', 'purchasedCouponPolicy'])
                    if (model[key] !== undefined && !isDeepStrictEqual(model[key], current[key])) this.fail();
                // Original revision in the generated write closes the read/write race.
                request.query = { ...(request.query || {}), code, revision: current.revision };
            } else if (current && model.couponOffer !== undefined) this.fail();
            else if (model.couponOffer !== undefined && (!model.actions || !model.issuerEnterpriseRef || !model.vendorEnterpriseRef)) this.fail();
        }
        return true;
    },
    /** Retains original offers and their rights; removing them is never a cosmetic correction. */
    protectRemove: function (request) { request.query = { ...(request.query || {}), couponOffer: { $exists: false } }; return true; },
};
