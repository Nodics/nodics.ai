/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module copilotApi/src/router/routers @description Defines the employee-secured Axis conversation, turn, replay, and stream contract. @layer definition @owner copilotApi @override Later API modules may extend routes while preserving ownership and permission checks. */
module.exports = {
    copilotApi: {
        conversations: {
            create: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.assistant.use', apiExposure: 'copilotApi', key: '/conversations', method: 'POST', controller: 'DefaultCopilotController', operation: 'createConversation' },
            list: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.assistant.read', apiExposure: 'copilotApi', key: '/conversations', method: 'GET', controller: 'DefaultCopilotController', operation: 'listConversations' },
            get: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.assistant.read', apiExposure: 'copilotApi', key: '/conversations/:conversationCode', method: 'GET', controller: 'DefaultCopilotController', operation: 'getConversation' },
            history: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.assistant.read', apiExposure: 'copilotApi', key: '/conversations/:conversationCode/history', method: 'GET', controller: 'DefaultCopilotController', operation: 'getConversationHistory' }
        },
        turns: {
            submit: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.assistant.use', apiExposure: 'copilotApi', key: '/conversations/:conversationCode/turns', method: 'POST', controller: 'DefaultCopilotController', operation: 'submitTurn' },
            get: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.assistant.read', apiExposure: 'copilotApi', key: '/conversations/:conversationCode/turns/:turnCode', method: 'GET', controller: 'DefaultCopilotController', operation: 'getTurn' },
            events: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.assistant.read', apiExposure: 'copilotApi', key: '/conversations/:conversationCode/turns/:turnCode/events', method: 'GET', controller: 'DefaultCopilotController', operation: 'replayEvents' },
            stream: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.assistant.read', apiExposure: 'copilotApi', key: '/conversations/:conversationCode/turns/:turnCode/stream', method: 'GET', controller: 'DefaultCopilotController', operation: 'streamTurn', responseHandler: 'copilotSseResponseHandler' },
            cancel: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.assistant.cancel', apiExposure: 'copilotApi', key: '/conversations/:conversationCode/turns/:turnCode/cancel', method: 'POST', controller: 'DefaultCopilotController', operation: 'cancelTurn' }
        },
        knowledge: {
            status: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.knowledge.internal.read', apiExposure: 'copilotApi', key: '/knowledge/status', method: 'GET', controller: 'DefaultCopilotController', operation: 'getKnowledgeStatus' },
            refresh: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.knowledge.source.manage', apiExposure: 'copilotApi', key: '/knowledge/sources/:sourceCode/refresh', method: 'POST', controller: 'DefaultCopilotController', operation: 'refreshKnowledgeSource' }
        },
        workbench: {
            prepareProducts: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.mutation.prepare', apiExposure: 'copilotApi', key: '/workbench/products/prepare', method: 'POST', controller: 'DefaultCopilotController', operation: 'prepareProductPlan' },
            executeProducts: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.mutation.execute', apiExposure: 'copilotApi', key: '/workbench/products/:actionCode/execute', method: 'POST', controller: 'DefaultCopilotController', operation: 'executeProductPlan' }
        },
        confirmations: {
            get: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.mutation.prepare', apiExposure: 'copilotApi', key: '/confirmations/:confirmationCode', method: 'GET', controller: 'DefaultCopilotController', operation: 'getConfirmation' },
            approve: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.mutation.prepare', apiExposure: 'copilotApi', key: '/confirmations/:confirmationCode/approve', method: 'POST', controller: 'DefaultCopilotController', operation: 'approveConfirmation' },
            reject: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.mutation.prepare', apiExposure: 'copilotApi', key: '/confirmations/:confirmationCode/reject', method: 'POST', controller: 'DefaultCopilotController', operation: 'rejectConfirmation' },
            execute: { secured: true, accessGroups: ['userGroup'], permission: 'copilot.mutation.execute', apiExposure: 'copilotApi', key: '/confirmations/:confirmationCode/execute', method: 'POST', controller: 'DefaultCopilotController', operation: 'executeConfirmation' }
        }
    }
};
