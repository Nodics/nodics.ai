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
    "code": "nodicsDocsMetadataplatformModuleRegistry",
    "product": "nodicsDocumentationProduct",
    "documentId": "platform.module-registry",
    "title": "Functional module registry",
    "summary": "Durable project registration and runtime observation rules.",
    "businessSummary": "Functional module registry explains the business purpose, supported decisions, operational impact, and controls for the Functional Module Registry journey.",
    "technicalSummary": "Functional module registry has canonical documentation records in backoffice at data/docs-v001/records/documentation/backofficeDocumentationComponentData.js, with functional visibility under nodics.platform. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "backoffice",
    "targetPage": "nodicsDocsPageplatformModuleRegistry",
    "targetRoute": "nodicsDocsRouteplatformModuleRegistry",
    "articleComponent": "nodicsDocsComponentplatformModuleRegistry",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataplatformmoduleregistry",
    "headings": [
      {
        "text": "Why the registry exists",
        "anchor": "platformModuleRegistry-1-why-the-registry-exists",
        "level": 2
      },
      {
        "text": "Lifecycle states",
        "anchor": "platformModuleRegistry-2-lifecycle-states",
        "level": 2
      },
      {
        "text": "Mandatory versus optional modules",
        "anchor": "platformModuleRegistry-3-mandatory-versus-optional-modules",
        "level": 2
      },
      {
        "text": "Business value",
        "anchor": "platformModuleRegistry-4-business-value",
        "level": 2
      },
      {
        "text": "Business example: deciding to enable Process automation",
        "anchor": "platformModuleRegistry-5-business-example-deciding-to-enable-process-automation",
        "level": 2
      },
      {
        "text": "Developer model",
        "anchor": "platformModuleRegistry-6-developer-model",
        "level": 2
      },
      {
        "text": "API and UI contract expectations",
        "anchor": "platformModuleRegistry-7-api-and-ui-contract-expectations",
        "level": 2
      },
      {
        "text": "DevOps and operator model",
        "anchor": "platformModuleRegistry-8-devops-and-operator-model",
        "level": 2
      },
      {
        "text": "What the registry must not do",
        "anchor": "platformModuleRegistry-9-what-the-registry-must-not-do",
        "level": 2
      },
      {
        "text": "Security and audit expectations",
        "anchor": "platformModuleRegistry-10-security-and-audit-expectations",
        "level": 2
      },
      {
        "text": "Verification checklist",
        "anchor": "platformModuleRegistry-11-verification-checklist",
        "level": 2
      },
      {
        "text": "Acceptance scenarios",
        "anchor": "platformModuleRegistry-12-acceptance-scenarios",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "platformModuleRegistry-13-common-mistakes",
        "level": 2
      },
      {
        "text": "Required data completion before activation",
        "anchor": "platformModuleRegistry-14-required-data-completion-before-activation",
        "level": 2
      },
      {
        "text": "Runtime identity, activation and protected work",
        "anchor": "platformModuleRegistry-15-runtime-identity-activation-and-protected-work",
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
        "kind": "table",
        "title": "State, Beginner meaning, Axis action"
      },
      {
        "kind": "table",
        "title": "Module type, Example, User lifecycle"
      },
      {
        "kind": "table",
        "title": "Scenario, Expected result"
      }
    ],
    "visualRequirements": [
      "architecture-diagram",
      "source-map-table",
      "code-example"
    ],
    "relatedPages": [
      "platform.overview",
      "foundation.overview",
      "framework.local-quick-start"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/backofficeDocumentationComponentData.js",
    "sourceChecksum": "f979521d9e9607718ea5566c54f25059252ee37294c2c43c717b6b5c8efa458f",
    "sourceWordCount": 2395,
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
    "wordCount": 2395,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadataaxisBusinessCustomization",
    "product": "nodicsDocumentationProduct",
    "documentId": "axis.business-customization",
    "title": "Business Customization in Axis",
    "summary": "How Axis lets authorized users manage navigation, content areas, documentation pages, runtime configuration, and capability-specific business data.",
    "businessSummary": "Business Customization in Axis explains the business purpose, supported decisions, operational impact, and controls for the Axis Customization Workspace journey.",
    "technicalSummary": "Business Customization in Axis has canonical documentation records in backoffice at data/docs-v001/records/documentation/backofficeDocumentationComponentData.js, with functional visibility under nodics.platform. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "backoffice",
    "targetPage": "nodicsDocsPageaxisBusinessCustomization",
    "targetRoute": "nodicsDocsRouteaxisBusinessCustomization",
    "articleComponent": "nodicsDocsComponentaxisBusinessCustomization",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataaxisbusinesscustomization",
    "headings": [
      {
        "text": "Business context",
        "anchor": "axisBusinessCustomization-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "axisBusinessCustomization-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "axisBusinessCustomization-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "axisBusinessCustomization-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "axisBusinessCustomization-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "axisBusinessCustomization-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "axisBusinessCustomization-7-verification",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "docs.overview",
      "process.visual-designer",
      "wcms.overview"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/backofficeDocumentationComponentData.js",
    "sourceChecksum": "da21a71ed638245a3fe525784a0c52e85ae8ff0d85b64a012c70f35068542953",
    "sourceWordCount": 1114,
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
    "wordCount": 1114,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record2": {
    "code": "nodicsDocsMetadataapplicationsAxisSetupErrorContracts",
    "product": "nodicsDocumentationProduct",
    "documentId": "applications.axis-setup-error-contracts",
    "title": "Axis Setup and User-Safe Error Contracts",
    "summary": "How Axis presents setup, retry, blocker, and initialization errors with safe business messages while preserving technical evidence for operators.",
    "businessSummary": "Axis Setup and User-Safe Error Contracts explains the business purpose, supported decisions, operational impact, and controls for the Setup and Accelerators journey.",
    "technicalSummary": "Axis Setup and User-Safe Error Contracts has canonical documentation records in backoffice at data/docs-v001/records/documentation/backofficeDocumentationComponentData.js, with functional visibility under nodics.platform. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "backoffice",
    "targetPage": "nodicsDocsPageapplicationsAxisSetupErrorContracts",
    "targetRoute": "nodicsDocsRouteapplicationsAxisSetupErrorContracts",
    "articleComponent": "nodicsDocsComponentapplicationsAxisSetupErrorContracts",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataapplicationsaxissetuperrorcontracts",
    "headings": [
      {
        "text": "Source map",
        "anchor": "applicationsAxisSetupErrorContracts-1-source-map",
        "level": 2
      },
      {
        "text": "State model",
        "anchor": "applicationsAxisSetupErrorContracts-2-state-model",
        "level": 2
      },
      {
        "text": "Error contract",
        "anchor": "applicationsAxisSetupErrorContracts-3-error-contract",
        "level": 2
      },
      {
        "text": "Setup flow",
        "anchor": "applicationsAxisSetupErrorContracts-4-setup-flow",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "applicationsAxisSetupErrorContracts-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "applicationsAxisSetupErrorContracts-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "applicationsAxisSetupErrorContracts-7-verification",
        "level": 2
      },
      {
        "text": "Preparation phases and an already Online baseline",
        "anchor": "axis-setup-publication-phases",
        "level": 2
      },
      {
        "text": "Safe deferred setup diagnostics and recovery",
        "anchor": "axis-deferred-setup-recovery",
        "level": 2
      },
      {
        "text": "Customize and verify phased setup",
        "anchor": "axis-setup-phase-customization",
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
        "kind": "table",
        "title": "Owner operation, Framework source and boundary"
      },
      {
        "kind": "table",
        "title": "Blocker / safe operator message, Allowed action and replay precondition, Authorized evidence"
      },
      {
        "kind": "table",
        "title": "Fresh evidence, Meaning for Axis, Permitted next step"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "table",
      "troubleshooting-matrix",
      "diagram"
    ],
    "relatedPages": [
      "axis.business-customization",
      "platform.module-registry",
      "framework.fresh-schema-setup-journey",
      "applications.suite",
      "promotion.campaigns-coupon-issuance",
      "cart.customer-intent-calculation",
      "digital.purchase-delivery-reveal",
      "inventory.stock-management"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/backofficeDocumentationComponentData.js",
    "sourceChecksum": "6bb30eb6e6d0bf062bd29a5b86c4d4f1953c236766787d7c71a6aa9c79f46c45",
    "sourceWordCount": 1904,
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
    "wordCount": 1904,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "src/service/defaultBackofficeApplicationInitializationService.js",
      "src/service/availability/defaultBackofficeAvailabilityService.js",
      "src/service/registry/defaultBackofficeCapabilityRegistryService.js",
      "test/backofficeApplicationInitializationContract.test.js",
      "../../../../nodics.exp/nodics.axis/package.json",
      "package.json",
      "src/schemas",
      "src/service",
      "test/applicationPreparationOrder.test.js",
      "test/applicationPreparationReceipts.test.js"
    ]
  },
  "record3": {
    "code": "nodicsDocsMetadataplatformModuleRegistryJourney",
    "product": "nodicsDocumentationProduct",
    "documentId": "platform.module-registry-journey",
    "title": "Module Registry Journey",
    "summary": "How installed modules become registered, activated, dependency-checked, and visible to Axis as governed business capabilities.",
    "businessSummary": "Module Registry Journey explains the business purpose, supported decisions, operational impact, and controls for the Module Registry Foundations journey.",
    "technicalSummary": "Module Registry Journey has canonical documentation records in backoffice at data/docs-v001/records/documentation/backofficeDocumentationComponentData.js, with functional visibility under nodics.platform. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "backoffice",
    "targetPage": "nodicsDocsPageplatformModuleRegistryJourney",
    "targetRoute": "nodicsDocsRouteplatformModuleRegistryJourney",
    "articleComponent": "nodicsDocsComponentplatformModuleRegistryJourney",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataplatformmoduleregistryjourney",
    "headings": [
      {
        "text": "Source map",
        "anchor": "platformModuleRegistryJourney-1-source-map",
        "level": 2
      },
      {
        "text": "Lifecycle",
        "anchor": "platformModuleRegistryJourney-2-lifecycle",
        "level": 2
      },
      {
        "text": "Registry contract",
        "anchor": "platformModuleRegistryJourney-3-registry-contract",
        "level": 2
      },
      {
        "text": "Dependency and activation rules",
        "anchor": "platformModuleRegistryJourney-4-dependency-and-activation-rules",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "platformModuleRegistryJourney-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Read the registry without confusing its states",
        "anchor": "platformModuleRegistryJourney-6-read-the-registry-without-confusing-its-states",
        "level": 2
      },
      {
        "text": "Axis administrator walkthrough",
        "anchor": "platformModuleRegistryJourney-7-axis-administrator-walkthrough",
        "level": 2
      },
      {
        "text": "Example: unavailable target, independent action",
        "anchor": "platformModuleRegistryJourney-8-example-unavailable-target-independent-action",
        "level": 3
      },
      {
        "text": "Customize and extend safely",
        "anchor": "platformModuleRegistryJourney-9-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Narrow an existing provider in a project overlay",
        "anchor": "platformModuleRegistryJourney-10-narrow-an-existing-provider-in-a-project-overlay",
        "level": 3
      },
      {
        "text": "Tune catalogue page size without changing eligibility",
        "anchor": "platformModuleRegistryJourney-11-tune-catalogue-page-size-without-changing-eligibility",
        "level": 3
      },
      {
        "text": "Non-customizable security and ownership",
        "anchor": "platformModuleRegistryJourney-12-non-customizable-security-and-ownership",
        "level": 3
      },
      {
        "text": "Troubleshooting and recovery",
        "anchor": "platformModuleRegistryJourney-13-troubleshooting-and-recovery",
        "level": 2
      },
      {
        "text": "Repeatable acceptance examples",
        "anchor": "platformModuleRegistryJourney-14-repeatable-acceptance-examples",
        "level": 2
      },
      {
        "text": "Revision conflict during activation",
        "anchor": "platformModuleRegistryJourney-15-revision-conflict-during-activation",
        "level": 3
      },
      {
        "text": "Implementation handoff",
        "anchor": "platformModuleRegistryJourney-16-implementation-handoff",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "platformModuleRegistryJourney-17-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "platformModuleRegistryJourney-18-verification",
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
        "kind": "table",
        "title": "Area, Source location"
      },
      {
        "kind": "table",
        "title": "Observation, Meaning, Next useful action"
      },
      {
        "kind": "table",
        "title": "Symptom, Check, Safe correction and proof"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "platform.module-registry",
      "applications.axis-setup-error-contracts",
      "framework.module-loading-service-precedence"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/backofficeDocumentationComponentData.js",
    "sourceChecksum": "490628f6294594e5ac0ecb5132ea3c40af96cf044fd2d404b7f8cb8b57535261",
    "sourceWordCount": 2675,
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
    "wordCount": 2675,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service/registry/defaultBackofficeCapabilityRegistryService.js",
      "src/service/registry/defaultBackofficeRegistryStoreService.js",
      "src/service/discovery/defaultBackofficeDiscoveryService.js",
      "test/backofficeRegistryRouteContract.test.js",
      "src/service/registry/defaultFunctionalModuleCatalogueService.js",
      "src/service/registry/defaultBackofficeRegistryService.js",
      "test/navigationModuleAvailability.test.js",
      "../../../nodics.waste/modules/wasteCore/src/service/defaultWasteBackofficeCapabilityService.js",
      "src/schemas",
      "src/service"
    ]
  }
};
