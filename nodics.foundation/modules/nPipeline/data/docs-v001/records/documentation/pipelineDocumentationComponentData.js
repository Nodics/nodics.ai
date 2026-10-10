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
    "code": "nodicsDocsComponentpipelineBusinessLogicOrchestration",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "pipeline.business-logic-orchestration",
      "title": "Pipeline and Business Logic Orchestration",
      "route": "/docs/framework/pipeline-business-logic-orchestration",
      "section": "pipeline-and-business-logic-orchestration",
      "sectionTitle": "Pipeline and Business Logic Orchestration",
      "group": "pipeline-and-business-logic-orchestration",
      "groupTitle": "Pipeline and Business Logic Orchestration",
      "parentId": "pipeline-and-business-logic-orchestration",
      "hierarchyPath": [
        "Pipeline and Business Logic Orchestration",
        "Pipeline and Business Logic Orchestration"
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
      "summary": "How Nodics pipelines compose validation, enrichment, decisioning, side effects, events, and project-layer business logic.",
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
        "commerce.cart-order",
        "runtime.governed-change",
        "routing.api-request-lifecycle",
        "process.workflow-orchestration-patterns",
        "foundation.module-to-module-communication"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "src/service/pipeline/defaultPipelineService.js",
        "src/lib/pipelineHead.js",
        "src/lib/pipelineNode.js",
        "src/pipelines/pipelines.js",
        "../../../nodics.commerce/modules/checkout/modules/cart/src/service/defaultCartOperationService.js",
        "../../../nodics.platform/modules/profile/src/service/customer/defaultCustomerService.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "pipeline-and-business-logic-orchestration",
        "pipeline-execution-model",
        "pipeline-and-business-logic-orchestration",
        "PipelineHead",
        "PipelineNode",
        "DefaultPipelineService.start",
        "startNode",
        "process.nextSuccess",
        "process.stop",
        "process.error",
        "response.targetNode",
        "hardStop",
        "nested pipeline"
      ],
      "topicKeywords": [
        "Pipeline and Business Logic Orchestration",
        "Pipeline Execution Model",
        "Pipeline and Business Logic Orchestration"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "pipelineBusinessLogicOrchestration-1-business-context",
          "level": 2
        },
        {
          "text": "Runtime model",
          "anchor": "pipelineBusinessLogicOrchestration-2-runtime-model",
          "level": 2
        },
        {
          "text": "Pipeline lifecycle",
          "anchor": "pipelineBusinessLogicOrchestration-3-pipeline-lifecycle",
          "level": 2
        },
        {
          "text": "Data and configuration detail",
          "anchor": "pipelineBusinessLogicOrchestration-4-data-and-configuration-detail",
          "level": 2
        },
        {
          "text": "Author a pipeline",
          "anchor": "pipelineBusinessLogicOrchestration-5-author-a-pipeline",
          "level": 2
        },
        {
          "text": "Call a pipeline",
          "anchor": "pipelineBusinessLogicOrchestration-6-call-a-pipeline",
          "level": 2
        },
        {
          "text": "Pass data through a pipeline",
          "anchor": "pipelineBusinessLogicOrchestration-7-pass-data-through-a-pipeline",
          "level": 2
        },
        {
          "text": "Node handler contract",
          "anchor": "pipelineBusinessLogicOrchestration-8-node-handler-contract",
          "level": 2
        },
        {
          "text": "Add, remove, or reorder nodes",
          "anchor": "pipelineBusinessLogicOrchestration-9-add-remove-or-reorder-nodes",
          "level": 2
        },
        {
          "text": "Branching and target nodes",
          "anchor": "pipelineBusinessLogicOrchestration-10-branching-and-target-nodes",
          "level": 2
        },
        {
          "text": "Nested pipelines",
          "anchor": "pipelineBusinessLogicOrchestration-11-nested-pipelines",
          "level": 2
        },
        {
          "text": "Error lifecycle",
          "anchor": "pipelineBusinessLogicOrchestration-12-error-lifecycle",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "pipelineBusinessLogicOrchestration-13-customization-and-extension",
          "level": 2
        },
        {
          "text": "Related developer guides",
          "anchor": "pipelineBusinessLogicOrchestration-14-related-developer-guides",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "pipelineBusinessLogicOrchestration-15-operations-and-governance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "pipelineBusinessLogicOrchestration-16-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "pipelineBusinessLogicOrchestration-17-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Pipelines are the main Nodics mechanism for composing business logic without hiding decisions inside controllers or copying rules across services. A pipeline is a named runtime flow made of ordered nodes. Each node calls a service operation or another pipeline, then chooses the next success or error path. This page is for beginners, business users, developers, the operator role, QA owners, architects, and AI tools that need to understand how a Nodics behavior is assembled and where project-specific customization belongs."
        },
        {
          "kind": "paragraph",
          "text": "For business users, pipelines make complex work auditable: cart calculation, checkout placement, schema persistence, import, cron execution, workflow transitions, request processing, and event handling can be explained as visible steps rather than hidden code. For developers, pipelines are the extension point that keeps business behavior modular. A project can add validation, enrichment, decisioning, routing, or recovery steps while preserving the owning module contract."
        },
        {
          "kind": "paragraph",
          "text": "This page explains the generic pipeline execution model. The HTTP entry pipeline has its own developer guide, `API Request Lifecycle and Handler Pipeline`, because request parsing, route exposure, authentication branching, cache lookup, controller dispatch, response handlers, and safe HTTP customization need to be understood as one end-to-end flow."
        },
        {
          "kind": "paragraph",
          "text": "Use `Workflow Orchestration Patterns` when the business journey needs durable state, human tasks, approval, retry, compensation, target-specific export branches, or operator recovery. A product export can use pipelines inside domain adapters, but the long-running approval and multi-target lifecycle belongs to workflow."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "pipelineBusinessLogicOrchestration-1-business-context"
        },
        {
          "kind": "paragraph",
          "text": "The practical business problem is change control. Enterprises need to change a rule such as \"calculate price, then promotion, then tax\" or \"validate data, save, invalidate cache, publish event\" without rewriting the entire API stack. Pipelines give business teams a language for the journey and give developers a deterministic execution model."
        },
        {
          "kind": "table",
          "headers": [
            "Business need",
            "Pipeline answer"
          ],
          "rows": [
            [
              "Explain what happens during a request",
              "Show the named pipeline, ordered nodes, decision branches, and final terminal."
            ],
            [
              "Customize a project rule",
              "Add or override a pipeline definition in a later project module."
            ],
            [
              "Support governed runtime behavior",
              "Merge persisted pipeline models when available and refresh them through events."
            ],
            [
              "Troubleshoot a failed journey",
              "Error metadata records pipeline name, execution id, node, handler, tenant, module, schema, event, search, or import context."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime model",
          "anchor": "pipelineBusinessLogicOrchestration-2-runtime-model"
        },
        {
          "kind": "paragraph",
          "text": "`DefaultPipelineService` loads effective pipeline definitions from every active module by reading `/src/pipelines/pipelines.js` and the compatibility name `/src/pipelines/pipelinesDefinition.js`. It stores the result in the global `PIPELINE` registry. When a persisted `PipelineModel` is available, persisted definitions are merged on top of file definitions for the default tenant."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Modules[\"Active modules\"] --> Files[\"Pipeline files\"]\n  Files --> Registry[\"Global PIPELINE registry\"]\n  Persisted[\"Persisted PipelineModel\"] --> Registry\n  Request[\"Service calls DefaultPipelineService.start\"] --> Head[\"PipelineHead\"]\n  Head --> Node[\"PipelineNode\"]\n  Node --> Handler[\"Service operation or nested pipeline\"]\n  Handler --> Success[\"successEnd\"]\n  Handler --> Error[\"handleError\"]"
        },
        {
          "kind": "paragraph",
          "text": "`PipelineHead` builds executable `PipelineNode` instances from the definition, starts at `startNode`, prepares success transitions, supports `targetNode` branching, calls service handlers as `SERVICE[ServiceName][operation]`, and can execute nested pipelines when a node type is not `function`. A successful pipeline resolves through `DefaultPipelineService.handleSucessEnd`. A failed pipeline enriches the error and rejects through `handleErrorEnd`."
        },
        {
          "kind": "table",
          "headers": [
            "Source area",
            "Purpose",
            "Runtime effect"
          ],
          "rows": [
            [
              "`nPipeline/src/pipelines/pipelines.js`",
              "Defines `defaultPipeline` terminal nodes.",
              "Adds `successEnd` and `handleError` to concrete flows."
            ],
            [
              "`DefaultPipelineService.loadPipelines`",
              "Loads file and persisted definitions.",
              "Builds the effective registry."
            ],
            [
              "`PipelineHead.prepareNextNode`",
              "Reads success transitions.",
              "Moves to the next node or routes to error handling."
            ],
            [
              "`PipelineHead.buildErrorContext`",
              "Enriches errors from request shape.",
              "Adds database, search, event, import, tenant, module, and handler context."
            ],
            [
              "`DefaultPipelineChangeListenerService`",
              "Handles runtime pipeline events.",
              "Updates or removes registry entries without restarting every caller."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Pipeline lifecycle",
          "anchor": "pipelineBusinessLogicOrchestration-3-pipeline-lifecycle"
        },
        {
          "kind": "paragraph",
          "text": "Every pipeline run follows the same lifecycle, whether it is started by an API request, import process, cron job, event listener, checkout flow, or a custom project service."
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
              "1. Startup discovery",
              "Active modules contribute pipeline files into the effective registry.",
              "Put baseline definitions in the owning module or in the project module that intentionally overrides the behavior."
            ],
            [
              "2. Persisted merge",
              "Persisted `PipelineModel` records are merged when the model service is available.",
              "Runtime-managed changes are overlays, not a second hidden framework."
            ],
            [
              "3. Registry ready",
              "The named definition becomes available as `PIPELINE[pipelineName]`.",
              "A caller can only start a concrete pipeline name, never `defaultPipeline`."
            ],
            [
              "4. Caller starts",
              "A service calls `DefaultPipelineService.start(name, request, response)`.",
              "Pass all business inputs through `request`; use `response` as the execution accumulator."
            ],
            [
              "5. Definition build",
              "`defaultPipeline` terminal nodes are merged into the concrete definition.",
              "Every concrete flow inherits `successEnd` and `handleError`."
            ],
            [
              "6. Node execution",
              "`PipelineHead` executes the current node as a service function or nested pipeline.",
              "A node handler owns one small piece of behavior."
            ],
            [
              "7. Transition",
              "The node calls `process.nextSuccess`, `process.stop`, or `process.error`.",
              "The handler must explicitly choose the next lifecycle move."
            ],
            [
              "8. Branching",
              "A string `success` link goes directly to one node; an object `success` map uses `response.targetNode`.",
              "Use branching when the same decision node can choose multiple valid routes."
            ],
            [
              "9. Success terminal",
              "`successEnd` resolves the promise with `response.success`.",
              "The caller receives the normalized success payload."
            ],
            [
              "10. Error terminal",
              "Errors are enriched and routed to node-level error handling or the global `handleError`.",
              "The caller receives a contextual Nodics error, not a raw exception."
            ],
            [
              "11. Runtime refresh",
              "Pipeline update and removal events mutate the global registry.",
              "Changes can be propagated without rewriting the caller."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The lifecycle has one important design rule: pipeline definitions describe orchestration, not business logic. Business logic belongs in services. The pipeline should say \"validate product\", \"resolve media\", \"save model\", or \"publish event\"; the handler service should contain the actual rule."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Data and configuration detail",
          "anchor": "pipelineBusinessLogicOrchestration-4-data-and-configuration-detail"
        },
        {
          "kind": "paragraph",
          "text": "Pipeline definitions are JavaScript objects contributed by modules. The minimum concrete pipeline defines `startNode` and `nodes`. A node must define a handler; it may define `type`, `success`, `error`, and target routing. The default node type is `function`."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  commerceCartCalculationPipeline: {\n    startNode: 'validateContext',\n    nodes: {\n      validateContext: {\n        handler: 'DefaultCartCalculationPipelineService.validateContext',\n        success: 'resolvePrice'\n      },\n      resolvePrice: {\n        handler: 'DefaultCartCalculationPipelineService.resolvePrice',\n        success: {\n          default: 'applyPromotions',\n          skipPromotions: 'calculateTax'\n        }\n      },\n      applyPromotions: {\n        handler: 'DefaultCartCalculationPipelineService.applyPromotions',\n        success: 'calculateTax'\n      },\n      calculateTax: {\n        handler: 'DefaultCartCalculationPipelineService.calculateTax',\n        success: 'successEnd',\n        error: 'handleError'\n      }\n    }\n  }\n};"
        },
        {
          "kind": "table",
          "headers": [
            "Configuration or record",
            "Meaning",
            "Update behavior"
          ],
          "rows": [
            [
              "File pipeline definition",
              "Baseline module or project flow.",
              "Loaded during startup in indexed module order."
            ],
            [
              "Persisted `PipelineModel`",
              "Runtime-managed pipeline override.",
              "Merged into `PIPELINE` when the model service exists."
            ],
            [
              "`pipelineSave` and `pipelineUpdated` events",
              "Create or update runtime definitions.",
              "Fetches changed codes and merges active definitions."
            ],
            [
              "Runtime removal event",
              "Removes inactive or deleted definitions.",
              "Deletes matching registry entries."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Author a pipeline",
          "anchor": "pipelineBusinessLogicOrchestration-5-author-a-pipeline"
        },
        {
          "kind": "paragraph",
          "text": "Create the definition in the module that owns the behavior, normally under `modules/<module>/src/pipelines/pipelines.js`. A project module may contribute the same pipeline name only when it intentionally customizes the owner flow."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  productImportValidationPipeline: {\n    startNode: 'validateRequiredFields',\n    nodes: {\n      validateRequiredFields: {\n        handler: 'DefaultProductImportPipelineService.validateRequiredFields',\n        success: 'resolveCatalog'\n      },\n      resolveCatalog: {\n        handler: 'DefaultProductImportPipelineService.resolveCatalog',\n        success: {\n          default: 'validatePrice',\n          skipPrice: 'validateMedia'\n        },\n        error: 'markRecordRejected'\n      },\n      validatePrice: {\n        handler: 'DefaultProductImportPipelineService.validatePrice',\n        success: 'validateMedia'\n      },\n      validateMedia: {\n        handler: 'DefaultProductImportPipelineService.validateMedia',\n        success: 'successEnd'\n      },\n      markRecordRejected: {\n        handler: 'DefaultProductImportPipelineService.markRecordRejected',\n        success: 'handleError'\n      }\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Use names that describe the business step, not the implementation detail. A good node name is `validateMedia`; a weak node name is `step3` or `callService`. This keeps Axis diagnostics, logs, and developer support easier to understand."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Call a pipeline",
          "anchor": "pipelineBusinessLogicOrchestration-6-call-a-pipeline"
        },
        {
          "kind": "paragraph",
          "text": "A pipeline is started from a service, controller, cron job, event listener, or another runtime component by calling `DefaultPipelineService.start`."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "const result = await SERVICE.DefaultPipelineService.start(\n  'productImportValidationPipeline',\n  {\n    tenant: 'default',\n    moduleName: 'product',\n    importRun: {\n      runId: request.importRun.runId\n    },\n    header: {\n      options: {\n        owningModule: 'agora.apparel',\n        moduleName: 'product',\n        schemaName: 'product',\n        operation: 'saveAll'\n      }\n    },\n    product: request.product\n  },\n  {}\n);"
        },
        {
          "kind": "table",
          "headers": [
            "Argument",
            "Purpose",
            "Guidance"
          ],
          "rows": [
            [
              "`name`",
              "The concrete pipeline key in `PIPELINE`.",
              "Must be a non-empty string and cannot be `defaultPipeline`."
            ],
            [
              "`request`",
              "Readable execution input.",
              "Put tenant, auth data, module context, schema context, import metadata, event data, and business input here."
            ],
            [
              "`response`",
              "Mutable execution accumulator.",
              "Put outputs, intermediate values, target branches, success payloads, and collected errors here."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "`start` returns a promise. The promise resolves with `response.success` when the flow reaches `successEnd`. The promise rejects with an enriched `NodicsError` when the flow reaches `handleError` or fails before it can be constructed."
        },
        {
          "kind": "paragraph",
          "text": "Use `Error Handling and Status Codes` for the companion contract: which `ERR_*` or `SUC_*` code the node should emit, how that code maps to HTTP status, what message is safe for API callers, and what context belongs only in logs or administrator evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Pass data through a pipeline",
          "anchor": "pipelineBusinessLogicOrchestration-7-pass-data-through-a-pipeline"
        },
        {
          "kind": "paragraph",
          "text": "Nodics pipelines pass data through two plain objects."
        },
        {
          "kind": "table",
          "headers": [
            "Object",
            "What belongs here",
            "What should not belong here"
          ],
          "rows": [
            [
              "`request`",
              "Stable inputs needed by all nodes: tenant, auth data, module name, payload, schema model, search model, event, import header, file name.",
              "Hidden mutable flags that change control flow after a handler has already run."
            ],
            [
              "`response`",
              "Outputs produced during the flow: resolved model, calculated totals, uploaded media path, branch choice, success payload, collected error.",
              "Global process state or values that other concurrent executions could overwrite."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Use explicit names in both objects. For example, prefer `request.product`, `response.resolvedCatalog`, and `response.preparedMediaObject` over generic fields such as `data`, `tmp`, or `value`."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  validateRequiredFields: function (request, response, process) {\n    if (!request.product || !request.product.code) {\n      process.error(request, response, {\n        code: 'ERR_PRODUCT_IMPORT_00001',\n        message: 'Product code is required before product import can continue'\n      });\n      return;\n    }\n    process.nextSuccess(request, response);\n  },\n\n  resolveCatalog: function (request, response, process) {\n    response.resolvedCatalog = {\n      code: request.product.catalogCode,\n      tenant: request.tenant\n    };\n    response.targetNode = request.product.skipPrice === true ? 'skipPrice' : 'default';\n    process.nextSuccess(request, response);\n  },\n\n  complete: function (request, response, process) {\n    process.stop(request, response, {\n      productCode: request.product.code,\n      catalogCode: response.resolvedCatalog.code\n    });\n  }\n};"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Node handler contract",
          "anchor": "pipelineBusinessLogicOrchestration-8-node-handler-contract"
        },
        {
          "kind": "paragraph",
          "text": "Each function node handler receives exactly three values:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "function nodeHandler(request, response, process) {\n  // Read from request, write to response, then choose the next lifecycle move.\n}"
        },
        {
          "kind": "table",
          "headers": [
            "Method",
            "Meaning",
            "When to call"
          ],
          "rows": [
            [
              "`process.nextSuccess(request, response)`",
              "Continue through the configured success transition.",
              "The node completed and the next normal node should run."
            ],
            [
              "`process.stop(request, response, success)`",
              "Stop normal processing and resolve through `successEnd`.",
              "The node has enough information to finish the pipeline early."
            ],
            [
              "`process.error(request, response, error)`",
              "Enrich the error and route to configured error handling.",
              "The node cannot safely continue."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "A handler should call one of these methods once. Calling more than one creates unclear execution semantics. For asynchronous work, call the method inside the promise or callback completion path."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  validateMedia: function (request, response, process) {\n    SERVICE.DefaultMediaService.prepareImportMedia(request)\n      .then(success => {\n        response.preparedMediaObject = success.result;\n        process.nextSuccess(request, response);\n      })\n      .catch(error => {\n        process.error(request, response, error);\n      });\n  }\n};"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Add, remove, or reorder nodes",
          "anchor": "pipelineBusinessLogicOrchestration-9-add-remove-or-reorder-nodes"
        },
        {
          "kind": "paragraph",
          "text": "To add a node, insert the node definition and point the previous success link to it."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  productImportValidationPipeline: {\n    startNode: 'validateRequiredFields',\n    nodes: {\n      validateRequiredFields: {\n        handler: 'DefaultProductImportPipelineService.validateRequiredFields',\n        success: 'validateDuplicateCode'\n      },\n      validateDuplicateCode: {\n        handler: 'DefaultProductImportPipelineService.validateDuplicateCode',\n        success: 'resolveCatalog'\n      },\n      resolveCatalog: {\n        handler: 'DefaultProductImportPipelineService.resolveCatalog',\n        success: 'successEnd'\n      }\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "To remove a node, delete the node definition and reconnect the previous node to the next valid node."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  productImportValidationPipeline: {\n    startNode: 'validateRequiredFields',\n    nodes: {\n      validateRequiredFields: {\n        handler: 'DefaultProductImportPipelineService.validateRequiredFields',\n        success: 'resolveCatalog'\n      },\n      resolveCatalog: {\n        handler: 'DefaultProductImportPipelineService.resolveCatalog',\n        success: 'successEnd'\n      }\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "When reordering nodes, check both normal `success` links and node-level `error` links. Broken node names are detected at runtime as pipeline link errors and should be covered by tests before release."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Branching and target nodes",
          "anchor": "pipelineBusinessLogicOrchestration-10-branching-and-target-nodes"
        },
        {
          "kind": "paragraph",
          "text": "A node can define a `success` map instead of a single string. In that case the handler chooses the branch by setting `response.targetNode`. If no target is set, Nodics uses the `default` branch."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  checkoutDecisionPipeline: {\n    startNode: 'evaluateCart',\n    nodes: {\n      evaluateCart: {\n        handler: 'DefaultCheckoutPipelineService.evaluateCart',\n        success: {\n          default: 'placeOrder',\n          requiresApproval: 'requestApproval',\n          rejected: 'rejectCart'\n        }\n      },\n      placeOrder: {\n        handler: 'DefaultCheckoutPipelineService.placeOrder',\n        success: 'successEnd'\n      },\n      requestApproval: {\n        handler: 'DefaultCheckoutPipelineService.requestApproval',\n        success: 'successEnd'\n      },\n      rejectCart: {\n        handler: 'DefaultCheckoutPipelineService.rejectCart',\n        success: 'handleError'\n      }\n    }\n  }\n};"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  evaluateCart: function (request, response, process) {\n    if (request.cart.blocked === true) {\n      response.targetNode = 'rejected';\n    } else if (request.cart.total > request.cart.approvalLimit) {\n      response.targetNode = 'requiresApproval';\n    }\n    process.nextSuccess(request, response);\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Use `response.targetNode` only for routing. Store the business reason in a separate field such as `response.approvalReason` so downstream nodes and logs can explain the decision without depending on the branch key."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Nested pipelines",
          "anchor": "pipelineBusinessLogicOrchestration-11-nested-pipelines"
        },
        {
          "kind": "paragraph",
          "text": "When a node type is not `function`, `PipelineHead` treats the handler as the name of another pipeline and starts it through `DefaultPipelineService.start`."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  fullProductImportPipeline: {\n    hardStop: true,\n    startNode: 'validateProduct',\n    nodes: {\n      validateProduct: {\n        type: 'pipeline',\n        handler: 'productImportValidationPipeline',\n        success: 'saveProduct'\n      },\n      saveProduct: {\n        handler: 'DefaultProductImportPipelineService.saveProduct',\n        success: 'successEnd'\n      }\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The nested pipeline receives the same `request` and `response` references. On success, its result is merged into `response.success`. On failure, the error is added to `response.error`. If the parent pipeline sets `hardStop: true`, a nested failure routes to error handling immediately. If `hardStop` is false, the parent can continue through the normal success path after collecting the nested error."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Error lifecycle",
          "anchor": "pipelineBusinessLogicOrchestration-12-error-lifecycle"
        },
        {
          "kind": "paragraph",
          "text": "Errors can begin in several places: an invalid pipeline name, a missing node handler, a thrown service exception, a broken success link, a handler calling `process.error`, or a nested pipeline rejection."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Node[\"Current node\"] --> Decision{\"Node completed?\"}\n  Decision -->|\"nextSuccess\"| SuccessLink[\"Success transition\"]\n  Decision -->|\"stop\"| SuccessEnd[\"successEnd\"]\n  Decision -->|\"throws or process.error\"| Enrich[\"Build pipeline error context\"]\n  Enrich --> NodeError{\"Node has error link?\"}\n  NodeError -->|\"yes\"| ErrorNode[\"Configured error node\"]\n  NodeError -->|\"no\"| HandleError[\"handleError\"]\n  ErrorNode --> HandleError\n  HandleError --> Reject[\"Reject with NodicsError\"]"
        },
        {
          "kind": "paragraph",
          "text": "`PipelineHead.buildErrorContext` enriches the error from the request shape. When available, the error includes pipeline name, execution id, node name, handler, tenant, module, schema, model, collection, search index, event metadata, import run id, data header options, and source file name. This is why import and publication pipelines should pass proper `request.header`, `request.importRun`, and `request.fileName` values."
        },
        {
          "kind": "table",
          "headers": [
            "Failure",
            "Runtime behavior",
            "Developer fix"
          ],
          "rows": [
            [
              "Invalid pipeline name",
              "`DefaultPipelineService.start` rejects with `ERR_PIPE_00000`.",
              "Register the pipeline in an active module and call the exact key."
            ],
            [
              "Missing node handler",
              "`PipelineNode` throws during build.",
              "Add `handler: 'Service.operation'` or a nested pipeline handler."
            ],
            [
              "Missing service operation",
              "`PipelineHead.next` catches the function call failure.",
              "Ensure the service is loaded and the operation is exported."
            ],
            [
              "Broken success link",
              "`prepareNextNode` routes to error handling.",
              "Update the `success` value to a valid node name or terminal."
            ],
            [
              "Unknown branch",
              "`nextSuccess` routes to error handling.",
              "Ensure `response.targetNode` matches a key in the success map."
            ],
            [
              "Handler validation failure",
              "Handler calls `process.error`.",
              "Return a business-safe error code and message with useful metadata."
            ],
            [
              "Nested pipeline failure",
              "Error is appended to `response.error`; `hardStop` decides whether to continue.",
              "Use `hardStop: true` for mandatory subflows."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "pipelineBusinessLogicOrchestration-13-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Developers should extend the owning capability pipeline, not the controller. For example, a project-specific checkout module can add a validation node before order placement or replace a calculation branch. The handler should live in the project module service layer, and the pipeline contribution should live under the project module's pipeline file so it participates in normal module layering."
        },
        {
          "kind": "table",
          "headers": [
            "Customization goal",
            "Recommended path",
            "Avoid"
          ],
          "rows": [
            [
              "Add a validation rule",
              "Add a node before the owner decision node.",
              "Editing generated controllers."
            ],
            [
              "Change a business branch",
              "Use `success` target mapping and set `response.targetNode`.",
              "Duplicating the full flow in an unrelated module."
            ],
            [
              "Reuse common logic",
              "Call a nested pipeline from a node.",
              "Copying handler code between modules."
            ],
            [
              "Change behavior at runtime",
              "Use persisted pipeline records plus governed events.",
              "Editing local files on each node manually."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Related developer guides",
          "anchor": "pipelineBusinessLogicOrchestration-14-related-developer-guides"
        },
        {
          "kind": "table",
          "headers": [
            "Topic",
            "When to use it"
          ],
          "rows": [
            [
              "`API Request Lifecycle and Handler Pipeline`",
              "Customize HTTP request processing before a controller receives the request."
            ],
            [
              "`Routing and API Governance`",
              "Decide route ownership, security, generated CRUD exposure, and controller binding."
            ],
            [
              "`Workflow Orchestration Patterns`",
              "Model long-running approval, export, retry, and multi-target business flows."
            ],
            [
              "`Module-to-Module Communication`",
              "Call another module from a pipeline or service without crossing ownership boundaries incorrectly."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and governance",
          "anchor": "pipelineBusinessLogicOrchestration-15-operations-and-governance"
        },
        {
          "kind": "paragraph",
          "text": "The operator role should treat pipeline changes as behavior changes. They can affect pricing, order placement, publication, import, scheduled automation, or event processing. A pipeline change needs source evidence, permission, validation, and rollback guidance. Runtime changes must be propagated to every node that uses the pipeline registry before the production journey is treated as consistent."
        },
        {
          "kind": "table",
          "headers": [
            "Failure mode",
            "Symptom",
            "Troubleshooting step"
          ],
          "rows": [
            [
              "Missing pipeline name",
              "`ERR_PIPE_00000` during `start`.",
              "Confirm the pipeline exists in the effective `PIPELINE` registry."
            ],
            [
              "Broken success link",
              "Error says the pipeline link is broken.",
              "Check `success` and `targetNode` values against node names."
            ],
            [
              "Missing service handler",
              "Error includes `SERVICE.<service>.<operation>`.",
              "Confirm the service is loaded and the operation is exported."
            ],
            [
              "Stale runtime definition",
              "One node behaves differently after an update.",
              "Verify pipeline update events reached all target nodes."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "pipelineBusinessLogicOrchestration-16-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Putting business orchestration in controllers instead of pipeline nodes.",
            "Putting business rules directly inside the pipeline definition instead of a service handler.",
            "Calling `process.nextSuccess`, `process.stop`, or `process.error` more than once from the same handler path.",
            "Replacing a whole pipeline when a smaller node override is enough.",
            "Forgetting that `defaultPipeline` terminal nodes are merged into concrete pipelines.",
            "Returning a target branch name without configuring the matching success map.",
            "Mutating global objects to pass data between nodes instead of using `request` and `response`.",
            "Continuing after a mandatory nested pipeline failure when `hardStop` should be enabled.",
            "Treating persisted runtime pipeline changes as casual edits without audit and rollback.",
            "Hiding a failed nested pipeline by continuing when the owning behavior should stop."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "pipelineBusinessLogicOrchestration-17-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run pipeline-focused tests whenever pipeline definitions, handlers, runtime update behavior, or error context changes. At minimum verify successful flow, invalid pipeline name, broken link, handler error, nested pipeline behavior, target branching, persisted model merge, runtime update event, runtime removal event, data passed through `request` and `response`, `process.stop` behavior, and error enrichment."
        },
        {
          "kind": "paragraph",
          "text": "Useful evidence comes from `nPipeline` service tests, the request-pipeline tests in `nRouter`, database model initializer pipeline tests, cron lifecycle pipeline tests, and commerce cart calculation tests. Also regenerate and validate the documentation content pack so the pipeline page remains available through the governed documentation catalogue."
        }
      ],
      "searchText": "Pipeline and Business Logic Orchestration How Nodics pipelines compose validation, enrichment, decisioning, side effects, events, and project-layer business logic. # Pipeline and Business Logic Orchestration\n\nPipelines are the main Nodics mechanism for composing business logic without hiding decisions inside controllers or copying rules across services. A pipeline is a named runtime flow made of ordered nodes. Each node calls a service operation or another pipeline, then chooses the next success or error path. This page is for beginners, business users, developers, the operator role, QA owners, architects, and AI tools that need to understand how a Nodics behavior is assembled and where project-specific customization belongs.\n\nFor business users, pipelines make complex work auditable: cart calculation, checkout placement, schema persistence, import, cron execution, workflow transitions, request processing, and event handling can be explained as visible steps rather than hidden code. For developers, pipelines are the extension point that keeps business behavior modular. A project can add validation, enrichment, decisioning, routing, or recovery steps while preserving the owning module contract.\n\nThis page explains the generic pipeline execution model. The HTTP entry pipeline has its own developer guide, `API Request Lifecycle and Handler Pipeline`, because request parsing, route exposure, authentication branching, cache lookup, controller dispatch, response handlers, and safe HTTP customization need to be understood as one end-to-end flow.\n\nUse `Workflow Orchestration Patterns` when the business journey needs durable state, human tasks, approval, retry, compensation, target-specific export branches, or operator recovery. A product export can use pipelines inside domain adapters, but the long-running approval and multi-target lifecycle belongs to workflow.\n\n## Business context\n\nThe practical business problem is change control. Enterprises need to change a rule such as \"calculate price, then promotion, then tax\" or \"validate data, save, invalidate cache, publish event\" without rewriting the entire API stack. Pipelines give business teams a language for the journey and give developers a deterministic execution model.\n\n| Business need | Pipeline answer |\n| --- | --- |\n| Explain what happens during a request | Show the named pipeline, ordered nodes, decision branches, and final terminal. |\n| Customize a project rule | Add or override a pipeline definition in a later project module. |\n| Support governed runtime behavior | Merge persisted pipeline models when available and refresh them through events. |\n| Troubleshoot a failed journey | Error metadata records pipeline name, execution id, node, handler, tenant, module, schema, event, search, or import context. |\n\n## Runtime model\n\n`DefaultPipelineService` loads effective pipeline definitions from every active module by reading `/src/pipelines/pipelines.js` and the compatibility name `/src/pipelines/pipelinesDefinition.js`. It stores the result in the global `PIPELINE` registry. When a persisted `PipelineModel` is available, persisted definitions are merged on top of file definitions for the default tenant.\n\n```mermaid\nflowchart LR\n  Modules[\"Active modules\"] --> Files[\"Pipeline files\"]\n  Files --> Registry[\"Global PIPELINE registry\"]\n  Persisted[\"Persisted PipelineModel\"] --> Registry\n  Request[\"Service calls DefaultPipelineService.start\"] --> Head[\"PipelineHead\"]\n  Head --> Node[\"PipelineNode\"]\n  Node --> Handler[\"Service operation or nested pipeline\"]\n  Handler --> Success[\"successEnd\"]\n  Handler --> Error[\"handleError\"]\n```\n\n`PipelineHead` builds executable `PipelineNode` instances from the definition, starts at `startNode`, prepares success transitions, supports `targetNode` branching, calls service handlers as `SERVICE[ServiceName][operation]`, and can execute nested pipelines when a node type is not `function`. A successful pipeline resolves through `DefaultPipelineService.handleSucessEnd`. A failed pipeline enriches the error and rejects through `handleErrorEnd`.\n\n| Source area | Purpose | Runtime effect |\n| --- | --- | --- |\n| `nPipeline/src/pipelines/pipelines.js` | Defines `defaultPipeline` terminal nodes. | Adds `successEnd` and `handleError` to concrete flows. |\n| `DefaultPipelineService.loadPipelines` | Loads file and persisted definitions. | Builds the effective registry. |\n| `PipelineHead.prepareNextNode` | Reads success transitions. | Moves to the next node or routes to error handling. |\n| `PipelineHead.buildErrorContext` | Enriches errors from request shape. | Adds database, search, event, import, tenant, module, and handler context. |\n| `DefaultPipelineChangeListenerService` | Handles runtime pipeline events. | Updates or removes registry entries without restarting every caller. |\n\n## Pipeline lifecycle\n\nEvery pipeline run follows the same lifecycle, whether it is started by an API request, import process, cron job, event listener, checkout flow, or a custom project service.\n\n| Step | Runtime action | Developer meaning |\n| --- | --- | --- |\n| 1. Startup discovery | Active modules contribute pipeline files into the effective registry. | Put baseline definitions in the owning module or in the project module that intentionally overrides the behavior. |\n| 2. Persisted merge | Persisted `PipelineModel` records are merged when the model service is available. | Runtime-managed changes are overlays, not a second hidden framework. |\n| 3. Registry ready | The named definition becomes available as `PIPELINE[pipelineName]`. | A caller can only start a concrete pipeline name, never `defaultPipeline`. |\n| 4. Caller starts | A service calls `DefaultPipelineService.start(name, request, response)`. | Pass all business inputs through `request`; use `response` as the execution accumulator. |\n| 5. Definition build | `defaultPipeline` terminal nodes are merged into the concrete definition. | Every concrete flow inherits `successEnd` and `handleError`. |\n| 6. Node execution | `PipelineHead` executes the current node as a service function or nested pipeline. | A node handler owns one small piece of behavior. |\n| 7. Transition | The node calls `process.nextSuccess`, `process.stop`, or `process.error`. | The handler must explicitly choose the next lifecycle move. |\n| 8. Branching | A string `success` link goes directly to one node; an object `success` map uses `response.targetNode`. | Use branching when the same decision node can choose multiple valid routes. |\n| 9. Success terminal | `successEnd` resolves the promise with `response.success`. | The caller receives the normalized success payload. |\n| 10. Error terminal | Errors are enriched and routed to node-level error handling or the global `handleError`. | The caller receives a contextual Nodics error, not a raw exception. |\n| 11. Runtime refresh | Pipeline update and removal events mutate the global registry. | Changes can be propagated without rewriting the caller. |\n\nThe lifecycle has one important design rule: pipeline definitions describe orchestration, not business logic. Business logic belongs in services. The pipeline should say \"validate product\", \"resolve media\", \"save model\", or \"publish event\"; the handler service should contain the actual rule.\n\n## Data and configuration detail\n\nPipeline definitions are JavaScript objects contributed by modules. The minimum concrete pipeline defines `startNode` and `nodes`. A node must define a handler; it may define `type`, `success`, `error`, and target routing. The default node type is `function`.\n\n```js\nmodule.exports = {\n  commerceCartCalculationPipeline: {\n    startNode: 'validateContext',\n    nodes: {\n      validateContext: {\n        handler: 'DefaultCartCalculationPipelineService.validateContext',\n        success: 'resolvePrice'\n      },\n      resolvePrice: {\n        handler: 'DefaultCartCalculationPipelineService.resolvePrice',\n        success: {\n          default: 'applyPromotions',\n          skipPromotions: 'calculateTax'\n        }\n      },\n      applyPromotions: {\n        handler: 'DefaultCartCalculationPipelineService.applyPromotions',\n        success: 'calculateTax'\n      },\n      calculateTax: {\n        handler: 'DefaultCartCalculationPipelineService.calculateTax',\n        success: 'successEnd',\n        error: 'handleError'\n      }\n    }\n  }\n};\n```\n\n| Configuration or record | Meaning | Update behavior |\n| --- | --- | --- |\n| File pipeline definition | Baseline module or project flow. | Loaded during startup in indexed module order. |\n| Persisted `PipelineModel` | Runtime-managed pipeline override. | Merged into `PIPELINE` when the model service exists. |\n| `pipelineSave` and `pipelineUpdated` events | Create or update runtime definitions. | Fetches changed codes and merges active definitions. |\n| Runtime removal event | Removes inactive or deleted definitions. | Deletes matching registry entries. |\n\n## Author a pipeline\n\nCreate the definition in the module that owns the behavior, normally under `modules/<module>/src/pipelines/pipelines.js`. A project module may contribute the same pipeline name only when it intentionally customizes the owner flow.\n\n```js\nmodule.exports = {\n  productImportValidationPipeline: {\n    startNode: 'validateRequiredFields',\n    nodes: {\n      validateRequiredFields: {\n        handler: 'DefaultProductImportPipelineService.validateRequiredFields',\n        success: 'resolveCatalog'\n      },\n      resolveCatalog: {\n        handler: 'DefaultProductImportPipelineService.resolveCatalog',\n        success: {\n          default: 'validatePrice',\n          skipPrice: 'validateMedia'\n        },\n        error: 'markRecordRejected'\n      },\n      validatePrice: {\n        handler: 'DefaultProductImportPipelineService.validatePrice',\n        success: 'validateMedia'\n      },\n      validateMedia: {\n        handler: 'DefaultProductImportPipelineService.validateMedia',\n        success: 'successEnd'\n      },\n      markRecordRejected: {\n        handler: 'DefaultProductImportPipelineService.markRecordRejected',\n        success: 'handleError'\n      }\n    }\n  }\n};\n```\n\nUse names that describe the business step, not the implementation detail. A good node name is `validateMedia`; a weak node name is `step3` or `callService`. This keeps Axis diagnostics, logs, and developer support easier to understand.\n\n## Call a pipeline\n\nA pipeline is started from a service, controller, cron job, event listener, or another runtime component by calling `DefaultPipelineService.start`.\n\n```js\nconst result = await SERVICE.DefaultPipelineService.start(\n  'productImportValidationPipeline',\n  {\n    tenant: 'default',\n    moduleName: 'product',\n    importRun: {\n      runId: request.importRun.runId\n    },\n    header: {\n      options: {\n        owningModule: 'agora.apparel',\n        moduleName: 'product',\n        schemaName: 'product',\n        operation: 'saveAll'\n      }\n    },\n    product: request.product\n  },\n  {}\n);\n```\n\n| Argument | Purpose | Guidance |\n| --- | --- | --- |\n| `name` | The concrete pipeline key in `PIPELINE`. | Must be a non-empty string and cannot be `defaultPipeline`. |\n| `request` | Readable execution input. | Put tenant, auth data, module context, schema context, import metadata, event data, and business input here. |\n| `response` | Mutable execution accumulator. | Put outputs, intermediate values, target branches, success payloads, and collected errors here. |\n\n`start` returns a promise. The promise resolves with `response.success` when the flow reaches `successEnd`. The promise rejects with an enriched `NodicsError` when the flow reaches `handleError` or fails before it can be constructed.\n\nUse `Error Handling and Status Codes` for the companion contract: which `ERR_*` or `SUC_*` code the node should emit, how that code maps to HTTP status, what message is safe for API callers, and what context belongs only in logs or administrator evidence.\n\n## Pass data through a pipeline\n\nNodics pipelines pass data through two plain objects.\n\n| Object | What belongs here | What should not belong here |\n| --- | --- | --- |\n| `request` | Stable inputs needed by all nodes: tenant, auth data, module name, payload, schema model, search model, event, import header, file name. | Hidden mutable flags that change control flow after a handler has already run. |\n| `response` | Outputs produced during the flow: resolved model, calculated totals, uploaded media path, branch choice, success payload, collected error. | Global process state or values that other concurrent executions could overwrite. |\n\nUse explicit names in both objects. For example, prefer `request.product`, `response.resolvedCatalog`, and `response.preparedMediaObject` over generic fields such as `data`, `tmp`, or `value`.\n\n```js\nmodule.exports = {\n  validateRequiredFields: function (request, response, process) {\n    if (!request.product || !request.product.code) {\n      process.error(request, response, {\n        code: 'ERR_PRODUCT_IMPORT_00001',\n        message: 'Product code is required before product import can continue'\n      });\n      return;\n    }\n    process.nextSuccess(request, response);\n  },\n\n  resolveCatalog: function (request, response, process) {\n    response.resolvedCatalog = {\n      code: request.product.catalogCode,\n      tenant: request.tenant\n    };\n    response.targetNode = request.product.skipPrice === true ? 'skipPrice' : 'default';\n    process.nextSuccess(request, response);\n  },\n\n  complete: function (request, response, process) {\n    process.stop(request, response, {\n      productCode: request.product.code,\n      catalogCode: response.resolvedCatalog.code\n    });\n  }\n};\n```\n\n## Node handler contract\n\nEach function node handler receives exactly three values:\n\n```js\nfunction nodeHandler(request, response, process) {\n  // Read from request, write to response, then choose the next lifecycle move.\n}\n```\n\n| Method | Meaning | When to call |\n| --- | --- | --- |\n| `process.nextSuccess(request, response)` | Continue through the configured success transition. | The node completed and the next normal node should run. |\n| `process.stop(request, response, success)` | Stop normal processing and resolve through `successEnd`. | The node has enough information to finish the pipeline early. |\n| `process.error(request, response, error)` | Enrich the error and route to configured error handling. | The node cannot safely continue. |\n\nA handler should call one of these methods once. Calling more than one creates unclear execution semantics. For asynchronous work, call the method inside the promise or callback completion path.\n\n```js\nmodule.exports = {\n  validateMedia: function (request, response, process) {\n    SERVICE.DefaultMediaService.prepareImportMedia(request)\n      .then(success => {\n        response.preparedMediaObject = success.result;\n        process.nextSuccess(request, response);\n      })\n      .catch(error => {\n        process.error(request, response, error);\n      });\n  }\n};\n```\n\n## Add, remove, or reorder nodes\n\nTo add a node, insert the node definition and point the previous success link to it.\n\n```js\nmodule.exports = {\n  productImportValidationPipeline: {\n    startNode: 'validateRequiredFields',\n    nodes: {\n      validateRequiredFields: {\n        handler: 'DefaultProductImportPipelineService.validateRequiredFields',\n        success: 'validateDuplicateCode'\n      },\n      validateDuplicateCode: {\n        handler: 'DefaultProductImportPipelineService.validateDuplicateCode',\n        success: 'resolveCatalog'\n      },\n      resolveCatalog: {\n        handler: 'DefaultProductImportPipelineService.resolveCatalog',\n        success: 'successEnd'\n      }\n    }\n  }\n};\n```\n\nTo remove a node, delete the node definition and reconnect the previous node to the next valid node.\n\n```js\nmodule.exports = {\n  productImportValidationPipeline: {\n    startNode: 'validateRequiredFields',\n    nodes: {\n      validateRequiredFields: {\n        handler: 'DefaultProductImportPipelineService.validateRequiredFields',\n        success: 'resolveCatalog'\n      },\n      resolveCatalog: {\n        handler: 'DefaultProductImportPipelineService.resolveCatalog',\n        success: 'successEnd'\n      }\n    }\n  }\n};\n```\n\nWhen reordering nodes, check both normal `success` links and node-level `error` links. Broken node names are detected at runtime as pipeline link errors and should be covered by tests before release.\n\n## Branching and target nodes\n\nA node can define a `success` map instead of a single string. In that case the handler chooses the branch by setting `response.targetNode`. If no target is set, Nodics uses the `default` branch.\n\n```js\nmodule.exports = {\n  checkoutDecisionPipeline: {\n    startNode: 'evaluateCart',\n    nodes: {\n      evaluateCart: {\n        handler: 'DefaultCheckoutPipelineService.evaluateCart',\n        success: {\n          default: 'placeOrder',\n          requiresApproval: 'requestApproval',\n          rejected: 'rejectCart'\n        }\n      },\n      placeOrder: {\n        handler: 'DefaultCheckoutPipelineService.placeOrder',\n        success: 'successEnd'\n      },\n      requestApproval: {\n        handler: 'DefaultCheckoutPipelineService.requestApproval',\n        success: 'successEnd'\n      },\n      rejectCart: {\n        handler: 'DefaultCheckoutPipelineService.rejectCart',\n        success: 'handleError'\n      }\n    }\n  }\n};\n```\n\n```js\nmodule.exports = {\n  evaluateCart: function (request, response, process) {\n    if (request.cart.blocked === true) {\n      response.targetNode = 'rejected';\n    } else if (request.cart.total > request.cart.approvalLimit) {\n      response.targetNode = 'requiresApproval';\n    }\n    process.nextSuccess(request, response);\n  }\n};\n```\n\nUse `response.targetNode` only for routing. Store the business reason in a separate field such as `response.approvalReason` so downstream nodes and logs can explain the decision without depending on the branch key.\n\n## Nested pipelines\n\nWhen a node type is not `function`, `PipelineHead` treats the handler as the name of another pipeline and starts it through `DefaultPipelineService.start`.\n\n```js\nmodule.exports = {\n  fullProductImportPipeline: {\n    hardStop: true,\n    startNode: 'validateProduct',\n    nodes: {\n      validateProduct: {\n        type: 'pipeline',\n        handler: 'productImportValidationPipeline',\n        success: 'saveProduct'\n      },\n      saveProduct: {\n        handler: 'DefaultProductImportPipelineService.saveProduct',\n        success: 'successEnd'\n      }\n    }\n  }\n};\n```\n\nThe nested pipeline receives the same `request` and `response` references. On success, its result is merged into `response.success`. On failure, the error is added to `response.error`. If the parent pipeline sets `hardStop: true`, a nested failure routes to error handling immediately. If `hardStop` is false, the parent can continue through the normal success path after collecting the nested error.\n\n## Error lifecycle\n\nErrors can begin in several places: an invalid pipeline name, a missing node handler, a thrown service exception, a broken success link, a handler calling `process.error`, or a nested pipeline rejection.\n\n```mermaid\nflowchart TD\n  Node[\"Current node\"] --> Decision{\"Node completed?\"}\n  Decision -->|\"nextSuccess\"| SuccessLink[\"Success transition\"]\n  Decision -->|\"stop\"| SuccessEnd[\"successEnd\"]\n  Decision -->|\"throws or process.error\"| Enrich[\"Build pipeline error context\"]\n  Enrich --> NodeError{\"Node has error link?\"}\n  NodeError -->|\"yes\"| ErrorNode[\"Configured error node\"]\n  NodeError -->|\"no\"| HandleError[\"handleError\"]\n  ErrorNode --> HandleError\n  HandleError --> Reject[\"Reject with NodicsError\"]\n```\n\n`PipelineHead.buildErrorContext` enriches the error from the request shape. When available, the error includes pipeline name, execution id, node name, handler, tenant, module, schema, model, collection, search index, event metadata, import run id, data header options, and source file name. This is why import and publication pipelines should pass proper `request.header`, `request.importRun`, and `request.fileName` values.\n\n| Failure | Runtime behavior | Developer fix |\n| --- | --- | --- |\n| Invalid pipeline name | `DefaultPipelineService.start` rejects with `ERR_PIPE_00000`. | Register the pipeline in an active module and call the exact key. |\n| Missing node handler | `PipelineNode` throws during build. | Add `handler: 'Service.operation'` or a nested pipeline handler. |\n| Missing service operation | `PipelineHead.next` catches the function call failure. | Ensure the service is loaded and the operation is exported. |\n| Broken success link | `prepareNextNode` routes to error handling. | Update the `success` value to a valid node name or terminal. |\n| Unknown branch | `nextSuccess` routes to error handling. | Ensure `response.targetNode` matches a key in the success map. |\n| Handler validation failure | Handler calls `process.error`. | Return a business-safe error code and message with useful metadata. |\n| Nested pipeline failure | Error is appended to `response.error`; `hardStop` decides whether to continue. | Use `hardStop: true` for mandatory subflows. |\n\n## Customization and extension\n\nDevelopers should extend the owning capability pipeline, not the controller. For example, a project-specific checkout module can add a validation node before order placement or replace a calculation branch. The handler should live in the project module service layer, and the pipeline contribution should live under the project module's pipeline file so it participates in normal module layering.\n\n| Customization goal | Recommended path | Avoid |\n| --- | --- | --- |\n| Add a validation rule | Add a node before the owner decision node. | Editing generated controllers. |\n| Change a business branch | Use `success` target mapping and set `response.targetNode`. | Duplicating the full flow in an unrelated module. |\n| Reuse common logic | Call a nested pipeline from a node. | Copying handler code between modules. |\n| Change behavior at runtime | Use persisted pipeline records plus governed events. | Editing local files on each node manually. |\n\n## Related developer guides\n\n| Topic | When to use it |\n| --- | --- |\n| `API Request Lifecycle and Handler Pipeline` | Customize HTTP request processing before a controller receives the request. |\n| `Routing and API Governance` | Decide route ownership, security, generated CRUD exposure, and controller binding. |\n| `Workflow Orchestration Patterns` | Model long-running approval, export, retry, and multi-target business flows. |\n| `Module-to-Module Communication` | Call another module from a pipeline or service without crossing ownership boundaries incorrectly. |\n\n## Operations and governance\n\nThe operator role should treat pipeline changes as behavior changes. They can affect pricing, order placement, publication, import, scheduled automation, or event processing. A pipeline change needs source evidence, permission, validation, and rollback guidance. Runtime changes must be propagated to every node that uses the pipeline registry before the production journey is treated as consistent.\n\n| Failure mode | Symptom | Troubleshooting step |\n| --- | --- | --- |\n| Missing pipeline name | `ERR_PIPE_00000` during `start`. | Confirm the pipeline exists in the effective `PIPELINE` registry. |\n| Broken success link | Error says the pipeline link is broken. | Check `success` and `targetNode` values against node names. |\n| Missing service handler | Error includes `SERVICE.<service>.<operation>`. | Confirm the service is loaded and the operation is exported. |\n| Stale runtime definition | One node behaves differently after an update. | Verify pipeline update events reached all target nodes. |\n\n## Common mistakes\n\n- Putting business orchestration in controllers instead of pipeline nodes.\n- Putting business rules directly inside the pipeline definition instead of a service handler.\n- Calling `process.nextSuccess`, `process.stop`, or `process.error` more than once from the same handler path.\n- Replacing a whole pipeline when a smaller node override is enough.\n- Forgetting that `defaultPipeline` terminal nodes are merged into concrete pipelines.\n- Returning a target branch name without configuring the matching success map.\n- Mutating global objects to pass data between nodes instead of using `request` and `response`.\n- Continuing after a mandatory nested pipeline failure when `hardStop` should be enabled.\n- Treating persisted runtime pipeline changes as casual edits without audit and rollback.\n- Hiding a failed nested pipeline by continuing when the owning behavior should stop.\n\n## Verification\n\nRun pipeline-focused tests whenever pipeline definitions, handlers, runtime update behavior, or error context changes. At minimum verify successful flow, invalid pipeline name, broken link, handler error, nested pipeline behavior, target branching, persisted model merge, runtime update event, runtime removal event, data passed through `request` and `response`, `process.stop` behavior, and error enrichment.\n\nUseful evidence comes from `nPipeline` service tests, the request-pipeline tests in `nRouter`, database model initializer pipeline tests, cron lifecycle pipeline tests, and commerce cart calculation tests. Also regenerate and validate the documentation content pack so the pipeline page remains available through the governed documentation catalogue.\n",
      "previous": {
        "title": "Business Value and Adoption Model",
        "route": "/docs/framework/process/business-value"
      },
      "next": {
        "title": "Cron operations",
        "route": "/docs/framework/cron-operations"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "pipeline",
        "owner": "pipeline",
        "sourcePath": "data/docs-v001/records/documentation/pipelineDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/pipelineDocumentationComponentData.js",
        "wordCount": 2778,
        "checksum": "067f9f0151ae0af694bfdccb73ec93ed60413030baae2de0010bfb5d675fa951"
      },
      "slug": "pipeline-business-logic-orchestration",
      "locale": "en",
      "navigationGroup": "Pipeline Execution Model",
      "navigationGroupCode": "pipeline-execution-model",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "framework.customization-guide",
          "owner": "nodics.docs"
        },
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore"
        },
        {
          "documentId": "runtime.governed-change",
          "owner": "config"
        },
        {
          "documentId": "routing.api-request-lifecycle",
          "owner": "router"
        },
        {
          "documentId": "process.workflow-orchestration-patterns",
          "owner": "workflow"
        },
        {
          "documentId": "foundation.module-to-module-communication",
          "owner": "nService"
        }
      ]
    },
    "active": true
  }
};
