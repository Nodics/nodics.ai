/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module service/authentication/DefaultInternalAuthenticationProviderService
 * @description Fetches tenant-scoped internal auth tokens from the profile
 * module when the profile module is deployed separately. This supports modular
 * deployment where non-profile nodes still need internal service credentials.
 * @layer service
 * @owner nService
 * @override Project modules may override this service to integrate external IAM,
 * service accounts, or secret managers while preserving tenant-scoped internal
 * token retrieval.
 *
 * @property {Object} CONFIG.defaultAuthDetail Bootstrap API key and enterprise code.
 * @property {Object} SERVICE.DefaultModuleService Internal module HTTP client.
 */
module.exports = {
    _refreshTimer: null,
    _refreshPromise: null,
    _refreshStopped: true,
    _refreshFailures: 0,
    _refreshGeneration: 0,
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        if (SERVICE.DefaultRuntimeLifecycleService) {
            SERVICE.DefaultRuntimeLifecycleService.registerContributor('internalTokenRefresh', {
                order: 200,
                drain: () => this.stopInternalAuthTokenRefresh(),
                shutdown: () => this.stopInternalAuthTokenRefresh()
            });
        }
        return Promise.resolve(true);
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Fetches an internal auth token for a tenant from the profile module.
     *
     * @param {string} tntCode Tenant code.
     * @returns {Promise<Object>} Internal token response.
     */
    /** Uses explicit deployment identity; process IDs and caller-chosen module names cannot establish entitlement. */
    buildRuntimeIdentityHeaders: function (tenant) {
        const identity = CONFIG.get('runtimeIdentity', tenant) || {};
        if (typeof identity.instanceCode !== 'string' || !/^[A-Za-z][A-Za-z0-9_.:-]{0,191}$/.test(identity.instanceCode)) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime identity requires an approved instanceCode');
        }
        const remote = identity.remoteModules === undefined ? [] : identity.remoteModules;
        if (!Array.isArray(remote) || remote.length > 512 || remote.some(module =>
            typeof module !== 'string' || !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(module))) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime remoteModules requires bounded module codes');
        }
        const requested = [...new Set([...(NODICS.getActiveModules() || []), ...remote])];
        if (requested.length > 512) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime module request exceeds its bound');
        return {
            'x-nodics-project': NODICS.getEnvironmentName(),
            'x-nodics-environment': NODICS.getSelectedEnvironmentName(),
            'x-nodics-server': NODICS.getServerName(),
            'x-nodics-runtime-instance': identity.instanceCode,
            'x-nodics-modules': requested.join(',')
        };
    },

    /** Authenticates the configured provider proof and requests a grant-bound credential from Profile. */
    fetchInternalAuthToken: async function (tntCode) {
        const credentials = CONFIG.get('defaultAuthDetail', tntCode) || {};
        const headers = this.buildRuntimeIdentityHeaders(tntCode);
        if (!credentials.apiKey || !credentials.entCode) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime identity provider credentials are unavailable');
        // The authority process authenticates the same configured provider proof and
        // invokes the same Profile grant check before opening an HTTP listener.
        if (NODICS.isModuleActive(CONFIG.get('profileModuleName') || 'profile')) {
            const proof = await SERVICE.DefaultAuthenticationProviderService.authenticateAPIKey({ apiKey: credentials.apiKey, entCode: credentials.entCode });
            const principal = proof.person || {};
            const response = await this.getInternalAuthToken({ tenant: tntCode, headers, authData: {
                person: principal, tenant: proof.tenant, entCode: proof.enterprise && proof.enterprise.code,
                permissions: [...new Set([...(principal.apiKeyScopes || []), ...(principal.userGroupPermissions || [])])]
            } });
            return response.result;
        }
        const requestUrl = SERVICE.DefaultModuleService.buildRequest({
            moduleName: CONFIG.get('profileModuleName') || 'profile', methodName: 'GET',
            apiName: '/auth/token/' + encodeURIComponent(tntCode), requestBody: {}, responseType: true,
            header: { ...headers, 'x-api-key': credentials.apiKey, 'x-enterprise-code': credentials.entCode }
        });
        const response = await SERVICE.DefaultModuleService.fetch(requestUrl);
        if (!response || !response.result || !response.result.authToken) throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Internal credential issuance did not complete');
        return response.result;
    },

    /** Refreshes internal service tokens for all active tenant token slots. */
    refreshInternalAuthTokens: async function () {
        let tenants = Object.keys(NODICS.getInternalAuthTokens() || {});
        if (tenants.length === 0) tenants = [CONFIG.get('defaultTenant') || 'default'];
        const limit = Number(((CONFIG.get('authSecurity') || {}).internalToken || {}).renewalConcurrency || 4);
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 32) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Invalid runtime renewal concurrency');
        const results = [], failures = [];
        let cursor = 0;
        await Promise.all(Array.from({ length: Math.min(limit, tenants.length) }, async () => {
            while (cursor < tenants.length) {
                const tenant = tenants[cursor++];
                try {
                    const result = await this.fetchInternalAuthToken(tenant);
                    if (!result || !result.authToken) throw new CLASSES.NodicsError('ERR_AUTH_00001', 'Rotated internal credential is unavailable');
                    NODICS.addInternalAuthToken(tenant, result.authToken);
                    results.push(tenant);
                } catch (error) { failures.push(error); }
            }
        }));
        if (failures.length) throw failures[0];
        return results;
    },

    /** Stops token rotation before transports and tenant resources close. */
    stopInternalAuthTokenRefresh: function () {
        this._refreshStopped = true;
        this._refreshGeneration++;
        if (this._refreshTimer) clearTimeout(this._refreshTimer);
        this._refreshTimer = null;
        return this._refreshPromise || Promise.resolve(true);
    },

    /** Chooses a jittered renewal delay before the earliest credential expiry, with bounded outage backoff. */
    getInternalTokenRefreshDelay: function () {
        const security = CONFIG.get('authSecurity') || {};
        const maximum = Number((security.internalToken || {}).maximumLifetimeSeconds || 300) * 1000;
        const configured = Number((security.jwt || {}).serviceTokenRefreshIntervalMs || maximum / 2);
        let interval = Math.min(configured, maximum / 2);
        if (!Number.isFinite(interval) || interval < 1000) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Invalid runtime renewal interval');
        for (const token of Object.values(NODICS.getInternalAuthTokens() || {})) {
            const payload = require('jsonwebtoken').decode(token);
            if (payload && Number.isFinite(payload.exp)) interval = Math.min(interval, Math.max(1000, (payload.exp * 1000 - Date.now()) / 2));
        }
        if (this._refreshFailures > 0) return Math.min(30000, 1000 * 2 ** Math.min(this._refreshFailures - 1, 5));
        return Math.max(1000, Math.floor(interval * (0.8 + Math.random() * 0.2)));
    },

    /** Keeps one asynchronous renewal loop for the runtime; no overlapping tenant batches or per-module loops. */
    scheduleInternalAuthTokenRefresh: function () {
        this.stopInternalAuthTokenRefresh();
        this._refreshStopped = false;
        this._refreshFailures = 0;
        const generation = this._refreshGeneration;
        const schedule = () => {
            if (this._refreshStopped || generation !== this._refreshGeneration) return;
            this._refreshTimer = setTimeout(() => {
                this._refreshTimer = null;
                if (this._refreshStopped || generation !== this._refreshGeneration) return;
                const pending = this._refreshPromise || this.refreshInternalAuthTokens();
                const tracked = Promise.resolve(pending).then(() => { this._refreshFailures = 0; }).catch(error => {
                    this._refreshFailures++;
                    this.LOG.error('Internal authentication token rotation failed', error);
                }).finally(() => { if (this._refreshPromise === tracked) this._refreshPromise = null; schedule(); });
                this._refreshPromise = tracked;
            }, this.getInternalTokenRefreshDelay());
            if (this._refreshTimer.unref) this._refreshTimer.unref();
        };
        schedule();
        return this._refreshTimer;
    }
};
