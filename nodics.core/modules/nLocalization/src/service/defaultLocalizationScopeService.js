/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nLocalization/service/DefaultLocalizationScopeService
 * @description Creates deterministic bounded scope and cache identities for
 * localization clients; it never reads or writes cache state.
 * @layer service
 * @owner nLocalization
 * @override Later modules may replace key serialization while preserving every
 * tenant, scope, channel, locale, namespace-set, and release partition.
 */
module.exports = {
    /** Initializes the stateless scope service. */
    init: function () { return Promise.resolve(true); },
    /** Completes stateless scope service initialization. */
    postInit: function () { return Promise.resolve(true); },

    /**
     * Builds a deterministic cache partition key without storing localized values.
     * @param {Object} input Complete authorized localization scope.
     * @returns {string} Bounded partition identity.
     */
    bundleKey: function (input) {
        input = input || {};
        let required = ['tenant', 'channel', 'locale', 'releaseVersion'];
        required.forEach(key => this.assertPart(input[key]));
        let namespaces = Array.isArray(input.namespaces) ? input.namespaces.slice().sort() : [];
        if (!namespaces.length) throw this.error('ERR_L10N_00004', 'At least one namespace is required');
        namespaces.forEach(value => this.assertPart(value));
        let scope = input.scopeCode || 'global';
        this.assertPart(scope);
        return [input.tenant, scope, input.channel, input.locale, namespaces.join(','), input.releaseVersion].join('|');
    },

    /** Validates one scope identity part against the configured bound. */
    assertPart: function (value) {
        let maximum = typeof CONFIG !== 'undefined' && CONFIG.get ?
            (((CONFIG.get('localization') || {}).limits || {}).maximumScopePartLength || 128) : 128;
        if (typeof value !== 'string' || !value.trim() || value.length > maximum || value.includes('|')) {
            throw this.error('ERR_L10N_00004', 'Localization scope part is invalid');
        }
        return true;
    },

    /** Creates a stable localization scope error. */
    error: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ?
            new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = error.code || code;
        return error;
    }
};
