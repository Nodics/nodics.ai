/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module paymentCore/data/permissionCatalogue @description Owns permission seed records administered through Profile and Axis. @layer data @owner paymentCore @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerce.payment.read",
    "name": "commerce.payment.read",
    "active": true,
    "ownerModule": "paymentCore"
  },
  "record1": {
    "code": "commerce.payment.reconcile",
    "name": "commerce.payment.reconcile",
    "active": true,
    "ownerModule": "paymentCore"
  },
  "record2": {
    "code": "commerce.payment.callback.receive",
    "name": "commerce.payment.callback.receive",
    "active": true,
    "ownerModule": "paymentCore"
  }
};
