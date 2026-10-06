/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotConversation/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ERR_CPC_00006: { code: '409', message: 'Retention operation is unavailable or unconfirmed; inspect the original operation before continuing' },
    ERR_CPC_00001: { code: '403', message: 'Copilot activity is not available in this context' },
    ERR_CPC_00002: { code: '400', message: 'Copilot activity filter is invalid' },
    ERR_CPC_00003: { code: '403', message: 'Transcript inspection is not available in this context' },
    ERR_CPC_00004: { code: '400', message: 'Transcript inspection purpose or page is invalid' },
    ERR_CPC_00005: { code: '503', message: 'Audited transcript inspection could not be completed' }
};
