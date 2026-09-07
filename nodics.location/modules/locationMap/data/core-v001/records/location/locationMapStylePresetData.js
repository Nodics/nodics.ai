/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/data/core-v001/records/location/locationMapStylePresetData @description Reusable Location Map style presets. @layer data @owner locationMap */
module.exports = {
    record0: {
        code: 'MAPBOX_STREETS',
        providerCode: 'MAPBOX',
        name: { en: 'Mapbox Streets' },
        styleUrl: 'mapbox://styles/mapbox/streets-v12',
        attribution: 'Mapbox, OpenStreetMap contributors',
        status: 'ACTIVE',
        revision: 1
    },
    record1: {
        code: 'OSM_HOT',
        providerCode: 'OSM',
        name: { en: 'OpenStreetMap Humanitarian' },
        styleUrl: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        attribution: 'OpenStreetMap France, contributors',
        status: 'ACTIVE',
        revision: 1
    }
};
