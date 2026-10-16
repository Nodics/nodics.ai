/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wasteCore/data/businessAccessRole @description Explicit ordinary business access mappings; no inferred permissions or privileged lifecycle bypass. @owner wasteCore @layer data @override Govern through Profile; imports preserve installed records. */
module.exports = {
  "record0": {
    "code": "WASTE_VIEW",
    "name": "Waste view",
    "active": true,
    "label": "Waste view",
    "ownerModule": "wasteCore",
    "businessArea": "waste",
    "businessAreaLabel": "Waste",
    "accessLevel": "view",
    "groupCodes": [
      "wasteCoreBusinessViewUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record1": {
    "code": "WASTE_EDIT",
    "name": "Waste edit",
    "active": true,
    "label": "Waste edit",
    "ownerModule": "wasteCore",
    "businessArea": "waste",
    "businessAreaLabel": "Waste",
    "accessLevel": "edit",
    "groupCodes": [
      "wasteCoreBusinessEditUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  },
  "record2": {
    "code": "WASTE_FULL_CONTROL",
    "name": "Waste fullControl",
    "active": true,
    "label": "Waste fullControl",
    "ownerModule": "wasteCore",
    "businessArea": "waste",
    "businessAreaLabel": "Waste",
    "accessLevel": "fullControl",
    "groupCodes": [
      "wasteCoreBusinessFullControlUserGroup"
    ],
    "scopeType": "ENTERPRISE",
    "delegable": true,
    "assignmentPermissions": []
  }
};
