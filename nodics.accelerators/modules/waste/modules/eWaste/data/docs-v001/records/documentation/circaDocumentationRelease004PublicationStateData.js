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
  "record0": {
    "code": "circaDocsPublicationproductcircadocumentationproduct",
    "targetType": "PRODUCT",
    "targetCode": "circaDocumentationProduct",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f9fc05e3186fe0335e0ff690720b5cdc0e6ba2c34773566bbf555bc1a090bdc3",
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2ce4fea2c12230c7c6dd15bd853e4b8e6950da7bd5a01a8802a83935eef004e5",
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "242ac1ee6d0f209a10f70ab0841f53bdc141f6466c7c6aee8466645b912f1da1",
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "15963c4a70dda32ad9522d79c40dff78073a140b360e7f54e5dee781160f5136",
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
    "stagedVersion": "0.0.4",
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
    "stagedVersion": "0.0.4",
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
    "stagedVersion": "0.0.4",
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
    "stagedVersion": "0.0.4",
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
    "stagedVersion": "0.0.4",
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
    "stagedVersion": "0.0.4",
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "472148723560b515e92a194d2445155c49c29fbcda5c059e6c8d53c3b3a6c3ac",
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0f76669da0d86086b3d3b90b1e70a31acf09dd6b4435da2c7474457e439441b7",
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "be1e4835e738456ea0194b9adaea1b66da92a37c5e49af0f18845bb2a46084b9",
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
  "record13": {
    "code": "circaDocsPublicationpagecircadocsmetadatacircacustomerjourney",
    "targetType": "PAGE",
    "targetCode": "circaDocsMetadatacircaCustomerJourney",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "988160ddb1d299a89f7efec7e2a55cd1ea87650c968d6905ce26efeb062b83ba",
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e4abd8a54922572a539a978d0a8855ffc6e291678644c72a577b64eb527e6848",
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "245a0abde5a2ee2a3a9d21288efa5ccd444e53c2b4da811051642858b39b658b",
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
  "record16": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchproductcircadocumentationproduct",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchproductcircadocumentationproduct",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.4",
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
    "stagedVersion": "0.0.4",
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
    "stagedVersion": "0.0.4",
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
    "stagedVersion": "0.0.4",
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3580404c4cb3f4ee7879768fedf955474c594111547f89188d0903ca5e0bfa52",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
  "record21": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchnodecircadocsnodepagecircacustomerjourney",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchnodecircadocsnodepagecircacustomerjourney",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "82e373eb0d60b3738d21046d07126c87e0f783ed49b62dec0e754de87653dbe1",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "b7a8090d7e5246021bb6f064ec4a4421840d357b8b250b69c30d551813618067",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "6e3299570e6ce14c20df03dac2beefc905b0b6c9cdf89c4c385be879184b6f83",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
  "record24": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchdashboardcircadocsdashboardproduct",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchdashboardcircadocsdashboardproduct",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.4",
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
    "stagedVersion": "0.0.4",
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "2cb85ee336792dba191f3cdd63133219a8b4ad8640ac3d97efb1c2ceb1017051",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
  "record27": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchpagecircadocsmetadatacircacustomerjourney",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchpagecircadocsmetadatacircacustomerjourney",
    "lifecycleState": "STAGED",
    "publicationCode": "circaDocumentation",
    "workflowReference": "circaDocumentationReviewWorkflow",
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e6272178b7508a712bd0fd6a8cb08d4cf7dfa3d0f4c5ea04cdefaa954f3ffe60",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "c967f6de4abb2200e71fd5c0be0d3489b0bbea0df4064571e86fc2123893a15d",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.4",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "1cf8db33427ca3da437b10bea03491d442b7faa045fee40e29d9c4856a22f615",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
  }
};
