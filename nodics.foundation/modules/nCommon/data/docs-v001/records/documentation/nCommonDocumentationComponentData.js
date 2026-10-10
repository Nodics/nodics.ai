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
    "code": "nodicsDocsComponentfoundationErrorHandlingStatusCodes",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "foundation.error-handling-status-codes",
      "title": "Error Handling and Status Codes",
      "route": "/docs/framework/foundation-error-handling-status-codes",
      "section": "application-configuration-and-runtime-behavior-management",
      "sectionTitle": "Application Configuration and Runtime Behavior Management",
      "group": "application-configuration-and-runtime-behavior-management",
      "groupTitle": "Application Configuration and Runtime Behavior Management",
      "parentId": "application-configuration-and-runtime-behavior-management",
      "hierarchyPath": [
        "Application Configuration and Runtime Behavior Management",
        "Error Handling and Status Codes"
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
      "summary": "How Nodics errors, status definitions, response handlers, HTTP status codes, localization metadata, safe public messages, and project overrides work.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [
        "admin",
        "documentationAuthor",
        "axisViewer"
      ],
      "allowedGroups": [
        "documentationAuthorUserGroup",
        "axisReadOnlyUserGroup"
      ],
      "allowedPermissions": [
        "documentation.read",
        "router.configuration.read"
      ],
      "lifecycleState": "ONLINE",
      "version": "0.16.7",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "configuration.runtime-behavior-management",
        "configuration.framework-startup-lifecycle",
        "routing.api-governance",
        "routing.api-request-lifecycle",
        "pipeline.business-logic-orchestration",
        "applications.axis-setup-error-contracts"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "src/lib/nodicsError.js",
        "config/properties.js",
        "src/utils/statusDefinitions.js",
        "test/errorTraceability.test.js",
        "../nService/src/service/status/defaultStatusService.js",
        "../nService/test/statusDefinitionCatalog.test.js",
        "../nRouter/src/service/defaultRequestHandlerService.js",
        "../nRouter/src/service/handlers/response/defaultJsonResponseHandlerService.js",
        "../nRouter/src/service/handlers/response/defaultFileDownloadResponseHandlerService.js",
        "../nRouter/src/service/handlers/response/defaultTextResponseHandlerService.js",
        "../nRouter/src/utils/statusDefinitions.js",
        "../../../nodics.process/modules/workflow/src/utils/statusDefinitions.js",
        "../nData/nExport/export/src/utils/statusDefinitions.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "error-handling",
        "status-codes",
        "NodicsError",
        "DefaultStatusService",
        "responseCode",
        "HTTP status",
        "DefaultJsonResponseHandlerService",
        "statusDefinitions",
        "messageKey",
        "publicError"
      ],
      "topicKeywords": [
        "Application Configuration and Runtime Behavior Management",
        "Configuration Layers and Behavior",
        "Error Handling and Status Codes",
        "NodicsError"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "foundationErrorHandlingStatusCodes-1-business-context",
          "level": 2
        },
        {
          "text": "Runtime ownership",
          "anchor": "foundationErrorHandlingStatusCodes-2-runtime-ownership",
          "level": 2
        },
        {
          "text": "End-to-end flow",
          "anchor": "foundationErrorHandlingStatusCodes-3-end-to-end-flow",
          "level": 2
        },
        {
          "text": "Error code format",
          "anchor": "foundationErrorHandlingStatusCodes-4-error-code-format",
          "level": 2
        },
        {
          "text": "Status definition contract",
          "anchor": "foundationErrorHandlingStatusCodes-5-status-definition-contract",
          "level": 2
        },
        {
          "text": "Throwing errors",
          "anchor": "foundationErrorHandlingStatusCodes-6-throwing-errors",
          "level": 2
        },
        {
          "text": "Aggregated validation errors",
          "anchor": "foundationErrorHandlingStatusCodes-7-aggregated-validation-errors",
          "level": 2
        },
        {
          "text": "Success response format",
          "anchor": "foundationErrorHandlingStatusCodes-8-success-response-format",
          "level": 2
        },
        {
          "text": "Error response format",
          "anchor": "foundationErrorHandlingStatusCodes-9-error-response-format",
          "level": 2
        },
        {
          "text": "HTTP status guidance",
          "anchor": "foundationErrorHandlingStatusCodes-10-http-status-guidance",
          "level": 2
        },
        {
          "text": "Response handler selection",
          "anchor": "foundationErrorHandlingStatusCodes-11-response-handler-selection",
          "level": 2
        },
        {
          "text": "Configuration",
          "anchor": "foundationErrorHandlingStatusCodes-12-configuration",
          "level": 2
        },
        {
          "text": "Project customization",
          "anchor": "foundationErrorHandlingStatusCodes-13-project-customization",
          "level": 2
        },
        {
          "text": "Operator troubleshooting",
          "anchor": "foundationErrorHandlingStatusCodes-14-operator-troubleshooting",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "foundationErrorHandlingStatusCodes-15-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "foundationErrorHandlingStatusCodes-16-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Error handling is a framework contract in Nodics. It decides what a developer throws, what a pipeline propagates, what an API caller receives, what Axis can display safely, and what an operator can use for troubleshooting. This page is for beginners, business users, developers, operators, architects, QA owners, and AI tools that need one clear model for errors, success responses, HTTP status codes, localization, and customization."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, think of a Nodics error as two things travelling together: a stable product code such as `ERR_PROCESS_00004`, and a safe message/status definition that explains how the caller should understand it. The backend logs may contain deeper context. The public response should remain predictable and safe."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "foundationErrorHandlingStatusCodes-1-business-context"
        },
        {
          "kind": "paragraph",
          "text": "Business users should never see raw framework exceptions as the main message. Axis and Nexus need friendly messages such as \"Content catalog pending setup\" or \"Process graph validation failed\", while developers and operators still need request id, error code, tenant, module, pipeline node, schema, and source evidence to diagnose the problem."
        },
        {
          "kind": "table",
          "headers": [
            "Business need",
            "Error contract answer"
          ],
          "rows": [
            [
              "Friendly user messages",
              "Response handlers project safe messages and hide server internals by default."
            ],
            [
              "Developer traceability",
              "`NodicsError` carries code, contexts, causes, validation errors, and trace id."
            ],
            [
              "API consistency",
              "Status definitions map every `SUC_*`, `ERR_*`, and `RSN_*` code to an HTTP status and message."
            ],
            [
              "Operator support",
              "Logs keep enriched context while API responses stay bounded."
            ],
            [
              "Project customization",
              "Later modules can add status definitions, default error-code mappings, and response handlers."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime ownership",
          "anchor": "foundationErrorHandlingStatusCodes-2-runtime-ownership"
        },
        {
          "kind": "table",
          "headers": [
            "Runtime area",
            "Source location",
            "Responsibility"
          ],
          "rows": [
            [
              "Error class",
              "`src/lib/nodicsError.js`",
              "Normalizes strings, Error objects, plain objects, nested causes, validation errors, context, trace id, and safe JSON serialization."
            ],
            [
              "Default error config",
              "`config/properties.js`",
              "Defines `returnErrorStack` and default error-code mappings such as `defaultErrorCodes.NodicsError`."
            ],
            [
              "Status catalogue",
              "`../nService/src/service/status/defaultStatusService.js`",
              "Loads active module `src/utils/statusDefinitions.js` files and validates code/message/localization metadata."
            ],
            [
              "Baseline statuses",
              "`src/utils/statusDefinitions.js`",
              "Defines shared fallback success and error definitions."
            ],
            [
              "JSON response",
              "`../nRouter/src/service/handlers/response/defaultJsonResponseHandlerService.js`",
              "Converts success and error objects into HTTP responses and public JSON envelopes."
            ],
            [
              "Request dispatch",
              "`../nRouter/src/service/defaultRequestHandlerService.js`",
              "Selects the configured response handler after `requestHandlerPipeline` succeeds or fails."
            ],
            [
              "Contract tests",
              "`test/errorTraceability.test.js`, `../nService/test/statusDefinitionCatalog.test.js`",
              "Validate traceability, safe serialization, and status-definition coverage."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "End-to-end flow",
          "anchor": "foundationErrorHandlingStatusCodes-3-end-to-end-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Service[\"Service, controller, pipeline, adapter, or import process\"] --> Error[\"throw or reject NodicsError\"]\n  Error --> Context[\"Add context, causes, validation errors, trace id\"]\n  Context --> Pipeline[\"Pipeline or request handler catches failure\"]\n  Pipeline --> Status[\"DefaultStatusService resolves code definition\"]\n  Status --> Handler[\"Response handler selects HTTP status and public body\"]\n  Handler --> Client[\"Axis, Nexus, integration, or API caller\"]\n  Handler --> Logs[\"Server logs retain diagnostic detail\"]"
        },
        {
          "kind": "paragraph",
          "text": "The same principle applies to success responses. A service can return `SUC_*` codes, and the response handler resolves message and HTTP status from the status catalogue."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Error code format",
          "anchor": "foundationErrorHandlingStatusCodes-4-error-code-format"
        },
        {
          "kind": "paragraph",
          "text": "Nodics status codes are stable business/runtime identifiers. They are not the same thing as HTTP status numbers."
        },
        {
          "kind": "table",
          "headers": [
            "Part",
            "Example",
            "Meaning"
          ],
          "rows": [
            [
              "Prefix",
              "`ERR`, `SUC`, `RSN`",
              "Error, success, or reason-classification code."
            ],
            [
              "Domain segment",
              "`SYS`, `PROCESS`, `IMP`, `EXP`, `AUTH`, `RTR`",
              "Owning capability or technical module vocabulary."
            ],
            [
              "Number",
              "`00004`",
              "Stable numeric identity inside the owner namespace."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Examples:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "SUC_SYS_00000      Successfully processed\nERR_SYS_00001      Validation error\nERR_PROCESS_00004  Process graph validation failed\nERR_EXP_00001      Export request invalid or dependency unavailable\nERR_RTR_00004      HTTP rate limit exceeded"
        },
        {
          "kind": "paragraph",
          "text": "Use one code for one stable condition. Do not reuse a code for unrelated failures because Axis, integrations, tests, and documentation may make decisions from that code."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Status definition contract",
          "anchor": "foundationErrorHandlingStatusCodes-5-status-definition-contract"
        },
        {
          "kind": "paragraph",
          "text": "Each active module may contribute status definitions from `src/utils/statusDefinitions.js`. `DefaultStatusService.loadStatusDefinitions` loads those files during startup and stores the effective map."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  ERR_PRODUCT_EXPORT_00001: {\n    code: '422',\n    message: 'Product export filters are invalid'\n  },\n  ERR_PRODUCT_EXPORT_00002: {\n    code: '409',\n    message: 'Product export target is not ready'\n  },\n  SUC_PRODUCT_EXPORT_00000: {\n    code: '202',\n    message: 'Product export workflow accepted'\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Status definition rules:"
        },
        {
          "kind": "table",
          "headers": [
            "Field",
            "Required",
            "Meaning"
          ],
          "rows": [
            [
              "Object key",
              "Yes",
              "Stable Nodics status code, normally `ERR_*`, `SUC_*`, or `RSN_*`."
            ],
            [
              "`code`",
              "Yes",
              "HTTP status as a number or numeric string from 100 to 599."
            ],
            [
              "`message`",
              "Yes",
              "Default safe English message."
            ],
            [
              "`type`",
              "Required for `RSN_*`",
              "Must be `reason` for reason-classification codes."
            ],
            [
              "`messageKey`",
              "Optional",
              "Stable localization key when browser localization is needed."
            ],
            [
              "`parameters`",
              "Required when `messageKey` is present",
              "Exact scalar parameter names allowed into the public response."
            ],
            [
              "`exposure`",
              "Required when `messageKey` is present",
              "One of `PUBLIC`, `AUTHENTICATED`, `OPERATOR`, or `INTERNAL`."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Localized public messages can be declared like this:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  ERR_AUTH_00001: {\n    code: '401',\n    message: 'Authentication failed',\n    messageKey: 'auth.invalid_credentials',\n    parameters: [],\n    exposure: 'PUBLIC'\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The JSON response handler exposes localization metadata only when the status definition declares `messageKey`, the parameter names are allowed by the definition, and the exposure is permitted by response-handler policy."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Throwing errors",
          "anchor": "foundationErrorHandlingStatusCodes-6-throwing-errors"
        },
        {
          "kind": "paragraph",
          "text": "Use `CLASSES.NodicsError` for expected business/runtime failures."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "throw new CLASSES.NodicsError(\n  'ERR_PRODUCT_EXPORT_00001',\n  'categoryCode is required when target marketplace is selected'\n);"
        },
        {
          "kind": "paragraph",
          "text": "When wrapping a lower-level error, preserve the stable owner code and add context."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "try {\n  await SERVICE.DefaultProductDiscoveryService.search(request);\n} catch (error) {\n  throw CLASSES.NodicsError.enrich(error, {\n    layer: 'product-export',\n    moduleName: 'product',\n    target: request.target,\n    tenant: request.tenant\n  }, 'ERR_PRODUCT_EXPORT_00003', 'Unable to aggregate product data');\n}"
        },
        {
          "kind": "paragraph",
          "text": "Use `NodicsError.ensure` when a catch block can receive either a plain Error, a string, a plain object, or an existing Nodics error."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "catch (error) {\n  throw CLASSES.NodicsError.ensure(\n    error,\n    'Product export delivery failed',\n    'ERR_PRODUCT_EXPORT_00004'\n  );\n}"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Aggregated validation errors",
          "anchor": "foundationErrorHandlingStatusCodes-7-aggregated-validation-errors"
        },
        {
          "kind": "paragraph",
          "text": "Use child errors when one request has multiple field-level or record-level failures."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "const error = new CLASSES.NodicsError(\n  'ERR_PRODUCT_EXPORT_00001',\n  'Product export request has validation errors'\n);\n\nif (!request.catalogCode) {\n  error.add(new CLASSES.NodicsError(\n    'ERR_PRODUCT_EXPORT_00005',\n    'catalogCode is required'\n  ));\n}\n\nif (!Array.isArray(request.targets) || request.targets.length === 0) {\n  error.add(new CLASSES.NodicsError(\n    'ERR_PRODUCT_EXPORT_00006',\n    'At least one export target is required'\n  ));\n}\n\nif (error.getErrors().length > 0) {\n  throw error;\n}"
        },
        {
          "kind": "paragraph",
          "text": "`DefaultJsonResponseHandlerService.publicError` returns a bounded list of validation errors. The default public policy limits validation details so one bad request cannot flood the response."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Success response format",
          "anchor": "foundationErrorHandlingStatusCodes-8-success-response-format"
        },
        {
          "kind": "paragraph",
          "text": "Success responses should also use stable codes."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "return {\n  code: 'SUC_PRODUCT_EXPORT_00000',\n  data: {\n    instanceCode: 'product-export-summer-2026',\n    acceptedTargets: ['marketplace', 'erp', 'analytics']\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The JSON response handler fills missing fields from `DefaultStatusService`:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"code\": \"SUC_PRODUCT_EXPORT_00000\",\n  \"responseCode\": \"202\",\n  \"message\": \"Product export workflow accepted\",\n  \"data\": {\n    \"instanceCode\": \"product-export-summer-2026\",\n    \"acceptedTargets\": [\"marketplace\", \"erp\", \"analytics\"]\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "The HTTP response status is numeric. The Nodics payload `responseCode` may remain string-based because it comes from module status definitions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Error response format",
          "anchor": "foundationErrorHandlingStatusCodes-9-error-response-format"
        },
        {
          "kind": "paragraph",
          "text": "A public JSON error response has this shape:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"responseCode\": \"422\",\n  \"code\": \"ERR_PROCESS_00004\",\n  \"name\": \"NodicsError\",\n  \"message\": \"Process graph validation failed\",\n  \"traceId\": \"request-abc\",\n  \"errors\": [\n    {\n      \"responseCode\": \"422\",\n      \"code\": \"ERR_PROCESS_00018\",\n      \"name\": \"NodicsError\",\n      \"message\": \"Unsupported process runtime node type\"\n    }\n  ]\n}"
        },
        {
          "kind": "paragraph",
          "text": "Server-side logs may contain context, causes, and stack traces. Public API responses should not expose stack traces, secrets, request bodies, provider responses, raw database errors, or filesystem paths."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "HTTP status guidance",
          "anchor": "foundationErrorHandlingStatusCodes-10-http-status-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Use normal HTTP semantics. The Nodics code explains the product/runtime condition; the HTTP status explains how the API caller should treat the response."
        },
        {
          "kind": "table",
          "headers": [
            "HTTP status",
            "Use for",
            "Example Nodics condition"
          ],
          "rows": [
            [
              "`200`",
              "Successful read, update, or completed action.",
              "`SUC_PROCESS_00000`"
            ],
            [
              "`201`",
              "Resource or runtime instance created.",
              "`SUC_PROCESS_00007`"
            ],
            [
              "`202`",
              "Accepted for asynchronous execution.",
              "Export workflow or trigger accepted."
            ],
            [
              "`400`",
              "Malformed request or unsupported request option.",
              "Invalid export module/schema/format."
            ],
            [
              "`401`",
              "Missing or invalid authentication.",
              "Invalid login or token."
            ],
            [
              "`403`",
              "Authenticated but not allowed.",
              "Action adapter not registered or permission denied."
            ],
            [
              "`404`",
              "Requested definition, task, route, or record not found.",
              "Process definition not found."
            ],
            [
              "`409`",
              "State conflict or lifecycle transition not allowed.",
              "Draft/published state mismatch."
            ],
            [
              "`422`",
              "Structurally valid request failed domain validation.",
              "Workflow graph validation failed."
            ],
            [
              "`429`",
              "Rate limit exceeded.",
              "Router rate-limit policy."
            ],
            [
              "`500`",
              "Unexpected server failure.",
              "Unclassified internal error."
            ],
            [
              "`503`",
              "Required dependency or service unavailable.",
              "Trigger service unavailable."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Response handler selection",
          "anchor": "foundationErrorHandlingStatusCodes-11-response-handler-selection"
        },
        {
          "kind": "paragraph",
          "text": "Routes normally use `jsonResponseHandler`. A route can declare another handler, such as text or file download, through route metadata."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  nSystem: {\n    swaggerUi: {\n      key: '/swagger',\n      method: 'GET',\n      controller: 'DefaultSystemController',\n      operation: 'swaggerUi',\n      secured: false,\n      responseHandler: 'textResponseHandler'\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "`DefaultRequestHandlerService` resolves the response handler from:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "const responseHandler =\n  CONFIG.get('responseHandler')[routerDef.responseHandler || 'jsonResponseHandler'];"
        },
        {
          "kind": "paragraph",
          "text": "The selected service receives success or error:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "SERVICE[responseHandler].handleSuccess(request, response, success);\nSERVICE[responseHandler].handleError(request, response, error);"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Configuration",
          "anchor": "foundationErrorHandlingStatusCodes-12-configuration"
        },
        {
          "kind": "paragraph",
          "text": "Baseline configuration is intentionally conservative."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  returnErrorStack: false,\n  defaultErrorCodes: {\n    NodicsError: 'ERR_SYS_00000'\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Project or environment layers may change defaults:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  returnErrorStack: false,\n  defaultErrorCodes: {\n    NodicsError: 'ERR_SYS_00000',\n    ProductExportError: 'ERR_PRODUCT_EXPORT_00000'\n  },\n  responseHandler: {\n    publicError: {\n      maskServerErrorMessages: true,\n      includeValidationErrors: true,\n      maximumValidationErrors: 20,\n      includeLocalizationMetadata: true,\n      permittedLocalizationExposures: ['PUBLIC', 'AUTHENTICATED']\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Do not enable stack traces in production-like environments. Use logs, correlation ids, and enriched contexts for diagnosis."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Project customization",
          "anchor": "foundationErrorHandlingStatusCodes-13-project-customization"
        },
        {
          "kind": "paragraph",
          "text": "Developers can customize error behavior safely from a project module."
        },
        {
          "kind": "table",
          "headers": [
            "Need",
            "Extension point",
            "Avoid"
          ],
          "rows": [
            [
              "Add capability-specific errors",
              "Add `src/utils/statusDefinitions.js` in the owning module or project overlay.",
              "Throwing codes that are not defined in the status catalogue."
            ],
            [
              "Change fallback error code for a custom error class",
              "Add `defaultErrorCodes.<ClassName>` in layered `config/properties.js`.",
              "Mapping every failure to `ERR_SYS_00000`."
            ],
            [
              "Add safe business context",
              "Use `NodicsError.enrich` or `error.addContext`.",
              "Appending raw payloads, secrets, tokens, or provider responses to messages."
            ],
            [
              "Return localized metadata",
              "Add `messageKey`, `parameters`, and `exposure` to the status definition.",
              "Letting the browser infer localization keys from error messages."
            ],
            [
              "Change public envelope",
              "Override or configure `DefaultJsonResponseHandlerService` through route/response handler configuration.",
              "Making one controller handcraft a different error shape."
            ],
            [
              "Add file/text behavior",
              "Use dedicated response handlers.",
              "Returning files through JSON error/success envelopes."
            ],
            [
              "Show better Axis setup errors",
              "Map backend error codes to safe UI headlines and evidence.",
              "Rendering raw `ERR_SYS_00000` as the primary business message."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Example project status definitions:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  ERR_ACME_PRODUCT_EXPORT_00000: {\n    code: '500',\n    message: 'ACME product export failed'\n  },\n  ERR_ACME_PRODUCT_EXPORT_00001: {\n    code: '422',\n    message: 'ACME product export target filter is invalid',\n    messageKey: 'acme.product_export.invalid_filter',\n    parameters: ['target'],\n    exposure: 'AUTHENTICATED'\n  },\n  SUC_ACME_PRODUCT_EXPORT_00000: {\n    code: '202',\n    message: 'ACME product export was accepted'\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Example custom error class:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = class ProductExportError extends CLASSES.NodicsError {\n  constructor(error, message) {\n    super(error, message, CONFIG.get('defaultErrorCodes').ProductExportError);\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Example project response handler override:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  handleError: function (request, response, error) {\n    error = CLASSES.NodicsError.ensure(error);\n    const publicBody = SERVICE.DefaultJsonResponseHandlerService.publicError(error);\n    publicBody.support = {\n      requestId: response.getHeader && response.getHeader('X-Request-Id')\n    };\n    response.status(Number(publicBody.responseCode) || 500).json(publicBody);\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Keep the public shape compatible unless a versioned API contract intentionally changes it. Axis and integrations should not need a different parser for every module."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator troubleshooting",
          "anchor": "foundationErrorHandlingStatusCodes-14-operator-troubleshooting"
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Likely cause",
            "First check"
          ],
          "rows": [
            [
              "API returns `ERR_SYS_00000`",
              "Unknown error was wrapped by default fallback.",
              "Check logs for contexts, causes, request id, and module layer."
            ],
            [
              "API response status is `500` for a validation issue",
              "Missing or wrong module status definition.",
              "Add or correct `src/utils/statusDefinitions.js`."
            ],
            [
              "`Invalid error code` during runtime",
              "Code was thrown but not loaded into status map.",
              "Confirm module is active and status definition file exports the code."
            ],
            [
              "Axis shows technical text",
              "UI consumed raw exception message instead of mapped safe message.",
              "Add backend-safe status or Axis mapper with evidence."
            ],
            [
              "Stack trace appears in API response",
              "`returnErrorStack` enabled or custom handler leaked stack.",
              "Disable stack exposure outside local debugging."
            ],
            [
              "Localized message missing",
              "Status definition lacks `messageKey`, allowed parameters, or permitted exposure.",
              "Check status definition and response handler `publicError` policy."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "foundationErrorHandlingStatusCodes-15-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Throwing plain strings from business services.",
            "Reusing one error code for unrelated conditions.",
            "Defining a code in source but not in `statusDefinitions.js`.",
            "Returning HTTP `200` with an `ERR_*` payload.",
            "Exposing raw stack traces, request bodies, tokens, provider responses, or database errors to the browser.",
            "Putting business-specific error mapping only in Axis.",
            "Changing one controller response shape instead of the shared response handler contract.",
            "Using `500` for expected validation, permission, not-found, or lifecycle conflicts."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "foundationErrorHandlingStatusCodes-16-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify error handling at five levels:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Unit tests prove `NodicsError` wraps Error objects, strings, causes, validation children, contexts, circular values, and trace ids safely.",
            "Status catalogue tests prove every used `SUC_*`, `ERR_*`, and `RSN_*` code has a valid definition with HTTP code and message.",
            "Request-pipeline tests prove controller errors reach the configured response handler.",
            "API tests verify HTTP status, payload `responseCode`, public message, localization metadata, and no stack/secret leakage.",
            "Axis browser tests verify user-safe messages, technical evidence for administrators, retry guidance, and request/correlation id visibility."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Run the focused framework checks after changing this contract:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "node nodics.foundation/modules/nCommon/test/errorTraceability.test.js\nnode nodics.foundation/modules/nService/test/statusDefinitionCatalog.test.js\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs test"
        }
      ],
      "searchText": "Error Handling and Status Codes How Nodics errors, status definitions, response handlers, HTTP status codes, localization metadata, safe public messages, and project overrides work. # Error Handling and Status Codes\n\nError handling is a framework contract in Nodics. It decides what a developer throws, what a pipeline propagates, what an API caller receives, what Axis can display safely, and what an operator can use for troubleshooting. This page is for beginners, business users, developers, operators, architects, QA owners, and AI tools that need one clear model for errors, success responses, HTTP status codes, localization, and customization.\n\nFor beginners, think of a Nodics error as two things travelling together: a stable product code such as `ERR_PROCESS_00004`, and a safe message/status definition that explains how the caller should understand it. The backend logs may contain deeper context. The public response should remain predictable and safe.\n\n## Business context\n\nBusiness users should never see raw framework exceptions as the main message. Axis and Nexus need friendly messages such as \"Content catalog pending setup\" or \"Process graph validation failed\", while developers and operators still need request id, error code, tenant, module, pipeline node, schema, and source evidence to diagnose the problem.\n\n| Business need | Error contract answer |\n| --- | --- |\n| Friendly user messages | Response handlers project safe messages and hide server internals by default. |\n| Developer traceability | `NodicsError` carries code, contexts, causes, validation errors, and trace id. |\n| API consistency | Status definitions map every `SUC_*`, `ERR_*`, and `RSN_*` code to an HTTP status and message. |\n| Operator support | Logs keep enriched context while API responses stay bounded. |\n| Project customization | Later modules can add status definitions, default error-code mappings, and response handlers. |\n\n## Runtime ownership\n\n| Runtime area | Source location | Responsibility |\n| --- | --- | --- |\n| Error class | `src/lib/nodicsError.js` | Normalizes strings, Error objects, plain objects, nested causes, validation errors, context, trace id, and safe JSON serialization. |\n| Default error config | `config/properties.js` | Defines `returnErrorStack` and default error-code mappings such as `defaultErrorCodes.NodicsError`. |\n| Status catalogue | `../nService/src/service/status/defaultStatusService.js` | Loads active module `src/utils/statusDefinitions.js` files and validates code/message/localization metadata. |\n| Baseline statuses | `src/utils/statusDefinitions.js` | Defines shared fallback success and error definitions. |\n| JSON response | `../nRouter/src/service/handlers/response/defaultJsonResponseHandlerService.js` | Converts success and error objects into HTTP responses and public JSON envelopes. |\n| Request dispatch | `../nRouter/src/service/defaultRequestHandlerService.js` | Selects the configured response handler after `requestHandlerPipeline` succeeds or fails. |\n| Contract tests | `test/errorTraceability.test.js`, `../nService/test/statusDefinitionCatalog.test.js` | Validate traceability, safe serialization, and status-definition coverage. |\n\n## End-to-end flow\n\n```mermaid\nflowchart TD\n  Service[\"Service, controller, pipeline, adapter, or import process\"] --> Error[\"throw or reject NodicsError\"]\n  Error --> Context[\"Add context, causes, validation errors, trace id\"]\n  Context --> Pipeline[\"Pipeline or request handler catches failure\"]\n  Pipeline --> Status[\"DefaultStatusService resolves code definition\"]\n  Status --> Handler[\"Response handler selects HTTP status and public body\"]\n  Handler --> Client[\"Axis, Nexus, integration, or API caller\"]\n  Handler --> Logs[\"Server logs retain diagnostic detail\"]\n```\n\nThe same principle applies to success responses. A service can return `SUC_*` codes, and the response handler resolves message and HTTP status from the status catalogue.\n\n## Error code format\n\nNodics status codes are stable business/runtime identifiers. They are not the same thing as HTTP status numbers.\n\n| Part | Example | Meaning |\n| --- | --- | --- |\n| Prefix | `ERR`, `SUC`, `RSN` | Error, success, or reason-classification code. |\n| Domain segment | `SYS`, `PROCESS`, `IMP`, `EXP`, `AUTH`, `RTR` | Owning capability or technical module vocabulary. |\n| Number | `00004` | Stable numeric identity inside the owner namespace. |\n\nExamples:\n\n```text\nSUC_SYS_00000      Successfully processed\nERR_SYS_00001      Validation error\nERR_PROCESS_00004  Process graph validation failed\nERR_EXP_00001      Export request invalid or dependency unavailable\nERR_RTR_00004      HTTP rate limit exceeded\n```\n\nUse one code for one stable condition. Do not reuse a code for unrelated failures because Axis, integrations, tests, and documentation may make decisions from that code.\n\n## Status definition contract\n\nEach active module may contribute status definitions from `src/utils/statusDefinitions.js`. `DefaultStatusService.loadStatusDefinitions` loads those files during startup and stores the effective map.\n\n```js\nmodule.exports = {\n  ERR_PRODUCT_EXPORT_00001: {\n    code: '422',\n    message: 'Product export filters are invalid'\n  },\n  ERR_PRODUCT_EXPORT_00002: {\n    code: '409',\n    message: 'Product export target is not ready'\n  },\n  SUC_PRODUCT_EXPORT_00000: {\n    code: '202',\n    message: 'Product export workflow accepted'\n  }\n};\n```\n\nStatus definition rules:\n\n| Field | Required | Meaning |\n| --- | --- | --- |\n| Object key | Yes | Stable Nodics status code, normally `ERR_*`, `SUC_*`, or `RSN_*`. |\n| `code` | Yes | HTTP status as a number or numeric string from 100 to 599. |\n| `message` | Yes | Default safe English message. |\n| `type` | Required for `RSN_*` | Must be `reason` for reason-classification codes. |\n| `messageKey` | Optional | Stable localization key when browser localization is needed. |\n| `parameters` | Required when `messageKey` is present | Exact scalar parameter names allowed into the public response. |\n| `exposure` | Required when `messageKey` is present | One of `PUBLIC`, `AUTHENTICATED`, `OPERATOR`, or `INTERNAL`. |\n\nLocalized public messages can be declared like this:\n\n```js\nmodule.exports = {\n  ERR_AUTH_00001: {\n    code: '401',\n    message: 'Authentication failed',\n    messageKey: 'auth.invalid_credentials',\n    parameters: [],\n    exposure: 'PUBLIC'\n  }\n};\n```\n\nThe JSON response handler exposes localization metadata only when the status definition declares `messageKey`, the parameter names are allowed by the definition, and the exposure is permitted by response-handler policy.\n\n## Throwing errors\n\nUse `CLASSES.NodicsError` for expected business/runtime failures.\n\n```js\nthrow new CLASSES.NodicsError(\n  'ERR_PRODUCT_EXPORT_00001',\n  'categoryCode is required when target marketplace is selected'\n);\n```\n\nWhen wrapping a lower-level error, preserve the stable owner code and add context.\n\n```js\ntry {\n  await SERVICE.DefaultProductDiscoveryService.search(request);\n} catch (error) {\n  throw CLASSES.NodicsError.enrich(error, {\n    layer: 'product-export',\n    moduleName: 'product',\n    target: request.target,\n    tenant: request.tenant\n  }, 'ERR_PRODUCT_EXPORT_00003', 'Unable to aggregate product data');\n}\n```\n\nUse `NodicsError.ensure` when a catch block can receive either a plain Error, a string, a plain object, or an existing Nodics error.\n\n```js\ncatch (error) {\n  throw CLASSES.NodicsError.ensure(\n    error,\n    'Product export delivery failed',\n    'ERR_PRODUCT_EXPORT_00004'\n  );\n}\n```\n\n## Aggregated validation errors\n\nUse child errors when one request has multiple field-level or record-level failures.\n\n```js\nconst error = new CLASSES.NodicsError(\n  'ERR_PRODUCT_EXPORT_00001',\n  'Product export request has validation errors'\n);\n\nif (!request.catalogCode) {\n  error.add(new CLASSES.NodicsError(\n    'ERR_PRODUCT_EXPORT_00005',\n    'catalogCode is required'\n  ));\n}\n\nif (!Array.isArray(request.targets) || request.targets.length === 0) {\n  error.add(new CLASSES.NodicsError(\n    'ERR_PRODUCT_EXPORT_00006',\n    'At least one export target is required'\n  ));\n}\n\nif (error.getErrors().length > 0) {\n  throw error;\n}\n```\n\n`DefaultJsonResponseHandlerService.publicError` returns a bounded list of validation errors. The default public policy limits validation details so one bad request cannot flood the response.\n\n## Success response format\n\nSuccess responses should also use stable codes.\n\n```js\nreturn {\n  code: 'SUC_PRODUCT_EXPORT_00000',\n  data: {\n    instanceCode: 'product-export-summer-2026',\n    acceptedTargets: ['marketplace', 'erp', 'analytics']\n  }\n};\n```\n\nThe JSON response handler fills missing fields from `DefaultStatusService`:\n\n```json\n{\n  \"code\": \"SUC_PRODUCT_EXPORT_00000\",\n  \"responseCode\": \"202\",\n  \"message\": \"Product export workflow accepted\",\n  \"data\": {\n    \"instanceCode\": \"product-export-summer-2026\",\n    \"acceptedTargets\": [\"marketplace\", \"erp\", \"analytics\"]\n  }\n}\n```\n\nThe HTTP response status is numeric. The Nodics payload `responseCode` may remain string-based because it comes from module status definitions.\n\n## Error response format\n\nA public JSON error response has this shape:\n\n```json\n{\n  \"responseCode\": \"422\",\n  \"code\": \"ERR_PROCESS_00004\",\n  \"name\": \"NodicsError\",\n  \"message\": \"Process graph validation failed\",\n  \"traceId\": \"request-abc\",\n  \"errors\": [\n    {\n      \"responseCode\": \"422\",\n      \"code\": \"ERR_PROCESS_00018\",\n      \"name\": \"NodicsError\",\n      \"message\": \"Unsupported process runtime node type\"\n    }\n  ]\n}\n```\n\nServer-side logs may contain context, causes, and stack traces. Public API responses should not expose stack traces, secrets, request bodies, provider responses, raw database errors, or filesystem paths.\n\n## HTTP status guidance\n\nUse normal HTTP semantics. The Nodics code explains the product/runtime condition; the HTTP status explains how the API caller should treat the response.\n\n| HTTP status | Use for | Example Nodics condition |\n| --- | --- | --- |\n| `200` | Successful read, update, or completed action. | `SUC_PROCESS_00000` |\n| `201` | Resource or runtime instance created. | `SUC_PROCESS_00007` |\n| `202` | Accepted for asynchronous execution. | Export workflow or trigger accepted. |\n| `400` | Malformed request or unsupported request option. | Invalid export module/schema/format. |\n| `401` | Missing or invalid authentication. | Invalid login or token. |\n| `403` | Authenticated but not allowed. | Action adapter not registered or permission denied. |\n| `404` | Requested definition, task, route, or record not found. | Process definition not found. |\n| `409` | State conflict or lifecycle transition not allowed. | Draft/published state mismatch. |\n| `422` | Structurally valid request failed domain validation. | Workflow graph validation failed. |\n| `429` | Rate limit exceeded. | Router rate-limit policy. |\n| `500` | Unexpected server failure. | Unclassified internal error. |\n| `503` | Required dependency or service unavailable. | Trigger service unavailable. |\n\n## Response handler selection\n\nRoutes normally use `jsonResponseHandler`. A route can declare another handler, such as text or file download, through route metadata.\n\n```js\nmodule.exports = {\n  nSystem: {\n    swaggerUi: {\n      key: '/swagger',\n      method: 'GET',\n      controller: 'DefaultSystemController',\n      operation: 'swaggerUi',\n      secured: false,\n      responseHandler: 'textResponseHandler'\n    }\n  }\n};\n```\n\n`DefaultRequestHandlerService` resolves the response handler from:\n\n```js\nconst responseHandler =\n  CONFIG.get('responseHandler')[routerDef.responseHandler || 'jsonResponseHandler'];\n```\n\nThe selected service receives success or error:\n\n```js\nSERVICE[responseHandler].handleSuccess(request, response, success);\nSERVICE[responseHandler].handleError(request, response, error);\n```\n\n## Configuration\n\nBaseline configuration is intentionally conservative.\n\n```js\nmodule.exports = {\n  returnErrorStack: false,\n  defaultErrorCodes: {\n    NodicsError: 'ERR_SYS_00000'\n  }\n};\n```\n\nProject or environment layers may change defaults:\n\n```js\nmodule.exports = {\n  returnErrorStack: false,\n  defaultErrorCodes: {\n    NodicsError: 'ERR_SYS_00000',\n    ProductExportError: 'ERR_PRODUCT_EXPORT_00000'\n  },\n  responseHandler: {\n    publicError: {\n      maskServerErrorMessages: true,\n      includeValidationErrors: true,\n      maximumValidationErrors: 20,\n      includeLocalizationMetadata: true,\n      permittedLocalizationExposures: ['PUBLIC', 'AUTHENTICATED']\n    }\n  }\n};\n```\n\nDo not enable stack traces in production-like environments. Use logs, correlation ids, and enriched contexts for diagnosis.\n\n## Project customization\n\nDevelopers can customize error behavior safely from a project module.\n\n| Need | Extension point | Avoid |\n| --- | --- | --- |\n| Add capability-specific errors | Add `src/utils/statusDefinitions.js` in the owning module or project overlay. | Throwing codes that are not defined in the status catalogue. |\n| Change fallback error code for a custom error class | Add `defaultErrorCodes.<ClassName>` in layered `config/properties.js`. | Mapping every failure to `ERR_SYS_00000`. |\n| Add safe business context | Use `NodicsError.enrich` or `error.addContext`. | Appending raw payloads, secrets, tokens, or provider responses to messages. |\n| Return localized metadata | Add `messageKey`, `parameters`, and `exposure` to the status definition. | Letting the browser infer localization keys from error messages. |\n| Change public envelope | Override or configure `DefaultJsonResponseHandlerService` through route/response handler configuration. | Making one controller handcraft a different error shape. |\n| Add file/text behavior | Use dedicated response handlers. | Returning files through JSON error/success envelopes. |\n| Show better Axis setup errors | Map backend error codes to safe UI headlines and evidence. | Rendering raw `ERR_SYS_00000` as the primary business message. |\n\nExample project status definitions:\n\n```js\nmodule.exports = {\n  ERR_ACME_PRODUCT_EXPORT_00000: {\n    code: '500',\n    message: 'ACME product export failed'\n  },\n  ERR_ACME_PRODUCT_EXPORT_00001: {\n    code: '422',\n    message: 'ACME product export target filter is invalid',\n    messageKey: 'acme.product_export.invalid_filter',\n    parameters: ['target'],\n    exposure: 'AUTHENTICATED'\n  },\n  SUC_ACME_PRODUCT_EXPORT_00000: {\n    code: '202',\n    message: 'ACME product export was accepted'\n  }\n};\n```\n\nExample custom error class:\n\n```js\nmodule.exports = class ProductExportError extends CLASSES.NodicsError {\n  constructor(error, message) {\n    super(error, message, CONFIG.get('defaultErrorCodes').ProductExportError);\n  }\n};\n```\n\nExample project response handler override:\n\n```js\nmodule.exports = {\n  handleError: function (request, response, error) {\n    error = CLASSES.NodicsError.ensure(error);\n    const publicBody = SERVICE.DefaultJsonResponseHandlerService.publicError(error);\n    publicBody.support = {\n      requestId: response.getHeader && response.getHeader('X-Request-Id')\n    };\n    response.status(Number(publicBody.responseCode) || 500).json(publicBody);\n  }\n};\n```\n\nKeep the public shape compatible unless a versioned API contract intentionally changes it. Axis and integrations should not need a different parser for every module.\n\n## Operator troubleshooting\n\n| Symptom | Likely cause | First check |\n| --- | --- | --- |\n| API returns `ERR_SYS_00000` | Unknown error was wrapped by default fallback. | Check logs for contexts, causes, request id, and module layer. |\n| API response status is `500` for a validation issue | Missing or wrong module status definition. | Add or correct `src/utils/statusDefinitions.js`. |\n| `Invalid error code` during runtime | Code was thrown but not loaded into status map. | Confirm module is active and status definition file exports the code. |\n| Axis shows technical text | UI consumed raw exception message instead of mapped safe message. | Add backend-safe status or Axis mapper with evidence. |\n| Stack trace appears in API response | `returnErrorStack` enabled or custom handler leaked stack. | Disable stack exposure outside local debugging. |\n| Localized message missing | Status definition lacks `messageKey`, allowed parameters, or permitted exposure. | Check status definition and response handler `publicError` policy. |\n\n## Common mistakes\n\n- Throwing plain strings from business services.\n- Reusing one error code for unrelated conditions.\n- Defining a code in source but not in `statusDefinitions.js`.\n- Returning HTTP `200` with an `ERR_*` payload.\n- Exposing raw stack traces, request bodies, tokens, provider responses, or database errors to the browser.\n- Putting business-specific error mapping only in Axis.\n- Changing one controller response shape instead of the shared response handler contract.\n- Using `500` for expected validation, permission, not-found, or lifecycle conflicts.\n\n## Verification\n\nVerify error handling at five levels:\n\n1. Unit tests prove `NodicsError` wraps Error objects, strings, causes, validation children, contexts, circular values, and trace ids safely.\n2. Status catalogue tests prove every used `SUC_*`, `ERR_*`, and `RSN_*` code has a valid definition with HTTP code and message.\n3. Request-pipeline tests prove controller errors reach the configured response handler.\n4. API tests verify HTTP status, payload `responseCode`, public message, localization metadata, and no stack/secret leakage.\n5. Axis browser tests verify user-safe messages, technical evidence for administrators, retry guidance, and request/correlation id visibility.\n\nRun the focused framework checks after changing this contract:\n\n```bash\nnode nodics.foundation/modules/nCommon/test/errorTraceability.test.js\nnode nodics.foundation/modules/nService/test/statusDefinitionCatalog.test.js\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs test\n```\n",
      "previous": {
        "title": "API Request Lifecycle and Handler Pipeline",
        "route": "/docs/framework/routing-api-request-lifecycle"
      },
      "next": {
        "title": "Governed Runtime Change Capability",
        "route": "/docs/framework/runtime-governed-change"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nCommon",
        "owner": "nCommon",
        "sourcePath": "data/docs-v001/records/documentation/nCommonDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nCommonDocumentationComponentData.js",
        "wordCount": 1954,
        "checksum": "53976eb9d2a8d855fc1c9e6095585184aeba1c3a1a354fd9049eef1162db8bdd"
      },
      "slug": "error-handling-and-status-codes",
      "locale": "en",
      "navigationGroup": "Configuration Layers and Behavior",
      "navigationGroupCode": "configuration-layers-and-behavior",
      "navigationGroupOrder": 10,
      "navigationOrder": 35,
      "references": [
        {
          "documentId": "configuration.runtime-behavior-management",
          "owner": "config"
        },
        {
          "documentId": "configuration.framework-startup-lifecycle",
          "owner": "config"
        },
        {
          "documentId": "routing.api-governance",
          "owner": "router"
        },
        {
          "documentId": "routing.api-request-lifecycle",
          "owner": "router"
        },
        {
          "documentId": "pipeline.business-logic-orchestration",
          "owner": "pipeline"
        },
        {
          "documentId": "applications.axis-setup-error-contracts",
          "owner": "backoffice"
        }
      ]
    },
    "active": true
  }
};
