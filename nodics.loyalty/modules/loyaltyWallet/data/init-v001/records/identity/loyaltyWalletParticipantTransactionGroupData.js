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
  "loyaltyRewardTransferParticipantUserGroup": {
    "code": "loyaltyRewardTransferParticipantUserGroup",
    "name": "loyaltyWallet Enterprise participant",
    "active": true,
    "parentGroups": [],
    "permissions": [
      "loyalty.rewards.transfer"
    ]
  }
};
