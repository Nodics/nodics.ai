/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical module-owned documentation CMS component records. */
module.exports = {
  "nodicsDocsPublicationnodenodicsdocsnodepagerulesdeterministicevaluation": {
    "code": "nodicsDocsPublicationnodenodicsdocsnodepagerulesdeterministicevaluation",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagerulesDeterministicEvaluation",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.16.29",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3ed0a4b24ea9cc6fa0efdd8e4caa831f0a9e87f5123eae32a38f2911f3e42579",
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
    "actor": "nodics.source",
    "author": "nodics.source",
    "reviewer": "",
    "approver": "",
    "publisher": "",
    "auditTrail": [],
    "active": true
  },
  "nodicsDocsPublicationpagenodicsdocsmetadatarulesdeterministicevaluation": {
    "code": "nodicsDocsPublicationpagenodicsdocsmetadatarulesdeterministicevaluation",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatarulesDeterministicEvaluation",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.16.29",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3ed0a4b24ea9cc6fa0efdd8e4caa831f0a9e87f5123eae32a38f2911f3e42579",
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
    "actor": "nodics.source",
    "author": "nodics.source",
    "reviewer": "",
    "approver": "",
    "publisher": "",
    "auditTrail": [],
    "active": true
  },
  "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepagerulesdeterministicevaluation": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepagerulesdeterministicevaluation",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepagerulesdeterministicevaluation",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.16.29",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3ed0a4b24ea9cc6fa0efdd8e4caa831f0a9e87f5123eae32a38f2911f3e42579",
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
    "actor": "nodics.source",
    "author": "nodics.source",
    "reviewer": "",
    "approver": "",
    "publisher": "",
    "auditTrail": [],
    "active": true
  },
  "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadatarulesdeterministicevaluation": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadatarulesdeterministicevaluation",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadatarulesdeterministicevaluation",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.16.29",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3ed0a4b24ea9cc6fa0efdd8e4caa831f0a9e87f5123eae32a38f2911f3e42579",
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
    "actor": "nodics.source",
    "author": "nodics.source",
    "reviewer": "",
    "approver": "",
    "publisher": "",
    "auditTrail": [],
    "active": true
  }
};
