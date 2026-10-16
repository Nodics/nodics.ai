/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/data/init-v001/headers/address/defaultAddressesHeader
 * @description Seeds only missing Profile identities and references; later imports preserve installed authority.
 * @layer data
 * @owner profile
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    profile: {
        defaultAddresses: {
            options: {
                enabled: true,
                schemaName: 'address',
                operation: 'ensureBootstrapAll', //save, update and saveOrUpdate
                tenants: ['default'],
                dataFilePrefix: 'defaultAddressesData',
                userGroups: ['adminGroup']
            },
            query: {
                code: '$code'
            }
        },

        defaultTenantAddresses: {
            options: {
                enabled: true,
                schemaName: 'address',
                operation: 'ensureBootstrapAll', //save, update and saveOrUpdate
                dataFilePrefix: 'defaultTenantAddressesData',
                userGroups: ['adminGroup']
            },
            query: {
                code: '$code'
            }
        }
    }
};
