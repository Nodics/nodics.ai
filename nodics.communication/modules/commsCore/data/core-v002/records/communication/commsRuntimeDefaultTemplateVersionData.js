/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsCore/data/core-v002/commsRuntimeDefaultTemplateVersionData @description Declares governed resource adoption references; presentation is module-owned. @owner commsCore @layer data */
module.exports = {
  record0: {
    code: "COMMUNICATION_RUNTIME_NOTICE:2:en:EMAIL",
    tenant: "default",
    templateCode: "COMMUNICATION_RUNTIME_NOTICE",
    version: 2,
    locale: "en",
    channel: "EMAIL",
    resourceCode: "COMMUNICATION_RUNTIME_NOTICE",
    checksum: "44d0b4910a19a5085dc6bf83a43bee1f2d9684b6775a0a7917d86fbb4b466731",
    status: "ACTIVE",
    validatedAt: "2026-09-30T00:00:00.000Z",
    correlationId: "communication-resource-migration",
    revision: 1,
    active: true,
  },
  record1: {
    code: "COMMUNICATION_RUNTIME_NOTICE:2:en:SMS",
    tenant: "default",
    templateCode: "COMMUNICATION_RUNTIME_NOTICE",
    version: 2,
    locale: "en",
    channel: "SMS",
    resourceCode: "COMMUNICATION_RUNTIME_NOTICE",
    checksum: "61acec34c0e14c2b28770834d823dae4c88c427602cd0469c688195804188c7e",
    status: "ACTIVE",
    validatedAt: "2026-09-30T00:00:00.000Z",
    correlationId: "communication-resource-migration",
    revision: 1,
    active: true,
  },
  record2: {
    code: "COMMUNICATION_RUNTIME_NOTICE:2:en:IN_APP",
    tenant: "default",
    templateCode: "COMMUNICATION_RUNTIME_NOTICE",
    version: 2,
    locale: "en",
    channel: "IN_APP",
    subjectTemplate: "Notification {{reference}}",
    bodyTemplate: "{{message}}",
    checksum:
      "f00fc88bd313618be0156dc948ca34b4eb262bc17f81f6644f87171a7e7fb5cf",
    status: "ACTIVE",
    validatedAt: "2026-08-24T00:00:00.000Z",
    correlationId: "communication-runtime-defaults",
    revision: 1,
    active: true,
  },
};
