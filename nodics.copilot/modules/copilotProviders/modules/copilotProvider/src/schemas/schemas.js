/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotProvider/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    copilotProvider: {
        copilotUsageReceipt: {
            super: 'base',
            model: true,
            service: { enabled: true },
            router: { groups: { schemaOperations: false }, enabled: false },
            event: { enabled: false },
            cache: { enabled: false },
            definition: {
                tenantCode: {
                    type: 'string',
                    required: true,
                    description: 'Framework evidence isolation envelope.',
                },
                enterpriseCode: {
                    type: 'string',
                    required: true,
                    description: 'Trusted owning enterprise.',
                },
                principalCode: {
                    type: 'string',
                    required: true,
                    description: 'Original model-call principal.',
                },
                periodKey: {
                    type: 'string',
                    required: true,
                    description: 'Original accounting period.',
                },
                callId: {
                    type: 'string',
                    required: true,
                    description: 'Original reservation identity.',
                },
                measurement: {
                    type: 'object',
                    required: true,
                    description:
                        'Measured provider counters only, never prompt or response.',
                },
                measuredAt: {
                    type: 'date',
                    required: true,
                    description: 'Capture instant.',
                },
                digest: {
                    type: 'string',
                    required: true,
                    description: 'Canonical receipt content binding.',
                },
            },
            indexes: {
                individual: {
                    receiptIdentity: {
                        name: 'code',
                        enabled: true,
                        options: { unique: true },
                    },
                },
            },
        },
        copilotUsagePeriod: {
            super: 'base',
            model: true,
            service: { enabled: true },
            router: { groups: { schemaOperations: false }, enabled: false },
            event: { enabled: false },
            cache: { enabled: false },
            definition: {
                tenantCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Framework accounting envelope runtime isolation key.',
                },
                periodKey: {
                    type: 'string',
                    required: true,
                    description: 'Immutable local calendar period identity.',
                },
                revision: {
                    type: 'int',
                    required: true,
                    description: 'Atomic accounting revision.',
                },
                journal: {
                    type: 'object',
                    required: true,
                    description:
                        'Bounded attribution and reservation entries; never prompt or response content.',
                },
                createdAt: {
                    type: 'date',
                    required: true,
                    description: 'Period accounting creation instant.',
                },
                updatedAt: {
                    type: 'date',
                    required: true,
                    description: 'Last accounting transition instant.',
                },
            },
            indexes: {
                individual: {
                    usagePeriodIdentity: {
                        name: 'code',
                        enabled: true,
                        options: { unique: true },
                    },
                },
            },
        },
    },
};
