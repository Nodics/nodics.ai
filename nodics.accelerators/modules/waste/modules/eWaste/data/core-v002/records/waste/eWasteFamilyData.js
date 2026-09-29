/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteFamilyData @description Provides reusable e-waste family seed records for nodics.waste. @layer data @owner eWaste */
module.exports = {
    record0: {
        code: 'ELECTRONICS',
        name: { en: 'Electronics' },
        description: { en: 'Electronic devices, components, and accessories intended for reuse, repair, recovery, or recycling.' },
        defaultIconCode: 'cpu',
        complianceProfileCode: 'EWASTE_STANDARD',
        status: 'ACTIVE',
        sortOrder: 10,
        revision: 1,
        active: true
    },
    record1: {
        code: 'BATTERY',
        name: { en: 'Battery' },
        description: { en: 'Loose batteries, power banks, and battery-bearing items requiring careful handling.' },
        defaultIconCode: 'battery',
        complianceProfileCode: 'EWASTE_BATTERY_HANDLING',
        status: 'ACTIVE',
        sortOrder: 20,
        revision: 1,
        active: true
    }
};
