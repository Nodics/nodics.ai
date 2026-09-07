/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotPolicy/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ERR_CPL_00000: { code: '400', message: 'The request needs more business information.' },
    ERR_CPL_00001: { code: '409', message: 'The prepared mutation requires explicit confirmation.' },
    ERR_CPL_00002: { code: '403', message: 'The actor cannot execute this mutation.' },
    ERR_CPL_00003: { code: '503', message: 'The effective Copilot runtime is not configured.' },
    ERR_CPL_00004: { code: '401', message: 'The Copilot security context is invalid.' },
    ERR_CPL_00005: { code: '403', message: 'The requested knowledge source is not available to this security context.' },
    ERR_CPL_00006: { code: '403', message: 'The requested Copilot capability is not available to this security context.' },
    ERR_CPL_00007: { code: '400', message: 'The Copilot knowledge source classification is invalid.' }
};
