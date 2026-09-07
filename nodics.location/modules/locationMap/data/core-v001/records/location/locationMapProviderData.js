/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/data/core-v001/records/location/locationMapProviderData @description Framework map provider metadata without customer credentials. @layer data @owner locationMap */
module.exports = {
    record0: {
        code: 'MAPBOX',
        name: { en: 'Mapbox' },
        providerType: 'MAPBOX',
        rendererCode: 'axis.location.mapbox',
        rendererType: 'MAPBOX_GL',
        requiresPublicAccessToken: true,
        frontendSafeTokenPrefix: 'pk.',
        endpointPolicy: {
            connectSrc: ['https://api.mapbox.com', 'https://events.mapbox.com'],
            imgSrc: ['https://api.mapbox.com', 'https://*.tiles.mapbox.com']
        },
        status: 'ACTIVE',
        revision: 1
    },
    record1: {
        code: 'OSM',
        name: { en: 'OpenStreetMap' },
        providerType: 'OSM',
        rendererCode: 'axis.location.tile',
        rendererType: 'XYZ_TILE',
        requiresPublicAccessToken: false,
        endpointPolicy: {
            imgSrc: ['https://a.tile.openstreetmap.fr']
        },
        status: 'ACTIVE',
        revision: 1
    }
};
