/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical digitalCore documentation CMS records; business setup remains independently selectable. */
module.exports = {
  "bundleGuide0": {
    "code": "nodicsDocsPublicationnodenodicsdocsnodepagedigitalbundleholdingsgifts",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagedigitalBundleHoldingsGifts",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "generated": false,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "f379ccbe7746f764a83105b9cf8c272c732add8d99f84e15bec83a89b21e27ad",
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
    "author": "digitalCore.source-maintainer",
    "auditTrail": [],
    "active": true
  },
  "bundleGuide1": {
    "code": "nodicsDocsPublicationpagenodicsdocsmetadatadigitalbundleholdingsgifts",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatadigitalBundleHoldingsGifts",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "generated": false,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "dd779eb468195a1437c51b8f0fe339990fd1690cab360a7eaed4245b9157a793",
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
    "author": "digitalCore.source-maintainer",
    "auditTrail": [],
    "active": true
  },
  "bundleGuide2": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepagedigitalbundleholdingsgifts",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepagedigitalbundleholdingsgifts",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "generated": false,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4d02e373a69d23d30b9568070b67519341e8fa3e97919ab949fc0b7264f05edf",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "author": "digitalCore.source-maintainer",
    "auditTrail": [],
    "active": true
  },
  "bundleGuide3": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadatadigitalbundleholdingsgifts",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadatadigitalbundleholdingsgifts",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "generated": false,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "870ee5615a38c89dcac6556cbd0b2743ce0a888d413128404528c5b63a13710f",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "author": "digitalCore.source-maintainer",
    "auditTrail": [],
    "active": true
  },
  "record0": {
    "code": "nodicsDocsPublicationnodenodicsdocsnodepagedigitalpurchasedeliveryreveal",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagedigitalPurchaseDeliveryReveal",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bafe1102b833e700461ea9fffac13ffac49ef69477be564f16b866974a8557a5",
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
    "author": "digitalCore.source-maintainer",
    "auditTrail": [],
    "active": true
  },
  "record1": {
    "code": "nodicsDocsPublicationpagenodicsdocsmetadatadigitalpurchasedeliveryreveal",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatadigitalPurchaseDeliveryReveal",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "e17f9e16ebfea60cd9177fe518a6e7a9efe188f469b40261166d6647690249ca",
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
    "author": "digitalCore.source-maintainer",
    "auditTrail": [],
    "active": true
  },
  "record2": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchnodenodicsdocsnodepagedigitalpurchasedeliveryreveal",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchnodenodicsdocsnodepagedigitalpurchasedeliveryreveal",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "bbc4323927212dfbd17b8dc1db3f4ba643c7633b7047710c8554257d36caf2c0",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "author": "digitalCore.source-maintainer",
    "auditTrail": [],
    "active": true
  },
  "record3": {
    "code": "nodicsDocsPublicationsearchmetadatanodicsdocssearchpagenodicsdocsmetadatadigitalpurchasedeliveryreveal",
    "targetType": "SEARCH_METADATA",
    "targetCode": "nodicsDocsSearchpagenodicsdocsmetadatadigitalpurchasedeliveryreveal",
    "lifecycleState": "STAGED",
    "publicationCode": "nodicsDocumentation",
    "workflowReference": "nodicsDocumentationReviewWorkflow",
    "stagedVersion": "0.0.3",
    "validationResult": {
      "generated": true,
      "sourceAuthority": "data/docs-v001/records/documentation",
      "publicationPath": "STAGED_REVIEW_APPROVAL_ONLINE",
      "nexusVisibleOnlyWhenOnlineAndPublic": true
    },
    "checksum": "4b6a4d35fbbc07de8f76de460feecd0f1577e5caf561f9a8a44055f8cc7c98c7",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "decisionPolicy": {
      "reviewPermission": "documentation.review",
      "approvePermission": "documentation.approve",
      "publishPermission": "documentation.publish",
      "permissionEnforced": true,
      "adminOverrideAudited": true
    },
    "author": "digitalCore.source-maintainer",
    "auditTrail": [],
    "active": true
  }
};
