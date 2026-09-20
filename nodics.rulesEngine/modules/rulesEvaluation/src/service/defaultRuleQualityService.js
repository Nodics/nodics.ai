/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesEvaluation/src/service/defaultRuleQualityService @description Compares normalized rule-input quality without understanding consumer-domain provenance semantics. @layer service @owner rulesEvaluation */
module.exports = {
    ranks: function () {
        return Object.freeze({
            UNAVAILABLE: 0,
            REFERENCE_DEFAULT: 1,
            AI_INFERRED: 2,
            AI_OBSERVED: 3,
            CUSTOMER_CONFIRMED: 4,
            OPERATOR_VERIFIED: 5,
            VERIFIED_MEASUREMENT: 6
        });
    },

    meets: function (actual, minimum) {
        if (!minimum) return true;
        let ranks = this.ranks();
        return Object.prototype.hasOwnProperty.call(ranks, actual) &&
            Object.prototype.hasOwnProperty.call(ranks, minimum) &&
            ranks[actual] >= ranks[minimum];
    },

    confidenceMeets: function (actual, minimum) {
        if (minimum === undefined || minimum === null || minimum === '') return true;
        let required = Number(minimum);
        let supplied = Number(actual);
        if (!Number.isFinite(required)) throw new Error('Rule minimum confidence must be numeric');
        return Number.isFinite(supplied) && supplied >= required;
    }
};
