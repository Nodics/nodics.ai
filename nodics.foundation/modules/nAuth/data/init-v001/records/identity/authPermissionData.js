/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module auth/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner auth @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "auth.internal.token.read",
    "name": "auth.internal.token.read",
    "active": true,
    "ownerModule": "auth"
  },
  "record1": {
    "code": "auth.internal.token.read.anyTenant",
    "name": "auth.internal.token.read.anyTenant",
    "active": true,
    "ownerModule": "auth"
  }
};
