/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/utils/statusDefinitions
 * @description Stable WCMS Experience status and diagnostic codes.
 * @layer utility
 * @owner wcmsExperience
 * @override Project modules may add additional diagnostics while preserving base codes.
 */
module.exports = {
    SUC_WCMS_EXPERIENCE_00000: {
        code: '200',
        message: 'WCMS Experience operation completed successfully.'
    },
    ERR_WCMS_EXPERIENCE_INPUT_INVALID: {
        code: '400',
        message: 'WCMS Experience resolver input is invalid.'
    },
    ERR_WCMS_EXPERIENCE_RESOLVER_DISABLED: {
        code: '503',
        message: 'WCMS Experience resolver is disabled.'
    },
    ERR_WCMS_EXPERIENCE_INDEX_SERVICE_UNAVAILABLE: {
        code: '503',
        message: 'Discovery document projection service is unavailable for WCMS Experience indexing.'
    }
};
