/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module order/data/participantTransactionAccess @description Exact parent-free Enterprise participant definition; assigns nobody. @owner order @layer data */
module.exports = {
  "commerceOwnLifecycleParticipantUserGroup": {
    "code": "commerceOwnLifecycleParticipantUserGroup",
    "name": "order Enterprise participant",
    "active": true,
    "parentGroups": [],
    "permissions": [
      "commerce.lifecycle.own.create"
    ]
  }
};
