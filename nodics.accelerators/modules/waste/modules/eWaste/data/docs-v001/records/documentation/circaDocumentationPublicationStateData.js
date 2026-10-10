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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "64329562a4b80241dbaacb3a7d158d9aa9452c1b7c6c99bcf91bf89d38f56d23",
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "d42fbddb3e769151ca83b4c98a32d6cd11e1b0c9e84e0143e6968c2127cdd54e",
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "097084bf2cbbb8eb4d15e8c4d71a01168666c941390fafd280030bc513e7a2d6",
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "892f97dc5d96cf93e7a151fb4965257f161574efd7d075985edd548412e64651",
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
  "record8": {
    "code": "circaDocsPublicationnodecircadocsnodepagecircademodata",
    "targetType": "NODE",
    "targetCode": "circaDocsNodePagecircaDemoData",
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
    "checksum": "e367f045013531df20756fcdfe797347ff25b147ddab892bfb893b921ec7f8f2",
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
  "record9": {
    "code": "circaDocsPublicationnodecircadocsnodepagecircacustomerknowledge",
    "targetType": "NODE",
    "targetCode": "circaDocsNodePagecircaCustomerKnowledge",
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
    "checksum": "4b5d915e53859310e4958df629c8473ed314811726e029a65cd457b4bedab9fc",
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "20eafc2888e95164dd64ff4ee34ac299717d72182817d83b70bccc2ee0ed1349",
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "71a074cd8e8ebe09da0d1d8086f9466743cae6f288ee8df59638d7f0b7fecb57",
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
  "record14": {
    "code": "circaDocsPublicationpagecircadocsmetadatacircademodata",
    "targetType": "PAGE",
    "targetCode": "circaDocsMetadatacircaDemoData",
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
    "checksum": "e0c4035f277efe6fc39a4dd1a774a466af9d92ba38f8e636f5fc563f2e0f2e7b",
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
  "record15": {
    "code": "circaDocsPublicationpagecircadocsmetadatacircacustomerknowledge",
    "targetType": "PAGE",
    "targetCode": "circaDocsMetadatacircaCustomerKnowledge",
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
    "checksum": "265859d2a6cf5f633036e2be2c1830c10614b6c4ac105f25cd0b21e6e67a4fea",
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "22eb3f5c3801c9e5c4bb127de97e007172f019181ea7d04fae0de24402c4b5bf",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "9e07869eee7c898e5dcdf8d5844e4cd43fc4269744d21de592f96bf6d38bcbec",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "127971406c202d13ca5d8fae9764f7bf9aa0c510a4bd11c886136b85db7ac7eb",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e944af2ce902a7e637baf051d471ff2464a7886e60516d2fe014ef524296476f",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "da56b536681d6a9a1cf73467a08ec16371c758c8d265215d0bdc014101dcbe06",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bfb5706d67357b2d40a0e450bcb15d533d99aef50bb0b9e7f272686a65f9a94e",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
  "record22": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchnodecircadocsnodepagecircademodata",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchnodecircadocsnodepagecircademodata",
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
    "checksum": "a52e5d61c6879213e8252ff0ca617e50dd8ef577a83d07237ea8b2e30423e613",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
  "record23": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchnodecircadocsnodepagecircacustomerknowledge",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchnodecircadocsnodepagecircacustomerknowledge",
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
    "checksum": "4f00101440a9a1ff1f3bc72fd33a04b7bf63393d474f72342482ae1110bd9cdb",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "3eb0bf000939651977a4c46076df74ddd4e5e76c6c928fe6ddc6a19b73a3f416",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "0d2ba7791dda9b204e1041a300e1861aee392f39f066ad53663e1bf3d1eb42e7",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "774f051112ca3917cb78ca44513a14bfeaa014d66ccac89b527211e9a0ee1d21",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "stagedVersion": "0.0.5",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "publicVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "914e14f863465c2e8332eaf7f9e1baf34b08a205e14bb04cc458f19a46325960",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
  "record28": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchpagecircadocsmetadatacircademodata",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchpagecircadocsmetadatacircademodata",
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
    "checksum": "98c77f9e40bc4c20fc70bbcb4e812e2ddc7eb0e2926d7c8520504b833c1bd3d9",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
  "record29": {
    "code": "circaDocsPublicationsearchmetadatacircadocssearchpagecircadocsmetadatacircacustomerknowledge",
    "targetType": "SEARCH_METADATA",
    "targetCode": "circaDocsSearchpagecircadocsmetadatacircacustomerknowledge",
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
    "checksum": "a04d66e6c6a3668c9bf450bb827d64ce607a900a71df25b49767fa314bffd2c1",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
