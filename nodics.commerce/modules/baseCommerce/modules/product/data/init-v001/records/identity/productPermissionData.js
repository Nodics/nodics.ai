/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module product/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner product @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerce.product.read",
    "name": "commerce.product.read",
    "active": true,
    "ownerModule": "product"
  },
  "record1": {
    "code": "commerce.product.publish",
    "name": "commerce.product.publish",
    "active": true,
    "ownerModule": "product"
  },
  "record2": {
    "code": "commerce.product.write",
    "name": "Author enterprise Product roots in Staged",
    "active": true,
    "ownerModule": "product"
  },
  "record3": {
    "code": "commerce.product.archive",
    "name": "Archive enterprise Product source roots in Staged",
    "active": true,
    "ownerModule": "product"
  }
};
