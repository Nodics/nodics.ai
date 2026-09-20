/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module rulesDefinition/src/utils/enums @description Stable generic definition enums. @layer utility @owner rulesDefinition */
module.exports = {
    RULE_SET_STATUS: Object.freeze({ DRAFT: 'DRAFT', SCHEDULED: 'SCHEDULED', ACTIVE: 'ACTIVE', EXPIRED: 'EXPIRED', DISABLED: 'DISABLED', ARCHIVED: 'ARCHIVED' }),
    GROUP_OPERATOR: Object.freeze({ ALL: 'ALL', ANY: 'ANY' }),
    MISSING_VALUE_BEHAVIOR: Object.freeze({ REQUIRED: 'REQUIRED', OPTIONAL: 'OPTIONAL', FALLBACK_ALLOWED: 'FALLBACK_ALLOWED' })
};
