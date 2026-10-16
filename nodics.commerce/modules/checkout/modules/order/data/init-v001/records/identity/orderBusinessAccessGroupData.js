/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/data/businessAccessGroup @description Explicit ordinary business access mappings; no inferred permissions or privileged lifecycle bypass. @owner order @layer data @override Govern through Profile; imports preserve installed records. */
module.exports = {
  "record0": {
    "code": "orderBusinessViewUserGroup",
    "name": "Orders view",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "commerce.order.read",
      "commerce.lifecycle.read"
    ]
  },
  "record1": {
    "code": "orderBusinessEditUserGroup",
    "name": "Orders edit",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "commerce.order.read",
      "commerce.lifecycle.read",
      "commerce.lifecycle.act"
    ]
  },
  "record2": {
    "code": "orderBusinessFullControlUserGroup",
    "name": "Orders fullControl",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "commerce.order.read",
      "commerce.lifecycle.read",
      "commerce.lifecycle.act",
      "commerce.dispute.review"
    ]
  }
};
