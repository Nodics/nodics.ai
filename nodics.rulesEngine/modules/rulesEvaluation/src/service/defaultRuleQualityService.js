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

    normalizeConfidence: function (value) {
        if (value === undefined || value === null || value === '') return undefined;
        let normalized = Number(value);
        if (!Number.isFinite(normalized)) return undefined;
        if (normalized > 1 && normalized <= 100) normalized = normalized / 100;
        return normalized >= 0 && normalized <= 1 ? normalized : undefined;
    },

    confidenceMeets: function (actual, minimum) {
        if (minimum === undefined || minimum === null || minimum === '') return true;
        let required = this.normalizeConfidence(minimum);
        let supplied = this.normalizeConfidence(actual);
        if (required === undefined) throw new Error('Rule minimum confidence must be between 0 and 1, or a percentage up to 100');
        return supplied !== undefined && supplied >= required;
    }
};
