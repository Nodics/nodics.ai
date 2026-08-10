/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module localizationCore/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ERR_LOC_00000: { code: '400', message: 'Localization contribution is invalid' },
    ERR_LOC_00001: { code: '400', message: 'ICU message contract is invalid' },
    ERR_LOC_00002: { code: '403', message: 'Localization scope or exposure is not authorized' },
    ERR_LOC_00003: { code: '404', message: 'Published localization release is unavailable' },
    ERR_LOC_00004: { code: '409', message: 'Localization release revision or checksum conflict' },
    ERR_LOC_00005: { code: '413', message: 'Localization registry boundary exceeded' },
    ERR_LOC_00006: { code: '403', message: 'Protected localization key override is not authorized' },
    ERR_LOC_00007: { code: '503', message: 'Translation suggestion provider is unavailable' },
    SUC_LOC_00000: { code: '200', message: 'Localization release published' },
    SUC_LOC_00001: { code: '200', message: 'Localization release rolled back' }
};
