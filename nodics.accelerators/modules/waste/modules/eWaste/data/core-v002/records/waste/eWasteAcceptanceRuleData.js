/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteAcceptanceRuleData @description Provides reusable e-waste type-level acceptance rule templates for nodics.waste. @layer data @owner eWaste */
const accept = (code, collectionPointType, categoryCode, options) => Object.assign({
    code,
    collectionPointType,
    categoryCode,
    decision: 'ACCEPT',
    requiresPreApproval: false,
    requiresReceipt: true,
    status: 'ACTIVE',
    revision: 1,
    active: true
}, options || {});

module.exports = {
    record0: accept('EWASTE_DROP_OFF_MOBILE_DEVICE', 'E_WASTE_DROP_OFF', 'MOBILE_DEVICE'),
    record1: accept('EWASTE_DROP_OFF_LAPTOP', 'E_WASTE_DROP_OFF', 'LAPTOP_COMPUTER'),
    record2: accept('EWASTE_DROP_OFF_TABLET', 'E_WASTE_DROP_OFF', 'TABLET'),
    record3: accept('EWASTE_DROP_OFF_CABLE_CHARGER', 'E_WASTE_DROP_OFF', 'CABLE_CHARGER'),
    record4: accept('EWASTE_BIN_SMALL_ACCESSORIES', 'E_WASTE_BIN', 'CABLE_CHARGER', { requiresReceipt: false }),
    record5: accept('EWASTE_INSPECTION_DEVICE', 'E_WASTE_INSPECTION_POINT', 'MOBILE_DEVICE', { requiresPreApproval: true }),
    record6: accept('EWASTE_PROCESSOR_MIXED', 'E_WASTE_PROCESSOR', 'MIXED_ELECTRONICS'),
    record7: {
        code: 'EWASTE_BIN_REJECT_LOOSE_BATTERY',
        collectionPointType: 'E_WASTE_BIN',
        categoryCode: 'LITHIUM_BATTERY',
        decision: 'REJECT',
        requiresPreApproval: true,
        requiresReceipt: true,
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
