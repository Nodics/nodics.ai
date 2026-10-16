/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module discoveryConfig/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner discoveryConfig @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "discovery.config.read",
    "name": "discovery.config.read",
    "active": true,
    "ownerModule": "discoveryConfig"
  },
  "record1": {
    "code": "discovery.config.manage",
    "name": "discovery.config.manage",
    "active": true,
    "ownerModule": "discoveryConfig"
  }
};
