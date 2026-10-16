/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module store/service/defaultStorePlacementService @description Projects exact operational Store placement for a privately admitted signed deployment without granting generic persistence authority. @layer service @owner store @override Preserve exact deployment bindings, private admission and generated read protection. */
const { isDeepStrictEqual: equal } = require('node:util');
const operations = new WeakSet(), reads = new WeakMap(), localIdentities = new WeakSet();
const callerKeys = ['tenant', 'principalEnterpriseCode', 'serviceId', 'projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode'];
module.exports = {
    /** Validates a bounded literal identity; later layers may tighten but never accept wildcards. */
    isIdentifier: function (value) {
        return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value);
    },
    /** Reads one fixed tenant/Store twice under an exact in-flight deployment admission; never resolves a fallback Store. */
    placement: async function (request) {
        const identifier = value => this.isIdentifier(value);
        if (operations.has(request)) throw new Error('Store placement operation is already admitted');
        const originalAuth = request.authData, originalRouter = request.router;
        const state = () => structuredClone({ auth: request.authData, tenant: request.tenant, tenantCode: request.tenantCode,
            enterpriseCode: request.enterpriseCode, entCode: request.entCode, payload: request.payload, query: request.query,
            body: request.httpRequest?.body, headers: Object.fromEntries(['tenant', 'x-tenant-code', 'X-Tenant-Code', 'entCode',
                'x-enterprise-code', 'X-Enterprise-Code'].map(key => [key, request.httpRequest?.headers?.[key]])),
            policy: CONFIG.get('store')?.placementRead, role: CONFIG.get('runtimeRole') });
        const initial = state(), input = structuredClone(request.payload || {});
        if (Object.keys(input).sort().join(',') !== 'contractVersion,storeCode' || input.contractVersion !== 1 || !identifier(input.storeCode))
            throw new Error('Exact Store placement selectors are required');
        const check = () => {
            const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'store');
            const policy = CONFIG.get('store')?.placementRead, role = CONFIG.get('runtimeRole');
            if (auth !== originalAuth || request.router !== originalRouter || !equal(state(), initial) ||
                auth.principalType !== 'service' || auth.isSystem || !auth.permissions?.includes('commerce.store.read') ||
                SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !== true ||
                !identifier(auth.tenant) || !identifier(auth.entCode) || request.tenant !== auth.tenant ||
                [auth.tenantCode, request.tenantCode, request.httpRequest?.headers?.tenant,
                    request.httpRequest?.headers?.['x-tenant-code'], request.httpRequest?.headers?.['X-Tenant-Code']]
                    .some(value => value !== undefined && value !== auth.tenant) ||
                [auth.enterpriseCode, request.entCode, request.enterpriseCode, request.httpRequest?.headers?.entCode,
                    request.httpRequest?.headers?.['x-enterprise-code'], request.httpRequest?.headers?.['X-Enterprise-Code']]
                    .some(value => value !== undefined && value !== auth.entCode) ||
                policy?.enabled !== true || !identifier(policy.runtimeRole) || role?.code !== policy.runtimeRole || role.publication !== 'OPERATIONAL' ||
                !Array.isArray(policy.callers) || !policy.callers.length || policy.callers.length > 100)
                throw new Error('Original qualified Store placement caller is required');
            for (const caller of policy.callers) {
                if (!caller || Object.keys(caller).sort().join(',') !== [...callerKeys, 'placements'].sort().join(',') ||
                    callerKeys.some(key => !identifier(caller[key])) || !Array.isArray(caller.placements) ||
                    !caller.placements.length || caller.placements.length > 100 || caller.placements.some(pair => !pair ||
                        Object.keys(pair).sort().join(',') !== 'enterpriseCode,storeCode' || !identifier(pair.storeCode) || !identifier(pair.enterpriseCode)))
                    throw new Error('Exact Store deployment placement binding is required');
            }
            const callers = policy.callers.filter(caller => caller.tenant === auth.tenant && caller.principalEnterpriseCode === auth.entCode &&
                caller.serviceId === auth.serviceId && caller.instanceCode === auth.runtimeInstanceId &&
                ['projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode'].every(key => caller[key] === auth.runtimeScope?.[key]));
            const pairs = callers.length === 1 ? callers[0].placements.filter(pair => pair.storeCode === input.storeCode) : [];
            if (pairs.length !== 1) throw new Error('Store placement is not bound to this deployment');
            return pairs[0].enterpriseCode;
        };
        const enterpriseCode = check();
        operations.add(request);
        try {
            // Canonical identity exists only for these fixed generated reads; it never replaces the caller or escapes the operation.
            const read = async () => {
                check();
                const authData = structuredClone(SERVICE.DefaultIdentityGovernanceService.getSystemAuthData());
                const context = { tenant: originalAuth.tenant, authData, query: { tenant: originalAuth.tenant, code: input.storeCode, status: 'ACTIVE' },
                    options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 2, limit: 2, pageNumber: 1 } };
                const grant = { check, auth: structuredClone(authData), query: context.query, queryValue: structuredClone(context.query), options: context.options, search: context.searchOptions };
                localIdentities.add(authData); reads.set(context, grant);
                try {
                    const result = await SERVICE.DefaultStoreService.get(context);
                    this.checkPersistenceRead(context); check();
                    return this.project(result, originalAuth.tenant, input.storeCode, enterpriseCode);
                } finally { reads.delete(context); }
            };
            const first = await read(), fresh = await read(); check();
            if (!equal(first, fresh)) throw new Error('Store placement changed during readback');
            return { contractVersion: 1, tenant: originalAuth.tenant, store: first };
        } finally { operations.delete(request); }
    },
    /** Rejects copies, expired contexts and drift before generated provider work; ordinary Store callers are unchanged. */
    checkPersistenceRead: function (request, model) {
        if (!localIdentities.has(request.authData)) return;
        const grant = reads.get(request);
        if (!grant) throw new Error('Private Store placement read admission is required');
        grant.check();
        if (!equal(request.authData, grant.auth) || request.query !== grant.query || request.options !== grant.options ||
            request.searchOptions !== grant.search || request.tenant !== grant.queryValue.tenant ||
            !equal(request.query, grant.queryValue) ||
            request.options.recursive !== false || request.options.skipItemCache !== true ||
            request.searchOptions.pageSize !== 2 || request.searchOptions.limit !== 2 || request.searchOptions.pageNumber !== 1 ||
            model && (model.moduleName !== 'store' || model.schemaName !== 'store' || request.schemaModel !== model))
            throw new Error('Store placement persistence context changed');
    },
    /** Validates the generated success envelope and schema-bound enterprise reference, then returns only public placement fields. */
    project: function (response, tenant, storeCode, enterpriseCode) {
        const row = response?.result?.[0], owner = row?.enterpriseRef;
        const ref = owner && typeof owner === 'object' && !Array.isArray(owner) ? owner : null;
        const enterprise = typeof owner === 'string' ? owner : ref?.code;
        if (typeof response?.code !== 'string' || !/^SUC_/.test(response.code) || response.error || response.success === false || response.acknowledged === false ||
            response.errors && (!Array.isArray(response.errors) || response.errors.length) || !Array.isArray(response.result) ||
            response.result.length !== 1 || response.count !== 1 || [response.total, response.totalCount].some(n => n !== undefined && n !== 1) ||
            row?.tenant !== tenant || row.code !== storeCode || row.active !== true || row.status !== 'ACTIVE' ||
            !Number.isSafeInteger(row.revision) || row.revision < 1 || !this.isIdentifier(enterprise) || enterprise !== enterpriseCode ||
            ['moduleName', 'module'].some(key => ref && Object.hasOwn(ref, key) && ref[key] !== 'profile') ||
            ['schemaName', 'schema'].some(key => ref && Object.hasOwn(ref, key) && ref[key] !== 'enterprise'))
            throw new Error('Exact active Store placement is unavailable');
        return { code: row.code, enterpriseCode: enterprise, revision: row.revision, active: true, status: 'ACTIVE' };
    }
};
