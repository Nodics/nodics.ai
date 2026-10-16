/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commerceSearchCore/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner commerceSearchCore @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerce.search.read",
    "name": "commerce.search.read",
    "active": true,
    "ownerModule": "commerceSearchCore"
  },
  "record1": {
    "code": "commerce.search.publish",
    "name": "commerce.search.publish",
    "active": true,
    "ownerModule": "commerceSearchCore"
  }
};
