/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module apparelProduct/service/defaultApparelProductProjectionService @description Builds customer-safe Apparel additions for Commerce Product projections. @layer service @owner apparelProduct */
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
     * Executes `project` as a loader-visible operation owned by this module.
     * @param {*} style Value defined by the owning module contract.
     * @param {*} variants Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    project: function (style, variants) {
        if (!style || style.status !== 'ACTIVE') return {};
        return { apparel: {
            brandCode: style.brandCode, collectionCodes: style.collectionCodes || [], seasonCode: style.seasonCode,
            genderAudience: style.genderAudience || [], ageGroup: style.ageGroup, fitProfileCode: style.fitProfileCode,
            sizeSystemCode: style.sizeSystemCode, materialComposition: style.materialComposition || [], careInstructions: style.careInstructions || [],
            options: (variants || []).filter(item => item.status === 'ACTIVE').map(item => ({
                variantCode: item.variantCode, colourCode: item.colourCode, colourFamily: item.colourFamily,
                swatchMediaCode: item.swatchMediaCode, sizeCode: item.sizeCode, fitCode: item.fitCode
            }))
        } };
    }
};
