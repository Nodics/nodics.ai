/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/data/init-v001/headers/location/defaultLocationMapProviderConfigurationHeader @description Imports startup Location Map provider configurations for Axis map consumers. @layer data-header @owner locationMap @override Projects may override or extend these initializer records through layered import data rather than editing framework defaults. */
module.exports = {
    locationMap: {
        defaultLocationMapProviderConfigurationData: {
            options: {
                enabled: true,
                moduleName: 'locationMap',
                schemaName: 'locationMapProviderConfiguration',
                operation: 'saveAll',
                tenants: ['default'],
                dataFilePrefix: 'defaultLocationMapProviderConfigurationData',
                userGroups: ['adminGroup']
            },
            query: { code: '$code' }
        }
    }
};
