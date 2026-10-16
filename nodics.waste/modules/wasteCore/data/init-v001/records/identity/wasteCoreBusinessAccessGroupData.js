/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wasteCore/data/businessAccessGroup @description Explicit ordinary business access mappings; no inferred permissions or privileged lifecycle bypass. @owner wasteCore @layer data @override Govern through Profile; imports preserve installed records. */
module.exports = {
  "record0": {
    "code": "wasteCoreBusinessViewUserGroup",
    "name": "Waste view",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "waste.backoffice.view",
      "waste.audit.read"
    ]
  },
  "record1": {
    "code": "wasteCoreBusinessEditUserGroup",
    "name": "Waste edit",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "waste.backoffice.view",
      "waste.audit.read",
      "waste.asset.create"
    ]
  },
  "record2": {
    "code": "wasteCoreBusinessFullControlUserGroup",
    "name": "Waste fullControl",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "waste.backoffice.view",
      "waste.audit.read",
      "waste.asset.create",
      "waste.marketplace.moderate"
    ]
  }
};
