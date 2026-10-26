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
 * @module profile/data/docs-v001/records/documentation/profileDocumentationPublicationStateData
 * @description Owns canonical profileDocumentationPublicationStateData successor records; installation and publication remain governed.
 * @layer data
 * @owner profile
 */
module.exports = {
  "record0": {
    "code": "nodicsDocsPublicationnodenodicsdocsnodepageplatformoverview",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageplatformOverview",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3a8253d7b82f3107a6a9396845baa69f4f85101d908cc844b081f27f538878fe",
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
    "code": "nodicsDocsPublicationnodenodicsdocsnodepagesecurityidentityaccessgovernance",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagesecurityIdentityAccessGovernance",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2dd52177486f0da99f7fad10019c12a42349005772492e628e540b232cf8869b",
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
  "record2": {
    "code": "nodicsDocsPublicationpagenodicsdocsmetadataplatformoverview",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataplatformOverview",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "85067419846ffd32bf0b3b66980fc7ef8f5b90bda7f85b2059ef8398d4f5926b",
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
  "record3": {
    "code": "nodicsDocsPublicationpagenodicsdocsmetadatasecurityidentityaccessgovernance",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatasecurityIdentityAccessGovernance",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "61cc60ef7dc62909d0671820995966f79895f5f9d4ba2eef52d4ef78695cd48d",
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
  "record4": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepageplatformoverview",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepageplatformoverview",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "51c328be34c0c6aa09c4e860015ae10490d1316f48331bb3b46655fb015367d2",
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
  "record5": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepagesecurityidentityaccessgovernance",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepagesecurityidentityaccessgovernance",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "715356e56213f5bdd56f2e613f8b3b7d8a301b323aafc8ad21b448606d555d7a",
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
  "record6": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadataplatformoverview",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadataplatformoverview",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4143d40656e277761977009d598ee2f1c5568682935568d824c1411d55c906f7",
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
  "record7": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadatasecurityidentityaccessgovernance",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadatasecurityidentityaccessgovernance",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "45f74dbb77c7daebfd9d45603122a70265323d0f1c7a51510fd912a47ec24901",
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
