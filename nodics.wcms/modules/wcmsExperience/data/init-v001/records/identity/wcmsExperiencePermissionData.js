/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wcmsExperience/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner wcmsExperience @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "storefront.backoffice.read",
    "name": "storefront.backoffice.read",
    "active": true,
    "ownerModule": "wcmsExperience"
  },
  "record1": {
    "code": "storefront.backoffice.manage",
    "name": "storefront.backoffice.manage",
    "active": true,
    "ownerModule": "wcmsExperience"
  },
  "record2": {
    "code": "storefront.operations.read",
    "name": "storefront.operations.read",
    "active": true,
    "ownerModule": "wcmsExperience"
  }
};
