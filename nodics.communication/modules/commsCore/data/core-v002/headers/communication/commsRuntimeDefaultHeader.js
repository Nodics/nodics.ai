/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsCore/data/core-v002/commsRuntimeDefaultHeader @description Imports governed resource selectors through the existing schema owner. @owner commsCore @layer data-header */
module.exports = {
  commsSchema: {
    commsRuntimeDefaultTemplateData: {
      options: {
        enabled: true,
        schemaName: "commsTemplate",
        operation: "saveAll",
        dataFilePrefix: "commsRuntimeDefaultTemplateData",
        userGroups: ["adminGroup"],
      },
      query: {
        code: "$code",
        tenant: "$tenant",
      },
    },
    commsRuntimeDefaultTemplateVersionData: {
      options: {
        enabled: true,
        schemaName: "commsTemplateVersion",
        operation: "saveAll",
        dataFilePrefix: "commsRuntimeDefaultTemplateVersionData",
        userGroups: ["adminGroup"],
      },
      query: {
        code: "$code",
        tenant: "$tenant",
      },
    },
  },
};
