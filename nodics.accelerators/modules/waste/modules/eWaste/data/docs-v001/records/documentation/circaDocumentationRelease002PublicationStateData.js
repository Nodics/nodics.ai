/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Circa documentation publication state metadata. */
module.exports = {
  "record0": {
    "code": "circaDocsPublicationproductcircadocumentationproduct",
    "targetType": "PRODUCT",
    "targetCode": "circaDocumentationProduct",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "86e5f84d5e211584fc29ec5ac6b80a969d5c10dce3dfd07186ca3affd9f6734c",
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
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record1": {
    "code": "circaDocsPublicationnavigationcircadocumentationnavigationtree",
    "targetType": "NAVIGATION",
    "targetCode": "circaDocumentationNavigationTree",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d5dd2eea6b2ebb6cedc1a9e48c9123898d96b9cfb562d21be65e005bb10bb28a",
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
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record2": {
    "code": "circaDocsPublicationaccesspolicycircadocsaccesspublic",
    "targetType": "ACCESS_POLICY",
    "targetCode": "circaDocsAccessPublic",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "5d48a7341c0fd6e7689dd13837601e2cec4c84481b125603f684008c04805fe9",
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
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record3": {
    "code": "circaDocsPublicationaccesspolicycircadocsaccessauthenticated",
    "targetType": "ACCESS_POLICY",
    "targetCode": "circaDocsAccessAuthenticated",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "35ca0dd7e500b76dad6c6140abf883e826277283542382e4d53f839ee0d18846",
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
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record4": {
    "code": "circaDocsPublicationnodecircadocsnoderoot",
    "targetType": "NODE",
    "targetCode": "circaDocsNodeRoot",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bedf907f886aa7643e0696c2e364d6eef0e8f885b0b87821f0aabfa3a5e40175",
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
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record5": {
    "code": "circaDocsPublicationnodecircadocsnodeseccircaguides",
    "targetType": "NODE",
    "targetCode": "circaDocsNodeSeccircaGuides",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2c028605bb48d0f92f60f3a1db4cab52b8c259f95f34f4905e567d3af131341f",
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
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record6": {
    "code": "circaDocsPublicationnodecircadocsnodepagecircacatalogue",
    "targetType": "NODE",
    "targetCode": "circaDocsNodePagecircaCatalogue",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a825a6d5dd0d2032425a1ff924c620c90ef59f39a9d78cbe992a4807869bddd3",
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
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record7": {
    "code": "circaDocsPublicationnodecircadocsnodepagecircacustomerjourney",
    "targetType": "NODE",
    "targetCode": "circaDocsNodePagecircaCustomerJourney",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "62406720ee696883821e234617acf070fce0ef15dabc6c376dad64b455f336ba",
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
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record8": {
    "code": "circaDocsPublicationnodecircadocsnodepagecircademodata",
    "targetType": "NODE",
    "targetCode": "circaDocsNodePagecircaDemoData",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "46771b9ae1a3d677bde81068c91d915e3f218d254c5daf81b3a0bb0783f54c31",
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
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record9": {
    "code": "circaDocsPublicationnodecircadocsnodepagecircacustomerknowledge",
    "targetType": "NODE",
    "targetCode": "circaDocsNodePagecircaCustomerKnowledge",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "a41dfb8de9dbdf2d091795bfca7e86beed16a3a50e5bf940998ad474bbd50740",
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
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record10": {
    "code": "circaDocsPublicationdashboardcircadocsdashboardproduct",
    "targetType": "DASHBOARD",
    "targetCode": "circaDocsDashboardProduct",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3ca2f8b0b6d1abda44fb298b67aa99b59f2a175b92317bff0056f9450e0de2bd",
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
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record11": {
    "code": "circaDocsPublicationdashboardcircadocsdashboardseccircaguides",
    "targetType": "DASHBOARD",
    "targetCode": "circaDocsDashboardSeccircaGuides",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bfd27ccde678444b0315645e90284806fcaf39637289d2d7eebec6691fcf66fc",
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
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record12": {
    "code": "circaDocsPublicationpagecircadocsmetadatacircacatalogue",
    "targetType": "PAGE",
    "targetCode": "circaDocsMetadatacircaCatalogue",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0812d4206409b73313db7f24dd08d971f2bef18516ced95107b05457718bb339",
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
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record13": {
    "code": "circaDocsPublicationpagecircadocsmetadatacircacustomerjourney",
    "targetType": "PAGE",
    "targetCode": "circaDocsMetadatacircaCustomerJourney",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e59e2611b03d1e8c0c572a72708713dbd72d18bd0e7d5fcc8fccd6779df722fd",
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
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record14": {
    "code": "circaDocsPublicationpagecircadocsmetadatacircademodata",
    "targetType": "PAGE",
    "targetCode": "circaDocsMetadatacircaDemoData",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "9582f81e92c2001f0913b980f6ae5c565607e53316b38aa92dca107a3a7eef44",
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
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record15": {
    "code": "circaDocsPublicationpagecircadocsmetadatacircacustomerknowledge",
    "targetType": "PAGE",
    "targetCode": "circaDocsMetadatacircaCustomerKnowledge",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1d71e29b8b9902a3e8c10359f84ffdb47d1ceb9fd9d0e789e3bf60bd32bb2b9f",
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
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record16": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchproductcircadocumentationproduct",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchproductcircadocumentationproduct",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "dab52d4513e6fb48069717985e1b798928182989f76732ec574d9f749da66940",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record17": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchnavigationcircadocumentationnavigationtree",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchnavigationcircadocumentationnavigationtree",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b97031981424992948a7b02f6e136da65504bc5e260cbeae04f877474775e964",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record18": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchnodecircadocsnoderoot",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchnodecircadocsnoderoot",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "504195af7ccc45eded2a00e2b105f17efd0597edc23856b7b3ba8745c3818ec3",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record19": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchnodecircadocsnodeseccircaguides",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchnodecircadocsnodeseccircaguides",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "177c3e311f22c41913123b91df68b4264811e85a239262063abcf6d0bcda9905",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record20": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchnodecircadocsnodepagecircacatalogue",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchnodecircadocsnodepagecircacatalogue",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "8441db7bb100443444d2ab2fd18225b877e0eb7d1ad9c6804b2f61dcb527bad9",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record21": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchnodecircadocsnodepagecircacustomerjourney",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchnodecircadocsnodepagecircacustomerjourney",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e1c5ccf490ff5943ef25474b7f69334aa8eac94d92e318c742bb337b4e0dc6f1",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record22": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchnodecircadocsnodepagecircademodata",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchnodecircadocsnodepagecircademodata",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "729fcead72d67f265adf3d22dd848a059bfcc85e720cfee0d2f3a4619abce166",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record23": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchnodecircadocsnodepagecircacustomerknowledge",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchnodecircadocsnodepagecircacustomerknowledge",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f8b91de21e54b89e921d332b8948f34df6b5e45a01e8e23814af8b05d4c8b93d",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record24": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchdashboardcircadocsdashboardproduct",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchdashboardcircadocsdashboardproduct",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d20a0a0798b9afb600659daeb91c3db144b98ec114483bfb26ba806ee3e301bb",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record25": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchdashboardcircadocsdashboardseccircaguides",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchdashboardcircadocsdashboardseccircaguides",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "093b838ee075a990b35a2a5fef593da82f18ab45712049499ffb35960f481a4e",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record26": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchpagecircadocsmetadatacircacatalogue",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchpagecircadocsmetadatacircacatalogue",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d00f727a6f8a766bc78feccca43b380359df73ba4b23251ffa94321685ecfb0e",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record27": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchpagecircadocsmetadatacircacustomerjourney",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchpagecircadocsmetadatacircacustomerjourney",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2b42949eb391af8a4a537e11d1ce7f6feda3df21deeffcf43c2b43ea5f8c694b",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record28": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchpagecircadocsmetadatacircademodata",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchpagecircadocsmetadatacircademodata",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3341481879fbd221b176d06c02d8ef06b8e685d87264f8ee373c6fa92b5de2ca",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  },
  "record29": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchpagecircadocsmetadatacircacustomerknowledge",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchpagecircadocsmetadatacircacustomerknowledge",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.2",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "fe32c6f8573970b3d1c1c8ff6d8d66f4f1e765c9dfbf0be6a0160032f121cab8",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "actor": "circa.ewaste.generator",
    "author": "circa.ewaste.generator",
    "auditTrail": [],
    "active": true
  }
};
