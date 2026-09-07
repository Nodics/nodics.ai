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
            roles: ['ASSISTANT_PROVIDER'], requiredPermissions: ['copilot.assistant.use'],
            navigation: [{
                id: 'assistant', label: 'Nodics Copilot', route: '/assistant', icon: 'assistant', order: 50,
                group: { id: 'operations', label: 'Operations', order: 600 }, perspectives: ['operations'],
                contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE',
                requiredPermissions: ['copilot.assistant.use']
            }]
        };
    }
};
