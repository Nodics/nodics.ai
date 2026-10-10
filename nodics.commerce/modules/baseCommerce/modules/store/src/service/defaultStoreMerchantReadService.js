/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const { isDeepStrictEqual } = require('node:util');
const contexts = new WeakMap(), reads = new WeakMap();
/** @module store/service/defaultStoreMerchantReadService @description Reads only exact Profile-authorized merchant outlets through generated Store access and private read protection. @layer service @owner store @override Preserve original staff authority, exact selectors, deny precedence and short-lived admission. */
module.exports = {
    /** Refuses without returning Store or Profile diagnostics. */
    fail: function () { throw new CLASSES.NodicsError('ERR_AUTH_00003'); },
    /** Uses the canonical merchant staff owner; supplied scope arrays are never authority. */
    staff: async function (request) {
        const policy = CONFIG.get('digitalCore')?.merchantRedemption?.storeScope;
        const owner = SERVICE.DefaultDigitalCommerceMerchantService;
        if (policy?.enabled !== true || policy.qualified !== true || !owner?.staff || !owner.scoped) this.fail();
        return owner.staff(request);
    },
    /** Derives a bounded exact Store set before any Store query. Broader ALLOW scopes cannot enumerate outlets. */
    codes: function (r) {
        const codes = new Set();
        for (const scope of r.scopes.scopes) {
            if (scope.scopeType !== 'STORE') continue;
            if (!/^[A-Za-z0-9_.:-]{1,128}$/.test(scope.scopeCode) || scope.scopeCode === '*') this.fail();
            if (SERVICE.DefaultDigitalCommerceMerchantService.scoped(r, {
                enterpriseCode: scope.enterpriseCode || r.enterpriseCode, store: { code: scope.scopeCode }
            })) codes.add(scope.scopeCode);
        }
        if (codes.size > 100) this.fail();
        return [...codes].sort();
    },
    /** Keeps canonical authorization local to this invocation, including later-layer helper calls. */
    withContext: async function (request, action) {
        const r = await this.staff(request);
        contexts.set(r, structuredClone({ tenant: r.tenant, authData: r.authData, scopes: r.scopes,
            authorization: r.authorization, enterpriseCode: r.enterpriseCode }));
        try { return await action(r); } finally { contexts.delete(r); }
    },
    /** Checks exact live owner context, not a copied Profile result. */
    assertContext: function (r) {
        if (!contexts.has(r) || !isDeepStrictEqual(contexts.get(r), {
            tenant: r.tenant, authData: r.authData, scopes: r.scopes,
            authorization: r.authorization, enterpriseCode: r.enterpriseCode
        })) this.fail();
    },
    /** Reads only direct current Store grants, never the tenant's entire Store collection. */
    list: function (request) {
        return this.withContext(request, async r => {
            const rows = [];
            for (const code of this.codes(r)) {
                const row = await this.readSelected(r, code);
                if (row) rows.push({ code: row.code, name: row.name, revision: row.revision });
            }
            return rows;
        });
    },
    /** Resolves one explicit outlet with the same grant requirement as workspace listing. */
    read: function (request, code) {
        return this.withContext(request, r => this.readSelected(r, code));
    },
    /** Dispatches generated reads with original staff auth and an exact short-lived private selector. */
    readSelected: async function (r, code) {
        this.assertContext(r);
        if (!this.codes(r).includes(code) || !SERVICE.DefaultStoreService?.get) this.fail();
        const request = { tenant: r.tenant, authData: structuredClone(r.authData),
            query: { tenant: r.tenant, code, status: 'ACTIVE' },
            options: { recursive: false, skipItemCache: true },
            searchOptions: { pageSize: 2, pageNumber: 1 } };
        reads.set(request, { context: r, tenant: r.tenant, code, authData: structuredClone(r.authData) });
        try {
            const result = await SERVICE.DefaultStoreService.get(request);
            if (!result || typeof result.code !== 'string' || !/^SUC_/.test(result.code) ||
                result.success === false || result.acknowledged === false || result.error ||
                result.errors && (!Array.isArray(result.errors) || result.errors.length) ||
                !Array.isArray(result.result) || result.result.length > 1 || result.count !== result.result.length) this.fail();
            // Require the actual generated result hook, not a callable service label alone.
            if (reads.get(request)?.projected !== true) this.fail();
            return result.result[0];
        } finally { reads.delete(request); }
    },
    /** Preserves ordinary effective schema grants without elevating merchant-only requests. */
    ordinaryRead: function (request, model) {
        const groups = { ...model.rawSchema.accessGroups };
        delete groups.commerceMerchantUserGroup;
        if (!Object.keys(groups).length) return false;
        return SERVICE.DefaultSchemaAccessHandlerService.getAccessPoint(request.authData, groups) >=
            CONFIG.get('accessPoints').readAccessPoint;
    },
    /** Guards before generated cache, count or query execution. Public flags/copies grant nothing. */
    providerRead: function (request, model) {
        if (model?.moduleName !== 'store' || model.schemaName !== 'store') this.fail();
        const grant = reads.get(request);
        if (!grant) {
            if (!this.ordinaryRead(request, model)) this.fail();
            return true;
        }
        this.assertContext(grant.context);
        if (request.tenant !== grant.tenant || !isDeepStrictEqual(request.authData, grant.authData) ||
            !isDeepStrictEqual(request.query, { tenant: grant.tenant, code: grant.code, status: 'ACTIVE' }) ||
            request.options?.recursive !== false || request.options.skipItemCache !== true ||
            request.searchOptions?.pageSize !== 2 || request.searchOptions.pageNumber !== 1) this.fail();
        return true;
    },
    /** Projects the admitted raw provider and coded generated envelopes with fresh Profile authority before either can escape. */
    providerResult: async function (request, response, model) {
        this.providerRead(request, model);
        const grant = reads.get(request);
        if (!grant) return true;
        const result = response?.success;
        if (!result || typeof result !== 'object' || Array.isArray(result)) this.fail();
        // Mongo projects its raw envelope before the generated initializer adds the success code.
        const early = !('code' in result) && grant.projected !== true && request.schemaModel === model &&
            result.query === request.query && result.options === request.searchOptions;
        if ((!early && (typeof result.code !== 'string' || !/^SUC_/.test(result.code))) ||
            result.success === false || result.acknowledged === false || result.error ||
            result.errors && (!Array.isArray(result.errors) || result.errors.length) ||
            !Array.isArray(result.result) || result.result.length > 1 || result.count !== result.result.length) this.fail();
        const fresh = await this.staff(grant.context);
        result.result = result.result.map(row => {
            const ref = row?.enterpriseRef, enterpriseCode = typeof ref === 'string' ? ref : ref?.code;
            if (row?.code !== grant.code || row.tenant !== grant.tenant || row.status !== 'ACTIVE' ||
                row.active === false || !Number.isSafeInteger(row.revision) || row.revision < 1 ||
                typeof row.name !== 'string' || !row.name || row.name.length > 256 ||
                !/^[A-Za-z0-9_.:-]{1,128}$/.test(enterpriseCode || '') ||
                typeof ref === 'object' && ((ref.moduleName || ref.module || 'profile') !== 'profile' ||
                    (ref.schemaName || ref.schema || 'enterprise') !== 'enterprise') ||
                !SERVICE.DefaultDigitalCommerceMerchantService.scoped(fresh, { enterpriseCode, store: { code: row.code } })) this.fail();
            return { code: row.code, tenant: row.tenant, name: row.name, status: row.status,
                revision: row.revision, enterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: enterpriseCode } };
        });
        grant.projected = true;
        return true;
    }
};
