/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/data/core-v001/records/location/locationMapControlPresetData @description Reusable frontend map control presets. @layer data @owner locationMap */
module.exports = {
    record0: {
        code: 'STANDARD_INTERACTIVE',
        name: { en: 'Standard Interactive Map Controls' },
        enabledControls: ['FILTERS', 'ZOOM', 'SCALE', 'GEOLOCATE', 'DIRECTIONS'],
        status: 'ACTIVE',
        revision: 1
    },
    record1: {
        code: 'COMPACT_CUSTOMER',
        name: { en: 'Compact Customer Map Controls' },
        enabledControls: ['ZOOM', 'GEOLOCATE', 'DIRECTIONS'],
        status: 'ACTIVE',
        revision: 1
    }
};
