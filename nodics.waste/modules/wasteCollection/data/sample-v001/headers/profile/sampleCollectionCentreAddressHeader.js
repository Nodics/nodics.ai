/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/data/sample-v001/headers/profile/sampleCollectionCentreAddressHeader @description Imports demo collection-centre addresses into the Profile address authority. @layer data-header @owner wasteCollection */
module.exports = {
    profile: {
        sampleCollectionCentreAddressData: {
            options: {
                enabled: true,
                moduleName: 'profile',
                schemaName: 'address',
                operation: 'saveAll',
                tenants: ['default'],
                dataFilePrefix: 'sampleCollectionCentreAddressData',
                userGroups: ['adminGroup']
            },
            query: {
                code: '$code'
            }
        }
    }
};
