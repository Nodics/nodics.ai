/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module editorial/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner editorial @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "editorial.backoffice.read",
    "name": "editorial.backoffice.read",
    "active": true,
    "ownerModule": "editorial"
  },
  "record1": {
    "code": "editorial.backoffice.manage",
    "name": "editorial.backoffice.manage",
    "active": true,
    "ownerModule": "editorial"
  },
  "record2": {
    "code": "editorial.workflow.submit",
    "name": "editorial.workflow.submit",
    "active": true,
    "ownerModule": "editorial"
  },
  "record3": {
    "code": "editorial.workflow.read",
    "name": "editorial.workflow.read",
    "active": true,
    "ownerModule": "editorial"
  },
  "record4": {
    "code": "editorial.publish.execute",
    "name": "editorial.publish.execute",
    "active": true,
    "ownerModule": "editorial"
  },
  "record5": {
    "code": "editorial.publish.schedule",
    "name": "editorial.publish.schedule",
    "active": true,
    "ownerModule": "editorial"
  },
  "record6": {
    "code": "editorial.publish.withdraw",
    "name": "editorial.publish.withdraw",
    "active": true,
    "ownerModule": "editorial"
  }
};
