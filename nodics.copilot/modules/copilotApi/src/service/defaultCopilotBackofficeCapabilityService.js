/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotApi/service/DefaultCopilotBackofficeCapabilityService @description Publishes the module-owned Axis assistant capability without relying on project configuration as a parallel registry authority. @layer service @owner copilotApi @override Projects may override this service to customize presentation while preserving the assistant route contract. */
module.exports = {
    /** Registers the synchronous capability provider during service initialization. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('copilotApi', this);
        return Promise.resolve(true);
    },
    /** Completes the standard Nodics service lifecycle. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the bounded BackOffice capability contributed by copilotApi. */
    getCapability: function () {
        return {
            enabled: true, capabilityId: 'nodics-copilot', displayName: 'Nodics Copilot',
            category: 'platform', icon: 'assistant', contractVersion: 1, minimumClientContractVersion: 1,
            roles: ['ASSISTANT_PROVIDER'], requiredPermissions: [],
            navigation: [{
                id: 'copilot-workspace', label: 'Copilot Workspace', route: '/copilot', icon: 'assistant', order: 40,
                group: { id: 'ai-copilot', label: 'AI & Copilot', order: 550 }, perspectives: ['operations'],
                contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE',
                requiredPermissions: ['copilot.assistant.read'],
                backendWorkspace: { renderer: 'axis.workspace.native', contractVersion: 1, workspaceCode: 'copilot.workspace', viewCode: 'overview', title: 'Copilot Workspace' }
            }, {
                id: 'assistant', label: 'Copilot Conversation', route: '/assistant', icon: 'assistant', order: 50,
                group: { id: 'ai-copilot', label: 'AI & Copilot', order: 550 }, perspectives: ['operations'],
                contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE',
                requiredPermissions: ['copilot.assistant.use']
            }, {
                id: 'copilot-knowledge', label: 'Knowledge Studio', route: '/copilot/knowledge', icon: 'assistant', order: 60,
                group: { id: 'ai-copilot', label: 'AI & Copilot', order: 550 }, perspectives: ['operations'],
                contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE',
                requiredPermissions: ['copilot.knowledge.internal.read'],
                backendWorkspace: { renderer: 'axis.workspace.native', contractVersion: 1, workspaceCode: 'copilot.knowledge', viewCode: 'sources', title: 'Knowledge Studio' }
            }, {
                id: 'copilot-activity', label: 'Copilot Activity', route: '/copilot/activity', icon: 'assistant', order: 70,
                group: { id: 'ai-copilot', label: 'AI & Copilot', order: 550 }, perspectives: ['operations'],
                contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE',
                requiredPermissions: ['copilot.activity.read'],
                backendWorkspace: { renderer: 'axis.workspace.native', contractVersion: 1, workspaceCode: 'copilot.activity', viewCode: 'conversations', title: 'Copilot Activity' }
            }, {
                id: 'copilot-usage', label: 'Usage and budgets', route: '/copilot/usage', icon: 'assistant', order: 65,
                group: { id: 'ai-copilot', label: 'AI & Copilot', order: 550 }, perspectives: ['operations'],
                contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE',
                requiredPermissions: ['copilot.assistant.read'],
                backendWorkspace: { renderer: 'axis.workspace.native', contractVersion: 1, workspaceCode: 'copilot.usage', viewCode: 'overview', title: 'Usage and budgets' }
            }, JSON.parse(JSON.stringify(require('../../data/backoffice/administration.json')))]
        };
    }
};
