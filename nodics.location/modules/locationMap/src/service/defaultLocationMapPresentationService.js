/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module locationMap/src/service/defaultLocationMapPresentationService
 * @description Validates the shared, non-executable map appearance and interaction contract.
 * @layer service
 * @owner locationMap
 * @override Later layers supply locationMapConfiguration defaults or override these named validators.
 */
module.exports = {
    /** Reads Location-owned layered defaults. */
    settings: function () { return CONFIG.get('locationMapConfiguration') || {}; },
    /** Rejects unsafe or ambiguous browser presentation values. */
    fail: function (message) { return SERVICE.DefaultLocationMapConfigurationOperationService.fail('ERR_LOCATION_MAP_PRESENTATION_INVALID', message); },
    /** Normalizes bounded marker categories; labels are text and colors are hex values only. */
    presentation: function (input) {
        const source = input === undefined ? this.settings().presentation : input;
        if (!source || !Array.isArray(source.categories) || source.categories.length < 1 || source.categories.length > 12) this.fail('Provide between one and twelve map categories');
        const codes = new Set();
        const categories = source.categories.map(category => {
            if (!category || typeof category.code !== 'string' || !/^[a-z][a-z0-9-]{0,47}$/.test(category.code) || codes.has(category.code)) this.fail('Map category codes must be unique lowercase identifiers');
            codes.add(category.code);
            if (typeof category.label !== 'string' || !category.label.trim() || category.label.length > 80) this.fail('Map category labels must contain one to eighty characters');
            if (typeof category.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(category.color)) this.fail('Map category colors must use six-digit hex values');
            if (!Array.isArray(category.matchTerms) || category.matchTerms.length > 20 || category.matchTerms.some(term => typeof term !== 'string' || !term.trim() || term.length > 60)) this.fail('Map category matching terms are invalid');
            return { code: category.code, label: category.label.trim(), color: category.color, matchTerms: category.matchTerms.map(term => term.trim().toLowerCase()) };
        });
        if (!codes.has(source.defaultCategoryCode)) this.fail('Choose a default map category from the configured categories');
        return { defaultCategoryCode: source.defaultCategoryCode, categories: categories };
    },
    /** Normalizes interaction settings used by both Mapbox and tile renderers. */
    interaction: function (input) {
        const source = Object.assign({}, this.settings().interaction, input || {});
        if (!['MODIFIER', 'FREE', 'DISABLED'].includes(source.wheelZoomMode)) this.fail('Choose modifier-key, free or disabled wheel zoom');
        const number = (key, min, max) => {
            const value = source[key];
            if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) this.fail(key + ' is outside its supported range');
            return value;
        };
        return { wheelZoomMode: source.wheelZoomMode, wheelStep: number('wheelStep', 0.25, 3), wheelCooldownMs: number('wheelCooldownMs', 0, 1000), zoomAnimationSeconds: number('zoomAnimationSeconds', 0, 2) };
    }
};
