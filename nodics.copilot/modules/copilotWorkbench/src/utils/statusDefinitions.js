/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotWorkbench/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ERR_CPW_00001: { code: '409', message: 'The Copilot action changed. Inspect its current state before proceeding.' },
    ERR_CPW_00002: { code: '403', message: 'The Copilot action is not available in this context.' },
    ERR_CPW_00003: { code: '503', message: 'The Copilot action outcome requires inspection. Do not retry execution.' },
    ERR_CPW_00004: { code: '400', message: 'The Copilot action plan is invalid.' },
    ERR_CPW_00005: { code: '403', message: 'A current employee credential and enterprise are required for execution.' }
};
