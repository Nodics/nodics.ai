/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesCore/src/service/defaultRulePropertyCatalogueRegistryService @description Registers server-owned consumer property-catalogue providers without embedding domain semantics in Rules Engine. @layer service @owner rulesCore */
module.exports = {
    providers: {},

    /** Implements registerProvider as an overrideable service operation. */
    registerProvider: function (code, provider) {
        if (!code || !provider || typeof provider.getCatalogue !== 'function' || typeof provider.resolveProperty !== 'function') {
            throw new Error('Rule property provider must expose getCatalogue and resolveProperty');
        }
        if (this.providers[code] && this.providers[code] !== provider) {
            throw new Error('Rule property provider is already registered: ' + code);
        }
        this.providers[code] = provider;
        return true;
    },

    /** Implements getProvider as an overrideable service operation. */
    getProvider: function (code) {
        let provider = this.providers[code];
        if (!provider) throw new Error('Rule property provider is unavailable: ' + code);
        return provider;
    },

    /** Implements getCatalogue as an overrideable service operation. */
    getCatalogue: function (code, context) {
        return this.getProvider(code).getCatalogue(context || {});
    },

    /** Implements resolveProperty as an overrideable service operation. */
    resolveProperty: function (code, request) {
        return this.getProvider(code).resolveProperty(request || {});
    },

    /** Implements resolveFallback as an overrideable service operation. */
    resolveFallback: function (code, request) {
        let provider = this.getProvider(code);
        return typeof provider.resolveFallback === 'function'
            ? provider.resolveFallback(request || {})
            : { available: false };
    },

    /** Implements resolveAllowedValues as an overrideable service operation. */
    resolveAllowedValues: function (code, request) {
        let provider = this.getProvider(code);
        return typeof provider.resolveAllowedValues === 'function'
            ? provider.resolveAllowedValues(request || {})
            : [];
    },

    /** Implements reset as an overrideable service operation. */
    reset: function () {
        this.providers = {};
    }
};
