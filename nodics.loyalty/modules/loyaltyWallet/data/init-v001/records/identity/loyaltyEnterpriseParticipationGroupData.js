/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module loyaltyWallet/data/enterpriseParticipationAccess @description Owner-defined enterprise participation responsibility; installation assigns nobody. @owner loyaltyWallet @layer data */
module.exports = {
  "partnerConversion": {
    "code": "loyaltyEnterprisePartnerConversionUserGroup",
    "name": "Loyalty enterprise partner conversion participant",
    "active": true,
    "parentGroups": [],
    "permissions": [
      "loyalty.partnerConversion.read",
      "loyalty.partnerConversion.execute"
    ]
  },
  "settings": {
    "code": "loyaltyEnterpriseSettingsUserGroup",
    "name": "loyaltyWallet enterprise participation settings",
    "active": true,
    "parentGroups": [],
    "permissions": [
      "loyalty.transfers.manage"
    ]
  }
};
