/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module digitalCore/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner digitalCore @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerce.coupon.pos.redeem",
    "name": "commerce.coupon.pos.redeem",
    "active": true,
    "ownerModule": "digitalCore"
  },
  "record1": {
    "code": "commerce.digital.own.read",
    "name": "commerce.digital.own.read",
    "active": true,
    "ownerModule": "digitalCore"
  },
  "record2": {
    "code": "commerce.digital.own.reveal",
    "name": "commerce.digital.own.reveal",
    "active": true,
    "ownerModule": "digitalCore"
  },
  "record3": {
    "code": "commerce.digital.own.claim",
    "name": "commerce.digital.own.claim",
    "active": true,
    "ownerModule": "digitalCore"
  }
};
