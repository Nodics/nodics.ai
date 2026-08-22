/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nLocalization/service/DefaultLocaleCanonicalizationService
 * @description Canonicalizes BCP 47 locale tags and resolves one locale against
 * a bounded, caller-supplied policy without reading tenant or domain data.
 * @layer service
 * @owner nLocalization
 * @override Projects may replace individual methods through the standard service
 * merge path while preserving canonical BCP 47 output and fail-closed validation.
 */
module.exports = {
    /** Initializes the stateless locale service. */
    init: function () { return Promise.resolve(true); },
    /** Completes stateless locale service initialization. */
    postInit: function () { return Promise.resolve(true); },

    /**
     * Canonicalizes one locale using the JavaScript Intl implementation.
     * @param {string} value Requested locale, optionally using a legacy underscore separator.
     * @returns {string} Canonical BCP 47 locale tag.
     * @throws {Error} `ERR_L10N_00000` when the input is blank, reserved, too long, or malformed.
     */
    canonicalize: function (value) {
        let maximum = this.limits().maximumLocaleLength;
        if (typeof value !== 'string' || !value.trim() || value.length > maximum) {
            throw this.error('ERR_L10N_00000', 'Locale must be a bounded non-empty string');
        }
        let normalized = value.trim().replace(/_/g, '-');
        if (normalized.toLowerCase() === 'default') {
            throw this.error('ERR_L10N_00000', 'The reserved default marker is not a locale');
        }
        try {
            let locales = Intl.getCanonicalLocales(normalized);
            if (locales.length !== 1) throw new Error('Expected one locale');
            return locales[0];
        } catch (error) {
            throw this.error('ERR_L10N_00000', 'Locale is not a valid BCP 47 language tag');
        }
    },

    /**
     * Canonicalizes and de-duplicates a bounded locale array.
     * @param {string[]} values Locale values.
     * @returns {string[]} Canonical locale values in original order.
     */
    canonicalizeList: function (values) {
        if (!Array.isArray(values) || values.length > this.limits().maximumFallbackLocales + 1) {
            throw this.error('ERR_L10N_00000', 'Locale list is invalid or exceeds the configured bound');
        }
        let seen = new Set();
        return values.map(value => this.canonicalize(value)).filter(value => {
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    },

    /**
     * Resolves a requested locale through the caller's supported/default/fallback policy.
     * @param {string|undefined} requestedLocale Requested locale.
     * @param {Object} policy Trusted effective locale policy.
     * @returns {Object} Requested, resolved, and remaining fallback locales.
     */
    resolve: function (requestedLocale, policy) {
        policy = policy || {};
        let supported = this.canonicalizeList(policy.supportedLocales || []);
        if (!supported.length) throw this.error('ERR_L10N_00003', 'Supported locales are required');
        let defaultLocale = this.canonicalize(policy.defaultLocale);
        if (!supported.includes(defaultLocale)) {
            throw this.error('ERR_L10N_00003', 'Default locale must be supported');
        }
        let requested = requestedLocale ? this.canonicalize(requestedLocale) : defaultLocale;
        let candidates = [requested];
        let baseLanguage = new Intl.Locale(requested).language;
        if (baseLanguage !== requested) candidates.push(baseLanguage);
        candidates = candidates.concat(policy.fallbackLocales || [], [defaultLocale]);
        candidates = this.canonicalizeList(candidates).filter(value => supported.includes(value));
        if (!candidates.length) throw this.error('ERR_L10N_00001', 'No supported locale can satisfy the request');
        return Object.freeze({
            requestedLocale: requested,
            resolvedLocale: candidates[0],
            fallbackLocales: Object.freeze(candidates.slice(1))
        });
    },

    /**
     * Derives stable language/script/region/direction metadata.
     * @param {string} locale Canonical or canonicalizable locale.
     * @returns {Object} Locale metadata safe to place in LocalizationContext.
     */
    describe: function (locale) {
        let canonical = this.canonicalize(locale);
        let parsed = new Intl.Locale(canonical);
        let expanded = parsed.maximize();
        let rtlScripts = this.settings().rtlScripts || [];
        return Object.freeze({
            locale: canonical,
            language: parsed.language,
            script: parsed.script || expanded.script,
            region: parsed.region || expanded.region,
            direction: rtlScripts.includes(parsed.script || expanded.script) ? 'rtl' : 'ltr'
        });
    },

    /** Returns effective stateless localization context configuration. */
    settings: function () {
        return typeof CONFIG !== 'undefined' && CONFIG.get ?
            ((CONFIG.get('localization') || {}).context || {}) :
            { contractVersion: 0, defaultLocale: 'en', defaultChannel: 'web', rtlScripts: ['Arab', 'Hebr', 'Thaa', 'Nkoo', 'Adlm', 'Rohg', 'Syrc'] };
    },

    /** Returns effective input bounds. */
    limits: function () {
        return typeof CONFIG !== 'undefined' && CONFIG.get ?
            ((CONFIG.get('localization') || {}).limits || {}) :
            { maximumLocaleLength: 64, maximumFallbackLocales: 16, maximumScopePartLength: 128 };
    },

    /** Creates a stable localization error without exposing implementation details. */
    error: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ?
            new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = error.code || code;
        return error;
    }
};
