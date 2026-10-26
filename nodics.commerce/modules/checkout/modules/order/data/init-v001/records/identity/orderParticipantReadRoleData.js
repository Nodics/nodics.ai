/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module order/data/participantReadAccess @description Defines an Enterprise-scoped reader role; installation assigns nobody. @owner order @layer data */
module.exports = {
  COMMERCE_OWN_ORDER_READER: {
    code: "COMMERCE_OWN_ORDER_READER",
    name: "Enterprise own order reader",
    label: "Enterprise own order reader",
    description:
      "Reads only the currently authorized Enterprise owner's evidence; no mutation or provisioning authority.",
    active: true,
    groupCodes: ["commerceOwnOrderReaderUserGroup"],
    scopeType: "ENTERPRISE",
    delegable: true,
    assignmentPermissions: [],
    ownerModule: "order",
  },
};
