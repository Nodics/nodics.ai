/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/data/specialAccessRoles @description Defines advanced owner responsibilities; Profile retains authority and existing records on replay. @owner inventory @layer data */
module.exports = {
  "record0": {
    "code": "COMMERCE_INVENTORY_OPENING",
    "name": "Opening Inventory",
    "label": "Opening Inventory",
    "active": true,
    "description": "Opening Inventory requires independent owner admission; assignment grants no execution approval.",
    "groupCodes": [
      "commerceInventoryOpeningUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": [],
    "ownerModule": "inventory"
  }
};
