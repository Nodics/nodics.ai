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
    "code": "nodicsDocsPublicationnodenodicsdocsnodepagewasteimpactproviders",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagewasteImpactProviders",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "aa3974bba49f3cb7ff80877d296763e6630e53239d70c9d058844c545a7b1cb6",
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
    "actor": "wasteImpact.source-maintainer",
    "author": "wasteImpact.source-maintainer",
    "auditTrail": [],
    "active": true
  },
  "record1": {
    "code": "nodicsDocsPublicationpagenodicsdocsmetadatawasteimpactproviders",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatawasteImpactProviders",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4bba04f9178c8487e7e774dfc592c22e93478b66f76c729946c31e75801836e7",
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
    "actor": "wasteImpact.source-maintainer",
    "author": "wasteImpact.source-maintainer",
    "auditTrail": [],
    "active": true
  },
  "record2": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepagewasteimpactproviders",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepagewasteimpactproviders",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "231d0426fce7ae00f8c7cefb23633a20ae28a8adbcee4dd6c2bb17fe4b765d2b",
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
    "actor": "wasteImpact.source-maintainer",
    "author": "wasteImpact.source-maintainer",
    "auditTrail": [],
    "active": true
  },
  "record3": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadatawasteimpactproviders",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadatawasteimpactproviders",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6564001b3bb5da18a17a88a8e5086fb67100985b415cf561df194ce2df45d391",
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
    "actor": "wasteImpact.source-maintainer",
    "author": "wasteImpact.source-maintainer",
    "auditTrail": [],
    "active": true
  }
};
