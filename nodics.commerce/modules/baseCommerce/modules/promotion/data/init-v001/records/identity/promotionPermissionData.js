/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module promotion/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner promotion @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerce.promotion.read",
    "name": "commerce.promotion.read",
    "active": true,
    "ownerModule": "promotion"
  },
  "record1": {
    "code": "commerce.promotion.manage",
    "name": "commerce.promotion.manage",
    "active": true,
    "ownerModule": "promotion"
  },
  "record2": {
    "code": "commerce.promotion.approve",
    "name": "commerce.promotion.approve",
    "active": true,
    "ownerModule": "promotion"
  },
  "record3": {
    "code": "commerce.coupon.seller.manage",
    "name": "commerce.coupon.seller.manage",
    "active": true,
    "ownerModule": "promotion"
  },
  "record5": {
    "code": "commerce.promotion.draft.write",
    "name": "Author ordinary Promotion draft metadata",
    "active": true,
    "ownerModule": "promotion"
  },
  "record4": {
    "code": "commerce.promotion.own",
    "name": "commerce.promotion.own",
    "active": true,
    "ownerModule": "promotion"
  }
};
