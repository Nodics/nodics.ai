/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const { isDeepStrictEqual } = require('node:util');
const mutations = new WeakMap(), admissions = new WeakMap(), fences = new WeakMap();
const failures = new WeakMap();

/** @module promotion/service/defaultPromotionCouponBudgetService @description Privately admits coupon-bound issuer benefit accounting from the canonical merchant owner, never from policy-read authority or caller-supplied receipts. @layer service @owner promotion @override Later layers may narrow exported members; retain original signed identity, private handoff, secure unit membership, explicit benefit consent and original inverse linkage. */
module.exports = {
    /** Returns only an original owner's fixed failure stage; copies and caller fields grant nothing. @param {Error} error Original failure. @returns {string|undefined} Safe stage. */
    failureStage: function (error) { return failures.get(error); },
    /** Refuses without exposing private issuance, accounting or principal evidence. @returns {never} Typed refusal. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED'); },
    /** Requires the canonical merchant owner's exact in-flight handoff, not a copied data envelope. @param {Object} command Opaque handoff. @param {string} type COMMIT or RELEASE. @returns {Promise<Object>} Detached original operation evidence. */
    handoff: async function (command, type) {
        const merchant = SERVICE.DefaultPromotionMerchantScopeService;
        if (!merchant?.resolveBudgetRequest || !['COMMIT', 'RELEASE'].includes(type)) this.fail();
        const result = await merchant.resolveBudgetRequest(command, type);
        const budget = SERVICE.DefaultPromotionBudgetMutationService, r = result?.request;
        if (!r || !result || !budget) this.fail();
        SERVICE.DefaultPromotionOperationService.requireOperationalRuntime();
        const auth = r.authData || {}, enterprise = auth.enterpriseCode || auth.entCode, role = CONFIG.get('runtimeRole');
        if ((typeof role === 'string' ? role : role?.code) !== 'COMMERCE' || !budget.identifier(r.tenant) || auth.tenant !== r.tenant ||
            !budget.identifier(enterprise) || [r.enterpriseCode, r.entCode, auth.enterpriseCode, auth.entCode].some(value => value !== undefined && value !== enterprise) ||
            [r.tenantCode, auth.tenantCode].some(value => value !== undefined && value !== r.tenant) ||
            !budget.identifier(result.distributionStoreCode) ||
            !SERVICE.DefaultPromotionPublicationService?.deliveryEnabled({ tenant: r.tenant, storeCode: result.distributionStoreCode })) this.fail();
        const original = { tenant: r.tenant, enterpriseCode: enterprise, authData: structuredClone(auth), storeCode: r.storeCode },
            actor = auth.principalId || auth.loginId || auth.code;
        if (original.authData.tokenType !== 'access' || original.authData.principalType !== 'human' ||
            typeof r.authorization !== 'string' || r.authorization.length > 16384 || !/^Bearer [^\s]+$/.test(r.authorization) ||
            !budget.actor(actor) || !['couponCode', 'vendorEnterpriseCode', 'storeCode', 'targetCode', 'operationCode'].every(key => budget.identifier(result[key])) ||
            !budget.actor(result.ownerId) || !['POS', 'CART'].includes(result.targetType) ||
            !result.benefit || Object.keys(result.benefit).sort().join(',') !== 'amount,currency,sourceReference' ||
            !budget.key(result.benefit.sourceReference) || typeof result.benefit.currency !== 'string' || !/^[A-Z]{3}$/.test(result.benefit.currency) ||
            type === 'RELEASE' && (!budget.identifier(result.originalOperationCode) || !budget.identifier(result.reversalCode))) this.fail();
        budget.amount(result.benefit.amount);
        const fields = ['couponCode', 'vendorEnterpriseCode', 'distributionStoreCode', 'storeCode', 'ownerId', 'targetCode',
            'targetType', 'operationCode', 'benefit', ...(type === 'RELEASE' ? ['originalOperationCode', 'reversalCode'] : [])];
        const admitted = { ...structuredClone(Object.fromEntries(fields.map(key => [key, result[key]]))),
            request: { ...original, authorization: r.authorization }, actorId: actor, mutationType: type };
        admissions.set(admitted, structuredClone(admitted));
        return admitted;
    },
    /** Constructs a distinct private persistence owner, never rewriting the signed original request or returning authentication to a caller. @param {Object} admitted Private handoff. @param {string} enterprise Exact receipt-derived enterprise. @returns {Object} Internal system owner. */
    owner: function (admitted, enterprise) {
        const expected = admissions.get(admitted);
        if (!expected || !isDeepStrictEqual(admitted, expected) ||
            ![expected.request.enterpriseCode, expected.vendorEnterpriseCode].includes(enterprise)) this.fail();
        const identity = SERVICE.DefaultIdentityGovernanceService;
        if (!identity?.getSystemAuthData) this.fail();
        const authData = identity.getSystemAuthData();
        if (authData?.isSystem !== true) this.fail();
        return { tenant: admitted.request.tenant, enterpriseCode: enterprise, storeCode: admitted.distributionStoreCode,
            authData: structuredClone(authData), actorId: admitted.actorId };
    },
    /** Resolves persistence scope only for an exact private mutation envelope; arbitrary admitted-looking objects never disclose system credentials. @param {Object} envelope Exact in-flight owner command. @returns {Object} Private issuer persistence scope. */
    persistenceOwner: function (envelope) {
        const expected = mutations.get(envelope);
        if (!expected || !isDeepStrictEqual(envelope, expected.envelope)) this.fail();
        return this.owner(expected.admitted, envelope.binding.issuerEnterpriseCode);
    },
    /** Privately reads and verifies the exact issued coupon, original batch command and protected unit fingerprint. @param {Object} admitted Private merchant operation. @param {Object} transactionContext Optional opaque transaction. @returns {Promise<Object>} Detached original coupon and immutable binding. */
    stock: async function (admitted, transactionContext) {
        const secure = SERVICE.DefaultCouponSecureIssuanceService, bridge = SERVICE.DefaultPromotionSellerPolicyService;
        if (!secure?.read || !secure.assertStockScope || !bridge?.binding) this.fail();
        const r = { ...this.owner(admitted, admitted.vendorEnterpriseCode), ...(transactionContext ? { transactionContext } : {}) };
        const coupons = await secure.read('DefaultCouponService', r,
            { tenant: r.tenant, enterpriseCode: r.enterpriseCode, code: admitted.couponCode }, 1);
        const coupon = coupons[0];
        if (coupons.length !== 1 || !coupon || coupon.soldTo !== admitted.ownerId ||
            !['CLAIMED', 'REDEEMED', ...(admitted.mutationType === 'RELEASE' ? ['REVOKED'] : [])].includes(coupon.status) ||
            coupon.claimTargetCode !== admitted.targetCode || coupon.claimTargetType !== admitted.targetType ||
            !coupon.orderCode || !coupon.idempotencyKey || !Number.isFinite(Date.parse(coupon.soldAt)) || !coupon.sellerAuthorizationProof) this.fail();
        if (admitted.mutationType === 'COMMIT' && (coupon.active === false ||
            coupon.validFrom !== undefined && (!Number.isFinite(Date.parse(coupon.validFrom)) || Date.parse(coupon.validFrom) > Date.now()) ||
            coupon.validTo !== undefined && (!Number.isFinite(Date.parse(coupon.validTo)) || Date.parse(coupon.validTo) <= Date.now()))) this.fail();
        const batches = await secure.read('DefaultCouponBatchService', r,
            { tenant: r.tenant, enterpriseCode: r.enterpriseCode, code: coupon.batchCode }, 1);
        if (batches.length !== 1) this.fail();
        const batch = batches[0], binding = bridge.binding(r, batch);
        if (binding.issuerEnterpriseCode === binding.sellerEnterpriseCode || binding.promotionCode !== coupon.promotionCode ||
            binding.batchCode !== coupon.secureIssuanceCode || binding.sellerEnterpriseCode !== admitted.vendorEnterpriseCode ||
            binding.storeCode !== admitted.distributionStoreCode ||
            admitted.request.enterpriseCode !== binding.issuerEnterpriseCode ||
            !isDeepStrictEqual(binding.sellerAuthorizationProof, coupon.sellerAuthorizationProof)) this.fail();
        const unit = batch.secureIssuance.units.find(item => item.code === coupon.code);
        if (!unit || unit.tokenHash !== coupon.tokenHash || unit.protectedFingerprint !==
            SERVICE.DefaultPromotionPublicationService.fingerprint(coupon.protectedToken)) this.fail();
        secure.assertStockScope(coupon, batch.secureIssuance.command, batch);
        return { coupon, binding };
    },
    /** Requires explicit coupon-benefit authority on exactly the original distribution grant; management/read permission is insufficient. RELEASE uses its original admitted COMMIT instead of reviving consent. @param {Object} current Current issuer campaign. @param {Object} envelope Private mutation. @returns {boolean} Exact authority. */
    assertCurrent: function (current, envelope) {
        const expected = mutations.get(envelope);
        if (!expected || !isDeepStrictEqual(envelope, expected.envelope)) this.fail();
        const binding = envelope.binding;
        if (!isDeepStrictEqual(current?.issuerEnterpriseRef, binding.issuerEnterpriseRef) ||
            !isDeepStrictEqual(current?.vendorEnterpriseRef, binding.vendorEnterpriseRef)) this.fail();
        const admission = current.budgetAdmission?.command;
        if (!admission || admission.storeCode !== binding.storeCode || admission.rootCode !== binding.rootCode ||
            admission.policyFingerprint !== binding.policyFingerprint || !isDeepStrictEqual(admission.contribution, binding.admissionContribution) ||
            binding.admissionCommandReference !== undefined && admission.commandReference !== binding.admissionCommandReference) this.fail();
        if (envelope.mutationType === 'RELEASE') return true;
        SERVICE.DefaultCouponSellerAuthorizationService.proof({ enterpriseCode: binding.sellerEnterpriseCode }, {
            promotionCode: binding.promotionCode, issuerEnterpriseRef: binding.issuerEnterpriseRef,
            vendorEnterpriseRef: binding.vendorEnterpriseRef, sellerAuthorizationProof: binding.sellerAuthorizationProof,
        }, current);
        const grants = current.sellerAuthorizations?.filter(grant => grant.sellerEnterpriseCode === binding.sellerEnterpriseCode);
        if (grants?.length !== 1 || grants[0].benefitConsumption !== 'ISSUED_COUPON_BENEFIT_V1') this.fail();
        return true;
    },
    /** Revalidates the private handoff and immutable original stock after owner awaits, including inside the qualified Promotion transaction. @param {Object} envelope Exact private mutation. @param {Object} transactionContext Optional opaque transaction. @returns {Promise<Object>} Detached admitted authority. */
    resolveMutation: async function (envelope, transactionContext) {
        const expected = mutations.get(envelope);
        if (!expected || !isDeepStrictEqual(envelope, expected.envelope)) this.fail();
        const admitted = await this.handoff(expected.command, envelope.mutationType);
        if (!isDeepStrictEqual(admitted, expected.admitted)) this.fail();
        const { coupon, binding } = await this.stock(admitted, transactionContext);
        if (!isDeepStrictEqual(binding, envelope.binding) || this.purchaseFingerprint(coupon) !== envelope.purchaseFingerprint) this.fail();
        return structuredClone(envelope);
    },
    /** Fences a first COMMIT against concurrent coupon redemption in the same qualified Promotion transaction. Existing receipts never invoke this revision-only lifecycle CAS. @param {Object} envelope Exact private COMMIT. @param {Object} transactionContext Original opaque transaction. @returns {Promise<Object>} Original and successor coupon revisions. */
    fenceNewCommit: async function (envelope, transactionContext) {
        const expected = mutations.get(envelope), seller = SERVICE.DefaultCouponSellerAuthorizationService;
        if (!expected || envelope.mutationType !== 'COMMIT' || !transactionContext || !seller?.writeCoupon) this.fail();
        await this.resolveMutation(envelope, transactionContext);
        const { coupon } = await this.stock(expected.admitted, transactionContext);
        if (coupon.status !== 'CLAIMED' || coupon.benefitStatus === 'REDEEMED' || coupon.redeemedTargetCode !== undefined ||
            coupon.redeemedTargetType !== undefined || coupon.usedCount !== undefined && coupon.usedCount !== 0 ||
            !Number.isSafeInteger(coupon.revision) || coupon.revision < 0 || !Number.isSafeInteger(coupon.revision + 1)) this.fail();
        const owner = this.owner(expected.admitted, envelope.binding.sellerEnterpriseCode), operation = SERVICE.DefaultPromotionOperationService;
        const command = { tenant: owner.tenant, authData: operation.serviceAuthData(owner), transactionContext,
            query: { tenant: owner.tenant, enterpriseCode: owner.enterpriseCode, code: coupon.code, status: 'CLAIMED', revision: coupon.revision },
            model: { revision: coupon.revision + 1 }, options: { recursive: false, explain: false, snapshot: false } };
        fences.set(command, { tenant: command.tenant, authData: structuredClone(command.authData),
            query: structuredClone(command.query), model: structuredClone(command.model), options: structuredClone(command.options), transactionContext });
        let response;
        try { response = await seller.writeCoupon(command); }
        finally { fences.delete(command); }
        SERVICE.DefaultPromotionBudgetMutationService.envelope(response);
        const result = operation.unwrap(response);
        if (result?.acknowledged !== true || result.matchedCount !== 1 || result.modifiedCount !== 1) this.fail();
        const saved = (await this.stock(expected.admitted, transactionContext)).coupon;
        if (saved.status !== 'CLAIMED' || saved.revision !== coupon.revision + 1 || this.purchaseFingerprint(saved) !== envelope.purchaseFingerprint) this.fail();
        return { couponRevisionBefore: coupon.revision, couponRevisionAfter: saved.revision };
    },
    /** Checks the exact revision-only coupon fence before generated persistence; copied or retained requests grant nothing. @param {Object} command Generated coupon update. @returns {boolean} Private fence identity or ordinary owner path. */
    isFenceWrite: function (command) {
        const expected = fences.get(command);
        if (!expected) return false;
        if (command.tenant !== expected.tenant || command.transactionContext !== expected.transactionContext ||
            command.internalPersistence !== undefined || command.models !== undefined ||
            !isDeepStrictEqual(command.authData, expected.authData) || !isDeepStrictEqual(command.query, expected.query) ||
            !isDeepStrictEqual(command.model, expected.model) || !isDeepStrictEqual(command.options, expected.options)) this.fail();
        return true;
    },
    /** Pins immutable purchase identity without lifecycle status/revision, ciphertext disclosure or mutable budget spend. @param {Object} coupon Original securely issued purchase. @returns {string} Canonical identity fingerprint. */
    purchaseFingerprint: function (coupon) {
        return SERVICE.DefaultPromotionPublicationService.fingerprint(Object.fromEntries([
            'code', 'tenant', 'enterpriseCode', 'promotionCode', 'batchCode', 'secureIssuanceCode', 'tokenHash',
            'sellerAuthorizationProof', 'soldTo', 'soldAt', 'validFrom', 'validTo', 'orderCode', 'productCode', 'idempotencyKey', 'purchasePolicy',
            'claimTargetCode', 'claimTargetType',
        ].map(key => [key, coupon[key]])));
    },
    /** Dispatches one exact private merchant operation to the existing qualified budget owner; source selection never fabricates installed authority. @param {Object} command Canonical merchant handoff. @param {string} mutationType COMMIT or RELEASE. @returns {Promise<Object>} Safe immutable receipt identity and current budget. */
    execute: async function (command, mutationType) {
        let stage = 'BUDGET_HANDOFF';
        try {
            const admitted = await this.handoff(command, mutationType);
            const secure = SERVICE.DefaultCouponSecureIssuanceService, budget = SERVICE.DefaultPromotionBudgetMutationService;
            if (!secure?.privateOperation || !secure.persistence || !budget?.mutateCoupon) this.fail();
            return await secure.privateOperation(admitted.request, async () => {
                stage = 'BUDGET_STOCK';
                const { coupon, binding } = await this.stock(admitted);
                const issuer = this.owner(admitted, binding.issuerEnterpriseCode);
                stage = 'BUDGET_SECURE_PERSISTENCE';
                await secure.persistence(issuer);
                stage = 'BUDGET_PERSISTENCE';
                await budget.persistence(issuer);
                const envelope = { mutationType, request: structuredClone(admitted.request), actorId: admitted.actorId,
                    binding, couponCode: coupon.code, purchaseFingerprint: this.purchaseFingerprint(coupon),
                    ownerId: admitted.ownerId, storeCode: admitted.storeCode, targetCode: admitted.targetCode, targetType: admitted.targetType,
                    operationCode: mutationType === 'RELEASE' ? admitted.originalOperationCode : admitted.operationCode,
                    benefit: structuredClone(admitted.benefit),
                    ...(mutationType === 'RELEASE' ? { reversalCode: admitted.reversalCode } : {}) };
                mutations.set(envelope, { envelope: structuredClone(envelope), admitted, command });
                try {
                    stage = 'BUDGET_REVALIDATE';
                    await this.resolveMutation(envelope);
                    stage = 'BUDGET_MUTATE';
                    return await budget.mutateCoupon(envelope);
                } finally { mutations.delete(envelope); }
            });
        } catch (error) {
            if (error && typeof error === 'object') failures.set(error, stage);
            throw error;
        }
    },
    /** Consumes at most once per original securely issued coupon through private merchant admission. @param {Object} command Exact private handoff. @returns {Promise<Object>} Verified COMMIT. */
    consume: function (command) { return this.execute(command, 'COMMIT'); },
    /** Reverses exactly the original coupon benefit COMMIT once, never a caller-selected amount or replacement grant. @param {Object} command Exact private reversal handoff. @returns {Promise<Object>} Verified RELEASE. */
    release: function (command) { return this.execute(command, 'RELEASE'); },
};
