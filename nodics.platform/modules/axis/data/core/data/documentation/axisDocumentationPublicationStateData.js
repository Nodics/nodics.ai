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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3088e328febf31c278baec30fbd6762d32fd0a50d7658af319cec6422bef83e8",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c32b57527f0204bf80256542fee9fca12d4d1859a7f0681f96597ee970b3335f",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e2756a31dc61d95213740ba853e9c918307a631236474892c573e4497b96f61e",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b3eb129b13b921f0437f431fea7504a5fc88584e420f930162e5b8f5a6feecff",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e4d3ffff194dea996d19d6d700f6fd32dda8812dd0dc4ab0c587579a32e8d5df",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f73ed850aa74c2be9827d3d58bed4ccb2e986279db6899bf80868e3fb14c21ea",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c5d752447d0ada25c0265c634a9d5df39820cc547ba66e90b7231b09252040a4",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4114cf723b855cdb27b8d292c8c1c7955d7668799705163a0c64d69cc6260ab8",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1f8afa6eeebf75d86fdfcdc651b6ac7df54a9778fc63a0cf4ce0aab717e817d5",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4459882b94cabaf8b5e1284496ceca2c775cb0dc9bb298c90b12459e910d7289",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "838871b2471b4a33cb03f4cf99064b99c6a6d419f7119148f7a0a4704ab3a053",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8292c853c4fd4c5040dcc13b157a643393de2a7f32b1f8c397424ba528c0d20c",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7a7146a00274013aac9e7719a07e89522c3bba68ae1090ece4c09ac50f8b0518",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8ea8b04fab28615ab9450954d9670a758e603662deac81231c693cdecee5ebca",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "30f469e7b3bc3bcfadb8fc89fbc038294a7221ccb7de6830d10ce8d0b521988f",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "62464c462f8117910642492a1cb964eaa450c0404d8318766710bc12170bc103",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "69e7b9c090e718237bb1d1bd563bc59a1da846d8a000bfd1cb365d60d9a0cec5",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bbca68d9f10b02b1fed171e51b28cdd6b37f0e44d3e6ed40c0d3fdd3eaec514c",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2ddcd04b696b653bd30aab9e5834148dd826ffededb9855b7452409df74d435c",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "eed8876693e55a0458700c549cf3b9cf79b4e2ab85ff01f16e169802381336d4",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "865836099ba3da6c4a94d5ad23b0694ae42a3d3f039bda01c6946933d91ecfcc",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "96f7ede7038e64cf44c1712be05353a39087e0bc34bcf5e92bdb4a8d364dc12c",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "cdd37a0262c018d85f74de86bad4c057dcd2d60c38acd35389b51f6c05d1afb8",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f2478ea37badc649e4692c34f4c97ee7fc34c7d194509a7a8fb691cbd3691e6c",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1ca25bbd7de1184bb1ebd05f4d12a28d63847db2bad7f6b0d27aece9edb2592c",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bccb622084e4e5b63bc0df68e7087241a891ae3276fb1723d359f22732a97379",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6f2a284ce23eb090d70b9d68f03980ea32cbd75a70b302a7461eb41e4a03370d",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "10918fb8b398b37361193a478585c3db720e78930db4139601be9f0dc9e47629",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d2a747f10fa495cc1fda01bdb3bca8b203ca25880dd5a83b934dc5668593cd1f",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8c022bbff6113d76fb55179a1c81db924196c96f4f3d81114909f9c441c97290",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "99d377288699d423c53f2bca3f82c39c710b6399ff5bc42c2d89e7425462556a",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "06f44910b8e9a7e3cb5e563944d7fdae594ef2654d0ebd31c623f83d3818c488",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "cde4cef5bfdf71033833d5567b95bf7107746d7476105f6bb5fcb2686d4cbf7c",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "03b5b68e46f94fd00363f5c44da216117e6444aedc5c38d5d62273e63dfea91c",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "229d6b95599bc76878fff42957ed1dbd92a45f628e74db86702b813d5ce56304",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a965260262cba70d568260e9a63f98cd8e422ec081ff072a67aec7b78ac3eac0",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "dc4cb06737e3c085aa4ad2c0db71002bdfceeb5d147d7019560cf8508060e684",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b7dbf1766e3ab0b9c4208abb45de36667b7795b070899cff50b010667e14d60f",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b36db1624e8c314b35d2d66ebd848f52d9bd4d3d38f4df785368cfd784001226",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e010ee0657a24541d80d2c4fedcd2ea31a7332471be8e6a9ed35b465fcf92f51",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6c52fb572738690ba8d426bb40c8ba7b7355758ed01e036fac6e4900a1683223",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "875777631028df91007da40d7f0e78c2dd06d027e80f4e7a30977dcdc0a3a374",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "85552f29d4f996d1aeec2e3930d640755239e383556d1fa535d5c34dbb539aab",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0036aec628dbe22b98654aa359565d363e877d2ccbd35c05fb8c28f516627c26",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bbac0c86f0523c26fda949df89d818981beea190f70d3bbf53661aae4f5c3818",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5d3133bb09eb3757d187d325a5dd55659d8df7f8ae058927618dc0e9758c385c",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5bbba5515d67e22f5ac1b1473b6f6c0cf523771b3cec51d5293d55032e1771ee",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2c914f1adbaa5e2bd62e1733cc5206441850f71408333e65f21f1db67be80faa",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c1b0f8d18143c0523ee784a4170019af7d8fb50738c2d0ac3a14447e1bdc3a22",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "cb7b0cfd050c1976a53e43c98d20c120097b924ed76e4a0029cb54980c5bcffe",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8fad025c5410462d6ecc1ed51c49693621b1a659bb51c4fed395acf4159e1f20",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bac393a3947c2b55f16ad91fdee898eb9e27bbed9286139040abeb6ea1d622fa",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "9fc3c07edd4261df2f4d650760d36a7c5a962fcf01b5fb6cf42ca5e14b3189a9",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b44d86b37eb57667c36887c831dab04d0055866a496c8c59b6e1074e23d9057d",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a8aa15d0eacaaf4dd1b401aa54ca0c7d2d6ee56245cfa6857ade1ea989a0fb87",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "65209acb0aaa5647c2775b36cc17febf602fa2204af6d73984699631d2953843",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "02701fdfa464ced861ccdffb0f3bd6c147d58fbd767508bb207ec46ec3fc590b",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e7c34952761f533019366eb11fe0936a3a02a27f970a6a6b442a7e7755ac9138",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "9bda37c8d11a84bac46be25ba243a145d4b5b28694ca039c8c8803018259aeca",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c797cbfae18532427a9cb471583ea8afe062e01889c009b9565e309d2d96eb09",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "adfe7a9d3ff2695dc519cf03615146326260da8b45c07b05be0fb4a76fb797e8",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "554339020b09182f585ade87e911a3b540c5e71765b12ae195fa01bb68633a0b",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b63801ab21279f4913800fe0adceb2e8efe05a140a591d699901db51240e5b23",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c74a1adcc8da3677c0ddbe572584a2030edc17a1f01d441f2d685f0d10df6b16",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5f0b221cee9f098af4f00beb5a55151e5bda68d7eca2e5fd0ca74d63b1802f02",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e15907ea027cd2d1731be29cbd88ed070647b935783e05f875ce4a6c8ed785cf",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ab8fe540d7ab539fb117c4ad517f07347fac480ef78e09c5dcc3ca5b26cfc3d5",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ea0e1a116791fe24010adc96ceb74de520f769cff1e446cea84c9ae429f7dbf9",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7f82d1c06ce19d5612ce08cd9de31eb1f2b5e491ea0436c265f3e0cf7ece841f",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "da1763ab3d83a656cabb95164d9b370de36b02f58c847e9367f503599d55f486",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f43c03ed3ebcef77b22ba88962cd086907309282627d63b1639b63b4276eacc5",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d653260ec0f897b29f82b350f8a86ba68ce2909fb79ce486845e41579799f063",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7da2586b50bf6af0e4f1daff4cd48a622daedc1b7862fec6c6528db3fad4d832",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6a59a80c92d6f980890d0f3a0321fada8e43c8ea0623d0af807a6c803f523ab4",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "985b2035bcc938906c12c1baf5b07c80b7ab1a9eb8bcb68db4992e6d2d629d3a",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6bcf89c540fbc3e0d25996e71c4e86df00f20a6ccf8afa7eac2268765d5c9cb5",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e8195151463468431e81127427f530e3284fe080aab6b2a78899e99a75874421",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "63e4a2367e7a7bf2720548bf2a0d16f6a8bd2590c32235db11910410a2d18c4e",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f164c5130366314925036873d70d0a2d8de387721c5e0250be1d4e89533cc29b",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ac2c4a8365b60647ae6208f4086f2ee88477e2496029425d07f814b66d958b52",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "927dbdca435b3da896ff271d390cdbf0f351fc2863c7b9c793377f857b87b48b",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7626f3cff58e58b90c3a4bb0f7bb9a52e5dc273b30df55a61201c22ab1c0a6ce",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e923770b7703b81a7c7c6d70c5b33efeb59a3b3897908c42986055f090ad4f36",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "876acbb2a37565ec04a4fcbe12be63c9bf6ec5a4e406a1db6e532c85350795b8",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "74265e78ecc76731324887187e6e907937e2976972dcabe68d7633f1e6149306",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6d0d008f0a7bf44013aa9059627600514ffcca5c668758fcbd770d9fc4957479",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4f56786e2229b2c3bfb2eadbd46fe75b5131270e5f0fc177ddc02053de9d75f2",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c67e05f1971a57c079787065b4078bbac10c36f5c42bae9ba9eea82db948f1ca",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ad2c0eae3147ff5968316fb3001f54c661aa2bb428a26329669a9d50d6ffd21c",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f10ed6c8363f7da2fb938dffa747363028f077198040ac97d6e668e423e6a61f",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e62c8fdf7e8e16fe412fe9e82944df4cc7be1a4b9439221bc85d3296aeae5496",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "103832bddb6f2b3ffb4b2b379c156008201bbef8268db2b9821df4c24c77ef57",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "38ca70867d993acd189bfd238facafc777e6dad6723d16c20239edcbda403120",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "04e479d47fe689fd160bfa1fb212cc641d870e46f69f8bab1f7f17097b280390",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1d67310adbded306a1823204dc31efce075530d5b06aa5c95374f7ebe4e4cddd",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "070095c40bdcbcf5fbb99185367bb73cc2ba974da0854343ca944284f99da953",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f107ddfc056299ece4daa5dc135bcf23824a248b95ac30043e67bb6bad814ed9",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4b713d34faee9399a24e7bb2fd75cf04959cd4639c0a81d2157c97bb31787f58",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ef5365d0847ac3cb6b1d9e438d05d2ae4ea89578cfe5f3867d4379034c5b1cca",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3f84ce1618d14873d88011f717f6612350d12f6b15e21ebc0a626c422c75fa48",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2d2a6040668c48e64c91dfaea2168114208fef854b6d01362c98fad32b5b49ea",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "08783be1aebb36290db0ab3a6fe610bc0dc2f0578c2ee68d447c376deb28d84c",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8d137816279353499fb032a33f8ba5bb4e6dcdf269f15ed81e3544e7537a98b6",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "004d90d91879af7b04541e309b9198c8adfd69831849fead8ac78a85a6e03e38",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c8990c80ab34ed45ed1d8653a6301de0f1b5e007a6eaa404c01bdcef78a50a45",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bcb1f848c2ae48adfce789ff11879cd297ae1fbaf19de3ef7770c49c49114907",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a22be40b6f2d76deaf1da7795d74e0c32d66693df0ece07a7cc07789e751ccf5",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e312e529c06f26b5dbe7a250a385f56bcdbbf41fb83a69d07e250273e89ec532",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b8ff40d486d83fbf10602154c9e6dba9575dfebaaad4a0bf92005c5a451423d3",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f620aa8c0fcd53775ddfce4b025885b542610b389823cd9f5465747d43906730",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "49e10bcee026b7809826135452325fcfc1dca0c6d36c8cdb825f86ab67316922",
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
    "stagedVersion": "0.0.0",
    "onlineVersion": "0.0.0",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "667ea7075563964262dbe3e83ed8c2903f02f42c676c8b8da14eeaca388657a6",
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
    "auditTrail": [],
    "active": true
  }
};
