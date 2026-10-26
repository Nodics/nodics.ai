/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module order/data/participantReadAccess @description Defines one explicit read permission without inherited grants. @owner order @layer data */
module.exports = {
  commerceOwnOrderReaderUserGroup: {
    code: "commerceOwnOrderReaderUserGroup",
    name: "Enterprise own order reader",
    active: true,
    parentGroups: [],
    permissions: ["commerce.order.own.read"],
  },
};
