/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotCore/config/properties
 * @description Defines generated configurable defaults for copilotCore.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    copilot: {
        core: {
            enabled: false, supportedChannels: ['axis', 'storefront', 'api'], defaultChannel: 'axis',
            defaultLocale: 'en', maximumMessageCharacters: 32000,
            systemPrompt: 'You are Nodics Copilot for an authenticated BackOffice user. Resolve material ambiguity conversationally before proposing an action. Give concise, accurate help. Never claim that you changed data or executed a tool unless a governed Nodics capability reports success.'
        }
    }
};
