/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteCategoryData @description Provides reusable e-waste category seed records for nodics.waste. @layer data @owner eWaste */
const category = (code, familyCode, name, itemTypeCodes, materialTypeCodes, options) => Object.assign({
    code,
    familyCode,
    name: { en: name },
    itemTypeCodes,
    materialTypeCodes,
    evidencePolicyCode: 'EWASTE_STANDARD_PHOTO',
    impactProfileCode: 'EWASTE_WEIGHT_ESTIMATE',
    hazardFlags: [],
    status: 'ACTIVE',
    revision: 1,
    active: true
}, options || {});

module.exports = {
    record0: category('MOBILE_DEVICE', 'ELECTRONICS', 'Mobile Device', ['MOBILE_PHONE', 'SMARTPHONE', 'FEATURE_PHONE'], ['LITHIUM_BATTERY', 'CIRCUIT_BOARD', 'PLASTIC_CASING', 'GLASS_SCREEN']),
    record1: category('LAPTOP_COMPUTER', 'ELECTRONICS', 'Laptop Computer', ['LAPTOP'], ['LITHIUM_BATTERY', 'CIRCUIT_BOARD', 'ALUMINUM', 'PLASTIC_CASING']),
    record2: category('TABLET', 'ELECTRONICS', 'Tablet', ['TABLET_DEVICE'], ['LITHIUM_BATTERY', 'CIRCUIT_BOARD', 'GLASS_SCREEN', 'PLASTIC_CASING']),
    record3: category('DESKTOP_COMPUTER', 'ELECTRONICS', 'Desktop Computer', ['DESKTOP_TOWER'], ['CIRCUIT_BOARD', 'COPPER', 'ALUMINUM', 'PLASTIC_CASING']),
    record4: category('MONITOR_DISPLAY', 'ELECTRONICS', 'Monitor Or Display', ['COMPUTER_MONITOR'], ['GLASS_SCREEN', 'CIRCUIT_BOARD', 'PLASTIC_CASING']),
    record5: category('CABLE_CHARGER', 'ELECTRONICS', 'Cable Or Charger', ['CHARGER', 'CABLE', 'EARPHONES'], ['COPPER', 'PLASTIC_CASING']),
    record6: category('SMALL_APPLIANCE', 'ELECTRONICS', 'Small Appliance', ['SMALL_HOME_APPLIANCE'], ['CIRCUIT_BOARD', 'COPPER', 'ALUMINUM', 'PLASTIC_CASING']),
    record7: category('LITHIUM_BATTERY', 'BATTERY', 'Lithium Battery', ['LOOSE_LITHIUM_BATTERY'], ['LITHIUM_BATTERY'], { evidencePolicyCode: 'EWASTE_BATTERY_PHOTO', impactProfileCode: 'EWASTE_BATTERY_COUNT', hazardFlags: ['BATTERY_HANDLING'] }),
    record8: category('POWER_BANK', 'BATTERY', 'Power Bank', ['POWER_BANK_DEVICE'], ['LITHIUM_BATTERY', 'CIRCUIT_BOARD', 'PLASTIC_CASING'], { evidencePolicyCode: 'EWASTE_BATTERY_PHOTO', impactProfileCode: 'EWASTE_BATTERY_COUNT', hazardFlags: ['BATTERY_HANDLING'] }),
    record9: category('MIXED_ELECTRONICS', 'ELECTRONICS', 'Mixed Electronics', ['UNKNOWN_ELECTRONIC_ITEM'], ['MIXED_ELECTRONIC_MATERIAL'], { evidencePolicyCode: 'EWASTE_STANDARD_PHOTO', impactProfileCode: 'EWASTE_ITEM_COUNT' })
};
