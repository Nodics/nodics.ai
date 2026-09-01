/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteCollectionPresetData @description Provides reusable e-waste collection preset records for nodics.waste. @layer data @owner eWaste */
const preset = (code, name, collectionPointType, operatingMode, options) => Object.assign({
    code,
    name: { en: name },
    collectionPointType,
    operatingMode,
    receiptPolicyCode: 'EWASTE_STANDARD_RECEIPT',
    verificationPolicyCode: 'EWASTE_STANDARD_VERIFICATION',
    evidencePolicyCode: 'EWASTE_STANDARD_PHOTO',
    impactProfileCode: 'EWASTE_WEIGHT_ESTIMATE',
    acceptanceRuleCodes: [],
    serviceCapabilities: [],
    status: 'ACTIVE',
    revision: 1,
    active: true
}, options || {});

module.exports = {
    record0: preset('EWASTE_DROP_OFF_STANDARD', 'E-Waste Standard Drop-Off', 'E_WASTE_DROP_OFF', 'DROP_OFF', {
        acceptanceRuleCodes: ['EWASTE_DROP_OFF_MOBILE_DEVICE', 'EWASTE_DROP_OFF_LAPTOP', 'EWASTE_DROP_OFF_TABLET', 'EWASTE_DROP_OFF_CABLE_CHARGER'],
        serviceCapabilities: ['DROP_OFF', 'RECEIPT']
    }),
    record1: preset('EWASTE_BIN_ACCESSORY_ONLY', 'E-Waste Accessory Bin', 'E_WASTE_BIN', 'BIN', {
        receiptPolicyCode: 'EWASTE_ASSUMED_RECEIPT',
        acceptanceRuleCodes: ['EWASTE_BIN_SMALL_ACCESSORIES', 'EWASTE_BIN_REJECT_LOOSE_BATTERY'],
        serviceCapabilities: ['DROP_OFF']
    }),
    record2: preset('EWASTE_INSPECTION_STANDARD', 'E-Waste Inspection Point', 'E_WASTE_INSPECTION_POINT', 'INSPECTION', {
        acceptanceRuleCodes: ['EWASTE_INSPECTION_DEVICE'],
        serviceCapabilities: ['DROP_OFF', 'INSPECTION', 'RECEIPT']
    }),
    record3: preset('EWASTE_PROCESSOR_STANDARD', 'E-Waste Processor', 'E_WASTE_PROCESSOR', 'PROCESSING', {
        acceptanceRuleCodes: ['EWASTE_PROCESSOR_MIXED'],
        serviceCapabilities: ['PROCESSING', 'RECYCLER_RECEIPT']
    })
};
