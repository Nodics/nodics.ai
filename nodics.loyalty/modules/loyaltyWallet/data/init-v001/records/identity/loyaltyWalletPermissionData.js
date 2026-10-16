/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module loyaltyWallet/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner loyaltyWallet @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "loyalty.wallet.open",
    "name": "loyalty.wallet.open",
    "active": true,
    "ownerModule": "loyaltyWallet"
  },
  "record1": {
    "code": "loyalty.wallet.read",
    "name": "loyalty.wallet.read",
    "active": true,
    "ownerModule": "loyaltyWallet"
  }
};
