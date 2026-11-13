/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nDynamo/src/utils/statusDefinitions.js
 * @description Provides shared dynamo status and error definition exports.
 * @layer utils
 * @owner dynamo
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    ERR_DYN_PROPERTY_INVALID: {
        code: '400',
        message: 'Invalid runtime property proposal. Use supported non-secret property paths and values.',
    },
    ERR_DYN_PROPERTY_STALE: {
        code: '409',
        message: 'Runtime property approval is stale. Preview the current values and request a new approval.',
    },
    ERR_DYN_PROPERTY_NOT_ACTIVATABLE: {
        code: '409',
        message: 'Runtime property request cannot be activated in its current state. Inspect the original request.',
    },
    ERR_DYN_PROPERTY_RECOVERY_UNCONFIRMED: {
        code: '409',
        message: 'Runtime property outcome is unconfirmed. Inspect the original request before taking further action.',
    },
};
