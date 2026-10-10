/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const { isDeepStrictEqual } = require('node:util');
const reads = new WeakMap(), policies = new WeakMap();

/** @module promotion/service/defaultPromotionSellerPolicyService @description Resolves issuer-pinned vendor distribution from existing immutable issuance receipts and fresh consent. Private read identity permits exact publication/budget reads only, never caller scope switching or budget mutation. @layer service @owner promotion @override Later layers may narrow selection through mergeable members; preserve signed seller, exact receipt/root/fingerprint/grant, private identity, unchanged issuer budget and legacy fallback. */
module.exports = {
    /** Refuses without exposing retained receipts or authority details. @returns {never} Typed denial. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PROMOTION_SELLER_UNCONFIRMED'); },
    /** Keeps disabled/unselected legacy behavior; selected unqualified consent fails closed. @param {Object} request Storefront context. @returns {Object|undefined} Detached signed seller. */
    context: function (request) {
        const publication = SERVICE.DefaultPromotionPublicationService, seller = SERVICE.DefaultCouponSellerAuthorizationService;
        if (!publication?.deliveryEnabled(request)) return undefined;
        if (!seller?.policy()) return undefined;
        const admitted = SERVICE.DefaultPromotionDistributionAdmissionService?.resolveReadContext(request);
        if (admitted) return admitted;
        return seller.sellerReadContext(request);
    },
    /** Bounds discovery by the existing publication dependency ceiling, never an unbounded stock query. @returns {number} Maximum receipt bindings. */
    maximumBindings: function () {
        const maximum = SERVICE.DefaultPromotionPublicationService.publicationSettings().maxDependencies || 1000;
        if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 1000) this.fail();
        return maximum;
    },
    /** Keeps encrypted aggregates/private receipts inside the existing qualified suppression owner; policy reads never decrypt or return them. @param {string} name Generated service. @param {Object} r Signed seller. @param {Object} query Exact selector. @param {number} maximum Bound. @returns {Promise<Array>} Private detached rows. */
    privateRead: function (name, r, query, maximum) {
        const secure = SERVICE.DefaultCouponSecureIssuanceService;
        return secure.privateOperation(r, () => secure.read(name, r, query, maximum));
    },
    /** Validates the durable private issuance receipt, exact vendor aggregate and original admission provenance. No caller can supply a receipt instead of owner persistence. @param {Object} r Signed seller. @param {Object} batch Generated original batch. @returns {Object} Detached exact read binding. */
    binding: function (r, batch) {
        const secure = SERVICE.DefaultCouponSecureIssuanceService, command = batch?.secureIssuance?.command;
        const bounded = value => typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,128}$/.test(value);
        const provenance = value => value && Object.keys(value).sort().join(',') === 'checksum,moduleName,releaseCode,version' &&
            ['moduleName', 'releaseCode', 'version'].every(key => typeof value[key] === 'string' && value[key].length > 0 && value[key].length <= 256) &&
            /^[a-f0-9]{64}$/.test(value.checksum || '');
        if (!command?.issuanceAuthority || command.tenant !== r.tenant || batch.code !== command.batchCode ||
            command.storeCode !== r.storeCode || !['promotionCode', 'batchCode', 'rootCode', 'storeCode', 'commandReference'].every(key => bounded(command[key])) ||
            !/^[a-f0-9]{64}$/.test(command.policyFingerprint || '') ||
            typeof command.actorId !== 'string' || !command.actorId.trim() || command.actorId !== command.actorId.trim() ||
            command.actorId.length > 192 || /[\u0000-\u001f\u007f]/.test(command.actorId) ||
            !Number.isSafeInteger(command.quantity) || command.quantity < 1 || command.quantity > 1000 ||
            batch.issuedCount !== command.quantity || !Number.isFinite(Date.parse(batch.secureIssuance.createdAt)) ||
            !provenance(command.contribution) ||
            command.admissionContribution !== undefined && (!provenance(command.admissionContribution) || !bounded(command.admissionCommandReference)) ||
            secure.stockEnterprise(command) !== r.enterpriseCode) this.fail();
        secure.assertStockScope(batch, command, batch);
        const units = batch.secureIssuance.units;
        if (!Array.isArray(units) || units.length !== command.quantity || new Set(units.map(unit => unit?.code)).size !== units.length ||
            units.some((unit, index) => unit?.code !== batch.code + ':' + (index + 1) ||
                !/^[a-f0-9]{64}$/.test(unit.tokenHash || '') || !/^[a-f0-9]{64}$/.test(unit.protectedFingerprint || ''))) this.fail();
        return { tenant: r.tenant, sellerEnterpriseCode: r.enterpriseCode, issuerEnterpriseCode: command.enterpriseCode,
            storeCode: command.storeCode, rootCode: command.rootCode, promotionCode: command.promotionCode,
            batchCode: batch.code, policyFingerprint: command.policyFingerprint,
            ...structuredClone(command.issuanceAuthority),
            issuanceFingerprint: SERVICE.DefaultPromotionPublicationService.fingerprint(batch.secureIssuance),
            admissionContribution: structuredClone(command.admissionContribution || command.contribution),
            ...(command.admissionContribution ? { admissionCommandReference: command.admissionCommandReference } : {}) };
    },
    /** Rereads an exact original seller batch with private receipt projection; no token decryption or caller issuer selection. @param {Object} r Signed seller. @param {string} batchCode Exact original batch. @returns {Promise<Object>} Current owner binding. */
    readBinding: async function (r, batchCode) {
        if (typeof batchCode !== 'string' || !/^[A-Za-z0-9_.:-]{1,128}$/.test(batchCode)) this.fail();
        const rows = await this.privateRead('DefaultCouponBatchService', r,
            { tenant: r.tenant, enterpriseCode: r.enterpriseCode, code: batchCode }, 1);
        if (rows.length !== 1) this.fail();
        return this.binding(r, rows[0]);
    },
    /** Admits only the exact unchanged in-flight read envelope; copied flags, retained objects or alternate bindings grant nothing. @param {Object} command Private read command. @returns {Object} Detached authority for Publication only. */
    resolvePolicyRead: function (command) {
        const expected = reads.get(command);
        if (!expected || !isDeepStrictEqual(command, expected)) this.fail();
        return structuredClone(expected);
    },
    /** Reads one exact issuer policy/budget after fresh consent; both original receipt and consent are rechecked after awaits. @param {Object} r Signed seller. @param {Object} binding Original receipt binding. @returns {Promise<Object>} Policy plus safe budget snapshot. */
    readBound: async function (r, binding) {
        r = this.context(r);
        if (!r || !binding || typeof binding !== 'object' || Array.isArray(binding)) this.fail();
        binding = structuredClone(binding);
        const publication = SERVICE.DefaultPromotionPublicationService, seller = SERVICE.DefaultCouponSellerAuthorizationService;
        if (!publication.deliveryRoots(r).includes(binding.rootCode)) this.fail();
        if (!isDeepStrictEqual(await this.readBinding(r, binding.batchCode), binding)) this.fail();
        await seller.authorizePolicyRead(r, binding);
        const command = { request: structuredClone(r), binding: structuredClone(binding) };
        reads.set(command, structuredClone(command));
        let result;
        try { result = await publication.readSellerPolicy(command); }
        finally { reads.delete(command); }
        if (!isDeepStrictEqual(await this.readBinding(r, binding.batchCode), binding)) this.fail();
        await seller.authorizePolicyRead(r, binding);
        const expected = structuredClone({ request: r, binding });
        policies.set(result.policy, expected);
        policies.set(result.retainedPolicy, expected);
        return result;
    },
    /** Returns delegated policies for one selected root, or undefined so the parent retains its ordinary own-enterprise reader. Missing/corrupt delegated authority is never mutable fallback. @param {Object} request Signed Storefront context. @param {string} rootCode Selected exact root. @returns {Promise<Array|undefined>} Issuer-owned policies with current issuer consumption. */
    readRoot: async function (request, rootCode) {
        SERVICE.DefaultPromotionDistributionAdmissionService?.assertReadPurpose(request, 'ROOT');
        const r = this.context(request);
        if (!r) return undefined;
        if (!SERVICE.DefaultPromotionPublicationService.deliveryRoots(r).includes(rootCode)) this.fail();
        const batches = await this.privateRead('DefaultCouponBatchService', r,
            { tenant: r.tenant, enterpriseCode: r.enterpriseCode, status: 'GENERATED' }, this.maximumBindings());
        const bindings = batches.filter(batch => batch.secureIssuance?.command?.storeCode === r.storeCode &&
            batch.secureIssuance.command.rootCode === rootCode &&
            batch.issuerEnterpriseRef?.code !== r.enterpriseCode).map(batch => this.binding(r, batch));
        if (!bindings.length) return undefined;
        if (new Set(bindings.map(binding => binding.promotionCode)).size !== bindings.length) this.fail();
        const result = [];
        for (const binding of bindings) result.push((await this.readBound(r, binding)).policy);
        return result;
    },
    /** Resolves a coupon by fresh generated identity before selecting its original delegated policy. Disabled/unselected paths refuse retained consent proof; unprotected legacy stock keeps its existing path. @param {Object} request Signed Storefront context. @param {Object} observed Owner-observed coupon with code/batch identity. @returns {Promise<Object|undefined>} Parent couponPurchaseCampaign result. */
    readCoupon: async function (request, observed) {
        SERVICE.DefaultPromotionDistributionAdmissionService?.assertReadPurpose(request, 'COUPON');
        const r = this.context(request);
        if (!r) {
            if (observed?.sellerAuthorizationProof) this.fail();
            return undefined;
        }
        if (!observed || !['code', 'batchCode', 'promotionCode'].every(key =>
            typeof observed[key] === 'string' && /^[A-Za-z0-9_.:-]{1,128}$/.test(observed[key]))) this.fail();
        const secure = SERVICE.DefaultCouponSecureIssuanceService;
        const rows = await this.privateRead('DefaultCouponService', r,
            { tenant: r.tenant, enterpriseCode: r.enterpriseCode, code: observed.code }, 1);
        if (rows.length !== 1 || rows[0].batchCode !== observed.batchCode || rows[0].promotionCode !== observed.promotionCode) this.fail();
        const coupon = rows[0];
        if (coupon.issuerEnterpriseRef?.code === r.enterpriseCode) {
            if (coupon.sellerAuthorizationProof && !isDeepStrictEqual(coupon.sellerAuthorizationProof, {
                issuerEnterpriseCode: r.enterpriseCode, sellerEnterpriseCode: r.enterpriseCode,
                promotionCode: coupon.promotionCode, grantRevision: 0 })) this.fail();
            return undefined;
        }
        const binding = await this.readBinding(r, coupon.batchCode);
        const batch = (await this.privateRead('DefaultCouponBatchService', r,
            { tenant: r.tenant, enterpriseCode: r.enterpriseCode, code: binding.batchCode }, 1))[0];
        if (!batch || !isDeepStrictEqual(this.binding(r, batch), binding)) this.fail();
        const unit = batch.secureIssuance.units.find(item => item.code === coupon.code);
        if (!unit || unit.tokenHash !== coupon.tokenHash ||
            unit.protectedFingerprint !== SERVICE.DefaultPromotionPublicationService.fingerprint(coupon.protectedToken)) this.fail();
        const command = { tenant: r.tenant, enterpriseCode: binding.issuerEnterpriseCode, promotionCode: binding.promotionCode,
            batchCode: binding.batchCode, issuanceAuthority: { issuerEnterpriseRef: binding.issuerEnterpriseRef,
                vendorEnterpriseRef: binding.vendorEnterpriseRef, sellerAuthorizationProof: binding.sellerAuthorizationProof } };
        secure.assertStockScope(coupon, command, coupon);
        if (coupon.secureIssuanceCode !== binding.batchCode || observed.promotionCode !== binding.promotionCode) this.fail();
        return { campaign: (await this.readBound(r, binding)).retainedPolicy, activated: true };
    },
    /** Discovers private stock once, narrows receipt-bound candidates through current Product metadata, then verifies only candidate pinned policies. Metadata grants no authority; parent retains stock counting/reservation. @param {Object} request Signed Storefront context. @param {string} productCode Canonical Product. @returns {Promise<Object|undefined>} Exact delegated campaign and batch. */
    readProduct: async function (request, productCode) {
        SERVICE.DefaultPromotionDistributionAdmissionService?.assertReadPurpose(request, 'PRODUCT', productCode);
        const r = this.context(request);
        if (!r) return undefined;
        if (typeof productCode !== 'string' || !/^[A-Za-z0-9_.:-]{1,128}$/.test(productCode) ||
            request.productCode !== undefined && request.productCode !== productCode) this.fail();
        const roots = new Set(SERVICE.DefaultPromotionPublicationService.deliveryRoots(r));
        const batches = await this.privateRead('DefaultCouponBatchService', r,
            { tenant: r.tenant, enterpriseCode: r.enterpriseCode, status: 'GENERATED' }, this.maximumBindings());
        const bindings = batches.filter(batch => batch.secureIssuance?.command?.storeCode === r.storeCode &&
            roots.has(batch.secureIssuance.command.rootCode) &&
            batch.issuerEnterpriseRef?.code !== r.enterpriseCode).map(batch => this.binding(r, batch));
        if (!bindings.length) return undefined;
        if (new Set(bindings.map(binding => binding.promotionCode)).size !== bindings.length) this.fail();
        const candidates = new Set(await SERVICE.DefaultCouponSellerAuthorizationService.productPolicyCandidates(r, productCode, bindings));
        const selected = [];
        for (const binding of bindings.filter(item => candidates.has(item.promotionCode))) {
            const policy = (await this.readBound(r, binding)).policy;
            SERVICE.DefaultPromotionDistributionAdmissionService?.assertProductPolicy(r, policy);
            if (policy.conditions?.sourceProductCode !== productCode) this.fail();
            selected.push(policy);
        }
        if (!selected.length) return undefined;
        if (selected.length !== 1) this.fail();
        return { campaign: selected[0], batchCode: policies.get(selected[0]).binding.batchCode };
    },
    /** Revalidates an exact owner-returned policy identity and reads the issuer's budget without exposing receipt actors, grants or a write context. @param {Object} request Signed seller. @param {Object} policy Exact object returned by this bridge. @returns {Promise<Object>} Safe issuer budget snapshot. */
    readBudget: async function (request, policy) {
        SERVICE.DefaultPromotionDistributionAdmissionService?.assertReadPurpose(request, 'BUDGET');
        const r = this.context(request), expected = policies.get(policy);
        if (!r || !expected || !isDeepStrictEqual(r, expected.request)) this.fail();
        return (await this.readBound(r, expected.binding)).budget;
    },
};
