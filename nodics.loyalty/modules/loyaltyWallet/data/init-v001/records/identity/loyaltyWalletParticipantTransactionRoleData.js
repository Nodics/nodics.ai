/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module loyaltyWallet/data/participantTransactionAccess @description Exact parent-free Enterprise participant definition; assigns nobody. @owner loyaltyWallet @layer data */
module.exports = {
  "LOYALTY_REWARD_TRANSFER_PARTICIPANT": {
    "code": "LOYALTY_REWARD_TRANSFER_PARTICIPANT",
    "name": "loyaltyWallet Enterprise participant",
    "label": "loyaltyWallet Enterprise participant",
    "description": "Explicit participant authority with original signed Enterprise scope and owner admission.",
    "active": true,
    "groupCodes": [
      "loyaltyRewardTransferParticipantUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": [],
    "ownerModule": "loyaltyWallet"
  }
};
