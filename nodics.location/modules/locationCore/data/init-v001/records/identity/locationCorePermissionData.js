/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module locationCore/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner locationCore @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "location.location.read",
    "name": "location.location.read",
    "active": true,
    "ownerModule": "locationCore"
  },
  "record1": {
    "code": "location.location.search",
    "name": "location.location.search",
    "active": true,
    "ownerModule": "locationCore"
  },
  "record2": {
    "code": "location.location.create",
    "name": "location.location.create",
    "active": true,
    "ownerModule": "locationCore"
  },
  "record3": {
    "code": "location.location.update",
    "name": "location.location.update",
    "active": true,
    "ownerModule": "locationCore"
  }
};
