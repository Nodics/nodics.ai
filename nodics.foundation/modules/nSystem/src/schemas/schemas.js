/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nSystem/src/schemas/schemas
 * @description Defines nSystem schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner nSystem
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    system: {
        configuration: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            event: {
                enabled: true,
                type: 'SYNC'
            },
            router: { groups: { schemaOperations: true },
                enabled: true
            },
            definition: {
                config: {
                    type: 'string',
                    required: false,
                    description: 'Mandate configuration'
                }
            }
        },

        eventListener: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            event: {
                enabled: true,
                type: 'SYNC'
            },
            tenants: ['default'],
            router: {
                enabled: true
            },
            definition: {
                event: {
                    type: 'string',
                    required: false,
                    description: 'Mandate event name'
                },
                listener: {
                    type: 'string',
                    required: true,
                    description: 'Mandate listener handler'
                },
                moduleName: {
                    type: 'string',
                    required: true,
                    description: 'Mandate moduleName, could be common as well'
                }
            }
        },

        interceptor: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            event: {
                enabled: true,
                type: 'SYNC'
            },
            tenants: ['default'],
            router: {
                enabled: true
            },
            definition: {
                type: {
                    enum: [ENUMS.InterceptorType.schema.key, ENUMS.InterceptorType.import.key, ENUMS.InterceptorType.export.key, ENUMS.InterceptorType.search.key, ENUMS.InterceptorType.workflow.key, ENUMS.InterceptorType.job.key],
                    required: true,
                    description: 'Required value could be only in [schema, import, export, search, workflow, job]'
                },
                item: {
                    type: 'string',
                    required: false,
                    description: 'For which item it belongs, if blank, will be applied for all validators'
                },
                trigger: {
                    type: 'string',
                    required: true,
                    description: 'Mandate trigger name like, preSave, postSave'
                },
                index: {
                    type: 'int',
                    required: true,
                    description: 'Mandate sequence where it needs to be applied'
                },
                handler: {
                    type: 'string',
                    required: false,
                    description: 'If business logic is defined in service class'
                },
                script: {
                    type: 'string',
                    required: false,
                    description: 'Define execution script to be evaluated'
                }
            }
        }
    }
};

// Model-purpose presentation belongs to this schema owner; it grants no operations.
module.exports.system.configuration.backoffice = Object.assign({ description: "Runtime configuration records. Applying a change requires the configuration owner and its activation policy." }, module.exports.system.configuration.backoffice);
module.exports.system.eventListener.backoffice = Object.assign({ description: "Event-listener registrations for this runtime. Definitions do not prove a listener is active or an event was delivered." }, module.exports.system.eventListener.backoffice);
module.exports.system.interceptor.backoffice = Object.assign({ description: "Interceptor definitions used by this runtime to validate or enrich operations." }, module.exports.system.interceptor.backoffice);
