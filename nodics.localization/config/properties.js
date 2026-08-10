/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.localization/config/properties
 * @description Defines group-level Localization capability metadata without business behavior.
 * @layer config
 * @owner nodics.localization
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    localizationCapabilities: {
        functionalModule: 'nodics.localization',
        contractVersion: 1,
        children: ['localizationCore', 'localizationApi']
    }
};
