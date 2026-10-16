/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner order @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerce.dispute.review",
    "name": "commerce.dispute.review",
    "active": true,
    "ownerModule": "order"
  },
  "record1": {
    "code": "commerce.refund.execute",
    "name": "commerce.refund.execute",
    "active": true,
    "ownerModule": "order"
  },
  "record2": {
    "code": "commerce.refund.exception.adjudicate",
    "name": "commerce.refund.exception.adjudicate",
    "active": true,
    "ownerModule": "order"
  },
  "record3": {
    "code": "commerce.order.read",
    "name": "commerce.order.read",
    "active": true,
    "ownerModule": "order"
  },
  "record4": {
    "code": "commerce.order.own.read",
    "name": "commerce.order.own.read",
    "active": true,
    "ownerModule": "order"
  },
  "record5": {
    "code": "commerce.lifecycle.read",
    "name": "commerce.lifecycle.read",
    "active": true,
    "ownerModule": "order"
  },
  "record6": {
    "code": "commerce.lifecycle.act",
    "name": "commerce.lifecycle.act",
    "active": true,
    "ownerModule": "order"
  },
  "record7": {
    "code": "commerce.lifecycle.own.create",
    "name": "commerce.lifecycle.own.create",
    "active": true,
    "ownerModule": "order"
  }
};
