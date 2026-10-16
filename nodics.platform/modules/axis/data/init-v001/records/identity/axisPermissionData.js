/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module axis/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner axis @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "axis.view",
    "name": "axis.view",
    "active": true,
    "ownerModule": "axis"
  },
  "record1": {
    "code": "axis.dashboard.view",
    "name": "axis.dashboard.view",
    "active": true,
    "ownerModule": "axis"
  },
  "record2": {
    "code": "axis.application.read",
    "name": "axis.application.read",
    "active": true,
    "ownerModule": "axis"
  },
  "record3": {
    "code": "axis.documentation.read",
    "name": "axis.documentation.read",
    "active": true,
    "ownerModule": "axis"
  }
};
