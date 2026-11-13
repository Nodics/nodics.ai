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
 * @module commsCore/data/docs-v001/records/documentation/communicationDurableOutcomesDocumentationPublicationStateData
 * @description Owns canonical communicationDurableOutcomesDocumentationPublicationStateData successor records; installation and publication remain governed.
 * @layer data
 * @owner commsCore
 */
module.exports = {
  "record0": {
    "code": "nodicsDocsPublicationnodenodicsdocsnodepagecommunicationdurableoutcomes",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecommunicationDurableOutcomes",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a379b1740df05337ed89ca64cd6f695c3e7cfd63c1fb2b6f22a5951979007985",
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
    "code": "nodicsDocsPublicationpagenodicsdocsmetadatacommunicationdurableoutcomes",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacommunicationDurableOutcomes",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "979bb54791847c35111c0f6968e63785a449c841c4d507ddcbef2ac5977bb55d",
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
    "code": "nodicsDocsPublicationsearch_metadatanodicsdocssearchnodenodicsdocsnodepagecommunicationdurableoutcomes",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepagecommunicationdurableoutcomes",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "cc463f2ae926e28ff436bd6d8703839df1d71f23d8f543d1cd3fe9ba7ca7b59b",
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
    "code": "nodicsDocsPublicationsearch_metadatanodicsdocssearchpagenodicsdocsmetadatacommunicationdurableoutcomes",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadatacommunicationdurableoutcomes",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ff0f678597f04603e6ace8c90bb53ece5b27f39b44eaae4f40a357da0bffa3c0",
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
