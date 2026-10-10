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
    "code": "nodicsDocsPublicationnodenodicsdocsnodepagecatalogproductdiscoverymanagement",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecatalogProductDiscoveryManagement",
    "lifecycleState": "ONLINE",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.16.29",
    "onlineVersion": "0.16.29",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d34ff7ea1fb40b6b580e980fa5d0e0ace9c80152e9e7d27f37e68795f3b1e290",
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
    "actor": "nodics.docs.generator",
    "author": "nodics.docs.generator",
    "reviewer": "nodics.docs.generator",
    "approver": "nodics.docs.generator",
    "publisher": "nodics.docs.generator",
    "auditTrail": [],
    "active": true
  },
  "record1": {
    "code": "nodicsDocsPublicationpagenodicsdocsmetadatacatalogproductdiscoverymanagement",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacatalogProductDiscoveryManagement",
    "lifecycleState": "ONLINE",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.16.29",
    "onlineVersion": "0.16.29",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ea3ff92438d6160015a5043df4818545d8cad5b42802225ba34b80b582378a35",
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
    "actor": "nodics.docs.generator",
    "author": "nodics.docs.generator",
    "reviewer": "nodics.docs.generator",
    "approver": "nodics.docs.generator",
    "publisher": "nodics.docs.generator",
    "auditTrail": [],
    "active": true
  },
  "record2": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepagecatalogproductdiscoverymanagement",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepagecatalogproductdiscoverymanagement",
    "lifecycleState": "ONLINE",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.16.29",
    "onlineVersion": "0.16.29",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ab0149c4700b6f1670953cdb9e9ecffadf1a2b35f95d5cd5777248d666800c7e",
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
    "actor": "nodics.docs.generator",
    "author": "nodics.docs.generator",
    "reviewer": "nodics.docs.generator",
    "approver": "nodics.docs.generator",
    "publisher": "nodics.docs.generator",
    "auditTrail": [],
    "active": true
  },
  "record3": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadatacatalogproductdiscoverymanagement",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadatacatalogproductdiscoverymanagement",
    "lifecycleState": "ONLINE",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.16.29",
    "onlineVersion": "0.16.29",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0882ed568f39a09d6bb68d4406c907846ebd4095d79e71e20b6e279f8ac68f14",
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
    "actor": "nodics.docs.generator",
    "author": "nodics.docs.generator",
    "reviewer": "nodics.docs.generator",
    "approver": "nodics.docs.generator",
    "publisher": "nodics.docs.generator",
    "auditTrail": [],
    "active": true
  }
};
