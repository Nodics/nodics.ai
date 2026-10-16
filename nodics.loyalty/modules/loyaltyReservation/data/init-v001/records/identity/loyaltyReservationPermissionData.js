/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module loyaltyReservation/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner loyaltyReservation @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "loyalty.rewards.reserve",
    "name": "loyalty.rewards.reserve",
    "active": true,
    "ownerModule": "loyaltyReservation"
  },
  "record1": {
    "code": "loyalty.rewards.capture",
    "name": "loyalty.rewards.capture",
    "active": true,
    "ownerModule": "loyaltyReservation"
  },
  "record2": {
    "code": "loyalty.rewards.release",
    "name": "loyalty.rewards.release",
    "active": true,
    "ownerModule": "loyaltyReservation"
  }
};
