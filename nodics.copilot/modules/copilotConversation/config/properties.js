/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotConversation/config/properties
 * @description Defines generated configurable defaults for copilotConversation.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    copilot: {
        conversation: {
            storage: 'GENERATED_SERVICE', allowVolatileLocalStorage: false,
            replayEventLimit: 500, leaseMs: 30000, retentionDays: 90, allowAnonymous: false
        }
    }
};
