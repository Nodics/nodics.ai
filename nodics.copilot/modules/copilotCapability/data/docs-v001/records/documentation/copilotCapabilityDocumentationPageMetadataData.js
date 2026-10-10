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
    "code": "nodicsDocsMetadatacopilotImportInspection",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.import-inspection",
    "title": "Data-release Inspection in Copilot",
    "summary": "Inspect admitted nImport release catalogues, run summaries and validation-only plans without installing releases or importing media.",
    "businessSummary": "Data-release Inspection in Copilot explains the business purpose, supported decisions, operational impact, and controls for the AI Copilot journey.",
    "technicalSummary": "Data-release Inspection in Copilot has canonical documentation records in copilotCapability at data/docs-v001/records/documentation/copilotCapabilityDocumentationComponentData.js, with functional visibility under nodics.copilot. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotCapability",
    "targetPage": "nodicsDocsPagecopilotImportInspection",
    "targetRoute": "nodicsDocsRoutecopilotImportInspection",
    "articleComponent": "nodicsDocsComponentcopilotImportInspection",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotimportinspection",
    "headings": [
      {
        "text": "Purpose",
        "anchor": "copilotImportInspection-1-purpose",
        "level": 2
      },
      {
        "text": "Business journey",
        "anchor": "copilotImportInspection-2-business-journey",
        "level": 2
      },
      {
        "text": "Supported operations",
        "anchor": "copilotImportInspection-3-supported-operations",
        "level": 2
      },
      {
        "text": "Configuration",
        "anchor": "copilotImportInspection-4-configuration",
        "level": 2
      },
      {
        "text": "Authorization and privacy",
        "anchor": "copilotImportInspection-5-authorization-and-privacy",
        "level": 2
      },
      {
        "text": "Why installation is not exposed",
        "anchor": "copilotImportInspection-6-why-installation-is-not-exposed",
        "level": 2
      },
      {
        "text": "Failure and recovery",
        "anchor": "copilotImportInspection-7-failure-and-recovery",
        "level": 2
      },
      {
        "text": "Troubleshooting",
        "anchor": "copilotImportInspection-8-troubleshooting",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "copilotImportInspection-9-verification",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "copilotImportInspection-10-common-mistakes",
        "level": 2
      },
      {
        "text": "Customization contract",
        "anchor": "copilotImportInspection-11-customization-contract",
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
        "title": "Copilot operation, Native owner call, Effect"
      },
      {
        "kind": "table",
        "title": "Operation family, Native permission"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely cause, Safe response"
      }
    ],
    "visualRequirements": [
      "sequence-flow",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "copilot.process-inspection",
      "copilot.original-business-results"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotCapabilityDocumentationComponentData.js",
    "sourceChecksum": "de2f0b0e93f83823dfcf7f03c2bc3db3b9c23bb3d9da7ea7fe1c22da0e0b104d",
    "sourceWordCount": 1217,
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
    "wordCount": 1217,
    "sourceEvidence": [
      "src/service/defaultCopilotImportInspectionService.js",
      "test/copilotImportInspection.test.js",
      "../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatacopilotProcessInspection",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.process-inspection",
    "title": "Process Inspection in Copilot",
    "summary": "Inspect admitted workflow definitions, versions, instances, tasks and incidents through native employee-authorized reads without executing workflow actions.",
    "businessSummary": "Process Inspection in Copilot explains the business purpose, supported decisions, operational impact, and controls for the AI Copilot journey.",
    "technicalSummary": "Process Inspection in Copilot has canonical documentation records in copilotCapability at data/docs-v001/records/documentation/copilotCapabilityDocumentationComponentData.js, with functional visibility under nodics.copilot. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotCapability",
    "targetPage": "nodicsDocsPagecopilotProcessInspection",
    "targetRoute": "nodicsDocsRoutecopilotProcessInspection",
    "articleComponent": "nodicsDocsComponentcopilotProcessInspection",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotprocessinspection",
    "headings": [
      {
        "text": "Business outcome and boundaries",
        "anchor": "copilotProcessInspection-1-business-outcome-and-boundaries",
        "level": 2
      },
      {
        "text": "Prerequisites and configuration",
        "anchor": "copilotProcessInspection-2-prerequisites-and-configuration",
        "level": 2
      },
      {
        "text": "Step-by-step employee journey",
        "anchor": "copilotProcessInspection-3-step-by-step-employee-journey",
        "level": 2
      },
      {
        "text": "Operation and native API contracts",
        "anchor": "copilotProcessInspection-4-operation-and-native-api-contracts",
        "level": 2
      },
      {
        "text": "Data handling and recording",
        "anchor": "copilotProcessInspection-5-data-handling-and-recording",
        "level": 2
      },
      {
        "text": "Failure and recovery",
        "anchor": "copilotProcessInspection-6-failure-and-recovery",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "copilotProcessInspection-7-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "copilotProcessInspection-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Signed-in application verification",
        "anchor": "copilotProcessInspection-9-signed-in-application-verification",
        "level": 2
      },
      {
        "text": "Verification: component and native tests",
        "anchor": "copilotProcessInspection-10-verification-component-and-native-tests",
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
        "title": "Property, Default, Meaning and limits",
        "mediaCode": "nodicsDocsImage_14f712cef83c1ef616fb9972"
      },
      {
        "kind": "table",
        "title": "Operation, Native permission, Workflow GET suffix, Configured identity",
        "mediaCode": "nodicsDocsImage_8c3f0c8c18648d2b0766aa96"
      },
      {
        "kind": "table",
        "title": "Symptom or code, Meaning, Safe next action",
        "mediaCode": "nodicsDocsImage_5a684b97630b13347333e728"
      },
      {
        "kind": "image",
        "title": "Actual signed-in Process result in the Axis application",
        "mediaCode": "nodicsDocsImage_8ca6274851ef29f4c573b856"
      },
      {
        "kind": "image",
        "title": "Actual mobile Process form after backend restart",
        "mediaCode": "nodicsDocsImage_fe40e522f93fcbbfd3919f60"
      },
      {
        "kind": "image",
        "title": "Restricted employee refused a manually submitted Process command"
      },
      {
        "kind": "image",
        "title": "Synthetic Process inspection form at desktop width"
      },
      {
        "kind": "image",
        "title": "Synthetic Process inspection form at mobile width"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "copilot.rules-inspection",
      "copilot.original-business-results"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotCapabilityDocumentationComponentData.js",
    "sourceChecksum": "d2aecd51adefe35d181e123e7e6d0610f0c710dbfee2e7d3e1b41f870cfb4627",
    "sourceWordCount": 2389,
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
    "wordCount": 2389,
    "sourceEvidence": [
      "src/service/defaultCopilotProcessInspectionService.js",
      "test/copilotProcessInspectionRuntime.live.test.js",
      "../../../nodics.process/modules/workflow/src/service/operation/defaultProcessOperationsInspectionService.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record2": {
    "code": "nodicsDocsMetadatacopilotRulesInspection",
    "product": "nodicsDocumentationProduct",
    "documentId": "copilot.rules-inspection",
    "title": "Rules Inspection in Copilot",
    "summary": "Inspect admitted rule and score-band summaries, versions and audit metadata through native employee-authorized reads.",
    "businessSummary": "Rules Inspection in Copilot explains the business purpose, supported decisions, operational impact, and controls for the AI Copilot journey.",
    "technicalSummary": "Rules Inspection in Copilot has canonical documentation records in copilotCapability at data/docs-v001/records/documentation/copilotCapabilityDocumentationComponentData.js, with functional visibility under nodics.copilot. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.copilot",
    "technicalModule": "copilotCapability",
    "targetPage": "nodicsDocsPagecopilotRulesInspection",
    "targetRoute": "nodicsDocsRoutecopilotRulesInspection",
    "articleComponent": "nodicsDocsComponentcopilotRulesInspection",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacopilotrulesinspection",
    "headings": [
      {
        "text": "Supported operations",
        "anchor": "copilotRulesInspection-1-supported-operations",
        "level": 2
      },
      {
        "text": "Administrator setup",
        "anchor": "copilotRulesInspection-2-administrator-setup",
        "level": 2
      },
      {
        "text": "Inspect a rule",
        "anchor": "copilotRulesInspection-3-inspect-a-rule",
        "level": 2
      },
      {
        "text": "Owner flow",
        "anchor": "copilotRulesInspection-4-owner-flow",
        "level": 2
      },
      {
        "text": "Failure and recovery",
        "anchor": "copilotRulesInspection-5-failure-and-recovery",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "copilotRulesInspection-6-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "copilotRulesInspection-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "copilotRulesInspection-8-verification",
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
        "title": "Choice, Native GET path under the Rules connection, Additional employee permission",
        "mediaCode": "nodicsDocsImage_2488b2e141953db92d3a295b"
      },
      {
        "kind": "image",
        "title": "Synthetic Rules inspection form at desktop width",
        "mediaCode": "nodicsDocsImage_2d65b3c0efc982f8d5281043"
      },
      {
        "kind": "image",
        "title": "Synthetic Rules inspection form at mobile width",
        "mediaCode": "nodicsDocsImage_fbcc50b88a0785c0d739e15a"
      },
      {
        "kind": "table",
        "title": "Symptom, Meaning, Action",
        "mediaCode": "nodicsDocsImage_13e7608ae078c2a9626c48f9"
      },
      {
        "kind": "image",
        "title": "Actual signed-in Rules result in Axis"
      },
      {
        "kind": "image",
        "title": "Recorded inspection restored on mobile after backend restart"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "copilot.original-business-results"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/copilotCapabilityDocumentationComponentData.js",
    "sourceChecksum": "9317c051cc5852ec3533b61e4ed5fe92e8b6fe6948ce8caceff06c3e8a865d5f",
    "sourceWordCount": 1777,
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
    "wordCount": 1777,
    "sourceEvidence": [
      "src/service/defaultCopilotRulesInspectionService.js",
      "test/copilotRulesInspectionRuntime.live.test.js",
      "../../../nodics.rulesEngine/modules/rulesApi/src/service/defaultRuleManagementService.js",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
