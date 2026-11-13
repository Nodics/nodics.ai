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
    ERR_WCMS_EXPERIENCE_AUTHORING_CONFLICT: {code:'409',message:'The page or placements changed, or the save could not be confirmed. Inspect the saved state before another change.'},
    ERR_WCMS_EXPERIENCE_PRIORITY_CONFLICT: {code:'422',message:'Another placement has the same target, slot and priority. Choose a distinct priority to make the intended order clear.'},
    SUC_WCMS_EXPERIENCE_00000: {
        code: '200',
        message: 'WCMS Experience operation completed successfully.'
    },
    ERR_WCMS_EXPERIENCE_PREPARATION_UNCONFIRMED: {
        code: '409',
        message: 'Private preview preparation is unconfirmed. Inspect its current status before another preparation.'
    },
    ERR_WCMS_EXPERIENCE_ONLINE_INSPECTION_REQUIRED: {code:'409',message:'Inspect the current Online generation before recovery. A stale or incomplete command will not be replayed.'},
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
        message: 'Experience projection evidence is unavailable. Ask an administrator to verify the Discovery owner, access and index readiness, then retry.'
    }
};
