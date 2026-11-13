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
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a9f01564ed8867ad4ac99609a7bad25ae4dbc5ab5261d2ac9a0790e5f734734f",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record1": {
    "code": "axisDocsPublicationnavigationaxisdocumentationnavigationmetadata",
    "targetType": "NAVIGATION",
    "targetCode": "axisDocumentationNavigationMetadata",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "09ddc575c66af422bb43ccc0527821c5095562b3780543c889bbe2d973ba6f59",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record2": {
    "code": "axisDocsPublicationaccesspolicyaxisdocsaccesspublic",
    "targetType": "ACCESS_POLICY",
    "targetCode": "axisDocsAccessPublic",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "161a99ee3f6e0a38c5512ac5614f24911a2a555520518448872c879062765963",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record3": {
    "code": "axisDocsPublicationaccesspolicyaxisdocsaccessauthenticated",
    "targetType": "ACCESS_POLICY",
    "targetCode": "axisDocsAccessAuthenticated",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1aa58f05b0999a16c038332a467ad21e6f0b91b013370ded2d8329e5b444417e",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record4": {
    "code": "axisDocsPublicationnodeaxisdocsnoderoot",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeRoot",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b4c92ee7640a1abfea429b1a869bd8e51d46a4533375040104ff320498d69551",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record5": {
    "code": "axisDocsPublicationnodeaxisdocsnodesecdiscoveraxis",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeSecdiscoverAxis",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c85235e5af16009e3f78b0d5d308899e690a0b9686d8dadabcdf6499ff226180",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record6": {
    "code": "axisDocsPublicationnodeaxisdocsnodesecbuildandoperateaxis",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeSecbuildAndOperateAxis",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2d0ef6ac920f82ba89957b6cb0048d293b2f18f989007163bf4440c16b110212",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record7": {
    "code": "axisDocsPublicationnodeaxisdocsnodesecaxiscapabilities",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeSecaxisCapabilities",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a40bf8c7a38e04095a3f2eb88e7d5d049e552293644602f51b97d3e9eb106968",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record8": {
    "code": "axisDocsPublicationnodeaxisdocsnodeseccontributetoaxis",
    "targetType": "NODE",
    "targetCode": "axisDocsNodeSeccontributeToAxis",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "85d4cbbcb1396da4a2bf0fe3d617fbb2b0df6cb54e21873b148e56bea552994f",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record9": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisoverview",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisOverview",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8f391792bd009eca16f000427edb31e6b4af02b9b0dc75fa9d6bcfac55b4b05f",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record10": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisarchitecture",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisArchitecture",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f3d0b062a06e82ae6b2f0c651ad9958834f575f379ca03ba7b2ed8722046bb50",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record11": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxistechnologystack",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisTechnologyStack",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "373cc96865a6a9cf14a102ae911026896419cbf8d963b6236c497c677a652733",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record12": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisdesignsystem",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisDesignSystem",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7619f906d236a85e751ad20cc540891a8d0e4afcdea0bd15d1043a55beea517a",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record13": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxiscmsrenderers",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisCmsRenderers",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "849f8c0e05651933d8f19f248bacfaa48d1610dc09b24d76596eb483ed5aaae3",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record14": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisdocumentationcontent",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisDocumentationContent",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "adc865b2a12e635d7c8714b4942722fe9f021dc13674065e08485311e5273fda",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record15": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisemployeeaccess",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisEmployeeAccess",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3c1ee7e56eae61f332f713e6615d5908bfcbc20ca5ea47b6d5bcdbb05ac0972b",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record16": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisassistant",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisAssistant",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1c8e6f81c4d7733164ce3323bfb7c75671b9d34c20304d467eb02d03cf500664",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record17": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisschemaworkbench",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisSchemaWorkbench",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d4034022d07878345b122f36cc683194fa132f7f578c33becffcb36bea957a8b",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record18": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxispagedesigner",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisPageDesigner",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1d3126710d8d60d81da3afd878bf1a618147eabf5d04c7a490a0cc0ad42b9f91",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record19": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisexperiencestudio",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisExperienceStudio",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "9bd2153b153d5f7b5c137fdf18a6a0a50aa973c40a98aa12ab0c87f72d0a005b",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record20": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxismodulehealth",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisModuleHealth",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d42fb6dc1f6bdab044f1dfba18e17c55b86ea854055954978ca6cd8d201d5fdb",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record21": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisimportsexports",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisImportsExports",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a01f7f2458e1924e469cc48e0bf03e76e89e4cc83b997ec460ee5ec639642441",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record22": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxismediamanagement",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisMediaManagement",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "264de48cf5bf549b9c9c1d3eb3c3fac3b1835ddca51c9127e338fa04ebe563e4",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record23": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxiscustomerengagement",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisCustomerEngagement",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "09eab7ae64468e22a907671d9e82d2d20f30c0158adb8e9f5e7af57a6df1a2ec",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record24": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisopenapireference",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisOpenapiReference",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "661115b05efdae82c24e2db0b2dfab15b9cf256cbf6092f4bcc4052adcb19be3",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record25": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisfeaturedelivery",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisFeatureDelivery",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e9812a6618beecc224c08353b80b0b698eff30484ce1feb5ad6bd2361d1a0823",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record26": {
    "code": "axisDocsPublicationnodeaxisdocsnodepageaxisimplementationcontract",
    "targetType": "NODE",
    "targetCode": "axisDocsNodePageaxisImplementationContract",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "52de9e659e8c98f31cdf0fe029b08c359e5fbb0731c5066e51b560cd0d68b60f",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record27": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardproduct",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardProduct",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "49c33afe75b2e7866a9f92a0029e9bc686bcb64f1a172900ae902d8ff349a7e9",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record28": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardnavigation",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardNavigation",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ceae2b1ee71a945406be95f92d7005dfd4980868cff977e4759a2128c4000d16",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record29": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardsecdiscoveraxis",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardSecdiscoverAxis",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7c46ef4ec91300fb0a102097fbf6521ade0a0d462cb06a5e8c4f019bd0b0feec",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record30": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardsecbuildandoperateaxis",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardSecbuildAndOperateAxis",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0110b713f6c77b89b5944a4aa434fb00bc885ed8ebc03427e50ee1eaec65054a",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record31": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardsecaxiscapabilities",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardSecaxisCapabilities",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "40ed579957655c645893155353c98ff3b38aa3b11d8274363647ff84a8b7f3b3",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record32": {
    "code": "axisDocsPublicationdashboardaxisdocsdashboardseccontributetoaxis",
    "targetType": "DASHBOARD",
    "targetCode": "axisDocsDashboardSeccontributeToAxis",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c875b91d698dc080303c18d476b8800d270eeeb5fd81a8ce1bafa2c588305d6b",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record33": {
    "code": "axisDocsPublicationpageaxisdocsmetadataoverview",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataoverview",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0e38b80c5813efc9656a45e8073d01e787e127a42cc92359228231fafa04041f",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record34": {
    "code": "axisDocsPublicationpageaxisdocsmetadataarchitecture",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataarchitecture",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c7edfae1b3e411a543d76d14023513275e20af5552a9e584771675f3fa33bf67",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record35": {
    "code": "axisDocsPublicationpageaxisdocsmetadatatechnologystack",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatatechnologystack",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f413bbfa2725f99da89ba795c27485591dfdd83a14b1484c60ad1c68179e8cae",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record36": {
    "code": "axisDocsPublicationpageaxisdocsmetadatadesignsystem",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatadesignsystem",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7214b4dc56dd828e811d41d3682b4875a1823104979fdecee84b2a9012982f80",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record37": {
    "code": "axisDocsPublicationpageaxisdocsmetadatacmsrenderers",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatacmsrenderers",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e65958ae13099d9de180d7a0f977cdaf1b43a80a2b358ffa14bd5f3933e2e3b7",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record38": {
    "code": "axisDocsPublicationpageaxisdocsmetadatadocumentationcontent",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatadocumentationcontent",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3bf787c6ef40cfd7b86a5a36fb2dd3ab72c1fbbee232120573c278509af4edc0",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record39": {
    "code": "axisDocsPublicationpageaxisdocsmetadataemployeeaccess",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataemployeeaccess",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6e92cf223b29e2a840e01b2e358dbd9415935424daf4a4ed85668c4fe198ec16",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record40": {
    "code": "axisDocsPublicationpageaxisdocsmetadataassistant",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataassistant",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "77687d5dd2b02892d887aed0f5999074eb5432d22ace326bac261654bcb34f41",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record41": {
    "code": "axisDocsPublicationpageaxisdocsmetadataschemaworkbench",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataschemaworkbench",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5de98e3b2986b29b1e1fb3a18bffe8b0ec7f70f2465fb01ec417371dd8734298",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record42": {
    "code": "axisDocsPublicationpageaxisdocsmetadatapagedesigner",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatapagedesigner",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5cf4bcd1925e33695744a0c7c8e9272dbb929c50d51f724f00077cb4715ac1e7",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record43": {
    "code": "axisDocsPublicationpageaxisdocsmetadataexperiencestudio",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataexperiencestudio",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "dbc061c02eb1068a28c0538c4aaed447d535e1e2f937b32861c3779181c0646c",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record44": {
    "code": "axisDocsPublicationpageaxisdocsmetadatamodulehealth",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatamodulehealth",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f6e6a33ded8311c9facfb4e1c93e2a2da3b032d2b5b202d0657910039fc44533",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record45": {
    "code": "axisDocsPublicationpageaxisdocsmetadataimportsexports",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataimportsexports",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "edbb6f8417a36976e5acd3d606a3ecfe5464e42d62ccd1fba83822bbc622d09e",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record46": {
    "code": "axisDocsPublicationpageaxisdocsmetadatamediamanagement",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatamediamanagement",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e18b579d5ecd9916f1b206e119a667beffcae99e89c646bb78464cefa9492142",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record47": {
    "code": "axisDocsPublicationpageaxisdocsmetadatacustomerengagement",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatacustomerengagement",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4c45e1a8ec1c7361c8cea8be1ae45132d661603e9c6bdda50ee39bb22ba6394a",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record48": {
    "code": "axisDocsPublicationpageaxisdocsmetadataopenapireference",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataopenapireference",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "615a68f6b52de27ec000162aafcbf683ebaaabbf202a047298d6d146d08e7227",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record49": {
    "code": "axisDocsPublicationpageaxisdocsmetadatafeaturedelivery",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadatafeaturedelivery",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "520da9a0a5679c87a91718eb0ad137de2f70a006fa4fb70b15b7d3c8e0fac542",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record50": {
    "code": "axisDocsPublicationpageaxisdocsmetadataimplementationcontract",
    "targetType": "PAGE",
    "targetCode": "axisDocsMetadataimplementationcontract",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "89470d98babe1e46a81e2e69befc2704cef98da77ffe01a746f6d5345e2a6086",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record51": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchproductaxisdocumentationproduct",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchproductaxisdocumentationproduct",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5cda558d0b9740198ed423fd91cba5d1169a8e3299dc3762452400298444786d",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record52": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnavigationaxisdocumentationnavigationmetadata",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnavigationaxisdocumentationnavigationmetadata",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "9a1c732dc5debf6933012e6ca046fc23375548828165d7222c9532ed21b26dc1",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record53": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnoderoot",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnoderoot",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c10334b5b43ab51b96b01a4dea44d91811e2b51069d86971b2e8428e56a3ab5c",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record54": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodesecdiscoveraxis",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodesecdiscoveraxis",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bbb0f673d965b735ad70cfd2d55929418d1f89d434c105aaa3caaae5034b8917",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record55": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodesecbuildandoperateaxis",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodesecbuildandoperateaxis",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6829a145b5c69ffa9f0941411f5c82d8dbba6d53361013a8561b5d6f486e6598",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record56": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodesecaxiscapabilities",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodesecaxiscapabilities",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "30e420bdc83bab179d4746ae7033b5de8dda0f7517f805b27a7b1490c8c7e4ab",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record57": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodeseccontributetoaxis",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodeseccontributetoaxis",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5c689a7f86ce1cd6346f5f55f50d18c65bdbe49a571d6f5b7d2a0208297c6926",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record58": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisoverview",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisoverview",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "9c3789822b4e6a1f8bff12247c01c7524ca16078a307f911de4df745616a3d40",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record59": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisarchitecture",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisarchitecture",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4431889bff993e767278a7dd1360e886587aa4f6d80c61adb92c8ddb9e36a6d0",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record60": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxistechnologystack",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxistechnologystack",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "86ac285ea61f2fa5770439b6ba97a6823033eb5c7f66c0cb9866a3a2cc14b75b",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record61": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisdesignsystem",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisdesignsystem",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ccb59af8f9cc3c820796f734bbd49298ff00fa1aace50b71ceb4c0f15fac6061",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record62": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxiscmsrenderers",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxiscmsrenderers",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6ccc77c892ca5d9af6eb38599476ff48eaa2094e9b1bdefc0317764a3466fa47",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record63": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisdocumentationcontent",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisdocumentationcontent",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a5b7efb8cfdf27a7302e8a5a84a68b11f8ebda05ff7bbcd0203c0b4ce745d86b",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record64": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisemployeeaccess",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisemployeeaccess",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "796b12769d5e2ec382fa35a4281078783d0157f5831a8ce5fa738e8de64d0464",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record65": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisassistant",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisassistant",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bbf1107c7979022a604d1b9f6822ba7279be0bf1b95b94d1484d7e1bf6dcf8f3",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record66": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisschemaworkbench",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisschemaworkbench",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "22854d1c5cf62923f5f9fa9dd95cb144d9472421ccd2b9df71709346f97d2961",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record67": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxispagedesigner",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxispagedesigner",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ab68832f52d64400912532f5df4a6bc03b465e693623bedbd4add685fc90ec3d",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record68": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisexperiencestudio",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisexperiencestudio",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5a0588845e5744eb06e75e77989d7e88f7300730bf2c0ca863a9f64f3422b10b",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record69": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxismodulehealth",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxismodulehealth",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0f267d4990ca1fb243d49864061fe177e3a6e7ea68cd29945011a4dc6cc5a327",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record70": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisimportsexports",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisimportsexports",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ac866e69143bc6ed64e84e7786d0430c7af12cb7663f581d4da9b74f604eee19",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record71": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxismediamanagement",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxismediamanagement",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c87da5d39cbc35997cfaf29782c937bc8de2351cc90dac5cf2dfb71cc607e3b7",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record72": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxiscustomerengagement",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxiscustomerengagement",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "eb3e8514e8b2b4b134a292a9cee26a2aab070105c0c037b8f48d2363463e8a2c",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record73": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisopenapireference",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisopenapireference",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "86b66ed29eb2bd1fd77f38fa4dfd4f5226817640dde5312625ecda90ba6725f4",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record74": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisfeaturedelivery",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisfeaturedelivery",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d0545d65ab2a47d624bcfcc9a468e669a6ac9bca7b43226ab9c26ca997b17b88",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record75": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchnodeaxisdocsnodepageaxisimplementationcontract",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchnodeaxisdocsnodepageaxisimplementationcontract",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d3ed406f3d6445fad3db536408b4c33ffefbd7d190d123d17de39036152f86aa",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record76": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardproduct",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardproduct",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "93faf6ae2d3cc981462f17e2fdc4b3eb9f62acc3272c4d33015a4ce068091683",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record77": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardnavigation",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardnavigation",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ac52354f178ca470424b42370b32456b967685f5b017cf50c2f9adc546f7e13a",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record78": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardsecdiscoveraxis",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardsecdiscoveraxis",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a615a80bc213dbb922079473cb5ac53fcddb99b773c4cbe8b564007d35d8684d",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record79": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardsecbuildandoperateaxis",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardsecbuildandoperateaxis",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b6b739be9e55cf0bc8c80fe1d62b73d72b329a5ca1b1eea67ff80aa4b78c6531",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record80": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardsecaxiscapabilities",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardsecaxiscapabilities",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "cb272c3712abd9ec08ba5eec608fbfa2a3ee0e6b1f9175a7da84d42de5d9a7c9",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record81": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchdashboardaxisdocsdashboardseccontributetoaxis",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchdashboardaxisdocsdashboardseccontributetoaxis",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "27996b9cff1fd248d4cf2b469c9086cd34c40143c527ceae076c3b5e71740d5e",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record82": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataoverview",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataoverview",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e0d6aaa6ce959c63ed3f62011e5955142998e8ba69348387192defdb0a109c12",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record83": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataarchitecture",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataarchitecture",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "141d1ac6415d725541c099875ba7386bde49d16e6ea6e4c5f960212afff73076",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record84": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatatechnologystack",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatatechnologystack",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ecb6cfb2d2e7b8d81ec4dc793b554c0c32f3e45a089cfc8b9fcda6547f2c2344",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record85": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatadesignsystem",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatadesignsystem",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e24b6870deab5878642618bd51bfbc9e893c0124e49d71cb101982ff8d402eeb",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record86": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatacmsrenderers",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatacmsrenderers",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7c6b27e1f8bf23e0089a1d24d3f80f766317e16146aa560fb9f877730c80ff8a",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record87": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatadocumentationcontent",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatadocumentationcontent",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3bc5fcf4e80e99ae1f79da1729af1ac8345a4afc7df9576372f4225bb44260a5",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record88": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataemployeeaccess",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataemployeeaccess",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7428c059f07c1f9c443279c6e8194fcd3cdfff5944fd9b269df90f9f9e51c521",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record89": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataassistant",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataassistant",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "af1afbc653ad395d7828bb46f94346e0e3aad43e89c71f521d1b272c82a80883",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record90": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataschemaworkbench",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataschemaworkbench",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d78c94d2f034cdc3e76ffb7d344c054a5561ab3080ea3678891d72c8f1745e83",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record91": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatapagedesigner",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatapagedesigner",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "07038a173da316b345ee643b18f07494c71c3dd3f74270bfb7789292d4a4fece",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record92": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataexperiencestudio",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataexperiencestudio",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d5f015e72380308897ba89ba9ad844149bc6769b4b89aef2387f42697e624c6d",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record93": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatamodulehealth",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatamodulehealth",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7511cb85a0624375146600bd2ce44cdbedb3840cef164dd1f5e731a502bdb3bd",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record94": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataimportsexports",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataimportsexports",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "db4804fdd1bdc6e749fe82da3c01f3463c4d52d71c203b90809e4129052c570a",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record95": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatamediamanagement",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatamediamanagement",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7c7c2ba7f1281dd35fd06c4ce278f66116fb60b22bdbf4d3985d1c20d1546c9f",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record96": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatacustomerengagement",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatacustomerengagement",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c1461fce1a8dde2e67b37b252397297c32a426377f8ecc9050f186183cb09e1e",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record97": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataopenapireference",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataopenapireference",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a2bc14dd658748a70b3539e05a8c0d4798375707f2e90f54b426b6950e0c0924",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record98": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadatafeaturedelivery",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadatafeaturedelivery",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b2d3c280784eb707c26e909fc43e68edbd8561da9dc2bca8ec3e66efec46ca86",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  },
  "record99": {
    "code": "axisDocsPublicationsearchmetadataaxisdocssearchpageaxisdocsmetadataimplementationcontract",
    "targetType": "SEARCH_METADATA",
    "targetCode": "axisDocsSearchpageaxisdocsmetadataimplementationcontract",
    "lifecycleState": "STAGED",
    "publicationCode": "axisDocumentation",
    "workflowReference": "axisDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "73586762fde7057b0ec52259442ac0bf50924e99cc8de1d707658ba943a8ca3c",
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
    "actor": "axis.source-maintainer",
    "author": "axis.source-maintainer",
    "submittedBy": "",
    "submittedAt": "",
    "reviewedAt": "",
    "approvedAt": "",
    "publishedAt": "",
    "auditTrail": [],
    "active": true
  }
};
