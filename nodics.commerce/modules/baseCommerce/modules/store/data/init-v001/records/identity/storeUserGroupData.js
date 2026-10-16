/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module store/data/accessGroups @description Owns userGroup seed records administered through Profile and Axis. @layer data @owner store @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "commerceOperatorUserGroup",
    "name": "commerceOperatorUserGroup",
    "active": true,
    "parentGroups": [
      "employeeUserGroup"
    ],
    "permissions": [
      "commerce.backoffice.view",
      "commerce.store.read",
      "commerce.product.read",
      "commerce.search.read",
      "commerce.catalog.read",
      "commerce.pricing.read",
      "commerce.tax.read",
      "commerce.promotion.read",
      "commerce.promotion.manage",
      "commerce.promotion.approve",
      "commerce.inventory.read",
      "commerce.inventory.operate",
      "commerce.cart.read",
      "commerce.order.read",
      "commerce.lifecycle.read",
      "commerce.lifecycle.act",
      "commerce.payment.read",
      "commerce.payment.reconcile",
      "commerce.fulfillment.read",
      "commerce.fulfillment.return",
      "commerce.search.publish"
    ]
  }
};
