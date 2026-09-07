/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/data/core-v001/headers/location/locationMapConfigurationHeader @description Imports Location Map provider, usage, style, and control reference metadata. @layer data-header @owner locationMap */
const entry = (schemaName, dataFilePrefix) => ({
    options: {
        enabled: true,
        moduleName: 'locationMap',
        schemaName,
        operation: 'saveAll',
        tenants: ['default'],
        dataFilePrefix,
        userGroups: ['adminGroup']
    },
    query: { code: '$code' }
});

module.exports = {
    locationMap: {
        locationMapProviderData: entry('locationMapProvider', 'locationMapProviderData'),
        locationMapUsageData: entry('locationMapUsage', 'locationMapUsageData'),
        locationMapStylePresetData: entry('locationMapStylePreset', 'locationMapStylePresetData'),
        locationMapControlPresetData: entry('locationMapControlPreset', 'locationMapControlPresetData')
    }
};
