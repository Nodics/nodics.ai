/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module cms/data/accessGroups @description Owns userGroup seed records administered through Profile and Axis. @layer data @owner cms @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "contentUserGroup",
    "name": "contentUserGroup",
    "active": true,
    "parentGroups": [
      "employeeUserGroup"
    ],
    "permissions": [
      "cms.backoffice.view",
      "cms.backoffice.manage",
      "cms.authoring.write",
      "cms.authoring.delete",
      "publish.lifecycle.create",
      "publish.lifecycle.view",
      "publish.lifecycle.validate",
      "publish.lifecycle.requestApproval",
      "publish.lifecycle.retry",
      "publish.lifecycle.rollback",
      "publish.lifecycle.withdraw",
      "publish.operations.view",
      "publish.operations.reconcile",
      "publish.operations.recover",
      "editorial.backoffice.read",
      "editorial.backoffice.manage",
      "editorial.workflow.submit",
      "editorial.workflow.read",
      "editorial.publish.execute",
      "editorial.publish.schedule",
      "editorial.publish.withdraw",
      "cms.delivery.authenticated.read"
    ]
  },
  "record1": {
    "code": "contentCreatorUserGroup",
    "name": "contentCreatorUserGroup",
    "active": true,
    "parentGroups": [
      "contentUserGroup"
    ]
  },
  "record2": {
    "code": "contentApproverUserGroup",
    "name": "contentApproverUserGroup",
    "active": true,
    "parentGroups": [
      "contentUserGroup"
    ]
  },
  "record3": {
    "code": "documentationAuthorUserGroup",
    "name": "documentationAuthorUserGroup",
    "active": true,
    "parentGroups": [
      "axisViewerUserGroup"
    ],
    "permissions": [
      "documentation.draft.create",
      "documentation.draft.update",
      "documentation.navigation.update",
      "documentation.dashboard.update",
      "documentation.accessPolicy.update",
      "documentation.search.preview",
      "documentation.sourceEvidence.review",
      "documentation.submitReview",
      "publish.lifecycle.create",
      "publish.lifecycle.validate",
      "publish.lifecycle.requestApproval"
    ]
  }
};
