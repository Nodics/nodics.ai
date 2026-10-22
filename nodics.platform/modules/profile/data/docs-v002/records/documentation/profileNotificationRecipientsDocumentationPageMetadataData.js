/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/data/docs-v002/records/documentation/profileNotificationRecipientsDocumentationPageMetadataData
 * @description Owns canonical profileNotificationRecipientsDocumentationPageMetadataData successor records; installation and publication remain governed.
 * @layer data
 * @owner profile
 */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadataprofileNotificationRecipients",
    "product": "nodicsDocumentationProduct",
    "documentId": "profile.notification-recipients",
    "title": "Source-Proven Notification Recipients",
    "summary": "A business participant is not always the person using the application. A Customer receives an opted-in message in its own inbox. An Enterprise receives messages only through an explicitly selected roster of genuine Employees whose current authority and preferences still qualify. Profile resolves that distinction; it does not turn an Employee into a Customer, select the employee who clicked a button, or own gift, auction, coupon or reward accounting.",
    "businessSummary": "A business participant is not always the person using the application. A Customer receives an opted-in message in its own inbox. An Enterprise receives messages only through an explicitly selected roster of genuine Employees whose current authority and preferences still qualify. Profile resolves that distinction; it does not turn an Employee into a Customer, select the employee who clicked a button, or own gift, auction, coupon or reward accounting.",
    "technicalSummary": "Current source-proof recipient and durable delivery contracts in owner-maintained CMS records; source validation is not installed or live acceptance.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "profile",
    "targetPage": "nodicsDocsPageprofileNotificationRecipients",
    "targetRoute": "nodicsDocsRouteprofileNotificationRecipients",
    "articleComponent": "nodicsDocsComponentprofileNotificationRecipients",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprofilenotificationrecipients",
    "headings": [
      {
        "text": "Purpose and owner boundaries",
        "anchor": "profile-notification-purpose",
        "level": 2
      },
      {
        "text": "Implemented source wrappers",
        "anchor": "profile-notification-wrappers",
        "level": 2
      },
      {
        "text": "Private API and source proof",
        "anchor": "profile-notification-proof",
        "level": 2
      },
      {
        "text": "Current identity, permission and consent",
        "anchor": "profile-notification-authority",
        "level": 2
      },
      {
        "text": "Framework defaults and governed records",
        "anchor": "profile-notification-configuration",
        "level": 2
      },
      {
        "text": "Employee access and safe recovery",
        "anchor": "profile-notification-recovery",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "profile-notification-mistakes",
        "level": 2
      },
      {
        "text": "Verification and adoption",
        "anchor": "profile-notification-verification",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Source ownership and notification controls"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "security.identity-access-governance"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v002/records/documentation/profileNotificationRecipientsDocumentationComponentData.js",
    "sourceChecksum": "573d325b1a79b10c01c8b34553741b397b3f8625721ee4ba8c980c87b499233f",
    "sourceWordCount": 1204,
    "audience": [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
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
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "STAGED",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 1204,
    "sourceEvidence": [
      "src/service/identity/defaultProfileNotificationRecipientService.js",
      "src/service/identity/defaultProfileGiftNotificationRecipientService.js",
      "src/service/identity/defaultProfileTransferNotificationRecipientService.js",
      "src/service/identity/defaultProfileCouponNotificationRecipientService.js",
      "src/service/identity/defaultProfileAuctionNotificationRecipientService.js",
      "test/profileNotificationRecipients.test.js",
      "config/properties.js"
    ]
  }
};
