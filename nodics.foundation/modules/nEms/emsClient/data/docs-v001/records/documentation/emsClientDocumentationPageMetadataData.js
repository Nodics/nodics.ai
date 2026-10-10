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
    "code": "nodicsDocsMetadataeventsMessagingClusterCoordination",
    "product": "nodicsDocumentationProduct",
    "documentId": "events.messaging-cluster-coordination",
    "title": "Events, Messaging, and Cluster Coordination",
    "summary": "Event publishing, event splitting, cluster propagation, node responsibility transfer, runtime refresh, and provider extension.",
    "businessSummary": "Events, Messaging, and Cluster Coordination explains the business purpose, supported decisions, operational impact, and controls for the Events and Cluster Coordination journey.",
    "technicalSummary": "Events, Messaging, and Cluster Coordination has canonical documentation records in emsClient at data/docs-v001/records/documentation/emsClientDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "emsClient",
    "targetPage": "nodicsDocsPageeventsMessagingClusterCoordination",
    "targetRoute": "nodicsDocsRouteeventsMessagingClusterCoordination",
    "articleComponent": "nodicsDocsComponenteventsMessagingClusterCoordination",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataeventsmessagingclustercoordination",
    "headings": [
      {
        "text": "Business context",
        "anchor": "eventsMessagingClusterCoordination-1-business-context",
        "level": 2
      },
      {
        "text": "Runtime model",
        "anchor": "eventsMessagingClusterCoordination-2-runtime-model",
        "level": 2
      },
      {
        "text": "Provider detail",
        "anchor": "eventsMessagingClusterCoordination-3-provider-detail",
        "level": 2
      },
      {
        "text": "Cluster coordination",
        "anchor": "eventsMessagingClusterCoordination-4-cluster-coordination",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "eventsMessagingClusterCoordination-5-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "eventsMessagingClusterCoordination-6-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "eventsMessagingClusterCoordination-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "eventsMessagingClusterCoordination-8-verification",
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
        "title": "Business need, Event and messaging answer"
      },
      {
        "kind": "table",
        "title": "Capability area, Main responsibility, Current implementation detail"
      },
      {
        "kind": "table",
        "title": "Cluster scenario, Business result, Technical behavior"
      },
      {
        "kind": "table",
        "title": "Customization goal, Recommended path, Required documentation"
      },
      {
        "kind": "table",
        "title": "Failure mode, Symptom, Troubleshooting step"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "runtime.governed-change",
      "cron.operations",
      "cache.runtime-state-management"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/emsClientDocumentationComponentData.js",
    "sourceChecksum": "ec9cd53e7258204e3001fbf33c872d3779f12881c7f363af478dd82ab5c74ca4",
    "sourceWordCount": 1372,
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
    "wordCount": 1372,
    "sourceEvidence": [
      "../../../../nodics.docs/data/manifest.json",
      "../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatafoundationEmsRuntimeClientRunbook",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.ems-runtime-client-runbook",
    "title": "EMS Runtime and Client Runbook",
    "summary": "How EMS runtime, EMS Client, broker providers, tenant resolution, retries, event processing, and operator evidence are governed.",
    "businessSummary": "EMS Runtime and Client Runbook explains the business purpose, supported decisions, operational impact, and controls for the Events and Cluster Coordination journey.",
    "technicalSummary": "EMS Runtime and Client Runbook has canonical documentation records in emsClient at data/docs-v001/records/documentation/emsClientDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "emsClient",
    "targetPage": "nodicsDocsPagefoundationEmsRuntimeClientRunbook",
    "targetRoute": "nodicsDocsRoutefoundationEmsRuntimeClientRunbook",
    "articleComponent": "nodicsDocsComponentfoundationEmsRuntimeClientRunbook",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationemsruntimeclientrunbook",
    "headings": [
      {
        "text": "Business problem",
        "anchor": "foundationEmsRuntimeClientRunbook-1-business-problem",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "foundationEmsRuntimeClientRunbook-2-source-map",
        "level": 2
      },
      {
        "text": "Message flow",
        "anchor": "foundationEmsRuntimeClientRunbook-3-message-flow",
        "level": 2
      },
      {
        "text": "Contract",
        "anchor": "foundationEmsRuntimeClientRunbook-4-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "foundationEmsRuntimeClientRunbook-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Operating rules",
        "anchor": "foundationEmsRuntimeClientRunbook-6-operating-rules",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationEmsRuntimeClientRunbook-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationEmsRuntimeClientRunbook-8-verification",
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
      }
    ],
    "visualRequirements": [
      "sequence-flow",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "events.messaging-cluster-coordination",
      "communication.provider-runbooks",
      "process.workflow-bpm-source-map"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/emsClientDocumentationComponentData.js",
    "sourceChecksum": "c7e5a9e81e3bf549a3798a8fd413db87a4052162b5cfbd1d544a87826993d048",
    "sourceWordCount": 509,
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
    "wordCount": 509,
    "sourceEvidence": [
      "../../../../nodics.docs/data/manifest.json",
      "../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "..",
      ".",
      "../kafka",
      "../activemq",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
