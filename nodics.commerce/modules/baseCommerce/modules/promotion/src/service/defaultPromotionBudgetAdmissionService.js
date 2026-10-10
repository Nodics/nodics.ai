/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const writes = new WeakSet();

/**
 * @module promotion/service/defaultPromotionBudgetAdmissionService
 * @description Admits a first-use live budget from pinned activated policy through
 * generated insert-only persistence. Existing counters are never repaired or reset.
 * @layer service
 * @owner promotion
 * @override Later layers may narrow admission via exported members; preserve
 * signed scope, installed uniqueness, private evidence and replay without writes.
 */
module.exports = {
    /** Recognizes only the owner's exact in-flight first-use insert, never copied options or retained requests. @param {Object} request Generated command. @returns {boolean} Private admission identity. */
    isAdmissionWrite: function (request) {
        return writes.has(request);
    },
    /** Builds a bounded owner conflict without disclosing stored records. @returns {Error} Admission failure. */
    conflict: function () {
        return new CLASSES.NodicsError('ERR_PROMOTION_BUDGET_ADMISSION_UNCONFIRMED');
    },
    /** Requires existing Online publication selection and signed management authority. @param {Object} request Operator context. @returns {Object} Trusted scope and actor. */
    context: function (request) {
        const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
        const settings = CONFIG.get('promotion') || {}, enterpriseCode = auth.enterpriseCode || auth.entCode;
        if (settings.publication?.runtimeRole !== 'ONLINE' || settings.publication.delivery?.enabled !== true)
            throw this.conflict();
        if (auth.tokenType !== 'access' || auth.principalType !== 'human' ||
            typeof auth.loginId !== 'string' || !auth.loginId || auth.loginId.length > 192 ||
            auth.loginId.trim() !== auth.loginId || /[\u0000-\u001f\u007f]/.test(auth.loginId) ||
            typeof auth.tenant !== 'string' || !auth.tenant || typeof enterpriseCode !== 'string' || !enterpriseCode ||
            [request.tenant, auth.tenant].some(value => value !== undefined && value !== auth.tenant) ||
            [auth.entCode, auth.enterpriseCode, request.enterpriseCode, request.entCode].some(value =>
                value !== undefined && value !== enterpriseCode) ||
            !security?.isPermissionGranted('commerce.promotion.manage', security.getGrantedPermissions(request), {}))
            throw new CLASSES.NodicsError('ERR_PROMOTION_BUDGET_ADMISSION_FORBIDDEN');
        return { ...request, tenant: auth.tenant, enterpriseCode, actorId: auth.loginId };
    },
    /** Reads bounded fresh rows through a generated owner; failed envelopes never mean empty. @param {Object} service Generated owner. @param {Object} request Context. @param {Object} query Exact selector. @returns {Promise<Array>} Rows. */
    read: async function (service, request, query) {
        if (!service?.get) throw this.conflict();
        const response = await service.get({ tenant: request.tenant,
            authData: SERVICE.DefaultPromotionOperationService.serviceAuthData(request), query,
            options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, limit: 2 } });
        SERVICE.DefaultPromotionOperationService.assertLifecycleEnvelope(response);
        if (!Array.isArray(response.result) || response.result.length > 2) throw this.conflict();
        return response.result;
    },
    /** Checks the actual model and installed unique identity via the database owner, never raw persistence. @param {Object} request Trusted context. @returns {Promise<void>} Evidence or refusal. */
    requireInsertOwner: async function (request) {
        const model = (NODICS.getModels('promotion', request.tenant) || {})[UTILS.createModelName('promotion')];
        if (!model || model.versioned === true || model.primaryKey !== 'code' ||
            model.rawSchema?.definition?.budgetAdmission?.type !== 'object' ||
            typeof model.compareAndSetItem !== 'function' ||
            SERVICE.DefaultModelConcurrencyService.getField(model.rawSchema)) throw this.conflict();
        const interceptors = SERVICE.DefaultDatabaseConfigurationService?.getSchemaInterceptors('promotion');
        for (const [trigger, method] of Object.entries({ preSave: 'protectSave', preUpdate: 'protect', preRemove: 'protectRemoval' })) {
            if (!Array.isArray(interceptors?.[trigger]) || !interceptors[trigger].some(item =>
                item.handler === 'DefaultPromotionBudgetAdmissionService.' + method &&
                (item.active === true || item.active === 'true'))) throw this.conflict();
        }
        const evidence = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
        if (evidence.versioned !== false || !Array.isArray(evidence.indexes) ||
            !evidence.indexes.some(index => index.unique === true && !index.sparse && !index.partialFilterExpression &&
                (!index.collation || index.collation.locale === 'simple') && index.key?.code === 1 &&
                Object.keys(index.key).every(key => key === 'code' || key === 'tenant')))
            throw this.conflict();
    },
    /** Selects exactly one pinned active policy from the configured Store root, without live counters. @param {Object} request Trusted context. @param {Object} input Pack instruction. @returns {Promise<Object>} Detached retained policy. */
    policy: async function (request, input) {
        const publication = SERVICE.DefaultPromotionPublicationService;
        if (!publication.deliveryRoots(request).includes(input.rootCode)) throw this.conflict();
        const records = await publication.readActivated({ rootType: 'promotion', rootCode: input.rootCode }, request);
        const selected = records.filter(item => item.schema === 'promotion' && item.policy.code === request.promotionCode);
        if (selected.length !== 1) throw this.conflict();
        const policy = selected[0].policy, exact = SERVICE.DefaultExactAmountService;
        if (policy.status !== 'ACTIVE' || policy.tenant !== request.tenant || policy.enterpriseCode !== request.enterpriseCode ||
            !policy.budget || typeof policy.budget.limit !== 'string' || Object.keys(policy.budget).some(key => key !== 'limit') ||
            publication.fingerprint(policy) !== input.policyFingerprint || !exact?.normalize || !exact?.compare ||
            !/^\d+(?:\.\d+)?$/.test(policy.budget.limit) || exact.compare(exact.normalize(policy.budget.limit), '0') < 0)
            throw this.conflict();
        return structuredClone(policy);
    },
    /** Verifies original admission identity while preserving current spend/revision on replay. @param {Object} row Current live row. @param {Object} receipt Pinned command. @returns {Object} Safe admission result. */
    replay: function (row, receipt) {
        const publication = SERVICE.DefaultPromotionPublicationService;
        const originalActor = row?.budgetAdmission?.command?.actorId;
        if (!row || row.tenant !== receipt.tenant || row.enterpriseCode !== receipt.enterpriseCode ||
            row.code !== receipt.promotionCode || !row.budgetAdmission?.command ||
            typeof originalActor !== 'string' || !originalActor || originalActor.length > 192 ||
            originalActor.trim() !== originalActor || /[\u0000-\u001f\u007f]/.test(originalActor) ||
            publication.fingerprint(row.budgetAdmission.command) !== publication.fingerprint({ ...receipt, actorId: originalActor }) ||
            typeof row.budget?.spent !== 'string' || !/^\d+(?:\.\d+)?$/.test(row.budget.spent) ||
            !Number.isSafeInteger(row.revision) || row.revision < 0 ||
            row.revision === 0 && SERVICE.DefaultExactAmountService.compare(row.budget.spent, '0') !== 0 ||
            !Number.isFinite(new Date(row.budgetAdmission.admittedAt).getTime())) throw this.conflict();
        return { promotionCode: row.code, commandReference: receipt.commandReference,
            policyFingerprint: receipt.policyFingerprint, openingSpent: '0', currentSpent: row.budget.spent,
            revision: row.revision, admitted: true };
    },
    /** Plans one instruction without mutation, including exact replay and absence of historical use. @param {Object} request Signed context and qualified provenance. @returns {Promise<Object>} Owner-only prepared instruction. */
    prepare: async function (request) {
        const r = this.context(request), input = r.payload || {};
        if (Object.keys(input).sort().join(',') !== 'commandReference,policyFingerprint,rootCode,storeCode' ||
            !['commandReference', 'rootCode', 'storeCode'].every(key => typeof input[key] === 'string' &&
                /^[A-Za-z0-9_.:-]{1,128}$/.test(input[key])) ||
            !/^[a-f0-9]{64}$/.test(input.policyFingerprint || '') ||
            typeof r.promotionCode !== 'string' || !/^[A-Za-z0-9_.:-]{1,128}$/.test(r.promotionCode) ||
            Object.keys(r.query || {}).length || r.storeCode !== undefined && r.storeCode !== input.storeCode)
            throw new CLASSES.NodicsError('ERR_PROMOTION_BUDGET_ADMISSION_INVALID');
        r.storeCode = input.storeCode;
        const policy = await this.policy(r, input);
        await this.requireInsertOwner(r);
        const provenance = r.setupContribution;
        if (!provenance || Object.keys(provenance).sort().join(',') !== 'checksum,moduleName,releaseCode,version' ||
            !Object.values(provenance).every(value => typeof value === 'string' && value) ||
            !/^[a-f0-9]{64}$/.test(provenance.checksum)) throw this.conflict();
        const receipt = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, promotionCode: r.promotionCode,
            actorId: r.actorId, contribution: structuredClone(provenance), ...input };
        const query = { tenant: r.tenant, code: r.promotionCode }, service = SERVICE.DefaultPromotionService;
        const rows = await this.read(service, r, query);
        if (rows.length > 1) throw this.conflict();
        if (rows.length) return { r, policy, receipt, current: this.replay(rows[0], receipt) };
        for (const owner of ['DefaultPromotionBudgetLedgerService', 'DefaultPromotionRedemptionService',
            'DefaultCouponBatchService', 'DefaultCouponService']) {
            if ((await this.read(SERVICE[owner], r, { tenant: r.tenant, promotionCode: r.promotionCode })).length)
                throw this.conflict();
        }
        return { r, policy, receipt };
    },
    /** Admits only a new campaign. One insert atomically retains counter and receipt; retries never upsert or reset. @param {Object} request Signed operator and pinned payload. @returns {Promise<Object>} Verified admission metadata. */
    initialize: async function (request) {
        const { r, policy, receipt, current } = await this.prepare(request);
        if (current) return { ...current, replayed: true };
        const query = { tenant: r.tenant, code: r.promotionCode }, service = SERVICE.DefaultPromotionService;
        // Only policy fields enter the live record; source version and approvals are not operational authority.
        const model = SERVICE.DefaultPromotionOperationService.withSchemaBase({
            code: policy.code, tenant: r.tenant, enterpriseCode: r.enterpriseCode, name: policy.name,
            ...Object.fromEntries(['enterpriseRef', 'issuerEnterpriseRef', 'vendorEnterpriseRef']
                .filter(key => policy[key] !== undefined).map(key => [key, structuredClone(policy[key])])),
            status: policy.status, priority: policy.priority, conditions: policy.conditions, actions: policy.actions,
            validFrom: policy.validFrom ? new Date(policy.validFrom) : undefined,
            validTo: policy.validTo ? new Date(policy.validTo) : undefined,
            budget: { limit: policy.budget.limit, spent: '0' }, revision: 0,
            budgetAdmission: { command: receipt, admittedAt: new Date() },
        }, r);
        const command = { tenant: r.tenant, authData: SERVICE.DefaultPromotionOperationService.serviceAuthData(r),
            query, model, options: { insertOnly: true, recursive: false } };
        writes.add(command);
        let failure;
        try {
            SERVICE.DefaultPromotionOperationService.assertLifecycleEnvelope(await service.save(command));
        } catch (error) {
            failure = error;
        } finally {
            writes.delete(command);
        }
        const saved = await this.read(service, r, query);
        if (saved.length !== 1) throw failure || this.conflict();
        return { ...this.replay(saved[0], receipt), replayed: false };
    },
    /** Protects admission evidence from generic writers and prevents save/upsert resetting admitted counters. @param {Object} request Generated write. @returns {boolean} Admitted non-evidence mutation. */
    protect: function (request) {
        if (writes.has(request)) return true;
        if (/budgetAdmission/.test(JSON.stringify(request.models || request.model || {}))) throw this.conflict();
        if (SERVICE.DefaultCouponSellerAuthorizationService?.isSellerConsentWrite(request)) return true;
        if (!SERVICE.DefaultPromotionOperationService.isStagedPolicyRuntime() &&
            !SERVICE.DefaultPromotionOperationService.isBudgetConsumptionWrite(request))
            request.query = { ...(request.query || {}), budgetAdmission: { $exists: false } };
        return true;
    },
    /** Fences generic save/upsert against an admitted identity, retaining its exact code selector. @param {Object} request Generated save. @returns {boolean} Atomic exclusion applied. */
    protectSave: function (request) {
        this.protect(request);
        if (SERVICE.DefaultPromotionOperationService.isStagedPolicyRuntime()) return true;
        if (!writes.has(request)) {
            if (typeof request.model?.code !== 'string' || !request.model.code) throw this.conflict();
            if (request.query?.code !== undefined && request.query.code !== request.model.code) throw this.conflict();
            request.query = { ...(request.query || {}), code: request.model.code, budgetAdmission: { $exists: false } };
        }
        return true;
    },
    /** Prevents generic removal of the first-use receipt that fences reinitialization. @param {Object} request Generated remove. @returns {boolean} Atomic exclusion applied. */
    protectRemoval: function (request) {
        this.protect(request);
        request.query = { ...(request.query || {}), budgetAdmission: { $exists: false } };
        return true;
    },
};
