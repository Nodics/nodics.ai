/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module electronicsProduct/service/defaultElectronicsProductProjectionService @description Builds customer-safe Electronics additions for Commerce Product projections. @layer service @owner electronicsProduct */
module.exports = {
    /**
     * Executes `init` as a loader-visible operation owned by this module.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes `project` as a loader-visible operation owned by this module.
     * @param {*} profile Value defined by the owning module contract.
     * @param {*} warranty Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    project: function (profile, warranty) {
        if (!profile || profile.status !== 'ACTIVE') return {};
        return { electronics: { brandCode: profile.brandCode, modelNumber: profile.modelNumber, specificationFamilyCode: profile.specificationFamilyCode,
            specifications: profile.specifications || {}, compatibilityProfileCodes: profile.compatibilityProfileCodes || [],
            warranty: warranty && warranty.status === 'ACTIVE' ? { duration: warranty.duration, durationUnit: warranty.durationUnit, coverage: warranty.coverage || [] } : undefined } };
    }
};
