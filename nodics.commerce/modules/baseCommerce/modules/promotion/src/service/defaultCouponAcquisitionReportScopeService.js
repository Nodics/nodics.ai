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
/** @module promotion/service/defaultCouponAcquisitionReportScopeService @description Resolves report dimensions from signed Enterprise authority, explicit Profile grants and canonical Store records. @layer service @owner promotion */
module.exports = {
    /** Keeps authorization failures indistinguishable from unavailable report evidence. */
    fail: function () { throw new CLASSES.NodicsError('ERR_PROMOTION_COUPON_REPORT_UNCONFIRMED'); },
    /** Resolves only the exact requested report dimension; caller-selected codes never create membership. */
    resolve: async function (request, scope) {
        const original = structuredClone({ tenant: request?.tenant, authData: request?.authData,
            payload: request?.payload, scope });
        const tenant = request?.authData?.tenant ?? request?.authData?.tenantCode;
        const enterpriseCode = request?.authData?.entCode ?? request?.authData?.enterpriseCode;
        const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value);
        const unchanged = () => isDeepStrictEqual(original, { tenant: request?.tenant, authData: request?.authData,
            payload: request?.payload, scope });
        const boundedCodes = codes => {
            const maximum = CONFIG.get('promotion')?.acquisitionReportQuery?.maximumScopeMembers;
            if (!Array.isArray(codes) || !Number.isSafeInteger(maximum) || maximum < 1 || codes.length > maximum ||
                codes.some(code => !identifier(code)) || new Set(codes).size !== codes.length) this.fail();
            return codes;
        };
        if (!request?.authData || !scope || !['ENTERPRISE', 'GROUP', 'OUTLET'].includes(scope.type) ||
            !identifier(scope.code) || !identifier(tenant) || request.tenant !== tenant || !identifier(enterpriseCode) ||
            request.authData.isSystem === true) this.fail();

        if (scope.type === 'ENTERPRISE') {
            if (scope.code !== enterpriseCode) this.fail();
            return { basis: 'SIGNED_ENTERPRISE', enterpriseCodes: [enterpriseCode] };
        }

        if (request.authData.principalType !== 'human' || request.authData.tokenType !== 'access' ||
            !SERVICE.DefaultEnterpriseAdministrationConsentService?.visibleEnterpriseCodes) this.fail();
        let authorized;
        try { authorized = boundedCodes(await SERVICE.DefaultEnterpriseAdministrationConsentService.visibleEnterpriseCodes(request)); }
        catch (_) { this.fail(); }
        if (!unchanged() || !authorized.includes(enterpriseCode)) this.fail();

        if (scope.type === 'GROUP') {
            if (scope.code !== enterpriseCode) this.fail();
            return { basis: 'PROFILE_AUTHORIZED_ENTERPRISES', enterpriseCodes: authorized };
        }

        const storeService = SERVICE.DefaultStoreService;
        if (!storeService?.get) this.fail();
        let response;
        try {
            response = await storeService.get({ tenant, authData: structuredClone(request.authData),
                query: { tenant, code: scope.code, status: 'ACTIVE' },
                options: { recursive: false, skipItemCache: true },
                searchOptions: { pageSize: 2, pageNumber: 1 } });
        } catch (_) { this.fail(); }
        if (!unchanged() || !response || typeof response.code !== 'string' || !/^SUC_/.test(response.code) ||
            response.success === false || response.acknowledged === false || response.error ||
            response.errors && (!Array.isArray(response.errors) || response.errors.length) ||
            response.count !== 1 || !Array.isArray(response.result) || response.result.length !== 1) this.fail();
        const store = response.result[0], ref = store.enterpriseRef;
        const storeEnterprise = typeof ref === 'string' ? ref : ref?.code;
        if (store?.code !== scope.code || store.tenant !== tenant || store.status !== 'ACTIVE' ||
            !Number.isSafeInteger(store.revision) || store.revision < 1 ||
            store.active === false || !identifier(storeEnterprise) || !authorized.includes(storeEnterprise) ||
            ref && typeof ref === 'object' && ((ref.moduleName || ref.module || 'profile') !== 'profile' ||
                (ref.schemaName || ref.schema || 'enterprise') !== 'enterprise')) this.fail();
        return { basis: 'CANONICAL_OUTLET', enterpriseCodes: [storeEnterprise] };
    },
};
