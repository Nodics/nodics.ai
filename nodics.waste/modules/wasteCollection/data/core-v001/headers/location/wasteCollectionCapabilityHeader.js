/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/data/core-v001/headers/location/wasteCollectionCapabilityHeader @description Imports reusable location vocabulary. @layer data-header @owner wasteCollection */
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
        wasteCollectionCapabilityData: entry('locationType', 'locationCapability', 'wasteCollectionCapabilityData')
    }
};
