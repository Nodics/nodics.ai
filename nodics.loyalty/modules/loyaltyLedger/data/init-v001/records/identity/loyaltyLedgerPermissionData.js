/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module loyaltyLedger/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner loyaltyLedger @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "loyalty.rewards.earn",
    "name": "loyalty.rewards.earn",
    "active": true,
    "ownerModule": "loyaltyLedger"
  },
  "record1": {
    "code": "loyalty.sampleCredit.apply",
    "name": "loyalty.sampleCredit.apply",
    "active": true,
    "ownerModule": "loyaltyLedger"
  },
  "record2": {
    "code": "loyalty.rewards.reverse",
    "name": "loyalty.rewards.reverse",
    "active": true,
    "ownerModule": "loyaltyLedger"
  }
};
