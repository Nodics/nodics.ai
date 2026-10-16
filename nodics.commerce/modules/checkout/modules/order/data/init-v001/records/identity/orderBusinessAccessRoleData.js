/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/data/businessAccessRole @description Explicit ordinary business access mappings; no inferred permissions or privileged lifecycle bypass. @owner order @layer data @override Govern through Profile; imports preserve installed records. */
module.exports = {
  "record0": {
    "code": "ORDER_VIEW",
    "name": "Orders view",
    "active": true,
    "label": "Orders view",
    "ownerModule": "order",
    "businessArea": "orders",
    "businessAreaLabel": "Orders",
    "accessLevel": "view",
    "groupCodes": [
      "orderBusinessViewUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record1": {
    "code": "ORDER_EDIT",
    "name": "Orders edit",
    "active": true,
    "label": "Orders edit",
    "ownerModule": "order",
    "businessArea": "orders",
    "businessAreaLabel": "Orders",
    "accessLevel": "edit",
    "groupCodes": [
      "orderBusinessEditUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record2": {
    "code": "ORDER_FULL_CONTROL",
    "name": "Orders fullControl",
    "active": true,
    "label": "Orders fullControl",
    "ownerModule": "order",
    "businessArea": "orders",
    "businessAreaLabel": "Orders",
    "accessLevel": "fullControl",
    "groupCodes": [
      "orderBusinessFullControlUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
