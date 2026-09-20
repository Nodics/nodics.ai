/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module rulesEvaluation/src/utils/enums @description Stable generic evaluation enums. @layer utility @owner rulesEvaluation */
module.exports = {
    INPUT_QUALITY: Object.freeze({
        VERIFIED_MEASUREMENT: 'VERIFIED_MEASUREMENT',
        OPERATOR_VERIFIED: 'OPERATOR_VERIFIED',
        CUSTOMER_CONFIRMED: 'CUSTOMER_CONFIRMED',
        AI_OBSERVED: 'AI_OBSERVED',
        AI_INFERRED: 'AI_INFERRED',
        REFERENCE_DEFAULT: 'REFERENCE_DEFAULT',
        UNAVAILABLE: 'UNAVAILABLE'
    })
};
