/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics framework documentation search metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagefoundationerrorhandlingstatuscodes",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagefoundationErrorHandlingStatusCodes",
    "title": "Error Handling and Status Codes",
    "summary": "How Nodics errors, status definitions, response handlers, HTTP status codes, localization metadata, safe public messages, and project overrides work.",
    "searchText": "Error Handling and Status Codes How Nodics errors, status definitions, response handlers, HTTP status codes, localization metadata, safe public messages, and project overrides work. error-handling status-codes NodicsError DefaultStatusService responseCode HTTP status DefaultJsonResponseHandlerService statusDefinitions messageKey publicError",
    "keywords": [
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
    "facets": {
      "nodeLevel": "PAGE_LINK",
      "nodeType": "PAGE",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ]
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatafoundationerrorhandlingstatuscodes",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatafoundationErrorHandlingStatusCodes",
    "title": "Error Handling and Status Codes",
    "summary": "How Nodics errors, status definitions, response handlers, HTTP status codes, localization metadata, safe public messages, and project overrides work.",
    "searchText": "Error Handling and Status Codes How Nodics errors, status definitions, response handlers, HTTP status codes, localization metadata, safe public messages, and project overrides work. # Error Handling and Status Codes\n\nError handling is a framework contract in Nodics. It decides what a developer throws, what a pipeline propagates, what an API caller receives, what Axis can display safely, and what an operator can use for troubleshooting. This page is for beginners, business users, developers, operators, architects, QA owners, and AI tools that need one clear model for errors, success responses, HTTP status codes, localization, and customization.\n\nFor beginners, think of a Nodics error as two things travelling together: a stable product code such as `ERR_PROCESS_00004`, and a safe message/status definition that explains how the caller should understand it. The backend logs may contain deeper context. The public response should remain predictable and safe.\n\n## Business context\n\nBusiness users should never see raw framework exceptions as the main message. Axis and Nexus need friendly messages such as \"Content catalog pending setup\" or \"Process graph validation failed\", while developers and operators still need request id, error code, tenant, module, pipeline node, schema, and source evidence to diagnose the problem.\n\n| Business need | Error contract answer |\n| --- | --- |\n| Friendly user messages | Response handlers project safe messages and hide server internals by default. |\n| Developer traceability | `NodicsError` carries code, contexts, causes, validation errors, and trace id. |\n| API consistency | Status definitions map every `SUC_*`, `ERR_*`, and `RSN_*` code to an HTTP status and message. |\n| Operator support | Logs keep enriched context while API responses stay bounded. |\n| Project customization | Later modules can add status definitions, default error-code mappings, and response handlers. |\n\n## Runtime ownership\n\n| Runtime area | Source location | Responsibility |\n| --- | --- | --- |\n| Error class | `src/lib/nodicsError.js` | Normalizes strings, Error objects, plain objects, nested causes, validation errors, context, trace id, and safe JSON serialization. |\n| Default error config | `config/properties.js` | Defines `returnErrorStack` and default error-code mappings such as `defaultErrorCodes.NodicsError`. |\n| Status catalogue | `../nService/src/service/status/defaultStatusService.js` | Loads active module `src/utils/statusDefinitions.js` files and validates code/message/localization metadata. |\n| Baseline statuses | `src/utils/statusDefinitions.js` | Defines shared fallback success and error definitions. |\n| JSON response | `../nRouter/src/service/handlers/response/defaultJsonResponseHandlerService.js` | Converts success and error objects into HTTP responses and public JSON envelopes. |\n| Request dispatch | `../nRouter/src/service/defaultRequestHandlerService.js` | Selects the configured response handler after `requestHandlerPipeline` succeeds or fails. |\n| Contract tests | `test/errorTraceability.test.js`, `../nService/test/statusDefinitionCatalog.test.js` | Validate traceability, safe serialization, and status-definition coverage. |\n\n## End-to-end flow\n\n```mermaid\nflowchart TD\n  Service[\"Service, controller, pipeline, adapter, or import process\"] --> Error[\"throw or reject NodicsError\"]\n  Error --> Context[\"Add context, causes, validation errors, trace id\"]\n  Context --> Pipeline[\"Pipeline or request handler catches failure\"]\n  Pipeline --> Status[\"DefaultStatusService resolves code definition\"]\n  Status --> Handler[\"Response handler selects HTTP status and public body\"]\n  Handler --> Client[\"Axis, Nexus, integration, or API caller\"]\n  Handler --> Logs[\"Server logs retain diagnostic detail\"]\n```\n\nThe same principle applies to success responses. A service can return `SUC_*` codes, and the response handler resolves message and HTTP status from the status catalogue.\n\n## Error code format\n\nNodics status codes are stable business/runtime identifiers. They are not the same thing as HTTP status numbers.\n\n| Part | Example | Meaning |\n| --- | --- | --- |\n| Prefix | `ERR`, `SUC`, `RSN` | Error, success, or reason-classification code. |\n| Domain segment | `SYS`, `PROCESS`, `IMP`, `EXP`, `AUTH`, `RTR` | Owning capability or technical module vocabulary. |\n| Number | `00004` | Stable numeric identity inside the owner namespace. |\n\nExamples:\n\n```text\nSUC_SYS_00000      Successfully processed\nERR_SYS_00001      Validation error\nERR_PROCESS_00004  Process graph validation failed\nERR_EXP_00001      Export request invalid or dependency unavailable\nERR_RTR_00004      HTTP rate limit exceeded\n```\n\nUse one code for one stable condition. Do not reuse a code for unrelated failures because Axis, integrations, tests, and documentation may make decisions from that code.\n\n## Status definition contract\n\nEach active module may contribute status definitions from `src/utils/statusDefinitions.js`. `DefaultStatusService.loadStatusDefinitions` loads those files during startup and stores the effective map.\n\n```js\nmodule.exports = {\n  ERR_PRODUCT_EXPORT_00001: {\n    code: '422',\n    message: 'Product export filters are invalid'\n  },\n  ERR_PRODUCT_EXPORT_00002: {\n    code: '409',\n    message: 'Product export target is not ready'\n  },\n  SUC_PRODUCT_EXPORT_00000: {\n    code: '202',\n    message: 'Product export workflow accepted'\n  }\n};\n```\n\nStatus definition rules:\n\n| Field | Required | Meaning |\n| --- | --- | --- |\n| Object key | Yes | Stable Nodics status code, normally `ERR_*`, `SUC_*`, or `RSN_*`. |\n| `code` | Yes | HTTP status as a number or numeric string from 100 to 599. |\n| `message` | Yes | Default safe English message. |\n| `type` | Required for `RSN_*` | Must be `reason` for reason-classification codes. |\n| `messageKey` | Optional | Stable localization key when browser localization is needed. |\n| `parameters` | Required when `messageKey` is present | Exact scalar parameter names allowed into the public response. |\n| `exposure` | Required when `messageKey` is present | One of `PUBLIC`, `AUTHENTICATED`, `OPERATOR`, or `INTERNAL`. |\n\nLocalized public messages can be declared like this:\n\n```js\nmodule.exports = {\n  ERR_AUTH_00001: {\n    code: '401',\n    message: 'Authentication failed',\n    messageKey: 'auth.invalid_credentials',\n    parameters: [],\n    exposure: 'PUBLIC'\n  }\n};\n```\n\nThe JSON response handler exposes localization metadata only when the status definition declares `messageKey`, the parameter names are allowed by the definition, and the exposure is permitted by response-handler policy.\n\n## Throwing errors\n\nUse `CLASSES.NodicsError` for expected business/runtime failures.\n\n```js\nthrow new CLASSES.NodicsError(\n  'ERR_PRODUCT_EXPORT_00001',\n  'categoryCode is required when target marketplace is selected'\n);\n```\n\nWhen wrapping a lower-level error, preserve the stable owner code and add context.\n\n```js\ntry {\n  await SERVICE.DefaultProductDiscoveryService.search(request);\n} catch (error) {\n  throw CLASSES.NodicsError.enrich(error, {\n    layer: 'product-export',\n    moduleName: 'product',\n    target: request.target,\n    tenant: request.tenant\n  }, 'ERR_PRODUCT_EXPORT_00003', 'Unable to aggregate product data');\n}\n```\n\nUse `NodicsError.ensure` when a catch block can receive either a plain Error, a string, a plain object, or an existing Nodics error.\n\n```js\ncatch (error) {\n  throw CLASSES.NodicsError.ensure(\n    error,\n    'Product export delivery failed',\n    'ERR_PRODUCT_EXPORT_00004'\n  );\n}\n```\n\n## Aggregated validation errors\n\nUse child errors when one request has multiple field-level or record-level failures.\n\n```js\nconst error = new CLASSES.NodicsError(\n  'ERR_PRODUCT_EXPORT_00001',\n  'Product export request has validation errors'\n);\n\nif (!request.catalogCode) {\n  error.add(new CLASSES.NodicsError(\n    'ERR_PRODUCT_EXPORT_00005',\n    'catalogCode is required'\n  ));\n}\n\nif (!Array.isArray(request.targets) || request.targets.length === 0) {\n  error.add(new CLASSES.NodicsError(\n    'ERR_PRODUCT_EXPORT_00006',\n    'At least one export target is required'\n  ));\n}\n\nif (error.getErrors().length > 0) {\n  throw error;\n}\n```\n\n`DefaultJsonResponseHandlerService.publicError` returns a bounded list of validation errors. The default public policy limits validation details so one bad request cannot flood the response.\n\n## Success response format\n\nSuccess responses should also use stable codes.\n\n```js\nreturn {\n  code: 'SUC_PRODUCT_EXPORT_00000',\n  data: {\n    instanceCode: 'product-export-summer-2026',\n    acceptedTargets: ['marketplace', 'erp', 'analytics']\n  }\n};\n```\n\nThe JSON response handler fills missing fields from `DefaultStatusService`:\n\n```json\n{\n  \"code\": \"SUC_PRODUCT_EXPORT_00000\",\n  \"responseCode\": \"202\",\n  \"message\": \"Product export workflow accepted\",\n  \"data\": {\n    \"instanceCode\": \"product-export-summer-2026\",\n    \"acceptedTargets\": [\"marketplace\", \"erp\", \"analytics\"]\n  }\n}\n```\n\nThe HTTP response status is numeric. The Nodics payload `responseCode` may remain string-based because it comes from module status definitions.\n\n## Error response format\n\nA public JSON error response has this shape:\n\n```json\n{\n  \"responseCode\": \"422\",\n  \"code\": \"ERR_PROCESS_00004\",\n  \"name\": \"NodicsError\",\n  \"message\": \"Process graph validation failed\",\n  \"traceId\": \"request-abc\",\n  \"errors\": [\n    {\n      \"responseCode\": \"422\",\n      \"code\": \"ERR_PROCESS_00018\",\n      \"name\": \"NodicsError\",\n      \"message\": \"Unsupported process runtime node type\"\n    }\n  ]\n}\n```\n\nServer-side logs may contain context, causes, and stack traces. Public API responses should not expose stack traces, secrets, request bodies, provider responses, raw database errors, or filesystem paths.\n\n## HTTP status guidance\n\nUse normal HTTP semantics. The Nodics code explains the product/runtime condition; the HTTP status explains how the API caller should treat the response.\n\n| HTTP status | Use for | Example Nodics condition |\n| --- | --- | --- |\n| `200` | Successful read, update, or completed action. | `SUC_PROCESS_00000` |\n| `201` | Resource or runtime instance created. | `SUC_PROCESS_00007` |\n| `202` | Accepted for asynchronous execution. | Export workflow or trigger accepted. |\n| `400` | Malformed request or unsupported request option. | Invalid export module/schema/format. |\n| `401` | Missing or invalid authentication. | Invalid login or token. |\n| `403` | Authenticated but not allowed. | Action adapter not registered or permission denied. |\n| `404` | Requested definition, task, route, or record not found. | Process definition not found. |\n| `409` | State conflict or lifecycle transition not allowed. | Draft/published state mismatch. |\n| `422` | Structurally valid request failed domain validation. | Workflow graph validation failed. |\n| `429` | Rate limit exceeded. | Router rate-limit policy. |\n| `500` | Unexpected server failure. | Unclassified internal error. |\n| `503` | Required dependency or service unavailable. | Trigger service unavailable. |\n\n## Response handler selection\n\nRoutes normally use `jsonResponseHandler`. A route can declare another handler, such as text or file download, through route metadata.\n\n```js\nmodule.exports = {\n  nSystem: {\n    swaggerUi: {\n      key: '/swagger',\n      method: 'GET',\n      controller: 'DefaultSystemController',\n      operation: 'swaggerUi',\n      secured: false,\n      responseHandler: 'textResponseHandler'\n    }\n  }\n};\n```\n\n`DefaultRequestHandlerService` resolves the response handler from:\n\n```js\nconst responseHandler =\n  CONFIG.get('responseHandler')[routerDef.responseHandler || 'jsonResponseHandler'];\n```\n\nThe selected service receives success or error:\n\n```js\nSERVICE[responseHandler].handleSuccess(request, response, success);\nSERVICE[responseHandler].handleError(request, response, error);\n```\n\n## Configuration\n\nBaseline configuration is intentionally conservative.\n\n```js\nmodule.exports = {\n  returnErrorStack: false,\n  defaultErrorCodes: {\n    NodicsError: 'ERR_SYS_00000'\n  }\n};\n```\n\nProject or environment layers may change defaults:\n\n```js\nmodule.exports = {\n  returnErrorStack: false,\n  defaultErrorCodes: {\n    NodicsError: 'ERR_SYS_00000',\n    ProductExportError: 'ERR_PRODUCT_EXPORT_00000'\n  },\n  responseHandler: {\n    publicError: {\n      maskServerErrorMessages: true,\n      includeValidationErrors: true,\n      maximumValidationErrors: 20,\n      includeLocalizationMetadata: true,\n      permittedLocalizationExposures: ['PUBLIC', 'AUTHENTICATED']\n    }\n  }\n};\n```\n\nDo not enable stack traces in production-like environments. Use logs, correlation ids, and enriched contexts for diagnosis.\n\n## Project customization\n\nDevelopers can customize error behavior safely from a project module.\n\n| Need | Extension point | Avoid |\n| --- | --- | --- |\n| Add capability-specific errors | Add `src/utils/statusDefinitions.js` in the owning module or project overlay. | Throwing codes that are not defined in the status catalogue. |\n| Change fallback error code for a custom error class | Add `defaultErrorCodes.<ClassName>` in layered `config/properties.js`. | Mapping every failure to `ERR_SYS_00000`. |\n| Add safe business context | Use `NodicsError.enrich` or `error.addContext`. | Appending raw payloads, secrets, tokens, or provider responses to messages. |\n| Return localized metadata | Add `messageKey`, `parameters`, and `exposure` to the status definition. | Letting the browser infer localization keys from error messages. |\n| Change public envelope | Override or configure `DefaultJsonResponseHandlerService` through route/response handler configuration. | Making one controller handcraft a different error shape. |\n| Add file/text behavior | Use dedicated response handlers. | Returning files through JSON error/success envelopes. |\n| Show better Axis setup errors | Map backend error codes to safe UI headlines and evidence. | Rendering raw `ERR_SYS_00000` as the primary business message. |\n\nExample project status definitions:\n\n```js\nmodule.exports = {\n  ERR_ACME_PRODUCT_EXPORT_00000: {\n    code: '500',\n    message: 'ACME product export failed'\n  },\n  ERR_ACME_PRODUCT_EXPORT_00001: {\n    code: '422',\n    message: 'ACME product export target filter is invalid',\n    messageKey: 'acme.product_export.invalid_filter',\n    parameters: ['target'],\n    exposure: 'AUTHENTICATED'\n  },\n  SUC_ACME_PRODUCT_EXPORT_00000: {\n    code: '202',\n    message: 'ACME product export was accepted'\n  }\n};\n```\n\nExample custom error class:\n\n```js\nmodule.exports = class ProductExportError extends CLASSES.NodicsError {\n  constructor(error, message) {\n    super(error, message, CONFIG.get('defaultErrorCodes').ProductExportError);\n  }\n};\n```\n\nExample project response handler override:\n\n```js\nmodule.exports = {\n  handleError: function (request, response, error) {\n    error = CLASSES.NodicsError.ensure(error);\n    const publicBody = SERVICE.DefaultJsonResponseHandlerService.publicError(error);\n    publicBody.support = {\n      requestId: response.getHeader && response.getHeader('X-Request-Id')\n    };\n    response.status(Number(publicBody.responseCode) || 500).json(publicBody);\n  }\n};\n```\n\nKeep the public shape compatible unless a versioned API contract intentionally changes it. Axis and integrations should not need a different parser for every module.\n\n## Operator troubleshooting\n\n| Symptom | Likely cause | First check |\n| --- | --- | --- |\n| API returns `ERR_SYS_00000` | Unknown error was wrapped by default fallback. | Check logs for contexts, causes, request id, and module layer. |\n| API response status is `500` for a validation issue | Missing or wrong module status definition. | Add or correct `src/utils/statusDefinitions.js`. |\n| `Invalid error code` during runtime | Code was thrown but not loaded into status map. | Confirm module is active and status definition file exports the code. |\n| Axis shows technical text | UI consumed raw exception message instead of mapped safe message. | Add backend-safe status or Axis mapper with evidence. |\n| Stack trace appears in API response | `returnErrorStack` enabled or custom handler leaked stack. | Disable stack exposure outside local debugging. |\n| Localized message missing | Status definition lacks `messageKey`, allowed parameters, or permitted exposure. | Check status definition and response handler `publicError` policy. |\n\n## Common mistakes\n\n- Throwing plain strings from business services.\n- Reusing one error code for unrelated conditions.\n- Defining a code in source but not in `statusDefinitions.js`.\n- Returning HTTP `200` with an `ERR_*` payload.\n- Exposing raw stack traces, request bodies, tokens, provider responses, or database errors to the browser.\n- Putting business-specific error mapping only in Axis.\n- Changing one controller response shape instead of the shared response handler contract.\n- Using `500` for expected validation, permission, not-found, or lifecycle conflicts.\n\n## Verification\n\nVerify error handling at five levels:\n\n1. Unit tests prove `NodicsError` wraps Error objects, strings, causes, validation children, contexts, circular values, and trace ids safely.\n2. Status catalogue tests prove every used `SUC_*`, `ERR_*`, and `RSN_*` code has a valid definition with HTTP code and message.\n3. Request-pipeline tests prove controller errors reach the configured response handler.\n4. API tests verify HTTP status, payload `responseCode`, public message, localization metadata, and no stack/secret leakage.\n5. Axis browser tests verify user-safe messages, technical evidence for administrators, retry guidance, and request/correlation id visibility.\n\nRun the focused framework checks after changing this contract:\n\n```bash\nnode nodics.foundation/modules/nCommon/test/errorTraceability.test.js\nnode nodics.foundation/modules/nService/test/statusDefinitionCatalog.test.js\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs test\n```\n",
    "keywords": [
      "error-handling",
      "status-codes",
      "NodicsError",
      "DefaultStatusService",
      "responseCode",
      "HTTP status",
      "DefaultJsonResponseHandlerService",
      "statusDefinitions",
      "messageKey",
      "publicError",
      "Application Configuration and Runtime Behavior Management",
      "Configuration Layers and Behavior",
      "Error Handling and Status Codes",
      "NodicsError"
    ],
    "facets": {
      "section": "application-configuration-and-runtime-behavior-management",
      "group": "application-configuration-and-runtime-behavior-management",
      "navigationDepth": 2,
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
      "maturityState": "operational"
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  }
};
