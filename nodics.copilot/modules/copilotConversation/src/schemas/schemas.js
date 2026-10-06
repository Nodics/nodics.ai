/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotConversation/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    copilotConversation: {
        copilotAuditRetentionOperation: {
            super: 'base', model: true, cache: { enabled: false },
            transaction: { enabled: true, sideEffects: 'none' },
            service: { enabled: true }, router: { groups: { schemaOperations: false }, enabled: false }, event: { enabled: false },
            definition: {
                tenantCode: { type: 'string', required: true, description: 'Trusted tenant owning this independent audit-retention receipt.' },
                enterpriseCode: { type: 'string', required: true, description: 'Exact enterprise whose audit was reviewed.' },
                principalCode: { type: 'string', required: true, description: 'Original authorized retention operator.' },
                state: { type: 'string', required: true, description: 'PREPARED, COMPLETED or STOPPED; never inferred from missing audit rows.' },
                evidence: { type: 'object', required: true, description: 'Private reviewed identifiers and fingerprints, policy revision, cutoff and transaction result; no audit content.' },
            },
            indexes: { individual: { auditRetentionIdentity: { name: 'code', enabled: true, options: { unique: true } } } },
        },
        copilotTranscriptAccess: {
            super: 'base', model: true, cache: { enabled: false },
            transaction: { enabled: true, sideEffects: 'none' },
            service: { enabled: true },
            router: { groups: { schemaOperations: false }, enabled: false },
            event: { enabled: false },
            definition: {
                tenantCode: { type: 'string', required: true, description: 'Trusted tenant of the inspected conversation.' },
                enterpriseCode: { type: 'string', required: true, description: 'Trusted enterprise of the inspected conversation.' },
                principalCode: { type: 'string', required: true, description: 'Administrator authorized to inspect this page.' },
                conversationCode: { type: 'string', required: true, description: 'Scoped conversation identity or enterprise-search for an explicitly typed search receipt, never transcript content.' },
                accessType: { type: 'string', required: false, description: 'TRANSCRIPT or RECORDED_SEARCH; absent on legacy transcript receipts.' },
                searchWindow: { type: 'object', required: false, description: 'Bounded UTC from/to instants for recorded search; contains no search term.' },
                purpose: { type: 'string', required: true, description: 'Allowlisted business purpose for inspection.' },
                page: { type: 'int', required: true, description: 'Authorized bounded turn page.' },
                occurredAt: { type: 'date', required: true, description: 'Time access was authorized before message reads.' },
                outcome: { type: 'string', required: true, description: 'READ_AUTHORIZED records permission to attempt a read, not proof of delivery.' },
            },
            indexes: { individual: { transcriptAccessIdentity: { name: 'code', enabled: true, options: { unique: true } } } },
        },
        copilotConversationRecord: {
            super: 'base',
            model: true,
            cache: { enabled: false },
            transaction: { enabled: true, sideEffects: 'none' },
            service: { enabled: true },
            router: { groups: { schemaOperations: false }, enabled: false },
            event: { enabled: false },
            definition: {
                retentionOperation: { type: 'object', required: false, description: 'Private bounded retention operation journal retained with the parent tombstone; no transcript content or public CRUD.' },
                lifecycleClosure: { type: 'object', required: false, description: 'Private original confirmed closure evidence; not a cancellation of provider or business effects.' },
                writerToken: { type: 'string', required: false, description: 'Private transactional parent-touch token; never a grant, deletion receipt or automatic lease expiry.' },
                enterpriseCode: {
                    type: 'string',
                    required: false,
                    description:
                        'Trusted enterprise binding; legacy unbound records are not assigned implicitly.',
                },
                definitionCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the definition code used to classify, link, or resolve this record.',
                },
                title: {
                    type: ['string', 'null'],
                    required: false,
                    description: 'Recorded title or explicit null after governed content retention leaves the parent tombstone.',
                },
                tenantCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the tenant code used to classify, link, or resolve this record.',
                },
                principalCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the principal code used to classify, link, or resolve this record.',
                },
                channel: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the channel value used by this record.',
                },
                state: {
                    type: 'string',
                    required: true,
                    description: 'Stores the state value used by this record.',
                },
                lastSequence: {
                    type: 'int',
                    required: true,
                    default: 0,
                    description:
                        'Stores the numeric last sequence used by this record.',
                },
                createdAt: {
                    type: 'date',
                    required: true,
                    description:
                        'Records when the created event or value applies.',
                },
                updatedAt: {
                    type: 'date',
                    required: true,
                    description:
                        'Records when the updated event or value applies.',
                },
            },
            indexes: {
                individual: {
                    conversationOwner: {
                        name: 'principalCode',
                        enabled: true,
                        options: { unique: false },
                    },
                    conversationTenant: {
                        name: 'tenantCode',
                        enabled: true,
                        options: { unique: false },
                    },
                },
            },
        },
        copilotTurn: {
            super: 'base',
            model: true,
            cache: { enabled: false },
            transaction: { enabled: true, sideEffects: 'none' },
            service: { enabled: true },
            router: { groups: { schemaOperations: false }, enabled: false },
            event: { enabled: false },
            definition: {
                recording: {
                    type: 'object',
                    required: false,
                    description:
                        'Effective recording enablement and policy version pinned when this turn was accepted; absent on legacy recorded turns.',
                },
                enterpriseCode: {
                    type: 'string',
                    required: false,
                    description:
                        'Enterprise binding inherited from the owning conversation.',
                },
                conversationCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the conversation code used to classify, link, or resolve this record.',
                },
                idempotencyKey: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the idempotency key value used by this record.',
                },
                tenantCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the tenant code used to classify, link, or resolve this record.',
                },
                principalCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the principal code used to classify, link, or resolve this record.',
                },
                state: {
                    type: 'string',
                    required: true,
                    description: 'Stores the state value used by this record.',
                },
                failureCode: {
                    type: 'string',
                    required: false,
                    description:
                        'Stores the failure code used to classify, link, or resolve this record.',
                },
                acceptedAt: {
                    type: 'date',
                    required: true,
                    description:
                        'Records when the accepted event or value applies.',
                },
                completedAt: {
                    type: 'date',
                    required: false,
                    description:
                        'Records when the completed event or value applies.',
                },
            },
        },
        copilotMessage: {
            super: 'base',
            model: true,
            cache: { enabled: false },
            transaction: { enabled: true, sideEffects: 'none' },
            service: { enabled: true },
            router: { groups: { schemaOperations: false }, enabled: false },
            event: { enabled: false },
            definition: {
                providerContextEligible: { type: 'boolean', required: false, description: 'Only explicit true admits a message to later model context. Live reads are false and legacy absent values fail closed; recorded transcript access remains independently governed.' },
                enterpriseCode: { type: 'string', required: false, description: 'Trusted conversation enterprise; legacy unbound messages are excluded from administrative content search.' },
                principalCode: { type: 'string', required: false, description: 'Trusted conversation owner, rechecked against conversation and turn before search delivery.' },
                conversationCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the conversation code used to classify, link, or resolve this record.',
                },
                turnCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the turn code used to classify, link, or resolve this record.',
                },
                tenantCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the tenant code used to classify, link, or resolve this record.',
                },
                role: {
                    type: 'string',
                    required: true,
                    description: 'Stores the role value used by this record.',
                },
                content: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the content value used by this record.',
                },
                sequence: {
                    type: 'int',
                    required: true,
                    description:
                        'Stores the numeric sequence used by this record.',
                },
                createdAt: {
                    type: 'date',
                    required: true,
                    description:
                        'Records when the created event or value applies.',
                },
            },
        },
        copilotEvent: {
            super: 'base',
            model: true,
            cache: { enabled: false },
            transaction: { enabled: true, sideEffects: 'none' },
            service: { enabled: true },
            router: { groups: { schemaOperations: false }, enabled: false },
            event: { enabled: false },
            definition: {
                tenantCode: {
                    type: 'string',
                    required: false,
                    description: 'Trusted tenant for new events; legacy unbound events are excluded from replay.',
                },
                principalCode: {
                    type: 'string',
                    required: false,
                    description: 'Trusted employee for new events; never inferred during reads.',
                },
                enterpriseCode: {
                    type: 'string',
                    required: false,
                    description: 'Enterprise inherited from the owned turn; legacy events are not rebound.',
                },
                contractVersion: {
                    type: 'int',
                    required: true,
                    description:
                        'Stores the numeric contract version used by this record.',
                },
                conversationCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the conversation code used to classify, link, or resolve this record.',
                },
                turnCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the turn code used to classify, link, or resolve this record.',
                },
                eventType: {
                    type: 'string',
                    required: true,
                    description:
                        'Classifies this record by event type for validation and business handling.',
                },
                sequence: {
                    type: 'int',
                    required: true,
                    description:
                        'Stores the numeric sequence used by this record.',
                },
                data: {
                    type: 'object',
                    required: true,
                    description:
                        'Stores structured data details used by this record.',
                },
                createdAt: {
                    type: 'date',
                    required: true,
                    description:
                        'Records when the created event or value applies.',
                },
            },
        },
        copilotAction: {
            super: 'base',
            model: true,
            cache: { enabled: false },
            transaction: { enabled: true, sideEffects: 'none' },
            service: { enabled: true },
            router: { groups: { schemaOperations: false }, enabled: false },
            event: { enabled: false },
            definition: {
                enterpriseCode: {
                    type: 'string',
                    required: false,
                    description:
                        'Trusted enterprise of the prepared action; legacy unbound actions are not executable.',
                },
                conversationCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the conversation code used to classify, link, or resolve this record.',
                },
                tenantCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the tenant code used to classify, link, or resolve this record.',
                },
                principalCode: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the principal code used to classify, link, or resolve this record.',
                },
                capability: {
                    type: 'string',
                    required: true,
                    description:
                        'Stores the capability value used by this record.',
                },
                state: {
                    type: 'string',
                    required: true,
                    description: 'Stores the state value used by this record.',
                },
                preview: {
                    type: 'object',
                    required: false,
                    description:
                        'Stores structured preview details used by this record.',
                },
                audit: {
                    type: 'object',
                    required: false,
                    description:
                        'Stores structured audit details used by this record.',
                },
                createdAt: {
                    type: 'date',
                    required: true,
                    description:
                        'Records when the created event or value applies.',
                },
                updatedAt: {
                    type: 'date',
                    required: true,
                    description:
                        'Records when the updated event or value applies.',
                },
            },
        },
    },
};
