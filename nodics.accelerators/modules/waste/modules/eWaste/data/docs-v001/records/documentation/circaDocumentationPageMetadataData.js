/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Circa documentation page metadata. */
module.exports = {
  "record0": {
    "code": "circaDocsMetadatacircaCatalogue",
    "product": "circaDocumentationProduct",
    "documentId": "circa.catalogue",
    "title": "Circa Shop and Coupons",
    "summary": "Reusable eWaste published-offer composition, native versus full-catalogue boundaries, safe projection, bounded reads and project-owned customization.",
    "businessSummary": "Reusable eWaste published-offer composition, native versus full-catalogue boundaries, safe projection, bounded reads and project-owned customization.",
    "technicalSummary": "eWaste-owned reusable source contract; current implementation, project extension, rejection/recovery and explicit integration/live acceptance limits.",
    "ownerFunctionalModule": "nodics.accelerators",
    "technicalModule": "eWaste",
    "targetPage": "circaDocsPagecircaCatalogue",
    "targetRoute": "circaDocsRoutecircaCatalogue",
    "articleComponent": "circaDocsComponentcircaCatalogue",
    "template": "circaDocumentationArticleTemplate",
    "searchMetadata": "circaDocsSearchpagecircadocsmetadatacircacatalogue",
    "headings": [
      {
        "text": "Ownership and composition",
        "anchor": "circaCatalogue-1-ownership-and-composition",
        "level": 2
      },
      {
        "text": "Public endpoints",
        "anchor": "circaCatalogue-2-public-endpoints",
        "level": 2
      },
      {
        "text": "Reference deployment bounds",
        "anchor": "circaCatalogue-3-reference-deployment-bounds",
        "level": 2
      },
      {
        "text": "Product content",
        "anchor": "circaCatalogue-4-product-content",
        "level": 2
      },
      {
        "text": "Validation",
        "anchor": "circaCatalogue-5-validation",
        "level": 2
      },
      {
        "text": "Audience and Ownership Checks",
        "anchor": "circa-catalogue-audience-owner-checks",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "circa-catalogue-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common Mistakes",
        "anchor": "circa-catalogue-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "circa-catalogue-verification",
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
        "title": "Observation or failure, Meaning and safe response"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example"
    ],
    "relatedPages": [
      "catalog.product-discovery-management",
      "commerce.cart-order"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/circaDocumentationComponentData.js",
    "sourceChecksum": "b283a57ecd29b15fdcaeb69c2e60a1c7db4cd881ef91e71c739e20988c3868fa",
    "sourceWordCount": 1507,
    "audience": [
      "business-user",
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
    "accessPolicy": "circaDocsAccessAuthenticated",
    "accessMode": "AUTHENTICATED",
    "lifecycleState": "STAGED",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 1507,
    "sourceEvidence": [
      "README.md",
      "AGENTS.md",
      "config/properties.js",
      "llm/contracts/e-waste-domain.md",
      "src/service/defaultEWasteCatalogueService.js",
      "src/service/defaultEWasteMarketplaceService.js",
      "src/service/defaultEWasteRequestService.js",
      "src/controller/defaultEWasteExperienceController.js",
      "src/router/routers.js",
      "test/eWasteCatalogueDiscovery.test.js",
      "test/eWasteCatalogueContract.test.js",
      "../../../../../nodics.waste/modules/wasteMaterial/src/service/defaultWasteItemDescriptorService.js"
    ],
    "businessAudience": [
      "business evaluator",
      "customer",
      "administrator"
    ],
    "technicalAudience": [
      "architect",
      "developer",
      "operator",
      "qa engineer",
      "ai tool"
    ]
  },
  "record1": {
    "code": "circaDocsMetadatacircaCustomerJourney",
    "product": "circaDocumentationProduct",
    "documentId": "circa.customer-journey",
    "title": "Circa customer journey",
    "summary": "Reusable eWaste customer, evidence and review orchestration with explicit arrival wiring, limited eligibility, real reviewer policy and separate live acceptance gates.",
    "businessSummary": "Reusable eWaste customer, evidence and review orchestration with explicit arrival wiring, limited eligibility, real reviewer policy and separate live acceptance gates.",
    "technicalSummary": "eWaste-owned reusable source contract; current implementation, project extension, rejection/recovery and explicit integration/live acceptance limits.",
    "ownerFunctionalModule": "nodics.accelerators",
    "technicalModule": "eWaste",
    "targetPage": "circaDocsPagecircaCustomerJourney",
    "targetRoute": "circaDocsRoutecircaCustomerJourney",
    "articleComponent": "circaDocsComponentcircaCustomerJourney",
    "template": "circaDocumentationArticleTemplate",
    "searchMetadata": "circaDocsSearchpagecircadocsmetadatacircacustomerjourney",
    "headings": [
      {
        "text": "Connected eWaste customer journey",
        "anchor": "circaCustomerJourney-1-connected-circa-local-customer-journey",
        "level": 2
      },
      {
        "text": "Scope and authority",
        "anchor": "circaCustomerJourney-2-scope-and-authority",
        "level": 2
      },
      {
        "text": "Compose the required owner topology",
        "anchor": "circaCustomerJourney-3-start-the-local-topology",
        "level": 2
      },
      {
        "text": "Governed sample import",
        "anchor": "circaCustomerJourney-4-governed-sample-import",
        "level": 2
      },
      {
        "text": "Restore the collection network after a local reset",
        "anchor": "circaCustomerJourney-5-restore-the-collection-network-after-a-local-reset",
        "level": 3
      },
      {
        "text": "Commerce publication",
        "anchor": "circaCustomerJourney-6-commerce-publication",
        "level": 2
      },
      {
        "text": "Walk through the experience",
        "anchor": "circaCustomerJourney-7-walk-through-the-experience",
        "level": 2
      },
      {
        "text": "Shared journey service and channel boundaries",
        "anchor": "circaCustomerJourney-8-shared-web-and-telegram-submission-implementation-2026-09-09",
        "level": 2
      },
      {
        "text": "Local Telegram launch recovery",
        "anchor": "circaCustomerJourney-9-local-telegram-launch-recovery",
        "level": 3
      },
      {
        "text": "Evidence and current state",
        "anchor": "circaCustomerJourney-10-evidence-and-current-state",
        "level": 2
      },
      {
        "text": "Deployment gates",
        "anchor": "circaCustomerJourney-11-deployment-gates",
        "level": 2
      },
      {
        "text": "Domain accelerator consolidation",
        "anchor": "circaCustomerJourney-12-domain-accelerator-consolidation",
        "level": 2
      },
      {
        "text": "Operational roles and independent approval",
        "anchor": "circaCustomerJourney-13-operational-roles-and-independent-approval",
        "level": 2
      },
      {
        "text": "Negotiated purchases and merchant operations",
        "anchor": "circaCustomerJourney-14-negotiated-purchases-and-merchant-operations",
        "level": 2
      },
      {
        "text": "Enterprise merchant fulfillment and refunds",
        "anchor": "circaCustomerJourney-15-enterprise-merchant-fulfillment-and-refunds",
        "level": 2
      },
      {
        "text": "Account and channel ownership",
        "anchor": "circaCustomerJourney-16-account-and-channel-ownership",
        "level": 2
      },
      {
        "text": "Audience and Ownership Checks",
        "anchor": "circa-customer-journey-audience-owner-checks",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "circa-customer-journey-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common Mistakes",
        "anchor": "circa-customer-journey-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "circa-customer-journey-verification",
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
        "title": "Selection, Authority and scope, Not established"
      },
      {
        "kind": "table",
        "title": "Operation, Required backend grant, Additional source boundary"
      },
      {
        "kind": "table",
        "title": "Failure, Recovery boundary"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example"
    ],
    "relatedPages": [
      "location.shared-map-configuration",
      "catalog.product-discovery-management",
      "commerce.cart-order",
      "order.management-lifecycle",
      "commerce.returns-refunds",
      "waste.impact-providers"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/circaDocumentationComponentData.js",
    "sourceChecksum": "286408f604928342f6138658385f8ab670142dd780d5bd8d59f6adcb519c4b2d",
    "sourceWordCount": 2977,
    "audience": [
      "business-user",
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
    "accessPolicy": "circaDocsAccessAuthenticated",
    "accessMode": "AUTHENTICATED",
    "lifecycleState": "STAGED",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 2977,
    "sourceEvidence": [
      "README.md",
      "AGENTS.md",
      "config/properties.js",
      "llm/contracts/e-waste-domain.md",
      "llm/contracts/reference-compatibility.md",
      "src/service/defaultEWasteJourneyService.js",
      "src/service/defaultEWasteJourneyContractService.js",
      "src/service/defaultEWasteExperienceService.js",
      "src/service/defaultEWasteRequestService.js",
      "src/controller/defaultEWasteExperienceController.js",
      "src/router/routers.js",
      "src/service/defaultEWasteSubmissionPreparationService.js",
      "src/service/defaultEWasteChannelAuthenticationService.js",
      "src/service/defaultEWasteAcceptanceReadinessService.js",
      "src/service/defaultEWasteOutcomeCommunicationService.js",
      "src/service/defaultEWasteOrderReversalService.js",
      "test/eWasteJourneyService.test.js",
      "test/eWastePreparation.test.js",
      "test/eWasteCollectionVisibilityContract.test.js",
      "../../../../../nodics.waste/modules/wasteSubmission/src/service/defaultWasteSubmissionOperationService.js",
      "../../../../../nodics.waste/modules/wasteCollection/src/service/defaultWasteCollectionCentreService.js",
      "../../../../../nodics.waste/modules/wasteCore/config/properties.js",
      "../../../../../nodics.waste/modules/wasteCore/src/service/defaultWasteOperationalAccessService.js",
      "../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteVerificationOperationService.js",
      "../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteReviewWorkspaceService.js"
    ],
    "businessAudience": [
      "business evaluator",
      "customer",
      "administrator"
    ],
    "technicalAudience": [
      "architect",
      "developer",
      "operator",
      "qa engineer",
      "ai tool"
    ]
  },
  "record2": {
    "code": "circaDocsMetadatacircaDemoData",
    "product": "circaDocumentationProduct",
    "documentId": "circa.demo-data",
    "title": "Circa demonstration dataset",
    "summary": "Reusable eWaste preset inventory, explicit nImport adoption, aligned customer deltas and recovery without replaying customer history or inventing owner qualification.",
    "businessSummary": "Reusable eWaste preset inventory, explicit nImport adoption, aligned customer deltas and recovery without replaying customer history or inventing owner qualification.",
    "technicalSummary": "eWaste-owned reusable source contract; current implementation, project extension, rejection/recovery and explicit integration/live acceptance limits.",
    "ownerFunctionalModule": "nodics.accelerators",
    "technicalModule": "eWaste",
    "targetPage": "circaDocsPagecircaDemoData",
    "targetRoute": "circaDocsRoutecircaDemoData",
    "articleComponent": "circaDocsComponentcircaDemoData",
    "template": "circaDocumentationArticleTemplate",
    "searchMetadata": "circaDocsSearchpagecircadocsmetadatacircademodata",
    "headings": [
      {
        "text": "Reusable reference and customer demonstration",
        "anchor": "circaDemoData-1-one-customer-demonstration",
        "level": 2
      },
      {
        "text": "Dataset Inventory",
        "anchor": "circaDemoData-2-dataset-inventory",
        "level": 2
      },
      {
        "text": "Import Sequence",
        "anchor": "circaDemoData-3-import-sequence",
        "level": 2
      },
      {
        "text": "Repeat Imports And Recovery",
        "anchor": "circaDemoData-4-repeat-imports-and-recovery",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "circaDemoData-5-customization",
        "level": 2
      },
      {
        "text": "Local Demo Runtime Admission",
        "anchor": "circaDemoData-6-local-demo-runtime-admission",
        "level": 2
      },
      {
        "text": "Audience and Ownership Checks",
        "anchor": "circa-demo-data-audience-owner-checks",
        "level": 2
      },
      {
        "text": "Common Mistakes",
        "anchor": "circa-demo-data-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "circa-demo-data-verification",
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
        "title": "Canonical source, Reusable contribution, Not implied"
      },
      {
        "kind": "table",
        "title": "Observation, Safe interpretation/recovery"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example"
    ],
    "relatedPages": [
      "catalog.product-discovery-management",
      "commerce.cart-order"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/circaDocumentationComponentData.js",
    "sourceChecksum": "03553bbd121874a571323820aec74ebbf7fc0af7777be23a3dc20070df0a3117",
    "sourceWordCount": 1552,
    "audience": [
      "business-user",
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
    "accessPolicy": "circaDocsAccessAuthenticated",
    "accessMode": "AUTHENTICATED",
    "lifecycleState": "STAGED",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 1552,
    "sourceEvidence": [
      "README.md",
      "AGENTS.md",
      "config/properties.js",
      "llm/contracts/e-waste-domain.md",
      "llm/contracts/reference-compatibility.md",
      "data/manifest.json",
      "data/core-v001/headers/waste/eWastePresetHeader.js",
      "data/core-v001/records/waste/eWasteFamilyData.js",
      "data/core-v001/records/waste/eWasteCategoryData.js",
      "data/core-v001/records/waste/eWasteItemTypeData.js",
      "data/core-v001/records/waste/eWasteCollectionPresetData.js",
      "data/core-v001/records/waste/eWasteAcceptanceRuleData.js",
      "data/core-v001/records/waste/eWasteEvidencePolicyData.js",
      "data/core-v001/records/waste/eWasteVerificationPolicyData.js",
      "data/core-v001/records/waste/eWasteImpactProfileData.js",
      "data/docs-v001/headers/circaDocumentationContentPackHeader.js",
      "test/eWasteReferenceCompatibility.test.js",
      "test/eWasteReferenceRelease.test.js",
      "test/eWastePresetDataContract.test.js",
      "../../../../../nodics.waste/modules/wasteSubmission/src/service/defaultWasteSubmissionOperationService.js"
    ],
    "businessAudience": [
      "business evaluator",
      "customer",
      "administrator"
    ],
    "technicalAudience": [
      "architect",
      "developer",
      "operator",
      "qa engineer",
      "ai tool"
    ]
  },
  "record3": {
    "code": "circaDocsMetadatacircaCustomerKnowledge",
    "product": "circaDocumentationProduct",
    "documentId": "circa.customer-knowledge",
    "title": "Circa customer knowledge",
    "summary": "Reusable customer knowledge for advisory photo/guidance, known and unknown facts, confirmation, real review/settlement and explicitly unqualified retrieval/live journeys.",
    "businessSummary": "Reusable customer knowledge for advisory photo/guidance, known and unknown facts, confirmation, real review/settlement and explicitly unqualified retrieval/live journeys.",
    "technicalSummary": "eWaste-owned reusable source contract; current implementation, project extension, rejection/recovery and explicit integration/live acceptance limits.",
    "ownerFunctionalModule": "nodics.accelerators",
    "technicalModule": "eWaste",
    "targetPage": "circaDocsPagecircaCustomerKnowledge",
    "targetRoute": "circaDocsRoutecircaCustomerKnowledge",
    "articleComponent": "circaDocsComponentcircaCustomerKnowledge",
    "template": "circaDocumentationArticleTemplate",
    "searchMetadata": "circaDocsSearchpagecircadocsmetadatacircacustomerknowledge",
    "headings": [
      {
        "text": "Location and arrival",
        "anchor": "circaCustomerKnowledge-1-location-and-arrival",
        "level": 2
      },
      {
        "text": "Photo, identification and correction",
        "anchor": "circaCustomerKnowledge-2-photo-identification-and-correction",
        "level": 2
      },
      {
        "text": "Handling and unknown details",
        "anchor": "circaCustomerKnowledge-3-handling-and-unknown-details",
        "level": 2
      },
      {
        "text": "Confirmation and review",
        "anchor": "circaCustomerKnowledge-4-confirmation-and-review",
        "level": 2
      },
      {
        "text": "Benefits and ownership",
        "anchor": "circaCustomerKnowledge-5-benefits-and-ownership",
        "level": 2
      },
      {
        "text": "Accounts, privacy and recovery",
        "anchor": "circaCustomerKnowledge-6-accounts-privacy-and-recovery",
        "level": 2
      },
      {
        "text": "Audience and Ownership Checks",
        "anchor": "circa-customer-knowledge-audience-owner-checks",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "circa-customer-knowledge-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common Mistakes",
        "anchor": "circa-customer-knowledge-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "circa-customer-knowledge-verification",
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
        "title": "Observation, Meaning and safe response"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example"
    ],
    "relatedPages": [
      "location.shared-map-configuration",
      "waste.impact-providers"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/circaDocumentationComponentData.js",
    "sourceChecksum": "43c11ef3b666f0ca979880ea0566585b7d9d3bcacba33314261f1c03351a870b",
    "sourceWordCount": 1697,
    "audience": [
      "business-user",
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
    "accessPolicy": "circaDocsAccessAuthenticated",
    "accessMode": "AUTHENTICATED",
    "lifecycleState": "STAGED",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 1697,
    "sourceEvidence": [
      "README.md",
      "AGENTS.md",
      "config/properties.js",
      "llm/contracts/e-waste-domain.md",
      "src/service/defaultEWasteConversationService.js",
      "src/service/defaultEWasteExperienceService.js",
      "src/service/defaultEWasteJourneyService.js",
      "src/service/defaultEWasteSubmissionPreparationService.js",
      "src/service/defaultEWasteChannelAuthenticationService.js",
      "src/service/defaultEWasteAcceptanceReadinessService.js",
      "src/service/defaultEWasteOutcomeCommunicationService.js",
      "test/eWasteGuidanceHistory.test.js",
      "test/eWasteConversationContract.test.js",
      "test/eWastePreparation.test.js",
      "../../../../../nodics.waste/modules/wasteCore/config/properties.js",
      "../../../../../nodics.waste/modules/wasteSubmission/src/service/defaultWasteSubmissionOperationService.js",
      "../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteVerificationOperationService.js",
      "../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteReviewWorkspaceService.js"
    ],
    "businessAudience": [
      "business evaluator",
      "customer",
      "administrator"
    ],
    "technicalAudience": [
      "architect",
      "developer",
      "operator",
      "qa engineer",
      "ai tool"
    ]
  }
};
