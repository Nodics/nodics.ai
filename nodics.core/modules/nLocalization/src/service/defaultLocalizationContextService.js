/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nLocalization/service/DefaultLocalizationContextService
 * @description Constructs and validates immutable versioned localization context
 * from trusted scope and an already authorized effective policy.
 * @layer service
 * @owner nLocalization
 * @override Later modules may override metadata selection while preserving scope,
 * immutability, contract version, and canonical locale invariants.
 */
module.exports = {
    /** Initializes the stateless context service. */
    init: function () { return Promise.resolve(true); },
    /** Completes stateless context service initialization. */
    postInit: function () { return Promise.resolve(true); },

    /**
     * Creates a deeply immutable localization context.
     * @param {Object} input Trusted tenant/site/channel/request metadata.
     * @param {Object} policy Effective authorized localization policy.
     * @returns {Object} Frozen LocalizationContext version 1.
     */
    create: function (input, policy) {
        input = input || {};
        policy = policy || {};
        this.validateScope(input);
        let localeService = this.localeService();
        let resolution = localeService.resolve(input.requestedLocale, policy);
        let metadata = localeService.describe(resolution.resolvedLocale);
        let settings = localeService.settings();
        let source = input.source || 'PLATFORM_DEFAULT';
        if (!this.sources().includes(source)) throw this.error('ERR_L10N_00003', 'Localization context source is invalid');
        let context = {
            contractVersion: Number(settings.contractVersion || 1),
            requestedLocale: resolution.requestedLocale,
            resolvedLocale: resolution.resolvedLocale,
            fallbackLocales: resolution.fallbackLocales,
            language: metadata.language,
            script: metadata.script,
            region: metadata.region,
            direction: metadata.direction,
            timeZone: input.timeZone || policy.timeZone,
            currency: input.currency || policy.currency,
            numberingSystem: input.numberingSystem || policy.numberingSystem,
            calendar: input.calendar || policy.calendar,
            tenant: input.tenant,
            enterprise: input.enterprise,
            site: input.site,
            channel: input.channel || policy.channel || settings.defaultChannel,
            source: source,
            policyVersion: policy.version
        };
        Object.keys(context).forEach(key => { if (context[key] === undefined) delete context[key]; });
        return this.deepFreeze(context);
    },

    /**
     * Validates minimum tenant and bounded scope inputs.
     * @param {Object} input Context input.
     * @returns {boolean} True when scope is valid.
     */
    validateScope: function (input) {
        let maximum = this.localeService().limits().maximumScopePartLength;
        ['tenant', 'enterprise', 'site', 'channel'].forEach(key => {
            if (input[key] !== undefined && (typeof input[key] !== 'string' || !input[key].trim() || input[key].length > maximum)) {
                throw this.error('ERR_L10N_00004', 'Localization scope is invalid');
            }
        });
        if (typeof input.tenant !== 'string' || !input.tenant.trim()) {
            throw this.error('ERR_L10N_00003', 'Trusted tenant is required');
        }
        return true;
    },

    /** Returns stable permitted context sources. */
    sources: function () {
        return typeof ENUMS !== 'undefined' && Array.isArray(ENUMS.LOCALIZATION_CONTEXT_SOURCES) ?
            ENUMS.LOCALIZATION_CONTEXT_SOURCES :
            ['TRUSTED_OVERRIDE', 'SUBJECT_PREFERENCE', 'STOREFRONT_CONTEXT', 'SITE_POLICY', 'TENANT_POLICY', 'PLATFORM_DEFAULT'];
    },

    /** Returns the overridable locale service. */
    localeService: function () {
        if (typeof SERVICE === 'undefined' || !SERVICE.DefaultLocaleCanonicalizationService) {
            throw this.error('ERR_L10N_00003', 'Locale canonicalization service is unavailable');
        }
        return SERVICE.DefaultLocaleCanonicalizationService;
    },

    /** Recursively freezes arrays and plain context objects. */
    deepFreeze: function (value) {
        if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
        Object.keys(value).forEach(key => this.deepFreeze(value[key]));
        return Object.freeze(value);
    },

    /** Creates a stable localization error. */
    error: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ?
            new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = error.code || code;
        return error;
    }
};
