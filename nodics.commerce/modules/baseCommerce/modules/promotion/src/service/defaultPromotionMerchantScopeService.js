/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const { isDeepStrictEqual } = require('node:util');
const admissions = new WeakMap(), preparations = new WeakMap(), lifecycle = new WeakMap(), budgetCommands = new WeakMap();
const admissionStages = new WeakMap(), admissionFailures = new WeakMap();
/** Records a fixed stage only during this owner's actual in-flight admission. */
// Keep diagnostic writes private so callers cannot inject stage text during an admission await.
const admissionDiagnostics = {
    /** Advances diagnostics only for a request already registered by the admission owner. */
    stage: function (r, value) { if (admissionStages.has(r)) admissionStages.set(r, value); }
};

/** @module promotion/service/defaultPromotionMerchantScopeService @description Admits exact purchased vendor units for their signed issuer employee without granting general vendor access. Separate persistence identity stays private to fixed owner operations. @layer service @owner promotion @override Preserve original staff, live consent, immutable issuance membership and exact operation selectors. */
module.exports = {
    /** Retains generated record wire values, including BSON IDs and ISO dates, before owner-argument cloning. @param {*} value Generated record. @returns {*} Detached JSON wire value. */
    recordSnapshot: function (value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); },
    /** Refuses without exposing another enterprise's records. @returns {never} Denial. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PROMOTION_SELLER_UNCONFIRMED'); },
    /** Returns a fixed, secret-free stage only for the original failure object; never admission authority or private cause. @param {Error} error Original owner failure. @returns {string|undefined} Bounded diagnostic. */
    admissionFailureStage: function (error) { return error && typeof error === 'object' ? admissionFailures.get(error) : undefined; },
    /** Selects only the existing qualified consent policy; no independent enablement flag. @returns {boolean} Selection. */
    enabled: function () { return CONFIG.get('promotion')?.sellerAuthorization?.enabled === true; },
    /** Checks bounded owner identities before reads. @param {*} value Identity. @returns {boolean} Valid code. */
    bounded: function (value) { return typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,256}$/.test(value); },
    /** Captures only original admission coordinates, not Express objects or opaque transport state. @param {Object} r Staff request. @returns {Object} Detached signature. */
    signature: function (r) {
        return structuredClone({ tenant: r.tenant, enterpriseCode: r.enterpriseCode, entCode: r.entCode,
            authData: r.authData, authorization: r.authorization, code: r.code, storeCode: r.storeCode,
            storeRevision: r.storeRevision, payload: r.payload, query: r.query, idempotencyKey: r.idempotencyKey });
    },
    /** Reads one exact private Promotion aggregate inside qualified capture suppression. @param {string} name Owner. @param {Object} r Internal scope. @param {Object} query Equality selector. @returns {Promise<Object|undefined>} Persisted row. */
    read: async function (name, r, query) {
        if (!['DefaultCouponService', 'DefaultCouponBatchService'].includes(name) || query.tenant !== r.tenant ||
            Object.keys(query).some(key => !['tenant', 'enterpriseCode', 'code', 'tokenHash'].includes(key)) ||
            (query.code !== undefined ? !this.bounded(query.code) || !this.bounded(query.enterpriseCode) :
                !/^[a-f0-9]{64}$/.test(query.tokenHash || ''))) this.fail();
        const secure = SERVICE.DefaultCouponSecureIssuanceService;
        const rows = await secure.privateOperation(r, () => secure.read(name, r, query, 1));
        if (rows.length > 1) this.fail();
        return rows[0];
    },
    /** Resolves exact entitlement identity without granting list access; no caller-selected vendor is accepted. @param {Object} r Signed staff. @param {string} code Exact entitlement. @returns {Promise<Object>} Private owner row. */
    locateEntitlement: async function (r, code) {
        if (!this.bounded(code) || !preparations.has(r) ||
            !isDeepStrictEqual(preparations.get(r), this.signature(r))) this.fail();
        const auth = await SERVICE.DefaultIdentityGovernanceService?.getSystemAuthData();
        if (auth?.isSystem !== true) this.fail();
        const response = await SERVICE.DefaultCouponSecureIssuanceService.privateOperation(r, () => SERVICE.DefaultDigitalEntitlementService.get({ tenant: r.tenant, authData: auth,
            query: { tenant: r.tenant, code }, options: { recursive: false, skipItemCache: true },
            searchOptions: { pageSize: 2 } }));
        SERVICE.DefaultPromotionOperationService.assertLifecycleEnvelope(response);
        if (!Array.isArray(response.result) || response.result.length !== 1 ||
            response.count !== undefined && response.count !== 1) this.fail();
        const item = response.result[0];
        if (item.tenant !== r.tenant || item.code !== code || item.providerOwner !== 'promotion' ||
            !this.bounded(item.providerCode) || !this.bounded(item.enterpriseCode)) this.fail();
        if (!isDeepStrictEqual(preparations.get(r), this.signature(r))) this.fail();
        return this.recordSnapshot(item);
    },
    /** Checks original receipt membership, protected-token fingerprint and unchanged delegated stock binding. @param {Object} r Signed issuer. @param {Object} coupon Persisted unit. @returns {Promise<Object>} Exact private binding. */
    binding: async function (r, coupon) {
        const seller = SERVICE.DefaultCouponSellerAuthorizationService, secure = SERVICE.DefaultCouponSecureIssuanceService;
        admissionDiagnostics.stage(r, 'COUPON_SCOPE');
        if (!seller.policy() || coupon.tenant !== r.tenant || !this.bounded(coupon.code) ||
            seller.enterprise(coupon.issuerEnterpriseRef) !== r.enterpriseCode ||
            seller.enterprise(coupon.vendorEnterpriseRef) !== coupon.enterpriseCode || coupon.enterpriseCode === r.enterpriseCode ||
            !coupon.soldTo || !['DELIVERED', 'CLAIMED', 'REDEEMED'].includes(coupon.status)) this.fail();
        const auth = await SERVICE.DefaultIdentityGovernanceService?.getSystemAuthData();
        if (auth?.isSystem !== true) this.fail();
        const owner = { tenant: r.tenant, enterpriseCode: coupon.enterpriseCode, authData: structuredClone(auth) };
        admissionDiagnostics.stage(r, 'SECURE_PERSISTENCE');
        await secure.persistence(owner);
        admissionDiagnostics.stage(r, 'BATCH_READ');
        const batch = await this.read('DefaultCouponBatchService', owner,
            { tenant: r.tenant, enterpriseCode: coupon.enterpriseCode, code: coupon.batchCode });
        const command = batch?.secureIssuance?.command;
        admissionDiagnostics.stage(r, 'ISSUANCE_BINDING');
        if (!command || command.enterpriseCode !== r.enterpriseCode || coupon.secureIssuanceCode !== batch.code) this.fail();
        const binding = SERVICE.DefaultPromotionSellerPolicyService.binding({ tenant: r.tenant,
            enterpriseCode: coupon.enterpriseCode, storeCode: command.storeCode }, batch);
        if (binding.issuerEnterpriseCode !== r.enterpriseCode || binding.promotionCode !== coupon.promotionCode ||
            binding.batchCode !== coupon.batchCode || !isDeepStrictEqual(binding.sellerAuthorizationProof, coupon.sellerAuthorizationProof)) this.fail();
        secure.assertStockScope(coupon, command, batch);
        admissionDiagnostics.stage(r, 'TOKEN_MEMBERSHIP');
        const unit = batch.secureIssuance.units.find(value => value.code === coupon.code);
        if (!unit || unit.tokenHash !== coupon.tokenHash ||
            unit.protectedFingerprint !== SERVICE.DefaultPromotionPublicationService.fingerprint(coupon.protectedToken)) this.fail();
        const publicationScope = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, storeCode: binding.storeCode };
        const publication = SERVICE.DefaultPromotionPublicationService;
        admissionDiagnostics.stage(r, 'PUBLICATION_SELECTION');
        if (!publication.deliveryEnabled(publicationScope) || !publication.deliveryRoots(publicationScope).includes(binding.rootCode)) this.fail();
        admissionDiagnostics.stage(r, 'ISSUER_ACTIVE'); await seller.activeEnterprise(r, r.enterpriseCode);
        admissionDiagnostics.stage(r, 'VENDOR_ACTIVE'); await seller.activeEnterprise(r, coupon.enterpriseCode);
        admissionDiagnostics.stage(r, 'CAMPAIGN_READ');
        const campaign = await seller.campaign(r, coupon.promotionCode);
        if (campaign.tenant !== r.tenant || campaign.enterpriseCode !== r.enterpriseCode ||
            seller.enterprise(campaign.vendorEnterpriseRef) !== coupon.enterpriseCode) this.fail();
        const action = campaign.actions || {}, benefit = CONFIG.get('promotion')?.merchantBenefits;
        admissionDiagnostics.stage(r, 'BENEFIT_SELECTION');
        if (['discountAmount', 'discountValue', 'percent', 'discountType'].some(key => action[key] !== undefined) &&
            (benefit?.enabled !== true || benefit.qualified !== true)) this.fail();
        // Pure consent validation receives the receipt-derived vendor, never an impersonated session.
        admissionDiagnostics.stage(r, 'CONSENT');
        seller.proof({ enterpriseCode: coupon.enterpriseCode }, coupon, campaign);
        return binding;
    },
    /** Admits an exact token or entitlement under fresh signed staff and outlet scope; same-enterprise callers retain their existing path. @param {Object} r Original staff request. @param {Object} selection Exact token or entitlement identity. @returns {Promise<boolean>} Private admission established. */
    admit: async function (r, selection = {}) {
        if (!this.enabled()) return false;
        selection = structuredClone(selection);
        const signature = this.signature(r);
        admissionStages.set(r, 'STAFF');
        try {
        const staff = await SERVICE.DefaultDigitalCommerceMerchantService.staff(r);
        if (!isDeepStrictEqual(this.signature(r), signature) || staff.enterpriseCode !== r.enterpriseCode) this.fail();
        preparations.set(r, signature);
        admissionDiagnostics.stage(r, 'PERSISTENCE_AUTH');
        const auth = await SERVICE.DefaultIdentityGovernanceService?.getSystemAuthData();
        if (auth?.isSystem !== true) this.fail();
        let coupon, item;
        if (selection.token !== undefined) {
            admissionDiagnostics.stage(r, 'TOKEN_READ');
            if (typeof selection.token !== 'string' || selection.token.trim().length < 4 || selection.token.length > 256) this.fail();
            const hashes = SERVICE.DefaultPromotionOperationService.tokenHashSelector(r.tenant, selection.token);
            const owner = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, authData: structuredClone(auth) };
            const found = [];
            for (const tokenHash of typeof hashes === 'string' ? [hashes] : hashes?.$in || []) {
                const row = await this.read('DefaultCouponService', owner, { tenant: r.tenant, tokenHash });
                if (row && !found.some(value => value.code === row.code)) found.push(row);
            }
            if (found.length !== 1) this.fail();
            coupon = found[0];
        } else {
            admissionDiagnostics.stage(r, 'ENTITLEMENT_READ');
            item = await this.locateEntitlement(r, selection.entitlementCode || r.code);
            const owner = { tenant: r.tenant, enterpriseCode: item.enterpriseCode, authData: structuredClone(auth) };
            admissionDiagnostics.stage(r, 'COUPON_READ');
            coupon = await this.read('DefaultCouponService', owner,
                { tenant: r.tenant, enterpriseCode: item.enterpriseCode, code: item.providerCode });
        }
        if (!coupon) this.fail();
        if (coupon.enterpriseCode === r.enterpriseCode) return false;
        const binding = await this.binding(r, coupon);
        admissionDiagnostics.stage(r, 'OUTLET_SCOPE');
        const merchant = await SERVICE.DefaultDigitalCommerceMerchantService.withStore(staff, { enterpriseCode: r.enterpriseCode });
        if (!SERVICE.DefaultDigitalCommerceMerchantService.scoped(staff, merchant)) this.fail();
        admissionDiagnostics.stage(r, 'PURCHASE_BINDING');
        if (item && (coupon.soldTo !== item.ownerId || coupon.productCode !== item.productCode || coupon.orderCode !== item.orderCode)) this.fail();
        admissionDiagnostics.stage(r, 'REQUEST_INTEGRITY');
        if (!isDeepStrictEqual(this.signature(r), signature)) this.fail();
        admissions.set(r, { signature, couponCode: coupon.code, vendor: coupon.enterpriseCode, binding,
            ...(item ? { entitlementCode: item.code } : {}) });
        return true;
        } catch (error) {
            if (error && typeof error === 'object') admissionFailures.set(error, admissionStages.get(r));
            throw error;
        } finally { preparations.delete(r); admissionStages.delete(r); }
    },
    /** Recognizes unchanged private request identity, never copied flags or metadata. @param {Object} r Original staff request. @returns {boolean} Admission. */
    admitted: function (r) {
        const value = admissions.get(r);
        if (value && !isDeepStrictEqual(this.signature(r), value.signature)) this.fail();
        return Boolean(value);
    },
    /** Returns only the already admitted stock owner identifier, never a credential or general query context. @param {Object} r Original staff. @returns {string} Operational enterprise. */
    stockEnterprise: function (r) { return this.admitted(r) ? admissions.get(r).vendor : r.enterpriseCode; },
    /** Lists only bounded original issuer fulfillment markers and re-admits every exact purchase before safe projection. This is not a general vendor inventory query. @param {Object} input Signed issuer employee. @returns {Promise<Object>} Safe recovery summaries. */
    queue: async function (input) {
        if (!this.enabled()) this.fail();
        const owner = SERVICE.DefaultDigitalCommerceMerchantService, r = await owner.staff(input);
        const merchant = await owner.withStore(r, { enterpriseCode: r.enterpriseCode });
        if (!owner.scoped(r, merchant)) return { redemptions: [] };
        const auth = await SERVICE.DefaultIdentityGovernanceService?.getSystemAuthData();
        if (auth?.isSystem !== true) this.fail();
        const response = await SERVICE.DefaultCouponSecureIssuanceService.privateOperation(r, () => SERVICE.DefaultDigitalEntitlementService.get({ tenant: r.tenant, authData: auth,
            query: { tenant: r.tenant, 'evidence.merchantRedemption.merchantCode': r.enterpriseCode,
                ...(merchant.store ? { 'evidence.merchantRedemption.storeRef.code': merchant.store.code } : {}) },
            options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 101 } }));
        SERVICE.DefaultPromotionOperationService.assertLifecycleEnvelope(response);
        if (!Array.isArray(response.result) || response.result.length > 100 ||
            response.count !== undefined && response.count !== response.result.length ||
            new Set(response.result.map(value => value?.code)).size !== response.result.length) this.fail();
        const redemptions = [];
        for (const candidate of response.result) {
            if (candidate?.tenant !== r.tenant || !this.bounded(candidate.code) ||
                candidate.evidence?.merchantRedemption?.merchantCode !== r.enterpriseCode ||
                merchant.store && candidate.evidence.merchantRedemption.storeRef?.code !== merchant.store.code) this.fail();
            const context = { ...r, code: candidate.code }, item = await owner.entitlement(context, false);
            const current = await owner.withStore(context, await owner.merchant(context, item));
            if (!owner.scoped(context, current) || current.enterpriseCode !== r.enterpriseCode ||
                item.evidence?.merchantRedemption?.merchantCode !== r.enterpriseCode) this.fail();
            redemptions.push(owner.summary(item, current));
        }
        return { redemptions };
    },
    /** Propagates only an exact in-flight lifecycle command to its canonical Promotion child; copies and arbitrary targets grant nothing. @param {Object} source Private Digital command. @param {Object} target Exact Promotion child. @param {string} operation Fixed lifecycle operation. @returns {Function|undefined} Private cleanup, never owner credentials. */
    forwardLifecycle: function (source, target, operation) {
        const value = lifecycle.get(source);
        if (!value) return undefined;
        if (value.operation !== operation || target.tenant !== source.tenant || target.enterpriseCode !== source.enterpriseCode ||
            target.ownerId !== source.ownerId || !isDeepStrictEqual(target.authData, source.authData) ||
            target.payload?.couponCode !== value.couponCode || target.payload?.targetType !== 'POS' ||
            target.payload?.targetCode !== source.payload?.targetCode || target.idempotencyKey !== source.idempotencyKey) this.fail();
        lifecycle.set(target, { ...value, signature: this.signature(target) });
        return () => lifecycle.delete(target);
    },
    /** Reads only the original issuer campaign for an exact registered merchant lifecycle/validation child. Ordinary requests receive no delegation. @param {Object} r Exact private child. @param {Object} coupon Persisted purchased coupon. @returns {Promise<Object|undefined>} Exact campaign. */
    readPurchasedCampaign: async function (r, coupon) {
        const value = lifecycle.get(r);
        if (!value) return undefined;
        if (!isDeepStrictEqual(this.signature(r), value.signature) || coupon.code !== value.couponCode ||
            coupon.tenant !== value.staff.tenant || coupon.enterpriseCode !== value.vendor || !this.admitted(value.staff)) this.fail();
        const presented = this.recordSnapshot(coupon);
        const auth = await SERVICE.DefaultIdentityGovernanceService?.getSystemAuthData();
        if (auth?.isSystem !== true) this.fail();
        const retained = await this.read('DefaultCouponService', { tenant: value.staff.tenant,
            enterpriseCode: value.vendor, authData: auth },
        { tenant: value.staff.tenant, enterpriseCode: value.vendor, code: value.couponCode });
        if (!retained) this.fail();
        const expected = this.recordSnapshot(retained);
        for (const field of ['protectedToken', 'secureIssuance', 'secureIssuanceCode']) {
            if (Object.hasOwn(presented, field) && !isDeepStrictEqual(presented[field], expected[field])) this.fail();
            delete expected[field]; delete presented[field];
        }
        // Mongo's storage ID is not the domain identity; all projected business fields must still match.
        delete expected._id; delete presented._id;
        if (!isDeepStrictEqual(expected, presented)) this.fail();
        const staff = await SERVICE.DefaultDigitalCommerceMerchantService.staff(value.staff);
        const merchant = await SERVICE.DefaultDigitalCommerceMerchantService.withStore(staff, { enterpriseCode: staff.enterpriseCode });
        if (!SERVICE.DefaultDigitalCommerceMerchantService.scoped(staff, merchant) ||
            !isDeepStrictEqual(await this.binding(value.staff, retained), value.binding)) this.fail();
        const campaign = await SERVICE.DefaultCouponSellerAuthorizationService.campaign(value.staff, retained.promotionCode);
        if (!this.admitted(value.staff) || !isDeepStrictEqual(this.signature(r), value.signature)) this.fail();
        SERVICE.DefaultCouponSellerAuthorizationService.proof({ enterpriseCode: value.vendor }, retained, campaign);
        return campaign;
    },
    /** Resolves an evidence owner's issuer identity only for the original private validation child; unit persistence remains vendor-scoped. @param {Object} r Exact child. @param {Object} coupon Exact purchased unit. @returns {string|undefined} Issuer evidence identity, never authentication. */
    evidenceEnterprise: function (r, coupon) {
        const value = lifecycle.get(r);
        if (!value) return undefined;
        if (value.operation !== 'validate' || !isDeepStrictEqual(this.signature(r), value.signature) ||
            coupon.code !== value.couponCode || coupon.enterpriseCode !== value.vendor || !this.admitted(value.staff)) this.fail();
        return value.staff.enterpriseCode;
    },
    /** Resolves only an exact in-flight original benefit command, rechecking staff, source, receipt and purchase on every receiver call. No public amount/reversal input is accepted. @param {Object} command Opaque owner handoff. @param {string} type Fixed accounting action. @returns {Promise<Object>} Detached original benefit coordinates. */
    resolveBudgetRequest: async function (command, type) {
        const value = budgetCommands.get(command);
        if (!value || type !== 'COMMIT' || !isDeepStrictEqual(command, value.command) || !this.admitted(value.staff)) this.fail();
        const evidence = await this.execute(value.staff, 'budgetEvidence');
        if (!isDeepStrictEqual(evidence, value.evidence) || !isDeepStrictEqual(command, value.command)) this.fail();
        return structuredClone(evidence);
    },
    /** Dispatches fixed exact owner operations after revalidating original staff, outlet, receipt and consent. No arbitrary callback or caller selector is admitted. @param {Object} r Original private staff identity. @param {string} operation Fixed owner operation. @param {Object} args Exact operation data. @param {Object} authorization Private phase-bound Digital command for writes. @returns {Promise<*>} Owner result. */
    execute: async function (r, operation, args = {}, authorization) {
        args = structuredClone(args);
        if (!this.admitted(r)) this.fail();
        if (['update', 'claim', 'persistReceipt', 'redeem'].includes(operation) &&
            SERVICE.DefaultDigitalCommerceMerchantService.resolveDelegatedAction(authorization, r, operation, args) !== true) this.fail();
        return SERVICE.DefaultCouponSecureIssuanceService.privateOperation(r, async () => {
        const entry = admissions.get(r), staff = await SERVICE.DefaultDigitalCommerceMerchantService.staff(r);
        const auth = await SERVICE.DefaultIdentityGovernanceService?.getSystemAuthData();
        if (auth?.isSystem !== true) this.fail();
        const owner = { tenant: r.tenant, enterpriseCode: entry.vendor, authData: structuredClone(auth),
            correlationId: r.correlationId, idempotencyKey: r.idempotencyKey };
        const coupon = await this.read('DefaultCouponService', owner,
            { tenant: r.tenant, enterpriseCode: entry.vendor, code: entry.couponCode });
        if (!coupon || !isDeepStrictEqual(await this.binding(r, coupon), entry.binding)) this.fail();
        const merchant = await SERVICE.DefaultDigitalCommerceMerchantService.withStore(staff, { enterpriseCode: r.enterpriseCode });
        if (!SERVICE.DefaultDigitalCommerceMerchantService.scoped(staff, merchant) || !this.admitted(r)) this.fail();
        const digital = SERVICE.DefaultDigitalCommerceEntitlementService, merchantOwner = SERVICE.DefaultDigitalCommerceMerchantService;
        const rows = await digital.listEntitlements(owner, { providerOwner: 'promotion', providerCode: coupon.code });
        if (!this.admitted(r)) this.fail();
        if (!Array.isArray(rows) || rows.length !== 1) this.fail();
        const item = this.recordSnapshot(rows[0]);
        merchantOwner.assertEntitlement(owner, item);
        if (item.ownerId !== coupon.soldTo || item.productCode !== coupon.productCode || item.orderCode !== coupon.orderCode ||
            !isDeepStrictEqual(item.purchasePolicy, this.recordSnapshot(coupon.purchasePolicy)) ||
            entry.entitlementCode && entry.entitlementCode !== item.code || args.item && !isDeepStrictEqual(args.item, item)) this.fail();
        entry.entitlementCode = item.code;
        const context = { ...owner, ownerId: item.ownerId, code: item.code };
        if (operation === 'coupon') return coupon;
        if (operation === 'entitlement') return item;
        if (operation === 'validate' || operation === 'validateBenefit') {
            const command = { ...context,
            couponCode: coupon.code, productCode: item.productCode, storeCode: merchant.store?.code,
            storeRevision: merchant.store?.revision,
            targetCode: item.evidence?.merchantRedemption?.code || merchantOwner.targetCode(context, item),
            payload: { merchantReceiptReference: r.payload?.merchantReceiptReference } };
            lifecycle.set(command, { staff: r, vendor: entry.vendor, couponCode: coupon.code, binding: entry.binding,
                operation: 'validate', signature: this.signature(command) });
            try {
                if (operation === 'validate') return await SERVICE.DefaultPromotionOperationService.validateMerchantCoupon(command);
                const promotion = SERVICE.DefaultPromotionOperationService, benefit = SERVICE.DefaultPromotionMerchantBenefitService;
                if (!benefit?.validate) this.fail();
                const campaign = promotion.purchasedCampaign(coupon, await this.readPurchasedCampaign(command, coupon));
                return await benefit.validate(command, campaign, coupon);
            }
            finally { lifecycle.delete(command); }
        }
        const marker = item.evidence?.merchantRedemption;
        if (operation === 'update') {
            const patch = args.patch;
            if (Object.keys(patch || {}).join(',') !== 'evidence' || !patch.evidence?.merchantRedemption ||
                !isDeepStrictEqual({ ...patch.evidence, merchantRedemption: undefined }, { ...item.evidence, merchantRedemption: undefined }) ||
                patch.evidence.merchantRedemption.merchantCode !== r.enterpriseCode ||
                patch.evidence.merchantRedemption.confirmedBy !== r.authData.loginId ||
                patch.evidence.merchantRedemption.confirmationKey !== r.idempotencyKey) this.fail();
            const next = patch.evidence.merchantRedemption, target = marker?.code || merchantOwner.targetCode(context, item);
            if (next.code !== target || next.receiptCode !== 'RECEIPT_' + target || next.mode !== 'MERCHANT_SCREEN' ||
                !isDeepStrictEqual(next.enterpriseRef, { moduleName: 'profile', schemaName: 'enterprise', code: r.enterpriseCode }) ||
                next.storeRef?.code !== merchant.store?.code || next.storeRevision !== merchant.store?.revision ||
                next.merchantReceiptReference !== r.payload?.merchantReceiptReference?.trim() ||
                !Number.isFinite(Date.parse(next.confirmedAt)) || Date.parse(next.confirmedAt) > Date.now() ||
                marker?.confirmationKey && !isDeepStrictEqual(next, marker)) this.fail();
            return this.recordSnapshot(await merchantOwner.update(context, item, patch));
        }
        if (!marker || marker.merchantCode !== r.enterpriseCode || marker.confirmationKey !== r.idempotencyKey ||
            marker.storeRef?.code !== merchant.store?.code || marker.storeRevision !== merchant.store?.revision) this.fail();
        if (operation === 'budgetEvidence') {
            if (!merchant.store || !marker.pricedBenefit ||
                item.evidence?.claimTargetCode !== marker.code || item.evidence?.claimTargetType !== 'POS') this.fail();
            const model = merchantOwner.merchantReceiptModel(context, item, marker,
                { ...merchant, code: r.enterpriseCode, mode: marker.mode }, marker.confirmationKey);
            if (!await merchantOwner.readMerchantReceipt(context, model)) this.fail();
            // A redeemed coupon can only replay an existing budget COMMIT; its original receipt remains the benefit authority.
            const benefit = coupon.status === 'REDEEMED' ? marker.pricedBenefit : await this.execute(r, 'validateBenefit');
            if (!benefit || merchantOwner.pricedBinding(benefit, marker.merchantReceiptReference) !== marker.pricedBinding ||
                !this.admitted(r)) this.fail();
            return { request: { tenant: r.tenant, enterpriseCode: r.enterpriseCode, authData: structuredClone(r.authData),
                authorization: r.authorization, ...(r.entCode !== undefined ? { entCode: r.entCode } : {}), storeCode: r.storeCode },
                couponCode: coupon.code, vendorEnterpriseCode: entry.vendor, distributionStoreCode: entry.binding.storeCode,
                storeCode: merchant.store.code, ownerId: item.ownerId, targetCode: marker.code, targetType: 'POS', operationCode: marker.code,
                benefit: { amount: benefit.discountAmount, currency: benefit.currency, sourceReference: benefit.sourceReference } };
        }
        if (operation === 'claim' || operation === 'redeem') {
            if (operation === 'redeem') {
                const model = merchantOwner.merchantReceiptModel(context, item, marker,
                    { ...merchant, code: r.enterpriseCode, mode: marker.mode }, marker.confirmationKey);
                if (!await merchantOwner.readMerchantReceipt(context, model)) this.fail();
                if (marker.pricedBenefit && marker.pricedBenefit.benefitType !== 'ITEM') {
                    const evidence = await this.execute(r, 'budgetEvidence'), command = { operationCode: marker.code };
                    const budget = SERVICE.DefaultPromotionCouponBudgetService;
                    if (!budget?.consume) this.fail();
                    budgetCommands.set(command, { staff: r, command: structuredClone(command), evidence });
                    try { await budget.consume(command); }
                    finally { budgetCommands.delete(command); }
                }
            }
            const command = { ...context, payload: {
                entitlementCode: item.code, targetCode: marker.code, targetType: 'POS',
                ...(operation === 'redeem' ? { fulfillmentStatus: 'COMPLETED' } : {}) } };
            lifecycle.set(command, { staff: r, vendor: entry.vendor, couponCode: coupon.code, binding: entry.binding,
                operation, signature: this.signature(command) });
            try { return this.recordSnapshot(await digital[operation](command)); }
            finally { lifecycle.delete(command); }
        }
        if (operation === 'readReceipt' || operation === 'persistReceipt') {
            const model = merchantOwner.merchantReceiptModel(context, item, marker,
                { ...merchant, code: r.enterpriseCode, mode: marker.mode }, marker.confirmationKey);
            if (!isDeepStrictEqual(args.model, model)) this.fail();
            return merchantOwner[operation === 'readReceipt' ? 'readMerchantReceipt' : 'persistMerchantReceipt'](context, model);
        }
        this.fail();
        });
    },
};
