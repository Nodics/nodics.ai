/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nLocalization/src/utils/enums
 * @description Stable localization context and authority vocabulary.
 * @layer definition
 * @owner nLocalization
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    LOCALIZATION_CONTEXT_SOURCES: { definition: [
        'TRUSTED_OVERRIDE',
        'SUBJECT_PREFERENCE',
        'STOREFRONT_CONTEXT',
        'SITE_POLICY',
        'TENANT_POLICY',
        'PLATFORM_DEFAULT'
    ] },
    LOCALIZATION_AUTHORITY_STATES: { definition: ['AVAILABLE', 'UNAVAILABLE', 'DEGRADED'] }
};
