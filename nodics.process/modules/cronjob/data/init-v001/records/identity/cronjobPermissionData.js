/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module cronjob/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner cronjob @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "cronjob.backoffice.view",
    "name": "cronjob.backoffice.view",
    "active": true,
    "ownerModule": "cronjob"
  },
  "record1": {
    "code": "cronjob.lifecycle.manage",
    "name": "cronjob.lifecycle.manage",
    "active": true,
    "ownerModule": "cronjob"
  }
};
