/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nDatabase/database/src/schemas/schemas
 * @description Defines nDatabase schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner nDatabase
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    default: {
        commandReceipt: {
            super: 'base', model: false, commandReceiptJournal: true,
            cache: { enabled: false }, router: { enabled: false, groups: { schemaOperations: false } },
            event: { enabled: false }, search: { enabled: false }, service: { enabled: false },
            backoffice: { enabled: false },
            definition: {
                tenantCode: { type: 'string', required: true, description: 'Verified runtime partition of the original command.' },
                enterpriseCode: { type: 'string', required: true, description: 'Original employee enterprise, never a caller override.' },
                principalCode: { type: 'string', required: true, description: 'Original human command principal.' },
                moduleName: { type: 'string', required: true, description: 'Native capability that owns this private journal.' },
                operation: { type: 'string', required: true, description: 'Native fixed operation identity.' },
                argumentsDigest: { type: 'string', required: true, description: 'Fingerprint of the exact original submitted command, not its contents.' },
                state: { type: 'string', required: true, description: 'STARTED or COMPLETED; incomplete or absent evidence remains unknown.' },
                startedAt: { type: 'string', required: true, description: 'Original claim UTC timestamp in exact ISO format.' },
                completedAt: { type: 'string', required: false, description: 'UTC timestamp of the original acknowledged completion.' },
                resultIdentity: { type: 'string', required: false, description: 'Bounded native result identity, not full business data.' },
                resultDigest: { type: 'string', required: false, description: 'Fingerprint binding original arguments and native result identity.' },
            },
            indexes: { individual: { commandReceiptIdentity: { name: 'code', enabled: true, options: { unique: true } } } },
        },
        super: {
            model: false,
            service: {
                enabled: false
            },
            router: {
                enabled: false
            },
            event: {
                enabled: false,
                type: 'ASYNC'
            },
            definition: {
                active: {
                    type: 'bool',
                    required: true,
                    default: true,
                    description: 'Indicates whether this record is active and available for use.',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                },
                description: {
                    type: 'string',
                    required: false,
                    description: 'Explains the business purpose, usage, or administrative meaning of this record.',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                },
                accessGroups: {
                    type: 'array',
                    required: false,
                    default: ['userGroup'],
                    description: 'User group code for which this user belongs'
                },
                created: {
                    type: 'date',
                    required: true,
                    default: 'DefaultPropertyInitialValueProviderService.getCurrentTimestamp',
                    description: 'Timestamp when this item got created in database',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                },
                updated: {
                    type: 'date',
                    required: true,
                    default: 'DefaultPropertyInitialValueProviderService.getCurrentTimestamp',
                    description: 'Timestamp when this item got updated in database',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                },
                ownerId: {
                    type: 'string', required: false,
                    description: 'Stable principal identifier owning this record'
                },
                ownerType: {
                    type: 'string', required: false,
                    description: 'Principal category recorded when ownership was assigned'
                },
                createdBy: {
                    type: 'string', required: false,
                    description: 'Principal identifier that created this record'
                },
                updatedBy: {
                    type: 'string', required: false,
                    description: 'Principal identifier that last updated this record'
                }
            },
            options: {
                validationLevel: 'moderate',
                validationAction: 'error'
            }
        },
        base: {
            super: 'super',
            model: false,
            service: {
                enabled: false
            },
            router: {
                enabled: false
            },
            definition: {
                code: {
                    type: 'string',
                    required: true,
                    primary: true,
                    description: 'Uniquely identifies this record when it is linked from other records or used in imports and integrations.',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                }
            },
            indexes: {
                // will be common for composite and individual
                common: {

                },
                // When we need to defined multiple combined field
                composite: {

                },
                individual: {

                }
            }
        }
    }
};
