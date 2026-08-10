/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module localizationApi/config/properties
 * @description Reserves layered defaults for future Localization APIs.
 * @layer config
 * @owner localizationApi
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    localization: {
        api: {
            enabled: true,
            contractVersion: 1,
            phase: 'REGISTRY_AND_BUNDLES',
            maximumNamespaces: 50,
            maximumBundleKeys: 10000,
            compressionThresholdBytes: 1024,
            cacheControl: 'public, max-age=60, stale-while-revalidate=300'
        }
    }
};
