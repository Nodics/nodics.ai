/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
/** @module installer/utils/statusDefinitions @description Stable client-safe read-only Builder outcomes. @layer utils @owner installer */
module.exports = {
  SUC_IST_00000: {
    code: "200",
    message: "Read-only Builder observation completed",
  },
  ERR_IST_00000: {
    code: "503",
    message:
      "Builder observation is unavailable. Refresh availability or contact your administrator.",
  },
  ERR_IST_00001: {
    code: "403",
    message: "Your employee access does not permit this Builder operation.",
  },
  ERR_IST_00002: {
    code: "400",
    message:
      "Check the Builder request. Use a valid application name and approved workspace.",
  },
  ERR_IST_00003: {
    code: "403",
    message:
      "This workspace is not approved for Builder inspection. Ask your administrator to review the workspace selection.",
  },
  ERR_IST_00004: {
    code: "503",
    message: "Read-only Builder operations are disabled in this runtime.",
  },
  ERR_IST_00005: { code: "409", message: "The reviewed build or its output changed. Inspect its receipt before taking another action." },
  ERR_IST_00006: { code: "404", message: "This build receipt is unavailable to your account." },
};
