/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/data/init-v001/headers/address/defaultContactsHeader
 * @description Seeds only missing Profile identities and references; later imports preserve installed authority.
 * @layer data
 * @owner profile
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    profile: {
        defaultContacts: {
            options: {
                enabled: true,
                schemaName: 'contact',
                operation: 'ensureBootstrapAll', // First-install only; existing records remain authoritative.
                tenants: ['default'],
                dataFilePrefix: 'defaultContactsData',
                userGroups: ['adminGroup']
            },
            query: {
                code: '$code'
            }
        },

        defaultTenantContacts: {
            options: {
                enabled: true,
                schemaName: 'contact',
                operation: 'ensureBootstrapAll', // First-install only; existing records remain authoritative.
                dataFilePrefix: 'defaultTenantContactsData',
                userGroups: ['adminGroup']
            },
            query: {
                code: '$code'
            }
        }
    }
};
