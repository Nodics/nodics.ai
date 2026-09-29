/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsVerification/utils/statusDefinitions @description Stable recipient-safe verification error contracts. @layer utils @owner commsVerification */
module.exports = {
  "ERR_COMMS_VERIFY_INPUT": {
    "code": "400",
    "message": "Verification input or stored evidence is invalid."
  },
  "ERR_COMMS_VERIFY_POLICY": {
    "code": "503",
    "message": "Verification is not available under the configured policy."
  },
  "ERR_COMMS_VERIFY_CONTEXT": {
    "code": "403",
    "message": "Verification is not available in this context."
  },
  "ERR_COMMS_VERIFY_STATE": {
    "code": "409",
    "message": "This verification is no longer usable. Start or resume the permitted verification process."
  },
  "ERR_COMMS_VERIFY_STORAGE": {
    "code": "503",
    "message": "Verification state could not be confirmed. No access has been granted."
  },
  "ERR_COMMS_VERIFY_CONFLICT": {
    "code": "409",
    "message": "Verification changed. Read its current status before retrying."
  },
  "ERR_COMMS_VERIFY_RATE": {
    "code": "429",
    "message": "Another verification code cannot be issued yet."
  }
};
