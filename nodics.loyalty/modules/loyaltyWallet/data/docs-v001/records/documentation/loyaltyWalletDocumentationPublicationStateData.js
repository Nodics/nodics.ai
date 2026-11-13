/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics framework documentation publication state metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocsPublicationnodenodicsdocsnodepageloyaltywalletsrewardsledger",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageloyaltyWalletsRewardsLedger",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f4d57d0594d365d856c02c0efb92feb9b36bf589ab81a1eeea99801a76f83244",
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
    "author": "nodics.docs.generator",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsPublicationpagenodicsdocsmetadataloyaltywalletsrewardsledger",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataloyaltyWalletsRewardsLedger",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "abfe86cf5b1d886761d96e67b2ecec096ca8425362683a95386878c0b6506c60",
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
    "author": "nodics.docs.generator",
    "active": true
  },
  "record2": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepageloyaltywalletsrewardsledger",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepageloyaltywalletsrewardsledger",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b024af4c8552a74b849a5be973d306c926b08c07f304a7018f01b331dd03c897",
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
    "author": "nodics.docs.generator",
    "active": true
  },
  "record3": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadataloyaltywalletsrewardsledger",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadataloyaltywalletsrewardsledger",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "9e686dcff723f846300ea934a632ec7fbafd7d58abb08fe45cf2f107860b0261",
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
    "author": "nodics.docs.generator",
    "active": true
  }
};
