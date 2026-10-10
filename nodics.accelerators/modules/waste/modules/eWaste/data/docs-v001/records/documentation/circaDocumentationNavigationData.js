/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Circa documentation navigation catalogue metadata. */
module.exports = {
  "record0": {
    "code": "circaDocumentationNavigationTree",
    "product": "circaDocumentationProduct",
    "name": "Circa Documentation Navigation",
    "renderer": "documentation.component.navigation",
    "searchLabel": "Search Circa documentation",
    "searchPlaceholder": "Search setup, runtime, modules, and customization",
    "emptyMessage": "No Circa documentation matches your search.",
    "expandable": true,
    "accessMode": "PUBLIC",
    "lifecycleState": "STAGED",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE"
    ],
    "active": true
  }
};
