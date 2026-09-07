/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/data/sample-v001/headers/location/sampleCollectionCentreLocationHeader @description Imports demo collection-centre map locations into the Location authority. @layer data-header @owner wasteCollection */
const entry = (moduleName, schemaName, dataFilePrefix) => ({
    options: {
        enabled: true,
        moduleName,
        schemaName,
        operation: 'saveAll',
        tenants: ['default'],
        dataFilePrefix,
        userGroups: ['adminGroup']
    },
    query: { code: '$code' }
});

module.exports = {
    locationType: {
        sampleCollectionCentreLocationCategoryData: entry('locationType', 'locationCategory', 'sampleCollectionCentreLocationCategoryData'),
        sampleCollectionCentreLocationCapabilityData: entry('locationType', 'locationCapability', 'sampleCollectionCentreLocationCapabilityData'),
        sampleCollectionCentreLocationTypeData: entry('locationType', 'locationType', 'sampleCollectionCentreLocationTypeData')
    },
    locationCore: {
        sampleCollectionCentreLocationData: entry('locationCore', 'location', 'sampleCollectionCentreLocationData')
    }
};
