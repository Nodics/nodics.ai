/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/service/operations/DefaultBackofficeLocalResetCoordinatorService
 * @description Coordinates explicit owner-provided Local reset services without database access.
 * @layer service
 * @owner backoffice
 * @override Environments contribute bounded target descriptors; each owner resets only through its generated services.
 */
module.exports = {
    /** Executes the documented bounded module operation. */
    init: function () { return Promise.resolve(true); },
    /** Executes the documented bounded module operation. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the documented bounded module operation. */
    policy: function () { return CONFIG.get('backofficeLocalReset') || {}; },
    /** Executes the documented bounded module operation. */
    principal: function (request) { return request.authData && (request.authData.principalId || request.authData.loginId || request.authData.code); },
    /** Executes the documented bounded module operation. */
    environment: function () { return typeof NODICS !== 'undefined' && (NODICS.getSelectedEnvironmentName ?
        NODICS.getSelectedEnvironmentName() : NODICS.getEnvironmentName && NODICS.getEnvironmentName()); },
    /** Executes the documented bounded module operation. */
    environmentAllowed: function () { return [].concat(this.policy().environmentAllowlist || []).includes(this.environment()); },
    /** Executes the documented bounded module operation. */
    providers: function () {
        let policy = this.policy();
        let providers = [].concat(policy.providers || []);
        if (providers.length > Number(policy.maximumTargets || 16)) throw new CLASSES.NodicsError('ERR_BOF_00090', 'Local reset target boundary exceeded');
        return providers.map(provider => {
            if (!provider || !/^[a-z][A-Za-z0-9]{1,63}$/.test(String(provider.code || '')) ||
                !/^[a-z][A-Za-z0-9]{1,63}$/.test(String(provider.moduleName || '')) ||
                !/^[a-z][A-Za-z0-9]{1,63}$/.test(String(provider.connectionName || ''))) {
                throw new CLASSES.NodicsError('ERR_BOF_00091', 'Local reset provider is unavailable');
            }
            return provider;
        });
    },
    /** Executes the documented bounded module operation. */
    invokeProvider: function (provider, request, input) {
        let token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new CLASSES.NodicsError('ERR_BOF_00097', 'Local reset service authentication is unavailable');
        return SERVICE.DefaultModuleService.invokeModule({ moduleName: provider.moduleName,
            connectionName: provider.connectionName, connectionType: provider.connectionType || 'abstract', methodName: 'POST',
            targetAuthority: provider.targetAuthority,
            apiName: '/operations/local-reset', timeoutMs: provider.timeoutMs || 30000, maxAttempts: 1,
            requestBody: { confirmation: this.policy().confirmation, resetScope: 'LOCAL_ACCEPTANCE', reason: input.reason,
                correlationId: request.correlationId }, header: { Authorization: 'Bearer ' + token },
            responseSelector: response => response && response.result });
    },
    /** Executes the documented bounded module operation. */
    status: async function () {
        let policy = this.policy();
        let configured = [].concat(policy.providers || []);
        let environmentAllowed = this.environmentAllowed();
        return { enabled: policy.enabled === true, destructive: true, apiOnly: true, environmentAllowed: environmentAllowed,
            providerCount: configured.length, ready: policy.enabled === true && environmentAllowed && configured.length > 0,
            reason: policy.enabled !== true ? 'LOCAL_RESET_DISABLED' : !environmentAllowed ? 'ENVIRONMENT_NOT_ALLOWED' :
                configured.length ? undefined : 'RESET_PROVIDERS_MISSING' };
    },
    /** Executes the documented bounded module operation. */
    execute: async function (request) {
        let policy = this.policy();
        let input = request.localReset || request;
        let principal = this.principal(request);
        if (policy.enabled !== true) throw new CLASSES.NodicsError('ERR_BOF_00092', 'Local reset is disabled');
        if (!this.environmentAllowed()) throw new CLASSES.NodicsError('ERR_BOF_00096', 'Local reset is not allowed in this environment');
        if (!principal || request.authData && request.authData.tokenType === 'service') throw new CLASSES.NodicsError('ERR_BOF_00093', 'Local reset requires a human administrator');
        if (input.confirmation !== policy.confirmation || String(input.reason || '').trim().length < 8) {
            throw new CLASSES.NodicsError('ERR_BOF_00094', 'Local reset confirmation and reason are required');
        }
        let providers = this.providers();
        if (!providers.length) throw new CLASSES.NodicsError('ERR_BOF_00091', 'Local reset providers are not configured');
        let results = [];
        for (let provider of providers) {
            let result = await this.invokeProvider(provider, request, input);
            if (!result || result.acknowledged !== true) throw new CLASSES.NodicsError('ERR_BOF_00095', 'Local reset provider did not acknowledge completion');
            results.push({ provider: provider.code, acknowledged: true });
        }
        return { acknowledged: true, providerCount: results.length, providers: results, requestedBy: principal,
            correlationId: request.correlationId };
    }
};
