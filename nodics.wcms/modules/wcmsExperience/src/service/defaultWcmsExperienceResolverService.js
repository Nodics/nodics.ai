/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/service/defaultWcmsExperienceResolverService
 * @description Resolves published CMS experience placements into storefront-safe slots.
 * @layer service
 * @owner wcmsExperience
 * @override Project modules may override matching or component projection through documented service members.
 */
module.exports = {
    /** Resolves experience slots for a request. @param {Object} request Nodics request. @returns {Promise<Object>} Resolved experience payload. */
    resolve: function (request) {
        let context = this.normalizeContext(request);
        if (!this.isEnabled()) return Promise.reject(this.error('ERR_WCMS_EXPERIENCE_RESOLVER_DISABLED', 'WCMS Experience resolver is disabled.'));
        let validation = this.validateContext(context);
        if (!validation.valid) return Promise.reject(this.error('ERR_WCMS_EXPERIENCE_INPUT_INVALID', validation.message));
        return SERVICE.DefaultWcmsExperienceProjectionService.findPlacements(context)
            .then(placements => this.resolveFromPlacements(context, placements || []));
    },

    /** Returns whether the resolver is enabled. @returns {boolean} Enabled state. */
    isEnabled: function () {
        let config = this.config();
        return config.enabled !== false && (!config.resolver || config.resolver.enabled !== false);
    },

    /** Returns WCMS Experience configuration. @returns {Object} Configuration. */
    config: function () {
        return typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('wcmsExperience') || {}) : {};
    },

    /** Normalizes resolver context from request. @param {Object} request Nodics request. @returns {Object} Context. */
    normalizeContext: function (request) {
        let input = request && request.experience ? request.experience : {};
        let defaults = (this.config().resolver || {});
        return {
            tenant: request && request.tenant,
            authData: request && request.authData,
            site: this.string(input.site),
            pageType: this.string(input.pageType),
            targetType: this.string(input.targetType || defaults.fallbackTargetType || 'DEFAULT').toUpperCase(),
            targetCode: this.string(input.targetCode || defaults.fallbackTargetCode || '*'),
            locale: this.string(input.locale || defaults.defaultLocale || 'en-US'),
            region: this.string(input.region),
            channel: this.string(input.channel || defaults.defaultChannel || 'web'),
            device: this.string(input.device || defaults.defaultDevice || 'desktop'),
            customerSegments: Array.isArray(input.customerSegments) ? input.customerSegments.map(item => this.string(item)).filter(Boolean) : [],
            previewMode: input.previewMode === true,
            now: input.now ? new Date(input.now) : new Date()
        };
    },

    /** Converts a value to a trimmed string. @param {*} value Candidate value. @returns {string} String. */
    string: function (value) {
        return value === undefined || value === null ? '' : String(value).trim();
    },

    /** Validates normalized resolver context. @param {Object} context Resolver context. @returns {Object} Validation result. */
    validateContext: function (context) {
        let required = ['site', 'pageType', 'targetType', 'targetCode'];
        let missing = required.filter(field => !context[field]);
        if (missing.length) return { valid: false, message: 'Missing resolver context: ' + missing.join(', ') };
        return { valid: true };
    },

    /** Resolves slots from available placements. @param {Object} context Context. @param {Array<Object>} placements Candidate placements. @returns {Object} Resolved response. */
    resolveFromPlacements: function (context, placements) {
        let active = placements.filter(placement => this.isActivePlacement(context, placement));
        let exact = active.filter(placement => this.matchesTarget(context, placement));
        let fallback = active.filter(placement => this.matchesFallback(context, placement));
        let selected = this.selectPlacements(exact, fallback);
        selected = selected.slice().sort((left, right) => this.comparePlacements(left, right));
        return {
            site: context.site,
            pageType: context.pageType,
            release: this.release(selected),
            indexVersion: this.indexVersion(selected),
            slots: this.groupSlots(selected),
            diagnostics: {
                matched: exact.length > 0,
                fallbackUsed: exact.length === 0 && fallback.length > 0,
                placementCount: selected.length
            }
        };
    },

    /** Selects exact placements while preserving fallback slots not overridden by exact matches. @param {Array<Object>} exact Exact placements. @param {Array<Object>} fallback Fallback placements. @returns {Array<Object>} Selected placements. */
    selectPlacements: function (exact, fallback) {
        if (!exact.length) return fallback.slice();
        let exactSlots = new Set(exact.map(placement => placement.slot || 'default'));
        return fallback.filter(placement => !exactSlots.has(placement.slot || 'default')).concat(exact);
    },

    /** Determines whether a placement is active for context. @param {Object} context Context. @param {Object} placement Placement. @returns {boolean} Active match. */
    isActivePlacement: function (context, placement) {
        if (!placement) return false;
        if (placement.site !== context.site) return false;
        if (placement.pageType !== context.pageType) return false;
        if (placement.deliveryStatus && placement.deliveryStatus !== 'ACTIVE') return false;
        let expectedPublication = context.previewMode ? 'STAGED' : 'ONLINE';
        if (placement.publicationStatus && placement.publicationStatus !== expectedPublication) return false;
        if (placement.locale && placement.locale !== context.locale) return false;
        if (placement.channel && placement.channel !== context.channel) return false;
        if (placement.device && placement.device !== context.device) return false;
        if (placement.validFrom && new Date(placement.validFrom) > context.now) return false;
        if (placement.validTo && new Date(placement.validTo) < context.now) return false;
        return true;
    },

    /** Determines exact target match. @param {Object} context Context. @param {Object} placement Placement. @returns {boolean} Exact match. */
    matchesTarget: function (context, placement) {
        return placement.targetType === context.targetType && placement.targetCode === context.targetCode;
    },

    /** Determines fallback target match. @param {Object} context Context. @param {Object} placement Placement. @returns {boolean} Fallback match. */
    matchesFallback: function (context, placement) {
        let defaults = (this.config().resolver || {});
        return placement.targetType === (defaults.fallbackTargetType || 'DEFAULT') &&
            placement.targetCode === (defaults.fallbackTargetCode || '*');
    },

    /** Compares placements by specificity, priority, updatedAt, and code. @param {Object} left Left. @param {Object} right Right. @returns {number} Sort result. */
    comparePlacements: function (left, right) {
        let specificity = Number(right.specificity || 0) - Number(left.specificity || 0);
        if (specificity) return specificity;
        let priority = Number(right.priority || 0) - Number(left.priority || 0);
        if (priority) return priority;
        let updated = String(right.updatedAt || '').localeCompare(String(left.updatedAt || ''));
        if (updated) return updated;
        return String(left.code || '').localeCompare(String(right.code || ''));
    },

    /** Groups placements into renderer-safe slots. @param {Array<Object>} placements Selected placements. @returns {Object} Slot map. */
    groupSlots: function (placements) {
        return placements.reduce((slots, placement) => {
            let slot = placement.slot || 'default';
            slots[slot] = slots[slot] || [];
            slots[slot].push(this.toSlotComponent(placement));
            return slots;
        }, {});
    },

    /** Projects placement into a storefront-safe component contract. @param {Object} placement Placement. @returns {Object} Component payload. */
    toSlotComponent: function (placement) {
        return {
            placementCode: placement.code,
            componentCode: placement.componentCode || placement.component,
            rendererKey: placement.rendererKey,
            contractVersion: Number(placement.contractVersion || 1),
            properties: Object.assign({}, placement.properties || {}),
            media: Array.isArray(placement.media) ? placement.media.slice() : []
        };
    },

    /** Resolves release from selected placements. @param {Array<Object>} placements Selected placements. @returns {string|null} Release. */
    release: function (placements) {
        return placements.length ? placements[0].release || null : null;
    },

    /** Resolves index version from selected placements. @param {Array<Object>} placements Selected placements. @returns {string|null} Index version. */
    indexVersion: function (placements) {
        return placements.length ? placements[0].indexVersion || null : null;
    },

    /** Creates a Nodics-compatible error. @param {string} code Error code. @param {string} message Error message. @returns {Error} Error. */
    error: function (code, message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(code, message);
        let error = new Error(message || code);
        error.code = code;
        return error;
    }
};
