/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical module-owned documentation CMS component records. */
module.exports = {
  "record0": {
    "code": "nodicsDocsComponentprocessWorkflowBpmSourceMap",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.workflow-bpm-source-map",
      "title": "Workflow and BPM Source Map",
      "route": "/docs/framework/process-workflow-bpm-source-map",
      "section": "process-and-workflow-automation",
      "sectionTitle": "Process and Workflow Automation",
      "group": "process-and-workflow-automation",
      "groupTitle": "Process and Workflow Automation",
      "parentId": "process-and-workflow-automation",
      "hierarchyPath": [
        "Process and Workflow Automation",
        "Workflow and BPM Source Map"
      ],
      "hierarchyDepth": 2,
      "documentType": "reference",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "How workflow definitions, transitions, human tasks, action adapters, callbacks, history, incidents, and operator visibility fit together.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.7",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "process.overview",
        "process.first-workflow",
        "process.first-human-task",
        "process.action-adapters"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "workflow",
        "bpm",
        "human-task",
        "callback",
        "process"
      ],
      "topicKeywords": [
        "Process and Workflow Automation",
        "Workflow Runtime",
        "Workflow and BPM Source Map"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "processWorkflowBpmSourceMap-1-source-map",
          "level": 2
        },
        {
          "text": "Workflow model",
          "anchor": "processWorkflowBpmSourceMap-2-workflow-model",
          "level": 2
        },
        {
          "text": "Contract",
          "anchor": "processWorkflowBpmSourceMap-3-contract",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "processWorkflowBpmSourceMap-4-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Implementation handoff",
          "anchor": "processWorkflowBpmSourceMap-5-implementation-handoff",
          "level": 2
        },
        {
          "text": "Evidence checklist",
          "anchor": "processWorkflowBpmSourceMap-6-evidence-checklist",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processWorkflowBpmSourceMap-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processWorkflowBpmSourceMap-8-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Framework nbpm integrates source-schema lifecycle events/mappings and dispatches workflow initialization. nodics.process/modules/workflow owns application Process definitions, immutable versions, instances, tasks, action attempts, incidents and history. Domain owners perform their own business decisions and mutations. These cooperating layers are not interchangeable workflow stores. For beginners, start with the two-owner source map and follow one CMS approval from its Process task through the declared action adapter to the CMS owner. Compare task completion, callback acknowledgement and domain publication as separate evidence. Use the linked Process sections for definition and task authoring; a supplied approval flag or callback string cannot replace completed-task authority."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "processWorkflowBpmSourceMap-1-source-map"
        },
        {
          "kind": "paragraph",
          "text": "A developer selects the existing Process definition and action adapter rather than writing a competing approval engine. Follow the exact source map from schema dispatch to task decision and owning-domain callback, preserving instance/task/action correlation and the stored decision authority. Test denial, callback failure and uncertain acknowledgement without directly mutating the approved domain state."
        },
        {
          "kind": "table",
          "headers": [
            "Repository-relative source / canonical section",
            "Authority"
          ],
          "rows": [
            [
              "nodics.foundation/modules/nbpm/src/service/workflow/defaultWorkflowService.js",
              "Generic local initializeWorkflows or DefaultModuleService invocation of workflow /item/init."
            ],
            [
              "nodics.process/modules/workflow/src/service/definition/defaultProcessDefinitionLifecycleService.js",
              "Draft validation and immutable definition versions."
            ],
            [
              "nodics.process/modules/workflow/src/service/operation/defaultProcessRuntimeLifecycleService.js",
              "Operational admission, pinned instance versions, tasks, attempts/incidents, retries and detail/audit."
            ],
            [
              "nodics.process/modules/workflow/src/service/operation/defaultProcessActionAdapterRegistryService.js",
              "Explicitly allowed declarative actions; no arbitrary executable graph content."
            ],
            [
              "nodics.process/modules/workflow/src/service/operation/defaultProcessPublicationDecisionCallbackService.js",
              "Bounded authenticated decision delivery to configured domain authority."
            ],
            [
              "nodics.wcms/modules/cms/src/service/publication/defaultCmsPublicationWorkflowService.js",
              "CMS-owned scoped request into Process approval; not nbpm's generic item initialization."
            ],
            [
              "nodics.foundation/modules/nPublish/src/service/defaultPublicationLifecycleService.js",
              "Owner-provider publication lifecycle; Process decisions are not direct content activation."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Use process.runtime-lifecycle anchors processRuntimeLifecycle-2-definition-lifecycle, -3-starting-an-instance, -4-task-lifecycle, -5-instance-detail-and-audit and -6-scheduled-triggers for the operational contracts. Use process.action-adapters anchors processActionAdapters-1-safe-default, -2-what-is-not-allowed and -5-adapter-operating-contract for adapter rules. These referenced sections retain their Process owner; this article maps them rather than duplicating the engine."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Workflow model",
          "anchor": "processWorkflowBpmSourceMap-2-workflow-model"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Mapping[\"nbpm schema lifecycle mapping\"] --> Dispatch[\"Local workflow initialization or authenticated module dispatch\"]\n  Definition[\"Process draft validation\"] --> Version[\"Immutable published graph version\"]\n  Version --> Instance[\"Process instance pinned to version\"]\n  Instance --> Task[\"Authorized human task\"]\n  Task --> Adapter[\"Allowlisted action / completed decision evidence\"]\n  Adapter --> Domain[\"Domain-owned decision API\"]\n  Instance --> Evidence[\"Process tasks, attempts, incidents and audit\"]"
        },
        {
          "kind": "paragraph",
          "text": "DefaultWorkflowService.publishToWorkflow chooses local initialization when workflow is active; otherwise prepareInvocation uses configured workflowModuleName, targetNodeId when selected, tenant internal authentication and targetAuthority runtimeRole PROCESS. This generic PUT /item/init path is not the CMS approval endpoint. CMS requestApproval independently validates its Staged source role/scope and targets POST /instances/publication-approval with publication reference/revision and idempotent correlation. Do not route human definitions through generic schema mappings or pass CMS content through Process."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Contract",
          "anchor": "processWorkflowBpmSourceMap-3-contract"
        },
        {
          "kind": "paragraph",
          "text": "Process definitions are validated graphs with node codes/types and transitions. Publishing creates an immutable processDefinitionVersion; instances use a selected published version rather than a mutable draft. Task permissions/actor policy and state changes remain backend-owned. Graph metadata cannot contain JavaScript, filesystem paths, executable URLs, arbitrary handlers or credentials."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{ \"moduleName\": \"cms\", \"operation\": \"applyPublicationDecision\" }"
        },
        {
          "kind": "paragraph",
          "text": "This is the actual declarative ACTION reference (node.action), not a complete graph or an executable callback string. When explicitly allowed by effective process.actionAdapters policy, cms.applyPublicationDecision resolves to DefaultProcessPublicationDecisionCallbackService.applyPublicationDecision with requiresCompletedTask:true. The registry obtains the stored completed task decision through completedDecisionExecution before calling it; merely listing a service in configuration or submitting approved:true does not grant approval authority."
        },
        {
          "kind": "paragraph",
          "text": "The callback checks publicationCode, boolean decision, configured non-default module/connection target and tenant internal token, then invokes POST /publication/process/decision through DefaultModuleService. It sends publication reference, expected revision, decision/reason and pinned Process instance/definition/version evidence, with idempotencyKey processInstanceCode:publicationCode. The domain owner still validates and applies the decision through its normal publication lifecycle. There is no DefaultCmsPublicationWorkflowCallbackService.afterApprove contract here, no direct CMS record mutation and no human-approval bypass."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "processWorkflowBpmSourceMap-4-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Add mappings in nbpm only for generic schema lifecycle integration; add business graphs and permitted adapters with their Process/domain owners. An adapter needs a bounded versioned input/result, trusted tenant/actor checks and owner idempotency, not arbitrary executable content. Keep connection coordinates and internal authentication with DefaultModuleService. Operator/task UI is a projection of owner APIs; a source map does not establish browser availability or a second task/audit registry."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Implementation handoff",
          "anchor": "processWorkflowBpmSourceMap-5-implementation-handoff"
        },
        {
          "kind": "paragraph",
          "text": "Retain definitionCode/version, instanceCode/node, task/actor decision, action adapter, attempt/incident and business correlation. On action/callback failure, inspect Process instance detail and incident evidence and the domain owner's current revision/outcome before a governed retry. Retries must preserve the original completed-task decision and pinned graph, not accept a new decision from the retry caller. Unknown adapters, missing completed-task evidence, missing target/token or stale domain revision reject; do not write approval fields directly to clear an incident. Compensation is owner-defined, not universal reversal of a completed business effect."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Evidence checklist",
          "anchor": "processWorkflowBpmSourceMap-6-evidence-checklist"
        },
        {
          "kind": "paragraph",
          "text": "Instance detail returns Process-owned instance, tasks and timeline; action attempts/incidents explain dependency failure separately from a waiting human task. Use the exact canonical sections above for commands and permissions. Keep audit bounded/redacted and retain original attempt identity on uncertain callback outcomes. A successful transport alone does not establish domain acceptance or publication."
        },
        {
          "kind": "paragraph",
          "text": "Qualification should exercise draft validation, immutable-version pinning, unauthorized claim/complete, rejection, unknown adapter, callback failure after possible owner effect, authorized retry and deterministic duplicate handling. Link operator evidence to the actual domain decision result without copying content/secrets into Process history."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processWorkflowBpmSourceMap-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Putting business mutations in workflow metadata instead of owner services.",
            "Creating transitions without permission checks.",
            "Losing callback failure evidence.",
            "Allowing production tasks to remain stuck without an operator queue.",
            "Bypassing workflow for publishable or audited changes."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processWorkflowBpmSourceMap-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Qualify nbpm local/remote initialization separately from Process human-task and domain publication-approval flows. Verify graph/adapter admission, task actor/revision rules, pinned history, callback target authentication, negative acknowledgements and incident/retry behavior against the owning contracts."
        },
        {
          "kind": "paragraph",
          "text": "Source-map file paths above are repository-relative. Importing this documentation never installs operational definitions, starts instances, assigns tasks or authorizes business changes."
        }
      ],
      "searchText": "Workflow and BPM Source Map How workflow definitions, transitions, human tasks, action adapters, callbacks, history, incidents, and operator visibility fit together. # Workflow and BPM Source Map\n\nFramework nbpm integrates source-schema lifecycle events/mappings and dispatches workflow initialization. nodics.process/modules/workflow owns application Process definitions, immutable versions, instances, tasks, action attempts, incidents and history. Domain owners perform their own business decisions and mutations. These cooperating layers are not interchangeable workflow stores. For beginners, start with the two-owner source map and follow one CMS approval from its Process task through the declared action adapter to the CMS owner. Compare task completion, callback acknowledgement and domain publication as separate evidence. Use the linked Process sections for definition and task authoring; a supplied approval flag or callback string cannot replace completed-task authority.\n\n## Source map\n\nA developer selects the existing Process definition and action adapter rather than writing a competing approval engine. Follow the exact source map from schema dispatch to task decision and owning-domain callback, preserving instance/task/action correlation and the stored decision authority. Test denial, callback failure and uncertain acknowledgement without directly mutating the approved domain state.\n\n| Repository-relative source / canonical section | Authority |\n| --- | --- |\n| nodics.foundation/modules/nbpm/src/service/workflow/defaultWorkflowService.js | Generic local initializeWorkflows or DefaultModuleService invocation of workflow /item/init. |\n| nodics.process/modules/workflow/src/service/definition/defaultProcessDefinitionLifecycleService.js | Draft validation and immutable definition versions. |\n| nodics.process/modules/workflow/src/service/operation/defaultProcessRuntimeLifecycleService.js | Operational admission, pinned instance versions, tasks, attempts/incidents, retries and detail/audit. |\n| nodics.process/modules/workflow/src/service/operation/defaultProcessActionAdapterRegistryService.js | Explicitly allowed declarative actions; no arbitrary executable graph content. |\n| nodics.process/modules/workflow/src/service/operation/defaultProcessPublicationDecisionCallbackService.js | Bounded authenticated decision delivery to configured domain authority. |\n| nodics.wcms/modules/cms/src/service/publication/defaultCmsPublicationWorkflowService.js | CMS-owned scoped request into Process approval; not nbpm's generic item initialization. |\n| nodics.foundation/modules/nPublish/src/service/defaultPublicationLifecycleService.js | Owner-provider publication lifecycle; Process decisions are not direct content activation. |\n\nUse process.runtime-lifecycle anchors processRuntimeLifecycle-2-definition-lifecycle, -3-starting-an-instance, -4-task-lifecycle, -5-instance-detail-and-audit and -6-scheduled-triggers for the operational contracts. Use process.action-adapters anchors processActionAdapters-1-safe-default, -2-what-is-not-allowed and -5-adapter-operating-contract for adapter rules. These referenced sections retain their Process owner; this article maps them rather than duplicating the engine.\n\n## Workflow model\n\n```mermaid\nflowchart TD\n  Mapping[\"nbpm schema lifecycle mapping\"] --> Dispatch[\"Local workflow initialization or authenticated module dispatch\"]\n  Definition[\"Process draft validation\"] --> Version[\"Immutable published graph version\"]\n  Version --> Instance[\"Process instance pinned to version\"]\n  Instance --> Task[\"Authorized human task\"]\n  Task --> Adapter[\"Allowlisted action / completed decision evidence\"]\n  Adapter --> Domain[\"Domain-owned decision API\"]\n  Instance --> Evidence[\"Process tasks, attempts, incidents and audit\"]\n```\n\nDefaultWorkflowService.publishToWorkflow chooses local initialization when workflow is active; otherwise prepareInvocation uses configured workflowModuleName, targetNodeId when selected, tenant internal authentication and targetAuthority runtimeRole PROCESS. This generic PUT /item/init path is not the CMS approval endpoint. CMS requestApproval independently validates its Staged source role/scope and targets POST /instances/publication-approval with publication reference/revision and idempotent correlation. Do not route human definitions through generic schema mappings or pass CMS content through Process.\n\n## Contract\n\nProcess definitions are validated graphs with node codes/types and transitions. Publishing creates an immutable processDefinitionVersion; instances use a selected published version rather than a mutable draft. Task permissions/actor policy and state changes remain backend-owned. Graph metadata cannot contain JavaScript, filesystem paths, executable URLs, arbitrary handlers or credentials.\n\n```json\n{ \"moduleName\": \"cms\", \"operation\": \"applyPublicationDecision\" }\n```\n\nThis is the actual declarative ACTION reference (node.action), not a complete graph or an executable callback string. When explicitly allowed by effective process.actionAdapters policy, cms.applyPublicationDecision resolves to DefaultProcessPublicationDecisionCallbackService.applyPublicationDecision with requiresCompletedTask:true. The registry obtains the stored completed task decision through completedDecisionExecution before calling it; merely listing a service in configuration or submitting approved:true does not grant approval authority.\n\nThe callback checks publicationCode, boolean decision, configured non-default module/connection target and tenant internal token, then invokes POST /publication/process/decision through DefaultModuleService. It sends publication reference, expected revision, decision/reason and pinned Process instance/definition/version evidence, with idempotencyKey processInstanceCode:publicationCode. The domain owner still validates and applies the decision through its normal publication lifecycle. There is no DefaultCmsPublicationWorkflowCallbackService.afterApprove contract here, no direct CMS record mutation and no human-approval bypass.\n\n## Customization and extension guidance\n\nAdd mappings in nbpm only for generic schema lifecycle integration; add business graphs and permitted adapters with their Process/domain owners. An adapter needs a bounded versioned input/result, trusted tenant/actor checks and owner idempotency, not arbitrary executable content. Keep connection coordinates and internal authentication with DefaultModuleService. Operator/task UI is a projection of owner APIs; a source map does not establish browser availability or a second task/audit registry.\n\n## Implementation handoff\n\nRetain definitionCode/version, instanceCode/node, task/actor decision, action adapter, attempt/incident and business correlation. On action/callback failure, inspect Process instance detail and incident evidence and the domain owner's current revision/outcome before a governed retry. Retries must preserve the original completed-task decision and pinned graph, not accept a new decision from the retry caller. Unknown adapters, missing completed-task evidence, missing target/token or stale domain revision reject; do not write approval fields directly to clear an incident. Compensation is owner-defined, not universal reversal of a completed business effect.\n\n## Evidence checklist\n\nInstance detail returns Process-owned instance, tasks and timeline; action attempts/incidents explain dependency failure separately from a waiting human task. Use the exact canonical sections above for commands and permissions. Keep audit bounded/redacted and retain original attempt identity on uncertain callback outcomes. A successful transport alone does not establish domain acceptance or publication.\n\nQualification should exercise draft validation, immutable-version pinning, unauthorized claim/complete, rejection, unknown adapter, callback failure after possible owner effect, authorized retry and deterministic duplicate handling. Link operator evidence to the actual domain decision result without copying content/secrets into Process history.\n\n## Common mistakes\n\n- Putting business mutations in workflow metadata instead of owner services.\n- Creating transitions without permission checks.\n- Losing callback failure evidence.\n- Allowing production tasks to remain stuck without an operator queue.\n- Bypassing workflow for publishable or audited changes.\n\n## Verification\n\nQualify nbpm local/remote initialization separately from Process human-task and domain publication-approval flows. Verify graph/adapter admission, task actor/revision rules, pinned history, callback target authentication, negative acknowledgements and incident/retry behavior against the owning contracts.\n\nSource-map file paths above are repository-relative. Importing this documentation never installs operational definitions, starts instances, assigns tasks or authorizes business changes.\n",
      "previous": {
        "title": "Contact Submission Operations",
        "route": "/docs/framework/engagement-contact-submission-operations"
      },
      "next": {
        "title": "CronJob Data Authoring",
        "route": "/docs/framework/process-cronjob-data-authoring"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "bpm",
        "owner": "bpm",
        "sourcePath": "data/docs-v001/records/documentation/bpmDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/bpmDocumentationComponentData.js",
        "wordCount": 997,
        "checksum": "aaf0baf687b1c0f6330fe27c43b3dfad0b2deee539cd2ad662505f0baa474ab1"
      },
      "slug": "process-workflow-bpm-source-map",
      "locale": "en",
      "navigationGroup": "Workflow Runtime",
      "navigationGroupCode": "workflow-runtime",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "process.overview",
          "owner": "workflow"
        },
        {
          "documentId": "process.first-workflow",
          "owner": "workflow"
        },
        {
          "documentId": "process.first-human-task",
          "owner": "workflow"
        },
        {
          "documentId": "process.action-adapters",
          "owner": "workflow"
        },
        {
          "documentId": "process.runtime-lifecycle",
          "owner": "workflow"
        }
      ]
    },
    "active": true
  }
};
