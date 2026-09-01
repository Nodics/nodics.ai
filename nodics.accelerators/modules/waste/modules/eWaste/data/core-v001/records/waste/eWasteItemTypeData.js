/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteItemTypeData @description Provides reusable e-waste item type seed records for nodics.waste. @layer data @owner eWaste */
const item = (code, categoryCode, name, options) => Object.assign({
    code,
    categoryCode,
    name: { en: name },
    requiresBrand: false,
    requiresModel: false,
    requiresSerial: false,
    requiresWeight: false,
    requiresQuantity: true,
    allowedConditionGrades: ['WORKING', 'REUSABLE', 'REPAIRABLE', 'PARTS_ONLY', 'RECYCLABLE', 'DAMAGED', 'HAZARDOUS', 'UNKNOWN'],
    evidencePolicyCode: 'EWASTE_STANDARD_PHOTO',
    impactProfileCode: 'EWASTE_ITEM_COUNT',
    status: 'ACTIVE',
    revision: 1,
    active: true
}, options || {});

module.exports = {
    record0: item('MOBILE_PHONE', 'MOBILE_DEVICE', 'Mobile Phone', { requiresBrand: true, requiresModel: true }),
    record1: item('SMARTPHONE', 'MOBILE_DEVICE', 'Smartphone', { requiresBrand: true, requiresModel: true }),
    record2: item('FEATURE_PHONE', 'MOBILE_DEVICE', 'Feature Phone', { requiresBrand: true }),
    record3: item('LAPTOP', 'LAPTOP_COMPUTER', 'Laptop', { requiresBrand: true, requiresModel: true, requiresWeight: true }),
    record4: item('TABLET_DEVICE', 'TABLET', 'Tablet Device', { requiresBrand: true, requiresModel: true }),
    record5: item('DESKTOP_TOWER', 'DESKTOP_COMPUTER', 'Desktop Tower', { requiresBrand: true, requiresWeight: true }),
    record6: item('COMPUTER_MONITOR', 'MONITOR_DISPLAY', 'Computer Monitor', { requiresBrand: true, requiresWeight: true }),
    record7: item('CHARGER', 'CABLE_CHARGER', 'Charger'),
    record8: item('CABLE', 'CABLE_CHARGER', 'Cable'),
    record9: item('EARPHONES', 'CABLE_CHARGER', 'Earphones'),
    record10: item('POWER_BANK_DEVICE', 'POWER_BANK', 'Power Bank Device', { evidencePolicyCode: 'EWASTE_BATTERY_PHOTO', impactProfileCode: 'EWASTE_BATTERY_COUNT' }),
    record11: item('LOOSE_LITHIUM_BATTERY', 'LITHIUM_BATTERY', 'Loose Lithium Battery', { evidencePolicyCode: 'EWASTE_BATTERY_PHOTO', impactProfileCode: 'EWASTE_BATTERY_COUNT', allowedConditionGrades: ['DAMAGED', 'HAZARDOUS', 'UNKNOWN', 'RECYCLABLE'] }),
    record12: item('SMALL_HOME_APPLIANCE', 'SMALL_APPLIANCE', 'Small Home Appliance', { requiresWeight: true }),
    record13: item('UNKNOWN_ELECTRONIC_ITEM', 'MIXED_ELECTRONICS', 'Unknown Electronic Item', { evidencePolicyCode: 'EWASTE_STANDARD_PHOTO' })
};
