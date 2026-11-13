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
    /** Imports explicitly bound deployment assignments without restoring revoked or narrowed authority. */
    ensureDeploymentAll: async function (service, request) {
        const fail = () => { throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Explicit deployment assignment import is invalid'); };
        if (service !== SERVICE.DefaultPrincipalScopeAssignmentService || !request?.authData ||
            !Array.isArray(request.models) || !request.models.length || request.models.length > 1000) fail();
        await SERVICE.DefaultIdentityCatalogueGovernanceService.authorizeSeed(request, service);
        const models = structuredClone(request.models), codes = new Set(), placements = new Set();
        const read = async model => {
            const inspect = async query => {
                const rows = await SERVICE.DefaultPrincipalSecurityStampGovernanceService.inventory(
                    service, request.tenant, query,
                );
                if (!Array.isArray(rows) || rows.length > 1) fail();
                return rows[0];
            };
            const original = await inspect({ code: model.code }) || await inspect({
                    principalType: 'service', principalCode: model.principalCode,
                    scopeType: 'RUNTIME_DEPLOYMENT', tenantCode: model.tenantCode, enterpriseCode: model.enterpriseCode,
                    ...Object.fromEntries(['projectCode', 'environmentCode', 'serverCode', 'instanceCode'].map(key =>
                        ['runtimeScope.' + key, model.runtimeScope[key]])),
            });
            if (original && (!original._id || ['code', 'principalType', 'principalCode', 'scopeType', 'scopeCode',
                'tenantCode', 'enterpriseCode', 'inheritanceMode'].some(key => original[key] !== model[key]) ||
                ['projectCode', 'environmentCode', 'serverCode', 'instanceCode'].some(key => original.runtimeScope?.[key] !== model.runtimeScope[key]))) fail();
            return original;
        };
        for (const model of models) {
            if (!model || Object.getPrototypeOf(model) !== Object.prototype || model._id ||
                Object.keys(model).some(key => key.startsWith('$') || key.includes('.')) ||
                model.scopeType !== 'RUNTIME_DEPLOYMENT' || model.scopeCode !== model.code ||
                model.tenantCode !== request.tenant || model.status !== 'ACTIVE' || model.active !== true ||
                model.effect !== 'ALLOW' || codes.has(model.code)) fail();
            this.assertCode(model.code, 'assignment code');
            this.validateAssignment(model);
            const placement = JSON.stringify([model.tenantCode, model.enterpriseCode, model.principalCode,
                ...['projectCode', 'environmentCode', 'serverCode', 'instanceCode'].map(key => model.runtimeScope[key])]);
            if (placements.has(placement)) fail();
            placements.add(placement); codes.add(model.code);
        }
        const originals = [];
        for (const model of models) originals.push(await read(model));
        for (let index = 0; index < models.length; index++) {
            if (!originals[index]) await SERVICE.DefaultIdentityCatalogueService.requirePermissions(models[index].runtimeScope.permissions);
        }
        for (let index = 0; index < models.length; index++) {
            if (originals[index]) continue;
            await SERVICE.DefaultIdentityCatalogueGovernanceService.authorizeSeed(request, service);
            const saved = await service.save({ tenant: request.tenant, authData: request.authData,
                model: structuredClone(models[index]), options: { insertOnly: true } });
            if (!/^SUC_/.test(saved?.code || '') ||
                saved.success !== undefined && saved.success !== true ||
                saved.acknowledged !== undefined && saved.acknowledged !== true ||
                saved.result?.acknowledged !== undefined && saved.result.acknowledged !== true || saved.error ||
                saved.errors && (!Array.isArray(saved.errors) || saved.errors.length) || !await read(models[index])) fail();
        }
        return { result: models.map(model => ({ code: model.code })) };
    },
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

    /** Resolves one installation-owned topology entry. Runtime declarations can only request a subset. */
    deployment: function (claims, modules) {
        const placements = SERVICE.DefaultDeploymentModuleOwnershipService.runtimePlacements();
        if (!Array.isArray(placements) || !placements.length || placements.length > 512) this.deny();
        const matches = placements.filter(item => ['projectCode', 'environmentCode', 'serverCode', 'instanceCode'].every(key => claims[key] && item[key] === claims[key]));
        if (matches.length !== 1 || !Array.isArray(matches[0].modules) ||
            modules.some(name => !matches[0].modules.includes(name))) this.deny();
        return matches[0];
    },

    /** Refuses invalid installation proof or deployment identity without reflecting credentials. */
    deny: function () { throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Shared runtime identity or deployment scope is invalid'); },

    /** Issues only for an authenticated native service Employee in its own tenant and enterprise. */
    authorize: async function (request) {
        const auth = request.authData || {}, principal = auth.person || {};
        const detail = CONFIG.get('defaultAuthDetail', request.tenant) || {};
        const policy = CONFIG.get('authSecurity')?.internalToken;
        if (!policy?.routePermission || !policy.moduleNamePattern) this.deny();
        if (auth.tokenType || auth.isSystem || auth.sessionContext || auth.runtimeScope ||
            principal.principalType !== 'service' || principal.loginId !== 'apiAdmin' || principal.code !== 'apiAdmin' ||
            principal.active !== true || principal.disabled === true || principal.apiKeyStatus !== 'active' ||
            (principal.enterpriseCode && principal.enterpriseCode !== auth.entCode) ||
            !request.tenant || auth.tenant !== request.tenant || !detail.entCode || auth.entCode !== detail.entCode ||
            !Array.isArray(principal.apiKeyScopes) || !principal.apiKeyScopes.includes(policy.routePermission)) this.deny();
        const headers = request.headers || request.httpRequest?.headers || {};
        const claims = { projectCode: headers['x-nodics-project'], environmentCode: headers['x-nodics-environment'],
            serverCode: headers['x-nodics-server'], instanceCode: headers['x-nodics-runtime-instance'] };
        for (const [key, value] of Object.entries(claims)) this.assertCode(value, key);
        const limit = policy.maxDeclaredModules;
        const moduleNamePattern = new RegExp(policy.moduleNamePattern);
        const modules = typeof headers['x-nodics-modules'] === 'string' ? headers['x-nodics-modules'].split(',').map(name => name.trim()) : [];
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 512 || !modules.length || modules.length > limit ||
            new Set(modules).size !== modules.length || modules.some(name => !moduleNamePattern.test(name))) this.deny();
        this.deployment(claims, modules);
        const permissions = auth.permissions;
        if (!Array.isArray(permissions) || !permissions.includes(policy.routePermission) ||
            permissions.some(value => typeof value !== 'string' || !/^[A-Za-z][A-Za-z0-9_.:-]{0,191}$/.test(value))) this.deny();
        const lifetime = policy.maximumLifetimeSeconds;
        if (!Number.isSafeInteger(lifetime) || lifetime < 30 || lifetime > 900) this.deny();
        const expiresIn = principal.apiKeyExpiresAt == null ? lifetime :
            Math.floor((new Date(principal.apiKeyExpiresAt).getTime() - Date.now()) / 1000);
        if (!Number.isSafeInteger(expiresIn) || expiresIn < 1) this.deny();
        return { tenant: request.tenant, entCode: auth.entCode, serviceId: principal.loginId,
            principalType: 'service', runtimeInstanceId: claims.instanceCode, runtimeScope: { ...claims, assignmentCode: this.assertCode(
                SERVICE.DefaultMandatoryIdentityBootstrapService.runtimeDeploymentGrantCode(claims.environmentCode, claims.serverCode), 'placement code') },
            modules, permissions: [...new Set(permissions)], userGroups: [],
            authVersion: principal.authVersion, tokenLife: Math.min(expiresIn, lifetime) };
    },
};
