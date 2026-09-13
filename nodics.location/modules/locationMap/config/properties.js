/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module locationMap/config/properties
 * @description Defines generated configurable defaults for locationMap.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    // Inert inventory; an allowed local server must explicitly select this capability.
    localResetProvider: {
        "contributions": {
            "locationMap": {
                "serviceNames": {
                    "DefaultLocationMapControlPresetService": true,
                    "DefaultLocationMapLayerService": true,
                    "DefaultLocationMapProviderConfigurationService": true,
                    "DefaultLocationMapProviderService": true,
                    "DefaultLocationMapStylePresetService": true,
                    "DefaultLocationMapUsageService": true
                }
            }
        }
    },

    locationMapConfiguration: {
        refreshIntervalMs: 15000,
        providerAttributions: { MAPBOX: '© Mapbox · © OpenStreetMap contributors', OSM: '© OpenStreetMap contributors · Tiles: OpenStreetMap France' },
        publicUsageCodes: ['COLLECTION_CENTRE_MAP'],
        presentation: {
            defaultCategoryCode: 'recycling',
            categories: [
                { code: 'repair', label: 'Repair', color: '#4CAF50', matchTerms: ['repair'] },
                { code: 'trade-in', label: 'Trade-in', color: '#2196F3', matchTerms: ['trade'] },
                { code: 'recycling', label: 'Recycling', color: '#ee9a08', matchTerms: ['recycling', 'collection'] }
            ]
        },
        interaction: { wheelZoomMode: 'MODIFIER', wheelStep: 1, wheelCooldownMs: 180, zoomAnimationSeconds: 0.42 }
    },
    schemaPolicies: { locationMap: { operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } } } }
};
