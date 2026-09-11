/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteImpact/src/utils/enums @description Declares loader-compatible impact calculation policy enums. @layer utility @owner wasteImpact */
module.exports = {
    WasteEnvironmentalIndicatorStatus: { definition: ['NOT_ASSESSED', 'ILLUSTRATIVE', 'ESTIMATED', 'CONFIRMED', 'RECALCULATED', 'FAILED'] },
    WasteImpactFailureMode: { definition: ['ERROR', 'RESULT'] },
    WasteImpactRoundingMode: { definition: ['HALF_UP', 'FLOOR', 'CEIL'] },
    WasteImpactMissingWeightMode: { definition: ['ERROR', 'ESTIMATE_FROM_QUANTITY'] }
};
