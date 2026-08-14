/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nLocalization/src/utils/statusDefinitions
 * @description Stable errors for locale, context, and provider-neutral authority failures.
 * @layer definition
 * @owner nLocalization
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ERR_L10N_00000: { code: '400', message: 'Locale is invalid' },
    ERR_L10N_00001: { code: '400', message: 'Locale is not supported by the active policy' },
    ERR_L10N_00002: { code: '503', message: 'Localization authority is unavailable' },
    ERR_L10N_00003: { code: '400', message: 'Localization context is invalid' },
    ERR_L10N_00004: { code: '400', message: 'Localization scope exceeds the configured boundary' }
};
