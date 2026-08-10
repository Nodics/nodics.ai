/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nLocalization/config/properties
 * @description Defines provider-neutral localization context and client defaults.
 * @layer config
 * @owner nLocalization
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    localization: {
        context: {
            contractVersion: 1,
            defaultLocale: 'en',
            defaultChannel: 'web',
            rtlScripts: ['Arab', 'Hebr', 'Thaa', 'Nkoo', 'Adlm', 'Rohg', 'Syrc']
        },
        client: {
            providerService: 'DefaultLocalizationAuthorityProviderService',
            allowLocalContextFallback: true
        },
        limits: {
            maximumLocaleLength: 64,
            maximumFallbackLocales: 16,
            maximumScopePartLength: 128
        }
    }
};
