/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module electronicsProduct/service/defaultElectronicsProductValidationService @description Validates reusable electronics specification, compatibility, warranty, and identity invariants. @layer service @owner electronicsProduct */
module.exports = {
    /**
     * Executes `init` as a loader-visible operation owned by this module.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); },
    /**
     * Executes `policy` as a loader-visible operation owned by this module.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    policy: function () { return (global.CONFIG && CONFIG.get('electronicsProduct')) || { identifierTypes: ['SERIAL', 'IMEI', 'MEID', 'MAC'], warrantyUnits: ['DAY', 'MONTH', 'YEAR'] }; },
    /**
     * Executes `validateSpecification` as a loader-visible operation owned by this module.
     * @param {*} profile Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    validateSpecification: function (profile) {
        let errors = [];
        if (!profile || !profile.productCode || !profile.specificationFamilyCode) errors.push('ELECTRONICS_SPECIFICATION_IDENTITY_REQUIRED');
        if (!profile || !profile.specifications || Object.keys(profile.specifications).length === 0) errors.push('ELECTRONICS_SPECIFICATIONS_REQUIRED');
        return { valid: errors.length === 0, errors: errors };
    },
    /**
     * Executes `compatible` as a loader-visible operation owned by this module.
     * @param {*} required Value defined by the owning module contract.
     * @param {*} candidate Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    compatible: function (required, candidate) {
        let mismatches = Object.keys(required || {}).filter(key => ![].concat(candidate && candidate[key] || []).includes(required[key]));
        return { compatible: mismatches.length === 0, mismatches: mismatches };
    },
    /**
     * Executes `validateWarranty` as a loader-visible operation owned by this module.
     * @param {*} profile Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    validateWarranty: function (profile) {
        let valid = !!profile && Number(profile.duration) > 0 && this.policy().warrantyUnits.includes(profile.durationUnit) && (profile.coverage || []).length > 0;
        return { valid: valid, errors: valid ? [] : ['ELECTRONICS_WARRANTY_INVALID'] };
    },
    /**
     * Executes `validateIdentityPolicy` as a loader-visible operation owned by this module.
     * @param {*} profile Value defined by the owning module contract.
     * @returns {*} Result defined by the owning module contract.
     * @override Later-loaded modules may replace this member through the standard merge contract.
     */
    validateIdentityPolicy: function (profile) {
        let invalid = ((profile && profile.identifierTypes) || []).filter(type => !this.policy().identifierTypes.includes(type));
        return { valid: !!profile && profile.identifierTypes.length > 0 && invalid.length === 0, errors: invalid.map(type => 'ELECTRONICS_IDENTIFIER_UNSUPPORTED:' + type) };
    }
};
