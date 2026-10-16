/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module cms/data/businessAccessGroup @description Explicit ordinary business access mappings; no inferred permissions or privileged lifecycle bypass. @owner cms @layer data @override Govern through Profile; imports preserve installed records. */
module.exports = {
  "record0": {
    "code": "cmsBusinessViewUserGroup",
    "name": "Content view",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "cms.backoffice.view",
      "documentation.search.preview"
    ]
  },
  "record1": {
    "code": "cmsBusinessEditUserGroup",
    "name": "Content edit",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "cms.backoffice.view",
      "cms.authoring.write",
      "documentation.search.preview",
      "documentation.draft.create",
      "documentation.draft.update",
      "documentation.submitReview"
    ]
  },
  "record2": {
    "code": "cmsBusinessFullControlUserGroup",
    "name": "Content fullControl",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "profile.scope.read",
      "cms.backoffice.view",
      "cms.authoring.write",
      "cms.authoring.delete",
      "documentation.search.preview",
      "documentation.draft.create",
      "documentation.draft.update",
      "documentation.submitReview",
      "cms.backoffice.manage",
      "documentation.navigation.update",
      "documentation.dashboard.update"
    ]
  }
};
