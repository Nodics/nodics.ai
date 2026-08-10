/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const DEFINITIONS = require('../utils/statusDefinitions');
/** @module engagementApi/src/service/defaultEngagementApiErrorService @description Maps failures to bounded correlated API errors without stack or operational leakage. @layer service @owner engagementApi @override Later modules may map domain codes while retaining safe projections. */
module.exports = {
    /** Handles project within the module-owned contract. */
    project: function (error, correlationId) {
        let definition = DEFINITIONS[error && error.code] || DEFINITIONS.ERR_ENG_API_00000;
        return { status: Number(definition.code), code: error && error.code && DEFINITIONS[error.code] ? error.code : 'ERR_ENG_API_00000', message: definition.message, correlationId: correlationId };
    }
};
