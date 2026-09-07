/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/data/init-v001/records/location/defaultLocationMapProviderConfigurationData @description Provides default startup Location Map provider configuration records for Axis map consumers. @layer data @owner locationMap @override Projects may override or extend these initializer records through layered import data rather than editing framework defaults. */
module.exports = {
    record0: {
        active: true,
        code: 'AXIS_COLLECTION_CENTRE_MAPBOX_STREETS',
        name: { en: 'Axis Collection Centre Mapbox Streets' },
        providerCode: 'MAPBOX',
        surfaceCode: 'AXIS',
        usageCode: 'COLLECTION_CENTRE_MAP',
        stylePresetCode: 'MAPBOX_STREETS',
        styleUrl: 'mapbox://styles/mapbox/streets-v12',
        publicAccessToken: '',
        tokenReference: '',
        fallbackProviderCode: 'OSM',
        fallbackPolicy: 'ALLOW_BASIC_MAP',
        defaultCenterLatitude: 25.2048,
        defaultCenterLongitude: 55.2708,
        defaultZoom: 9,
        minimumZoom: 3,
        maximumZoom: 18,
        controlPresetCode: 'STANDARD_INTERACTIVE',
        enabledControls: ['FILTERS', 'ZOOM', 'SCALE', 'GEOLOCATE', 'DIRECTIONS'],
        frontendSafe: true,
        setupStatus: 'SETUP_REQUIRED',
        status: 'ACTIVE',
        revision: 1,
        created: new Date('2026-09-07T00:00:00.000Z'),
        updated: new Date('2026-09-07T00:00:00.000Z'),
        metadata: {
            setupHint: 'Provide a project or environment Mapbox public token before activating this provider configuration.'
        }
    },
    record1: {
        active: true,
        code: 'AXIS_COLLECTION_CENTRE_OSM_HOT',
        name: { en: 'Axis Collection Centre OpenStreetMap Humanitarian' },
        providerCode: 'OSM',
        surfaceCode: 'AXIS',
        usageCode: 'COLLECTION_CENTRE_MAP',
        stylePresetCode: 'OSM_HOT',
        styleUrl: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        publicAccessToken: '',
        tokenReference: '',
        fallbackProviderCode: '',
        fallbackPolicy: 'ALLOW_BASIC_MAP',
        defaultCenterLatitude: 25.2048,
        defaultCenterLongitude: 55.2708,
        defaultZoom: 9,
        minimumZoom: 3,
        maximumZoom: 18,
        controlPresetCode: 'STANDARD_INTERACTIVE',
        enabledControls: ['FILTERS', 'ZOOM', 'SCALE', 'GEOLOCATE', 'DIRECTIONS'],
        frontendSafe: true,
        setupStatus: 'ACTIVE',
        status: 'ACTIVE',
        revision: 1,
        created: new Date('2026-09-07T00:00:00.000Z'),
        updated: new Date('2026-09-07T00:00:00.000Z'),
        metadata: {
            setupHint: 'Default OSM configuration provides a frontend-safe fallback when Mapbox is disabled or unavailable.'
        }
    }
};
