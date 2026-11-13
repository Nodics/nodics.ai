/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module rulesDefinition/src/utils/statusDefinitions @description Status and error definitions owned by rulesDefinition. @layer utility @owner rulesDefinition */
module.exports = {
    ERR_RULE_DEF_00001: { code: '422', message: 'Correct the saved draft before continuing', publicMessage: true },
    ERR_RULE_DEF_00002: { code: '409', message: 'The draft changed or its write could not be confirmed. Reload and review its current revision', publicMessage: true }
};
