/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module promotion/data/businessAccessGroup @description Explicit ordinary business access mappings; no inferred permissions or privileged lifecycle bypass. @owner promotion @layer data @override Govern through Profile; imports preserve installed records. */
module.exports = {
  "record0": {
    "code": "promotionBusinessViewUserGroup",
    "name": "Promotions view",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "commerce.promotion.read"
    ]
  },
  "record1": {
    "code": "promotionBusinessEditUserGroup",
    "name": "Promotions edit",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "commerce.promotion.read",
      "commerce.promotion.draft.write"
    ]
  },
  "record2": {
    "code": "promotionBusinessFullControlUserGroup",
    "name": "Promotions fullControl",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "commerce.promotion.read",
      "commerce.promotion.draft.write",
      "commerce.coupon.seller.manage"
    ]
  }
};
