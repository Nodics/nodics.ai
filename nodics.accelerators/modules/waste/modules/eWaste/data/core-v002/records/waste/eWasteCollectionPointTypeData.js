/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteCollectionPointTypeData @description Provides reusable e-waste collection point type seed records for nodics.waste. @layer data @owner eWaste */
const type = (code, name, baseLocationCategory, capabilities, options) => Object.assign({
    code,
    name: { en: name },
    baseLocationCategory,
    capabilities,
    defaultReceiptPolicyCode: 'EWASTE_STANDARD_RECEIPT',
    defaultVerificationPolicyCode: 'EWASTE_STANDARD_VERIFICATION',
    status: 'ACTIVE',
    revision: 1,
    active: true
}, options || {});

module.exports = {
    record0: type('E_WASTE_DROP_OFF', 'E-Waste Drop-Off', 'COLLECTION_POINT', ['DROP_OFF', 'RECEIPT']),
    record1: type('E_WASTE_BIN', 'E-Waste Bin', 'COLLECTION_POINT', ['DROP_OFF'], { defaultReceiptPolicyCode: 'EWASTE_ASSUMED_RECEIPT' }),
    record2: type('E_WASTE_INSPECTION_POINT', 'E-Waste Inspection Point', 'SERVICE_CENTER', ['DROP_OFF', 'INSPECTION', 'RECEIPT']),
    record3: type('E_WASTE_AGGREGATION_WAREHOUSE', 'E-Waste Aggregation Warehouse', 'WAREHOUSE', ['RECEIPT', 'AGGREGATION', 'TRANSFER']),
    record4: type('E_WASTE_PROCESSOR', 'E-Waste Processor', 'WAREHOUSE', ['PROCESSING', 'RECYCLER_RECEIPT'])
};
