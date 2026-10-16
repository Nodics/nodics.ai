/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module bidding/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner bidding @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerce.bid.manage",
    "name": "commerce.bid.manage",
    "active": true,
    "ownerModule": "bidding"
  },
  "record1": {
    "code": "commerce.bid.participate",
    "name": "commerce.bid.participate",
    "active": true,
    "ownerModule": "bidding"
  }
};
