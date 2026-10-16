/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module promotion/data/businessAccessRole @description Explicit ordinary business access mappings; no inferred permissions or privileged lifecycle bypass. @owner promotion @layer data @override Govern through Profile; imports preserve installed records. */
module.exports = {
  "record0": {
    "code": "PROMOTION_VIEW",
    "name": "Promotions view",
    "active": true,
    "label": "Promotions view",
    "ownerModule": "promotion",
    "businessArea": "promotions",
    "businessAreaLabel": "Promotions",
    "accessLevel": "view",
    "groupCodes": [
      "promotionBusinessViewUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record1": {
    "code": "PROMOTION_EDIT",
    "name": "Promotions edit",
    "active": true,
    "label": "Promotions edit",
    "ownerModule": "promotion",
    "businessArea": "promotions",
    "businessAreaLabel": "Promotions",
    "accessLevel": "edit",
    "groupCodes": [
      "promotionBusinessEditUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record2": {
    "code": "PROMOTION_FULL_CONTROL",
    "name": "Promotions fullControl",
    "active": true,
    "label": "Promotions fullControl",
    "ownerModule": "promotion",
    "businessArea": "promotions",
    "businessAreaLabel": "Promotions",
    "accessLevel": "fullControl",
    "groupCodes": [
      "promotionBusinessFullControlUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
