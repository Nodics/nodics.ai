/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module inventory/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner inventory @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerce.inventory.read",
    "name": "commerce.inventory.read",
    "active": true,
    "ownerModule": "inventory"
  },
  "record1": {
    "code": "commerce.inventory.operate",
    "name": "commerce.inventory.operate",
    "active": true,
    "ownerModule": "inventory"
  }
};
