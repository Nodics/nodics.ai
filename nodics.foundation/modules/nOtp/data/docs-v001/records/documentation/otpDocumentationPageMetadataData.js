/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Module-owned documentation page metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadatasecurityOtpSecurityFlow",
    "product": "nodicsDocumentationProduct",
    "documentId": "security.otp-security-flow",
    "title": "OTP and Security Flow",
    "summary": "OTP generation, delivery intent, verification, expiry, retry, throttling, lockout, audit, and secure frontend message behavior.",
    "businessSummary": "OTP and Security Flow explains the business purpose, supported decisions, operational impact, and controls for the Authentication and Verification journey.",
    "technicalSummary": "OTP and Security Flow has canonical documentation records in otp at data/docs-v001/records/documentation/otpDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "otp",
    "targetPage": "nodicsDocsPagesecurityOtpSecurityFlow",
    "targetRoute": "nodicsDocsRoutesecurityOtpSecurityFlow",
    "articleComponent": "nodicsDocsComponentsecurityOtpSecurityFlow",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatasecurityotpsecurityflow",
    "headings": [
      {
        "text": "Source map",
        "anchor": "securityOtpSecurityFlow-1-source-map",
        "level": 2
      },
      {
        "text": "Flow",
        "anchor": "securityOtpSecurityFlow-2-flow",
        "level": 2
      },
      {
        "text": "Policy contract",
        "anchor": "securityOtpSecurityFlow-3-policy-contract",
        "level": 2
      },
      {
        "text": "Configuration behavior",
        "anchor": "securityOtpSecurityFlow-4-configuration-behavior",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "securityOtpSecurityFlow-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "securityOtpSecurityFlow-6-implementation-handoff",
        "level": 2
      },
      {
        "text": "Evidence checklist",
        "anchor": "securityOtpSecurityFlow-7-evidence-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "securityOtpSecurityFlow-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "securityOtpSecurityFlow-9-verification",
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
        "title": "Area, Source location"
      },
      {
        "kind": "table",
        "title": "Policy, Purpose"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "security.identity-access-governance",
      "communication.overview",
      "communication.provider-runbooks"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/otpDocumentationComponentData.js",
    "sourceChecksum": "d91e32e3273790c13c62850ce8c644efec57aef382db6137d254c2394fa2df05",
    "sourceWordCount": 1007,
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
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 1007,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "../../../nodics.platform/modules/profile/package.json",
      "../../../nodics.communication/modules/smtpCommsProvider/package.json",
      "../../../nodics.communication/modules/smsCommsProvider/package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
