/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotCapability/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
  ERR_CPT_00005: {
    code: "400",
    message: "The Process inspection command is invalid.",
  },
  ERR_CPT_00006: {
    code: "403",
    message: "Process inspection is not available for this user and scope.",
  },
  ERR_CPT_00007: {
    code: "502",
    message: "Process inspection did not return valid evidence.",
  },
  ERR_CPT_00008: {
    code: "409",
    message:
      "Process inspection admission changed. Request a fresh inspection.",
  },
  ERR_CPT_00001: {
    code: "400",
    message: "The Rules inspection command is invalid.",
  },
  ERR_CPT_00002: {
    code: "403",
    message: "Rules inspection is not available for this user and scope.",
  },
  ERR_CPT_00003: {
    code: "502",
    message: "Rules inspection did not return valid evidence.",
  },
  ERR_CPT_00004: {
    code: "409",
    message: "Rules inspection admission changed. Request a fresh inspection.",
  },
};
