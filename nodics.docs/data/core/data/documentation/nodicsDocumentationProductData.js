/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics framework documentation product catalogue metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocumentationProduct",
    "name": "Nodics Documentation",
    "description": "Business-friendly and developer-ready framework documentation rendered from a governed documentation content catalog.",
    "contentCatalog": "documentationContentCatalog",
    "site": "nodicsDocumentationSite",
    "publicRootPath": "/docs/framework",
    "defaultLocale": "en",
    "channels": [
      "axis",
      "nexus",
      "web"
    ],
    "ownerFunctionalModule": "nodics.docs",
    "audience": [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.draft.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "CONTENT_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true
  }
};
