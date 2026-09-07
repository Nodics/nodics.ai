/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotKnowledge/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ERR_CPK_00000: { code: '400', message: 'The Copilot knowledge source definition is invalid.' },
    ERR_CPK_00001: { code: '409', message: 'The Copilot knowledge source code is duplicated.' },
    ERR_CPK_00002: { code: '403', message: 'The Copilot knowledge source is not available to this security context.' },
    ERR_CPK_00003: { code: '503', message: 'The Copilot knowledge source registry is disabled.' },
    ERR_CPK_00004: { code: '403', message: 'The Copilot knowledge ingestion operation is forbidden.' },
    ERR_CPK_00005: { code: '422', message: 'The Copilot knowledge file was rejected by secret inspection.' },
    ERR_CPK_00006: { code: '413', message: 'The Copilot knowledge source exceeded an ingestion bound.' },
    ERR_CPK_00007: { code: '400', message: 'The Copilot knowledge query is invalid.' },
    ERR_CPK_00008: { code: '503', message: 'The Copilot knowledge retrieval capability is disabled.' }
};
