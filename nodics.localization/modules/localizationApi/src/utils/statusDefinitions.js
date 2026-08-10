/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module localizationApi/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ERR_LAPI_00000: { code: '400', message: 'Localization bundle request is invalid' },
    ERR_LAPI_00001: { code: '404', message: 'Published localization bundle is unavailable' },
    ERR_LAPI_00002: { code: '413', message: 'Localization bundle boundary exceeded' },
    SUC_LAPI_00000: { code: '200', message: 'Published localization bundle returned' },
    SUC_LAPI_00001: { code: '304', message: 'Published localization bundle is unchanged' }
};
