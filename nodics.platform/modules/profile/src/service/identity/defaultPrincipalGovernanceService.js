/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/service/identity/DefaultPrincipalGovernanceService
 * @description Enforces principal categories, active group assignment, and service-only API-key ownership before identity persistence.
 * @layer service
 * @owner profile
 * @override Project modules may add principal categories while preserving least privilege and active-group validation.
 */
module.exports = {
    /** Returns the effective layered principal policy owned by nAuth identity governance. */
    getPrincipalPolicy: function () {
        let governance = CONFIG.get('identityGovernance') || {};
        let policy = governance.principalPolicy;
        if (!policy || !Array.isArray(policy.allowedTypes) || !policy.serviceType ||
            !policy.serviceGroup || !Number.isSafeInteger(policy.minimumServiceApiKeyLength)) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Principal governance policy is incomplete');
        }
        return policy;
    },
    /** Normalizes save and update payloads for governance validation. */
    normalizeModels: function (model) {
        return Array.isArray(model) ? model : [model || {}];
    },
    /** Applies update operators to a persisted principal for effective-state validation. */
    applyUpdate: function (existing, update) {
        if (Object.keys(update || {}).some(key => key.startsWith('$') && !['$set', '$unset'].includes(key)) ||
            [update || {}, update?.$set || {}, update?.$unset || {}].some(values =>
                Object.keys(values).some(key => /^(userGroups|principalType|apiKeyScopes|authenticationIdentity|registrationAssignmentCode|enterpriseCode|identityLinkRetirement)\./.test(key) || key === 'metadata.enterpriseCode')))
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Principal authority requires complete governed field values');
        let effective = Object.assign({}, existing || {});
        Object.keys(update || {}).filter(key => !key.startsWith('$')).forEach(key => { effective[key] = update[key]; });
        Object.assign(effective, update && update.$set || {});
        Object.keys(update && update.$unset || {}).forEach(key => { delete effective[key]; });
        return effective;
    },
    /** Validates fully materialized principal states. */
    validateModels: function (models) {
        let policy = this.getPrincipalPolicy();
        models.forEach(model => {
            if (model.principalType && !policy.allowedTypes.includes(model.principalType)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Invalid principal type: ' + model.principalType);
            if ((model.apiKeyScopes || []).includes('*')) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Service credentials cannot receive Platform full access');
            if (model.principalType === policy.serviceType && !(model.userGroups || []).includes(policy.serviceGroup)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Service principals require configured service group: ' + policy.serviceGroup);
            if (model.principalType !== policy.serviceType && (model.userGroups || []).includes(policy.serviceGroup)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Only service principals may use configured service group: ' + policy.serviceGroup);
            if (model.principalType !== policy.serviceType && (model.apiKey || model.apiKeyHash)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'API keys are restricted to service principals');
            if (model.principalType === policy.serviceType && model.apiKey &&
                (typeof model.apiKey !== 'string' || model.apiKey.length < policy.minimumServiceApiKeyLength)) {
                throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Service API keys must contain at least ' + policy.minimumServiceApiKeyLength + ' characters');
            }
        });
    },
    /** Rejects platform authority on enterprise-scoped, linked, customer or service identities. No mutation. */
    assertPlatformPrincipal: function (model, request) {
        const enterprise = CONFIG.get('defaultEnterprise') || 'default';
        if (request.tenant !== (CONFIG.get('defaultTenant') || 'default') ||
            request.schemaModel?.schemaName !== 'employee' || model.principalType !== 'human' ||
            model.authenticationIdentity || model.identityLinkRetirement || model.registrationAssignmentCode ||
            model.apiKey || model.apiKeyHash ||
            model.metadata !== undefined && (!model.metadata || typeof model.metadata !== 'object' || Array.isArray(model.metadata)) ||
            [model.enterpriseCode, model.metadata?.enterpriseCode].some(code => code !== undefined && code !== enterprise))
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Platform administration requires a native human employee in the Platform authority partition');
    },
    /** Resolves the generated service for partial employee/customer updates. */
    getPrincipalService: function (request) {
        let schemaName = request.schemaModel && request.schemaModel.schemaName;
        if (schemaName === 'employee') return SERVICE.DefaultEmployeeService;
        if (schemaName === 'customer') return SERVICE.DefaultCustomerService;
        return undefined;
    },
    /** Validates a create/upsert-save payload without misclassifying an idempotency query as an update. */
    validateSave: function (request) {
        return this.validate(request, 'save');
    },
    /** Validates a partial update against its required persisted principal. */
    validateUpdate: function (request) {
        return this.validate(request, 'update');
    },
    /** Validates principal type, service groups, credentials, and active group references. */
    validate: function (request, operation) {
        let updates = this.normalizeModels(request.model);
        let effectiveOperation = operation || (request.query ? 'update' : 'save');
        let service = effectiveOperation === 'update' && request.query && this.getPrincipalService(request);
        let load = service ? service.get({ tenant: request.tenant, authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(), query: request.query, options: { recursive: false, skipItemCache: true } }) : Promise.resolve({ result: [] });
        return load.then(async result => {
            let existing = result && result.result || [];
            if (service && existing.length === 0) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Principal update requires an existing record');
            let models = service ? existing.map(principal => this.applyUpdate(principal, updates[0])) : updates.map(update => this.applyUpdate({}, update));
            this.validateModels(models);
            for (const model of models) {
                const groups = model.userGroups || [];
                if (!Array.isArray(groups) || groups.some(code => typeof code !== 'string'))
                    throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Principal groups require persisted group codes');
                if (groups.includes('platformAdministratorUserGroup')) this.assertPlatformPrincipal(model, request);
            }
            const authorityFields = ['userGroups', 'principalType', 'authenticationIdentity', 'identityLinkRetirement',
                'registrationAssignmentCode', 'enterpriseCode', 'metadata', 'apiKey', 'apiKeyHash', 'apiKeyScopes'];
            const changesAuthority = effectiveOperation === 'save' || updates.some(update =>
                [update, update.$set || {}, update.$unset || {}].some(values =>
                    Object.keys(values).some(key => authorityFields.includes(key))));
            if (changesAuthority && models.concat(existing).some(model => (model.userGroups || []).includes('platformAdministratorUserGroup'))) {
                const bootstrap = effectiveOperation === 'save' && request.options?.insertOnly === true &&
                    SERVICE.DefaultDataReleaseService?.isIdentityAuthorityReleaseExecution?.(request.tenant, 'employee', 'ensureBootstrapAll') === true;
                if (!bootstrap) await SERVICE.DefaultIdentityCatalogueGovernanceService.authorize(request);
            }
            let requestedGroups = Array.from(new Set(models.reduce((groups, model) => groups.concat(model.userGroups || []), [])));
            if (requestedGroups.length === 0) return true;
            return SERVICE.DefaultUserGroupService.get({
                tenant: request.tenant,
                authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                options: { recursive: false }, query: { code: { $in: requestedGroups }, active: true }
            }).then(groupResult => {
                let activeGroups = (groupResult && groupResult.result || []).map(group => group.code);
                let missing = requestedGroups.filter(group => !activeGroups.includes(group));
                if (missing.length > 0) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Unknown or inactive user groups: ' + missing.join(', '));
                return true;
            });
        });
    }
};
