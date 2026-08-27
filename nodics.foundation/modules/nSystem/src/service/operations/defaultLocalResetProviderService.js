/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nSystem/service/operations/DefaultLocalResetProviderService
 * @description Executes a bounded, owner-configured Local reset exclusively through generated Nodics services.
 * @layer service
 * @owner nSystem
 */
module.exports = {
    _authority: null,
    /** Executes the documented bounded module operation. */
    init: function () { this._authority = Object.freeze({ capability: 'LOCAL_RESET_PROVIDER' }); return Promise.resolve(true); },
    /** Executes the documented bounded module operation. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the documented bounded module operation. */
    policy: function () { return CONFIG.get('localResetProvider') || {}; },
    /** Executes the documented bounded module operation. */
    environment: function () { return NODICS.getSelectedEnvironmentName ? NODICS.getSelectedEnvironmentName() : NODICS.getEnvironmentName(); },
    /** Executes the documented bounded module operation. */
    validate: function (request) {
        let policy = this.policy();
        let names = [].concat(policy.serviceNames || []);
        let requiredServiceNames = [].concat(policy.requiredServiceNames || []);
        if (policy.enabled !== true || ![].concat(policy.environmentAllowlist || []).includes(this.environment())) {
            throw new CLASSES.NodicsError('ERR_SYS_00120', 'Local reset provider is disabled');
        }
        if (!request.authData || request.authData.tokenType !== 'service') {
            throw new CLASSES.NodicsError('ERR_SYS_00121', 'Local reset provider requires a service token');
        }
        if (request.confirmation !== policy.confirmation || request.resetScope !== 'LOCAL_ACCEPTANCE') {
            throw new CLASSES.NodicsError('ERR_SYS_00122', 'Local reset provider confirmation is invalid');
        }
        if (!names.length || names.length > Number(policy.maximumServices || 128)) {
            throw new CLASSES.NodicsError('ERR_SYS_00123', 'Local reset provider service boundary is invalid');
        }
        return names.map(name => {
            if (!/^Default[A-Z][A-Za-z0-9]{1,127}Service$/.test(name)) {
                throw new CLASSES.NodicsError('ERR_SYS_00124', 'Configured Local reset service is unavailable: ' + name);
            }
            if (!SERVICE[name] || typeof SERVICE[name].remove !== 'function') {
                if (policy.allowMissingModelServices === true && !requiredServiceNames.includes(name)) {
                    return { name: name, service: null, unavailable: true };
                }
                throw new CLASSES.NodicsError('ERR_SYS_00124', 'Configured Local reset service is unavailable: ' + name);
            }
            return { name: name, service: SERVICE[name] };
        });
    },
    /** Executes the documented bounded module operation. */
    authorizes: function (request) { return Boolean(this._authority) && request.localResetAuthority === this._authority; },
    /** Executes the documented bounded module operation. */
    isMissingModelRegistryError: function (error) {
        if (error && (error.localResetMissingModel === true || error.code === 'LOCAL_RESET_MODEL_REGISTRY_MISSING')) {
            return true;
        }
        let stack = String(error && error.stack || '');
        let normalizedStack = stack.toLowerCase();
        let message = String(error && error.message || '');
        return (stack.includes('getModels') &&
            (message.includes("reading 'models'") || message.includes('reading "models"'))) ||
            (normalizedStack.includes('modelsremoveinitializerservice') &&
            (message.includes("reading 'schemaName'") || message.includes('reading "schemaName"')));
    },
    /** Executes the documented bounded module operation. */
    reset: async function (request) {
        let providers = this.validate(request);
        let removed = [];
        let skipped = [];
        for (let provider of providers) {
            if (provider.unavailable === true) {
                skipped.push({ service: provider.name, reason: 'SERVICE_UNAVAILABLE' });
                continue;
            }
            try {
                let response = await provider.service.remove({ tenant: request.tenant, authData: request.authData,
                    correlationId: request.correlationId, query: { _id: { $ne: null } }, options: { recursive: false },
                    localResetAuthority: this._authority });
                removed.push({ service: provider.name, acknowledged: Boolean(response) });
            } catch (error) {
                if (!this.isMissingModelRegistryError(error)) throw error;
                skipped.push({ service: provider.name, reason: 'MODEL_REGISTRY_MISSING' });
            }
        }
        let requiredServiceNames = [].concat(this.policy().requiredServiceNames || []);
        let blockedSkips = this.policy().allowMissingModelServices === true ?
            skipped.filter(item => requiredServiceNames.includes(item.service)) : skipped;
        if (blockedSkips.length > 0) {
            throw new CLASSES.NodicsError('ERR_SYS_00125',
                'Local reset did not clear every configured service: ' + blockedSkips.map(item => item.service).join(', '));
        }
        return { acknowledged: true, serviceCount: removed.length, services: removed.map(item => item.service),
            skippedServiceCount: skipped.length, skippedServices: skipped.map(item => item.service), correlationId: request.correlationId };
    }
};
