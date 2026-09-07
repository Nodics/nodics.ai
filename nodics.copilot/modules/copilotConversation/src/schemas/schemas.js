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
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                definitionCode: { type: 'string', required: true }, title: { type: 'string', required: false },
                tenantCode: { type: 'string', required: true }, principalCode: { type: 'string', required: true },
                channel: { type: 'string', required: true }, state: { type: 'string', required: true },
                lastSequence: { type: 'int', required: true, default: 0 }, createdAt: { type: 'date', required: true },
                updatedAt: { type: 'date', required: true }
            },
            indexes: { individual: {
                conversationOwner: { name: 'principalCode', enabled: true, options: { unique: false } },
                conversationTenant: { name: 'tenantCode', enabled: true, options: { unique: false } }
            } }
        },
        copilotTurn: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                conversationCode: { type: 'string', required: true }, idempotencyKey: { type: 'string', required: true },
                tenantCode: { type: 'string', required: true }, principalCode: { type: 'string', required: true },
                state: { type: 'string', required: true }, failureCode: { type: 'string', required: false },
                acceptedAt: { type: 'date', required: true }, completedAt: { type: 'date', required: false }
            }
        },
        copilotMessage: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                conversationCode: { type: 'string', required: true }, turnCode: { type: 'string', required: true },
                tenantCode: { type: 'string', required: true }, role: { type: 'string', required: true },
                content: { type: 'string', required: true }, sequence: { type: 'int', required: true }, createdAt: { type: 'date', required: true }
            }
        },
        copilotEvent: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                contractVersion: { type: 'int', required: true }, conversationCode: { type: 'string', required: true },
                turnCode: { type: 'string', required: true }, eventType: { type: 'string', required: true },
                sequence: { type: 'int', required: true }, data: { type: 'object', required: true }, createdAt: { type: 'date', required: true }
            }
        },
        copilotAction: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                conversationCode: { type: 'string', required: true }, tenantCode: { type: 'string', required: true },
                principalCode: { type: 'string', required: true }, capability: { type: 'string', required: true },
                state: { type: 'string', required: true }, preview: { type: 'object', required: false },
                audit: { type: 'object', required: false }, createdAt: { type: 'date', required: true }, updatedAt: { type: 'date', required: true }
            }
        }
    }
};
