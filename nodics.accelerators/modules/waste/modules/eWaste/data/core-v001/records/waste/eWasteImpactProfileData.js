/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteImpactProfileData @description Provides reusable non-certified e-waste impact profile records for nodics.waste. @layer data @owner eWaste */
module.exports = {
    record0: {
        code: 'EWASTE_ITEM_COUNT',
        name: { en: 'E-Waste Item Count' },
        formulaType: 'QUANTITY_FACTOR',
        metricRules: [{ metricCode: 'EWASTE_ITEM_COUNT', factor: 1, unitOfMeasure: 'EACH' }],
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record1: {
        code: 'EWASTE_WEIGHT_ESTIMATE',
        name: { en: 'E-Waste Weight Estimate' },
        formulaType: 'WEIGHT_FACTOR',
        metricRules: [
            { metricCode: 'EWASTE_WEIGHT_KG', factor: 1, unitOfMeasure: 'KG' },
            { metricCode: 'DIVERTED_FROM_LANDFILL_KG', factor: 1, unitOfMeasure: 'KG' }
        ],
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record2: {
        code: 'EWASTE_BATTERY_COUNT',
        name: { en: 'E-Waste Battery Count' },
        formulaType: 'QUANTITY_FACTOR',
        metricRules: [{ metricCode: 'BATTERY_ITEM_COUNT', factor: 1, unitOfMeasure: 'EACH' }],
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
