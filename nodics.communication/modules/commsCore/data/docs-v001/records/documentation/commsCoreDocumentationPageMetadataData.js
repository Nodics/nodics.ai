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
    "code": "nodicsDocsMetadatacommunicationProviderRunbooks",
    "product": "nodicsDocumentationProduct",
    "documentId": "communication.provider-runbooks",
    "title": "Communication Provider Runbooks",
    "summary": "Source-backed SMTP controlled-test and SMS injected-sandbox configuration, credentials, frozen-content delivery, safeguards, uncertainty recovery and live qualification boundaries.",
    "businessSummary": "Communication Provider Runbooks explains the business purpose, supported decisions, operational impact, and controls for the Provider Delivery journey.",
    "technicalSummary": "Communication Provider Runbooks has canonical documentation records in commsCore at data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js, with functional visibility under nodics.communication. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.communication",
    "technicalModule": "commsCore",
    "targetPage": "nodicsDocsPagecommunicationProviderRunbooks",
    "targetRoute": "nodicsDocsRoutecommunicationProviderRunbooks",
    "articleComponent": "nodicsDocsComponentcommunicationProviderRunbooks",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommunicationproviderrunbooks",
    "headings": [
      {
        "text": "Implemented modes and limits",
        "anchor": "communicationProviderRunbooks-1-implemented-modes-and-limits",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "communicationProviderRunbooks-2-source-map",
        "level": 2
      },
      {
        "text": "Delivery sequence",
        "anchor": "communicationProviderRunbooks-3-delivery-sequence",
        "level": 2
      },
      {
        "text": "Before configuring any provider",
        "anchor": "communicationProviderRunbooks-4-before-configuring-any-provider",
        "level": 2
      },
      {
        "text": "Email: controlled SMTP configuration",
        "anchor": "communicationProviderRunbooks-5-email-controlled-smtp-configuration",
        "level": 2
      },
      {
        "text": "SMTP settings",
        "anchor": "communicationProviderRunbooks-6-smtp-settings",
        "level": 3
      },
      {
        "text": "Sender and credentials",
        "anchor": "communicationProviderRunbooks-7-sender-and-credentials",
        "level": 3
      },
      {
        "text": "MIME and content",
        "anchor": "communicationProviderRunbooks-8-mime-and-content",
        "level": 3
      },
      {
        "text": "Email: injected sandbox mode",
        "anchor": "communicationProviderRunbooks-9-email-injected-sandbox-mode",
        "level": 2
      },
      {
        "text": "SMS: injected sandbox configuration",
        "anchor": "communicationProviderRunbooks-10-sms-injected-sandbox-configuration",
        "level": 2
      },
      {
        "text": "SMS safety and limits",
        "anchor": "communicationProviderRunbooks-11-sms-safety-and-limits",
        "level": 3
      },
      {
        "text": "Customize and extend safely",
        "anchor": "communicationProviderRunbooks-12-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Outcomes and recovery",
        "anchor": "communicationProviderRunbooks-13-outcomes-and-recovery",
        "level": 2
      },
      {
        "text": "Operations and troubleshooting",
        "anchor": "communicationProviderRunbooks-14-operations-and-troubleshooting",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "communicationProviderRunbooks-15-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification and joint acceptance",
        "anchor": "communicationProviderRunbooks-16-verification-and-joint-acceptance",
        "level": 2
      },
      {
        "text": "Related topics",
        "anchor": "communicationProviderRunbooks-17-related-topics",
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
        "title": "Mode, Current implementation, Default, What success proves"
      },
      {
        "kind": "table",
        "title": "Concern, Framework source"
      },
      {
        "kind": "table",
        "title": "Setting, Default or rule"
      },
      {
        "kind": "table",
        "title": "State, Meaning, Operator action"
      },
      {
        "kind": "table",
        "title": "Observation, Check, Safe response"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "communication.overview",
      "security.otp-security-flow",
      "engagement.contact-submission-operations",
      "communication.email-sms-templates"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js",
    "sourceChecksum": "1614ea3ae40cc56606bdf7a3ea39d4570712734f93051c88fc68f778d5801761",
    "sourceWordCount": 2412,
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
    "wordCount": 2412,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "../smtpCommsProvider/package.json",
      "../smsCommsProvider/package.json",
      "../../../nodics.engagement/modules/contactSubmission/package.json",
      "../smtpCommsProvider/src/service/defaultSmtpCommunicationProviderService.js",
      "../smsCommsProvider/src/service/defaultSmsCommunicationProviderService.js",
      "package.json",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatacommunicationOverview",
    "product": "nodicsDocumentationProduct",
    "documentId": "communication.overview",
    "title": "Communication, delivery, and verification",
    "summary": "Beginner-to-operator journey for templates, intent, consent, suppression, verification, provider delivery, callbacks, retry, inbox, recovery, and domain integration.",
    "businessSummary": "Communication, delivery, and verification explains the business purpose, supported decisions, operational impact, and controls for the Communication Delivery and Verification journey.",
    "technicalSummary": "Communication, delivery, and verification has canonical documentation records in commsCore at data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js, with functional visibility under nodics.communication. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.communication",
    "technicalModule": "commsCore",
    "targetPage": "nodicsDocsPagecommunicationOverview",
    "targetRoute": "nodicsDocsRoutecommunicationOverview",
    "articleComponent": "nodicsDocsComponentcommunicationOverview",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommunicationoverview",
    "headings": [
      {
        "text": "Module structure",
        "anchor": "communicationOverview-1-module-structure",
        "level": 2
      },
      {
        "text": "End-to-end delivery journey",
        "anchor": "communicationOverview-2-end-to-end-delivery-journey",
        "level": 2
      },
      {
        "text": "Template and rendering journey",
        "anchor": "communicationOverview-3-template-and-rendering-journey",
        "level": 2
      },
      {
        "text": "Consent, purpose, and suppression",
        "anchor": "communicationOverview-4-consent-purpose-and-suppression",
        "level": 2
      },
      {
        "text": "Idempotency and delivery evidence",
        "anchor": "communicationOverview-5-idempotency-and-delivery-evidence",
        "level": 2
      },
      {
        "text": "Verification journey",
        "anchor": "communicationOverview-6-verification-journey",
        "level": 2
      },
      {
        "text": "Axis and customer journey",
        "anchor": "communicationOverview-7-axis-and-customer-journey",
        "level": 2
      },
      {
        "text": "Engagement integration",
        "anchor": "communicationOverview-8-engagement-integration",
        "level": 2
      },
      {
        "text": "Provider activation and operations",
        "anchor": "communicationOverview-9-provider-activation-and-operations",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "communicationOverview-10-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "communicationOverview-11-verification",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "communicationOverview-12-customize-and-extend-safely",
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
        "title": "Module, Responsibility"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "engagement.customer-feedback",
      "process.action-adapters",
      "communication.email-sms-templates"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js",
    "sourceChecksum": "8192f015a78ac6f1642645cb9ae407c1f68dd30f0144f89fffd4875850ef2abf",
    "sourceWordCount": 1246,
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
    "wordCount": 1246,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  },
  "record2": {
    "code": "nodicsDocsMetadatacommunicationEmailSmsTemplates",
    "product": "nodicsDocumentationProduct",
    "documentId": "communication.email-sms-templates",
    "title": "Email and SMS Templates",
    "summary": "Detailed notification flow, existing inventory, typed manifests, configuration and adoption, layered overrides, locale precedence, safe HTML, new email/SMS examples, frozen retries and troubleshooting.",
    "businessSummary": "Email and SMS Templates explains the business purpose, supported decisions, operational impact, and controls for the Communication Delivery and Verification journey.",
    "technicalSummary": "Email and SMS Templates has canonical documentation records in commsCore at data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js, with functional visibility under nodics.communication. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.communication",
    "technicalModule": "commsCore",
    "targetPage": "nodicsDocsPagecommunicationEmailSmsTemplates",
    "targetRoute": "nodicsDocsRoutecommunicationEmailSmsTemplates",
    "articleComponent": "nodicsDocsComponentcommunicationEmailSmsTemplates",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommunicationemailsmstemplates",
    "headings": [
      {
        "text": "Signed Integration Source Authority",
        "anchor": "communicationEmailSmsTemplates-1-signed-integration-source-authority",
        "level": 2
      },
      {
        "text": "Employee Lifecycle Intent Integration",
        "anchor": "communicationEmailSmsTemplates-2-employee-lifecycle-intent-integration",
        "level": 2
      },
      {
        "text": "Scope, audience and maturity",
        "anchor": "communicationEmailSmsTemplates-3-scope-audience-and-maturity",
        "level": 2
      },
      {
        "text": "Ownership and source map",
        "anchor": "communicationEmailSmsTemplates-4-ownership-and-source-map",
        "level": 2
      },
      {
        "text": "How a notification travels",
        "anchor": "communicationEmailSmsTemplates-5-how-a-notification-travels",
        "level": 2
      },
      {
        "text": "Standard folder layout",
        "anchor": "communicationEmailSmsTemplates-6-standard-folder-layout",
        "level": 2
      },
      {
        "text": "Existing template inventory",
        "anchor": "communicationEmailSmsTemplates-7-existing-template-inventory",
        "level": 2
      },
      {
        "text": "Manifest reference",
        "anchor": "communicationEmailSmsTemplates-8-manifest-reference",
        "level": 2
      },
      {
        "text": "Configuration and activation",
        "anchor": "communicationEmailSmsTemplates-9-configuration-and-activation",
        "level": 2
      },
      {
        "text": "Selection precedence and published references",
        "anchor": "communicationEmailSmsTemplates-10-selection-precedence-and-published-references",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "communicationEmailSmsTemplates-11-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Choose the smallest change",
        "anchor": "communicationEmailSmsTemplates-12-choose-the-smallest-change",
        "level": 3
      },
      {
        "text": "Override a subject without copying the framework",
        "anchor": "communicationEmailSmsTemplates-13-override-a-subject-without-copying-the-framework",
        "level": 3
      },
      {
        "text": "Override HTML and plain text together",
        "anchor": "communicationEmailSmsTemplates-14-override-html-and-plain-text-together",
        "level": 3
      },
      {
        "text": "Customize optional branding defaults",
        "anchor": "communicationEmailSmsTemplates-15-customize-optional-branding-defaults",
        "level": 3
      },
      {
        "text": "Layer precedence",
        "anchor": "communicationEmailSmsTemplates-16-layer-precedence",
        "level": 3
      },
      {
        "text": "Locale fallback",
        "anchor": "communicationEmailSmsTemplates-17-locale-fallback",
        "level": 3
      },
      {
        "text": "Build a new email notification",
        "anchor": "communicationEmailSmsTemplates-18-build-a-new-email-notification",
        "level": 2
      },
      {
        "text": "1. Define the business contract",
        "anchor": "communicationEmailSmsTemplates-19-1-define-the-business-contract",
        "level": 3
      },
      {
        "text": "2. Add the manifest",
        "anchor": "communicationEmailSmsTemplates-20-2-add-the-manifest",
        "level": 3
      },
      {
        "text": "3. Add all three representations",
        "anchor": "communicationEmailSmsTemplates-21-3-add-all-three-representations",
        "level": 3
      },
      {
        "text": "4. Select the notification",
        "anchor": "communicationEmailSmsTemplates-22-4-select-the-notification",
        "level": 3
      },
      {
        "text": "5. Request through the existing owner",
        "anchor": "communicationEmailSmsTemplates-23-5-request-through-the-existing-owner",
        "level": 3
      },
      {
        "text": "Build a new SMS notification",
        "anchor": "communicationEmailSmsTemplates-24-build-a-new-sms-notification",
        "level": 2
      },
      {
        "text": "Parameter safety and supported interaction",
        "anchor": "communicationEmailSmsTemplates-25-parameter-safety-and-supported-interaction",
        "level": 2
      },
      {
        "text": "Durability, privacy and upgrades",
        "anchor": "communicationEmailSmsTemplates-26-durability-privacy-and-upgrades",
        "level": 2
      },
      {
        "text": "Troubleshooting matrix",
        "anchor": "communicationEmailSmsTemplates-27-troubleshooting-matrix",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "communicationEmailSmsTemplates-28-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification workflow",
        "anchor": "communicationEmailSmsTemplates-29-verification-workflow",
        "level": 2
      },
      {
        "text": "Related topics",
        "anchor": "communicationEmailSmsTemplates-30-related-topics",
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
        "title": "Concern, Canonical owner, What must not move here"
      },
      {
        "kind": "table",
        "title": "Owner, Channel and folder, Stable template code, Purpose, Required variables"
      },
      {
        "kind": "table",
        "title": "Field, Meaning and constraint"
      },
      {
        "kind": "table",
        "title": "Configuration, Default, Purpose"
      },
      {
        "kind": "table",
        "title": "Desired change, Correct extension"
      },
      {
        "kind": "table",
        "title": "Available files for a fr request, Effective file"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely cause, Safe next action"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "communication.overview",
      "communication.provider-runbooks"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js",
    "sourceChecksum": "03512c265ef5ebb97658f10dceafe66bf65359c9577f1b72c61d7adbac0b2cdc",
    "sourceWordCount": 4928,
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
    "wordCount": 4928,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "src/service/defaultCommunicationTemplateService.js",
      "src/service/defaultCommunicationRuntimeService.js",
      "config/properties.js",
      "package.json",
      "src/service"
    ]
  }
};
