/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module commsApi/utils/statusDefinitions
 * @description Defines source-private integration authority refusal without
 * revealing whether an intent, source, recipient or rendered message exists.
 * @layer utils
 * @owner commsApi
 */
module.exports = {
  ERR_COMMS_INTEGRATION_INPUT: {
    code: "400",
    message: "Communication inspection requires an empty object body.",
  },
  ERR_COMMS_INTEGRATION_STORAGE: {
    code: "503",
    message: "Communication evidence could not be confirmed.",
  },
  ERR_COMMS_INTEGRATION_CONTEXT: {
    code: "403",
    message: "Communication is not available in this context.",
  },
};
