/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsCore/data/core-v001/commsRuntimeDefaultTemplateData @description Declares governed resource adoption references; presentation is module-owned. @owner commsCore @layer data */
module.exports = {
  record0: {
    code: "COMMUNICATION_RUNTIME_NOTICE",
    tenant: "default",
    purpose: "TRANSACTIONAL",
    channels: ["EMAIL", "SMS", "IN_APP"],
    declaredVariables: ["reference", "message"],
    sourceModules: ["commsCore"],
    currentVersion: 2,
    status: "ACTIVE",
    correlationId: "communication-resource-migration",
    revision: 1,
    active: true,
  },
};
