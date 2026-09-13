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
        copilotConversationRecord: {
            super: 'base', model: true, service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, event: { enabled: false },
            definition: {
                definitionCode: { type: 'string', required: true , description: 'Stores the definition code used to classify, link, or resolve this record.'}, title: { type: 'string', required: false , description: 'Stores the title value used by this record.'},
                tenantCode: { type: 'string', required: true , description: 'Stores the tenant code used to classify, link, or resolve this record.'}, principalCode: { type: 'string', required: true , description: 'Stores the principal code used to classify, link, or resolve this record.'},
                channel: { type: 'string', required: true , description: 'Stores the channel value used by this record.'}, state: { type: 'string', required: true , description: 'Stores the state value used by this record.'},
                lastSequence: { type: 'int', required: true, default: 0 , description: 'Stores the numeric last sequence used by this record.'}, createdAt: { type: 'date', required: true , description: 'Records when the created event or value applies.'},
                updatedAt: { type: 'date', required: true , description: 'Records when the updated event or value applies.'}
            },
            indexes: { individual: {
                conversationOwner: { name: 'principalCode', enabled: true, options: { unique: false } },
                conversationTenant: { name: 'tenantCode', enabled: true, options: { unique: false } }
            } }
        },
        copilotTurn: {
            super: 'base', model: true, service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, event: { enabled: false },
            definition: {
                conversationCode: { type: 'string', required: true , description: 'Stores the conversation code used to classify, link, or resolve this record.'}, idempotencyKey: { type: 'string', required: true , description: 'Stores the idempotency key value used by this record.'},
                tenantCode: { type: 'string', required: true , description: 'Stores the tenant code used to classify, link, or resolve this record.'}, principalCode: { type: 'string', required: true , description: 'Stores the principal code used to classify, link, or resolve this record.'},
                state: { type: 'string', required: true , description: 'Stores the state value used by this record.'}, failureCode: { type: 'string', required: false , description: 'Stores the failure code used to classify, link, or resolve this record.'},
                acceptedAt: { type: 'date', required: true , description: 'Records when the accepted event or value applies.'}, completedAt: { type: 'date', required: false , description: 'Records when the completed event or value applies.'}
            }
        },
        copilotMessage: {
            super: 'base', model: true, service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, event: { enabled: false },
            definition: {
                conversationCode: { type: 'string', required: true , description: 'Stores the conversation code used to classify, link, or resolve this record.'}, turnCode: { type: 'string', required: true , description: 'Stores the turn code used to classify, link, or resolve this record.'},
                tenantCode: { type: 'string', required: true , description: 'Stores the tenant code used to classify, link, or resolve this record.'}, role: { type: 'string', required: true , description: 'Stores the role value used by this record.'},
                content: { type: 'string', required: true , description: 'Stores the content value used by this record.'}, sequence: { type: 'int', required: true , description: 'Stores the numeric sequence used by this record.'}, createdAt: { type: 'date', required: true , description: 'Records when the created event or value applies.'}
            }
        },
        copilotEvent: {
            super: 'base', model: true, service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, event: { enabled: false },
            definition: {
                contractVersion: { type: 'int', required: true , description: 'Stores the numeric contract version used by this record.'}, conversationCode: { type: 'string', required: true , description: 'Stores the conversation code used to classify, link, or resolve this record.'},
                turnCode: { type: 'string', required: true , description: 'Stores the turn code used to classify, link, or resolve this record.'}, eventType: { type: 'string', required: true , description: 'Classifies this record by event type for validation and business handling.'},
                sequence: { type: 'int', required: true , description: 'Stores the numeric sequence used by this record.'}, data: { type: 'object', required: true , description: 'Stores structured data details used by this record.'}, createdAt: { type: 'date', required: true , description: 'Records when the created event or value applies.'}
            }
        },
        copilotAction: {
            super: 'base', model: true, service: { enabled: true }, router: { groups: { schemaOperations: true }, enabled: true }, event: { enabled: false },
            definition: {
                conversationCode: { type: 'string', required: true , description: 'Stores the conversation code used to classify, link, or resolve this record.'}, tenantCode: { type: 'string', required: true , description: 'Stores the tenant code used to classify, link, or resolve this record.'},
                principalCode: { type: 'string', required: true , description: 'Stores the principal code used to classify, link, or resolve this record.'}, capability: { type: 'string', required: true , description: 'Stores the capability value used by this record.'},
                state: { type: 'string', required: true , description: 'Stores the state value used by this record.'}, preview: { type: 'object', required: false , description: 'Stores structured preview details used by this record.'},
                audit: { type: 'object', required: false , description: 'Stores structured audit details used by this record.'}, createdAt: { type: 'date', required: true , description: 'Records when the created event or value applies.'}, updatedAt: { type: 'date', required: true , description: 'Records when the updated event or value applies.'}
            }
        }
    }
};
