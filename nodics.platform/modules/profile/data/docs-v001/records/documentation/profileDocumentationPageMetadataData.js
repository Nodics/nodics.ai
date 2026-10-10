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
    "code": "nodicsDocsMetadataplatformOverview",
    "product": "nodicsDocumentationProduct",
    "documentId": "platform.overview",
    "title": "Platform overview",
    "summary": "How Platform, Profile, BackOffice, authentication, authorization, Axis backend content, and module governance fit together.",
    "businessSummary": "Platform overview explains the business purpose, supported decisions, operational impact, and controls for the Platform and Profile Foundations journey.",
    "technicalSummary": "Platform overview has canonical documentation records in profile at data/docs-v001/records/documentation/profileDocumentationComponentData.js, with functional visibility under nodics.platform. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "profile",
    "targetPage": "nodicsDocsPageplatformOverview",
    "targetRoute": "nodicsDocsRouteplatformOverview",
    "articleComponent": "nodicsDocsComponentplatformOverview",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataplatformoverview",
    "headings": [
      {
        "text": "Business purpose",
        "anchor": "platformOverview-1-business-purpose",
        "level": 2
      },
      {
        "text": "Beginner mental model",
        "anchor": "platformOverview-2-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Authentication and authorization flow",
        "anchor": "platformOverview-3-authentication-and-authorization-flow",
        "level": 2
      },
      {
        "text": "What Platform owns",
        "anchor": "platformOverview-4-what-platform-owns",
        "level": 2
      },
      {
        "text": "Runtime loading and customization",
        "anchor": "platformOverview-5-runtime-loading-and-customization",
        "level": 2
      },
      {
        "text": "BackOffice and Axis boundary",
        "anchor": "platformOverview-6-backoffice-and-axis-boundary",
        "level": 2
      },
      {
        "text": "Developer model",
        "anchor": "platformOverview-7-developer-model",
        "level": 2
      },
      {
        "text": "DevOps and security model",
        "anchor": "platformOverview-8-devops-and-security-model",
        "level": 2
      },
      {
        "text": "QA acceptance checklist",
        "anchor": "platformOverview-9-qa-acceptance-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "platformOverview-10-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "platformOverview-11-verification",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [
      {
        "kind": "image",
        "title": "Authentication flow reference from the archived documentation set",
        "mediaCode": "nodicsDocsImage_c3589b67dcdfbef11b44a85d"
      },
      {
        "kind": "image",
        "title": "Authorization flow reference from the archived documentation set",
        "mediaCode": "nodicsDocsImage_5748f710a8dca2fcb2d23b01"
      },
      {
        "kind": "table",
        "title": "Concern, Owner"
      },
      {
        "kind": "table",
        "title": "Need, Likely owner"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "screenshot",
      "code-example"
    ],
    "relatedPages": [
      "platform.module-registry",
      "framework.modular-architecture"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/profileDocumentationComponentData.js",
    "sourceChecksum": "63872c01e6a6eb95e72610fd70091f5f3cc4ed502a7bc718b35355efc0a0c326",
    "sourceWordCount": 1163,
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
    "wordCount": 1163,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatasecurityIdentityAccessGovernance",
    "product": "nodicsDocumentationProduct",
    "documentId": "security.identity-access-governance",
    "title": "Security, Identity, and Access Governance",
    "summary": "Authentication, authorization, groups, documentation authoring roles, read-only Axis access, tenant isolation, and audit responsibilities.",
    "businessSummary": "Security, Identity, and Access Governance explains the business purpose, supported decisions, operational impact, and controls for the Identity and Access Governance journey.",
    "technicalSummary": "Security, Identity, and Access Governance has canonical documentation records in profile at data/docs-v001/records/documentation/profileDocumentationComponentData.js, with functional visibility under nodics.platform. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "profile",
    "targetPage": "nodicsDocsPagesecurityIdentityAccessGovernance",
    "targetRoute": "nodicsDocsRoutesecurityIdentityAccessGovernance",
    "articleComponent": "nodicsDocsComponentsecurityIdentityAccessGovernance",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatasecurityidentityaccessgovernance",
    "headings": [
      {
        "text": "October 2026 Source Consolidation Boundary",
        "anchor": "securityIdentityAccessGovernance-1-october-2026-source-consolidation-boundary",
        "level": 2
      },
      {
        "text": "Target Consent And Relationship Changes",
        "anchor": "securityIdentityAccessGovernance-2-target-consent-and-relationship-changes",
        "level": 3
      },
      {
        "text": "Historical Identity And Application Recovery",
        "anchor": "securityIdentityAccessGovernance-3-historical-identity-and-application-recovery",
        "level": 3
      },
      {
        "text": "Customize And Accept Safely",
        "anchor": "securityIdentityAccessGovernance-4-customize-and-accept-safely",
        "level": 3
      },
      {
        "text": "Enterprise Hierarchy Evidence",
        "anchor": "securityIdentityAccessGovernance-5-enterprise-hierarchy-evidence",
        "level": 2
      },
      {
        "text": "Explicit Structural Recovery Resumption",
        "anchor": "securityIdentityAccessGovernance-6-explicit-structural-recovery-resumption",
        "level": 2
      },
      {
        "text": "Accepted Hierarchical Delegation Design",
        "anchor": "securityIdentityAccessGovernance-7-accepted-hierarchical-delegation-design",
        "level": 2
      },
      {
        "text": "Staged Customer Consent And Recovery",
        "anchor": "securityIdentityAccessGovernance-8-staged-customer-consent-and-recovery",
        "level": 2
      },
      {
        "text": "Business context",
        "anchor": "securityIdentityAccessGovernance-9-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "securityIdentityAccessGovernance-10-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "securityIdentityAccessGovernance-11-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "securityIdentityAccessGovernance-12-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "securityIdentityAccessGovernance-13-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "securityIdentityAccessGovernance-14-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "securityIdentityAccessGovernance-15-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "securityIdentityAccessGovernance-16-current-implementation-coverage",
        "level": 2
      },
      {
        "text": "Enterprise-scope expiry and reliable access decisions",
        "anchor": "securityIdentityAccessGovernance-17-enterprise-scope-expiry-and-reliable-access-decisions",
        "level": 2
      },
      {
        "text": "Worked example: temporary responsibility",
        "anchor": "securityIdentityAccessGovernance-18-worked-example-temporary-responsibility",
        "level": 3
      },
      {
        "text": "Failure and recovery",
        "anchor": "securityIdentityAccessGovernance-19-failure-and-recovery",
        "level": 3
      },
      {
        "text": "Customize and extend safely",
        "anchor": "securityIdentityAccessGovernance-20-customize-and-extend-safely",
        "level": 3
      },
      {
        "text": "Employee self-application intake",
        "anchor": "securityIdentityAccessGovernance-21-employee-self-application-intake",
        "level": 2
      },
      {
        "text": "Withdrawal, Corrected Attempts And Deadlines",
        "anchor": "securityIdentityAccessGovernance-22-withdrawal-corrected-attempts-and-deadlines",
        "level": 3
      },
      {
        "text": "Worked request and failure recovery",
        "anchor": "securityIdentityAccessGovernance-23-worked-request-and-failure-recovery",
        "level": 3
      },
      {
        "text": "Customize and extend safely",
        "anchor": "securityIdentityAccessGovernance-24-customize-and-extend-safely",
        "level": 3
      },
      {
        "text": "Personal memberships and enterprise context",
        "anchor": "securityIdentityAccessGovernance-25-personal-memberships-and-enterprise-context",
        "level": 2
      },
      {
        "text": "Current-enterprise team administration",
        "anchor": "securityIdentityAccessGovernance-26-current-enterprise-team-administration",
        "level": 2
      },
      {
        "text": "Application review recovery: decisions and messages are separate",
        "anchor": "securityIdentityAccessGovernance-27-application-review-recovery-decisions-and-messages-are-separate",
        "level": 2
      },
      {
        "text": "Developer and support integration",
        "anchor": "securityIdentityAccessGovernance-28-developer-and-support-integration",
        "level": 3
      },
      {
        "text": "Customize and extend safely",
        "anchor": "securityIdentityAccessGovernance-29-customize-and-extend-safely",
        "level": 3
      },
      {
        "text": "Read-only legacy identity assessment",
        "anchor": "securityIdentityAccessGovernance-30-read-only-legacy-identity-assessment",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "securityIdentityAccessGovernance-31-customize-and-extend-safely",
        "level": 3
      },
      {
        "text": "Scope changes and evidenced team recovery",
        "anchor": "securityIdentityAccessGovernance-32-scope-changes-and-evidenced-team-recovery",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "securityIdentityAccessGovernance-33-customize-and-extend-safely",
        "level": 3
      },
      {
        "text": "Live Context Admission And Privacy Boundary",
        "anchor": "securityIdentityAccessGovernance-34-live-context-admission-and-privacy-boundary",
        "level": 2
      },
      {
        "text": "Configure The Live Context Bridge",
        "anchor": "securityIdentityAccessGovernance-35-configure-the-live-context-bridge",
        "level": 3
      },
      {
        "text": "Native Customer Issue And Refresh",
        "anchor": "securityIdentityAccessGovernance-36-native-customer-issue-and-refresh",
        "level": 3
      },
      {
        "text": "Repair Committed Consent Stamps",
        "anchor": "securityIdentityAccessGovernance-37-repair-committed-consent-stamps",
        "level": 3
      },
      {
        "text": "Canonical Contact Verification And Notification Preferences",
        "anchor": "securityIdentityAccessGovernance-38-canonical-contact-verification-and-notification-preferences",
        "level": 3
      },
      {
        "text": "Customize Contact And Eligibility Safely",
        "anchor": "securityIdentityAccessGovernance-39-customize-contact-and-eligibility-safely",
        "level": 3
      },
      {
        "text": "Ordinary Customer signup and optional eligibility",
        "anchor": "profile-ordinary-signup-optional-eligibility",
        "level": 2
      },
      {
        "text": "Customize ordinary registration without weakening admission",
        "anchor": "profile-ordinary-signup-customization",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Evidence, Current Boundary"
      },
      {
        "kind": "table",
        "title": "Business question, Answer for this topic"
      },
      {
        "kind": "table",
        "title": "Responsibility, Owner, Notes"
      },
      {
        "kind": "table",
        "title": "Detail area, What to document, Verification signal"
      },
      {
        "kind": "table",
        "title": "Customization type, Recommended path, Avoid"
      },
      {
        "kind": "table",
        "title": "Operational concern, Required documentation detail"
      },
      {
        "kind": "table",
        "title": "Access topic, Source records, Documentation requirement"
      },
      {
        "kind": "table",
        "title": "Situation, Safe outcome"
      },
      {
        "kind": "table",
        "title": "Observed condition, Correct interpretation and recovery"
      },
      {
        "kind": "table",
        "title": "Trusted selection, Required behavior, Not implied"
      },
      {
        "kind": "table",
        "title": "Success, rejection or interruption, Evidence and recovery"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix",
      "table"
    ],
    "relatedPages": [
      "platform.overview",
      "axis.business-customization",
      "docs.overview",
      "promotion.campaigns-coupon-issuance",
      "cart.customer-intent-calculation",
      "digital.purchase-delivery-reveal"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/profileDocumentationComponentData.js",
    "sourceChecksum": "242695c0c83aed34c6fbd34afaa31ddf811350b05dfdf221627b9badad194d30",
    "sourceWordCount": 9077,
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
    "wordCount": 9077,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service",
      "src/service/customer/defaultCustomerRegistrationService.js",
      "llm/contracts/customer-registration-form.md",
      "test/profileCustomerRegistrationForm.test.js",
      "test/customerRegistrationPlacementContract.test.js"
    ]
  }
};
