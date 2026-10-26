/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/data/participantReadAccess @description Defines one explicit read permission without inherited grants. @owner digitalCore @layer data */
module.exports = {
  commerceOwnEntitlementReaderUserGroup: {
    code: "commerceOwnEntitlementReaderUserGroup",
    name: "Enterprise own entitlement reader",
    active: true,
    parentGroups: [],
    permissions: ["commerce.digital.own.read"],
  },
};
