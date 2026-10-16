/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module product/data/businessAccessRole @description Explicit ordinary business access mappings; no inferred permissions or privileged lifecycle bypass. @owner product @layer data @override Govern through Profile; imports preserve installed records. */
module.exports = {
  "record0": {
    "code": "PRODUCT_VIEW",
    "name": "Products view",
    "active": true,
    "label": "Products view",
    "ownerModule": "product",
    "businessArea": "products",
    "businessAreaLabel": "Products",
    "accessLevel": "view",
    "groupCodes": [
      "productBusinessViewUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record1": {
    "code": "PRODUCT_EDIT",
    "name": "Products edit",
    "active": true,
    "label": "Products edit",
    "ownerModule": "product",
    "businessArea": "products",
    "businessAreaLabel": "Products",
    "accessLevel": "edit",
    "groupCodes": [
      "productBusinessEditUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record2": {
    "code": "PRODUCT_FULL_CONTROL",
    "name": "Products fullControl",
    "active": true,
    "label": "Products fullControl",
    "ownerModule": "product",
    "businessArea": "products",
    "businessAreaLabel": "Products",
    "accessLevel": "fullControl",
    "groupCodes": [
      "productBusinessFullControlUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
