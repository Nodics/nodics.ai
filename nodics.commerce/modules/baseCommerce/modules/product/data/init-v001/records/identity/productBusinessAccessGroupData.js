/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module product/data/businessAccessGroup @description Explicit ordinary business access mappings; no inferred permissions or privileged lifecycle bypass. @owner product @layer data @override Govern through Profile; imports preserve installed records. */
module.exports = {
  "record0": {
    "code": "productBusinessViewUserGroup",
    "name": "Products view",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "commerce.product.read"
    ]
  },
  "record1": {
    "code": "productBusinessEditUserGroup",
    "name": "Products edit",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "commerce.product.read",
      "commerce.product.write"
    ]
  },
  "record2": {
    "code": "productBusinessFullControlUserGroup",
    "name": "Products fullControl",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "commerce.product.read",
      "commerce.product.write",
      "commerce.product.archive"
    ]
  }
};
