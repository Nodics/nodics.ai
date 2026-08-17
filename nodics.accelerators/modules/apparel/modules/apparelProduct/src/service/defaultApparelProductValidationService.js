/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module apparelProduct/service/defaultApparelProductValidationService @description Validates reusable Apparel style and variant invariants. @layer service @owner apparelProduct */
module.exports = {
    /**
     * Executes `init` as a loader-visible operation owned by this module.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    init: function () { return Promise.resolve(true); },
    /**
     * Executes `postInit` as a loader-visible operation owned by this module.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    postInit: function () { return Promise.resolve(true); },
    /**
     * Executes `policy` as a loader-visible operation owned by this module.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    policy: function () { return (global.CONFIG && CONFIG.get('apparelProduct')) || { sizeSystems: ['ALPHA', 'EU', 'UK', 'US', 'AGE', 'ONE_SIZE'], compositionTotal: 100 }; },
    /**
     * Executes `validateStyle` as a loader-visible operation owned by this module.
     * @param {*} style Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    validateStyle: function (style) {
        let errors = [];
        if (!style || !style.productCode) errors.push('APPAREL_PRODUCT_REQUIRED');
        if (!style || !this.policy().sizeSystems.includes(style.sizeSystemCode)) errors.push('APPAREL_SIZE_SYSTEM_INVALID');
        let composition = (style && style.materialComposition) || [];
        if (composition.length) {
            let total = composition.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
            if (Math.abs(total - Number(this.policy().compositionTotal || 100)) > 0.001) errors.push('APPAREL_COMPOSITION_TOTAL_INVALID');
        }
        return { valid: errors.length === 0, errors: errors };
    },
    /**
     * Executes `validateVariant` as a loader-visible operation owned by this module.
     * @param {*} variant Value defined by the owning module contract.
     * @param {*} style Value defined by the owning module contract.
     * @param {*} sizeSystem Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    validateVariant: function (variant, style, sizeSystem) {
        let errors = [];
        if (!variant || !variant.variantCode || !variant.colourCode || !variant.sizeCode) errors.push('APPAREL_VARIANT_DIMENSIONS_REQUIRED');
        if (variant && style && variant.productCode !== style.productCode) errors.push('APPAREL_PRODUCT_MISMATCH');
        if (variant && style && variant.sizeSystemCode !== style.sizeSystemCode) errors.push('APPAREL_SIZE_SYSTEM_MISMATCH');
        if (variant && sizeSystem && !(sizeSystem.sizeCodes || []).includes(variant.sizeCode)) errors.push('APPAREL_SIZE_NOT_ALLOWED');
        return { valid: errors.length === 0, errors: errors };
    }
};
