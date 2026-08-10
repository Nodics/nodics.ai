/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nLocalization/service/DefaultLocalizationClientService
 * @description Provides the Core provider-neutral port for calling the active
 * Localization authority without embedding persistence, routes, or deployment topology.
 * @layer service
 * @owner nLocalization
 * @override Projects select a provider through layered configuration or override
 * one client method through the standard same-name service merge path.
 */
module.exports = {
    /** Initializes the provider-neutral client. */
    init: function () { return Promise.resolve(true); },
    /** Completes provider-neutral client initialization. */
    postInit: function () { return Promise.resolve(true); },

    /**
     * Resolves context through the configured authority or a caller-supplied trusted policy fallback.
     * @param {Object} request Trusted scope, requested locale, and optional effective policy.
     * @returns {Promise<Object>} LocalizationContext.
     */
    resolveContext: async function (request) {
        let provider = this.provider();
        if (provider && typeof provider.resolveContext === 'function') return provider.resolveContext(request);
        if (this.settings().allowLocalContextFallback === true && request && request.policy) {
            return this.contextService().create(request, request.policy);
        }
        throw this.error('ERR_L10N_00002', 'No Localization authority or trusted local policy is available');
    },

    /**
     * Requests a published runtime bundle from the configured authority.
     * @param {Object} request Authorized bundle request.
     * @returns {Promise<Object>} Published bundle projection.
     */
    getRuntimeBundle: async function (request) {
        let provider = this.provider();
        if (!provider || typeof provider.getRuntimeBundle !== 'function') {
            throw this.error('ERR_L10N_00002', 'Localization bundle authority is unavailable');
        }
        return provider.getRuntimeBundle(request);
    },

    /** Returns the configured replaceable provider service, if active. */
    provider: function () {
        let name = this.settings().providerService;
        return typeof SERVICE !== 'undefined' && name ? SERVICE[name] : undefined;
    },

    /** Returns the stateless local context service. */
    contextService: function () {
        if (typeof SERVICE === 'undefined' || !SERVICE.DefaultLocalizationContextService) {
            throw this.error('ERR_L10N_00002', 'Localization context fallback service is unavailable');
        }
        return SERVICE.DefaultLocalizationContextService;
    },

    /** Returns layered provider selection and fallback configuration. */
    settings: function () {
        return typeof CONFIG !== 'undefined' && CONFIG.get ?
            ((CONFIG.get('localization') || {}).client || {}) :
            { providerService: 'DefaultLocalizationAuthorityProviderService', allowLocalContextFallback: true };
    },

    /** Creates a stable unavailable-authority error. */
    error: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ?
            new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = error.code || code;
        return error;
    }
};
