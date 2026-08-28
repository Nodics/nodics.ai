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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "594a9d388d2a6a197718465c9930d40b0edec9476ee9b318a9fb28852765a7fd",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6091a54a515cdee0ea1c389889997045984c3a441372693895799533c13b4df2",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "aefa9869dd114b9b884537d627345f0204a10059c357dcd20f0fa572f67b7952",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "968aaa9a2d40a52b4750c5c11ff436314647e0fb182c906e64963376e00d98f7",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d6c0cd589510cf17660e515ef3f0b9f810315089b3b1f134372888fc67553918",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "df63782a3484015bf416998d163404190a0d525744114e37d5442593d7d81d6c",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "50029644d04e077ad3587ef43989025cc579f0ed35e99748235be9a2fe7ffcd5",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "61a554dabbf2d66011ade26e890613fb98b2513e657e2e6c364ae3f46447bb89",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e087fc8cfec4abe02cc5fcb747e4fbdc30f1a92c105b5007d700b65d41baacfa",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1a18c0757dde63f78c847c26fdff3ea6671dd02fa274a239ebac6476c4fd0411",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0d3cc66e42d8175e5dfe59f3715b7ec67fcf14beea5c60584572445124db867a",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "11c9f65f7cb6b02311b5619dbad337a1dae039f4549daba6236a2d60998d0cc0",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0928d47d1e72226f49137a6e7d83f8198227f37c2c562c8239196bb4ed2389c6",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f48fe28945c749c07e80fef831d9324cc0c6ca06a69e1168d7b3b246e5cd4a0a",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3df4d1c71e223da926978377d76210b80a3f58d1f7f1ba5031dce60d03c0b68f",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c35b26e61c60b52904e71fe3e1406b35078bb20839fbfaa374ffbb3aaf1d7444",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "370ec2be6c62d48497e85ba2ed84bae4b707d45651b1855697f340fcfa7c5dd0",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bd2aa82bf907087ba9cd17bf4e74866e2cfd4566dbd43d44726d0a73abe51ac4",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c535f18180df17ccf3a166d7ce4ccbd1c7cbf121de7828f5848647d1d871db8e",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ffcd5154f232eed2d2d6a4dfa49c59d77b928f116a98bc863a49e3a48b683ae5",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "9ecec40ccbd375bc85843adf288f5e3c261248cdad84dd2bebeab7ab651553b5",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e3f7c9cfb02d70c31170b5524fdd49f08b3bfaf8411f42719b6514b363b344bf",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c5d1086b07c539d71a9dc86a979b6478b86dc297129db0bf6675c90a59d785f7",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "52a3a5e59f87e727fa01f0ffb5dbac9fef55ed33969783d8accf067e71c3fe0b",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "92e4f0882c93baa240b9cc4bff13f85296161cde47ba96479b345707af12894b",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3472f0dc2d690d4b9810559955373018924519078d9f114ecf70e2c4895edd9a",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6195936fa34fe50bc464023a4a0a70fee1d8841c60db53c52b89dcbd90498722",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6fda9cb172c35b1a7e9b3ea56312aa7998c1634d585a3f3962feef643150e5c8",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "95fc2dc41d72d22f8372065a30e3c0d57e5d17fed965ccff435eb232b1aa50f1",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "01d67dee9009ebb9e8fdcfd2785c8c2fdb45339413661f83542814e5d023f6e2",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4faf715a313d4ab1bf1f6dddd5fc093c4faa914b0f0df78fd288f9b2bc637082",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1e4ac1d5702977c2daacedf9b4d75246f157f26861dc41149b91c65cbc33de8d",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bb67c53d2bdae38f7e0c048c5f1f37a8917b64b680c1b3c1a829656b97772862",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "eb0a68ab32ef85ea9b7c68ed1109f258e9aae78f03158a02396fb72d94fea796",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "34c177d44cc1dfe7485cba4b648c2b3ba681fe3e44d00ec70da8d2b99b3726a5",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3d705efa1648544133d3c33cbc3bd60e55dfb07af82e83ee8dbfdcae44eafdf4",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1ae5538f31aeb2af67be014e6dc712e000ed76a9f04cf69846e5b1c3db9d844b",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "40846c2dc921012787d581ea579d0ade9a4db704c2fb71ddb5c8757211026166",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "49278d0f482046826ef5a35436f3510da89409eea450667bf2a12b46e9547489",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "327d6ed59a4231c4ffe7a0cedf057525b0cc3adffc3f324abfb6778dea98be43",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "647033785523bf1b7de20f427b69eb0caa6abb3c12bb87397ba821b809c669d4",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d2a13baae8b4106e1e3aaaea8897f22ea16469da8a801ed76cdbb9df2600bdef",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8baa172ec5ae3b563bae19e08b58890d567bbe388ab8c09d4cc0439191ccc9f7",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e5d752ad71d493cf912889015ddca26812cbb8d71f039656e6c9aef81efe21ab",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "9ee9b67c715f116c60a081ff43d9864275baba8e4c9261152d8a84652e234df1",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e3f9a7dffab7999d3b9e0eee604f65cce84456f5a20c10ca4132b602c5d20382",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ede28f35640692abb4a041ac93ccd32b57e812687f3c75d7d5f677f46b8624c4",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "01ace92f696ba74f4a4729fb8bb08fc7e45c6c0628162376673e595b68b6d75f",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "52e65b921538f91d9c987e5ae659d5a9b070c5ed21512702edbb517eac43aff3",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f372696d3f89f5d1eeb85b1330b1f175f0dd1ce9359efe362b0633bd194936e9",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a6d76a82e1fb7b81b4ee823020c14887993fc2fdce5516cb97a347bd32d9a704",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a22c1c901dba0c60d1c43e40033b96141966840a779b8d9adfe8c7c088fa0433",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8818d43620b33fcad6c6c215eb0b2f3aeafc34412390fff2eed96e0e451a965a",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d55cade24fde1fd1917e293ee08103beff09ef344dcc35815e0b5873e3298846",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "71b405f1becbeb6532be1fc4e225008537cfd52179f128cc6dd9d3f7198e9b62",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "16b61e9d61b1c78fc86bb3a662816ca067955fbdf633380cc1391a56ba8a1c22",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e9f3b3ad1f1914e71e053b45ff185d1e68d490e26d79f37fd157958d30335745",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "41c2af5468ccac038b54a1b48350debb49da8d9c43499836ed4b049656718085",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e6b8dd2981c877c4393c125d360dcc7bd05ee162fb41e0cf630c70012715f16c",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "84fef14d34508eed634811fd2bf393930be8af2a604c387b4871c384ce7a1d86",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d1066b0e56b9abf0afa5c8245155354bc93d0b9a825c37c1aa4f399615034221",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c8561919058369f05c31b650d37a1e75ac9d7e94dd672cf49f74d125cbf169a7",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c2a6c76677e36be94bbe2e8b9063e745dd1b60208c92d354aade9d451139b00d",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0d89fb03efeffdd47e6ba7f5dab8ea85f943fbcd2596e18e5dea59973361fa1b",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4603af436cb7cf85da0ab5da4ec49ae32e76fc954f2008e10ac808ed63bfe1f9",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "dba63d7a3c60fb423066c71b6716fae53fa0def2bed1c21c765cb273b6a53742",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a8e83f8e33e67f08b10c57d81f7b8300ebde2e8adf6042f87a215ecdab152e0a",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5a76c3c2e242648567efb9b8cd2fdcf89d101e78d26d9aab46e9d02ab6779965",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "42560d0d0631f7b263dd9de731a37f3293f5fff903e110eb95c5dc4ca28ac7c2",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "09b1509003195c003eb0e7b9b2a2999ae80f5d2d6ea3490bdd6787dfab041094",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "831c44a5bb359f22338ecbb296e1d27f317bce4aada8a5be7a32237e0a3a5fa9",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8f3a7b2b4d1ea86c1c20291e8acc3257171b643b36abb8bc6c40c517fb0af9c6",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d7c5457cf48e3de6495ec789e873e89620e70164507474f5efa987c3fb460441",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a033f029652d7af223a6f1f7a8ef741a0cd8e35e96d2328adbcd7ed1745f6e59",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ed450d140adc87dc34b27dbfd48f85caf61dc98ea08c9e75427a1edd9a648f0d",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8e5a23356c90101411e6d238d32575e3cb9030f76f8d5ae38c9f5025cebf89d1",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "02240e27c3548905ff32a5f4eb157c3c2ff9720a0b7ed2426f8e1d4743cfb955",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "401fcf5f0dd5f0a659d7079b4153ef4f2c67a5062f1fdf71f284783f04449a1d",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "71cc6300c960754e76a4ddac30d0b894bc320f68fcc2de783babcf92406522aa",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "da09383550c0360776944caee3d8e57d72d3d3ee3b2cb39b0f414dc1316c10d0",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a8d51f37d3c58c9366eefeb9de596a747f302d8cf21e42377de02c6e76226eb8",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "39191b9ac2cc86200c2790ba2dcfc91c2ead717add93198678a048af69723cbc",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "efc3313a3dd2371a65d2dd80961fb9656e89a43c758aaf874ea912948770bdfe",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "9e16baf7471f7ec1674bd206d13106e0a436ccb7eacc610564dce07964e349a7",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1e334244dfe4a4b29af3e612eb4d73dae681f37eb68bb4f6e510c8062d44339b",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "cdbef94271e63e28e9c4aee288f408339e76828fdaf9a81ab7b8a68a68be52a0",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "7d8e02e18860ccb1b83e90d63ecc658ab79667ad73f5354d489faeab1e230923",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "67dfccc13f83435af14d8fcd3e02356177968672df0bd35ea3e6aeea4338ed4e",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "aeaa1ada134d4e7db43520a9f86329ab18f74b78e937e7f866f13405430eec17",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "83f1033537441be604be92b9a62044f2a5f5df17e322f3f9592e89b2ba48e346",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e05e47083bbfd2d49f88d51d011a1ee3ef1cc86e3fea198065dbe6abc95eaf97",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5a9c0f67c4915bd8e3bd090d2a9289c7b2ce22fdd0d90d1fffba6601073ad7fc",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "44e5c298c93584a88d39c40723b08188e400c403da9f9f858182b4f529cd53b5",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "26a2024c355b86b4be36bcce4b0dc9aac531fa506831f47ce99ba6107021d713",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bc70b2199ff94766b3e5211a516625d4f66f522027d798f0b0e9d229e28e41d7",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b79fb8cfb51257b3be68f0ec753ac16e5012a6421cf976a4fa1f3bd3b5242c10",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d550cf5b1ba4647545915e3889519d992c823ec5f12ea3d5478ee7454bef0b7a",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a61b7fa33198450aef51d93f031d4e83da4ec11349ecf771fd1ba87fcf6e6631",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "38470c02be00e107691867882825ea7aff9980322727c7d9c75b98bfcf9d2d73",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ae6c91875b72b4a2b650523dd68077048dcdcba972645109e28b6c19ba8d497a",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c2ab84c44e3ef2156e5a1d35d161c48a80e5b909e937f5ffaaf0c8751e85ab64",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "538d9c9623a03d391a6f73ea88b55b9c0a3e02ff29638d91e257ff5857c854dd",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "ca1f6d6616b5306bafff13c21ad657203e9576fd74461c66c3699952a853ac71",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "eee9f5675b9bccbf87d947e82a9a55489e31bbafd461d2c5b6c856d766bff89a",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5b3241e9812e0b58e496468505ab774d0668fb2745276f96e46e0778281e8ab3",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3a9714daf9039ae2963701bfeb5cdf18c6d7eea50315699c77919721a64cbaf7",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b56443fcbd9eb67d1d700d9517ab2694e5167045fcdbe99c407aaf431fa333df",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c5dda6a908d04ea381ea78fb6249a2bd9cb088bfe34609c7e919e251881c6529",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "46cbbad1d05e7bae4c948000c70e164b8aabc999636ed15d77c614ee4775bc8b",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "20c5377c60f1a940a241a3661f301908b3c3945eaac6fa4aef7fbb75cea7fd3c",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "584dac35e57736e8037c954e6533a05d6a04ec52174d6f1c703ed6d35e95073b",
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
    "stagedVersion": "0.0.1",
    "onlineVersion": "0.0.1",
    "previousOnlineVersion": "",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "docs/catalogue.json",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6a955869d7227a0ae502abc1334ed58204386a362628c0407a9632149af1b0c1",
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
