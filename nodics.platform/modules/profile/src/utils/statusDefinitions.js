/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/utils/statusDefinitions
 * @description Provides shared profile utility exports for status definitions.
 * @layer utils
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  ERR_PROFILE_REGISTRATION_FORM: {
    code: "400",
    message:
      "Enter a valid name, email and password meeting the account registration requirements.",
  },
  ERR_PROFILE_REGISTRATION_POLICY: {
    code: "503",
    message: "Account registration policy is unavailable.",
  },
  ERR_PROFILE_EXTERNAL_ASSERTION: {
    code: "401",
    message:
      "External identity could not be verified. Sign in securely or reopen the application.",
  },
  ERR_PROFILE_EXTERNAL_CONFLICT: {
    code: "409",
    message: "This external identity cannot be linked to this account.",
  },
  ERR_PROFILE_EXTERNAL_UNAVAILABLE: {
    code: "503",
    message: "External identity integration is unavailable.",
  },
  SUC_PRFL_00000: {
    code: "200",
    message: "Request successfully processed",
  },
  SUC_PRFL_00001: {
    code: "200",
    message: "Request partially processed",
  },
  SUC_PRFL_00002: {
    code: "200",
    message: "Customer exist",
  },

  ERR_PRFL_00000: {
    code: "500",
    message: "Facing internal server error",
  },
  ERR_PRFL_00001: {
    code: "501",
    message: "Operation not implemented",
  },
  ERR_PRFL_00002: {
    code: "503",
    message: "Operation unavailable currently",
  },
  ERR_PRFL_00003: {
    code: "400",
    message: "Invalid request parameters",
  },
  ERR_PRFL_00004: {
    code: "404",
    message: "Data not found",
  },
  ERR_PRFL_00005: {
    code: "400",
    message: "Customer not exist",
  },
  ERR_PRFL_00006: {
    code: "500",
    message: "Customer registration process break",
  },
  ERR_PRFL_00007: {
    code: "400",
    message: "Customer already exist",
  },
};
