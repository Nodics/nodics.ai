/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module fulfillmentCore/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner fulfillmentCore @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerce.fulfillment.read",
    "name": "commerce.fulfillment.read",
    "active": true,
    "ownerModule": "fulfillmentCore"
  },
  "record1": {
    "code": "commerce.fulfillment.return",
    "name": "commerce.fulfillment.return",
    "active": true,
    "ownerModule": "fulfillmentCore"
  }
};
