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
    "code": "nodicsDocsComponentprocessVisualDesigner",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.visual-designer",
      "title": "Visual Workflow Designer Contract",
      "route": "/docs/framework/process/visual-designer",
      "section": "axis-and-backoffice-operations",
      "sectionTitle": "Axis and BackOffice Operations",
      "group": "axis-and-backoffice-operations",
      "groupTitle": "Axis and BackOffice Operations",
      "parentId": "axis-and-backoffice-operations",
      "hierarchyPath": [
        "Axis and BackOffice Operations",
        "Visual Workflow Designer Contract"
      ],
      "hierarchyDepth": 2,
      "documentType": "contract",
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
      "summary": "Describe the backend-owned graph contract, Axis editor projection, and validation workflow for the visual designer.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "process.first-human-task",
        "process.overview"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "architecture-diagram",
        "troubleshooting-matrix",
        "code-example"
      ],
      "searchKeywords": [
        "axis-and-backoffice-operations",
        "visual-workflow-designer",
        "visual-workflow-designer-contract"
      ],
      "topicKeywords": [
        "Axis and BackOffice Operations",
        "Visual Workflow Designer",
        "Visual Workflow Designer Contract"
      ],
      "headings": [
        {
          "text": "Ownership model",
          "anchor": "processVisualDesigner-1-ownership-model",
          "level": 2
        },
        {
          "text": "MVP graph contract",
          "anchor": "processVisualDesigner-2-mvp-graph-contract",
          "level": 2
        },
        {
          "text": "What the browser may do",
          "anchor": "processVisualDesigner-3-what-the-browser-may-do",
          "level": 2
        },
        {
          "text": "How a beginner should use the first designer",
          "anchor": "processVisualDesigner-4-how-a-beginner-should-use-the-first-designer",
          "level": 2
        },
        {
          "text": "Designer library evolution",
          "anchor": "processVisualDesigner-5-designer-library-evolution",
          "level": 2
        },
        {
          "text": "Designer acceptance",
          "anchor": "processVisualDesigner-6-designer-acceptance",
          "level": 2
        },
        {
          "text": "Continue",
          "anchor": "processVisualDesigner-7-continue",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processVisualDesigner-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processVisualDesigner-9-verification",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "processVisualDesigner-10-customization-and-extension",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "The visual workflow designer lets a business user or developer edit a process graph through Axis. The important contract is that Axis is an editor, not the runtime authority."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Ownership model",
          "anchor": "processVisualDesigner-1-ownership-model"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant User as Business user\n  participant Axis as Axis designer\n  participant API as Process API\n  participant Validator as Graph validator\n  participant Store as Process schemas\n\n  User->>Axis: Move nodes and connect steps\n  Axis->>API: Save draft graph\n  API->>Store: Persist draft definition\n  User->>Axis: Validate\n  Axis->>API: Validate draft\n  API->>Validator: Check graph contract\n  Validator-->>API: valid or diagnostics\n  API-->>Axis: Backend-owned result\n  User->>Axis: Publish\n  Axis->>API: Publish draft\n  API->>Store: Create immutable version"
        },
        {
          "kind": "paragraph",
          "text": "Axis can display nodes, edges, positions, labels, and selection state. The backend validates whether the graph is executable."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "MVP graph contract",
          "anchor": "processVisualDesigner-2-mvp-graph-contract"
        },
        {
          "kind": "paragraph",
          "text": "The first designer contract supports:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "one `START` node;",
            "one or more `TASK` nodes;",
            "one or more `END` nodes;",
            "transitions with stable codes, source, and target;",
            "optional designer metadata for browser positions."
          ]
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"nodes\": [\n    { \"code\": \"start\", \"type\": \"START\", \"name\": \"Start\" },\n    { \"code\": \"businessReview\", \"type\": \"TASK\", \"name\": \"Business review\" },\n    { \"code\": \"end\", \"type\": \"END\", \"name\": \"End\" }\n  ],\n  \"transitions\": [\n    { \"code\": \"start_to_review\", \"source\": \"start\", \"target\": \"businessReview\" },\n    { \"code\": \"review_to_end\", \"source\": \"businessReview\", \"target\": \"end\" }\n  ]\n}"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What the browser may do",
          "anchor": "processVisualDesigner-3-what-the-browser-may-do"
        },
        {
          "kind": "paragraph",
          "text": "Axis may:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "render a node palette;",
            "show a canvas preview;",
            "let the user select nodes;",
            "collect labels and basic properties;",
            "send draft graph data to Process APIs;",
            "show backend validation diagnostics."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Axis must not:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "execute process logic;",
            "calculate runtime state;",
            "bypass backend validation;",
            "store workflow definitions in browser storage as authority;",
            "create a parallel workflow registry."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "How a beginner should use the first designer",
          "anchor": "processVisualDesigner-4-how-a-beginner-should-use-the-first-designer"
        },
        {
          "kind": "paragraph",
          "text": "The first designer is intentionally simple. It is not trying to be a complex diagramming tool on day one. It gives a business user a safe way to understand the shape of a workflow and gives a developer a safe way to prove the backend graph contract."
        },
        {
          "kind": "paragraph",
          "text": "Start with this flow:"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Start[\"START: request received\"] --> Review[\"TASK: business review\"]\n  Review --> End[\"END: approved or recorded\"]"
        },
        {
          "kind": "paragraph",
          "text": "Then ask these business questions before adding more nodes:"
        },
        {
          "kind": "table",
          "headers": [
            "Question",
            "Why it matters",
            "Where the answer belongs"
          ],
          "rows": [
            [
              "Who starts this process?",
              "Prevents hidden automation and duplicate cases.",
              "Process trigger metadata or domain API call."
            ],
            [
              "Who owns the human task?",
              "Makes the work queue visible.",
              "Process task assignment policy."
            ],
            [
              "What happens if the task is delayed?",
              "Defines SLA and escalation.",
              "Process policy, timer, or Cron relationship."
            ],
            [
              "What business object is affected?",
              "Lets users connect workflow to real work.",
              "Process instance context and domain module reference."
            ],
            [
              "What evidence is required?",
              "Supports audit and compliance.",
              "Process audit event and domain audit."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "If a user cannot answer these questions, the flow is not ready for publication even if the graph is technically valid."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Designer library evolution",
          "anchor": "processVisualDesigner-5-designer-library-evolution"
        },
        {
          "kind": "paragraph",
          "text": "The first implementation uses a Nodics-native card/canvas projection because it keeps the contract easy to test. The evolution path is:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "keep the backend graph contract stable;",
            "keep Axis as the renderer/editor only;",
            "add drag/drop layout metadata after the save/validate/publish flow is stable;",
            "evaluate React Flow / xyflow as the first richer canvas implementation;",
            "add BPMN import/export only as an interoperability adapter when a customer needs it."
          ]
        },
        {
          "kind": "paragraph",
          "text": "This sequence prevents a drawing library from becoming the workflow authority. The designer may become more attractive and interactive, but the validation, versioning, permissions, runtime execution, and audit evidence must remain in `nodics.process`."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Designer acceptance",
          "anchor": "processVisualDesigner-6-designer-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "The designer foundation is healthy when:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "A user can see START, TASK, and END nodes.",
            "A user can inspect selected node details.",
            "Saving calls the Process draft API.",
            "Validation calls the Process graph validator.",
            "Publishing remains a separate backend-owned action.",
            "The same graph can be verified through API tests and fresh acceptance.",
            "Axis refresh is not required after create, save, validate, publish, trigger, task, or Cron handoff operations.",
            "A business user can explain the workflow outcome from the page without reading raw JSON.",
            "A developer can reproduce the same graph through the Process API.",
            "An operator can trace a started instance from trigger/job evidence through Process audit events."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue",
          "anchor": "processVisualDesigner-7-continue"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Developer Customization Guide](/docs/framework/process/developer-customization)",
            "[Runtime Instance and Task Lifecycle](/docs/framework/process/runtime-lifecycle)"
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processVisualDesigner-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Persisting the browser graph directly or treating visual placement as executable authority.",
            "Allowing unsupported nodes, arbitrary code, unregistered actions, or invalid transitions to bypass backend validation."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processVisualDesigner-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Create valid and invalid graphs in the designer, confirm backend validation messages, publish only a valid definition, reload it without semantic loss, and prove keyboard, permission, and recovery behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "processVisualDesigner-10-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Projects may customize the visual designer by adding backend-registered node types, action adapters, validation messages, templates, or read-only dashboard metadata. The extension must preserve the rule that Process owns executable workflow semantics. Axis can render richer handles, labels, grouping, and status panels, but saved behavior still passes through backend graph validation, permission checks, publication state, and audit evidence."
        }
      ],
      "searchText": "Visual Workflow Designer Contract Describe the backend-owned graph contract, Axis editor projection, and validation workflow for the visual designer. # Visual Workflow Designer Contract\n\nThe visual workflow designer lets a business user or developer edit a process graph through Axis. The important contract is that Axis is an editor, not the runtime authority.\n\n## Ownership model\n\n```mermaid\nsequenceDiagram\n  participant User as Business user\n  participant Axis as Axis designer\n  participant API as Process API\n  participant Validator as Graph validator\n  participant Store as Process schemas\n\n  User->>Axis: Move nodes and connect steps\n  Axis->>API: Save draft graph\n  API->>Store: Persist draft definition\n  User->>Axis: Validate\n  Axis->>API: Validate draft\n  API->>Validator: Check graph contract\n  Validator-->>API: valid or diagnostics\n  API-->>Axis: Backend-owned result\n  User->>Axis: Publish\n  Axis->>API: Publish draft\n  API->>Store: Create immutable version\n```\n\nAxis can display nodes, edges, positions, labels, and selection state. The backend validates whether the graph is executable.\n\n## MVP graph contract\n\nThe first designer contract supports:\n\n- one `START` node;\n- one or more `TASK` nodes;\n- one or more `END` nodes;\n- transitions with stable codes, source, and target;\n- optional designer metadata for browser positions.\n\n```json\n{\n  \"nodes\": [\n    { \"code\": \"start\", \"type\": \"START\", \"name\": \"Start\" },\n    { \"code\": \"businessReview\", \"type\": \"TASK\", \"name\": \"Business review\" },\n    { \"code\": \"end\", \"type\": \"END\", \"name\": \"End\" }\n  ],\n  \"transitions\": [\n    { \"code\": \"start_to_review\", \"source\": \"start\", \"target\": \"businessReview\" },\n    { \"code\": \"review_to_end\", \"source\": \"businessReview\", \"target\": \"end\" }\n  ]\n}\n```\n\n## What the browser may do\n\nAxis may:\n\n- render a node palette;\n- show a canvas preview;\n- let the user select nodes;\n- collect labels and basic properties;\n- send draft graph data to Process APIs;\n- show backend validation diagnostics.\n\nAxis must not:\n\n- execute process logic;\n- calculate runtime state;\n- bypass backend validation;\n- store workflow definitions in browser storage as authority;\n- create a parallel workflow registry.\n\n## How a beginner should use the first designer\n\nThe first designer is intentionally simple. It is not trying to be a complex diagramming tool on day one. It gives a business user a safe way to understand the shape of a workflow and gives a developer a safe way to prove the backend graph contract.\n\nStart with this flow:\n\n```mermaid\nflowchart LR\n  Start[\"START: request received\"] --> Review[\"TASK: business review\"]\n  Review --> End[\"END: approved or recorded\"]\n```\n\nThen ask these business questions before adding more nodes:\n\n| Question | Why it matters | Where the answer belongs |\n| --- | --- | --- |\n| Who starts this process? | Prevents hidden automation and duplicate cases. | Process trigger metadata or domain API call. |\n| Who owns the human task? | Makes the work queue visible. | Process task assignment policy. |\n| What happens if the task is delayed? | Defines SLA and escalation. | Process policy, timer, or Cron relationship. |\n| What business object is affected? | Lets users connect workflow to real work. | Process instance context and domain module reference. |\n| What evidence is required? | Supports audit and compliance. | Process audit event and domain audit. |\n\nIf a user cannot answer these questions, the flow is not ready for publication even if the graph is technically valid.\n\n## Designer library evolution\n\nThe first implementation uses a Nodics-native card/canvas projection because it keeps the contract easy to test. The evolution path is:\n\n1. keep the backend graph contract stable;\n2. keep Axis as the renderer/editor only;\n3. add drag/drop layout metadata after the save/validate/publish flow is stable;\n4. evaluate React Flow / xyflow as the first richer canvas implementation;\n5. add BPMN import/export only as an interoperability adapter when a customer needs it.\n\nThis sequence prevents a drawing library from becoming the workflow authority. The designer may become more attractive and interactive, but the validation, versioning, permissions, runtime execution, and audit evidence must remain in `nodics.process`.\n\n## Designer acceptance\n\nThe designer foundation is healthy when:\n\n1. A user can see START, TASK, and END nodes.\n2. A user can inspect selected node details.\n3. Saving calls the Process draft API.\n4. Validation calls the Process graph validator.\n5. Publishing remains a separate backend-owned action.\n6. The same graph can be verified through API tests and fresh acceptance.\n7. Axis refresh is not required after create, save, validate, publish, trigger, task, or Cron handoff operations.\n8. A business user can explain the workflow outcome from the page without reading raw JSON.\n9. A developer can reproduce the same graph through the Process API.\n10. An operator can trace a started instance from trigger/job evidence through Process audit events.\n\n## Continue\n\n- [Developer Customization Guide](/docs/framework/process/developer-customization)\n- [Runtime Instance and Task Lifecycle](/docs/framework/process/runtime-lifecycle)\n\n## Common mistakes\n\n- Persisting the browser graph directly or treating visual placement as executable authority.\n- Allowing unsupported nodes, arbitrary code, unregistered actions, or invalid transitions to bypass backend validation.\n\n## Verification\n\nCreate valid and invalid graphs in the designer, confirm backend validation messages, publish only a valid definition, reload it without semantic loss, and prove keyboard, permission, and recovery behavior.\n\n## Customization and extension\n\nProjects may customize the visual designer by adding backend-registered node types, action adapters, validation messages, templates, or read-only dashboard metadata. The extension must preserve the rule that Process owns executable workflow semantics. Axis can render richer handles, labels, grouping, and status panels, but saved behavior still passes through backend graph validation, permission checks, publication state, and audit evidence.\n",
      "previous": {
        "title": "Application Builder and Workspace Generation",
        "route": "/docs/framework/builder-workspace-generation"
      },
      "next": {
        "title": "Business Customization in Axis",
        "route": "/docs/framework/axis-business-customization"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 823,
        "checksum": "938eb190f1df00a58651829ef5892f1e8ab6167176285eab1ab5501420155730"
      },
      "slug": "visual-designer",
      "locale": "en",
      "navigationGroup": "Visual Workflow Designer",
      "navigationGroupCode": "visual-workflow-designer",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "process.first-human-task",
          "owner": "workflow"
        },
        {
          "documentId": "process.overview",
          "owner": "workflow"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentprocessDeveloperCustomization",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.developer-customization",
      "title": "Developer Customization Guide",
      "route": "/docs/framework/process/developer-customization",
      "section": "developer-extension-and-project-customization",
      "sectionTitle": "Developer Extension and Project Customization",
      "group": "developer-extension-and-project-customization",
      "groupTitle": "Developer Extension and Project Customization",
      "parentId": "developer-extension-and-project-customization",
      "hierarchyPath": [
        "Developer Extension and Project Customization",
        "Developer Customization Guide"
      ],
      "hierarchyDepth": 2,
      "documentType": "customization",
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
      "summary": "Show where developers extend Process behavior, where domain actions belong, and how customer modules customize safely.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "process.custom-project-extension",
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
        "lifecycle-state-diagram",
        "comparison-table",
        "code-example"
      ],
      "searchKeywords": [
        "developer-extension-and-project-customization",
        "process-customization",
        "developer-customization-guide"
      ],
      "topicKeywords": [
        "Developer Extension and Project Customization",
        "Process Customization",
        "Developer Customization Guide"
      ],
      "headings": [
        {
          "text": "Where code belongs",
          "anchor": "processDeveloperCustomization-1-where-code-belongs",
          "level": 2
        },
        {
          "text": "Customization-first approach",
          "anchor": "processDeveloperCustomization-2-customization-first-approach",
          "level": 2
        },
        {
          "text": "Domain action boundary",
          "anchor": "processDeveloperCustomization-3-domain-action-boundary",
          "level": 2
        },
        {
          "text": "API extension rule",
          "anchor": "processDeveloperCustomization-4-api-extension-rule",
          "level": 2
        },
        {
          "text": "Generated artifacts",
          "anchor": "processDeveloperCustomization-5-generated-artifacts",
          "level": 2
        },
        {
          "text": "Developer acceptance checklist",
          "anchor": "processDeveloperCustomization-6-developer-acceptance-checklist",
          "level": 2
        },
        {
          "text": "Continue",
          "anchor": "processDeveloperCustomization-7-continue",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processDeveloperCustomization-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processDeveloperCustomization-9-verification",
          "level": 2
        },
        {
          "text": "Business context",
          "anchor": "processDeveloperCustomization-10-business-context",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This guide explains where developers should extend Process behavior. The most important rule is simple: Process owns orchestration state, but domain modules own business action behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Where code belongs",
          "anchor": "processDeveloperCustomization-1-where-code-belongs"
        },
        {
          "kind": "table",
          "headers": [
            "Need",
            "Owning place"
          ],
          "rows": [
            [
              "Process schemas and status definitions",
              "`nodics.process/modules/workflow`"
            ],
            [
              "Runtime lifecycle, validation, assignment, audit",
              "`nodics.process/modules/workflow`"
            ],
            [
              "HTTP routes, controllers, facades",
              "`nodics.process/modules/workflow`"
            ],
            [
              "Cron job definitions and scheduler execution",
              "`nodics.process/modules/cronjob`"
            ],
            [
              "Order, commerce, content, profile, media side effects",
              "Owning domain module"
            ],
            [
              "Customer-specific policy override",
              "Customer module loaded after framework module"
            ],
            [
              "Browser rendering and editor interactions",
              "`nodics.axis`"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Do not put runtime source directly under `nodics.process/src`. The module group root is for composition, contracts, package metadata, documentation, and shared defaults."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization-first approach",
          "anchor": "processDeveloperCustomization-2-customization-first-approach"
        },
        {
          "kind": "paragraph",
          "text": "Before writing new code, ask:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Can this be changed by a property?",
            "Can this be changed by a provider?",
            "Can this be changed by an interceptor or pipeline?",
            "Can a customer module override only one service method?",
            "Is a new framework feature actually needed?"
          ]
        },
        {
          "kind": "paragraph",
          "text": "Example: a customer wants task assignment to go to a site-specific queue."
        },
        {
          "kind": "paragraph",
          "text": "Do not edit the standard Process task lifecycle directly. Instead, create a customer module that overrides assignment policy and loads after Process."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "/*\n    Customer Project - Process Customization\n */\n\n'use strict';\n\n/**\n * @module customer.process/src/service/defaultCustomerTaskAssignmentService\n * @description Resolves task assignee from enterprise, site, and process category.\n * @override Loaded after nodics.process to customize assignment without forking framework source.\n */\nmodule.exports = {\n    resolveAssignee: function (request, taskModel) {\n        const site = request.runtimeOperation && request.runtimeOperation.site;\n        if (site === 'uae-store') return 'uaeOperationsQueue';\n        return taskModel.assignee || 'defaultProcessQueue';\n    }\n};"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Domain action boundary",
          "anchor": "processDeveloperCustomization-3-domain-action-boundary"
        },
        {
          "kind": "paragraph",
          "text": "Process can decide that an ACTION node should be executed. It must not directly own a commerce refund, media upload, content publication, logistics shipment, or telco provisioning command."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Process[\"Process engine\"] --> Contract[\"Domain action contract\"]\n  Contract --> Commerce[\"Commerce module\"]\n  Contract --> Media[\"Media module\"]\n  Contract --> Wcms[\"WCMS module\"]\n  Contract --> Profile[\"Profile module\"]"
        },
        {
          "kind": "paragraph",
          "text": "The Process engine should store orchestration evidence. The domain module should validate permissions, data, side effects, rollback, and audit for its own action."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "API extension rule",
          "anchor": "processDeveloperCustomization-4-api-extension-rule"
        },
        {
          "kind": "paragraph",
          "text": "Add a Process API only when:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "the behavior is process-owned;",
            "route permission is added to the identity catalog;",
            "status codes live in `statusDefinitions.js`;",
            "controller/facade/service layers remain separated;",
            "tests cover positive, negative, boundary, and permission behavior."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Generated artifacts",
          "anchor": "processDeveloperCustomization-5-generated-artifacts"
        },
        {
          "kind": "paragraph",
          "text": "Generated service/facade files are loader-visible runtime artifacts. If the generator is available for the affected schema, regenerate from schema source. If a generated-style file must be repaired manually during migration, mirror the nearest generated artifact exactly and add tests that prove the runtime service is available."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer acceptance checklist",
          "anchor": "processDeveloperCustomization-6-developer-acceptance-checklist"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Source is in the nearest owning module.",
            "No customer-specific rule is hardcoded in standard Process.",
            "Axis is not storing workflow truth.",
            "New permissions exist in the identity catalog.",
            "Status/error codes live in status definitions.",
            "Fresh bootstrap and live smoke prove the change."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue",
          "anchor": "processDeveloperCustomization-7-continue"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Visual Workflow Designer Contract](/docs/framework/process/visual-designer)",
            "[DevOps and Runtime Topology](/docs/framework/process/devops-topology)"
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processDeveloperCustomization-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Editing generated data or framework defaults instead of the owning source or project overlay.",
            "Putting domain actions, credentials, executable expressions, or authorization decisions in workflow metadata."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processDeveloperCustomization-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run syntax, graph, lifecycle, permission, retry, compensation, and fresh-bootstrap tests. Confirm the same definition behaves safely with the default implementation and an approved customer customization. A beginner should start with the smallest configuration or module overlay before replacing a service."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "processDeveloperCustomization-10-business-context"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is upgrade-safe change. Customers need project-specific behavior without forking framework modules or losing supportability. The customization path lets business teams ask for tenant policies, approvals, actions, dashboards, and exception handling while developers keep source ownership, permissions, rollback, and verification evidence in the correct module."
        }
      ],
      "searchText": "Developer Customization Guide Show where developers extend Process behavior, where domain actions belong, and how customer modules customize safely. # Developer Customization Guide\n\nThis guide explains where developers should extend Process behavior. The most important rule is simple: Process owns orchestration state, but domain modules own business action behavior.\n\n## Where code belongs\n\n| Need | Owning place |\n| --- | --- |\n| Process schemas and status definitions | `nodics.process/modules/workflow` |\n| Runtime lifecycle, validation, assignment, audit | `nodics.process/modules/workflow` |\n| HTTP routes, controllers, facades | `nodics.process/modules/workflow` |\n| Cron job definitions and scheduler execution | `nodics.process/modules/cronjob` |\n| Order, commerce, content, profile, media side effects | Owning domain module |\n| Customer-specific policy override | Customer module loaded after framework module |\n| Browser rendering and editor interactions | `nodics.axis` |\n\nDo not put runtime source directly under `nodics.process/src`. The module group root is for composition, contracts, package metadata, documentation, and shared defaults.\n\n## Customization-first approach\n\nBefore writing new code, ask:\n\n1. Can this be changed by a property?\n2. Can this be changed by a provider?\n3. Can this be changed by an interceptor or pipeline?\n4. Can a customer module override only one service method?\n5. Is a new framework feature actually needed?\n\nExample: a customer wants task assignment to go to a site-specific queue.\n\nDo not edit the standard Process task lifecycle directly. Instead, create a customer module that overrides assignment policy and loads after Process.\n\n```js\n/*\n    Customer Project - Process Customization\n */\n\n'use strict';\n\n/**\n * @module customer.process/src/service/defaultCustomerTaskAssignmentService\n * @description Resolves task assignee from enterprise, site, and process category.\n * @override Loaded after nodics.process to customize assignment without forking framework source.\n */\nmodule.exports = {\n    resolveAssignee: function (request, taskModel) {\n        const site = request.runtimeOperation && request.runtimeOperation.site;\n        if (site === 'uae-store') return 'uaeOperationsQueue';\n        return taskModel.assignee || 'defaultProcessQueue';\n    }\n};\n```\n\n## Domain action boundary\n\nProcess can decide that an ACTION node should be executed. It must not directly own a commerce refund, media upload, content publication, logistics shipment, or telco provisioning command.\n\n```mermaid\nflowchart LR\n  Process[\"Process engine\"] --> Contract[\"Domain action contract\"]\n  Contract --> Commerce[\"Commerce module\"]\n  Contract --> Media[\"Media module\"]\n  Contract --> Wcms[\"WCMS module\"]\n  Contract --> Profile[\"Profile module\"]\n```\n\nThe Process engine should store orchestration evidence. The domain module should validate permissions, data, side effects, rollback, and audit for its own action.\n\n## API extension rule\n\nAdd a Process API only when:\n\n- the behavior is process-owned;\n- route permission is added to the identity catalog;\n- status codes live in `statusDefinitions.js`;\n- controller/facade/service layers remain separated;\n- tests cover positive, negative, boundary, and permission behavior.\n\n## Generated artifacts\n\nGenerated service/facade files are loader-visible runtime artifacts. If the generator is available for the affected schema, regenerate from schema source. If a generated-style file must be repaired manually during migration, mirror the nearest generated artifact exactly and add tests that prove the runtime service is available.\n\n## Developer acceptance checklist\n\n- Source is in the nearest owning module.\n- No customer-specific rule is hardcoded in standard Process.\n- Axis is not storing workflow truth.\n- New permissions exist in the identity catalog.\n- Status/error codes live in status definitions.\n- Fresh bootstrap and live smoke prove the change.\n\n## Continue\n\n- [Visual Workflow Designer Contract](/docs/framework/process/visual-designer)\n- [DevOps and Runtime Topology](/docs/framework/process/devops-topology)\n\n## Common mistakes\n\n- Editing generated data or framework defaults instead of the owning source or project overlay.\n- Putting domain actions, credentials, executable expressions, or authorization decisions in workflow metadata.\n\n## Verification\n\nRun syntax, graph, lifecycle, permission, retry, compensation, and fresh-bootstrap tests. Confirm the same definition behaves safely with the default implementation and an approved customer customization. A beginner should start with the smallest configuration or module overlay before replacing a service.\n\n## Business context\n\nThe business problem is upgrade-safe change. Customers need project-specific behavior without forking framework modules or losing supportability. The customization path lets business teams ask for tenant policies, approvals, actions, dashboards, and exception handling while developers keep source ownership, permissions, rollback, and verification evidence in the correct module.\n",
      "previous": {
        "title": "Axis Content Customization",
        "route": "/docs/framework/framework-axis-content-customization"
      },
      "next": {
        "title": "Custom Project Extension Guide",
        "route": "/docs/framework/process/custom-project-extension"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 600,
        "checksum": "6a4074265ceec5135233119743b3656f4ed9360d84e40d39ee90b6cc57d6673f"
      },
      "slug": "developer-customization",
      "locale": "en",
      "navigationGroup": "Process Customization",
      "navigationGroupCode": "process-customization",
      "navigationGroupOrder": 20,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "process.custom-project-extension",
          "owner": "workflow"
        },
        {
          "documentId": "process.action-adapters",
          "owner": "workflow"
        }
      ]
    },
    "active": true
  },
  "record2": {
    "code": "nodicsDocsComponentprocessCustomProjectExtension",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.custom-project-extension",
      "title": "Custom Project Extension Guide",
      "route": "/docs/framework/process/custom-project-extension",
      "section": "developer-extension-and-project-customization",
      "sectionTitle": "Developer Extension and Project Customization",
      "group": "developer-extension-and-project-customization",
      "groupTitle": "Developer Extension and Project Customization",
      "parentId": "developer-extension-and-project-customization",
      "hierarchyPath": [
        "Developer Extension and Project Customization",
        "Custom Project Extension Guide"
      ],
      "hierarchyDepth": 2,
      "documentType": "customization",
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
      "summary": "Explain how customer overlays customize Process behavior while preserving functional module identity and backend governance.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "framework.customization-guide",
        "process.developer-customization"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "lifecycle-state-diagram",
        "comparison-table"
      ],
      "searchKeywords": [
        "developer-extension-and-project-customization",
        "customer-project-extensions",
        "custom-project-extension-guide"
      ],
      "topicKeywords": [
        "Developer Extension and Project Customization",
        "Customer Project Extensions",
        "Custom Project Extension Guide"
      ],
      "headings": [
        {
          "text": "Example topology",
          "anchor": "processCustomProjectExtension-1-example-topology",
          "level": 2
        },
        {
          "text": "What belongs in a customer extension",
          "anchor": "processCustomProjectExtension-2-what-belongs-in-a-customer-extension",
          "level": 2
        },
        {
          "text": "What should not be customized casually",
          "anchor": "processCustomProjectExtension-3-what-should-not-be-customized-casually",
          "level": 2
        },
        {
          "text": "Documentation ownership",
          "anchor": "processCustomProjectExtension-4-documentation-ownership",
          "level": 2
        },
        {
          "text": "Extension decision and lifecycle",
          "anchor": "processCustomProjectExtension-5-extension-decision-and-lifecycle",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processCustomProjectExtension-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processCustomProjectExtension-7-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Customer projects may customize Process behavior without renaming the functional module. A customer module can extend or override standard behavior, but Axis and BackOffice should still show the capability as Process."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Example topology",
          "anchor": "processCustomProjectExtension-1-example-topology"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Server[\"customer processServer\"] --> CustomerProcess[\"customer.process overlay\"]\n  CustomerProcess --> NodicsProcess[\"nodics.process\"]\n  NodicsProcess --> NodicsFoundation[\"nodics.foundation\"]\n  NodicsProcess --> NodicsCronJob[\"cronjob included in shared runtime\"]"
        },
        {
          "kind": "paragraph",
          "text": "The server can include workflow and cronjob together for operational simplicity, while ownership remains clear."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What belongs in a customer extension",
          "anchor": "processCustomProjectExtension-2-what-belongs-in-a-customer-extension"
        },
        {
          "kind": "unordered-list",
          "items": [
            "custom task assignment rules;",
            "domain-specific action adapters;",
            "additional graph validation policies;",
            "extra audit metadata with safe redaction;",
            "environment-specific timer/SLA rules;",
            "customer documentation and sample workflows."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What should not be customized casually",
          "anchor": "processCustomProjectExtension-3-what-should-not-be-customized-casually"
        },
        {
          "kind": "unordered-list",
          "items": [
            "published version immutability;",
            "permission checks;",
            "audit event creation;",
            "backend graph validation;",
            "module identity exposed to Axis."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Changing those weakens trust in the automation platform."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation ownership",
          "anchor": "processCustomProjectExtension-4-documentation-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Framework Process docs belong in nodics.process. Customer process docs belong in the customer project module or project documentation pack. Axis only renders imported content; it should not own backend documentation data."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Extension decision and lifecycle",
          "anchor": "processCustomProjectExtension-5-extension-decision-and-lifecycle"
        },
        {
          "kind": "table",
          "headers": [
            "Need",
            "Correct extension point",
            "Authority that remains unchanged"
          ],
          "rows": [
            [
              "Change a runtime property",
              "Customer environment or server configuration",
              "Process configuration contract"
            ],
            [
              "Implement a business action",
              "Owning customer or domain module adapter",
              "Domain validation and side effects"
            ],
            [
              "Add an API projection",
              "Customer API module using Process services",
              "Process lifecycle and persistence"
            ],
            [
              "Change visual presentation",
              "Axis component or renderer customization",
              "Backend Process graph and permissions"
            ],
            [
              "Add scheduled execution",
              "Cron-owned job calling an active Process trigger",
              "Process trigger and Cron schedule ownership"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Start with the smallest reversible customization. A beginner developer should first prove that a property or registered adapter is insufficient before overriding a service. A service override must preserve method contracts, status definitions, tenant isolation, authorization, idempotency, audit behavior, and error semantics. If the customer implementation changes those capabilities, it is no longer a safe overlay and needs an explicit contract change in the owning framework module."
        },
        {
          "kind": "paragraph",
          "text": "The runtime graph must show the customer module loading after the standard Process modules. Availability through a package dependency is not enough; the module and server `extends` relationships determine functional composition and service precedence. Test both the default framework path and the customized path so later framework releases cannot silently break only one of them."
        },
        {
          "kind": "paragraph",
          "text": "Operational ownership must also be explicit. The customer team owns its adapter dependencies, secrets, deployment configuration, alerts, runbooks, and rollback. Process continues to own definition and instance state, task lifecycle, incidents, retries, and audit. Axis continues to render authorized contracts and must not become a fallback persistence layer when the customized backend is unavailable."
        },
        {
          "kind": "paragraph",
          "text": "A production-ready extension includes a failure scenario and recovery proof. Stop the external dependency, confirm bounded retry and incident creation, restore it, perform the authorized recovery action, and verify the same process continues without duplicate domain side effects. Repeat after a runtime restart and after a framework upgrade candidate."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processCustomProjectExtension-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Forking framework Process services when a customer module overlay is sufficient.",
            "Renaming the standard functional module or moving backend authority into Axis."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processCustomProjectExtension-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run framework and customer-project contract tests, prepare the effective runtime graph, and prove the extension works after a fresh database bootstrap without modifying framework-owned behavior. A beginner developer, business reviewer, and production operator should each be able to identify the owner and supported extension point."
        }
      ],
      "searchText": "Custom Project Extension Guide Explain how customer overlays customize Process behavior while preserving functional module identity and backend governance. # Custom Project Extension Guide\n\nCustomer projects may customize Process behavior without renaming the functional module. A customer module can extend or override standard behavior, but Axis and BackOffice should still show the capability as Process.\n\n## Example topology\n\n```mermaid\nflowchart TD\n  Server[\"customer processServer\"] --> CustomerProcess[\"customer.process overlay\"]\n  CustomerProcess --> NodicsProcess[\"nodics.process\"]\n  NodicsProcess --> NodicsFoundation[\"nodics.foundation\"]\n  NodicsProcess --> NodicsCronJob[\"cronjob included in shared runtime\"]\n```\n\nThe server can include workflow and cronjob together for operational simplicity, while ownership remains clear.\n\n## What belongs in a customer extension\n\n- custom task assignment rules;\n- domain-specific action adapters;\n- additional graph validation policies;\n- extra audit metadata with safe redaction;\n- environment-specific timer/SLA rules;\n- customer documentation and sample workflows.\n\n## What should not be customized casually\n\n- published version immutability;\n- permission checks;\n- audit event creation;\n- backend graph validation;\n- module identity exposed to Axis.\n\nChanging those weakens trust in the automation platform.\n\n## Documentation ownership\n\nFramework Process docs belong in nodics.process. Customer process docs belong in the customer project module or project documentation pack. Axis only renders imported content; it should not own backend documentation data.\n\n## Extension decision and lifecycle\n\n| Need | Correct extension point | Authority that remains unchanged |\n| --- | --- | --- |\n| Change a runtime property | Customer environment or server configuration | Process configuration contract |\n| Implement a business action | Owning customer or domain module adapter | Domain validation and side effects |\n| Add an API projection | Customer API module using Process services | Process lifecycle and persistence |\n| Change visual presentation | Axis component or renderer customization | Backend Process graph and permissions |\n| Add scheduled execution | Cron-owned job calling an active Process trigger | Process trigger and Cron schedule ownership |\n\nStart with the smallest reversible customization. A beginner developer should first prove that a property or registered adapter is insufficient before overriding a service. A service override must preserve method contracts, status definitions, tenant isolation, authorization, idempotency, audit behavior, and error semantics. If the customer implementation changes those capabilities, it is no longer a safe overlay and needs an explicit contract change in the owning framework module.\n\nThe runtime graph must show the customer module loading after the standard Process modules. Availability through a package dependency is not enough; the module and server `extends` relationships determine functional composition and service precedence. Test both the default framework path and the customized path so later framework releases cannot silently break only one of them.\n\nOperational ownership must also be explicit. The customer team owns its adapter dependencies, secrets, deployment configuration, alerts, runbooks, and rollback. Process continues to own definition and instance state, task lifecycle, incidents, retries, and audit. Axis continues to render authorized contracts and must not become a fallback persistence layer when the customized backend is unavailable.\n\nA production-ready extension includes a failure scenario and recovery proof. Stop the external dependency, confirm bounded retry and incident creation, restore it, perform the authorized recovery action, and verify the same process continues without duplicate domain side effects. Repeat after a runtime restart and after a framework upgrade candidate.\n\n## Common mistakes\n\n- Forking framework Process services when a customer module overlay is sufficient.\n- Renaming the standard functional module or moving backend authority into Axis.\n\n## Verification\n\nRun framework and customer-project contract tests, prepare the effective runtime graph, and prove the extension works after a fresh database bootstrap without modifying framework-owned behavior. A beginner developer, business reviewer, and production operator should each be able to identify the owner and supported extension point.\n",
      "previous": {
        "title": "Developer Customization Guide",
        "route": "/docs/framework/process/developer-customization"
      },
      "next": {
        "title": "Base Commerce foundations",
        "route": "/docs/framework/commerce-base-foundations"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 546,
        "checksum": "8afc7a043f7ca19909220ac409e8dd7d4f4827b7cecee7371dccaf9eefb8fa99"
      },
      "slug": "custom-project-extension",
      "locale": "en",
      "navigationGroup": "Customer Project Extensions",
      "navigationGroupCode": "customer-project-extensions",
      "navigationGroupOrder": 30,
      "navigationOrder": 30,
      "references": [
        {
          "documentId": "framework.customization-guide",
          "owner": "nodics.docs"
        },
        {
          "documentId": "process.developer-customization",
          "owner": "workflow"
        }
      ]
    },
    "active": true
  },
  "record3": {
    "code": "nodicsDocsComponentprocessOverview",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.overview",
      "title": "Business Process and Automation Overview",
      "route": "/docs/framework/process",
      "section": "process-and-workflow-automation",
      "sectionTitle": "Process and Workflow Automation",
      "group": "process-and-workflow-automation",
      "groupTitle": "Process and Workflow Automation",
      "parentId": "process-and-workflow-automation",
      "hierarchyPath": [
        "Process and Workflow Automation",
        "Business Process and Automation Overview"
      ],
      "hierarchyDepth": 2,
      "documentType": "overview",
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
      "summary": "Understand why nodics.process exists, how it helps business users, developers, and operators, and where it fits with Core, Cron, Platform, Axis, and customer modules.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "process.first-workflow",
        "process.runtime-lifecycle",
        "process.workflow-orchestration-patterns",
        "cron.operations"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "lifecycle-state-diagram",
        "table",
        "code-example"
      ],
      "searchKeywords": [
        "process-and-workflow-automation",
        "process-overview",
        "business-process-and-automation-overview"
      ],
      "topicKeywords": [
        "Process and Workflow Automation",
        "Process Overview",
        "Business Process and Automation Overview"
      ],
      "headings": [
        {
          "text": "Beginner mental model",
          "anchor": "processOverview-1-beginner-mental-model",
          "level": 2
        },
        {
          "text": "Where Process fits in Nodics",
          "anchor": "processOverview-2-where-process-fits-in-nodics",
          "level": 2
        },
        {
          "text": "Business value",
          "anchor": "processOverview-3-business-value",
          "level": 2
        },
        {
          "text": "Relationship with Cron",
          "anchor": "processOverview-4-relationship-with-cron",
          "level": 2
        },
        {
          "text": "Relationship with domain modules",
          "anchor": "processOverview-5-relationship-with-domain-modules",
          "level": 2
        },
        {
          "text": "What exists in the current MVP",
          "anchor": "processOverview-6-what-exists-in-the-current-mvp",
          "level": 2
        },
        {
          "text": "Extension direction",
          "anchor": "processOverview-7-extension-direction",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processOverview-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processOverview-9-verification",
          "level": 2
        },
        {
          "text": "Commerce And Content Workflow Coverage",
          "anchor": "processOverview-10-commerce-and-content-workflow-coverage",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "`nodics.process` is the standard Nodics functional module group for business processes, workflows, task orchestration, runtime instances, audit evidence, and automation design. It exists because most enterprise applications do not run as one simple button click. A content approval, onboarding request, order exception, document review, refund approval, or partner activation often needs multiple steps, people, systems, deadlines, decisions, retries, and audit records."
        },
        {
          "kind": "paragraph",
          "text": "For a business user, Process answers: \"What work is moving, who needs to act, what is delayed, and what evidence do we have?\" For a developer, Process answers: \"How do I model orchestration without hardcoding the flow into one domain service?\" For an operator, Process answers: \"Which instances are running, which tasks are stuck, which triggers are related to schedules, and what happened when something failed?\""
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Beginner mental model",
          "anchor": "processOverview-1-beginner-mental-model"
        },
        {
          "kind": "paragraph",
          "text": "Imagine a simple content approval:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "A page is submitted.",
            "A reviewer checks it.",
            "The reviewer approves or rejects it.",
            "The system records who acted and when.",
            "The page can continue to publication or return for changes."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Without a process engine, each application might write that flow in its own service. That makes every flow difficult to inspect, customize, test, and operate. `nodics.process` gives Nodics one governed place to model the flow, publish versions, start runtime instances, create human tasks, and record audit events."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Business[\"Business user\"] --> Axis[\"Axis process console\"]\n  Axis --> ProcessApi[\"nodics.process APIs\"]\n  ProcessApi --> Definition[\"Draft definition\"]\n  Definition --> Version[\"Immutable published version\"]\n  Version --> Instance[\"Runtime instance\"]\n  Instance --> Task[\"Human task\"]\n  Task --> Audit[\"Audit timeline\"]"
        },
        {
          "kind": "paragraph",
          "text": "Axis is the console. It is not the engine. The backend owns every state change."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Where Process fits in Nodics",
          "anchor": "processOverview-2-where-process-fits-in-nodics"
        },
        {
          "kind": "paragraph",
          "text": "`nodics.process` is a module group like `nodics.platform` and `nodics.wcms`. Runtime implementation lives under child modules:"
        },
        {
          "kind": "table",
          "headers": [
            "Module",
            "Responsibility"
          ],
          "rows": [
            [
              "`workflow`",
              "Process definitions, versions, instances, tasks, triggers, audit events, statuses, graph validation, lifecycle services, secured APIs, and BackOffice-facing API projection."
            ],
            [
              "`cronjob`",
              "Cron definitions, lifecycle operations, scheduler state, logs, node ownership, failover ownership, and event-driven execution."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "This structure keeps the module customizable. A customer overlay can override a single assignment method, add a validation rule, or change SLA policy without copying the whole Process module."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business value",
          "anchor": "processOverview-3-business-value"
        },
        {
          "kind": "paragraph",
          "text": "Process reduces cost and risk in three practical ways:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Business teams can see work as a lifecycle instead of searching logs or asking developers which status field matters.",
            "Developers can create reusable orchestration without mixing workflow logic into commerce, content, profile, media, or customer-specific modules.",
            "Operators can monitor running instances, tasks, scheduled relationships, and audit events using one consistent model."
          ]
        },
        {
          "kind": "paragraph",
          "text": "This is especially important for partners who want one server topology for business process and automation. A `processServer` can compose `nodics.process` and `nodics.foundation`, while `workflow` and `cronjob` still keep their own ownership boundaries inside the Process group."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Relationship with Cron",
          "anchor": "processOverview-4-relationship-with-cron"
        },
        {
          "kind": "paragraph",
          "text": "Process may reference scheduled triggers, but Cron owns job scheduling."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Trigger[\"Process trigger metadata\"] --> Reference[\"cronJobCode reference\"]\n  Reference --> Cron[\"cronjob lifecycle\"]\n  Cron --> Fire[\"Schedule fires\"]\n  Fire --> Process[\"Start process instance\"]"
        },
        {
          "kind": "paragraph",
          "text": "The important rule: workflow owns orchestration state; cronjob owns scheduler state. Sharing a runtime server does not mean mixing responsibilities."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Relationship with domain modules",
          "anchor": "processOverview-5-relationship-with-domain-modules"
        },
        {
          "kind": "paragraph",
          "text": "Process does not own commerce refunds, CMS publishing, profile onboarding, media storage, or logistics shipment rules. Those domain modules own their business actions. Process may orchestrate the steps and wait for tasks, but the domain module must still validate and execute its own operation."
        },
        {
          "kind": "paragraph",
          "text": "Example:"
        },
        {
          "kind": "table",
          "headers": [
            "Need",
            "Owner"
          ],
          "rows": [
            [
              "Decide whether a refund is allowed",
              "Commerce module"
            ],
            [
              "Ask a manager to approve the refund",
              "Process task"
            ],
            [
              "Schedule a nightly reconciliation flow",
              "Cron job plus Process trigger metadata"
            ],
            [
              "Show the task to an employee",
              "Axis process console"
            ],
            [
              "Persist instance and audit history",
              "Process backend"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What exists in the current MVP",
          "anchor": "processOverview-6-what-exists-in-the-current-mvp"
        },
        {
          "kind": "paragraph",
          "text": "The current Process foundation supports:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "draft process definition creation;",
            "backend graph validation;",
            "immutable publish versioning;",
            "prepare-next-draft behavior;",
            "start published process instance;",
            "create first human task for a TASK node;",
            "claim, assign, complete, and cancel tasks;",
            "cancel running or waiting instances;",
            "instance detail with tasks and audit timeline;",
            "scheduled trigger metadata list;",
            "Axis console projection for definitions, instances, tasks, triggers, and timeline evidence."
          ]
        },
        {
          "kind": "paragraph",
          "text": "The current runtime intentionally keeps execution small: START -> TASK -> END is supported as the first reliable path. Complex gateways, domain action execution, compensation, retries, timers, and BPMN import/export can be added later as governed extensions after the foundation is proven."
        },
        {
          "kind": "paragraph",
          "text": "Use `Workflow Orchestration Patterns` when the process is more than a first human approval. That guide explains the boundary between workflow and pipeline, and uses a product export scenario to show aggregation, filters, multi-target branching, target adapters, retry, and recovery without moving Commerce or export business logic into Process."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Extension direction",
          "anchor": "processOverview-7-extension-direction"
        },
        {
          "kind": "paragraph",
          "text": "Additional modules or customer projects should extend Process through:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "graph validation policy;",
            "task assignment policy;",
            "SLA and escalation policy;",
            "domain action execution providers;",
            "trigger providers;",
            "audit redaction policy;",
            "Axis renderer components that call backend-owned Process APIs."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Do not put process runtime rules into Axis. The browser can edit and display a graph, but backend validation and execution remain authoritative."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processOverview-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating Process as the owner of domain commands or Cron scheduler state.",
            "Building a second workflow registry, state machine, or execution path in Axis or a customer project."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processOverview-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run Process contracts and fresh-bootstrap acceptance, confirm one backend definition and runtime authority, verify permission denial and invalid graphs, and observe successful, failed, retried, and recovered instances."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Commerce And Content Workflow Coverage",
          "anchor": "processOverview-10-commerce-and-content-workflow-coverage"
        },
        {
          "kind": "paragraph",
          "text": "Process workflows support commerce and content operations without owning the domain decision itself. A workflow may request approval, route a human task, call an action adapter, record an incident, or resume after a callback, but Order, Payment, WCMS, Localization, and Engagement still own their business records."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Definition[\"Process definition\"] --> Version[\"Definition version\"]\n  Version --> Instance[\"Process instance\"]\n  Instance --> Task[\"Human or automated task\"]\n  Task --> Adapter[\"Action adapter\"]\n  Adapter --> Domain[\"Owning domain service\"]\n  Domain --> Audit[\"Process audit event\"]\n  Domain --> Incident[\"Incident or retry\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Process record",
            "Business purpose",
            "Extension point"
          ],
          "rows": [
            [
              "ProcessDefinition and Version",
              "Govern reusable workflow design.",
              "Add backend-validated process graphs and publication rules."
            ],
            [
              "ProcessInstance",
              "Tracks one running business process.",
              "Add domain correlation and recovery evidence."
            ],
            [
              "ProcessTask",
              "Owns human or automated work assignment.",
              "Add assignment, SLA, escalation, and approval policy."
            ],
            [
              "ProcessTrigger",
              "Starts process from event, API, schedule, or domain action.",
              "Add trigger provider and idempotency rules."
            ],
            [
              "ProcessAuditEvent and Incident",
              "Explain what happened and what failed.",
              "Add redacted evidence and retry/compensation policy."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "This is the main workflow reference for commerce approvals, CMS publication approval, localization release approval, return/refund review, and engagement operations. Axis can render the process designer and task views, but backend validation remains authoritative."
        }
      ],
      "searchText": "Business Process and Automation Overview Understand why nodics.process exists, how it helps business users, developers, and operators, and where it fits with Core, Cron, Platform, Axis, and customer modules. # Business Process and Automation Overview\n\n`nodics.process` is the standard Nodics functional module group for business processes, workflows, task orchestration, runtime instances, audit evidence, and automation design. It exists because most enterprise applications do not run as one simple button click. A content approval, onboarding request, order exception, document review, refund approval, or partner activation often needs multiple steps, people, systems, deadlines, decisions, retries, and audit records.\n\nFor a business user, Process answers: \"What work is moving, who needs to act, what is delayed, and what evidence do we have?\" For a developer, Process answers: \"How do I model orchestration without hardcoding the flow into one domain service?\" For an operator, Process answers: \"Which instances are running, which tasks are stuck, which triggers are related to schedules, and what happened when something failed?\"\n\n## Beginner mental model\n\nImagine a simple content approval:\n\n1. A page is submitted.\n2. A reviewer checks it.\n3. The reviewer approves or rejects it.\n4. The system records who acted and when.\n5. The page can continue to publication or return for changes.\n\nWithout a process engine, each application might write that flow in its own service. That makes every flow difficult to inspect, customize, test, and operate. `nodics.process` gives Nodics one governed place to model the flow, publish versions, start runtime instances, create human tasks, and record audit events.\n\n```mermaid\nflowchart LR\n  Business[\"Business user\"] --> Axis[\"Axis process console\"]\n  Axis --> ProcessApi[\"nodics.process APIs\"]\n  ProcessApi --> Definition[\"Draft definition\"]\n  Definition --> Version[\"Immutable published version\"]\n  Version --> Instance[\"Runtime instance\"]\n  Instance --> Task[\"Human task\"]\n  Task --> Audit[\"Audit timeline\"]\n```\n\nAxis is the console. It is not the engine. The backend owns every state change.\n\n## Where Process fits in Nodics\n\n`nodics.process` is a module group like `nodics.platform` and `nodics.wcms`. Runtime implementation lives under child modules:\n\n| Module | Responsibility |\n| --- | --- |\n| `workflow` | Process definitions, versions, instances, tasks, triggers, audit events, statuses, graph validation, lifecycle services, secured APIs, and BackOffice-facing API projection. |\n| `cronjob` | Cron definitions, lifecycle operations, scheduler state, logs, node ownership, failover ownership, and event-driven execution. |\n\nThis structure keeps the module customizable. A customer overlay can override a single assignment method, add a validation rule, or change SLA policy without copying the whole Process module.\n\n## Business value\n\nProcess reduces cost and risk in three practical ways:\n\n- Business teams can see work as a lifecycle instead of searching logs or asking developers which status field matters.\n- Developers can create reusable orchestration without mixing workflow logic into commerce, content, profile, media, or customer-specific modules.\n- Operators can monitor running instances, tasks, scheduled relationships, and audit events using one consistent model.\n\nThis is especially important for partners who want one server topology for business process and automation. A `processServer` can compose `nodics.process` and `nodics.foundation`, while `workflow` and `cronjob` still keep their own ownership boundaries inside the Process group.\n\n## Relationship with Cron\n\nProcess may reference scheduled triggers, but Cron owns job scheduling.\n\n```mermaid\nflowchart TD\n  Trigger[\"Process trigger metadata\"] --> Reference[\"cronJobCode reference\"]\n  Reference --> Cron[\"cronjob lifecycle\"]\n  Cron --> Fire[\"Schedule fires\"]\n  Fire --> Process[\"Start process instance\"]\n```\n\nThe important rule: workflow owns orchestration state; cronjob owns scheduler state. Sharing a runtime server does not mean mixing responsibilities.\n\n## Relationship with domain modules\n\nProcess does not own commerce refunds, CMS publishing, profile onboarding, media storage, or logistics shipment rules. Those domain modules own their business actions. Process may orchestrate the steps and wait for tasks, but the domain module must still validate and execute its own operation.\n\nExample:\n\n| Need | Owner |\n| --- | --- |\n| Decide whether a refund is allowed | Commerce module |\n| Ask a manager to approve the refund | Process task |\n| Schedule a nightly reconciliation flow | Cron job plus Process trigger metadata |\n| Show the task to an employee | Axis process console |\n| Persist instance and audit history | Process backend |\n\n## What exists in the current MVP\n\nThe current Process foundation supports:\n\n- draft process definition creation;\n- backend graph validation;\n- immutable publish versioning;\n- prepare-next-draft behavior;\n- start published process instance;\n- create first human task for a TASK node;\n- claim, assign, complete, and cancel tasks;\n- cancel running or waiting instances;\n- instance detail with tasks and audit timeline;\n- scheduled trigger metadata list;\n- Axis console projection for definitions, instances, tasks, triggers, and timeline evidence.\n\nThe current runtime intentionally keeps execution small: START -> TASK -> END is supported as the first reliable path. Complex gateways, domain action execution, compensation, retries, timers, and BPMN import/export can be added later as governed extensions after the foundation is proven.\n\nUse `Workflow Orchestration Patterns` when the process is more than a first human approval. That guide explains the boundary between workflow and pipeline, and uses a product export scenario to show aggregation, filters, multi-target branching, target adapters, retry, and recovery without moving Commerce or export business logic into Process.\n\n## Extension direction\n\nAdditional modules or customer projects should extend Process through:\n\n- graph validation policy;\n- task assignment policy;\n- SLA and escalation policy;\n- domain action execution providers;\n- trigger providers;\n- audit redaction policy;\n- Axis renderer components that call backend-owned Process APIs.\n\nDo not put process runtime rules into Axis. The browser can edit and display a graph, but backend validation and execution remain authoritative.\n\n## Common mistakes\n\n- Treating Process as the owner of domain commands or Cron scheduler state.\n- Building a second workflow registry, state machine, or execution path in Axis or a customer project.\n\n## Verification\n\nRun Process contracts and fresh-bootstrap acceptance, confirm one backend definition and runtime authority, verify permission denial and invalid graphs, and observe successful, failed, retried, and recovered instances.\n\n## Commerce And Content Workflow Coverage\n\nProcess workflows support commerce and content operations without owning the domain decision itself. A workflow may request approval, route a human task, call an action adapter, record an incident, or resume after a callback, but Order, Payment, WCMS, Localization, and Engagement still own their business records.\n\n```mermaid\nflowchart LR\n  Definition[\"Process definition\"] --> Version[\"Definition version\"]\n  Version --> Instance[\"Process instance\"]\n  Instance --> Task[\"Human or automated task\"]\n  Task --> Adapter[\"Action adapter\"]\n  Adapter --> Domain[\"Owning domain service\"]\n  Domain --> Audit[\"Process audit event\"]\n  Domain --> Incident[\"Incident or retry\"]\n```\n\n| Process record | Business purpose | Extension point |\n| --- | --- | --- |\n| ProcessDefinition and Version | Govern reusable workflow design. | Add backend-validated process graphs and publication rules. |\n| ProcessInstance | Tracks one running business process. | Add domain correlation and recovery evidence. |\n| ProcessTask | Owns human or automated work assignment. | Add assignment, SLA, escalation, and approval policy. |\n| ProcessTrigger | Starts process from event, API, schedule, or domain action. | Add trigger provider and idempotency rules. |\n| ProcessAuditEvent and Incident | Explain what happened and what failed. | Add redacted evidence and retry/compensation policy. |\n\nThis is the main workflow reference for commerce approvals, CMS publication approval, localization release approval, return/refund review, and engagement operations. Axis can render the process designer and task views, but backend validation remains authoritative.\n",
      "previous": {
        "title": "Events, Messaging, and Cluster Coordination",
        "route": "/docs/framework/events-messaging-cluster-coordination"
      },
      "next": {
        "title": "Runtime Instance and Task Lifecycle",
        "route": "/docs/framework/process/runtime-lifecycle"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 1088,
        "checksum": "ced12c96bad6c4adc9c26c090810d0c713e7eb8ada3d1046f2afcec5bd07c83d"
      },
      "slug": "process",
      "locale": "en",
      "navigationGroup": "Process Overview",
      "navigationGroupCode": "process-overview",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "process.first-workflow",
          "owner": "workflow"
        },
        {
          "documentId": "process.runtime-lifecycle",
          "owner": "workflow"
        },
        {
          "documentId": "process.workflow-orchestration-patterns",
          "owner": "workflow"
        },
        {
          "documentId": "cron.operations",
          "owner": "cronjob"
        }
      ]
    },
    "active": true
  },
  "record4": {
    "code": "nodicsDocsComponentprocessRuntimeLifecycle",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.runtime-lifecycle",
      "title": "Runtime Instance and Task Lifecycle",
      "route": "/docs/framework/process/runtime-lifecycle",
      "section": "process-and-workflow-automation",
      "sectionTitle": "Process and Workflow Automation",
      "group": "process-and-workflow-automation",
      "groupTitle": "Process and Workflow Automation",
      "parentId": "process-and-workflow-automation",
      "hierarchyPath": [
        "Process and Workflow Automation",
        "Runtime Instance and Task Lifecycle"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
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
      "summary": "Learn the backend-owned lifecycle for definitions, versions, instances, tasks, audit events, and scheduled trigger relationships.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "process.overview",
        "process.incident-recovery",
        "process.workflow-orchestration-patterns"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "lifecycle-state-diagram",
        "troubleshooting-matrix",
        "code-example"
      ],
      "searchKeywords": [
        "process-and-workflow-automation",
        "runtime-lifecycle",
        "runtime-instance-and-task-lifecycle"
      ],
      "topicKeywords": [
        "Process and Workflow Automation",
        "Runtime Lifecycle",
        "Runtime Instance and Task Lifecycle"
      ],
      "headings": [
        {
          "text": "Lifecycle summary",
          "anchor": "processRuntimeLifecycle-1-lifecycle-summary",
          "level": 2
        },
        {
          "text": "Definition lifecycle",
          "anchor": "processRuntimeLifecycle-2-definition-lifecycle",
          "level": 2
        },
        {
          "text": "Starting an instance",
          "anchor": "processRuntimeLifecycle-3-starting-an-instance",
          "level": 2
        },
        {
          "text": "Task lifecycle",
          "anchor": "processRuntimeLifecycle-4-task-lifecycle",
          "level": 2
        },
        {
          "text": "Instance detail and audit",
          "anchor": "processRuntimeLifecycle-5-instance-detail-and-audit",
          "level": 2
        },
        {
          "text": "Scheduled triggers",
          "anchor": "processRuntimeLifecycle-6-scheduled-triggers",
          "level": 2
        },
        {
          "text": "QA checklist",
          "anchor": "processRuntimeLifecycle-7-qa-checklist",
          "level": 2
        },
        {
          "text": "Customization examples",
          "anchor": "processRuntimeLifecycle-8-customization-examples",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processRuntimeLifecycle-9-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processRuntimeLifecycle-10-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This page explains the lifecycle that turns a designed process into operational work. It is written for a beginner, so it starts with the simple path before explaining where developers and operators customize behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Lifecycle summary",
          "anchor": "processRuntimeLifecycle-1-lifecycle-summary"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "stateDiagram-v2\n  [*] --> DraftDefinition\n  DraftDefinition --> ValidatedDraft: validate draft\n  ValidatedDraft --> PublishedVersion: publish\n  PublishedVersion --> RuntimeInstance: start instance\n  RuntimeInstance --> WaitingTask: reach TASK node\n  WaitingTask --> ClaimedTask: claim\n  ClaimedTask --> CompletedTask: complete\n  CompletedTask --> CompletedInstance: next node is END\n  WaitingTask --> CancelledTask: cancel task\n  RuntimeInstance --> CancelledInstance: cancel instance"
        },
        {
          "kind": "paragraph",
          "text": "Every arrow is a backend operation. Axis buttons call these APIs, but Axis does not update the database directly and does not invent the next state."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Definition lifecycle",
          "anchor": "processRuntimeLifecycle-2-definition-lifecycle"
        },
        {
          "kind": "paragraph",
          "text": "A process starts as a draft. Drafts can be edited because business users and developers often need multiple rounds of naming, description, category, graph layout, and validation. A draft cannot become operational until the backend graph validator accepts it."
        },
        {
          "kind": "paragraph",
          "text": "The first supported graph shape is intentionally small:"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Start[\"START\"] --> Review[\"TASK: Business review\"]\n  Review --> End[\"END\"]"
        },
        {
          "kind": "paragraph",
          "text": "This proves the foundation before advanced behavior is added. The backend checks stable node codes, supported node types, one START node, at least one END node, valid transitions, duplicate node codes, and unsafe executable action references."
        },
        {
          "kind": "paragraph",
          "text": "When a draft is published, the backend creates an immutable `processDefinitionVersion`. Later draft edits must not mutate version 1. This is critical for audit: if a process instance ran yesterday, operators must know exactly which published graph version it used."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Starting an instance",
          "anchor": "processRuntimeLifecycle-3-starting-an-instance"
        },
        {
          "kind": "paragraph",
          "text": "Starting a process requires a published definition. The request can specify a definition code and optional version. If no version is supplied, the backend uses the current published version from the definition aggregate."
        },
        {
          "kind": "paragraph",
          "text": "Example request:"
        },
        {
          "kind": "code",
          "language": "http",
          "text": "POST /nodics/process/v0/instances\nAuthorization: Bearer <access-token>\nx-enterprise-code: default\ncontent-type: application/json\n\n{\n  \"definitionCode\": \"contentApproval\",\n  \"context\": {\n    \"businessKey\": \"page-123\"\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "The backend creates:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "one `processInstance`;",
            "a `process.instance.started` audit event;",
            "the first `processTask` when the graph reaches a TASK node;",
            "a `process.task.created` audit event."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Task lifecycle",
          "anchor": "processRuntimeLifecycle-4-task-lifecycle"
        },
        {
          "kind": "paragraph",
          "text": "Human tasks are operational work items. They can be open, claimed, completed, cancelled, or escalated."
        },
        {
          "kind": "paragraph",
          "text": "Runtime mutation routes use dedicated Process permissions. This keeps definition governance, instance control, human-task operations, and trigger management separate even when the reference admin can exercise all of them. Customer projects can assign these permissions to narrower user groups later."
        },
        {
          "kind": "table",
          "headers": [
            "Action",
            "API",
            "Permission",
            "Allowed from",
            "Result"
          ],
          "rows": [
            [
              "Start instance",
              "`POST /instances`",
              "`process.instance.start`",
              "Published version",
              "Instance starts and first task may be created."
            ],
            [
              "Claim",
              "`POST /tasks/:taskCode/claim`",
              "`process.task.claim`",
              "`OPEN`",
              "Task becomes `CLAIMED` and assignee is recorded."
            ],
            [
              "Assign",
              "`POST /tasks/:taskCode/assign`",
              "`process.task.assign`",
              "`OPEN`, `CLAIMED`, `ESCALATED`",
              "Assignee changes while task remains actionable."
            ],
            [
              "Complete",
              "`POST /tasks/:taskCode/complete`",
              "`process.task.complete`",
              "`OPEN`, `CLAIMED`, `ESCALATED`",
              "Task becomes `COMPLETED`; instance moves to next node."
            ],
            [
              "Cancel task",
              "`POST /tasks/:taskCode/cancel`",
              "`process.task.cancel`",
              "`OPEN`, `CLAIMED`, `ESCALATED`",
              "Task becomes `CANCELLED` without cancelling the whole instance."
            ],
            [
              "Cancel instance",
              "`POST /instances/:instanceCode/cancel`",
              "`process.instance.cancel`",
              "`CREATED`, `RUNNING`, `WAITING`",
              "Instance becomes `CANCELLED`; open tasks are cancelled."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Completing a task advances through the published graph. ACTION, DECISION, TIMER, and SUB_PROCESS nodes are backend-executed. If an ACTION fails, Process marks the instance `FAILED` and opens a recovery incident; operators then use the governed retry or compensation APIs described in the incident recovery guide."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Instance detail and audit",
          "anchor": "processRuntimeLifecycle-5-instance-detail-and-audit"
        },
        {
          "kind": "paragraph",
          "text": "Operators need evidence, not just status. The detail API returns the instance, its tasks, and its audit timeline."
        },
        {
          "kind": "code",
          "language": "http",
          "text": "GET /nodics/process/v0/instances/contentApproval-001/detail"
        },
        {
          "kind": "paragraph",
          "text": "The response gives Axis enough information to show:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "current instance status;",
            "definition and version;",
            "current node;",
            "all related tasks;",
            "timeline events such as instance started, task created, task claimed, task completed, and instance completed."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Audit data must stay bounded and redacted. It should explain what happened without storing secrets or large raw payloads."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Scheduled triggers",
          "anchor": "processRuntimeLifecycle-6-scheduled-triggers"
        },
        {
          "kind": "paragraph",
          "text": "Scheduled automation is represented as Process trigger metadata. A trigger may reference a Cron job code, but actual scheduling, firing, retries, and job lifecycle stay in `nodics.process/modules/cronjob`."
        },
        {
          "kind": "paragraph",
          "text": "This split helps a business user see automation relationships from the Process console while preserving module ownership:"
        },
        {
          "kind": "table",
          "headers": [
            "Concern",
            "Owner"
          ],
          "rows": [
            [
              "Trigger relationship to a process",
              "`nodics.process`"
            ],
            [
              "Cron expression, job enablement, scheduler runtime",
              "`nodics.process/modules/cronjob`"
            ],
            [
              "Starting an instance when schedule fires",
              "Process API called by authorized runtime integration"
            ],
            [
              "Showing relationship in Axis",
              "`nodics.axis` frontend projection"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The trigger metadata lifecycle uses `process.trigger.manage` for create, update, activation, pause, and archive operations. Archiving is preferred over delete so operators can still explain why a scheduled automation relationship used to exist."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "QA checklist",
          "anchor": "processRuntimeLifecycle-7-qa-checklist"
        },
        {
          "kind": "paragraph",
          "text": "The runtime foundation is healthy when:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "A draft can be created and validated.",
            "A valid draft can publish version 1.",
            "Version 1 remains immutable after preparing version 2 draft.",
            "A published definition can start a runtime instance.",
            "The first TASK node creates an OPEN task.",
            "Claiming the task records assignee and audit evidence.",
            "Completing the task advances the instance to END and COMPLETED.",
            "Instance detail returns tasks and audit timeline.",
            "Invalid task transitions fail with stable Process errors.",
            "Axis refreshes after each operation without calculating runtime state locally."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization examples",
          "anchor": "processRuntimeLifecycle-8-customization-examples"
        },
        {
          "kind": "paragraph",
          "text": "A customer project can customize without editing the standard Process source:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "override task assignment policy to assign by enterprise, site, queue, or role;",
            "add SLA due-date calculation using project-level properties;",
            "add graph validation rules for domain action references;",
            "add a provider that executes ACTION nodes through a domain module facade;",
            "add escalation rules that create events or Cron-backed reminders;",
            "enrich Axis cards using backend-owned API data."
          ]
        },
        {
          "kind": "paragraph",
          "text": "The key principle stays the same: Process owns orchestration state, domain modules own business actions, Cron owns scheduling, and Axis renders authorized contracts."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processRuntimeLifecycle-9-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Updating instances or tasks without expected-state concurrency checks.",
            "Mutating published definitions, deleting audit history, or allowing domain actions to bypass Process lifecycle rules."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processRuntimeLifecycle-10-verification"
        },
        {
          "kind": "paragraph",
          "text": "Exercise draft, validation, publication, instance start, task completion, failure, retry, compensation, and terminal-state rejection. Restart the runtime and confirm durable state and audit continuity. The production operator must verify alerts, ownership, and restart recovery for each non-terminal state."
        }
      ],
      "searchText": "Runtime Instance and Task Lifecycle Learn the backend-owned lifecycle for definitions, versions, instances, tasks, audit events, and scheduled trigger relationships. # Runtime Instance and Task Lifecycle\n\nThis page explains the lifecycle that turns a designed process into operational work. It is written for a beginner, so it starts with the simple path before explaining where developers and operators customize behavior.\n\n## Lifecycle summary\n\n```mermaid\nstateDiagram-v2\n  [*] --> DraftDefinition\n  DraftDefinition --> ValidatedDraft: validate draft\n  ValidatedDraft --> PublishedVersion: publish\n  PublishedVersion --> RuntimeInstance: start instance\n  RuntimeInstance --> WaitingTask: reach TASK node\n  WaitingTask --> ClaimedTask: claim\n  ClaimedTask --> CompletedTask: complete\n  CompletedTask --> CompletedInstance: next node is END\n  WaitingTask --> CancelledTask: cancel task\n  RuntimeInstance --> CancelledInstance: cancel instance\n```\n\nEvery arrow is a backend operation. Axis buttons call these APIs, but Axis does not update the database directly and does not invent the next state.\n\n## Definition lifecycle\n\nA process starts as a draft. Drafts can be edited because business users and developers often need multiple rounds of naming, description, category, graph layout, and validation. A draft cannot become operational until the backend graph validator accepts it.\n\nThe first supported graph shape is intentionally small:\n\n```mermaid\nflowchart LR\n  Start[\"START\"] --> Review[\"TASK: Business review\"]\n  Review --> End[\"END\"]\n```\n\nThis proves the foundation before advanced behavior is added. The backend checks stable node codes, supported node types, one START node, at least one END node, valid transitions, duplicate node codes, and unsafe executable action references.\n\nWhen a draft is published, the backend creates an immutable `processDefinitionVersion`. Later draft edits must not mutate version 1. This is critical for audit: if a process instance ran yesterday, operators must know exactly which published graph version it used.\n\n## Starting an instance\n\nStarting a process requires a published definition. The request can specify a definition code and optional version. If no version is supplied, the backend uses the current published version from the definition aggregate.\n\nExample request:\n\n```http\nPOST /nodics/process/v0/instances\nAuthorization: Bearer <access-token>\nx-enterprise-code: default\ncontent-type: application/json\n\n{\n  \"definitionCode\": \"contentApproval\",\n  \"context\": {\n    \"businessKey\": \"page-123\"\n  }\n}\n```\n\nThe backend creates:\n\n- one `processInstance`;\n- a `process.instance.started` audit event;\n- the first `processTask` when the graph reaches a TASK node;\n- a `process.task.created` audit event.\n\n## Task lifecycle\n\nHuman tasks are operational work items. They can be open, claimed, completed, cancelled, or escalated.\n\nRuntime mutation routes use dedicated Process permissions. This keeps definition governance, instance control, human-task operations, and trigger management separate even when the reference admin can exercise all of them. Customer projects can assign these permissions to narrower user groups later.\n\n| Action | API | Permission | Allowed from | Result |\n| --- | --- | --- | --- | --- |\n| Start instance | `POST /instances` | `process.instance.start` | Published version | Instance starts and first task may be created. |\n| Claim | `POST /tasks/:taskCode/claim` | `process.task.claim` | `OPEN` | Task becomes `CLAIMED` and assignee is recorded. |\n| Assign | `POST /tasks/:taskCode/assign` | `process.task.assign` | `OPEN`, `CLAIMED`, `ESCALATED` | Assignee changes while task remains actionable. |\n| Complete | `POST /tasks/:taskCode/complete` | `process.task.complete` | `OPEN`, `CLAIMED`, `ESCALATED` | Task becomes `COMPLETED`; instance moves to next node. |\n| Cancel task | `POST /tasks/:taskCode/cancel` | `process.task.cancel` | `OPEN`, `CLAIMED`, `ESCALATED` | Task becomes `CANCELLED` without cancelling the whole instance. |\n| Cancel instance | `POST /instances/:instanceCode/cancel` | `process.instance.cancel` | `CREATED`, `RUNNING`, `WAITING` | Instance becomes `CANCELLED`; open tasks are cancelled. |\n\nCompleting a task advances through the published graph. ACTION, DECISION, TIMER, and SUB_PROCESS nodes are backend-executed. If an ACTION fails, Process marks the instance `FAILED` and opens a recovery incident; operators then use the governed retry or compensation APIs described in the incident recovery guide.\n\n## Instance detail and audit\n\nOperators need evidence, not just status. The detail API returns the instance, its tasks, and its audit timeline.\n\n```http\nGET /nodics/process/v0/instances/contentApproval-001/detail\n```\n\nThe response gives Axis enough information to show:\n\n- current instance status;\n- definition and version;\n- current node;\n- all related tasks;\n- timeline events such as instance started, task created, task claimed, task completed, and instance completed.\n\nAudit data must stay bounded and redacted. It should explain what happened without storing secrets or large raw payloads.\n\n## Scheduled triggers\n\nScheduled automation is represented as Process trigger metadata. A trigger may reference a Cron job code, but actual scheduling, firing, retries, and job lifecycle stay in `nodics.process/modules/cronjob`.\n\nThis split helps a business user see automation relationships from the Process console while preserving module ownership:\n\n| Concern | Owner |\n| --- | --- |\n| Trigger relationship to a process | `nodics.process` |\n| Cron expression, job enablement, scheduler runtime | `nodics.process/modules/cronjob` |\n| Starting an instance when schedule fires | Process API called by authorized runtime integration |\n| Showing relationship in Axis | `nodics.axis` frontend projection |\n\nThe trigger metadata lifecycle uses `process.trigger.manage` for create, update, activation, pause, and archive operations. Archiving is preferred over delete so operators can still explain why a scheduled automation relationship used to exist.\n\n## QA checklist\n\nThe runtime foundation is healthy when:\n\n1. A draft can be created and validated.\n2. A valid draft can publish version 1.\n3. Version 1 remains immutable after preparing version 2 draft.\n4. A published definition can start a runtime instance.\n5. The first TASK node creates an OPEN task.\n6. Claiming the task records assignee and audit evidence.\n7. Completing the task advances the instance to END and COMPLETED.\n8. Instance detail returns tasks and audit timeline.\n9. Invalid task transitions fail with stable Process errors.\n10. Axis refreshes after each operation without calculating runtime state locally.\n\n## Customization examples\n\nA customer project can customize without editing the standard Process source:\n\n- override task assignment policy to assign by enterprise, site, queue, or role;\n- add SLA due-date calculation using project-level properties;\n- add graph validation rules for domain action references;\n- add a provider that executes ACTION nodes through a domain module facade;\n- add escalation rules that create events or Cron-backed reminders;\n- enrich Axis cards using backend-owned API data.\n\nThe key principle stays the same: Process owns orchestration state, domain modules own business actions, Cron owns scheduling, and Axis renders authorized contracts.\n\n## Common mistakes\n\n- Updating instances or tasks without expected-state concurrency checks.\n- Mutating published definitions, deleting audit history, or allowing domain actions to bypass Process lifecycle rules.\n\n## Verification\n\nExercise draft, validation, publication, instance start, task completion, failure, retry, compensation, and terminal-state rejection. Restart the runtime and confirm durable state and audit continuity. The production operator must verify alerts, ownership, and restart recovery for each non-terminal state.\n",
      "previous": {
        "title": "Business Process and Automation Overview",
        "route": "/docs/framework/process"
      },
      "next": {
        "title": "Workflow Orchestration Patterns",
        "route": "/docs/framework/process/workflow-orchestration-patterns"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 982,
        "checksum": "13d5e22074727e80a625887ac505de67d44f360b4fb55923e689fcae1a449018"
      },
      "slug": "runtime-lifecycle",
      "locale": "en",
      "navigationGroup": "Runtime Lifecycle",
      "navigationGroupCode": "runtime-lifecycle",
      "navigationGroupOrder": 20,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "process.overview",
          "owner": "workflow"
        },
        {
          "documentId": "process.incident-recovery",
          "owner": "workflow"
        },
        {
          "documentId": "process.workflow-orchestration-patterns",
          "owner": "workflow"
        }
      ]
    },
    "active": true
  },
  "record5": {
    "code": "nodicsDocsComponentprocessWorkflowOrchestrationPatterns",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.workflow-orchestration-patterns",
      "title": "Workflow Orchestration Patterns",
      "route": "/docs/framework/process/workflow-orchestration-patterns",
      "section": "process-and-workflow-automation",
      "sectionTitle": "Process and Workflow Automation",
      "group": "process-and-workflow-automation",
      "groupTitle": "Process and Workflow Automation",
      "parentId": "process-and-workflow-automation",
      "hierarchyPath": [
        "Process and Workflow Automation",
        "Workflow Orchestration Patterns"
      ],
      "hierarchyDepth": 2,
      "documentType": "customization",
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
      "summary": "How Process workflows govern long-running business lifecycle with product export aggregation, filters, multi-target branching, ACTION adapters, retry, and recovery.",
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
        "process.runtime-lifecycle",
        "process.action-adapters",
        "process.incident-recovery",
        "pipeline.business-logic-orchestration",
        "data.import-export-migration",
        "catalog.product-discovery-management",
        "pricing.promotions-tax-management",
        "inventory.stock-management"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "src/schemas/schemas.js",
        "src/service/designer/defaultProcessGraphValidationService.js",
        "src/service/operation/defaultProcessRuntimeLifecycleService.js",
        "src/service/operation/defaultProcessActionAdapterRegistryService.js",
        "src/router/routers.js",
        "config/properties.js",
        "../../../nodics.foundation/modules/nData/nExport/export/src/service/DataExportService.js",
        "../../../nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductDiscoveryService.js",
        "../../../nodics.commerce/modules/baseCommerce/modules/pricing/src/service/defaultCustomerPriceSummaryService.js",
        "../../../nodics.commerce/modules/baseCommerce/modules/inventory/src/service/defaultCustomerAvailabilitySummaryService.js",
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
        "process",
        "product-export",
        "multi-target-export",
        "target-branching",
        "action-adapter",
        "processDefinition",
        "processInstance",
        "processTask",
        "processIncident",
        "data-export",
        "filters",
        "aggregation"
      ],
      "topicKeywords": [
        "Process and Workflow Automation",
        "Runtime Lifecycle",
        "Workflow Orchestration Patterns",
        "Product Export Workflow"
      ],
      "headings": [
        {
          "text": "Pipeline and workflow boundary",
          "anchor": "processWorkflowOrchestrationPatterns-1-pipeline-and-workflow-boundary",
          "level": 2
        },
        {
          "text": "Workflow lifecycle",
          "anchor": "processWorkflowOrchestrationPatterns-2-workflow-lifecycle",
          "level": 2
        },
        {
          "text": "Product export use case",
          "anchor": "processWorkflowOrchestrationPatterns-3-product-export-use-case",
          "level": 2
        },
        {
          "text": "Workflow definition example",
          "anchor": "processWorkflowOrchestrationPatterns-4-workflow-definition-example",
          "level": 2
        },
        {
          "text": "Starting the export workflow",
          "anchor": "processWorkflowOrchestrationPatterns-5-starting-the-export-workflow",
          "level": 2
        },
        {
          "text": "Data aggregation contract",
          "anchor": "processWorkflowOrchestrationPatterns-6-data-aggregation-contract",
          "level": 2
        },
        {
          "text": "Filters and target policies",
          "anchor": "processWorkflowOrchestrationPatterns-7-filters-and-target-policies",
          "level": 2
        },
        {
          "text": "Action adapters",
          "anchor": "processWorkflowOrchestrationPatterns-8-action-adapters",
          "level": 2
        },
        {
          "text": "Multi-directional split patterns",
          "anchor": "processWorkflowOrchestrationPatterns-9-multi-directional-split-patterns",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "processWorkflowOrchestrationPatterns-10-customization-and-extension",
          "level": 2
        },
        {
          "text": "Error and recovery",
          "anchor": "processWorkflowOrchestrationPatterns-11-error-and-recovery",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processWorkflowOrchestrationPatterns-12-verification",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processWorkflowOrchestrationPatterns-13-common-mistakes",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Workflow orchestration explains how Nodics models long-running business work that may involve people, approvals, waits, recovery, and several domain systems. It uses the same clarity expected from pipeline documentation, but it is not the same runtime mechanism. A pipeline executes bounded technical logic. A workflow governs business lifecycle, persisted state, tasks, decisions, ACTION adapters, retries, compensation, and audit evidence."
        },
        {
          "kind": "paragraph",
          "text": "The simplest rule is: pipelines execute steps now; workflows remember business work over time. A workflow may call pipelines or services, but the workflow definition should remain declarative. It should say which business step comes next, which actor or adapter owns it, which context is allowed, and what evidence must be recorded."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, think of a workflow as a tracked business case. The case has a definition, a version, a current step, assigned work, decisions, and an audit timeline. A product export workflow is therefore not only a file download. It is a governed case that gathers product facts, waits for approval, sends data to selected targets, and records what happened."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Pipeline and workflow boundary",
          "anchor": "processWorkflowOrchestrationPatterns-1-pipeline-and-workflow-boundary"
        },
        {
          "kind": "table",
          "headers": [
            "Concern",
            "Pipeline",
            "Workflow"
          ],
          "rows": [
            [
              "Runtime duration",
              "Short-lived execution inside one request, event, import, job, or service call.",
              "Long-running business lifecycle that can wait for people, timers, dependencies, and recovery."
            ],
            [
              "State",
              "Usually `request` and `response` objects during one execution.",
              "Persisted `processDefinition`, immutable version, `processInstance`, `processTask`, incident, and audit records."
            ],
            [
              "Ownership",
              "`nPipeline` owns execution; the calling module owns business behavior.",
              "`workflow` owns orchestration state; domain modules own business actions."
            ],
            [
              "Branching",
              "`success` links or `response.targetNode`.",
              "Declared graph transitions, DECISION nodes, task decisions, and runtime context."
            ],
            [
              "Failure",
              "Enriched error returned to caller.",
              "Incident, retry, compensation, dead-letter, and operator evidence."
            ],
            [
              "UI visibility",
              "Usually logs, diagnostics, or capability-specific screens.",
              "Axis process/task console and business progress cards."
            ]
          ]
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Trigger[\"API, event, schedule, or user action\"] --> Workflow[\"Process workflow instance\"]\n  Workflow --> Task[\"Human task or approval\"]\n  Workflow --> Decision[\"Decision node\"]\n  Workflow --> Action[\"Declarative ACTION adapter\"]\n  Action --> Domain[\"Owning domain service or pipeline\"]\n  Domain --> Workflow\n  Workflow --> Audit[\"Audit, incident, retry, compensation\"]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Workflow lifecycle",
          "anchor": "processWorkflowOrchestrationPatterns-2-workflow-lifecycle"
        },
        {
          "kind": "paragraph",
          "text": "Every serious workflow follows the same lifecycle:"
        },
        {
          "kind": "table",
          "headers": [
            "Step",
            "Runtime action",
            "Developer meaning"
          ],
          "rows": [
            [
              "1. Define",
              "Create a draft process definition with stable codes, graph nodes, transitions, owner module, category, and policy.",
              "The workflow is business-readable and backend-validated."
            ],
            [
              "2. Validate",
              "Backend graph validation checks supported node types, START/END rules, transition integrity, and safe ACTION references.",
              "Axis can draw the graph, but backend validation is the authority."
            ],
            [
              "3. Publish",
              "A valid draft becomes an immutable `processDefinitionVersion` with a checksum.",
              "Runtime instances must point to an immutable version, never a mutable draft."
            ],
            [
              "4. Start",
              "API, schedule, event, or domain service starts a `processInstance` with bounded context.",
              "Pass business keys and filters, not secrets or raw provider payloads."
            ],
            [
              "5. Execute",
              "Process enters TASK, DECISION, ACTION, TIMER, SUB_PROCESS, or END nodes.",
              "Process records state; domain modules execute business actions through registered adapters."
            ],
            [
              "6. Wait",
              "Human tasks, timers, and dependency waits keep the instance durable.",
              "Axis shows the next action and operator evidence."
            ],
            [
              "7. Branch",
              "DECISION nodes select transitions from task decisions or context.",
              "Split to two or many targets without hiding control flow in code."
            ],
            [
              "8. Recover",
              "ACTION failures create incidents and bounded retry or compensation options.",
              "Operators recover through Process APIs, not direct database edits."
            ],
            [
              "9. Complete",
              "The instance reaches END and writes final audit evidence.",
              "Business users can prove who acted, which version ran, and what was exported or published."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Product export use case",
          "anchor": "processWorkflowOrchestrationPatterns-3-product-export-use-case"
        },
        {
          "kind": "paragraph",
          "text": "A product export is a good workflow example because the request is not simply \"write a file.\" A business user may ask for apparel products to be exported to several destinations. The export needs product data, pricing, inventory, classification, media references, locale/market filters, target-specific field rules, approval, and retryable delivery."
        },
        {
          "kind": "paragraph",
          "text": "The business flow can split to two, three, or many targets. One request may export a marketplace feed, a partner ERP feed, and a marketing analytics file. Each target can have its own filter, format, adapter, retry policy, and delivery evidence."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Start[\"START\"] --> Prepare[\"ACTION: prepare export context\"]\n  Prepare --> Aggregate[\"ACTION: aggregate product data\"]\n  Aggregate --> Review[\"TASK: review export candidate\"]\n  Review --> Decision[\"DECISION: approved?\"]\n  Decision -->|approved=true| TargetSplit[\"DECISION: target route\"]\n  Decision -->|default| Rejected[\"ACTION: mark rejected\"]\n  TargetSplit --> Marketplace[\"ACTION: export marketplace feed\"]\n  TargetSplit --> ERP[\"ACTION: export ERP feed\"]\n  TargetSplit --> Analytics[\"ACTION: export analytics file\"]\n  Marketplace --> End[\"END\"]\n  ERP --> End\n  Analytics --> End\n  Rejected --> End"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Workflow definition example",
          "anchor": "processWorkflowOrchestrationPatterns-4-workflow-definition-example"
        },
        {
          "kind": "paragraph",
          "text": "The definition stays declarative. It does not contain JavaScript functions, database queries, provider URLs, or credentials. ACTION nodes reference registered adapters. The adapters can call Commerce services, nExport, media, or a target connector, but the graph stores only the allowed operation names and policy."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  definitions: [{\n    code: 'commerceProductExport',\n    name: 'Commerce Product Export',\n    category: 'commerce-export',\n    ownerModule: 'product',\n    policy: {\n      assignmentPolicy: 'QUEUE',\n      requiredApprovals: 1,\n      requireReasonOnReject: true,\n      contextAllowlist: [\n        'tenant',\n        'catalogCode',\n        'market',\n        'locale',\n        'targets',\n        'filters',\n        'requestedBy',\n        'correlationId'\n      ]\n    },\n    graph: {\n      nodes: [\n        { code: 'start', type: 'START', name: 'Start' },\n        {\n          code: 'prepareExportContext',\n          type: 'ACTION',\n          name: 'Prepare Export Context',\n          action: { moduleName: 'commerce.product', operation: 'prepareExportContext' }\n        },\n        {\n          code: 'aggregateProductData',\n          type: 'ACTION',\n          name: 'Aggregate Product Data',\n          action: { moduleName: 'commerce.product', operation: 'aggregateProductExportData' }\n        },\n        {\n          code: 'reviewExport',\n          type: 'TASK',\n          name: 'Review Product Export',\n          assignee: 'commerceExportApprovalQueue'\n        },\n        { code: 'approvalDecision', type: 'DECISION', name: 'Approval Decision' },\n        { code: 'targetSplit', type: 'DECISION', name: 'Target Split' },\n        {\n          code: 'exportMarketplace',\n          type: 'ACTION',\n          name: 'Export Marketplace Feed',\n          action: { moduleName: 'data.export', operation: 'exportMarketplaceProductFeed' },\n          retry: { maximumAttempts: 3, delayMs: 5000 }\n        },\n        {\n          code: 'exportErp',\n          type: 'ACTION',\n          name: 'Export ERP Feed',\n          action: { moduleName: 'data.export', operation: 'exportErpProductFeed' },\n          retry: { maximumAttempts: 3, delayMs: 10000 }\n        },\n        {\n          code: 'exportAnalytics',\n          type: 'ACTION',\n          name: 'Export Analytics File',\n          action: { moduleName: 'data.export', operation: 'exportProductAnalytics' },\n          retry: { maximumAttempts: 2, delayMs: 5000 }\n        },\n        {\n          code: 'markRejected',\n          type: 'ACTION',\n          name: 'Mark Export Rejected',\n          action: { moduleName: 'commerce.product', operation: 'markExportRejected' }\n        },\n        { code: 'end', type: 'END', name: 'End' }\n      ],\n      transitions: [\n        { code: 'start_to_prepare', source: 'start', target: 'prepareExportContext' },\n        { code: 'prepare_to_aggregate', source: 'prepareExportContext', target: 'aggregateProductData' },\n        { code: 'aggregate_to_review', source: 'aggregateProductData', target: 'reviewExport' },\n        { code: 'review_to_decision', source: 'reviewExport', target: 'approvalDecision' },\n        {\n          code: 'approved_to_split',\n          source: 'approvalDecision',\n          target: 'targetSplit',\n          condition: { field: 'approved', equals: true }\n        },\n        { code: 'rejected_to_mark', source: 'approvalDecision', target: 'markRejected', default: true },\n        {\n          code: 'split_to_marketplace',\n          source: 'targetSplit',\n          target: 'exportMarketplace',\n          condition: { field: 'target', equals: 'marketplace' }\n        },\n        {\n          code: 'split_to_erp',\n          source: 'targetSplit',\n          target: 'exportErp',\n          condition: { field: 'target', equals: 'erp' }\n        },\n        { code: 'split_to_analytics', source: 'targetSplit', target: 'exportAnalytics', default: true },\n        { code: 'marketplace_to_end', source: 'exportMarketplace', target: 'end' },\n        { code: 'erp_to_end', source: 'exportErp', target: 'end' },\n        { code: 'analytics_to_end', source: 'exportAnalytics', target: 'end' },\n        { code: 'rejected_to_end', source: 'markRejected', target: 'end' }\n      ]\n    }\n  }]\n};"
        },
        {
          "kind": "paragraph",
          "text": "This example shows a split to three targets. For two targets, remove one target ACTION node and reconnect the default transition. For more targets, add target ACTION nodes and transitions from `targetSplit`. Keep every target explicit so Axis and operators can see which destination failed or completed."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Starting the export workflow",
          "anchor": "processWorkflowOrchestrationPatterns-5-starting-the-export-workflow"
        },
        {
          "kind": "paragraph",
          "text": "The workflow starts with bounded context. The context should carry business keys and filter intent, not raw query code."
        },
        {
          "kind": "code",
          "language": "http",
          "text": "POST /nodics/process/v0/instances\nAuthorization: Bearer <access-token>\nx-enterprise-code: default\ncontent-type: application/json\n\n{\n  \"definitionCode\": \"commerceProductExport\",\n  \"instanceCode\": \"product-export-summer-2026\",\n  \"context\": {\n    \"tenant\": \"default\",\n    \"catalogCode\": \"agoraApparelProductCatalog\",\n    \"market\": \"AE\",\n    \"locale\": \"en\",\n    \"targets\": [\"marketplace\", \"erp\", \"analytics\"],\n    \"filters\": {\n      \"categoryCode\": \"summer-shirts\",\n      \"lifecycleState\": \"ONLINE\",\n      \"modifiedSince\": \"2026-08-01T00:00:00.000Z\"\n    },\n    \"requestedBy\": \"admin\",\n    \"correlationId\": \"export-2026-08-28-001\"\n  }\n}"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Data aggregation contract",
          "anchor": "processWorkflowOrchestrationPatterns-6-data-aggregation-contract"
        },
        {
          "kind": "paragraph",
          "text": "Aggregation belongs to the product or commerce adapter, not to Process. The adapter can call product, pricing, inventory, media, localization, and search projection services through their public service or module contracts."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  aggregateProductExportData: async function (request, execution) {\n    const context = execution.context || {};\n    const products = await SERVICE.DefaultProductDiscoveryService.search({\n      tenant: context.tenant,\n      query: {\n        catalogCode: context.catalogCode,\n        market: context.market,\n        locale: context.locale,\n        filters: context.filters\n      }\n    });\n    const prices = await SERVICE.DefaultCustomerPriceSummaryService.getForProducts({\n      tenant: context.tenant,\n      productCodes: products.data.records.map(product => product.code),\n      market: context.market\n    });\n    const availability = await SERVICE.DefaultCustomerAvailabilitySummaryService.getForProducts({\n      tenant: context.tenant,\n      productCodes: products.data.records.map(product => product.code),\n      market: context.market\n    });\n    return {\n      status: 'COMPLETED',\n      output: {\n        productCount: products.data.records.length,\n        priceCount: prices.data.records.length,\n        availabilityCount: availability.data.records.length\n      }\n    };\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The snippet is intentionally adapter-shaped. Real services may expose slightly different method names by project, but the ownership rule remains the same: Product owns product selection, Pricing owns price decisions, Inventory owns availability, Media owns media references, and Process owns only orchestration evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Filters and target policies",
          "anchor": "processWorkflowOrchestrationPatterns-7-filters-and-target-policies"
        },
        {
          "kind": "paragraph",
          "text": "Filters should be explicit and bounded. A workflow context can carry business filters such as catalog, category, lifecycle state, locale, market, date range, brand, channel, or approval state. It should not carry arbitrary database operators supplied by a browser."
        },
        {
          "kind": "table",
          "headers": [
            "Filter area",
            "Example",
            "Owner"
          ],
          "rows": [
            [
              "Catalog scope",
              "`catalogCode: agoraApparelProductCatalog`",
              "Product or catalog module"
            ],
            [
              "Publication state",
              "`lifecycleState: ONLINE`",
              "Publish/domain module"
            ],
            [
              "Market and locale",
              "`market: AE`, `locale: en`",
              "Commerce and localization"
            ],
            [
              "Inventory",
              "`availableOnly: true`",
              "Inventory"
            ],
            [
              "Pricing",
              "`priceListCode: retail-ae`",
              "Pricing"
            ],
            [
              "Date range",
              "`modifiedSince`",
              "Owning domain service"
            ],
            [
              "Target selection",
              "`targets: marketplace, erp, analytics`",
              "Workflow context and target adapters"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Target adapters should own destination-specific mapping:"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Action adapters",
          "anchor": "processWorkflowOrchestrationPatterns-8-action-adapters"
        },
        {
          "kind": "paragraph",
          "text": "Process ACTION nodes are safe only when the requested adapter is explicitly registered. This keeps the workflow definition readable while preserving backend control over which service method may execute. The adapter service can call Product, Pricing, Inventory, Media, nExport, or an external provider, but the graph itself never stores executable code."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  process: {\n    actionAdapters: {\n      allowedActions: [\n        {\n          moduleName: 'commerce.product',\n          operation: 'aggregateProductExportData',\n          service: 'CommerceProductExportWorkflowAdapterService',\n          method: 'aggregateProductExportData'\n        },\n        {\n          moduleName: 'data.export',\n          operation: 'exportMarketplaceProductFeed',\n          service: 'MarketplaceProductExportAdapterService',\n          method: 'export'\n        },\n        {\n          moduleName: 'data.export',\n          operation: 'exportErpProductFeed',\n          service: 'ErpProductExportAdapterService',\n          method: 'export'\n        },\n        {\n          moduleName: 'data.export',\n          operation: 'exportProductAnalytics',\n          service: 'AnalyticsProductExportAdapterService',\n          method: 'export'\n        }\n      ]\n    }\n  }\n};"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Multi-directional split patterns",
          "anchor": "processWorkflowOrchestrationPatterns-9-multi-directional-split-patterns"
        },
        {
          "kind": "paragraph",
          "text": "There are two safe ways to model multiple export targets."
        },
        {
          "kind": "table",
          "headers": [
            "Pattern",
            "Use when",
            "Shape"
          ],
          "rows": [
            [
              "Explicit target branches",
              "The target list is known and small.",
              "One DECISION node with one ACTION per target."
            ],
            [
              "Sub-process per target",
              "The target list is large, tenant-specific, or needs independent approval/retry.",
              "Parent workflow prepares context; each target starts a child workflow."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "For two to five stable destinations, explicit branches are easier to inspect. For many partner feeds, child workflows give operators one instance per target and make retries safer."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Parent[\"Product export parent\"] --> Prepare[\"Prepare and approve\"]\n  Prepare --> Split[\"Start target sub-processes\"]\n  Split --> M1[\"Marketplace export instance\"]\n  Split --> E1[\"ERP export instance\"]\n  Split --> A1[\"Analytics export instance\"]\n  M1 --> Evidence[\"Target receipts\"]\n  E1 --> Evidence\n  A1 --> Evidence"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "processWorkflowOrchestrationPatterns-10-customization-and-extension"
        },
        {
          "kind": "table",
          "headers": [
            "Need",
            "Extension point",
            "Do not do"
          ],
          "rows": [
            [
              "Add a new export target",
              "Add a target ACTION adapter and transition, or add a target sub-process.",
              "Hide a new target in one generic adapter with no visible workflow state."
            ],
            [
              "Change product selection",
              "Update product/export adapter filter policy.",
              "Put raw database query logic into workflow graph metadata."
            ],
            [
              "Add inventory or pricing enrichment",
              "Call Inventory or Pricing from the aggregation adapter.",
              "Copy Inventory or Pricing data into Process records."
            ],
            [
              "Require approval by target",
              "Add target-specific TASK nodes or child workflows.",
              "Use one approval result for all targets when policies differ."
            ],
            [
              "Change retry behavior",
              "Declare bounded retry on target ACTION nodes.",
              "Retry silently inside adapters without Process incident evidence."
            ],
            [
              "Add destination credentials",
              "Store secrets in provider configuration.",
              "Put credentials or URLs into process graph JSON."
            ],
            [
              "Export file rendering",
              "Use `nExport` or target-owned renderer services.",
              "Make Process format CSV, JSON, Excel, or provider payloads directly."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Error and recovery",
          "anchor": "processWorkflowOrchestrationPatterns-11-error-and-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Each target ACTION can fail independently. Process records the failed node, adapter, definition version, instance, error code, attempt, retry policy, compensation adapter, and redacted evidence. Operators should see whether the marketplace export failed while ERP and analytics completed, or whether the aggregation step failed before any target ran."
        },
        {
          "kind": "paragraph",
          "text": "For critical exports, prefer target sub-processes when one destination should not block another. For single-instance explicit branching, document whether targets run one at a time or whether the parent starts child instances."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processWorkflowOrchestrationPatterns-12-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify this workflow at four levels:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Graph validation rejects broken nodes, missing transitions, unknown ACTION references, duplicate START nodes, and executable metadata.",
            "Adapter tests prove product aggregation, filter validation, pricing lookup, inventory lookup, media reference handling, target rendering, and bounded output.",
            "Runtime tests start the workflow, complete approval, route to each target, force one target failure, retry it, and confirm audit/incident evidence.",
            "Browser acceptance proves Axis shows the export instance, target status, review task, failure state, retry action, and final receipts clearly."
          ]
        },
        {
          "kind": "paragraph",
          "text": "After documentation changes, regenerate and validate the documentation content pack so the Process guide is available through Axis and Online documentation:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "npm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs test"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processWorkflowOrchestrationPatterns-13-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating a workflow as a larger pipeline and losing durable state.",
            "Putting product, price, inventory, or media business rules inside Process.",
            "Hiding multiple targets behind one opaque export action.",
            "Passing arbitrary database filters from Axis into an adapter.",
            "Retrying target delivery inside provider code without Process incident evidence.",
            "Storing provider URLs, credentials, or executable handler names in the graph."
          ]
        }
      ],
      "searchText": "Workflow Orchestration Patterns How Process workflows govern long-running business lifecycle with product export aggregation, filters, multi-target branching, ACTION adapters, retry, and recovery. # Workflow Orchestration Patterns\n\nWorkflow orchestration explains how Nodics models long-running business work that may involve people, approvals, waits, recovery, and several domain systems. It uses the same clarity expected from pipeline documentation, but it is not the same runtime mechanism. A pipeline executes bounded technical logic. A workflow governs business lifecycle, persisted state, tasks, decisions, ACTION adapters, retries, compensation, and audit evidence.\n\nThe simplest rule is: pipelines execute steps now; workflows remember business work over time. A workflow may call pipelines or services, but the workflow definition should remain declarative. It should say which business step comes next, which actor or adapter owns it, which context is allowed, and what evidence must be recorded.\n\nFor beginners, think of a workflow as a tracked business case. The case has a definition, a version, a current step, assigned work, decisions, and an audit timeline. A product export workflow is therefore not only a file download. It is a governed case that gathers product facts, waits for approval, sends data to selected targets, and records what happened.\n\n## Pipeline and workflow boundary\n\n| Concern | Pipeline | Workflow |\n| --- | --- | --- |\n| Runtime duration | Short-lived execution inside one request, event, import, job, or service call. | Long-running business lifecycle that can wait for people, timers, dependencies, and recovery. |\n| State | Usually `request` and `response` objects during one execution. | Persisted `processDefinition`, immutable version, `processInstance`, `processTask`, incident, and audit records. |\n| Ownership | `nPipeline` owns execution; the calling module owns business behavior. | `workflow` owns orchestration state; domain modules own business actions. |\n| Branching | `success` links or `response.targetNode`. | Declared graph transitions, DECISION nodes, task decisions, and runtime context. |\n| Failure | Enriched error returned to caller. | Incident, retry, compensation, dead-letter, and operator evidence. |\n| UI visibility | Usually logs, diagnostics, or capability-specific screens. | Axis process/task console and business progress cards. |\n\n```mermaid\nflowchart LR\n  Trigger[\"API, event, schedule, or user action\"] --> Workflow[\"Process workflow instance\"]\n  Workflow --> Task[\"Human task or approval\"]\n  Workflow --> Decision[\"Decision node\"]\n  Workflow --> Action[\"Declarative ACTION adapter\"]\n  Action --> Domain[\"Owning domain service or pipeline\"]\n  Domain --> Workflow\n  Workflow --> Audit[\"Audit, incident, retry, compensation\"]\n```\n\n## Workflow lifecycle\n\nEvery serious workflow follows the same lifecycle:\n\n| Step | Runtime action | Developer meaning |\n| --- | --- | --- |\n| 1. Define | Create a draft process definition with stable codes, graph nodes, transitions, owner module, category, and policy. | The workflow is business-readable and backend-validated. |\n| 2. Validate | Backend graph validation checks supported node types, START/END rules, transition integrity, and safe ACTION references. | Axis can draw the graph, but backend validation is the authority. |\n| 3. Publish | A valid draft becomes an immutable `processDefinitionVersion` with a checksum. | Runtime instances must point to an immutable version, never a mutable draft. |\n| 4. Start | API, schedule, event, or domain service starts a `processInstance` with bounded context. | Pass business keys and filters, not secrets or raw provider payloads. |\n| 5. Execute | Process enters TASK, DECISION, ACTION, TIMER, SUB_PROCESS, or END nodes. | Process records state; domain modules execute business actions through registered adapters. |\n| 6. Wait | Human tasks, timers, and dependency waits keep the instance durable. | Axis shows the next action and operator evidence. |\n| 7. Branch | DECISION nodes select transitions from task decisions or context. | Split to two or many targets without hiding control flow in code. |\n| 8. Recover | ACTION failures create incidents and bounded retry or compensation options. | Operators recover through Process APIs, not direct database edits. |\n| 9. Complete | The instance reaches END and writes final audit evidence. | Business users can prove who acted, which version ran, and what was exported or published. |\n\n## Product export use case\n\nA product export is a good workflow example because the request is not simply \"write a file.\" A business user may ask for apparel products to be exported to several destinations. The export needs product data, pricing, inventory, classification, media references, locale/market filters, target-specific field rules, approval, and retryable delivery.\n\nThe business flow can split to two, three, or many targets. One request may export a marketplace feed, a partner ERP feed, and a marketing analytics file. Each target can have its own filter, format, adapter, retry policy, and delivery evidence.\n\n```mermaid\nflowchart TD\n  Start[\"START\"] --> Prepare[\"ACTION: prepare export context\"]\n  Prepare --> Aggregate[\"ACTION: aggregate product data\"]\n  Aggregate --> Review[\"TASK: review export candidate\"]\n  Review --> Decision[\"DECISION: approved?\"]\n  Decision -->|approved=true| TargetSplit[\"DECISION: target route\"]\n  Decision -->|default| Rejected[\"ACTION: mark rejected\"]\n  TargetSplit --> Marketplace[\"ACTION: export marketplace feed\"]\n  TargetSplit --> ERP[\"ACTION: export ERP feed\"]\n  TargetSplit --> Analytics[\"ACTION: export analytics file\"]\n  Marketplace --> End[\"END\"]\n  ERP --> End\n  Analytics --> End\n  Rejected --> End\n```\n\n## Workflow definition example\n\nThe definition stays declarative. It does not contain JavaScript functions, database queries, provider URLs, or credentials. ACTION nodes reference registered adapters. The adapters can call Commerce services, nExport, media, or a target connector, but the graph stores only the allowed operation names and policy.\n\n```js\nmodule.exports = {\n  definitions: [{\n    code: 'commerceProductExport',\n    name: 'Commerce Product Export',\n    category: 'commerce-export',\n    ownerModule: 'product',\n    policy: {\n      assignmentPolicy: 'QUEUE',\n      requiredApprovals: 1,\n      requireReasonOnReject: true,\n      contextAllowlist: [\n        'tenant',\n        'catalogCode',\n        'market',\n        'locale',\n        'targets',\n        'filters',\n        'requestedBy',\n        'correlationId'\n      ]\n    },\n    graph: {\n      nodes: [\n        { code: 'start', type: 'START', name: 'Start' },\n        {\n          code: 'prepareExportContext',\n          type: 'ACTION',\n          name: 'Prepare Export Context',\n          action: { moduleName: 'commerce.product', operation: 'prepareExportContext' }\n        },\n        {\n          code: 'aggregateProductData',\n          type: 'ACTION',\n          name: 'Aggregate Product Data',\n          action: { moduleName: 'commerce.product', operation: 'aggregateProductExportData' }\n        },\n        {\n          code: 'reviewExport',\n          type: 'TASK',\n          name: 'Review Product Export',\n          assignee: 'commerceExportApprovalQueue'\n        },\n        { code: 'approvalDecision', type: 'DECISION', name: 'Approval Decision' },\n        { code: 'targetSplit', type: 'DECISION', name: 'Target Split' },\n        {\n          code: 'exportMarketplace',\n          type: 'ACTION',\n          name: 'Export Marketplace Feed',\n          action: { moduleName: 'data.export', operation: 'exportMarketplaceProductFeed' },\n          retry: { maximumAttempts: 3, delayMs: 5000 }\n        },\n        {\n          code: 'exportErp',\n          type: 'ACTION',\n          name: 'Export ERP Feed',\n          action: { moduleName: 'data.export', operation: 'exportErpProductFeed' },\n          retry: { maximumAttempts: 3, delayMs: 10000 }\n        },\n        {\n          code: 'exportAnalytics',\n          type: 'ACTION',\n          name: 'Export Analytics File',\n          action: { moduleName: 'data.export', operation: 'exportProductAnalytics' },\n          retry: { maximumAttempts: 2, delayMs: 5000 }\n        },\n        {\n          code: 'markRejected',\n          type: 'ACTION',\n          name: 'Mark Export Rejected',\n          action: { moduleName: 'commerce.product', operation: 'markExportRejected' }\n        },\n        { code: 'end', type: 'END', name: 'End' }\n      ],\n      transitions: [\n        { code: 'start_to_prepare', source: 'start', target: 'prepareExportContext' },\n        { code: 'prepare_to_aggregate', source: 'prepareExportContext', target: 'aggregateProductData' },\n        { code: 'aggregate_to_review', source: 'aggregateProductData', target: 'reviewExport' },\n        { code: 'review_to_decision', source: 'reviewExport', target: 'approvalDecision' },\n        {\n          code: 'approved_to_split',\n          source: 'approvalDecision',\n          target: 'targetSplit',\n          condition: { field: 'approved', equals: true }\n        },\n        { code: 'rejected_to_mark', source: 'approvalDecision', target: 'markRejected', default: true },\n        {\n          code: 'split_to_marketplace',\n          source: 'targetSplit',\n          target: 'exportMarketplace',\n          condition: { field: 'target', equals: 'marketplace' }\n        },\n        {\n          code: 'split_to_erp',\n          source: 'targetSplit',\n          target: 'exportErp',\n          condition: { field: 'target', equals: 'erp' }\n        },\n        { code: 'split_to_analytics', source: 'targetSplit', target: 'exportAnalytics', default: true },\n        { code: 'marketplace_to_end', source: 'exportMarketplace', target: 'end' },\n        { code: 'erp_to_end', source: 'exportErp', target: 'end' },\n        { code: 'analytics_to_end', source: 'exportAnalytics', target: 'end' },\n        { code: 'rejected_to_end', source: 'markRejected', target: 'end' }\n      ]\n    }\n  }]\n};\n```\n\nThis example shows a split to three targets. For two targets, remove one target ACTION node and reconnect the default transition. For more targets, add target ACTION nodes and transitions from `targetSplit`. Keep every target explicit so Axis and operators can see which destination failed or completed.\n\n## Starting the export workflow\n\nThe workflow starts with bounded context. The context should carry business keys and filter intent, not raw query code.\n\n```http\nPOST /nodics/process/v0/instances\nAuthorization: Bearer <access-token>\nx-enterprise-code: default\ncontent-type: application/json\n\n{\n  \"definitionCode\": \"commerceProductExport\",\n  \"instanceCode\": \"product-export-summer-2026\",\n  \"context\": {\n    \"tenant\": \"default\",\n    \"catalogCode\": \"agoraApparelProductCatalog\",\n    \"market\": \"AE\",\n    \"locale\": \"en\",\n    \"targets\": [\"marketplace\", \"erp\", \"analytics\"],\n    \"filters\": {\n      \"categoryCode\": \"summer-shirts\",\n      \"lifecycleState\": \"ONLINE\",\n      \"modifiedSince\": \"2026-08-01T00:00:00.000Z\"\n    },\n    \"requestedBy\": \"admin\",\n    \"correlationId\": \"export-2026-08-28-001\"\n  }\n}\n```\n\n## Data aggregation contract\n\nAggregation belongs to the product or commerce adapter, not to Process. The adapter can call product, pricing, inventory, media, localization, and search projection services through their public service or module contracts.\n\n```js\nmodule.exports = {\n  aggregateProductExportData: async function (request, execution) {\n    const context = execution.context || {};\n    const products = await SERVICE.DefaultProductDiscoveryService.search({\n      tenant: context.tenant,\n      query: {\n        catalogCode: context.catalogCode,\n        market: context.market,\n        locale: context.locale,\n        filters: context.filters\n      }\n    });\n    const prices = await SERVICE.DefaultCustomerPriceSummaryService.getForProducts({\n      tenant: context.tenant,\n      productCodes: products.data.records.map(product => product.code),\n      market: context.market\n    });\n    const availability = await SERVICE.DefaultCustomerAvailabilitySummaryService.getForProducts({\n      tenant: context.tenant,\n      productCodes: products.data.records.map(product => product.code),\n      market: context.market\n    });\n    return {\n      status: 'COMPLETED',\n      output: {\n        productCount: products.data.records.length,\n        priceCount: prices.data.records.length,\n        availabilityCount: availability.data.records.length\n      }\n    };\n  }\n};\n```\n\nThe snippet is intentionally adapter-shaped. Real services may expose slightly different method names by project, but the ownership rule remains the same: Product owns product selection, Pricing owns price decisions, Inventory owns availability, Media owns media references, and Process owns only orchestration evidence.\n\n## Filters and target policies\n\nFilters should be explicit and bounded. A workflow context can carry business filters such as catalog, category, lifecycle state, locale, market, date range, brand, channel, or approval state. It should not carry arbitrary database operators supplied by a browser.\n\n| Filter area | Example | Owner |\n| --- | --- | --- |\n| Catalog scope | `catalogCode: agoraApparelProductCatalog` | Product or catalog module |\n| Publication state | `lifecycleState: ONLINE` | Publish/domain module |\n| Market and locale | `market: AE`, `locale: en` | Commerce and localization |\n| Inventory | `availableOnly: true` | Inventory |\n| Pricing | `priceListCode: retail-ae` | Pricing |\n| Date range | `modifiedSince` | Owning domain service |\n| Target selection | `targets: marketplace, erp, analytics` | Workflow context and target adapters |\n\nTarget adapters should own destination-specific mapping:\n\n## Action adapters\n\nProcess ACTION nodes are safe only when the requested adapter is explicitly registered. This keeps the workflow definition readable while preserving backend control over which service method may execute. The adapter service can call Product, Pricing, Inventory, Media, nExport, or an external provider, but the graph itself never stores executable code.\n\n```js\nmodule.exports = {\n  process: {\n    actionAdapters: {\n      allowedActions: [\n        {\n          moduleName: 'commerce.product',\n          operation: 'aggregateProductExportData',\n          service: 'CommerceProductExportWorkflowAdapterService',\n          method: 'aggregateProductExportData'\n        },\n        {\n          moduleName: 'data.export',\n          operation: 'exportMarketplaceProductFeed',\n          service: 'MarketplaceProductExportAdapterService',\n          method: 'export'\n        },\n        {\n          moduleName: 'data.export',\n          operation: 'exportErpProductFeed',\n          service: 'ErpProductExportAdapterService',\n          method: 'export'\n        },\n        {\n          moduleName: 'data.export',\n          operation: 'exportProductAnalytics',\n          service: 'AnalyticsProductExportAdapterService',\n          method: 'export'\n        }\n      ]\n    }\n  }\n};\n```\n\n## Multi-directional split patterns\n\nThere are two safe ways to model multiple export targets.\n\n| Pattern | Use when | Shape |\n| --- | --- | --- |\n| Explicit target branches | The target list is known and small. | One DECISION node with one ACTION per target. |\n| Sub-process per target | The target list is large, tenant-specific, or needs independent approval/retry. | Parent workflow prepares context; each target starts a child workflow. |\n\nFor two to five stable destinations, explicit branches are easier to inspect. For many partner feeds, child workflows give operators one instance per target and make retries safer.\n\n```mermaid\nflowchart LR\n  Parent[\"Product export parent\"] --> Prepare[\"Prepare and approve\"]\n  Prepare --> Split[\"Start target sub-processes\"]\n  Split --> M1[\"Marketplace export instance\"]\n  Split --> E1[\"ERP export instance\"]\n  Split --> A1[\"Analytics export instance\"]\n  M1 --> Evidence[\"Target receipts\"]\n  E1 --> Evidence\n  A1 --> Evidence\n```\n\n## Customization and extension\n\n| Need | Extension point | Do not do |\n| --- | --- | --- |\n| Add a new export target | Add a target ACTION adapter and transition, or add a target sub-process. | Hide a new target in one generic adapter with no visible workflow state. |\n| Change product selection | Update product/export adapter filter policy. | Put raw database query logic into workflow graph metadata. |\n| Add inventory or pricing enrichment | Call Inventory or Pricing from the aggregation adapter. | Copy Inventory or Pricing data into Process records. |\n| Require approval by target | Add target-specific TASK nodes or child workflows. | Use one approval result for all targets when policies differ. |\n| Change retry behavior | Declare bounded retry on target ACTION nodes. | Retry silently inside adapters without Process incident evidence. |\n| Add destination credentials | Store secrets in provider configuration. | Put credentials or URLs into process graph JSON. |\n| Export file rendering | Use `nExport` or target-owned renderer services. | Make Process format CSV, JSON, Excel, or provider payloads directly. |\n\n## Error and recovery\n\nEach target ACTION can fail independently. Process records the failed node, adapter, definition version, instance, error code, attempt, retry policy, compensation adapter, and redacted evidence. Operators should see whether the marketplace export failed while ERP and analytics completed, or whether the aggregation step failed before any target ran.\n\nFor critical exports, prefer target sub-processes when one destination should not block another. For single-instance explicit branching, document whether targets run one at a time or whether the parent starts child instances.\n\n## Verification\n\nVerify this workflow at four levels:\n\n1. Graph validation rejects broken nodes, missing transitions, unknown ACTION references, duplicate START nodes, and executable metadata.\n2. Adapter tests prove product aggregation, filter validation, pricing lookup, inventory lookup, media reference handling, target rendering, and bounded output.\n3. Runtime tests start the workflow, complete approval, route to each target, force one target failure, retry it, and confirm audit/incident evidence.\n4. Browser acceptance proves Axis shows the export instance, target status, review task, failure state, retry action, and final receipts clearly.\n\nAfter documentation changes, regenerate and validate the documentation content pack so the Process guide is available through Axis and Online documentation:\n\n```bash\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs test\n```\n\n## Common mistakes\n\n- Treating a workflow as a larger pipeline and losing durable state.\n- Putting product, price, inventory, or media business rules inside Process.\n- Hiding multiple targets behind one opaque export action.\n- Passing arbitrary database filters from Axis into an adapter.\n- Retrying target delivery inside provider code without Process incident evidence.\n- Storing provider URLs, credentials, or executable handler names in the graph.\n",
      "previous": {
        "title": "Runtime Instance and Task Lifecycle",
        "route": "/docs/framework/process/runtime-lifecycle"
      },
      "next": {
        "title": "Build Your First Workflow",
        "route": "/docs/framework/process/first-workflow"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 2013,
        "checksum": "a4148490023d574a4152927260ce3bb64d2a3f084398792a345c46778f0d7eb5"
      },
      "slug": "workflow-orchestration-patterns",
      "locale": "en",
      "navigationGroup": "Runtime Lifecycle",
      "navigationGroupCode": "runtime-lifecycle",
      "navigationGroupOrder": 20,
      "navigationOrder": 25,
      "references": [
        {
          "documentId": "process.overview",
          "owner": "workflow"
        },
        {
          "documentId": "process.runtime-lifecycle",
          "owner": "workflow"
        },
        {
          "documentId": "process.action-adapters",
          "owner": "workflow"
        },
        {
          "documentId": "process.incident-recovery",
          "owner": "workflow"
        },
        {
          "documentId": "pipeline.business-logic-orchestration",
          "owner": "pipeline"
        },
        {
          "documentId": "data.import-export-migration",
          "owner": "import"
        },
        {
          "documentId": "catalog.product-discovery-management",
          "owner": "product"
        },
        {
          "documentId": "pricing.promotions-tax-management",
          "owner": "pricing"
        },
        {
          "documentId": "inventory.stock-management",
          "owner": "inventory"
        }
      ]
    },
    "active": true
  },
  "record6": {
    "code": "nodicsDocsComponentprocessFirstWorkflow",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.first-workflow",
      "title": "Build Your First Workflow",
      "route": "/docs/framework/process/first-workflow",
      "section": "process-and-workflow-automation",
      "sectionTitle": "Process and Workflow Automation",
      "group": "process-and-workflow-automation",
      "groupTitle": "Process and Workflow Automation",
      "parentId": "process-and-workflow-automation",
      "hierarchyPath": [
        "Process and Workflow Automation",
        "Build Your First Workflow"
      ],
      "hierarchyDepth": 2,
      "documentType": "quickstart",
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
      "summary": "Create a first Process workflow from START through TASK, DECISION, ACTION, TIMER, SUB_PROCESS, and END with beginner-safe examples.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "process.overview",
        "process.first-human-task",
        "process.workflow-orchestration-patterns"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "lifecycle-state-diagram",
        "table",
        "code-example"
      ],
      "searchKeywords": [
        "process-and-workflow-automation",
        "workflow-getting-started",
        "build-your-first-workflow"
      ],
      "topicKeywords": [
        "Process and Workflow Automation",
        "Workflow Getting Started",
        "Build Your First Workflow"
      ],
      "headings": [
        {
          "text": "What you are building",
          "anchor": "processFirstWorkflow-1-what-you-are-building",
          "level": 2
        },
        {
          "text": "Step 1: create a draft definition",
          "anchor": "processFirstWorkflow-2-step-1-create-a-draft-definition",
          "level": 2
        },
        {
          "text": "Step 2: understand the nodes",
          "anchor": "processFirstWorkflow-3-step-2-understand-the-nodes",
          "level": 2
        },
        {
          "text": "Step 3: connect the nodes",
          "anchor": "processFirstWorkflow-4-step-3-connect-the-nodes",
          "level": 2
        },
        {
          "text": "Step 4: save, validate, publish",
          "anchor": "processFirstWorkflow-5-step-4-save-validate-publish",
          "level": 2
        },
        {
          "text": "Common beginner mistakes",
          "anchor": "processFirstWorkflow-6-common-beginner-mistakes",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processFirstWorkflow-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processFirstWorkflow-8-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This guide is for someone opening Nodics for the first time. The goal is not to teach every automation feature at once. The goal is to help you create one small workflow, understand why each step exists, and know where to look when something does not validate."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What you are building",
          "anchor": "processFirstWorkflow-1-what-you-are-building"
        },
        {
          "kind": "paragraph",
          "text": "You will build a simple content approval process:"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Start[\"START\"] --> Review[\"TASK: Review content\"]\n  Review --> Decision[\"DECISION: Approved?\"]\n  Decision -->|approved=true| Notify[\"ACTION: nodics.process.noop\"]\n  Decision -->|default| End[\"END\"]\n  Notify --> Timer[\"TIMER: audit pause\"]\n  Timer --> Child[\"SUB_PROCESS: optional governance\"]\n  Child --> End"
        },
        {
          "kind": "paragraph",
          "text": "The workflow is intentionally small, but it introduces the same building blocks used by larger commerce, telco, logistics, onboarding, support, and publishing processes."
        },
        {
          "kind": "paragraph",
          "text": "After this first workflow works, use `Workflow Orchestration Patterns` for enterprise flows such as product export. That guide shows how a workflow can aggregate Product, Pricing, Inventory, and Media data, apply filters, split to multiple export targets, and use target adapters while Process keeps only orchestration state and audit evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Step 1: create a draft definition",
          "anchor": "processFirstWorkflow-2-step-1-create-a-draft-definition"
        },
        {
          "kind": "paragraph",
          "text": "In Axis, open Business Process & Automation, then open Workflows or Designer. Create a beginner-safe process draft. Give it a stable code such as `contentApproval`."
        },
        {
          "kind": "paragraph",
          "text": "Stable code matters because integrations, audit events, tests, and customer extensions refer to codes. Display names can change; codes should not change casually."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Step 2: understand the nodes",
          "anchor": "processFirstWorkflow-3-step-2-understand-the-nodes"
        },
        {
          "kind": "table",
          "headers": [
            "Node type",
            "Beginner meaning",
            "Runtime owner"
          ],
          "rows": [
            [
              "`START`",
              "Where the process begins.",
              "Process"
            ],
            [
              "`TASK`",
              "Human work, such as review, approval, or correction.",
              "Process"
            ],
            [
              "`DECISION`",
              "Chooses the next path using declared decision data.",
              "Process"
            ],
            [
              "`ACTION`",
              "Calls an explicitly allowed domain adapter.",
              "Process orchestrates; domain module owns business logic."
            ],
            [
              "`TIMER`",
              "Represents a wait, schedule boundary, or SLA checkpoint.",
              "Process records intent; Cron can schedule real execution."
            ],
            [
              "`SUB_PROCESS`",
              "References another governed workflow definition.",
              "Process"
            ],
            [
              "`END`",
              "Marks the instance complete.",
              "Process"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Axis edits these nodes visually, but the backend validator decides whether the graph is valid."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Step 3: connect the nodes",
          "anchor": "processFirstWorkflow-4-step-3-connect-the-nodes"
        },
        {
          "kind": "paragraph",
          "text": "Every transition must have:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "a stable transition code;",
            "a source node;",
            "a target node;",
            "no transition from `END`;",
            "no transition into `START`."
          ]
        },
        {
          "kind": "paragraph",
          "text": "For a `DECISION` node, every outgoing path should either declare a condition or be marked as the default path. Example:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"code\": \"decision_to_notify\",\n  \"source\": \"approvalDecision\",\n  \"target\": \"notify\",\n  \"condition\": { \"field\": \"approved\", \"equals\": true }\n}"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Step 4: save, validate, publish",
          "anchor": "processFirstWorkflow-5-step-4-save-validate-publish"
        },
        {
          "kind": "paragraph",
          "text": "Save stores the draft graph. Validate asks nodics.process to inspect the graph. Publish creates an immutable version that can run. A running instance should always point to a published version, not a mutable draft."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant User as Business user\n  participant Axis\n  participant Process as nodics.process\n  User->>Axis: Edit graph\n  Axis->>Process: Save draft graph\n  User->>Axis: Validate\n  Axis->>Process: Validate backend contract\n  User->>Axis: Publish\n  Axis->>Process: Create immutable version"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common beginner mistakes",
          "anchor": "processFirstWorkflow-6-common-beginner-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Creating two `START` nodes.",
            "Forgetting an `END` node.",
            "Connecting a transition to a deleted node.",
            "Adding an `ACTION` node without a registered adapter.",
            "Putting JavaScript, URLs, or file paths inside action metadata.",
            "Expecting Axis to execute the process locally."
          ]
        },
        {
          "kind": "paragraph",
          "text": "When validation fails, fix the graph and validate again. Do not bypass the backend validator."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processFirstWorkflow-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Publishing disconnected graphs, bypassing validation, or embedding executable implementation details in nodes.",
            "Assuming Axis owns persistence or that every business action belongs in Process."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processFirstWorkflow-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Validate and publish the definition through Process APIs, start an instance, complete each supported node path, reject malformed graphs, and confirm lifecycle and audit projections after restart. A developer and production operator should verify the same published definition and recovery evidence."
        }
      ],
      "searchText": "Build Your First Workflow Create a first Process workflow from START through TASK, DECISION, ACTION, TIMER, SUB_PROCESS, and END with beginner-safe examples. # Build Your First Workflow\n\nThis guide is for someone opening Nodics for the first time. The goal is not to teach every automation feature at once. The goal is to help you create one small workflow, understand why each step exists, and know where to look when something does not validate.\n\n## What you are building\n\nYou will build a simple content approval process:\n\n```mermaid\nflowchart LR\n  Start[\"START\"] --> Review[\"TASK: Review content\"]\n  Review --> Decision[\"DECISION: Approved?\"]\n  Decision -->|approved=true| Notify[\"ACTION: nodics.process.noop\"]\n  Decision -->|default| End[\"END\"]\n  Notify --> Timer[\"TIMER: audit pause\"]\n  Timer --> Child[\"SUB_PROCESS: optional governance\"]\n  Child --> End\n```\n\nThe workflow is intentionally small, but it introduces the same building blocks used by larger commerce, telco, logistics, onboarding, support, and publishing processes.\n\nAfter this first workflow works, use `Workflow Orchestration Patterns` for enterprise flows such as product export. That guide shows how a workflow can aggregate Product, Pricing, Inventory, and Media data, apply filters, split to multiple export targets, and use target adapters while Process keeps only orchestration state and audit evidence.\n\n## Step 1: create a draft definition\n\nIn Axis, open Business Process & Automation, then open Workflows or Designer. Create a beginner-safe process draft. Give it a stable code such as `contentApproval`.\n\nStable code matters because integrations, audit events, tests, and customer extensions refer to codes. Display names can change; codes should not change casually.\n\n## Step 2: understand the nodes\n\n| Node type | Beginner meaning | Runtime owner |\n| --- | --- | --- |\n| `START` | Where the process begins. | Process |\n| `TASK` | Human work, such as review, approval, or correction. | Process |\n| `DECISION` | Chooses the next path using declared decision data. | Process |\n| `ACTION` | Calls an explicitly allowed domain adapter. | Process orchestrates; domain module owns business logic. |\n| `TIMER` | Represents a wait, schedule boundary, or SLA checkpoint. | Process records intent; Cron can schedule real execution. |\n| `SUB_PROCESS` | References another governed workflow definition. | Process |\n| `END` | Marks the instance complete. | Process |\n\nAxis edits these nodes visually, but the backend validator decides whether the graph is valid.\n\n## Step 3: connect the nodes\n\nEvery transition must have:\n\n- a stable transition code;\n- a source node;\n- a target node;\n- no transition from `END`;\n- no transition into `START`.\n\nFor a `DECISION` node, every outgoing path should either declare a condition or be marked as the default path. Example:\n\n```json\n{\n  \"code\": \"decision_to_notify\",\n  \"source\": \"approvalDecision\",\n  \"target\": \"notify\",\n  \"condition\": { \"field\": \"approved\", \"equals\": true }\n}\n```\n\n## Step 4: save, validate, publish\n\nSave stores the draft graph. Validate asks nodics.process to inspect the graph. Publish creates an immutable version that can run. A running instance should always point to a published version, not a mutable draft.\n\n```mermaid\nsequenceDiagram\n  participant User as Business user\n  participant Axis\n  participant Process as nodics.process\n  User->>Axis: Edit graph\n  Axis->>Process: Save draft graph\n  User->>Axis: Validate\n  Axis->>Process: Validate backend contract\n  User->>Axis: Publish\n  Axis->>Process: Create immutable version\n```\n\n## Common beginner mistakes\n\n- Creating two `START` nodes.\n- Forgetting an `END` node.\n- Connecting a transition to a deleted node.\n- Adding an `ACTION` node without a registered adapter.\n- Putting JavaScript, URLs, or file paths inside action metadata.\n- Expecting Axis to execute the process locally.\n\nWhen validation fails, fix the graph and validate again. Do not bypass the backend validator.\n\n## Common mistakes\n\n- Publishing disconnected graphs, bypassing validation, or embedding executable implementation details in nodes.\n- Assuming Axis owns persistence or that every business action belongs in Process.\n\n## Verification\n\nValidate and publish the definition through Process APIs, start an instance, complete each supported node path, reject malformed graphs, and confirm lifecycle and audit projections after restart. A developer and production operator should verify the same published definition and recovery evidence.\n",
      "previous": {
        "title": "Workflow Orchestration Patterns",
        "route": "/docs/framework/process/workflow-orchestration-patterns"
      },
      "next": {
        "title": "Build Your First Human Task Flow",
        "route": "/docs/framework/process/first-human-task"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 581,
        "checksum": "09b22fba914db118cabfc4db6d86832d50d3193ea3bf7efd869651318a43b9a0"
      },
      "slug": "first-workflow",
      "locale": "en",
      "navigationGroup": "Workflow Getting Started",
      "navigationGroupCode": "workflow-getting-started",
      "navigationGroupOrder": 30,
      "navigationOrder": 30,
      "references": [
        {
          "documentId": "process.overview",
          "owner": "workflow"
        },
        {
          "documentId": "process.first-human-task",
          "owner": "workflow"
        },
        {
          "documentId": "process.workflow-orchestration-patterns",
          "owner": "workflow"
        }
      ]
    },
    "active": true
  },
  "record7": {
    "code": "nodicsDocsComponentprocessFirstHumanTask",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.first-human-task",
      "title": "Build Your First Human Task Flow",
      "route": "/docs/framework/process/first-human-task",
      "section": "process-and-workflow-automation",
      "sectionTitle": "Process and Workflow Automation",
      "group": "process-and-workflow-automation",
      "groupTitle": "Process and Workflow Automation",
      "parentId": "process-and-workflow-automation",
      "hierarchyPath": [
        "Process and Workflow Automation",
        "Build Your First Human Task Flow"
      ],
      "hierarchyDepth": 2,
      "documentType": "how-to",
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
      "summary": "Understand task lifecycle, assignment, Axis presentation, and customer customization for human workflow steps.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.19",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "process.first-workflow",
        "process.visual-designer"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "lifecycle-state-diagram",
        "table"
      ],
      "searchKeywords": [
        "process-and-workflow-automation",
        "human-task-flow",
        "build-your-first-human-task-flow"
      ],
      "topicKeywords": [
        "Process and Workflow Automation",
        "Human Task Flow",
        "Build Your First Human Task Flow"
      ],
      "headings": [
        {
          "text": "Example business scenario",
          "anchor": "processFirstHumanTask-1-example-business-scenario",
          "level": 2
        },
        {
          "text": "Task fields you should understand",
          "anchor": "processFirstHumanTask-2-task-fields-you-should-understand",
          "level": 2
        },
        {
          "text": "How Axis should present task work",
          "anchor": "processFirstHumanTask-3-how-axis-should-present-task-work",
          "level": 2
        },
        {
          "text": "Backend-owned approval decisions",
          "anchor": "processFirstHumanTask-4-backend-owned-approval-decisions",
          "level": 3
        },
        {
          "text": "Developer customization",
          "anchor": "processFirstHumanTask-5-developer-customization",
          "level": 2
        },
        {
          "text": "End-to-end task example",
          "anchor": "processFirstHumanTask-6-end-to-end-task-example",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processFirstHumanTask-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "processFirstHumanTask-8-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processFirstHumanTask-9-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "For governed reviewer tasks, claim now uses the stored actor policy before writing: the reviewer must have current enterprise/permission authority and cannot be the requester. A claim cannot select another reviewer as a shortcut around assignment. Concurrent changes reject rather than returning a fabricated claimed task. Inspect the actual stored task after an uncertain response. Completion binds the inspected assignee and instance/node. This does not establish atomic cancellation across an instance and its tasks; cross-owner lifecycle acceptance remains separate."
        },
        {
          "kind": "paragraph",
          "text": "Completion and cancellation require an acknowledged single task write followed by fresh owner readback before audit or advancement. Failed responses or changed decision/actor/timestamp refuse success. Generic task and instance cancellation cannot cancel governed actor-policy reviews: the owning domain must first define its withdrawal/cancellation contract. This does not yet implement application withdrawal, expiry or resubmission by itself. Profile owns those domain commands. Process adds a separately default-disabled signed-source retirement route for exact closed review correlation. It cancels the waiting task with CAS before retiring its instance, recovers only matching own closure evidence, and refuses completed competing decisions or in-flight remote actions. Private persistence hooks guard retirement markers. This is staged reconciliation, not a cross-owner transaction; inspect uncertain outcomes using the source owner's recovery command."
        },
        {
          "kind": "paragraph",
          "text": "Human tasks are the bridge between automation and people. A task tells an operator, reviewer, merchandiser, support agent, or approver what needs human attention."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Example business scenario",
          "anchor": "processFirstHumanTask-1-example-business-scenario"
        },
        {
          "kind": "paragraph",
          "text": "A content editor changes a page. The change should not go live until someone reviews it. The process creates a task called `Review content`. The reviewer can claim it, assign it, or complete it. Generic cancellation is available only for non-governed tasks; governed reviews require a domain-owned cancellation contract."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "stateDiagram-v2\n  [*] --> OPEN\n  OPEN --> CLAIMED: claim\n  OPEN --> COMPLETED: complete\n  CLAIMED --> COMPLETED: complete\n  OPEN --> CANCELLED: cancel\n  CLAIMED --> CANCELLED: cancel"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Task fields you should understand",
          "anchor": "processFirstHumanTask-2-task-fields-you-should-understand"
        },
        {
          "kind": "table",
          "headers": [
            "Field",
            "Why it matters"
          ],
          "rows": [
            [
              "`code`",
              "Stable task identifier for audit and support."
            ],
            [
              "`instanceCode`",
              "Links the task to the running process instance."
            ],
            [
              "`nodeCode`",
              "Shows which workflow step produced the task."
            ],
            [
              "`assignee`",
              "Person, queue, or group expected to work on it."
            ],
            [
              "`status`",
              "Current state such as `OPEN`, `CLAIMED`, or `COMPLETED`."
            ],
            [
              "`dueAt`",
              "Optional SLA date for operations."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "How Axis should present task work",
          "anchor": "processFirstHumanTask-3-how-axis-should-present-task-work"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Backend-owned approval decisions",
          "anchor": "processFirstHumanTask-4-backend-owned-approval-decisions"
        },
        {
          "kind": "paragraph",
          "text": "Process task list, task detail and instance-detail tasks may contain this exact read-only decision contract:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"contractVersion\": 1,\n  \"kind\": \"APPROVAL\",\n  \"approveLabel\": \"Approve\",\n  \"rejectLabel\": \"Reject\",\n  \"reasonLabel\": \"Reason\",\n  \"rejectionReasonRequired\": true,\n  \"maximumReasonLength\": 1000\n}"
        },
        {
          "kind": "paragraph",
          "text": "Process derives it from the stored task's instance and immutable published definition version, then the effective task-node actor or decision policy. Node policy overrides version policy. A complete three-field actor policy or an owner-declared `policy.decisionContract` determines this contract; a permission, task name, code prefix or assignee alone cannot. Stored or caller-supplied decision contracts are not authority. Legacy tasks with neither pinned declaration have no decisionContract."
        },
        {
          "kind": "paragraph",
          "text": "Axis renders the supplied labels and collects `{ approved: boolean, reason?: string }` through the existing Process completion API. Rejection needs a nonblank reason; provided reasons must not exceed 1000 characters. Process retains independent task admission, state and transition enforcement. The pinned actor policy, where present, separately enforces authenticated human review, tenant, enterprise, permission and no-self-review. A decision descriptor alone does not grant these protections or manufacture requester context. Seeing the contract does not mean the viewer can approve. No Profile callback should be called directly from the browser."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Task[Stored task] --> Instance[Stored instance]\n  Instance --> Version[Pinned published version]\n  Version --> Policy[Effective task-node actor or decision policy]\n  Policy --> Contract[Read-only decision contract]\n  Contract --> Axis[Axis approve or reject]\n  Axis --> Complete[Process completion admission]"
        },
        {
          "kind": "paragraph",
          "text": "Process reads instance/version evidence freshly within the authorized tenant, requires one successful matching record, and bounds projection to 100 tasks. Missing, failed, ambiguous or mismatched evidence rejects the read instead of inventing approval controls. Inspect the original stored task/version and owner diagnostic before retrying. After uncertain completion, inspect state rather than automatically repeating the decision. These source fixtures do not certify installed provider behavior or live browser acceptance."
        },
        {
          "kind": "paragraph",
          "text": "An owner can add this exact seven-field declaration in a new qualified immutable version of its existing definition. Contract version, kind, rejection requirement and maximum length remain fixed as shown above; labels must be nonblank and at most 200 characters. There is no purpose/category expansion. Existing waiting instances stay pinned to their original version. A migration needs separately governed cancellation and confirmed old task/instance state before a fresh domain request. Do not edit the waiting instance or use generic completion to migrate. The projection fixtures do not validate that migration."
        },
        {
          "kind": "paragraph",
          "text": "Axis should show tasks as business work, not as raw database rows. A good task screen answers:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "What process created this task?",
            "What business object is affected?",
            "Who owns it now?",
            "What action can I take safely?",
            "What happened before this task?"
          ]
        },
        {
          "kind": "paragraph",
          "text": "The detail timeline answers the fifth question by reading Process audit events."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer customization",
          "anchor": "processFirstHumanTask-5-developer-customization"
        },
        {
          "kind": "paragraph",
          "text": "Customer modules can customize assignment without editing standard Process source. For example:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "route enterprise onboarding approvals to an enterprise admin queue;",
            "route product publishing approvals to merchandising;",
            "route logistics exceptions to warehouse operations;",
            "route refund approval tasks to finance."
          ]
        },
        {
          "kind": "paragraph",
          "text": "The customization should live in the customer or domain module, not in Axis. Axis renders authorized actions; Process owns task lifecycle."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "End-to-end task example",
          "anchor": "processFirstHumanTask-6-end-to-end-task-example"
        },
        {
          "kind": "paragraph",
          "text": "Consider a high-value refund that requires finance approval. The Order module owns refund eligibility and the Payment module owns provider execution. Process creates the approval task with bounded business references, candidate group, due date, and expected outcome choices. It does not copy the full Order or payment credentials into task data."
        },
        {
          "kind": "paragraph",
          "text": "An authorized finance user opens Axis, claims the task, reviews backend-owned context, and chooses approve or reject. The claim request includes the current task version so two users cannot both become the assignee. Completion includes the expected task state, chosen outcome, correlation identifier, and a bounded comment. Process records the transition and invokes the next registered domain adapter; Axis does not calculate the next node."
        },
        {
          "kind": "table",
          "headers": [
            "Test path",
            "Expected result",
            "Evidence"
          ],
          "rows": [
            [
              "Authorized claim",
              "Task becomes assigned once.",
              "Assignee, version, timestamp, and audit event"
            ],
            [
              "Competing claim",
              "Stale request is rejected.",
              "Stable conflict code and unchanged assignee"
            ],
            [
              "Unauthorized completion",
              "No state or domain side effect changes.",
              "Permission denial and security audit"
            ],
            [
              "Valid approval",
              "Process advances to the approved path.",
              "Completion event and next-node correlation"
            ],
            [
              "Expired task",
              "Policy-driven escalation or rejection occurs.",
              "Due-date evaluation and escalation evidence"
            ],
            [
              "Runtime restart",
              "Open task remains available in the same state.",
              "Durable task and process instance projection"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Operators should monitor open-task age, overdue volume, claim conflicts, completion latency, failed continuations, and escalation backlog. Alerts must identify the tenant and stable task or process reference without exposing sensitive task payloads. A business administrator may change assignment policy through a governed definition or customer configuration, but cannot bypass permissions or rewrite completed history."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processFirstHumanTask-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Letting the browser assign, complete, or reopen tasks without backend validation and expected-state checks.",
            "Omitting tenant, permission, correlation, expiry, escalation, or audit requirements."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "processFirstHumanTask-8-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Keep overrides in a project-owned module that extends Workflow, for example `modules/companyWorkflow/src/service/operation/defaultProcessRuntimeLifecycleService.js`. The existing exported `taskDecisionContract` helper is a presentation extension point; `projectTaskDecisions` remains responsible for fresh pinned-source reads. An inherited-helper override can change a label without introducing an actor policy or changing completion authority:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "// Within the customer's existing inherited-service override pattern:\nconst contract = inheritedTaskDecisionContract.call(this, policy);\nreturn contract ? { ...contract, approveLabel: \"Confirm approval\" } : undefined;"
        },
        {
          "kind": "paragraph",
          "text": "Resolve `inheritedTaskDecisionContract` through the project's established service extension mechanism, not a copied Process implementation. Labels must be nonblank and no longer than 200 characters for Axis. Keep the exact contract shape, rejection-reason requirement and 1000-character ceiling. Do not derive authority from labels or change requester/enterprise admission in a presentation override."
        },
        {
          "kind": "paragraph",
          "text": "Changes to domain reviewer policy require a newly qualified published version; existing instances retain their original version. The generic labels above need no Profile metadata. Domain owners may declare the approved seven-field `policy.decisionContract` in a newly qualified version, not modify released data. Test unchanged legacy omission, valid and malformed pinned actor policy, node precedence, foreign/missing version evidence, blank or oversized rejection, uncertain completion inspection and inherited customization. The isolated `processTaskDecisionContract.test.js` fixture covers source projection; installed provider and browser decisions remain separate acceptance steps."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processFirstHumanTask-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Create a task, test authorized claim and completion, reject an unauthorized actor and stale update, then confirm assignment history, process continuation, and operator-visible audit evidence. This is the minimum beginner verification before adding assignment customization."
        }
      ],
      "searchText": "Build Your First Human Task Flow Understand task lifecycle, assignment, Axis presentation, and customer customization for human workflow steps. # Build Your First Human Task Flow\n\nFor governed reviewer tasks, claim now uses the stored actor policy before writing: the reviewer must have current enterprise/permission authority and cannot be the requester. A claim cannot select another reviewer as a shortcut around assignment. Concurrent changes reject rather than returning a fabricated claimed task. Inspect the actual stored task after an uncertain response. Completion binds the inspected assignee and instance/node. This does not establish atomic cancellation across an instance and its tasks; cross-owner lifecycle acceptance remains separate.\n\nCompletion and cancellation require an acknowledged single task write followed by fresh owner readback before audit or advancement. Failed responses or changed decision/actor/timestamp refuse success. Generic task and instance cancellation cannot cancel governed actor-policy reviews: the owning domain must first define its withdrawal/cancellation contract. This does not yet implement application withdrawal, expiry or resubmission by itself. Profile owns those domain commands. Process adds a separately default-disabled signed-source retirement route for exact closed review correlation. It cancels the waiting task with CAS before retiring its instance, recovers only matching own closure evidence, and refuses completed competing decisions or in-flight remote actions. Private persistence hooks guard retirement markers. This is staged reconciliation, not a cross-owner transaction; inspect uncertain outcomes using the source owner's recovery command.\n\nHuman tasks are the bridge between automation and people. A task tells an operator, reviewer, merchandiser, support agent, or approver what needs human attention.\n\n## Example business scenario\n\nA content editor changes a page. The change should not go live until someone reviews it. The process creates a task called `Review content`. The reviewer can claim it, assign it, or complete it. Generic cancellation is available only for non-governed tasks; governed reviews require a domain-owned cancellation contract.\n\n```mermaid\nstateDiagram-v2\n  [*] --> OPEN\n  OPEN --> CLAIMED: claim\n  OPEN --> COMPLETED: complete\n  CLAIMED --> COMPLETED: complete\n  OPEN --> CANCELLED: cancel\n  CLAIMED --> CANCELLED: cancel\n```\n\n## Task fields you should understand\n\n| Field | Why it matters |\n| --- | --- |\n| `code` | Stable task identifier for audit and support. |\n| `instanceCode` | Links the task to the running process instance. |\n| `nodeCode` | Shows which workflow step produced the task. |\n| `assignee` | Person, queue, or group expected to work on it. |\n| `status` | Current state such as `OPEN`, `CLAIMED`, or `COMPLETED`. |\n| `dueAt` | Optional SLA date for operations. |\n\n## How Axis should present task work\n\n### Backend-owned approval decisions\n\nProcess task list, task detail and instance-detail tasks may contain this exact read-only decision contract:\n\n```json\n{\n  \"contractVersion\": 1,\n  \"kind\": \"APPROVAL\",\n  \"approveLabel\": \"Approve\",\n  \"rejectLabel\": \"Reject\",\n  \"reasonLabel\": \"Reason\",\n  \"rejectionReasonRequired\": true,\n  \"maximumReasonLength\": 1000\n}\n```\n\nProcess derives it from the stored task's instance and immutable published definition version, then the effective task-node actor or decision policy. Node policy overrides version policy. A complete three-field actor policy or an owner-declared `policy.decisionContract` determines this contract; a permission, task name, code prefix or assignee alone cannot. Stored or caller-supplied decision contracts are not authority. Legacy tasks with neither pinned declaration have no decisionContract.\n\nAxis renders the supplied labels and collects `{ approved: boolean, reason?: string }` through the existing Process completion API. Rejection needs a nonblank reason; provided reasons must not exceed 1000 characters. Process retains independent task admission, state and transition enforcement. The pinned actor policy, where present, separately enforces authenticated human review, tenant, enterprise, permission and no-self-review. A decision descriptor alone does not grant these protections or manufacture requester context. Seeing the contract does not mean the viewer can approve. No Profile callback should be called directly from the browser.\n\n```mermaid\nflowchart LR\n  Task[Stored task] --> Instance[Stored instance]\n  Instance --> Version[Pinned published version]\n  Version --> Policy[Effective task-node actor or decision policy]\n  Policy --> Contract[Read-only decision contract]\n  Contract --> Axis[Axis approve or reject]\n  Axis --> Complete[Process completion admission]\n```\n\nProcess reads instance/version evidence freshly within the authorized tenant, requires one successful matching record, and bounds projection to 100 tasks. Missing, failed, ambiguous or mismatched evidence rejects the read instead of inventing approval controls. Inspect the original stored task/version and owner diagnostic before retrying. After uncertain completion, inspect state rather than automatically repeating the decision. These source fixtures do not certify installed provider behavior or live browser acceptance.\n\nAn owner can add this exact seven-field declaration in a new qualified immutable version of its existing definition. Contract version, kind, rejection requirement and maximum length remain fixed as shown above; labels must be nonblank and at most 200 characters. There is no purpose/category expansion. Existing waiting instances stay pinned to their original version. A migration needs separately governed cancellation and confirmed old task/instance state before a fresh domain request. Do not edit the waiting instance or use generic completion to migrate. The projection fixtures do not validate that migration.\n\nAxis should show tasks as business work, not as raw database rows. A good task screen answers:\n\n1. What process created this task?\n2. What business object is affected?\n3. Who owns it now?\n4. What action can I take safely?\n5. What happened before this task?\n\nThe detail timeline answers the fifth question by reading Process audit events.\n\n## Developer customization\n\nCustomer modules can customize assignment without editing standard Process source. For example:\n\n- route enterprise onboarding approvals to an enterprise admin queue;\n- route product publishing approvals to merchandising;\n- route logistics exceptions to warehouse operations;\n- route refund approval tasks to finance.\n\nThe customization should live in the customer or domain module, not in Axis. Axis renders authorized actions; Process owns task lifecycle.\n\n## End-to-end task example\n\nConsider a high-value refund that requires finance approval. The Order module owns refund eligibility and the Payment module owns provider execution. Process creates the approval task with bounded business references, candidate group, due date, and expected outcome choices. It does not copy the full Order or payment credentials into task data.\n\nAn authorized finance user opens Axis, claims the task, reviews backend-owned context, and chooses approve or reject. The claim request includes the current task version so two users cannot both become the assignee. Completion includes the expected task state, chosen outcome, correlation identifier, and a bounded comment. Process records the transition and invokes the next registered domain adapter; Axis does not calculate the next node.\n\n| Test path | Expected result | Evidence |\n| --- | --- | --- |\n| Authorized claim | Task becomes assigned once. | Assignee, version, timestamp, and audit event |\n| Competing claim | Stale request is rejected. | Stable conflict code and unchanged assignee |\n| Unauthorized completion | No state or domain side effect changes. | Permission denial and security audit |\n| Valid approval | Process advances to the approved path. | Completion event and next-node correlation |\n| Expired task | Policy-driven escalation or rejection occurs. | Due-date evaluation and escalation evidence |\n| Runtime restart | Open task remains available in the same state. | Durable task and process instance projection |\n\nOperators should monitor open-task age, overdue volume, claim conflicts, completion latency, failed continuations, and escalation backlog. Alerts must identify the tenant and stable task or process reference without exposing sensitive task payloads. A business administrator may change assignment policy through a governed definition or customer configuration, but cannot bypass permissions or rewrite completed history.\n\n## Common mistakes\n\n- Letting the browser assign, complete, or reopen tasks without backend validation and expected-state checks.\n- Omitting tenant, permission, correlation, expiry, escalation, or audit requirements.\n\n## Customize and extend safely\n\nKeep overrides in a project-owned module that extends Workflow, for example `modules/companyWorkflow/src/service/operation/defaultProcessRuntimeLifecycleService.js`. The existing exported `taskDecisionContract` helper is a presentation extension point; `projectTaskDecisions` remains responsible for fresh pinned-source reads. An inherited-helper override can change a label without introducing an actor policy or changing completion authority:\n\n```js\n// Within the customer's existing inherited-service override pattern:\nconst contract = inheritedTaskDecisionContract.call(this, policy);\nreturn contract ? { ...contract, approveLabel: \"Confirm approval\" } : undefined;\n```\n\nResolve `inheritedTaskDecisionContract` through the project's established service extension mechanism, not a copied Process implementation. Labels must be nonblank and no longer than 200 characters for Axis. Keep the exact contract shape, rejection-reason requirement and 1000-character ceiling. Do not derive authority from labels or change requester/enterprise admission in a presentation override.\n\nChanges to domain reviewer policy require a newly qualified published version; existing instances retain their original version. The generic labels above need no Profile metadata. Domain owners may declare the approved seven-field `policy.decisionContract` in a newly qualified version, not modify released data. Test unchanged legacy omission, valid and malformed pinned actor policy, node precedence, foreign/missing version evidence, blank or oversized rejection, uncertain completion inspection and inherited customization. The isolated `processTaskDecisionContract.test.js` fixture covers source projection; installed provider and browser decisions remain separate acceptance steps.\n\n## Verification\n\nCreate a task, test authorized claim and completion, reject an unauthorized actor and stale update, then confirm assignment history, process continuation, and operator-visible audit evidence. This is the minimum beginner verification before adding assignment customization.\n",
      "previous": {
        "title": "Build Your First Workflow",
        "route": "/docs/framework/process/first-workflow"
      },
      "next": {
        "title": "Business Value and Adoption Model",
        "route": "/docs/framework/process/business-value"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 1405,
        "checksum": "86e5ef5d425ad83c254914b90e86415243c93dc99029bb152ddab67e7dd43eda"
      },
      "slug": "first-human-task",
      "locale": "en",
      "navigationGroup": "Human Task Flow",
      "navigationGroupCode": "human-task-flow",
      "navigationGroupOrder": 40,
      "navigationOrder": 40,
      "references": [
        {
          "documentId": "process.first-workflow",
          "owner": "workflow"
        },
        {
          "documentId": "process.visual-designer",
          "owner": "workflow"
        }
      ]
    },
    "active": true
  },
  "record8": {
    "code": "nodicsDocsComponentprocessBusinessValue",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.business-value",
      "title": "Business Value and Adoption Model",
      "route": "/docs/framework/process/business-value",
      "section": "process-and-workflow-automation",
      "sectionTitle": "Process and Workflow Automation",
      "group": "process-and-workflow-automation",
      "groupTitle": "Process and Workflow Automation",
      "parentId": "process-and-workflow-automation",
      "hierarchyPath": [
        "Process and Workflow Automation",
        "Business Value and Adoption Model"
      ],
      "hierarchyDepth": 2,
      "documentType": "concept",
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
      "summary": "Explain the business problems Process solves, how it lowers operating cost, and how business users should think about automation governance.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "process.overview",
        "process.first-workflow"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "lifecycle-state-diagram",
        "source-map-table",
        "code-example"
      ],
      "searchKeywords": [
        "process-and-workflow-automation",
        "business-value-and-adoption",
        "business-value-and-adoption-model"
      ],
      "topicKeywords": [
        "Process and Workflow Automation",
        "Business Value and Adoption",
        "Business Value and Adoption Model"
      ],
      "headings": [
        {
          "text": "The business problem",
          "anchor": "processBusinessValue-1-the-business-problem",
          "level": 2
        },
        {
          "text": "What Process gives business users",
          "anchor": "processBusinessValue-2-what-process-gives-business-users",
          "level": 2
        },
        {
          "text": "Why this reduces cost",
          "anchor": "processBusinessValue-3-why-this-reduces-cost",
          "level": 2
        },
        {
          "text": "Adoption path",
          "anchor": "processBusinessValue-4-adoption-path",
          "level": 2
        },
        {
          "text": "Business-user acceptance",
          "anchor": "processBusinessValue-5-business-user-acceptance",
          "level": 2
        },
        {
          "text": "Continue",
          "anchor": "processBusinessValue-6-continue",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processBusinessValue-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processBusinessValue-8-verification",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "processBusinessValue-9-customization-and-extension",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Nodics Process exists to make business operations visible, governed, reusable, and changeable without scattering workflow rules across many domain services. A beginner can think of it as the operating playbook for work that crosses people, systems, approvals, time, and exceptions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "The business problem",
          "anchor": "processBusinessValue-1-the-business-problem"
        },
        {
          "kind": "paragraph",
          "text": "Most enterprises already have processes, but those processes are often hidden:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "an approval rule lives in one service;",
            "a retry rule lives in a scheduler;",
            "an escalation rule lives in an email template;",
            "a support team tracks manual work in a spreadsheet;",
            "a developer knows which service has to be called next."
          ]
        },
        {
          "kind": "paragraph",
          "text": "That structure works until the business asks simple questions:"
        },
        {
          "kind": "table",
          "headers": [
            "Business question",
            "Without Process",
            "With Nodics Process"
          ],
          "rows": [
            [
              "Where is this onboarding request stuck?",
              "Ask several teams and inspect logs.",
              "Open the instance and task timeline."
            ],
            [
              "Who owns the next action?",
              "Read custom code or tribal knowledge.",
              "The current task shows assignee/queue."
            ],
            [
              "Can we change the approval path?",
              "Deploy risky domain-service changes.",
              "Update and publish a governed definition version."
            ],
            [
              "Which version ran last month?",
              "Difficult to prove.",
              "Immutable version and audit evidence are stored."
            ],
            [
              "Can operations pause automation?",
              "Maybe, if the scheduler has a switch.",
              "Trigger metadata is visible and governed."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What Process gives business users",
          "anchor": "processBusinessValue-2-what-process-gives-business-users"
        },
        {
          "kind": "paragraph",
          "text": "Process gives business users a shared language:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "**definition**: the designed workflow;",
            "**version**: the published immutable contract that actually ran;",
            "**instance**: one running or completed business case;",
            "**task**: one human action waiting for a person, queue, or team;",
            "**trigger**: a relationship saying automation can start a process;",
            "**audit event**: evidence of what changed and who did it."
          ]
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Idea[\"Business policy\"] --> Definition[\"Process definition\"]\n  Definition --> Version[\"Published version\"]\n  Version --> Instance[\"Runtime instance\"]\n  Instance --> Task[\"Human task\"]\n  Instance --> Audit[\"Audit timeline\"]\n  Trigger[\"Scheduled trigger metadata\"] --> Instance"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Why this reduces cost",
          "anchor": "processBusinessValue-3-why-this-reduces-cost"
        },
        {
          "kind": "paragraph",
          "text": "The cost benefit is not only automation. The real saving comes from reducing the number of places where people have to look, change, test, and explain a business process."
        },
        {
          "kind": "paragraph",
          "text": "Process helps reduce operating cost by:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "making work state visible;",
            "reducing custom one-off orchestration code;",
            "separating workflow orchestration from domain action ownership;",
            "preserving version history for audit and rollback discussions;",
            "allowing standard Axis screens to manage definitions, tasks, and triggers."
          ]
        },
        {
          "kind": "paragraph",
          "text": "It can also reduce capital expenditure because partner projects can reuse the same Process engine instead of building a new workflow layer for every domain."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Adoption path",
          "anchor": "processBusinessValue-4-adoption-path"
        },
        {
          "kind": "paragraph",
          "text": "Start small. A good first process has one start, one human task, and one end."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Start[\"Start\"] --> Review[\"Business review task\"]\n  Review --> End[\"End\"]"
        },
        {
          "kind": "paragraph",
          "text": "Once that works, add richer behavior in layers:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "add assignment policy;",
            "add SLA and escalation;",
            "add scheduled trigger metadata;",
            "add domain action providers;",
            "add gateway rules;",
            "add analytics and operational dashboards."
          ]
        },
        {
          "kind": "paragraph",
          "text": "This avoids the classic workflow failure: trying to model the whole company on day one."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business-user acceptance",
          "anchor": "processBusinessValue-5-business-user-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "A business user should be able to:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "see active process definitions;",
            "understand which workflows are drafts and which are published;",
            "open a task list and know who must act next;",
            "see whether scheduled automation is active or paused;",
            "understand that Process coordinates work while domain modules still own actual business behavior."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue",
          "anchor": "processBusinessValue-6-continue"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Runtime Instance and Task Lifecycle](/docs/framework/process/runtime-lifecycle)",
            "[Process and Cron Shared Runtime](/docs/framework/process/process-cron-runtime)"
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processBusinessValue-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Measuring automation only by technical execution counts instead of business outcomes and recovery cost.",
            "Automating an unstable journey before ownership, approval, and exception handling are explicit."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processBusinessValue-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Validate the proposed journey with business users, developers, and operators; prove the happy path, rejection path, recovery path, audit evidence, and measurable operational benefit. The operator must also confirm that alerts and recovery ownership are practical."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "processBusinessValue-9-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Customers should extend Process by adding project-owned workflow definitions, action adapters, task assignment policies, escalation rules, and dashboards. The extension must keep domain state in the owning module, preserve Process audit evidence, and allow business users to understand what changed without reading raw graph JSON or source code."
        }
      ],
      "searchText": "Business Value and Adoption Model Explain the business problems Process solves, how it lowers operating cost, and how business users should think about automation governance. # Business Value and Adoption Model\n\nNodics Process exists to make business operations visible, governed, reusable, and changeable without scattering workflow rules across many domain services. A beginner can think of it as the operating playbook for work that crosses people, systems, approvals, time, and exceptions.\n\n## The business problem\n\nMost enterprises already have processes, but those processes are often hidden:\n\n- an approval rule lives in one service;\n- a retry rule lives in a scheduler;\n- an escalation rule lives in an email template;\n- a support team tracks manual work in a spreadsheet;\n- a developer knows which service has to be called next.\n\nThat structure works until the business asks simple questions:\n\n| Business question | Without Process | With Nodics Process |\n| --- | --- | --- |\n| Where is this onboarding request stuck? | Ask several teams and inspect logs. | Open the instance and task timeline. |\n| Who owns the next action? | Read custom code or tribal knowledge. | The current task shows assignee/queue. |\n| Can we change the approval path? | Deploy risky domain-service changes. | Update and publish a governed definition version. |\n| Which version ran last month? | Difficult to prove. | Immutable version and audit evidence are stored. |\n| Can operations pause automation? | Maybe, if the scheduler has a switch. | Trigger metadata is visible and governed. |\n\n## What Process gives business users\n\nProcess gives business users a shared language:\n\n- **definition**: the designed workflow;\n- **version**: the published immutable contract that actually ran;\n- **instance**: one running or completed business case;\n- **task**: one human action waiting for a person, queue, or team;\n- **trigger**: a relationship saying automation can start a process;\n- **audit event**: evidence of what changed and who did it.\n\n```mermaid\nflowchart LR\n  Idea[\"Business policy\"] --> Definition[\"Process definition\"]\n  Definition --> Version[\"Published version\"]\n  Version --> Instance[\"Runtime instance\"]\n  Instance --> Task[\"Human task\"]\n  Instance --> Audit[\"Audit timeline\"]\n  Trigger[\"Scheduled trigger metadata\"] --> Instance\n```\n\n## Why this reduces cost\n\nThe cost benefit is not only automation. The real saving comes from reducing the number of places where people have to look, change, test, and explain a business process.\n\nProcess helps reduce operating cost by:\n\n1. making work state visible;\n2. reducing custom one-off orchestration code;\n3. separating workflow orchestration from domain action ownership;\n4. preserving version history for audit and rollback discussions;\n5. allowing standard Axis screens to manage definitions, tasks, and triggers.\n\nIt can also reduce capital expenditure because partner projects can reuse the same Process engine instead of building a new workflow layer for every domain.\n\n## Adoption path\n\nStart small. A good first process has one start, one human task, and one end.\n\n```mermaid\nflowchart LR\n  Start[\"Start\"] --> Review[\"Business review task\"]\n  Review --> End[\"End\"]\n```\n\nOnce that works, add richer behavior in layers:\n\n1. add assignment policy;\n2. add SLA and escalation;\n3. add scheduled trigger metadata;\n4. add domain action providers;\n5. add gateway rules;\n6. add analytics and operational dashboards.\n\nThis avoids the classic workflow failure: trying to model the whole company on day one.\n\n## Business-user acceptance\n\nA business user should be able to:\n\n- see active process definitions;\n- understand which workflows are drafts and which are published;\n- open a task list and know who must act next;\n- see whether scheduled automation is active or paused;\n- understand that Process coordinates work while domain modules still own actual business behavior.\n\n## Continue\n\n- [Runtime Instance and Task Lifecycle](/docs/framework/process/runtime-lifecycle)\n- [Process and Cron Shared Runtime](/docs/framework/process/process-cron-runtime)\n\n## Common mistakes\n\n- Measuring automation only by technical execution counts instead of business outcomes and recovery cost.\n- Automating an unstable journey before ownership, approval, and exception handling are explicit.\n\n## Verification\n\nValidate the proposed journey with business users, developers, and operators; prove the happy path, rejection path, recovery path, audit evidence, and measurable operational benefit. The operator must also confirm that alerts and recovery ownership are practical.\n\n## Customization and extension\n\nCustomers should extend Process by adding project-owned workflow definitions, action adapters, task assignment policies, escalation rules, and dashboards. The extension must keep domain state in the owning module, preserve Process audit evidence, and allow business users to understand what changed without reading raw graph JSON or source code.\n",
      "previous": {
        "title": "Build Your First Human Task Flow",
        "route": "/docs/framework/process/first-human-task"
      },
      "next": {
        "title": "Pipeline and Business Logic Orchestration",
        "route": "/docs/framework/pipeline-business-logic-orchestration"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 663,
        "checksum": "e3a8bcab89de5a0b572e72a1105f1699f5d66e1508d658ca8fe1bf99161fe4cf"
      },
      "slug": "business-value",
      "locale": "en",
      "navigationGroup": "Business Value and Adoption",
      "navigationGroupCode": "business-value-and-adoption",
      "navigationGroupOrder": 50,
      "navigationOrder": 50,
      "references": [
        {
          "documentId": "process.overview",
          "owner": "workflow"
        },
        {
          "documentId": "process.first-workflow",
          "owner": "workflow"
        }
      ]
    },
    "active": true
  },
  "record9": {
    "code": "nodicsDocsComponentprocessProcessCronRuntime",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.process-cron-runtime",
      "title": "Process and Cronjob Shared Runtime",
      "route": "/docs/framework/process/process-cron-runtime",
      "section": "cron-and-scheduled-automation",
      "sectionTitle": "Cron and Scheduled Automation",
      "group": "cron-and-scheduled-automation",
      "groupTitle": "Cron and Scheduled Automation",
      "parentId": "cron-and-scheduled-automation",
      "hierarchyPath": [
        "Cron and Scheduled Automation",
        "Process and Cronjob Shared Runtime"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
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
      "summary": "Clarify how processServer can include workflow and cronjob while each module keeps a separate ownership boundary.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "cron.operations",
        "process.scheduled-automation"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "lifecycle-state-diagram",
        "troubleshooting-matrix",
        "code-example"
      ],
      "searchKeywords": [
        "cron-and-scheduled-automation",
        "process-and-cron-runtime-boundary",
        "process-and-cronjob-shared-runtime"
      ],
      "topicKeywords": [
        "Cron and Scheduled Automation",
        "Process and Cron Runtime Boundary",
        "Process and Cronjob Shared Runtime"
      ],
      "headings": [
        {
          "text": "The key rule",
          "anchor": "processProcessCronRuntime-1-the-key-rule",
          "level": 2
        },
        {
          "text": "Example topology",
          "anchor": "processProcessCronRuntime-2-example-topology",
          "level": 2
        },
        {
          "text": "Why this is attractive for partners",
          "anchor": "processProcessCronRuntime-3-why-this-is-attractive-for-partners",
          "level": 2
        },
        {
          "text": "Safe lifecycle behavior",
          "anchor": "processProcessCronRuntime-4-safe-lifecycle-behavior",
          "level": 2
        },
        {
          "text": "Cron job handoff shape",
          "anchor": "processProcessCronRuntime-5-cron-job-handoff-shape",
          "level": 2
        },
        {
          "text": "Continue",
          "anchor": "processProcessCronRuntime-6-continue",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processProcessCronRuntime-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processProcessCronRuntime-8-verification",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "processProcessCronRuntime-9-customization-and-extension",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Workflow and cronjob can run together in one runtime server when a partner wants a smaller topology. This is useful for local development, small installations, or customers who want business process automation and scheduled jobs without running many microservice processes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "The key rule",
          "anchor": "processProcessCronRuntime-1-the-key-rule"
        },
        {
          "kind": "paragraph",
          "text": "Shared runtime does not mean shared ownership."
        },
        {
          "kind": "table",
          "headers": [
            "Concern",
            "Owner"
          ],
          "rows": [
            [
              "Process definitions",
              "`nodics.process`"
            ],
            [
              "Published workflow versions",
              "`nodics.process`"
            ],
            [
              "Runtime instances and tasks",
              "`nodics.process`"
            ],
            [
              "Trigger relationship metadata",
              "`nodics.process`"
            ],
            [
              "Cron job definition",
              "`nodics.process/modules/cronjob`"
            ],
            [
              "Scheduler firing and retries",
              "`nodics.process/modules/cronjob`"
            ],
            [
              "Domain business action",
              "Domain module"
            ],
            [
              "UI rendering",
              "`nodics.axis`"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Example topology",
          "anchor": "processProcessCronRuntime-2-example-topology"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  ProcessServer[\"processServer\"] --> Core[\"includes nodics.foundation\"]\n  ProcessServer --> Process[\"extends nodics.process\"]\n  Process --> Workflow[\"loads workflow\"]\n  Process --> CronJob[\"loads cronjob\"]\n  Workflow --> Trigger[\"processTrigger metadata\"]\n  CronJob --> Job[\"cronJob execution\"]\n  Trigger -.references.-> Job"
        },
        {
          "kind": "paragraph",
          "text": "The trigger can reference a Cron job code. It does not become the Cron job. Cronjob still decides when the job fires. When a cronjob-owned job wants to start a process, it declares a `jobDetail.processTrigger` target. The cronjob trigger pipeline then calls the Process trigger executor with a service identity, correlation id, schedule context, and job evidence. Process verifies the trigger is active, starts the workflow instance, and records audit events."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Why this is attractive for partners",
          "anchor": "processProcessCronRuntime-3-why-this-is-attractive-for-partners"
        },
        {
          "kind": "paragraph",
          "text": "Partners often start with one server for operational simplicity. Later they may split runtimes when scale, isolation, or team ownership requires it. Nodics should support both without changing functional module identity."
        },
        {
          "kind": "paragraph",
          "text": "This keeps the mental model stable:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Process console shows workflows and automation relationships.",
            "Cronjob console shows jobs and scheduler behavior.",
            "Axis can place both under \"Business Process & Automation\".",
            "Backend ownership still protects maintainability."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Safe lifecycle behavior",
          "anchor": "processProcessCronRuntime-4-safe-lifecycle-behavior"
        },
        {
          "kind": "paragraph",
          "text": "Process can be registered, activated, deactivated, and deregistered through the module registry. Process APIs and cronjob controls are projected from the same functional module registration, while module ownership still remains separate."
        },
        {
          "kind": "paragraph",
          "text": "The local acceptance smoke proves this by exercising Process registration and verifying that both `workflow` and `cronjob` appear as technical modules."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Cron job handoff shape",
          "anchor": "processProcessCronRuntime-5-cron-job-handoff-shape"
        },
        {
          "kind": "paragraph",
          "text": "A Cron job that starts a Process workflow should look declarative. It should not embed workflow logic or call arbitrary code when the intent is scheduled automation."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "{\n  code: 'dailyContentApprovalJob',\n  tenant: 'default',\n  trigger: { expression: '0 10 * * *' },\n  jobDetail: {\n    processTrigger: {\n      triggerCode: 'dailyContentApproval',\n      context: {\n        businessDateMode: 'CURRENT_DAY'\n      }\n    }\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "That shape keeps the responsibilities readable:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Cronjob reads the schedule and fires the job.",
            "Cronjob passes `cronJobCode`, tenant, schedule expression, and correlation evidence into Process.",
            "Process loads the active trigger relationship.",
            "Process starts the published workflow version.",
            "Process writes `process.trigger.execution.*` and instance audit events."
          ]
        },
        {
          "kind": "paragraph",
          "text": "If `nodics.process` is not loaded in the same runtime, the Cron job fails closed with a dependency error instead of silently pretending the automation ran."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue",
          "anchor": "processProcessCronRuntime-6-continue"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Runtime Instance and Task Lifecycle](/docs/framework/process/runtime-lifecycle)",
            "[DevOps and Runtime Topology](/docs/framework/process/devops-topology)"
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processProcessCronRuntime-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Confusing shared runtime composition with merged functional ownership.",
            "Starting duplicate schedulers or registering the same trigger through parallel Process and Cron authorities."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processProcessCronRuntime-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Prepare processServer, confirm `nodics.process` is observed once with `workflow` and `cronjob` technical modules, execute a scheduled trigger with correlation evidence, and verify no standalone cronjob listener is required. A beginner developer should confirm this shared runtime before adding another server."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "processProcessCronRuntime-9-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Projects may customize scheduled automation by adding Cron job definitions, Process triggers, tenant calendars, retry rules, and operational dashboards. The extension must preserve Cron as the scheduler, Process as the workflow coordinator, and domain modules as the owners of business state changes."
        }
      ],
      "searchText": "Process and Cronjob Shared Runtime Clarify how processServer can include workflow and cronjob while each module keeps a separate ownership boundary. # Process and Cronjob Shared Runtime\n\nWorkflow and cronjob can run together in one runtime server when a partner wants a smaller topology. This is useful for local development, small installations, or customers who want business process automation and scheduled jobs without running many microservice processes.\n\n## The key rule\n\nShared runtime does not mean shared ownership.\n\n| Concern | Owner |\n| --- | --- |\n| Process definitions | `nodics.process` |\n| Published workflow versions | `nodics.process` |\n| Runtime instances and tasks | `nodics.process` |\n| Trigger relationship metadata | `nodics.process` |\n| Cron job definition | `nodics.process/modules/cronjob` |\n| Scheduler firing and retries | `nodics.process/modules/cronjob` |\n| Domain business action | Domain module |\n| UI rendering | `nodics.axis` |\n\n## Example topology\n\n```mermaid\nflowchart LR\n  ProcessServer[\"processServer\"] --> Core[\"includes nodics.foundation\"]\n  ProcessServer --> Process[\"extends nodics.process\"]\n  Process --> Workflow[\"loads workflow\"]\n  Process --> CronJob[\"loads cronjob\"]\n  Workflow --> Trigger[\"processTrigger metadata\"]\n  CronJob --> Job[\"cronJob execution\"]\n  Trigger -.references.-> Job\n```\n\nThe trigger can reference a Cron job code. It does not become the Cron job. Cronjob still decides when the job fires. When a cronjob-owned job wants to start a process, it declares a `jobDetail.processTrigger` target. The cronjob trigger pipeline then calls the Process trigger executor with a service identity, correlation id, schedule context, and job evidence. Process verifies the trigger is active, starts the workflow instance, and records audit events.\n\n## Why this is attractive for partners\n\nPartners often start with one server for operational simplicity. Later they may split runtimes when scale, isolation, or team ownership requires it. Nodics should support both without changing functional module identity.\n\nThis keeps the mental model stable:\n\n- Process console shows workflows and automation relationships.\n- Cronjob console shows jobs and scheduler behavior.\n- Axis can place both under \"Business Process & Automation\".\n- Backend ownership still protects maintainability.\n\n## Safe lifecycle behavior\n\nProcess can be registered, activated, deactivated, and deregistered through the module registry. Process APIs and cronjob controls are projected from the same functional module registration, while module ownership still remains separate.\n\nThe local acceptance smoke proves this by exercising Process registration and verifying that both `workflow` and `cronjob` appear as technical modules.\n\n## Cron job handoff shape\n\nA Cron job that starts a Process workflow should look declarative. It should not embed workflow logic or call arbitrary code when the intent is scheduled automation.\n\n```js\n{\n  code: 'dailyContentApprovalJob',\n  tenant: 'default',\n  trigger: { expression: '0 10 * * *' },\n  jobDetail: {\n    processTrigger: {\n      triggerCode: 'dailyContentApproval',\n      context: {\n        businessDateMode: 'CURRENT_DAY'\n      }\n    }\n  }\n}\n```\n\nThat shape keeps the responsibilities readable:\n\n- Cronjob reads the schedule and fires the job.\n- Cronjob passes `cronJobCode`, tenant, schedule expression, and correlation evidence into Process.\n- Process loads the active trigger relationship.\n- Process starts the published workflow version.\n- Process writes `process.trigger.execution.*` and instance audit events.\n\nIf `nodics.process` is not loaded in the same runtime, the Cron job fails closed with a dependency error instead of silently pretending the automation ran.\n\n## Continue\n\n- [Runtime Instance and Task Lifecycle](/docs/framework/process/runtime-lifecycle)\n- [DevOps and Runtime Topology](/docs/framework/process/devops-topology)\n\n## Common mistakes\n\n- Confusing shared runtime composition with merged functional ownership.\n- Starting duplicate schedulers or registering the same trigger through parallel Process and Cron authorities.\n\n## Verification\n\nPrepare processServer, confirm `nodics.process` is observed once with `workflow` and `cronjob` technical modules, execute a scheduled trigger with correlation evidence, and verify no standalone cronjob listener is required. A beginner developer should confirm this shared runtime before adding another server.\n\n## Customization and extension\n\nProjects may customize scheduled automation by adding Cron job definitions, Process triggers, tenant calendars, retry rules, and operational dashboards. The extension must preserve Cron as the scheduler, Process as the workflow coordinator, and domain modules as the owners of business state changes.\n",
      "previous": {
        "title": "Project Cron Customization",
        "route": "/docs/framework/cron-project-customization"
      },
      "next": {
        "title": "Scheduled Automation and Cron Triggers",
        "route": "/docs/framework/process/scheduled-automation"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 567,
        "checksum": "6065842278b5cdbc0e9dff95aa87d97daae23be2296171e2e3c2f0e2ecd0ea9d"
      },
      "slug": "process-cron-runtime",
      "locale": "en",
      "navigationGroup": "Process and Cron Runtime Boundary",
      "navigationGroupCode": "process-and-cron-runtime-boundary",
      "navigationGroupOrder": 20,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "cron.operations",
          "owner": "cronjob"
        },
        {
          "documentId": "process.scheduled-automation",
          "owner": "workflow"
        }
      ]
    },
    "active": true
  },
  "record10": {
    "code": "nodicsDocsComponentprocessScheduledAutomation",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.scheduled-automation",
      "title": "Scheduled Automation and Cron Triggers",
      "route": "/docs/framework/process/scheduled-automation",
      "section": "cron-and-scheduled-automation",
      "sectionTitle": "Cron and Scheduled Automation",
      "group": "cron-and-scheduled-automation",
      "groupTitle": "Cron and Scheduled Automation",
      "parentId": "cron-and-scheduled-automation",
      "hierarchyPath": [
        "Cron and Scheduled Automation",
        "Scheduled Automation and Cron Triggers"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
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
      "summary": "Show how active Process triggers are executed by Cron or another authorized scheduler with correlation and audit evidence.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "cron.operations",
        "process.process-cron-runtime"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "lifecycle-state-diagram",
        "troubleshooting-matrix",
        "code-example"
      ],
      "searchKeywords": [
        "cron-and-scheduled-automation",
        "scheduled-automation-triggers",
        "scheduled-automation-and-cron-triggers"
      ],
      "topicKeywords": [
        "Cron and Scheduled Automation",
        "Scheduled Automation Triggers",
        "Scheduled Automation and Cron Triggers"
      ],
      "headings": [
        {
          "text": "Why this split exists",
          "anchor": "processScheduledAutomation-1-why-this-split-exists",
          "level": 2
        },
        {
          "text": "Trigger lifecycle",
          "anchor": "processScheduledAutomation-2-trigger-lifecycle",
          "level": 2
        },
        {
          "text": "Runtime execution contract",
          "anchor": "processScheduledAutomation-3-runtime-execution-contract",
          "level": 2
        },
        {
          "text": "Scheduler State and Business Authority",
          "anchor": "processScheduledAutomation-4-scheduler-state-and-business-authority",
          "level": 2
        },
        {
          "text": "Cron-owned job declaration",
          "anchor": "processScheduledAutomation-5-cron-owned-job-declaration",
          "level": 2
        },
        {
          "text": "What business users should see in Axis",
          "anchor": "processScheduledAutomation-6-what-business-users-should-see-in-axis",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "processScheduledAutomation-7-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processScheduledAutomation-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processScheduledAutomation-9-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Functional owner: `nodics.process`."
        },
        {
          "kind": "paragraph",
          "text": "Scheduled automation connects time-based execution to business workflows. Nodics keeps the ownership boundary explicit:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "nodics.process owns process definitions, trigger relationships, instances, tasks, and audit.",
            "nodics.process/modules/cronjob owns job scheduling, firing, retry timing, and scheduler runtime."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Why this split exists",
          "anchor": "processScheduledAutomation-1-why-this-split-exists"
        },
        {
          "kind": "paragraph",
          "text": "If Process owned Cron jobs directly, workflows would become a hidden scheduler. If Cron owned process definitions, scheduled jobs would become a hidden workflow engine. Keeping the boundary clear makes the system easier to test, operate, and customize."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant Cron as cronjob\n  participant Process as nodics.process\n  participant Audit as Process audit\n  Cron->>Process: POST /triggers/:code/execute\n  Process->>Audit: process.trigger.execution.requested\n  Process->>Process: start published process instance\n  Process->>Audit: process.instance.started\n  Process->>Audit: process.trigger.execution.completed"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Trigger lifecycle",
          "anchor": "processScheduledAutomation-2-trigger-lifecycle"
        },
        {
          "kind": "table",
          "headers": [
            "State",
            "Meaning"
          ],
          "rows": [
            [
              "`DRAFT`",
              "Relationship exists but is not executable."
            ],
            [
              "`ACTIVE`",
              "Authorized scheduler can execute it."
            ],
            [
              "`PAUSED`",
              "Keep metadata but do not execute."
            ],
            [
              "`ARCHIVED`",
              "Historical relationship; cannot be updated or executed."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Axis should make this lifecycle obvious. A business user should not need to guess why an automation did not run."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime execution contract",
          "anchor": "processScheduledAutomation-3-runtime-execution-contract"
        },
        {
          "kind": "paragraph",
          "text": "The execution API requires an active trigger. The scheduler should pass a correlation or idempotency key."
        },
        {
          "kind": "code",
          "language": "http",
          "text": "POST /nodics/process/v0/triggers/dailyContentApproval/execute\nAuthorization: Bearer <runtime-token>\ncontent-type: application/json\n\n{\n  \"correlationId\": \"cron-fire-2026-08-09T10:00:00Z\",\n  \"context\": {\n    \"source\": \"cron\",\n    \"businessDate\": \"2026-08-09\"\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "Process starts the referenced workflow and records audit evidence. Cronjob remains responsible for deciding when to call this endpoint and how to retry scheduler failures."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Scheduler State and Business Authority",
          "anchor": "processScheduledAutomation-4-scheduler-state-and-business-authority"
        },
        {
          "kind": "paragraph",
          "text": "Three different checks apply; none substitutes for another:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "The employee reviews and confirms a schedule using their own Cron permissions.",
            "Cron persists its own wrapper state through `persistRuntimeState`. Only an owner-created wrapper can write the fixed state/status/timestamp/log fields. The owner supplies canonical internal identity and fixes tenant, code and node. A missing or ambiguous update acknowledgement fails the operation.",
            "Every new tick obtains current operational admission and forwards the verified runtime principal to Process. Process and the destination module independently authorize the requested business work and source policy."
          ]
        },
        {
          "kind": "paragraph",
          "text": "An active timer is not proof of a successful business action. Inspect the original Cron lifecycle receipt, the Process instance, and the destination's attempt history separately. Do not reactivate or rerun a command solely because its response was lost. Completion bookkeeping remains available for admitted work during drain; this does not allow another target execution after business deactivation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Cron-owned job declaration",
          "anchor": "processScheduledAutomation-5-cron-owned-job-declaration"
        },
        {
          "kind": "paragraph",
          "text": "When workflow and cronjob run together in `processServer`, a Cron job can execute a Process trigger without using a browser-only shortcut:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "{\n  code: 'dailyContentApprovalJob',\n  trigger: { expression: '0 10 * * *' },\n  jobDetail: {\n    processTrigger: {\n      triggerCode: 'dailyContentApproval',\n      context: {\n        sourceDescription: 'Daily content approval automation'\n      }\n    }\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "This declaration is intentionally small. The business process remains in Process. The schedule remains in cronjob. Domain-specific work remains in the domain module that Process calls through explicit ACTION adapters."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What business users should see in Axis",
          "anchor": "processScheduledAutomation-6-what-business-users-should-see-in-axis"
        },
        {
          "kind": "paragraph",
          "text": "Axis should explain two related but different records:"
        },
        {
          "kind": "table",
          "headers": [
            "Axis concept",
            "Backend owner",
            "What the user controls"
          ],
          "rows": [
            [
              "Scheduled trigger relationship",
              "`nodics.process`",
              "Which process definition is allowed to start from a schedule."
            ],
            [
              "Cron job",
              "`nodics.process/modules/cronjob`",
              "When the schedule fires and how scheduler lifecycle is operated."
            ],
            [
              "Manual execute now",
              "`nodics.process`",
              "Test an active trigger immediately with audit evidence."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "This helps a business user understand why activating a trigger relationship is not the same thing as starting a scheduler, and why a Cron job may still need to exist before real time-based automation fires."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "processScheduledAutomation-7-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Projects can customize scheduled automation with project-owned triggers, calendars, retry rules, pause and resume permissions, or business-specific execution services. Document configuration keys, owner module, affected business data, Axis controls, job evidence, and recovery behavior. Scheduled work should stay inside the governed Process and Cron model so operators can understand and control it."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processScheduledAutomation-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating trigger activation as proof that a scheduler exists and is healthy.",
            "Duplicating schedule state in Process and Cron or losing tenant, correlation, idempotency, and audit context."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processScheduledAutomation-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Activate a Process trigger, verify the Cron-owned schedule handoff, execute it once with idempotency evidence, reject unauthorized or inactive execution, and confirm retry and recovery behavior. A beginner developer and production operator should both understand which evidence belongs to Process and which belongs to Cron. Also repeat the check after processServer restarts and after a missed schedule window. Confirm the scheduler follows the configured misfire policy, does not replay a completed correlation unexpectedly, and exposes a recoverable incident when downstream execution fails. Metrics and logs must remain tenant-safe, bounded, and free of trigger payload secrets."
        }
      ],
      "searchText": "Scheduled Automation and Cron Triggers Show how active Process triggers are executed by Cron or another authorized scheduler with correlation and audit evidence. # Scheduled Automation and Cron Triggers\n\nFunctional owner: `nodics.process`.\n\nScheduled automation connects time-based execution to business workflows. Nodics keeps the ownership boundary explicit:\n\n- nodics.process owns process definitions, trigger relationships, instances, tasks, and audit.\n- nodics.process/modules/cronjob owns job scheduling, firing, retry timing, and scheduler runtime.\n\n## Why this split exists\n\nIf Process owned Cron jobs directly, workflows would become a hidden scheduler. If Cron owned process definitions, scheduled jobs would become a hidden workflow engine. Keeping the boundary clear makes the system easier to test, operate, and customize.\n\n```mermaid\nsequenceDiagram\n  participant Cron as cronjob\n  participant Process as nodics.process\n  participant Audit as Process audit\n  Cron->>Process: POST /triggers/:code/execute\n  Process->>Audit: process.trigger.execution.requested\n  Process->>Process: start published process instance\n  Process->>Audit: process.instance.started\n  Process->>Audit: process.trigger.execution.completed\n```\n\n## Trigger lifecycle\n\n| State | Meaning |\n| --- | --- |\n| `DRAFT` | Relationship exists but is not executable. |\n| `ACTIVE` | Authorized scheduler can execute it. |\n| `PAUSED` | Keep metadata but do not execute. |\n| `ARCHIVED` | Historical relationship; cannot be updated or executed. |\n\nAxis should make this lifecycle obvious. A business user should not need to guess why an automation did not run.\n\n## Runtime execution contract\n\nThe execution API requires an active trigger. The scheduler should pass a correlation or idempotency key.\n\n```http\nPOST /nodics/process/v0/triggers/dailyContentApproval/execute\nAuthorization: Bearer <runtime-token>\ncontent-type: application/json\n\n{\n  \"correlationId\": \"cron-fire-2026-08-09T10:00:00Z\",\n  \"context\": {\n    \"source\": \"cron\",\n    \"businessDate\": \"2026-08-09\"\n  }\n}\n```\n\nProcess starts the referenced workflow and records audit evidence. Cronjob remains responsible for deciding when to call this endpoint and how to retry scheduler failures.\n\n## Scheduler State and Business Authority\n\nThree different checks apply; none substitutes for another:\n\n1. The employee reviews and confirms a schedule using their own Cron permissions.\n2. Cron persists its own wrapper state through `persistRuntimeState`. Only an owner-created wrapper can write the fixed state/status/timestamp/log fields. The owner supplies canonical internal identity and fixes tenant, code and node. A missing or ambiguous update acknowledgement fails the operation.\n3. Every new tick obtains current operational admission and forwards the verified runtime principal to Process. Process and the destination module independently authorize the requested business work and source policy.\n\nAn active timer is not proof of a successful business action. Inspect the original Cron lifecycle receipt, the Process instance, and the destination's attempt history separately. Do not reactivate or rerun a command solely because its response was lost. Completion bookkeeping remains available for admitted work during drain; this does not allow another target execution after business deactivation.\n\n## Cron-owned job declaration\n\nWhen workflow and cronjob run together in `processServer`, a Cron job can execute a Process trigger without using a browser-only shortcut:\n\n```js\n{\n  code: 'dailyContentApprovalJob',\n  trigger: { expression: '0 10 * * *' },\n  jobDetail: {\n    processTrigger: {\n      triggerCode: 'dailyContentApproval',\n      context: {\n        sourceDescription: 'Daily content approval automation'\n      }\n    }\n  }\n}\n```\n\nThis declaration is intentionally small. The business process remains in Process. The schedule remains in cronjob. Domain-specific work remains in the domain module that Process calls through explicit ACTION adapters.\n\n## What business users should see in Axis\n\nAxis should explain two related but different records:\n\n| Axis concept | Backend owner | What the user controls |\n| --- | --- | --- |\n| Scheduled trigger relationship | `nodics.process` | Which process definition is allowed to start from a schedule. |\n| Cron job | `nodics.process/modules/cronjob` | When the schedule fires and how scheduler lifecycle is operated. |\n| Manual execute now | `nodics.process` | Test an active trigger immediately with audit evidence. |\n\nThis helps a business user understand why activating a trigger relationship is not the same thing as starting a scheduler, and why a Cron job may still need to exist before real time-based automation fires.\n\n## Customization and extension guidance\n\nProjects can customize scheduled automation with project-owned triggers, calendars, retry rules, pause and resume permissions, or business-specific execution services. Document configuration keys, owner module, affected business data, Axis controls, job evidence, and recovery behavior. Scheduled work should stay inside the governed Process and Cron model so operators can understand and control it.\n\n## Common mistakes\n\n- Treating trigger activation as proof that a scheduler exists and is healthy.\n- Duplicating schedule state in Process and Cron or losing tenant, correlation, idempotency, and audit context.\n\n## Verification\n\nActivate a Process trigger, verify the Cron-owned schedule handoff, execute it once with idempotency evidence, reject unauthorized or inactive execution, and confirm retry and recovery behavior. A beginner developer and production operator should both understand which evidence belongs to Process and which belongs to Cron. Also repeat the check after processServer restarts and after a missed schedule window. Confirm the scheduler follows the configured misfire policy, does not replay a completed correlation unexpectedly, and exposes a recoverable incident when downstream execution fails. Metrics and logs must remain tenant-safe, bounded, and free of trigger payload secrets.\n",
      "previous": {
        "title": "Process and Cronjob Shared Runtime",
        "route": "/docs/framework/process/process-cron-runtime"
      },
      "next": {
        "title": "Data Import, Export, and Migration",
        "route": "/docs/framework/data-import-export-migration"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 749,
        "checksum": "606a212d1d557b38a30602887b52168fd9f98b88933ae2eb576e1703627f8600"
      },
      "slug": "scheduled-automation",
      "locale": "en",
      "navigationGroup": "Scheduled Automation Triggers",
      "navigationGroupCode": "scheduled-automation-triggers",
      "navigationGroupOrder": 30,
      "navigationOrder": 30,
      "references": [
        {
          "documentId": "cron.operations",
          "owner": "cronjob"
        },
        {
          "documentId": "process.process-cron-runtime",
          "owner": "workflow"
        }
      ]
    },
    "active": true
  },
  "record11": {
    "code": "nodicsDocsComponentprocessActionAdapters",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.action-adapters",
      "title": "Action Adapter Contract",
      "route": "/docs/framework/process/action-adapters",
      "section": "system-integration-and-external-connectivity",
      "sectionTitle": "System Integration and External Connectivity",
      "group": "system-integration-and-external-connectivity",
      "groupTitle": "System Integration and External Connectivity",
      "parentId": "system-integration-and-external-connectivity",
      "hierarchyPath": [
        "System Integration and External Connectivity",
        "Action Adapter Contract"
      ],
      "hierarchyDepth": 2,
      "documentType": "integration",
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
      "summary": "Learn why ACTION nodes use registered declarative adapters and how customer and domain modules own business execution.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "process.developer-customization",
        "communication.overview"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "comparison-table",
        "code-example"
      ],
      "searchKeywords": [
        "system-integration-and-external-connectivity",
        "action-adapter-integration",
        "action-adapter-contract"
      ],
      "topicKeywords": [
        "System Integration and External Connectivity",
        "Action Adapter Integration",
        "Action Adapter Contract"
      ],
      "headings": [
        {
          "text": "Safe default",
          "anchor": "processActionAdapters-1-safe-default",
          "level": 2
        },
        {
          "text": "What is not allowed",
          "anchor": "processActionAdapters-2-what-is-not-allowed",
          "level": 2
        },
        {
          "text": "Customer extension pattern",
          "anchor": "processActionAdapters-3-customer-extension-pattern",
          "level": 2
        },
        {
          "text": "QA checklist",
          "anchor": "processActionAdapters-4-qa-checklist",
          "level": 2
        },
        {
          "text": "Adapter operating contract",
          "anchor": "processActionAdapters-5-adapter-operating-contract",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processActionAdapters-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processActionAdapters-7-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "An `ACTION` node is where a workflow asks another capability to do something. Examples:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "ask Commerce to reserve stock;",
            "ask Profile to notify a user;",
            "ask WCMS to move content to review;",
            "ask a customer module to call a partner integration."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Process should not contain that business logic. Process should orchestrate, authorize, and audit the request."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Safe default",
          "anchor": "processActionAdapters-1-safe-default"
        },
        {
          "kind": "paragraph",
          "text": "The framework includes one safe demo action:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"moduleName\": \"nodics.process\",\n  \"operation\": \"noop\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "This proves the runtime path without touching a real business domain."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What is not allowed",
          "anchor": "processActionAdapters-2-what-is-not-allowed"
        },
        {
          "kind": "paragraph",
          "text": "Graph JSON must not contain:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "JavaScript functions;",
            "file paths;",
            "URLs as executable handlers;",
            "arbitrary script fragments;",
            "secrets or credentials."
          ]
        },
        {
          "kind": "paragraph",
          "text": "This is a security and maintainability rule. A workflow should say what domain operation is requested, not how to execute arbitrary code."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customer extension pattern",
          "anchor": "processActionAdapters-3-customer-extension-pattern"
        },
        {
          "kind": "paragraph",
          "text": "A customer project can register allowed adapters through configuration or a custom registry override."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  process: {\n    actionAdapters: {\n      allowedActions: [\n        {\n          moduleName: 'customer.commerce',\n          operation: 'reserveStock',\n          service: 'CustomerCommerceProcessAdapterService',\n          method: 'reserveStock'\n        }\n      ]\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The service implementation belongs to the customer/domain module. Process only calls it through the approved registry and records the result."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "QA checklist",
          "anchor": "processActionAdapters-4-qa-checklist"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Unknown actions fail with a stable Process error.",
            "Allowed demo no-op action completes successfully.",
            "Failed actions create audit evidence.",
            "Action output is bounded and does not leak secrets.",
            "Domain modules can be tested independently from Process orchestration."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Adapter operating contract",
          "anchor": "processActionAdapters-5-adapter-operating-contract"
        },
        {
          "kind": "table",
          "headers": [
            "Concern",
            "Required behavior",
            "Rejection evidence"
          ],
          "rows": [
            [
              "Registration",
              "Resolve an allowlisted adapter owned by a functional or customer module.",
              "Unknown adapter returns a stable Process error before any side effect."
            ],
            [
              "Input",
              "Accept only the versioned, bounded input contract declared by the adapter.",
              "Invalid or oversized input is rejected and redacted in logs."
            ],
            [
              "Authorization",
              "Enforce the initiating identity, tenant, permission, and workflow context in the backend.",
              "Unauthorized execution records a denial without invoking the domain action."
            ],
            [
              "Idempotency",
              "Reuse the process instance, node, attempt, and business correlation identity.",
              "Duplicate delivery returns prior evidence or a deterministic conflict."
            ],
            [
              "Output",
              "Return a bounded, serializable result suitable for Process audit and transition evaluation.",
              "Secrets, provider payloads, and unbounded objects are excluded."
            ],
            [
              "Failure",
              "Classify retryable, terminal, and compensatable failure through stable codes.",
              "Process creates an incident and preserves the original attempt evidence."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "A beginner developer should start with a deterministic no-op or test adapter in the owning customer module. The adapter should validate one small input, return one bounded output, and expose no network or filesystem path through workflow metadata. After that contract works, the developer can connect a domain-owned service such as Order, Fulfillment, Payment, or Communication. Process invokes the adapter but does not take ownership of the domain command."
        },
        {
          "kind": "paragraph",
          "text": "For production, operators need enough evidence to distinguish a Process engine failure from a domain dependency failure. Every attempt therefore needs the definition version, instance and node identity, adapter identity, attempt number, tenant, correlation identifier, duration, outcome code, and redacted error classification. Metrics should show latency, retry volume, terminal failure, compensation, and dead-letter growth without placing request bodies or credentials in labels."
        },
        {
          "kind": "paragraph",
          "text": "Negative testing is part of the adapter contract. Test an unknown adapter, invalid input, unauthorized caller, duplicate correlation, timeout, dependency failure, malformed output, retry exhaustion, and compensation failure. A test that only proves the successful call does not establish that the adapter is safe for a long-running business process."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processActionAdapters-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Executing arbitrary code or URLs from workflow metadata instead of registered adapters.",
            "Moving domain validation, authorization, or compensation ownership into Process or Axis."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processActionAdapters-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run the Process contract suite, reject unknown adapters, verify permission denial, and confirm bounded audit evidence for successful, failed, retried, and compensated actions. A beginner developer should be able to repeat this while a production operator can inspect the resulting evidence."
        }
      ],
      "searchText": "Action Adapter Contract Learn why ACTION nodes use registered declarative adapters and how customer and domain modules own business execution. # Action Adapter Contract\n\nAn `ACTION` node is where a workflow asks another capability to do something. Examples:\n\n- ask Commerce to reserve stock;\n- ask Profile to notify a user;\n- ask WCMS to move content to review;\n- ask a customer module to call a partner integration.\n\nProcess should not contain that business logic. Process should orchestrate, authorize, and audit the request.\n\n## Safe default\n\nThe framework includes one safe demo action:\n\n```json\n{\n  \"moduleName\": \"nodics.process\",\n  \"operation\": \"noop\"\n}\n```\n\nThis proves the runtime path without touching a real business domain.\n\n## What is not allowed\n\nGraph JSON must not contain:\n\n- JavaScript functions;\n- file paths;\n- URLs as executable handlers;\n- arbitrary script fragments;\n- secrets or credentials.\n\nThis is a security and maintainability rule. A workflow should say what domain operation is requested, not how to execute arbitrary code.\n\n## Customer extension pattern\n\nA customer project can register allowed adapters through configuration or a custom registry override.\n\n```js\nmodule.exports = {\n  process: {\n    actionAdapters: {\n      allowedActions: [\n        {\n          moduleName: 'customer.commerce',\n          operation: 'reserveStock',\n          service: 'CustomerCommerceProcessAdapterService',\n          method: 'reserveStock'\n        }\n      ]\n    }\n  }\n};\n```\n\nThe service implementation belongs to the customer/domain module. Process only calls it through the approved registry and records the result.\n\n## QA checklist\n\n- Unknown actions fail with a stable Process error.\n- Allowed demo no-op action completes successfully.\n- Failed actions create audit evidence.\n- Action output is bounded and does not leak secrets.\n- Domain modules can be tested independently from Process orchestration.\n\n## Adapter operating contract\n\n| Concern | Required behavior | Rejection evidence |\n| --- | --- | --- |\n| Registration | Resolve an allowlisted adapter owned by a functional or customer module. | Unknown adapter returns a stable Process error before any side effect. |\n| Input | Accept only the versioned, bounded input contract declared by the adapter. | Invalid or oversized input is rejected and redacted in logs. |\n| Authorization | Enforce the initiating identity, tenant, permission, and workflow context in the backend. | Unauthorized execution records a denial without invoking the domain action. |\n| Idempotency | Reuse the process instance, node, attempt, and business correlation identity. | Duplicate delivery returns prior evidence or a deterministic conflict. |\n| Output | Return a bounded, serializable result suitable for Process audit and transition evaluation. | Secrets, provider payloads, and unbounded objects are excluded. |\n| Failure | Classify retryable, terminal, and compensatable failure through stable codes. | Process creates an incident and preserves the original attempt evidence. |\n\nA beginner developer should start with a deterministic no-op or test adapter in the owning customer module. The adapter should validate one small input, return one bounded output, and expose no network or filesystem path through workflow metadata. After that contract works, the developer can connect a domain-owned service such as Order, Fulfillment, Payment, or Communication. Process invokes the adapter but does not take ownership of the domain command.\n\nFor production, operators need enough evidence to distinguish a Process engine failure from a domain dependency failure. Every attempt therefore needs the definition version, instance and node identity, adapter identity, attempt number, tenant, correlation identifier, duration, outcome code, and redacted error classification. Metrics should show latency, retry volume, terminal failure, compensation, and dead-letter growth without placing request bodies or credentials in labels.\n\nNegative testing is part of the adapter contract. Test an unknown adapter, invalid input, unauthorized caller, duplicate correlation, timeout, dependency failure, malformed output, retry exhaustion, and compensation failure. A test that only proves the successful call does not establish that the adapter is safe for a long-running business process.\n\n## Common mistakes\n\n- Executing arbitrary code or URLs from workflow metadata instead of registered adapters.\n- Moving domain validation, authorization, or compensation ownership into Process or Axis.\n\n## Verification\n\nRun the Process contract suite, reject unknown adapters, verify permission denial, and confirm bounded audit evidence for successful, failed, retried, and compensated actions. A beginner developer should be able to repeat this while a production operator can inspect the resulting evidence.\n",
      "previous": {
        "title": "Data Import, Export, and Migration",
        "route": "/docs/framework/data-import-export-migration"
      },
      "next": {
        "title": "Runtime and DevOps operations",
        "route": "/docs/framework/framework-devops-runtime"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 603,
        "checksum": "c7ad7524fd6c877f71082539b5e96d77f9093f9fb4fc61b38a8bcc791114fcd3"
      },
      "slug": "action-adapters",
      "locale": "en",
      "navigationGroup": "Action Adapter Integration",
      "navigationGroupCode": "action-adapter-integration",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "process.developer-customization",
          "owner": "workflow"
        },
        {
          "documentId": "communication.overview",
          "owner": "commsCore"
        }
      ]
    },
    "active": true
  },
  "record12": {
    "code": "nodicsDocsComponentprocessIncidentRecovery",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.incident-recovery",
      "title": "Incident, Retry, and Compensation Operations",
      "route": "/docs/framework/process/incident-recovery",
      "section": "operations-monitoring-and-recovery",
      "sectionTitle": "Operations, Monitoring, and Recovery",
      "group": "operations-monitoring-and-recovery",
      "groupTitle": "Operations, Monitoring, and Recovery",
      "parentId": "operations-monitoring-and-recovery",
      "hierarchyPath": [
        "Operations, Monitoring, and Recovery",
        "Incident, Retry, and Compensation Operations"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
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
      "summary": "Operate failed ACTION nodes through Process-owned incidents, bounded retries, dead-letter handling, and declarative domain-owned compensation.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "process.runtime-lifecycle",
        "process.qa-regression-guide"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "lifecycle-state-diagram",
        "troubleshooting-matrix",
        "code-example"
      ],
      "searchKeywords": [
        "operations-monitoring-and-recovery",
        "process-incident-recovery",
        "incident-retry-and-compensation-operations"
      ],
      "topicKeywords": [
        "Operations, Monitoring, and Recovery",
        "Process Incident Recovery",
        "Incident, Retry, and Compensation Operations"
      ],
      "headings": [
        {
          "text": "The recovery lifecycle",
          "anchor": "processIncidentRecovery-1-the-recovery-lifecycle",
          "level": 2
        },
        {
          "text": "What an operator sees",
          "anchor": "processIncidentRecovery-2-what-an-operator-sees",
          "level": 2
        },
        {
          "text": "Retry safely",
          "anchor": "processIncidentRecovery-3-retry-safely",
          "level": 2
        },
        {
          "text": "Compensate safely",
          "anchor": "processIncidentRecovery-4-compensate-safely",
          "level": 2
        },
        {
          "text": "Developer contract",
          "anchor": "processIncidentRecovery-5-developer-contract",
          "level": 2
        },
        {
          "text": "Operational checklist",
          "anchor": "processIncidentRecovery-6-operational-checklist",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processIncidentRecovery-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processIncidentRecovery-8-verification",
          "level": 2
        },
        {
          "text": "Business context",
          "anchor": "processIncidentRecovery-9-business-context",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "processIncidentRecovery-10-customization-and-extension",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "This guide explains what happens when an automated workflow step fails and how an operator safely recovers it. Process owns the orchestration incident. The business module still owns the action and any reversal of business state."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "The recovery lifecycle",
          "anchor": "processIncidentRecovery-1-the-recovery-lifecycle"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "stateDiagram-v2\n  [*] --> Open: ACTION fails\n  Open --> Retrying: authorized retry\n  Retrying --> Resolved: action succeeds\n  Retrying --> Open: attempt fails and budget remains\n  Retrying --> DeadLetter: attempt budget exhausted\n  Open --> Compensating: authorized compensation\n  DeadLetter --> Compensating: authorized compensation\n  Compensating --> Compensated: domain adapter succeeds\n  Compensating --> DeadLetter: domain adapter fails"
        },
        {
          "kind": "paragraph",
          "text": "An ACTION failure creates one `processIncident` containing the instance, published definition version, failed node, stable error code, current attempt, maximum attempts, optional next retry time, and declarative adapter references. Raw exception payloads and secrets must not be copied into incident evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What an operator sees",
          "anchor": "processIncidentRecovery-2-what-an-operator-sees"
        },
        {
          "kind": "paragraph",
          "text": "The incident list is the recovery work queue:"
        },
        {
          "kind": "code",
          "language": "http",
          "text": "GET /nodics/process/v0/incidents?status=OPEN\nAuthorization: Bearer <access-token>"
        },
        {
          "kind": "paragraph",
          "text": "Open the incident before acting. Confirm the definition version, node, error code, attempt budget, next retry time, and related instance. Refresh if another operator may be working on the same incident."
        },
        {
          "kind": "table",
          "headers": [
            "Operation",
            "Permission",
            "Result"
          ],
          "rows": [
            [
              "List or read incidents",
              "`process.incident.read`",
              "Returns bounded recovery evidence."
            ],
            [
              "Retry failed ACTION",
              "`process.instance.retry`",
              "Re-executes the same published ACTION and continues only after success."
            ],
            [
              "Run compensation",
              "`process.instance.compensate`",
              "Dispatches the node's registered domain compensation adapter."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Retry safely",
          "anchor": "processIncidentRecovery-3-retry-safely"
        },
        {
          "kind": "paragraph",
          "text": "Send the attempt number you inspected. This optimistic check prevents an old browser tab from spending a newer retry attempt."
        },
        {
          "kind": "code",
          "language": "http",
          "text": "POST /nodics/process/v0/instances/orderApproval-001/retry\nAuthorization: Bearer <access-token>\ncontent-type: application/json\n\n{\n  \"expectedAttempt\": 1,\n  \"correlationId\": \"support-case-4831\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "On success, the incident becomes `RESOLVED` and the instance continues from the transition after the failed ACTION. On failure, the attempt increments. The incident returns to `OPEN` while budget remains or becomes `DEAD_LETTER` after the final attempt. Retry policy is bounded to ten attempts and a maximum delay of 24 hours even when project configuration is incorrect."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Compensate safely",
          "anchor": "processIncidentRecovery-4-compensate-safely"
        },
        {
          "kind": "paragraph",
          "text": "Compensation is not a generic database rollback. A workflow node may declare a registered compensation adapter, for example an Order-owned reversal command. Process invokes that adapter and records orchestration evidence; the domain module validates its own state, idempotency, authorization, and reversal rules."
        },
        {
          "kind": "code",
          "language": "http",
          "text": "POST /nodics/process/v0/instances/orderApproval-001/compensate\nAuthorization: Bearer <access-token>\ncontent-type: application/json\n\n{\n  \"payload\": {\n    \"reasonCode\": \"PAYMENT_CAPTURE_FAILED\"\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "If no compensation adapter is declared, the API fails closed. Operators must not substitute a direct database edit. If compensation fails, the incident is dead-lettered and the instance keeps `compensationStatus: FAILED` for manual investigation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer contract",
          "anchor": "processIncidentRecovery-5-developer-contract"
        },
        {
          "kind": "paragraph",
          "text": "An ACTION node can declare retry and compensation without embedding executable code in the graph:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"code\": \"reserveInventory\",\n  \"type\": \"ACTION\",\n  \"action\": {\n    \"moduleName\": \"nodics.commerce.inventory\",\n    \"operation\": \"reserve\"\n  },\n  \"retry\": {\n    \"maximumAttempts\": 3,\n    \"delayMs\": 5000\n  },\n  \"compensation\": {\n    \"moduleName\": \"nodics.commerce.inventory\",\n    \"operation\": \"release\"\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "Both declarations must exist in the configured action-adapter allowlist. The adapter implementation lives behind a domain service or facade. Unknown or unavailable adapters fail closed."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational checklist",
          "anchor": "processIncidentRecovery-6-operational-checklist"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Confirm the incident belongs to the intended tenant and instance.",
            "Read the stable error code and current attempt; never expose secrets in notes.",
            "Resolve the external cause before retrying, when applicable.",
            "Pass `expectedAttempt` and a correlation identifier.",
            "Confirm `process.incident.resolved` or `process.incident.compensated` audit evidence.",
            "Escalate dead-letter incidents instead of repeatedly bypassing policy.",
            "Test domain compensation idempotency and partial-failure behavior before production qualification."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processIncidentRecovery-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Retrying continuously without resolving the dependency or respecting bounded policy.",
            "Treating compensation as deletion of history or allowing Process to invent domain reversal behavior."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processIncidentRecovery-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Force a controlled failure, confirm incident and audit creation, test stale and unauthorized retry rejection, execute bounded retry or domain-owned compensation, and verify final state after restart. A beginner operator should rehearse this with a non-production incident before receiving recovery authority."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "processIncidentRecovery-9-business-context"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is trustworthy recovery. When a workflow fails, business users need to know whether work is paused, retriable, compensated, or escalated without losing customer trust. Recovery documentation connects the operational action to the business outcome, the responsible owner, and the evidence needed before the incident can be closed."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "processIncidentRecovery-10-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Projects may add domain-specific compensation adapters, retry policies, escalation groups, incident dashboards, and support handoff rules. The extension must preserve bounded retries, idempotency, domain-owned reversal behavior, permission checks, and audit records that survive restart."
        }
      ],
      "searchText": "Incident, Retry, and Compensation Operations Operate failed ACTION nodes through Process-owned incidents, bounded retries, dead-letter handling, and declarative domain-owned compensation. # Incident, Retry, and Compensation Operations\n\nThis guide explains what happens when an automated workflow step fails and how an operator safely recovers it. Process owns the orchestration incident. The business module still owns the action and any reversal of business state.\n\n## The recovery lifecycle\n\n```mermaid\nstateDiagram-v2\n  [*] --> Open: ACTION fails\n  Open --> Retrying: authorized retry\n  Retrying --> Resolved: action succeeds\n  Retrying --> Open: attempt fails and budget remains\n  Retrying --> DeadLetter: attempt budget exhausted\n  Open --> Compensating: authorized compensation\n  DeadLetter --> Compensating: authorized compensation\n  Compensating --> Compensated: domain adapter succeeds\n  Compensating --> DeadLetter: domain adapter fails\n```\n\nAn ACTION failure creates one `processIncident` containing the instance, published definition version, failed node, stable error code, current attempt, maximum attempts, optional next retry time, and declarative adapter references. Raw exception payloads and secrets must not be copied into incident evidence.\n\n## What an operator sees\n\nThe incident list is the recovery work queue:\n\n```http\nGET /nodics/process/v0/incidents?status=OPEN\nAuthorization: Bearer <access-token>\n```\n\nOpen the incident before acting. Confirm the definition version, node, error code, attempt budget, next retry time, and related instance. Refresh if another operator may be working on the same incident.\n\n| Operation | Permission | Result |\n| --- | --- | --- |\n| List or read incidents | `process.incident.read` | Returns bounded recovery evidence. |\n| Retry failed ACTION | `process.instance.retry` | Re-executes the same published ACTION and continues only after success. |\n| Run compensation | `process.instance.compensate` | Dispatches the node's registered domain compensation adapter. |\n\n## Retry safely\n\nSend the attempt number you inspected. This optimistic check prevents an old browser tab from spending a newer retry attempt.\n\n```http\nPOST /nodics/process/v0/instances/orderApproval-001/retry\nAuthorization: Bearer <access-token>\ncontent-type: application/json\n\n{\n  \"expectedAttempt\": 1,\n  \"correlationId\": \"support-case-4831\"\n}\n```\n\nOn success, the incident becomes `RESOLVED` and the instance continues from the transition after the failed ACTION. On failure, the attempt increments. The incident returns to `OPEN` while budget remains or becomes `DEAD_LETTER` after the final attempt. Retry policy is bounded to ten attempts and a maximum delay of 24 hours even when project configuration is incorrect.\n\n## Compensate safely\n\nCompensation is not a generic database rollback. A workflow node may declare a registered compensation adapter, for example an Order-owned reversal command. Process invokes that adapter and records orchestration evidence; the domain module validates its own state, idempotency, authorization, and reversal rules.\n\n```http\nPOST /nodics/process/v0/instances/orderApproval-001/compensate\nAuthorization: Bearer <access-token>\ncontent-type: application/json\n\n{\n  \"payload\": {\n    \"reasonCode\": \"PAYMENT_CAPTURE_FAILED\"\n  }\n}\n```\n\nIf no compensation adapter is declared, the API fails closed. Operators must not substitute a direct database edit. If compensation fails, the incident is dead-lettered and the instance keeps `compensationStatus: FAILED` for manual investigation.\n\n## Developer contract\n\nAn ACTION node can declare retry and compensation without embedding executable code in the graph:\n\n```json\n{\n  \"code\": \"reserveInventory\",\n  \"type\": \"ACTION\",\n  \"action\": {\n    \"moduleName\": \"nodics.commerce.inventory\",\n    \"operation\": \"reserve\"\n  },\n  \"retry\": {\n    \"maximumAttempts\": 3,\n    \"delayMs\": 5000\n  },\n  \"compensation\": {\n    \"moduleName\": \"nodics.commerce.inventory\",\n    \"operation\": \"release\"\n  }\n}\n```\n\nBoth declarations must exist in the configured action-adapter allowlist. The adapter implementation lives behind a domain service or facade. Unknown or unavailable adapters fail closed.\n\n## Operational checklist\n\n1. Confirm the incident belongs to the intended tenant and instance.\n2. Read the stable error code and current attempt; never expose secrets in notes.\n3. Resolve the external cause before retrying, when applicable.\n4. Pass `expectedAttempt` and a correlation identifier.\n5. Confirm `process.incident.resolved` or `process.incident.compensated` audit evidence.\n6. Escalate dead-letter incidents instead of repeatedly bypassing policy.\n7. Test domain compensation idempotency and partial-failure behavior before production qualification.\n\n## Common mistakes\n\n- Retrying continuously without resolving the dependency or respecting bounded policy.\n- Treating compensation as deletion of history or allowing Process to invent domain reversal behavior.\n\n## Verification\n\nForce a controlled failure, confirm incident and audit creation, test stale and unauthorized retry rejection, execute bounded retry or domain-owned compensation, and verify final state after restart. A beginner operator should rehearse this with a non-production incident before receiving recovery authority.\n\n## Business context\n\nThe business problem is trustworthy recovery. When a workflow fails, business users need to know whether work is paused, retriable, compensated, or escalated without losing customer trust. Recovery documentation connects the operational action to the business outcome, the responsible owner, and the evidence needed before the incident can be closed.\n\n## Customization and extension\n\nProjects may add domain-specific compensation adapters, retry policies, escalation groups, incident dashboards, and support handoff rules. The extension must preserve bounded retries, idempotency, domain-owned reversal behavior, permission checks, and audit records that survive restart.\n",
      "previous": {
        "title": "Commerce enterprise operations and migration",
        "route": "/docs/framework/commerce-enterprise-operations"
      },
      "next": {
        "title": "DevOps and Runtime Topology",
        "route": "/docs/framework/process/devops-topology"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 699,
        "checksum": "6ad5cce73cbcf3448e9d0d5dfcb879b5e03483bf7dbc241f567e4377fdf8c233"
      },
      "slug": "incident-recovery",
      "locale": "en",
      "navigationGroup": "Process Incident Recovery",
      "navigationGroupCode": "process-incident-recovery",
      "navigationGroupOrder": 40,
      "navigationOrder": 40,
      "references": [
        {
          "documentId": "process.runtime-lifecycle",
          "owner": "workflow"
        },
        {
          "documentId": "process.qa-regression-guide",
          "owner": "workflow"
        }
      ]
    },
    "active": true
  },
  "record13": {
    "code": "nodicsDocsComponentprocessDevopsTopology",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.devops-topology",
      "title": "DevOps and Runtime Topology",
      "route": "/docs/framework/process/devops-topology",
      "section": "operations-monitoring-and-recovery",
      "sectionTitle": "Operations, Monitoring, and Recovery",
      "group": "operations-monitoring-and-recovery",
      "groupTitle": "Operations, Monitoring, and Recovery",
      "parentId": "operations-monitoring-and-recovery",
      "hierarchyPath": [
        "Operations, Monitoring, and Recovery",
        "DevOps and Runtime Topology"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
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
      "summary": "Explain deployment topology, observability, fresh bootstrap evidence, and production sustainability for Process runtimes.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "process.overview",
        "framework.devops-runtime"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "lifecycle-state-diagram",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "operations-monitoring-and-recovery",
        "process-runtime-topology",
        "devops-and-runtime-topology"
      ],
      "topicKeywords": [
        "Operations, Monitoring, and Recovery",
        "Process Runtime Topology",
        "DevOps and Runtime Topology"
      ],
      "headings": [
        {
          "text": "Runtime shape",
          "anchor": "processDevopsTopology-1-runtime-shape",
          "level": 2
        },
        {
          "text": "Fresh bootstrap evidence",
          "anchor": "processDevopsTopology-2-fresh-bootstrap-evidence",
          "level": 2
        },
        {
          "text": "What to monitor",
          "anchor": "processDevopsTopology-3-what-to-monitor",
          "level": 2
        },
        {
          "text": "Failure and recovery",
          "anchor": "processDevopsTopology-4-failure-and-recovery",
          "level": 2
        },
        {
          "text": "Release discipline",
          "anchor": "processDevopsTopology-5-release-discipline",
          "level": 2
        },
        {
          "text": "Continue",
          "anchor": "processDevopsTopology-6-continue",
          "level": 2
        },
        {
          "text": "Deployment qualification evidence",
          "anchor": "processDevopsTopology-7-deployment-qualification-evidence",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processDevopsTopology-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processDevopsTopology-9-verification",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "processDevopsTopology-10-customization-and-extension",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Operations teams need Process to be understandable after deployment, not only during development. This page explains how Process should be deployed, observed, tested, and sustained."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime shape",
          "anchor": "processDevopsTopology-1-runtime-shape"
        },
        {
          "kind": "paragraph",
          "text": "In local Kickoff, Process runs in the Business Process & Automation runtime. That server can include `nodics.process` and `nodics.foundation`; `nodics.process` loads the sibling `workflow` and `cronjob` modules."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TB\n  Axis[\"nodics.axis browser\"] --> Platform[\"Platform server\"]\n  Axis --> Wcms[\"WCMS server\"]\n  Axis --> ProcessServer[\"Process server\"]\n  ProcessServer --> Process[\"nodics.process\"]\n  Process --> Workflow[\"workflow\"]\n  Process --> CronJob[\"cronjob\"]\n  ProcessServer --> Core[\"nodics.foundation\"]\n  Workflow --> Mongo[\"Process database\"]\n  CronJob --> Mongo"
        },
        {
          "kind": "paragraph",
          "text": "Sharing a runtime is a deployment decision, not an ownership merge. Process still owns process instances, tasks, triggers, and audit. Cronjob still owns job definitions, scheduler state, firing, retry, and job execution lifecycle."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Fresh bootstrap evidence",
          "anchor": "processDevopsTopology-2-fresh-bootstrap-evidence"
        },
        {
          "kind": "paragraph",
          "text": "The local fresh acceptance test drops only local Kickoff databases, starts the runtime servers, imports documentation packs, verifies Axis routes, logs in as admin, exercises Process APIs, and runs Cron lifecycle operations."
        },
        {
          "kind": "paragraph",
          "text": "This is the minimum confidence gate before saying the local stack is healthy."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What to monitor",
          "anchor": "processDevopsTopology-3-what-to-monitor"
        },
        {
          "kind": "table",
          "headers": [
            "Signal",
            "Why it matters"
          ],
          "rows": [
            [
              "Process server readiness",
              "Axis process screens depend on this API."
            ],
            [
              "Definition publish failures",
              "Bad graph contracts block operations."
            ],
            [
              "Waiting task count",
              "Shows work stuck with humans or queues."
            ],
            [
              "Failed/cancelled instance count",
              "Reveals broken policy or domain integration."
            ],
            [
              "Trigger status distribution",
              "Shows scheduled automation posture."
            ],
            [
              "Audit event volume",
              "Confirms runtime evidence is being written."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Failure and recovery",
          "anchor": "processDevopsTopology-4-failure-and-recovery"
        },
        {
          "kind": "paragraph",
          "text": "If Axis can load but Process APIs fail, Axis should show recovery or unavailable states. Do not fake process data in the browser."
        },
        {
          "kind": "paragraph",
          "text": "If Process starts but trigger creation fails, check:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "`workflow` includes the `processTrigger` schema;",
            "generated trigger service/facade artifacts are loader-visible;",
            "route permissions exist in the identity catalog;",
            "the referenced definition exists and is safe to use;",
            "fresh acceptance passes from zero database state."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Release discipline",
          "anchor": "processDevopsTopology-5-release-discipline"
        },
        {
          "kind": "paragraph",
          "text": "Process changes are release-sensitive because they can affect long-running instances. Always ask:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Is the schema backward compatible?",
            "Are published versions immutable?",
            "Can older instances still be inspected?",
            "Does a new route have a dedicated permission?",
            "Does the change preserve tenant and audit boundaries?",
            "Can a customer override the behavior without editing framework source?"
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue",
          "anchor": "processDevopsTopology-6-continue"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Process and Cronjob Shared Runtime](/docs/framework/process/process-cron-runtime)",
            "[Developer Customization Guide](/docs/framework/process/developer-customization)"
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Deployment qualification evidence",
          "anchor": "processDevopsTopology-7-deployment-qualification-evidence"
        },
        {
          "kind": "paragraph",
          "text": "Before production promotion, capture the effective module graph, sanitized configuration source order, health and readiness results, imported release versions, database migration state, Process registration, queue or scheduler dependencies, and smoke-test correlation identifiers. Keep this evidence environment-specific and reproducible; a screenshot of listening ports is not a deployment record."
        },
        {
          "kind": "paragraph",
          "text": "Exercise at least one controlled dependency outage and one runtime restart. Verify that inflight work is either resumed, retried within policy, or surfaced as an incident, and that no second scheduler or duplicate execution path starts during recovery."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processDevopsTopology-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Starting a standalone cronjob server when cronjob is intentionally composed into Process.",
            "Treating a listening port as proof that persistence, imports, health, permissions, and recovery work."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processDevopsTopology-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Use the bounded fresh-bootstrap acceptance path, verify health and readiness, inspect error-level startup logs, confirm Process observation with workflow and cronjob technical modules, and exercise restart and dependency-failure recovery. A beginner operator should follow the documented server order before changing topology."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "processDevopsTopology-10-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Projects may extend topology with additional servers, queues, workers, database roles, cache providers, search providers, or deployment targets. The extension must keep runtime ownership explicit, avoid duplicate scheduler or workflow authorities, and document the business impact of each environment dependency."
        }
      ],
      "searchText": "DevOps and Runtime Topology Explain deployment topology, observability, fresh bootstrap evidence, and production sustainability for Process runtimes. # DevOps and Runtime Topology\n\nOperations teams need Process to be understandable after deployment, not only during development. This page explains how Process should be deployed, observed, tested, and sustained.\n\n## Runtime shape\n\nIn local Kickoff, Process runs in the Business Process & Automation runtime. That server can include `nodics.process` and `nodics.foundation`; `nodics.process` loads the sibling `workflow` and `cronjob` modules.\n\n```mermaid\nflowchart TB\n  Axis[\"nodics.axis browser\"] --> Platform[\"Platform server\"]\n  Axis --> Wcms[\"WCMS server\"]\n  Axis --> ProcessServer[\"Process server\"]\n  ProcessServer --> Process[\"nodics.process\"]\n  Process --> Workflow[\"workflow\"]\n  Process --> CronJob[\"cronjob\"]\n  ProcessServer --> Core[\"nodics.foundation\"]\n  Workflow --> Mongo[\"Process database\"]\n  CronJob --> Mongo\n```\n\nSharing a runtime is a deployment decision, not an ownership merge. Process still owns process instances, tasks, triggers, and audit. Cronjob still owns job definitions, scheduler state, firing, retry, and job execution lifecycle.\n\n## Fresh bootstrap evidence\n\nThe local fresh acceptance test drops only local Kickoff databases, starts the runtime servers, imports documentation packs, verifies Axis routes, logs in as admin, exercises Process APIs, and runs Cron lifecycle operations.\n\nThis is the minimum confidence gate before saying the local stack is healthy.\n\n## What to monitor\n\n| Signal | Why it matters |\n| --- | --- |\n| Process server readiness | Axis process screens depend on this API. |\n| Definition publish failures | Bad graph contracts block operations. |\n| Waiting task count | Shows work stuck with humans or queues. |\n| Failed/cancelled instance count | Reveals broken policy or domain integration. |\n| Trigger status distribution | Shows scheduled automation posture. |\n| Audit event volume | Confirms runtime evidence is being written. |\n\n## Failure and recovery\n\nIf Axis can load but Process APIs fail, Axis should show recovery or unavailable states. Do not fake process data in the browser.\n\nIf Process starts but trigger creation fails, check:\n\n1. `workflow` includes the `processTrigger` schema;\n2. generated trigger service/facade artifacts are loader-visible;\n3. route permissions exist in the identity catalog;\n4. the referenced definition exists and is safe to use;\n5. fresh acceptance passes from zero database state.\n\n## Release discipline\n\nProcess changes are release-sensitive because they can affect long-running instances. Always ask:\n\n- Is the schema backward compatible?\n- Are published versions immutable?\n- Can older instances still be inspected?\n- Does a new route have a dedicated permission?\n- Does the change preserve tenant and audit boundaries?\n- Can a customer override the behavior without editing framework source?\n\n## Continue\n\n- [Process and Cronjob Shared Runtime](/docs/framework/process/process-cron-runtime)\n- [Developer Customization Guide](/docs/framework/process/developer-customization)\n\n## Deployment qualification evidence\n\nBefore production promotion, capture the effective module graph, sanitized configuration source order, health and readiness results, imported release versions, database migration state, Process registration, queue or scheduler dependencies, and smoke-test correlation identifiers. Keep this evidence environment-specific and reproducible; a screenshot of listening ports is not a deployment record.\n\nExercise at least one controlled dependency outage and one runtime restart. Verify that inflight work is either resumed, retried within policy, or surfaced as an incident, and that no second scheduler or duplicate execution path starts during recovery.\n\n## Common mistakes\n\n- Starting a standalone cronjob server when cronjob is intentionally composed into Process.\n- Treating a listening port as proof that persistence, imports, health, permissions, and recovery work.\n\n## Verification\n\nUse the bounded fresh-bootstrap acceptance path, verify health and readiness, inspect error-level startup logs, confirm Process observation with workflow and cronjob technical modules, and exercise restart and dependency-failure recovery. A beginner operator should follow the documented server order before changing topology.\n\n## Customization and extension\n\nProjects may extend topology with additional servers, queues, workers, database roles, cache providers, search providers, or deployment targets. The extension must keep runtime ownership explicit, avoid duplicate scheduler or workflow authorities, and document the business impact of each environment dependency.\n",
      "previous": {
        "title": "Incident, Retry, and Compensation Operations",
        "route": "/docs/framework/process/incident-recovery"
      },
      "next": {
        "title": "Process QA and Regression Guide",
        "route": "/docs/framework/process/qa-regression-guide"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 582,
        "checksum": "743c63380587bbd905bae0a19da2f664d22d93b3bb2abfadb81061967a8dcdaa"
      },
      "slug": "devops-topology",
      "locale": "en",
      "navigationGroup": "Process Runtime Topology",
      "navigationGroupCode": "process-runtime-topology",
      "navigationGroupOrder": 50,
      "navigationOrder": 50,
      "references": [
        {
          "documentId": "process.overview",
          "owner": "workflow"
        },
        {
          "documentId": "framework.devops-runtime",
          "owner": "nTooling"
        }
      ]
    },
    "active": true
  },
  "record14": {
    "code": "nodicsDocsComponentprocessQaRegressionGuide",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "process.qa-regression-guide",
      "title": "Process QA and Regression Guide",
      "route": "/docs/framework/process/qa-regression-guide",
      "section": "quality-testing-and-certification",
      "sectionTitle": "Quality, Testing, and Certification",
      "group": "quality-testing-and-certification",
      "groupTitle": "Quality, Testing, and Certification",
      "parentId": "quality-testing-and-certification",
      "hierarchyPath": [
        "Quality, Testing, and Certification",
        "Process QA and Regression Guide"
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
      "summary": "Define backend, fresh database, Axis smoke, and negative regression checks for Process and Cron automation.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "process.incident-recovery",
        "framework.local-verification-checklist"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "troubleshooting-matrix",
        "command-example"
      ],
      "searchKeywords": [
        "quality-testing-and-certification",
        "process-regression-evidence",
        "process-qa-and-regression-guide"
      ],
      "topicKeywords": [
        "Quality, Testing, and Certification",
        "Process Regression Evidence",
        "Process QA and Regression Guide"
      ],
      "headings": [
        {
          "text": "Minimum backend regression",
          "anchor": "processQaRegressionGuide-1-minimum-backend-regression",
          "level": 2
        },
        {
          "text": "Fresh database acceptance",
          "anchor": "processQaRegressionGuide-2-fresh-database-acceptance",
          "level": 2
        },
        {
          "text": "Manual Axis smoke checklist",
          "anchor": "processQaRegressionGuide-3-manual-axis-smoke-checklist",
          "level": 2
        },
        {
          "text": "Negative tests that matter",
          "anchor": "processQaRegressionGuide-4-negative-tests-that-matter",
          "level": 2
        },
        {
          "text": "Regression evidence matrix",
          "anchor": "processQaRegressionGuide-5-regression-evidence-matrix",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "processQaRegressionGuide-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "processQaRegressionGuide-7-verification",
          "level": 2
        },
        {
          "text": "Business context",
          "anchor": "processQaRegressionGuide-8-business-context",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "processQaRegressionGuide-9-customization-and-extension",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Process automation touches business operations, so small bugs can become noisy in production. QA must test both the happy path and the boundaries."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Minimum backend regression",
          "anchor": "processQaRegressionGuide-1-minimum-backend-regression"
        },
        {
          "kind": "paragraph",
          "text": "Run the Process contract suite:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "cd nodics.ai/nodics.process\nnpm test"
        },
        {
          "kind": "paragraph",
          "text": "This validates module structure, secured routes, permission catalog coverage, generated schemas, graph validation, definition lifecycle, operation inspection, runtime lifecycle, trigger execution, and action adapter blocking."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Fresh database acceptance",
          "anchor": "processQaRegressionGuide-2-fresh-database-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "From the reference customer project, run the fresh local acceptance when you need evidence that bootstrap, imports, module registration, Axis content, and runtime servers still cooperate:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "cd nodics.kickoff\nnpm run acceptance:local:fresh"
        },
        {
          "kind": "paragraph",
          "text": "This is heavier than unit tests, but it catches integration drift."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Manual Axis smoke checklist",
          "anchor": "processQaRegressionGuide-3-manual-axis-smoke-checklist"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Login to Axis.",
            "Open Business Process & Automation.",
            "Create a sample draft.",
            "Save a graph change in Designer.",
            "Validate the draft.",
            "Publish the draft.",
            "Start an instance.",
            "Claim and complete a task.",
            "Create a scheduled trigger relationship.",
            "Activate and execute the trigger.",
            "Confirm a new instance appears.",
            "Open the timeline and verify audit evidence."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Negative tests that matter",
          "anchor": "processQaRegressionGuide-4-negative-tests-that-matter"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Unknown action adapter must fail.",
            "Paused or archived trigger must not execute.",
            "Draft definition must not start.",
            "Archived trigger must not update.",
            "User without Process permission must be denied.",
            "Axis refresh must not be required after every operation."
          ]
        },
        {
          "kind": "paragraph",
          "text": "If these fail, stop and fix the contract before adding more UI."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Regression evidence matrix",
          "anchor": "processQaRegressionGuide-5-regression-evidence-matrix"
        },
        {
          "kind": "table",
          "headers": [
            "Layer",
            "Positive proof",
            "Negative or recovery proof"
          ],
          "rows": [
            [
              "Definition",
              "Valid graph saves, validates, and publishes.",
              "Invalid transition, unsupported node, and stale version are rejected."
            ],
            [
              "Runtime",
              "Published definition starts and reaches the expected terminal state.",
              "Failure creates an incident and restart preserves durable state."
            ],
            [
              "Task",
              "Authorized user claims and completes a task.",
              "Unauthorized, expired, and competing updates are rejected."
            ],
            [
              "Action",
              "Registered adapter executes once with bounded output.",
              "Unknown adapter, timeout, duplicate delivery, and malformed output fail safely."
            ],
            [
              "Trigger",
              "Active trigger executes with correlation and audit.",
              "Inactive or unauthorized trigger does not execute."
            ],
            [
              "Cron composition",
              "Process and Cron are observed in processServer.",
              "No standalone Cron listener or duplicate schedule authority exists."
            ],
            [
              "Axis",
              "Authorized pages render current backend state.",
              "Deep links and actions remain guarded when permission or module availability is absent."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The regression run starts with deterministic contract tests, then uses an empty local database so every schema, import release, registration, and default record must be rebuilt from source. It finishes with retained-data acceptance to prove repeatability and immutable release handling. Manual database edits invalidate the result because they hide missing generators or import contracts."
        },
        {
          "kind": "paragraph",
          "text": "A beginner developer should record the exact command, commit, environment, runtime graph, database names, and outcome. Production qualification adds dependency outage, restart, concurrency, capacity, redaction, and rollback evidence. Operators should inspect error-level startup output and persisted incidents instead of relying only on exit code or HTTP 200."
        },
        {
          "kind": "paragraph",
          "text": "Security regression covers cross-tenant identifiers, missing and insufficient permissions, malformed graph metadata, oversized input, executable strings, secret-bearing output, replayed correlation identifiers, and unauthorized recovery. Performance regression covers large but bounded graphs, navigation, task queues, audit history, and retry storms. Each boundary needs a documented limit and a stable rejection or degradation behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "processQaRegressionGuide-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Testing only successful API responses while skipping permissions, stale state, retry bounds, recovery, and restart behavior.",
            "Accepting UI refresh workarounds or manually repaired database records as valid regression evidence."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "processQaRegressionGuide-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run the complete Process contract suite and bounded fresh local acceptance against empty databases, then repeat the live smoke against retained data and inspect startup logs for error-level output. A beginner developer should be able to follow the same regression sequence without manual database repair."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "processQaRegressionGuide-8-business-context"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is release confidence. Regression testing proves that a workflow change still supports the promised business journey, not only that an API returned success once. Business users need evidence for approvals, exceptions, recovery, accessibility, and customer-impact risks before a workflow or automation change is promoted."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "processQaRegressionGuide-9-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Projects may add regression journeys for tenant rules, domain adapters, industry accelerators, custom forms, integration providers, and dashboards. Each extension must include positive behavior, negative behavior, recovery, permission denial, data integrity, and operator evidence so the result is useful beyond a developer's local machine."
        }
      ],
      "searchText": "Process QA and Regression Guide Define backend, fresh database, Axis smoke, and negative regression checks for Process and Cron automation. # Process QA and Regression Guide\n\nProcess automation touches business operations, so small bugs can become noisy in production. QA must test both the happy path and the boundaries.\n\n## Minimum backend regression\n\nRun the Process contract suite:\n\n```bash\ncd nodics.ai/nodics.process\nnpm test\n```\n\nThis validates module structure, secured routes, permission catalog coverage, generated schemas, graph validation, definition lifecycle, operation inspection, runtime lifecycle, trigger execution, and action adapter blocking.\n\n## Fresh database acceptance\n\nFrom the reference customer project, run the fresh local acceptance when you need evidence that bootstrap, imports, module registration, Axis content, and runtime servers still cooperate:\n\n```bash\ncd nodics.kickoff\nnpm run acceptance:local:fresh\n```\n\nThis is heavier than unit tests, but it catches integration drift.\n\n## Manual Axis smoke checklist\n\n1. Login to Axis.\n2. Open Business Process & Automation.\n3. Create a sample draft.\n4. Save a graph change in Designer.\n5. Validate the draft.\n6. Publish the draft.\n7. Start an instance.\n8. Claim and complete a task.\n9. Create a scheduled trigger relationship.\n10. Activate and execute the trigger.\n11. Confirm a new instance appears.\n12. Open the timeline and verify audit evidence.\n\n## Negative tests that matter\n\n- Unknown action adapter must fail.\n- Paused or archived trigger must not execute.\n- Draft definition must not start.\n- Archived trigger must not update.\n- User without Process permission must be denied.\n- Axis refresh must not be required after every operation.\n\nIf these fail, stop and fix the contract before adding more UI.\n\n## Regression evidence matrix\n\n| Layer | Positive proof | Negative or recovery proof |\n| --- | --- | --- |\n| Definition | Valid graph saves, validates, and publishes. | Invalid transition, unsupported node, and stale version are rejected. |\n| Runtime | Published definition starts and reaches the expected terminal state. | Failure creates an incident and restart preserves durable state. |\n| Task | Authorized user claims and completes a task. | Unauthorized, expired, and competing updates are rejected. |\n| Action | Registered adapter executes once with bounded output. | Unknown adapter, timeout, duplicate delivery, and malformed output fail safely. |\n| Trigger | Active trigger executes with correlation and audit. | Inactive or unauthorized trigger does not execute. |\n| Cron composition | Process and Cron are observed in processServer. | No standalone Cron listener or duplicate schedule authority exists. |\n| Axis | Authorized pages render current backend state. | Deep links and actions remain guarded when permission or module availability is absent. |\n\nThe regression run starts with deterministic contract tests, then uses an empty local database so every schema, import release, registration, and default record must be rebuilt from source. It finishes with retained-data acceptance to prove repeatability and immutable release handling. Manual database edits invalidate the result because they hide missing generators or import contracts.\n\nA beginner developer should record the exact command, commit, environment, runtime graph, database names, and outcome. Production qualification adds dependency outage, restart, concurrency, capacity, redaction, and rollback evidence. Operators should inspect error-level startup output and persisted incidents instead of relying only on exit code or HTTP 200.\n\nSecurity regression covers cross-tenant identifiers, missing and insufficient permissions, malformed graph metadata, oversized input, executable strings, secret-bearing output, replayed correlation identifiers, and unauthorized recovery. Performance regression covers large but bounded graphs, navigation, task queues, audit history, and retry storms. Each boundary needs a documented limit and a stable rejection or degradation behavior.\n\n## Common mistakes\n\n- Testing only successful API responses while skipping permissions, stale state, retry bounds, recovery, and restart behavior.\n- Accepting UI refresh workarounds or manually repaired database records as valid regression evidence.\n\n## Verification\n\nRun the complete Process contract suite and bounded fresh local acceptance against empty databases, then repeat the live smoke against retained data and inspect startup logs for error-level output. A beginner developer should be able to follow the same regression sequence without manual database repair.\n\n## Business context\n\nThe business problem is release confidence. Regression testing proves that a workflow change still supports the promised business journey, not only that an API returned success once. Business users need evidence for approvals, exceptions, recovery, accessibility, and customer-impact risks before a workflow or automation change is promoted.\n\n## Customization and extension\n\nProjects may add regression journeys for tenant rules, domain adapters, industry accelerators, custom forms, integration providers, and dashboards. Each extension must include positive behavior, negative behavior, recovery, permission denial, data integrity, and operator evidence so the result is useful beyond a developer's local machine.\n",
      "previous": {
        "title": "DevOps and Runtime Topology",
        "route": "/docs/framework/process/devops-topology"
      },
      "next": {
        "title": "Capability documentation maturity pattern",
        "route": "/docs/framework/framework-capability-documentation-maturity-pattern"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.process",
        "technicalModule": "workflow",
        "owner": "workflow",
        "sourcePath": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/workflowDocumentationComponentData.js",
        "wordCount": 695,
        "checksum": "c99c21794e02e6cfea33f1f07dc596561e90b0a13e2fd0336c1a53fef100c22d"
      },
      "slug": "qa-regression-guide",
      "locale": "en",
      "navigationGroup": "Process Regression Evidence",
      "navigationGroupCode": "process-regression-evidence",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "process.incident-recovery",
          "owner": "workflow"
        },
        {
          "documentId": "framework.local-verification-checklist",
          "owner": "nTooling"
        }
      ]
    },
    "active": true
  }
};
