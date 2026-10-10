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
    "code": "nodicsDocsPublicationnodenodicsdocsnodepagecommercecartorder",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecommerceCartOrder",
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
    "checksum": "075452a248b5f216700eaa866b9433fc4a7e5f97b098b5d4b1a4fd046f72dec6",
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
    "code": "nodicsDocsPublicationpagenodicsdocsmetadatacommercecartorder",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacommerceCartOrder",
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
    "checksum": "1c6e3eb14d9b3cc581bc726e00749cd6f946ce5d29d455b62bbf5a1229671ab1",
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
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepagecommercecartorder",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepagecommercecartorder",
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
    "checksum": "c9c3ed3d92a88a5aadd6dafaa4384a72a7d401e77d8c8bad0cb9e4a008fb6864",
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
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadatacommercecartorder",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadatacommercecartorder",
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
    "checksum": "b410144c9ab3df8041d5a62e200bc8dd7b37d32734671afdbb452bac0ff38aa3",
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
  "record4": {
    "code": "nodicsDocsPublicationnodenodicsdocsnodepagecommerceenterpriseoperations",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecommerceEnterpriseOperations",
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
    "checksum": "b0c7fd0684df8585644965fcca708bd8423092c728e2f1966bea050961aeb8d0",
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
  "record5": {
    "code": "nodicsDocsPublicationpagenodicsdocsmetadatacommerceenterpriseoperations",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacommerceEnterpriseOperations",
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
    "checksum": "c4207b80f187059c6069dd7bc97358366cbce0762c97bc62cb26557f327f45e1",
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
  "record6": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepagecommerceenterpriseoperations",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepagecommerceenterpriseoperations",
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
    "checksum": "53587fafa98e11066c2522f9c3a60bc1f97ea156abf5ccb8e0a71b44af0ee813",
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
  "record7": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadatacommerceenterpriseoperations",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadatacommerceenterpriseoperations",
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
    "checksum": "3f87673565597311e8d2738f93731bca0d50748090c9d2b936a740fe265370d0",
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
