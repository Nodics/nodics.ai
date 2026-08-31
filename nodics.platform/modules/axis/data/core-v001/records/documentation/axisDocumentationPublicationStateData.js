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
    "code": "axisDocsPublicationnodeaxisdocsnodegrpdiscoveraxisaxisoverviewandarchitecture",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeGrpdiscoverAxisaxisOverviewAndArchitecture",
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
    "checksum": "d790464e9cabe6cd708f55553065a8fefe5d4016667dfb70c76aa5cc13d19292",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxisoverview",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisOverview",
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
    "checksum": "8490e609c6f715802e20a2762001eae18390138edd2654c9ccd973dc97d45508",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxisarchitecture",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisArchitecture",
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
    "checksum": "d575ab1f2f5bc87284e6be1168f918bbc877bfa77256aaff2a91751045d23789",
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
    "code": "axisDocsPublicationnodeaxisdocsnodegrpbuildandoperateaxisaxisbuildandruntime",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeGrpbuildAndOperateAxisaxisBuildAndRuntime",
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
    "checksum": "3488beac77e0799af688801bd3686a462023fb528fbebf08beba069f847ee8f7",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxistechnologystack",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisTechnologyStack",
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
    "checksum": "ca81f1a55e44ef577a881c99cff2915e657737a58b5da1a1d4ccff377202c8ae",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxisdesignsystem",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisDesignSystem",
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
    "checksum": "2e9354923dc112482d1992830277d367ac157ea6d8d2bdb592b59f61a51ea0cb",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxiscmsrenderers",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisCmsRenderers",
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
    "checksum": "9d85d4c85cd496a4c2248e479ecfdbbc8d7dbc8ba61b1fe098c66d22fcdfa99e",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxisdocumentationcontent",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisDocumentationContent",
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
    "checksum": "91270d9bea48d27372693e67df7acf1d22991110b284e3ea195a797041f852b0",
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
    "code": "axisDocsPublicationnodeaxisdocsnodegrpaxiscapabilitiesaxisworkspacesandoperations",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeGrpaxisCapabilitiesaxisWorkspacesAndOperations",
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
    "checksum": "c2229498eff4ee21a1300429df7ceb682cee61a5bc74b2f0b5cc8fdd406eef4a",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxisemployeeaccess",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisEmployeeAccess",
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
    "checksum": "68eeb7aebead52a5a314426484e6b67483a1b9094b064f6f62eaa4b8218351be",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxisassistant",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisAssistant",
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
    "checksum": "1a2f892d274ad318c53c241fd7aec134d57a407bf93dfd4980e7db988854f077",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxisschemaworkbench",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisSchemaWorkbench",
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
    "checksum": "9d10edf5724e238ee9a54bd041ec95d7776557b616e277e2bdb3d80203138b6a",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxispagedesigner",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisPageDesigner",
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
    "checksum": "56c2cc4963d34d71cf1e5bbbdf9af95076dd86c8171a2657817f4b87e68f3d39",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxismodulehealth",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisModuleHealth",
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
    "checksum": "3647ff382b14d1064d57b110e5e3b91ba87ab449f2f1076e110673305e5860f2",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxisimportsexports",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisImportsExports",
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
    "checksum": "d0e967df131c55d850c7b2080205b5a6a05dd25d768294909fd0ba4281528335",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxismediamanagement",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisMediaManagement",
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
    "checksum": "d457b8ee5773a6cb5bf39f90bafdbece4a612943faaaa0218ae85b4e0f7ae851",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxiscustomerengagement",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisCustomerEngagement",
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
    "checksum": "8b8320ca1b43b298686a9b6dde189f29f9370c4de59fbcaec4e65dde95790b31",
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
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxisopenapireference",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisOpenapiReference",
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
    "checksum": "209e8216bbafc4ac3368b696a9226cd69bf1f9652a00b3ff46f49ba50c557cab",
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
    "code": "axisDocsPublicationnodeaxisdocsnodegrpcontributetoaxisaxiscontributionandgovernance",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeGrpcontributeToAxisaxisContributionAndGovernance",
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
    "checksum": "1e6efba92bb281311f6093930f34ba43fd045153219514cb60347213d2c178e7",
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
  "record28": {
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxisfeaturedelivery",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisFeatureDelivery",
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
    "checksum": "829d52d051a3dc24fe19e16004b5971eb3b7cfd161ac09b0f871c5c4e44b1bb4",
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
  "record29": {
    "code": "axisDocsPublicationnodeaxisdocsnodetopicaxisimplementationcontract",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeTopicaxisImplementationContract",
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
    "checksum": "acc570d9d8ae07529308b155d7f337927b3eb5e31e41d55a898eb7d41b9a9e5d",
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
  "record30": {
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
  "record31": {
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
  "record32": {
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
  "record33": {
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
  "record34": {
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
  "record35": {
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
  "record36": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardgrpdiscoveraxisaxisoverviewandarchitecture",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardGrpdiscoverAxisaxisOverviewAndArchitecture",
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
    "checksum": "20147e20c46a38d476141961749b829a0c99b74f9c6f2efbe80e0e469c238298",
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
  "record37": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardgrpbuildandoperateaxisaxisbuildandruntime",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardGrpbuildAndOperateAxisaxisBuildAndRuntime",
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
    "checksum": "08de1e9eb1872b0fae8bb08eea518730f72620b1621515b98c8f46343f5a7548",
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
  "record38": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardgrpaxiscapabilitiesaxisworkspacesandoperations",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardGrpaxisCapabilitiesaxisWorkspacesAndOperations",
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
    "checksum": "0f1ef6033199cd7a40177d50ca4b425c9a414ca6723ad90e8891e7c0fe623c5a",
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
  "record39": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardgrpcontributetoaxisaxiscontributionandgovernance",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardGrpcontributeToAxisaxisContributionAndGovernance",
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
    "checksum": "15e601e1298b82e94f04ee7b94fa165b7306f47e4d65b404a629c15183e6a7e4",
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
  "record40": {
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
  "record41": {
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
  "record42": {
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
  "record43": {
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
  "record44": {
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
  "record45": {
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
  "record46": {
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
  "record47": {
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
  "record48": {
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
  "record49": {
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
  "record50": {
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
  "record51": {
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
  "record52": {
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
  "record53": {
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
  "record54": {
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
  "record55": {
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
  "record56": {
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
  "record57": {
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
  "record58": {
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
  "record59": {
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
  "record60": {
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
  "record61": {
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
  "record62": {
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
  "record63": {
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
  "record64": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodegrpdiscoveraxisaxisoverviewandarchitecture",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodegrpdiscoveraxisaxisoverviewandarchitecture",
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
    "checksum": "a8243c5d7c6dc53af44c46aa4cd7ff380e535875a4cda3cfbbe27933996643bb",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxisoverview",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxisoverview",
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
    "checksum": "8136630711cad5ed5c8ecadaaf6e8f45deee051ff53bda077afb93e9da4f23c2",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxisarchitecture",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxisarchitecture",
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
    "checksum": "2caa92e6fa391ad706cdc8afcac188ebba80035cb3dc55c69051eef9d4937474",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodegrpbuildandoperateaxisaxisbuildandruntime",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodegrpbuildandoperateaxisaxisbuildandruntime",
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
    "checksum": "6f9a1974d26b563fd0df9783396efb3b4102b983b8724f8cbb94d53f4cd98a00",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxistechnologystack",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxistechnologystack",
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
    "checksum": "f35d53fb427e00eff250bb3e429b9ce861ea4be5cac9ab4ed4caa8db832dce54",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxisdesignsystem",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxisdesignsystem",
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
    "checksum": "b0ac4ff8cb57088764ad34326fd1f3a2794428ced6bc361de97328911a7dea3d",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxiscmsrenderers",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxiscmsrenderers",
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
    "checksum": "e086c5bbfa2a079c8cd5c7457e4aa64da004964c12398ab789377f822c8ac245",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxisdocumentationcontent",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxisdocumentationcontent",
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
    "checksum": "77b2d6170da4c35d7098880531454aad9df2baa2b95bb154f2a0dfafdb641b84",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodegrpaxiscapabilitiesaxisworkspacesandoperations",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodegrpaxiscapabilitiesaxisworkspacesandoperations",
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
    "checksum": "ed0e9a356a53e9a1d8a0116389459b7e2022fe028752af85cefb920194d8ba48",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxisemployeeaccess",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxisemployeeaccess",
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
    "checksum": "cbf9daa16930759aa81dc1db447cd6f9455a41d0bdc0b4a2c1bf8433968e3bb3",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxisassistant",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxisassistant",
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
    "checksum": "bb44c633c63787ee62d264afe5be9760b6a9dd5c50bbed5979502ffe053fdeff",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxisschemaworkbench",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxisschemaworkbench",
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
    "checksum": "5f70e95eeaf0c8465b509651f6f82b20eb1e4c9bc3a62083ae15f0c5e47125ab",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxispagedesigner",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxispagedesigner",
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
    "checksum": "56029c17dd436817cfff6028b0195ef9af3857ec3de7e547437383f7ecae2e23",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxismodulehealth",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxismodulehealth",
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
    "checksum": "83d3c5058bc9c96d9d83e5412e82f0d2edd42940b0e2c3a59909b76cbd644f22",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxisimportsexports",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxisimportsexports",
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
    "checksum": "15059cb11e7a9647a06dec024ae088f04421ef31b47b7af40978db82bc247294",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxismediamanagement",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxismediamanagement",
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
    "checksum": "5de22da5bd9207692d99d04164e4f844f10c19286aa55ba0bfb7dd0a63632221",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxiscustomerengagement",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxiscustomerengagement",
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
    "checksum": "5391bd82eaf809a2b0295d20facc4591b97bbbff00caba6dfdc0ea7c1651b09f",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxisopenapireference",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxisopenapireference",
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
    "checksum": "d1b2e6e8dda11e80f3d0dbd744c90903f15fe840bd207595f9174e42cb1f5eba",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodegrpcontributetoaxisaxiscontributionandgovernance",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodegrpcontributetoaxisaxiscontributionandgovernance",
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
    "checksum": "24212585ba2fc20c1d9cf36b5c7efe16b33ad1c0075927154d4f4fab8f0e7e9a",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxisfeaturedelivery",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxisfeaturedelivery",
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
    "checksum": "698a265f4209951601d7b21bd15efe8d16ca926e87df42f8c85766c2d0e080dd",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodetopicaxisimplementationcontract",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodetopicaxisimplementationcontract",
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
    "checksum": "23ff89d58c97e2e95af9e21c4f6bfd5775a69bd540ee23bb8c4a332b6bae90ef",
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
  "record86": {
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
  "record87": {
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
  "record88": {
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
  "record89": {
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
  "record90": {
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
  "record91": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardgrpdiscoveraxisaxisoverviewandarchitecture",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardgrpdiscoveraxisaxisoverviewandarchitecture",
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
    "checksum": "2a2733a0c3b8acff9a3b7072f3b0c5affd58d7df8c7dea4ba9f23f5efcb01c13",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardgrpbuildandoperateaxisaxisbuildandruntime",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardgrpbuildandoperateaxisaxisbuildandruntime",
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
    "checksum": "ecd73bc1aba0b16a8cf52a63f69ba69e78d68688ea4fb4fa185765fdb69f70be",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardgrpaxiscapabilitiesaxisworkspacesandoperations",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardgrpaxiscapabilitiesaxisworkspacesandoperations",
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
    "checksum": "c6feb2c9f1786eb164494b208475b28dbf5c3760d5261f708a51b6ea73116c4d",
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
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardgrpcontributetoaxisaxis39cb895b4ecbc510",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardgrpcontributetoaxisaxiscontributionandgovernance",
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
    "checksum": "5f2bbd9c05a75395bf717dc86ad25631203ceff6c00f216ba7abd89e87d80a8c",
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
  "record96": {
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
  "record97": {
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
  "record98": {
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
  "record99": {
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
  "record100": {
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
  "record101": {
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
  "record102": {
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
  "record103": {
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
  "record104": {
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
  "record105": {
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
  "record106": {
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
  "record107": {
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
  "record108": {
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
  "record109": {
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
  "record110": {
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
  "record111": {
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
