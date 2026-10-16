/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commsCore/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner commsCore @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "communication.request",
    "name": "communication.request",
    "active": true,
    "ownerModule": "commsCore"
  },
  "record1": {
    "code": "communication.customer.read",
    "name": "communication.customer.read",
    "active": true,
    "ownerModule": "commsCore"
  },
  "record2": {
    "code": "communication.delivery.retry",
    "name": "communication.delivery.retry",
    "active": true,
    "ownerModule": "commsCore"
  },
  "record3": {
    "code": "communication.callback.receive",
    "name": "communication.callback.receive",
    "active": true,
    "ownerModule": "commsCore"
  }
};
