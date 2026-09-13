/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/identity/DefaultRuntimeAuthorizationService
 * @description Binds authenticated service instances to Profile-owned deployment scope assignments before runtime credential issuance or renewal.
 * @layer service
 * @owner profile
 * @override Identity providers may supply authenticated service principals; deployment grants remain governed Profile assignments and cannot be inferred from caller declarations.
 */
module.exports = {
    /** Rejects malformed or unbounded identifiers without reflecting credential values. */
    assertCode: function (value, label) {
        if (typeof value !== 'string' || !/^[A-Za-z][A-Za-z0-9_.:-]{0,191}$/.test(value)) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Invalid runtime authorization ' + label);
        }
        return value;
    },

    /** Validates a direct deployment assignment at the existing Profile governance boundary. */
    validateAssignment: function (assignment) {
        if (assignment.scopeType !== 'RUNTIME_DEPLOYMENT') return assignment;
        if (assignment.principalType !== 'service' || assignment.inheritanceMode !== 'DIRECT' || assignment.groupCode ||
            !assignment.principalCode || !assignment.tenantCode || !assignment.enterpriseCode) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime authorization requires a direct service principal, tenant and enterprise');
        }
        const scope = assignment.runtimeScope;
        if (!scope || typeof scope !== 'object' || Array.isArray(scope) ||
            Object.keys(scope).some(key => !['projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'modules', 'permissions'].includes(key))) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime deployment scope is required');
        }
        for (const key of ['projectCode', 'environmentCode', 'serverCode', 'instanceCode']) this.assertCode(scope[key], key);
        for (const key of ['modules', 'permissions']) {
            const values = scope[key];
            if (!Array.isArray(values) || !values.length || values.length > 512 || new Set(values).size !== values.length) {
                throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime authorization requires bounded unique ' + key);
            }
            for (const value of values) this.assertCode(value, key);
        }
        for (const key of ['effectiveFrom', 'effectiveTo']) {
            if (assignment[key] !== undefined && assignment[key] !== null && !Number.isFinite(new Date(assignment[key]).getTime())) {
                throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime authorization effective date is invalid');
            }
        }
        return assignment;
    },

    /** Resolves one current explicit deployment grant; request headers express a request, never entitlement. */
    authorize: async function (request) {
        const auth = request.authData || {}, principal = auth.person || {};
        const principalCode = principal.loginId || auth.serviceId;
        if ((principal.principalType || auth.principalType) !== 'service' || !principalCode ||
            auth.tenant !== request.tenant || !auth.entCode || principal.active === false || principal.disabled === true) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime credentials require an authenticated service principal in the requested tenant');
        }
        const headers = request.headers || request.httpRequest && request.httpRequest.headers || {};
        const claims = {
            projectCode: headers['x-nodics-project'], environmentCode: headers['x-nodics-environment'],
            serverCode: headers['x-nodics-server'], instanceCode: headers['x-nodics-runtime-instance']
        };
        for (const [key, value] of Object.entries(claims)) this.assertCode(value, key);
        const modules = typeof headers['x-nodics-modules'] === 'string' ? headers['x-nodics-modules'].split(',').map(value => value.trim()).filter(Boolean) : [];
        const declaredLimit = Number(((CONFIG.get('authSecurity') || {}).internalToken || {}).maxDeclaredModules || 512);
        if (!Number.isSafeInteger(declaredLimit) || declaredLimit < 1 || declaredLimit > 512 || !modules.length || modules.length > declaredLimit || new Set(modules).size !== modules.length) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Invalid module identity declaration');
        }
        for (const module of modules) {
            if (!/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(module)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Invalid module identity declaration');
        }
        const owner = SERVICE.DefaultPrincipalScopeAssignmentService;
        if (!owner || typeof owner.get !== 'function') throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime authorization authority is unavailable');
        const result = await owner.get({ tenant: request.tenant,
            authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
            query: { principalType: 'service', principalCode, scopeType: 'RUNTIME_DEPLOYMENT', tenantCode: request.tenant, enterpriseCode: auth.entCode },
            options: { recursive: false, limit: 513 } });
        if (!result || result.success === false || !/^SUC_/.test(result.code || '') ||
            (result.errors && result.errors.length) || !Array.isArray(result.result) || result.result.length > 512) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime authorization authority returned an invalid result');
        }
        const now = Date.now();
        const assignments = result.result.filter(item => item.principalType === 'service' && item.principalCode === principalCode &&
            item.scopeType === 'RUNTIME_DEPLOYMENT' && item.tenantCode === request.tenant && item.enterpriseCode === auth.entCode);
        for (const assignment of assignments) this.validateAssignment(assignment);
        const activeInstances = assignments.filter(item => item.status === 'ACTIVE' && item.effect === 'ALLOW')
            .map(item => item.runtimeScope.instanceCode);
        if (new Set(activeInstances).size > 1) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Each runtime instance requires a distinct service principal');
        const effective = assignments.filter(item => item.status === 'ACTIVE' &&
            (!item.effectiveFrom || new Date(item.effectiveFrom).getTime() <= now) &&
            (!item.effectiveTo || now < new Date(item.effectiveTo).getTime()) &&
            Object.entries(claims).every(([key, value]) => item.runtimeScope[key] === value));
        if (effective.some(item => item.effect === 'DENY') || effective.length !== 1 || effective[0].effect !== 'ALLOW') {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'No unique approved runtime deployment grant');
        }
        const assignment = effective[0], scope = assignment.runtimeScope;
        if (modules.some(module => !scope.modules.includes(module))) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Requested modules exceed approved runtime deployment scope');
        const principalPermissions = auth.permissions || principal.userGroupPermissions || [];
        if (!Array.isArray(principalPermissions) || scope.permissions.some(permission => !principalPermissions.includes('*') && !principalPermissions.includes(permission))) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime deployment permissions exceed the authenticated principal scope');
        }
        const policy = (CONFIG.get('authSecurity') || {}).internalToken || {};
        const lifetime = Number(policy.maximumLifetimeSeconds || 300);
        if (!Number.isSafeInteger(lifetime) || lifetime < 30 || lifetime > 900) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime credential lifetime must be bounded');
        const remaining = assignment.effectiveTo ? Math.floor((new Date(assignment.effectiveTo).getTime() - now) / 1000) : lifetime;
        if (remaining < 1) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime deployment grant is expired');
        return { tenant: request.tenant, entCode: auth.entCode, serviceId: principalCode,
            principalType: 'service', runtimeInstanceId: claims.instanceCode,
            runtimeScope: { ...claims, assignmentCode: this.assertCode(assignment.code, 'assignment code') },
            modules, permissions: scope.permissions.slice(), userGroups: [],
            authVersion: auth.authVersion || principal.authVersion || 1, tokenLife: Math.min(lifetime, remaining) };
    }
};
