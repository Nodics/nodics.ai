/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/data/docs-v001/records/documentation/profileNotificationRecipientsDocumentationPublicationStateData
 * @description Owns canonical profileNotificationRecipientsDocumentationPublicationStateData successor records; installation and publication remain governed.
 * @layer data
 * @owner profile
 */
module.exports = {
  "record0": {
    "code": "nodicsDocsPublicationnodenodicsdocsnodepageprofilenotificationrecipients",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageprofileNotificationRecipients",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1fce1e0d8179dfc7cbbfc6d965ff08b6525c59a3c08947681b06cdbe9caa03e5",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "auditTrail": [],
    "active": true,
    "author": "Codex"
  },
  "record1": {
    "code": "nodicsDocsPublicationpagenodicsdocsmetadataprofilenotificationrecipients",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataprofileNotificationRecipients",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b8b7521d3a4e8d63ebc99f2db2415260090b05609c25ed1dac04eebc41c8de68",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.draft.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "CONTENT_CHANGE",
      "ACCESS_POLICY_CHANGE",
      "SOURCE_EVIDENCE_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "auditTrail": [],
    "active": true,
    "author": "Codex"
  },
  "record2": {
    "code": "nodicsDocsPublicationsearch_metadatanodicsdocssearchnodenodicsdocsnodepageprofilenotificationrecipients",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepageprofilenotificationrecipients",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2276db5506a34084ab2ac4d8ec51b09c70340fced4be1599022005a122e27b49",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "auditTrail": [],
    "active": true,
    "author": "Codex"
  },
  "record3": {
    "code": "nodicsDocsPublicationsearch_metadatanodicsdocssearchpagenodicsdocsmetadataprofilenotificationrecipients",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadataprofilenotificationrecipients",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0175033dc3187e1d0a7028dc24a24e322312d9b8740aedd4eeaaa125360ce691",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "auditTrail": [],
    "active": true,
    "author": "Codex"
  }
};
