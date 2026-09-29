/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteMaterialTypeData @description Provides reusable e-waste material seed records for nodics.waste. @layer data @owner eWaste */
const material = (code, familyCode, name, unitOfMeasure, hazardClass) => ({
    code,
    ...(['COPPER', 'ALUMINUM', 'CIRCUIT_BOARD'].includes(code) ? {} : { familyCode }),
    materialKind: ['CIRCUIT_BOARD', 'LITHIUM_BATTERY'].includes(code) ? 'COMPONENT' : code === 'MIXED_ELECTRONIC_MATERIAL' ? 'MIXTURE' : 'MATERIAL',
    name: { en: name },
    hazardClass,
    unitOfMeasure,
    status: 'ACTIVE',
    revision: 1,
    active: true
});

module.exports = {
    record0: material('LITHIUM_BATTERY', 'BATTERY', 'Lithium Battery', 'EACH', 'BATTERY_HANDLING'),
    record1: material('CIRCUIT_BOARD', 'ELECTRONICS', 'Circuit Board', 'KG'),
    record2: material('COPPER', 'ELECTRONICS', 'Copper', 'KG'),
    record3: material('ALUMINUM', 'ELECTRONICS', 'Aluminum', 'KG'),
    record4: material('PLASTIC_CASING', 'ELECTRONICS', 'Plastic Casing', 'KG'),
    record5: material('GLASS_SCREEN', 'ELECTRONICS', 'Glass Screen', 'KG'),
    record6: material('MIXED_ELECTRONIC_MATERIAL', 'ELECTRONICS', 'Mixed Electronic Material', 'KG')
};
