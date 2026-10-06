/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotProvider/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ERR_CPP_00006: {
        code: '409',
        message:
            'The budget changed or this change identity was already used. Refresh and review the current allocation.',
    },
    ERR_CPP_00001: {
        code: '503',
        message: 'Copilot accounting is unavailable.',
    },
    ERR_CPP_00002: {
        code: '403',
        message: 'Copilot allowance is not assigned for this context.',
    },
    ERR_CPP_00003: {
        code: '429',
        message: 'Copilot capacity is exhausted for this period.',
    },
    ERR_CPP_00004: {
        code: '409',
        message:
            'This provider call is already accounted for. Do not retry it.',
    },
    ERR_CPP_00005: {
        code: '400',
        message: 'Copilot accounting input is invalid.',
    },
};
