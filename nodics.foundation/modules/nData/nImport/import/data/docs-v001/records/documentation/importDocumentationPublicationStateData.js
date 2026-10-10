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
    "code": "nodicsDocsPublicationnodenodicsdocsnodepagedataimportexportmigration",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagedataImportExportMigration",
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
    "checksum": "e7e0d02ac5766badce549518cbc677d0d54729b89a49bb6c3d94c77f60dea455",
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
    "code": "nodicsDocsPublicationnodenodicsdocsnodepagedataimportexportproviderguides",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagedataImportExportProviderGuides",
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
    "checksum": "b30422944fa5eaebb094d411ed9fa97ab2f5bec1e15399800b6cd75680cd7a91",
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
  "record2": {
    "code": "nodicsDocsPublicationpagenodicsdocsmetadatadataimportexportmigration",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatadataImportExportMigration",
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
    "checksum": "ec90570fb0ca3886e5e42c31a32c29cdbfe37fdb236786c03c8a88aedd27979c",
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
  "record3": {
    "code": "nodicsDocsPublicationpagenodicsdocsmetadatadataimportexportproviderguides",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatadataImportExportProviderGuides",
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
    "checksum": "78c13122b6135f500eecb1c10ca6b394c92c4ad2507103c1ecf11c9ff6a06143",
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
  "record4": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepagedataimportexportmigration",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepagedataimportexportmigration",
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
    "checksum": "f5534d75e24c89cf5dbeefc52d9e2eadcf690c8e68e87b1bcbe49cba78bfc959",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
  "record5": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepagedataimportexportproviderguides",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepagedataimportexportproviderguides",
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
    "checksum": "61681bd0d4cc119fe09e43a84221bf08d969f111c6136776d75fd3671e195ddc",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
  "record6": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadatadataimportexportmigration",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadatadataimportexportmigration",
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
    "checksum": "6b8414e2f68c202549c8f971809a234ebbd1a139e7d48260e4d34532348afa70",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadatadataimportexportproviderguides",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadatadataimportexportproviderguides",
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
    "checksum": "43d23118a5c10dc03aac0cdd9b3e0f05f507f7900c26a54c49f14a966e445f2a",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
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
