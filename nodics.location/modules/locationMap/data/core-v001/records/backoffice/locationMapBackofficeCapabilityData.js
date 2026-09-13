/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/data/core-v001/records/backoffice/locationMapBackofficeCapabilityData @description Location Map Axis capability and navigation metadata linked through active module registration. @layer data @owner locationMap */
module.exports = {
    capability: {
        capabilityId: 'location-map',
        displayName: 'Location Map',
        category: 'operations',
        icon: 'location',
        requiredPermissions: ['system.schema.view'],
        discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal' }
    },
    defaults: {
        icon: 'location',
        permission: 'system.schema.view',
        group: { id: 'system-configuration', label: 'System Configuration', order: 90 },
        perspectives: ['configuration', 'operations', 'business'],
        contexts: ['environment', 'tenant'],
        featureState: 'ACTIVE',
        presentation: {
            defaultColumns: ['code', 'providerCode', 'surfaceCode', 'usageCode', 'setupStatus', 'status'],
            hiddenFields: ['correlationId', 'idempotencyKey', 'metadata'],
            forbiddenFields: ['tenant', 'tenantCode', 'secretAccessToken', 'privateKey', 'clientSecret', 'serverToken']
        }
    },
    navigation: [{
        id: 'location-map',
        label: 'Map Configuration',
        route: '/location/maps',
        moduleName: 'locationMap',
        schemaName: 'locationMapProviderConfiguration',
        order: 1050,
        summary: 'Configure reusable map providers, surfaces, usages, default viewport, controls, and setup state for Location consumers.',
        presentation: { defaultColumns: ['code', 'providerCode', 'surfaceCode', 'usageCode', 'setupStatus', 'status', 'revision'] }
    }, {
        id: 'location-map-providers',
        parentId: 'location-map',
        label: 'Providers',
        route: '/location/maps/providers',
        moduleName: 'locationMap',
        schemaName: 'locationMapProvider',
        order: 1051,
        summary: 'Review supported frontend map providers and their token safety expectations.',
        presentation: { defaultColumns: ['code', 'providerType', 'requiresPublicAccessToken', 'frontendSafeTokenPrefix', 'status'] }
    }, {
        id: 'location-map-usages',
        parentId: 'location-map',
        label: 'Usage Codes',
        route: '/location/maps/usages',
        moduleName: 'locationMap',
        schemaName: 'locationMapUsage',
        order: 1052,
        summary: 'Review reusable map usage codes such as collection centres, store locator, and near-me journeys.',
        presentation: { defaultColumns: ['code', 'surfaceCodes', 'status', 'revision'] }
    }, {
        id: 'location-map-styles',
        parentId: 'location-map',
        label: 'Style Presets',
        route: '/location/maps/styles',
        moduleName: 'locationMap',
        schemaName: 'locationMapStylePreset',
        order: 1053,
        summary: 'Review provider style presets such as Mapbox Streets for Axis and customer applications.',
        presentation: { defaultColumns: ['code', 'providerCode', 'styleUrl', 'status', 'revision'] }
    }, {
        id: 'location-map-controls',
        parentId: 'location-map',
        label: 'Control Presets',
        route: '/location/maps/controls',
        moduleName: 'locationMap',
        schemaName: 'locationMapControlPreset',
        order: 1054,
        summary: 'Review reusable map control presets for zoom, scale, geolocation, and directions.',
        presentation: { defaultColumns: ['code', 'enabledControls', 'status', 'revision'] }
    }]
};
