/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteImpactMetricData @description Provides reusable non-certified e-waste impact metric records for nodics.waste. @layer data @owner eWaste */
module.exports = {
    record0: { code: 'EWASTE_ITEM_COUNT', name: { en: 'E-Waste Item Count' }, unitOfMeasure: 'EACH', publicClaimAllowed: false, status: 'ACTIVE', revision: 1, active: true },
    record1: { code: 'EWASTE_WEIGHT_KG', name: { en: 'E-Waste Weight' }, unitOfMeasure: 'KG', publicClaimAllowed: false, status: 'ACTIVE', revision: 1, active: true },
    record2: { code: 'BATTERY_ITEM_COUNT', name: { en: 'Battery Item Count' }, unitOfMeasure: 'EACH', publicClaimAllowed: false, status: 'ACTIVE', revision: 1, active: true },
    record3: { code: 'DIVERTED_FROM_LANDFILL_KG', name: { en: 'Diverted From Landfill' }, unitOfMeasure: 'KG', publicClaimAllowed: false, status: 'ACTIVE', revision: 1, active: true },
    record4: { code: 'RECOVERABLE_MATERIAL_ESTIMATE_KG', name: { en: 'Recoverable Material Estimate' }, unitOfMeasure: 'KG', publicClaimAllowed: false, status: 'ACTIVE', revision: 1, active: true }
};
