/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/data/init/headers/enterprise/defaultEnterpriseHeader
 * @description Provides profile initializer or sample data consumed by the import layer.
 * @layer data
 * @owner profile
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    profile: {
        defaultTenants: {
            options: {
                enabled: true,
                schemaName: 'tenant', //put type name, if want to push data into search
                operation: 'saveAll', //saveAll, update and saveOrUpdate, put doSave, if data needs to be pushed into serach
                tenants: ['default'],
                dataFilePrefix: 'defaultTenantsData'
            },
            query: {
                //addresses.code: '$code'
                code: '$code',
                /*jobDetail.name: '$name'
                name: 'Himkar Dwivedi'*/
            }
        },
        defaultEnterprise: {
            options: {
                enabled: true,
                schemaName: 'enterprise',
                operation: 'saveAll', //saveAll, update and saveOrUpdate
                tenants: ['default'],
                dataFilePrefix: 'defaultEnterpriseData'
            },
            query: {
                code: '$code'
            },
            macros: {
                tenant: {
                    options: {
                        model: 'tenant',
                        returnProperty: 'code'
                    },
                    rule: {
                        code: {
                            type: 'string',
                            index: 0,
                        },
                        active: {
                            type: 'bool',
                            index: 1
                        }
                    }
                },
                addresses: {
                    options: {
                        model: 'address',
                        returnProperty: 'code'
                    },
                    rule: {
                        code: {
                            type: 'string',
                            index: 0
                        }
                    }
                },
                contacts: {
                    options: {
                        model: 'contact',
                        returnProperty: 'code'
                    },
                    rule: {
                        code: {
                            type: 'string',
                            index: 0
                        }
                    }
                }
            }
        }
    }
};
