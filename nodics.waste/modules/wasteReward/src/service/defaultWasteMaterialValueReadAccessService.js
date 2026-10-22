/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const { isDeepStrictEqual } = require('node:util');
const DEFAULTS = require('../../config/properties').wasteMaterialValue.profile;

/**
 * @module wasteReward/service/defaultWasteMaterialValueReadAccessService
 * @description Consumes Profile identity and scopes for private owner projections, without maintaining identity or grants.
 * @layer service @owner wasteReward
 * @override Preserve original signed credentials, explicit denies and owner binding; configure transport in properties.
 */
module.exports = {
    /**
     * Resolves current owner permission and canonical Profile evidence before any domain record read.
     * @param {Object} request Original trusted request, including tenant, signed principal and operation payload.
     * @returns {Promise<*>} Resolves current owner permission and canonical Profile evidence before any domain record read.
     * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    resolve: async function (request) {
        const domain = SERVICE.DefaultWasteMaterialValueAssessmentService, permission = 'waste.materialValue.read';
        if (request.authData?.principalType === 'service') {
            domain.authorize(request, permission);
            return domain.owner(request.payload?.ownerRef);
        }
        const deny = () => domain.fail('FORBIDDEN', 'Current Profile owner authority is required');
        const auth = structuredClone(request.authData || {}), tenant = request.tenant, authorization = request.authorization;
        const enterpriseCode = auth.enterpriseCode || auth.entCode, security = SERVICE.DefaultSecuredRequestPipelineService;
        const granted = () => security?.isPermissionGranted(permission, security.getGrantedPermissions(request), {});
        if (!tenant || auth.tenant !== tenant || !auth.loginId || auth.tokenType !== 'access' || auth.isSystem ||
            !['customer', 'human'].includes(auth.principalType) || !enterpriseCode ||
            typeof authorization !== 'string' || !/^Bearer \S+$/i.test(authorization) ||
            auth.enterpriseCode && auth.entCode && auth.enterpriseCode !== auth.entCode || !granted()) deny();
        const bound = () => {
            if (!isDeepStrictEqual(request.authData, auth) || request.tenant !== tenant || request.authorization !== authorization ||
                [request.entCode, request.enterpriseCode].some(value => value !== undefined && value !== enterpriseCode) ||
                [request.tenantCode, auth.tenantCode].some(value => value !== undefined && value !== tenant) || !granted()) deny();
        };
        bound();
        const profile = { ...DEFAULTS, ...(CONFIG.get('wasteMaterialValue', tenant) || {}).profile };
        if (typeof profile.connectionName !== 'string' || !profile.connectionName ||
            !profile.targetAuthority || typeof profile.targetAuthority.runtimeRole !== 'string' || !profile.targetAuthority.runtimeRole ||
            !domain.bounded(profile.timeoutMs, domain.settings(request).validation.timeoutMs))
            domain.fail('CONFIGURATION', 'Invalid Profile read transport');
        let value;
        try {
            value = await SERVICE.DefaultModuleService.invokeModule({
                local: false, moduleName: 'profile', connectionName: profile.connectionName, targetAuthority: profile.targetAuthority,
                apiName: auth.principalType === 'customer' ? '/customer/identity' : '/identity/scopes/me', methodName: 'GET',
                tenant, request: { tenant }, header: { Authorization: authorization, 'X-Enterprise-Code': enterpriseCode },
                timeoutMs: profile.timeoutMs, maxAttempts: 1
            });
        } catch (_) { deny(); }
        bound();
        for (let n = 0; n < 8 && value; n++) {
            if (value.error || value.success === false || value.acknowledged === false || /^ERR_/.test(value.code || '') ||
                value.errors && (!Array.isArray(value.errors) || value.errors.length)) deny();
            if (value.data !== undefined) value = value.data;
            else if (value.result !== undefined) value = value.result;
            else break;
        }
        let owner;
        if (auth.principalType === 'customer') {
            if (value?.contractVersion !== 1 || value.tenant !== tenant || value.enterpriseCode !== enterpriseCode ||
                value.customer?.loginId !== auth.loginId || typeof value.customer?.code !== 'string' || !value.customer.code) deny();
            owner = domain.owner({ module: 'profile', schema: 'customer', code: value.customer.code });
        } else {
            if (value?.principalCode !== auth.loginId || !Array.isArray(value.scopes) || !Array.isArray(value.deniedScopes)) deny();
            const matches = scope => {
                if (!scope || typeof scope !== 'object' || Array.isArray(scope)) deny();
                if (scope.tenantCode && scope.tenantCode !== tenant ||
                    scope.capabilityCode && !['waste', 'wasteReward'].includes(scope.capabilityCode) ||
                    scope.permissionCode && !security.isPermissionGranted(permission, [scope.permissionCode], {})) return false;
                return scope.scopeType === 'GLOBAL' && scope.scopeCode === '*' ||
                    scope.scopeType === 'TENANT' && scope.scopeCode === tenant ||
                    scope.scopeType === 'ENTERPRISE' && scope.scopeCode === enterpriseCode;
            };
            if (!value.scopes.some(matches) || value.deniedScopes.some(matches)) deny();
            owner = domain.owner({ module: 'profile', schema: 'enterprise', code: enterpriseCode });
        }
        if (request.payload?.ownerRef !== undefined && !domain.same(domain.owner(request.payload.ownerRef), owner)) deny();
        return owner;
    }
};
