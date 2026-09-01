/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics Axis documentation publication state metadata. */
module.exports = {
  "record0": {
    "code": "axisDocsPublicationproductaxisdocumentationproduct",
    "targetType": "PRODUCT",
    "targetCode": "axisDocumentationProduct",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "276eef4a9dd556dd9d3c7d9368a6a19b1687f47492e4a511860a0a3dfb53346c",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.draft.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "CONTENT_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record1": {
    "code": "axisDocsPublicationnavigationaxisdocumentationnavigationmetadata",
    "targetType": "NAVIGATION",
    "targetCode": "axisDocumentationNavigationMetadata",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d7db60978e5c86b0b865395b79d697651bfbe30a247d2c1a1ff681e2fa0bdef5",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record2": {
    "code": "axisDocsPublicationaccesspolicyaxisdocsaccesspublic",
    "targetType": "ACCESS_POLICY",
    "targetCode": "axisDocsAccessPublic",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bee45f6d71c9e1d635f35d375b8f1a4dfc484e2d7a7fdb883270d7e28a3c3a0b",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.accessPolicy.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "ACCESS_POLICY_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record3": {
    "code": "axisDocsPublicationaccesspolicyaxisdocsaccessauthenticated",
    "targetType": "ACCESS_POLICY",
    "targetCode": "axisDocsAccessAuthenticated",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "42844cffa9299ec15ba7101f0c51ec9e9fa11c762189e98b72214b511fa620a5",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.accessPolicy.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "ACCESS_POLICY_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record4": {
    "code": "axisDocsPublicationnodeaxisdocsnoderoot",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeRoot",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bf3e764ce49322ff890fdedad044cc3f2a6ae5da559390cd3bbdf53be843c6b7",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record5": {
    "code": "axisDocsPublicationnodeaxisdocsnodesecdiscoveraxis",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeSecdiscoverAxis",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d0c97ac6624ccb529bd181eb61a0e9f5e4adbfd55371e7c986ebd6e3784eb331",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record6": {
    "code": "axisDocsPublicationnodeaxisdocsnodesecbuildandoperateaxis",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeSecbuildAndOperateAxis",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f37d9f1e8f4038de714fcf7fc405f5acbbd57ee46c3cec944be11ee273503bfd",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record7": {
    "code": "axisDocsPublicationnodeaxisdocsnodesecaxiscapabilities",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeSecaxisCapabilities",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4b36fb4924c700150a67044295a12462f04299bdc3837cdc94fce6e225b3b20d",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record8": {
    "code": "axisDocsPublicationnodeaxisdocsnodeseccontributetoaxis",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeSeccontributeToAxis",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2956c5f502168ec80f5efa6acddbd5bdcc1476d1b1b8b743503f934a14ab0636",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record9": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisoverview",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisOverview",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d95bd22b5951a99eb5cc9c436bc451e1ad62f0549649dda2b5f2ecf29a948e0f",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record10": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisarchitecture",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisArchitecture",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a1642ad24d535327add8982d3b7862573077978f60097b97282f8b45dc5d7dab",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record11": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxistechnologystack",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisTechnologyStack",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5f6206ac4d9147c76ea33aa7e726405b249e8e4a99fa94ce7ea6e181012d3cee",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record12": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisdesignsystem",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisDesignSystem",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "228fe3ceca1848e13d46cd8a0ce2ef4c5ead7b99fd806f3cd5fe364f58ac9202",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record13": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxiscmsrenderers",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisCmsRenderers",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "02c6a40c03d2321be408839797499dd92614c91ec5d4fbe49531c4c7bdeb66fd",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record14": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisdocumentationcontent",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisDocumentationContent",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e3ddda128828789b7da1e2582d60543680163daa21610e66527d70eed951a0fb",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record15": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisemployeeaccess",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisEmployeeAccess",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5b5d9b88e0ad803afb6015db9fcf49bffbf47d5f76ecdd5338944be18bb198b5",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record16": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisassistant",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisAssistant",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2f025d1e6661fd64141b2be53bd20b3a05b5f98444f69023118f65a428ca9004",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record17": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisschemaworkbench",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisSchemaWorkbench",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ef0e87ad8b57a1d8c35afb1d66af580d2b385d5f9a90a366a0cd0c1449a069ad",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record18": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxispagedesigner",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisPageDesigner",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0d3aa28fcd9905cca43a83dbb4b2978a29f4ca057884787ece1ce9fac3133f72",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record19": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisexperiencestudio",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisExperienceStudio",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3e995a9fca08c4ad826fa0e3644d760752c17502ef8c10c2e05f9947b987a4f9",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record20": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxismodulehealth",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisModuleHealth",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "77d4a5b0f0398d8b891a588ded1a5e51f3baa2fba624e3396bc9fa55a6822958",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record21": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisimportsexports",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisImportsExports",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "82bdd3b5cefcb8fe1ea76f498698c41c796ca57bb216628bd9d0432f71368975",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record22": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxismediamanagement",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisMediaManagement",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "df55236a32400fa5c88641adbdaf99125bd7d8835e4585230a8a9d5af3a72d40",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record23": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxiscustomerengagement",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisCustomerEngagement",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ea08dd19dd3b1fa28c68d06b114cd5ebc0967ac67d377c26f0a9c8b219454fd2",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record24": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisopenapireference",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisOpenapiReference",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "70fb20a11fb7e6e425eb6a36add785b2af8a3518efe5bcf025d540bc888a4494",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record25": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisfeaturedelivery",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisFeatureDelivery",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a6d8299a5af69f3b7c1b599a949bfab48cef95b1a2ef7369b20d63974c24749a",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record26": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisimplementationcontract",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisImplementationContract",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d4e3a5383ecaf44edd04753a30c7534251f3214ffffd0491ba572a24e045382e",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record27": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardproduct",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardProduct",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "144d1416d5fca4675e05383513e26c190fa54b8b19435580a131f0f9c5a5bd8e",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record28": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardnavigation",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardNavigation",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bb41603654ebf45561fa20ae95dc99043242f9a96e3f6835df903bdf4ab24fba",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record29": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardsecdiscoveraxis",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardSecdiscoverAxis",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a4d9845bf3f0acedee3d3fad788a32104f97f370c973c13db8f5698916ea1f74",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record30": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardsecbuildandoperateaxis",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardSecbuildAndOperateAxis",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "cb69f73e3a90201e514a6e8bd9feab6a964751f67ad590bbface7e95fdf336a1",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record31": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardsecaxiscapabilities",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardSecaxisCapabilities",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0c18cbe315d4e2ad89d979ce49b28bfcdccfb89e51a9d9580d16397779404700",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record32": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardseccontributetoaxis",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardSeccontributeToAxis",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6bc972cfd3921f96d8d8e6e895a9332e9ef11d9d58b09ad07f6e0442aff69d8b",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record33": {
    "code": "axisDocsPublicationpageaxisdocsmetadataoverview",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataoverview",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ed125e1f28824a0dd2b8a143cc3cdb2ca571615e256fa8d80c5a660e6286d8d6",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record34": {
    "code": "axisDocsPublicationpageaxisdocsmetadataarchitecture",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataarchitecture",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "91ccf58cb15305e4f9bf936db500da090888ff70cacdd624a0bdc67712d02399",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record35": {
    "code": "axisDocsPublicationpageaxisdocsmetadatatechnologystack",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatatechnologystack",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "57d99a14658430da917f306432c631f0e0e52732f2af2349826899c764391dd7",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record36": {
    "code": "axisDocsPublicationpageaxisdocsmetadatadesignsystem",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatadesignsystem",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "045861d4c35d859a8266918704a58f858b6ef3dd7955d03e399b067780bb606a",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record37": {
    "code": "axisDocsPublicationpageaxisdocsmetadatacmsrenderers",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatacmsrenderers",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c1cc81109bcfe31dc4d0ef970b321b19a395a2711e49c27c3a33295f8b3eff7b",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record38": {
    "code": "axisDocsPublicationpageaxisdocsmetadatadocumentationcontent",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatadocumentationcontent",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "67f6b5157f8204dd3f3fae26c7562564e4529dde47e62440b962e89c7d59571e",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record39": {
    "code": "axisDocsPublicationpageaxisdocsmetadataemployeeaccess",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataemployeeaccess",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d215b5cad5f69b1774599db2ab3ed669ad7b9c089a5ddc98c81f604f5dcd2b94",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record40": {
    "code": "axisDocsPublicationpageaxisdocsmetadataassistant",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataassistant",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "01e432b630ec2f161ac33e241a1224ff36456f4dfc3193773c3748d76724f614",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record41": {
    "code": "axisDocsPublicationpageaxisdocsmetadataschemaworkbench",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataschemaworkbench",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8a8317f1c322e7da0fc5d72662a1e489ed22ab02bb037365073433d20e944c9a",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record42": {
    "code": "axisDocsPublicationpageaxisdocsmetadatapagedesigner",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatapagedesigner",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2c8ab0ac0bf4681260d766a7a9e63dd43094bc2e271895455711a81fb6591743",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record43": {
    "code": "axisDocsPublicationpageaxisdocsmetadataexperiencestudio",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataexperiencestudio",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "dde2fdd0a3274c4e0fa023a7fc89df2ddce39a999f7ac709e6b86b685f25565d",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record44": {
    "code": "axisDocsPublicationpageaxisdocsmetadatamodulehealth",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatamodulehealth",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3cb0937a943b5ac3a28e7efaebef708af1567e1fdf66ab45cb6b4f7b8daa8dc0",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record45": {
    "code": "axisDocsPublicationpageaxisdocsmetadataimportsexports",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataimportsexports",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "005f86e185ddc31039b2deb73b51ba06558543fa5b177e73bd14003266755cc1",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record46": {
    "code": "axisDocsPublicationpageaxisdocsmetadatamediamanagement",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatamediamanagement",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a3b70b146d85af8d3ca20a48ca87b5e681a90d19a40abc96767f6a4da5a23a58",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record47": {
    "code": "axisDocsPublicationpageaxisdocsmetadatacustomerengagement",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatacustomerengagement",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "05277b26047cc31990f48c0c1cdc44a3f2733bd70d49d9ef3a1de978951105a0",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record48": {
    "code": "axisDocsPublicationpageaxisdocsmetadataopenapireference",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataopenapireference",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "22ced51be3e4f70a9c143aac0253f8674e36b7bb5abda6f583ab4eb5c0b005c5",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record49": {
    "code": "axisDocsPublicationpageaxisdocsmetadatafeaturedelivery",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatafeaturedelivery",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3c0bb05e4aa352157b2fe17138e67ab1774c029d71ebc27ac9f67cedac496ce4",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record50": {
    "code": "axisDocsPublicationpageaxisdocsmetadataimplementationcontract",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataimplementationcontract",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3e490cbc41b27feda1ef4f62f0fe74a1ec15b7221ee3427d98e133c38e145dbf",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record51": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchproductaxisdocumentationproduct",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchproductaxisdocumentationproduct",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c87145549cd2e09c1bed84e222c3d9a481c6699fb037e48a11fd5e0c66ec19a3",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record52": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnavigationaxisdocumentationnavigationmetadata",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnavigationaxisdocumentationnavigationmetadata",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "efa2d0163eb8a01c727b3e0ccb3c9e345cd4f6fd0970f51975cd623a860c6e0f",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record53": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnoderoot",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnoderoot",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "980559ac231f830889cba4a298507cf9a24458e606b03e29e9fb4e4c4207b2d8",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record54": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodesecdiscoveraxis",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodesecdiscoveraxis",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "eb2023781323b4d8091b82b4b726b5d334f96b999cf931050d6d71324ef28794",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record55": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodesecbuildandoperateaxis",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodesecbuildandoperateaxis",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3ed404654c6edc0a1263d2c2a840bab1873bf81d58c7fbc9115e1a4ed4542f6d",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record56": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodesecaxiscapabilities",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodesecaxiscapabilities",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "538fc3f5c377d1dd9376578c8944b85c7b93be97f22ce202020d38307e241982",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record57": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodeseccontributetoaxis",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodeseccontributetoaxis",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "eb856b52c543e7e46ee796fd78158776a2be21860cc4eac1ace69cb6a49360aa",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record58": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisoverview",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisoverview",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8d24214854f54a39627b54a7790382a1472209830f64703d9b5cff18390ff2aa",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record59": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisarchitecture",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisarchitecture",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "9b9d7859222519d5fda6b3fd9d5f6cc765ea79ce534e3a21d9ed7ce49e73de9d",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record60": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxistechnologystack",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxistechnologystack",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7af85c76a51c113a1db69206304f6db88dcde05441a29dcc9bfedd4f2300aa78",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record61": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisdesignsystem",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisdesignsystem",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0e007c46dd8c293f0e41b66502ca0ba6e4a9ac7ccc4bb3666aba3875601c3a74",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record62": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxiscmsrenderers",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxiscmsrenderers",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5e24baac30b57055eccd170597d58f171aabb6dccd34d2afff04528cd88c4b3e",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record63": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisdocumentationcontent",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisdocumentationcontent",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8b16a7285d0291b996fe095b9a96589b2a891587af987b9db1cb70e7eafb8536",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record64": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisemployeeaccess",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisemployeeaccess",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1b150fa3e9a7502c9b723f86a34fb081ee624374b1c1bdcccad058b301a1fe96",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record65": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisassistant",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisassistant",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "726e33eb25ee737bfdb6ff9490120b546bee446aaab19ab6d0a4dd227f966271",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record66": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisschemaworkbench",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisschemaworkbench",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "da09ed927599b4a52a6a470e6200601c5df9b34f2b751e2ecc32482f629b9e47",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record67": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxispagedesigner",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxispagedesigner",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "351f0f9d2e1838d598ea598adf4eb120d0243601bf8fb33d0f1ec588cf168aed",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record68": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisexperiencestudio",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisexperiencestudio",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b704bb2c678514ae45ff9350d8315ef80365c8ea81de64e943b4ba8a57afa50c",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record69": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxismodulehealth",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxismodulehealth",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f38033c8011295c249a78c780835c97670c7171a4c11f27181cf007f78934834",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record70": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisimportsexports",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisimportsexports",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a33d562cd4256f79bd999c8c8d52f71c3456e9701d506c979198dbe207e870ab",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record71": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxismediamanagement",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxismediamanagement",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5ac2fd9399bf2fe44dd472aacbf24fbd533032b0ac1cb98f29de91cd3e30d781",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record72": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxiscustomerengagement",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxiscustomerengagement",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0c0a2253afbcf422522eb0fee4fbf4b04f03ee930b13e74615006f3cf4837346",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record73": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisopenapireference",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisopenapireference",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5ccefb14c942da93f4f9390096f435500c1788d4284d66de910e2aa09630a7f6",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record74": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisfeaturedelivery",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisfeaturedelivery",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "56fd77139a8e1412d3cdc238e2ea919f5d4c5b9662ce5796d41bcf3dc6a7586f",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record75": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisimplementationcontract",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisimplementationcontract",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0ef8f994a5a4259162bda648a0872e4236eaae5dc33255bab9d7a4a3132e8cfa",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record76": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardproduct",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardproduct",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1adca85adb11d2cdf5373cbb917059fb50101d5b17618b658f33e7bb67d54d8a",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record77": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardnavigation",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardnavigation",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "91fcb18a559894794d3ec57b548b3d16c344dfca67bc79dcaa51e907d24b1493",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record78": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardsecdiscoveraxis",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardsecdiscoveraxis",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "87bc99610cc95139bbe9096a63c0d88298fa0f26a704fd05d11530eb8c6c6fff",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record79": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardsecbuildandoperateaxis",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardsecbuildandoperateaxis",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0b363fc80a51ab80abdf650a68f9b30d26d4106502a785d936220ce87062b3cd",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record80": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardsecaxiscapabilities",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardsecaxiscapabilities",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "297f053b43bb163e01fd23e1d2b38da3e82098743432d1e40cc14d5c8bd71559",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record81": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardseccontributetoaxis",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardseccontributetoaxis",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8208f18a4c4f33d9791e6cb4cf04b0b04a88af8b1e8bb33e96abd0569e616108",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record82": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataoverview",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataoverview",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5536168d9057c0062e4e25aac271adfe906d5accac98d8c471793959773920dc",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record83": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataarchitecture",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataarchitecture",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "249b44a5c60a27a05552c3554b005f0288c4fef3dd78595e00715c0535ac465e",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record84": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatatechnologystack",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatatechnologystack",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3bb5aa750d2a6f90334b58be8b02b3fe2d8816b4f93807af97a9bbc10a582cc5",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record85": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatadesignsystem",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatadesignsystem",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c1e155cb26b0edef0dfc01194f66484d61114dbcd1deedc72845e875e406dc3b",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record86": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatacmsrenderers",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatacmsrenderers",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "60bb2bda3147e5c28325f96fb46cf1ea981b1fe3610489559081136a8cf9adf3",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record87": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatadocumentationcontent",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatadocumentationcontent",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2ac517a67a3a994cc2f6460f44d4273bedc2fd21a544ca1871a51a33c67a1a7e",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record88": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataemployeeaccess",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataemployeeaccess",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8cafe48084e3dd79e610125f067aa98f9d8d6e2583dab09dbe6ea1b5fde07774",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record89": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataassistant",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataassistant",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0328e7c277ecef16476d752c2c87ea66ef4786aa0ceb687c83837d296e31811b",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record90": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataschemaworkbench",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataschemaworkbench",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "64e65e0b93a2c6c19163d33cf9ef4f8e3c308a6df5e8858114e80a6605b1422a",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record91": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatapagedesigner",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatapagedesigner",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "010eb54e8616adb24d7b4ae3c70f8266e89727c8530f924cd7111f5201dd9ffd",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record92": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataexperiencestudio",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataexperiencestudio",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "fc726786fb7e9a8149e0e80308881a9bb9d94c32066cc9921cf7e2ffbfc24e64",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record93": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatamodulehealth",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatamodulehealth",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d6daacb4f1e39846dff9ddefae23f906a55cb1d121423cfca98f7b41cbb200f9",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record94": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataimportsexports",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataimportsexports",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a4d2c09d165a64c6488c72aa9fbc17121c2948a0b54b89334cb7c778ddb129f6",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record95": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatamediamanagement",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatamediamanagement",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "fd982f4e984149a1358602c8366d44de1208bf38f0523f88372eff9851e7fd9a",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record96": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatacustomerengagement",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatacustomerengagement",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1d5848a0f54867224fe635538f58a065571fe41ad8631cde3fad63b02df9efd1",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record97": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataopenapireference",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataopenapireference",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "752c6c0ec6b4dc9656144af865710ddebe3bcf3c9c9586e4acbf401f7ac5b048",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record98": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatafeaturedelivery",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatafeaturedelivery",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a85e8e23d273c2a2e68626f500edae67465d8f5ea94685398683c46086e73b57",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record99": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataimplementationcontract",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataimplementationcontract",
    "lifecycleState": "ONLINE",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "onlineVersion": "0.0.2",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e354927fb2dcf3afd7ce13f0e5e1d690a95a175b74e7d45e8c58a8830c180f1c",
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
    "actor": "nodics.platform.axis.generator",
    "author": "nodics.platform.axis.generator",
    "submittedBy": "",
    "submittedAt": "",
    "reviewer": "",
    "reviewedAt": "",
    "approver": "",
    "approvedAt": "",
    "publisher": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  }
};
