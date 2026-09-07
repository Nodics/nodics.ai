/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/data/sample-v001/headers/waste/sampleCollectionCentrePointHeader @description Imports demo collection-centre records into the Waste Collection authority. @layer data-header @owner wasteCollection */
const entry = (schemaName, dataFilePrefix) => ({
    options: {
        enabled: true,
        moduleName: 'wasteCollection',
        schemaName,
        operation: 'saveAll',
        tenants: ['default'],
        dataFilePrefix,
        userGroups: ['adminGroup']
    },
    query: { code: '$code' }
});

module.exports = {
    wasteCollection: {
        sampleCollectionCentrePointTypeData: entry('wasteCollectionPointType', 'sampleCollectionCentrePointTypeData'),
        sampleCollectionCentrePointData: entry('wasteCollectionPoint', 'sampleCollectionCentrePointData')
    }
};
