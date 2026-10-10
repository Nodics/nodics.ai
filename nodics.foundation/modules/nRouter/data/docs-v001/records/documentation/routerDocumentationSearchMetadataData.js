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
    "code": "nodicsDocsSearchnodenodicsdocsnodepageroutingapigovernance",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageroutingApiGovernance",
    "title": "Routing and API Governance",
    "summary": "How Nodics owns route metadata, generated CRUD routes, security, permissions, request context, and runtime API behavior.",
    "searchText": "Routing and API Governance How Nodics owns route metadata, generated CRUD routes, security, permissions, request context, and runtime API behavior. routing api-governance router route-security generated-crud",
    "keywords": [
      "routing",
      "api-governance",
      "router",
      "route-security",
      "generated-crud"
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
    "code": "nodicsDocsSearchnodenodicsdocsnodepageroutingapirequestlifecycle",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageroutingApiRequestLifecycle",
    "title": "API Request Lifecycle and Handler Pipeline",
    "summary": "How each Nodics HTTP request moves from Express route binding through request context, exposure checks, authentication branches, cache lookup, controller dispatch, response handlers, and safe customization.",
    "searchText": "API Request Lifecycle and Handler Pipeline How each Nodics HTTP request moves from Express route binding through request context, exposure checks, authentication branches, cache lookup, controller dispatch, response handlers, and safe customization. request lifecycle handler pipeline requestHandlerPipeline nRouter controller dispatch response handler",
    "keywords": [
      "request lifecycle",
      "handler pipeline",
      "requestHandlerPipeline",
      "nRouter",
      "controller dispatch",
      "response handler"
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
  "record2": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataroutingapigovernance",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataroutingApiGovernance",
    "title": "Routing and API Governance",
    "summary": "How Nodics owns route metadata, generated CRUD routes, security, permissions, request context, and runtime API behavior.",
    "searchText": "Routing and API Governance How Nodics owns route metadata, generated CRUD routes, security, permissions, request context, and runtime API behavior. # Routing and API Governance\n\nRouting and API Governance explains how Nodics decides which backend routes exist, which controller operation handles each request, whether authentication is required, which permission groups apply, and how generated CRUD endpoints stay aligned with schema ownership. This page is for business users, beginners, developers, operators, architects, QA owners, and AI tools that need to understand API behavior without turning Axis or Nexus into the route authority.\n\nThe business problem is predictable access. Enterprise teams need customer journeys, Axis operations, integrations, imports, and runtime administration to call APIs that are discoverable, secured, version-aware, and explainable. A route that is added in one place, hidden in another, and secured somewhere else creates audit gaps. Nodics keeps routing metadata backend-owned so route availability, security, request context, and generated behavior can be validated together.\n\n## Business context\n\nFor business users, routing is not just a developer concern. It decides whether a customer can submit a review, whether an operator can approve a return, whether Axis can load a workbench, whether Nexus can render public documentation, and whether an integration can call an authenticated endpoint. A well-governed route tells the business what operation is exposed, who can use it, what data it accepts, and what evidence exists when it fails.\n\n| Business question | Routing answer |\n| --- | --- |\n| What problem does it solve? | It makes API availability, security, ownership, and operational behavior explicit instead of scattered across frontend code and controllers. |\n| Who uses it? | Developers define routes, Axis and Nexus consume them, operators monitor them, QA validates them, and business users experience the workflows they enable. |\n| What decisions are supported? | Whether a route is public, authenticated, operator-only, internal, generated from schema metadata, or overridden by a customer project. |\n| What changes runtime behavior? | Route metadata, generated CRUD settings, security flags, access groups, controller operation mapping, and governed runtime router records. |\n| What is the business impact? | Incorrect route governance can expose private data, block legitimate users, bypass approval, or make clustered nodes behave differently. |\n\n## Journey and ownership\n\nThe technical module is `nRouter`, but the reader-facing capability is Routing and API Governance. Functional modules declare the APIs they own. `nRouter` registers those declarations, generated route metadata, route utilities, request context, and HTTP behavior. Axis may render operations and documentation links from backend metadata. Nexus may call public Online routes. Neither frontend becomes the source of truth for route existence or access.\n\nUse this page to decide whether a route should exist and who owns it. Use `API Request Lifecycle and Handler Pipeline` when a developer needs the step-by-step runtime path from Express binding through request parsing, security branching, cache lookup, controller dispatch, response handlers, and safe customization.\n\n```mermaid\nflowchart LR\n  Module[\"Owning capability module\"] --> Metadata[\"Route metadata\"]\n  Schema[\"Schema CRUD settings\"] --> Generated[\"Generated CRUD routes\"]\n  Metadata --> Router[\"nRouter registration\"]\n  Generated --> Router\n  Router --> Guard[\"Auth, permission, tenant context\"]\n  Guard --> Controller[\"Controller operation\"]\n  Controller --> Service[\"Owning service\"]\n  Service --> Evidence[\"Logs, status, audit, tests\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability | Owning functional module | Explains why the API exists and who should use it. |\n| Route registration | `nRouter` | Registers static and generated route metadata into the runtime router. |\n| Controller operation | Owning module | Executes behavior through the module service/facade boundary. |\n| Authentication policy | Route metadata and security services | Defines `secured`, pre-authentication, internal token, customer, or operator behavior. |\n| Permission policy | Profile and capability metadata | Resolves groups, roles, permissions, enterprise, and tenant scope. |\n| Axis action | Backend-declared BackOffice capability | Axis renders actions from metadata but does not invent route authority. |\n\n## Data and configuration detail\n\nRouting changes behavior when route metadata changes. A route definition needs a method, path, controller, operation, request processing behavior, security flag, access group or permission mapping, and generated-route relationship where applicable. Generated CRUD routes must remain tied to the schema owner so a module does not expose another module's data without a deliberate contract.\n\n| Route detail | What to document | Verification signal |\n| --- | --- | --- |\n| Method and path | HTTP method, route path, version prefix, and public/internal audience. | Router registration test and API smoke test. |\n| Controller binding | Controller service and operation name. | Controller/facade contract test. |\n| Security mode | Public, pre-authentication, authenticated, operator, internal token, or restricted. | Authorization and denial-path tests. |\n| Access policy | Permission code, group, role, tenant, enterprise, and ownership checks. | Profile permission and scoped access tests. |\n| Generated CRUD | Schema owner, allowed operations, query behavior, and disabled operations. | Generated route and model contract tests. |\n| Runtime override | Source record, approval, event propagation, checksum, and rollback. | Governed runtime-change tests and cluster propagation evidence. |\n\n```js\nroute: {\n  method: \"GET\",\n  path: \"/nodics/example/v0/items\",\n  controller: \"DefaultExampleController\",\n  operation: \"search\",\n  secured: true,\n  permissionConfig: \"example.item.read\"\n}\n```\n\n## Customization and extension\n\nDevelopers should customize routing from the project layer or the owning capability, not by editing Axis links. A customer project may add a new endpoint, disable generated CRUD behavior, tighten access groups, add request processors, or replace a controller operation when it preserves the route contract and source ownership. Business users may control some route-related behavior indirectly through Axis when the backend exposes governed records, such as documentation visibility, runtime configuration, or workflow action availability.\n\n| Customization goal | Recommended path | Avoid |\n| --- | --- | --- |\n| Add a customer API | Project-layer route contribution with service/facade ownership. | Adding a frontend-only URL that assumes a backend handler exists. |\n| Restrict an existing API | Override route access policy through backend-owned metadata. | Hiding the button in Axis while the route remains callable. |\n| Enable generated CRUD | Schema-owned generated route configuration. | Copying generic CRUD routes into a separate module. |\n| Change anonymous access | Explicit route security configuration and allow-list evidence. | Treating `secured: false` as a casual convenience. |\n| Refresh routes at runtime | Governed runtime router change plus propagation event. | Editing local files on one node in a cluster. |\n\n## Related developer guides\n\n| Topic | When to use it |\n| --- | --- |\n| `API Request Lifecycle and Handler Pipeline` | Explain how an accepted route is processed after Express receives the HTTP request. |\n| `Pipeline and Business Logic Orchestration` | Add or adjust ordered business behavior behind a route. |\n| `Module-to-Module Communication` | Call another module without copying its schema or bypassing its API authority. |\n| `Error Handling and Status Codes` | Define stable status codes, HTTP statuses, safe error bodies, localization metadata, and project-specific overrides. |\n\n## Operations and governance\n\n### Reading the effective API policy\n\nOpenAPI describes registered contracts; it is not a grant to execute them. Each operation's `x-nodics` metadata preserves its route `accessGroups`, literal and configured permissions, accepted token types, and `apiExposure` declaration. The exposure value remains a string category or the authored object, for example:\n\n```js\n{\n  \"x-nodics\": {\n    \"permissionConfig\": \"inventory.management.permission\",\n    \"apiExposure\": { \"category\": \"inventoryManagement\" },\n    \"authTokenTypes\": [\"service\"]\n  }\n}\n```\n\nThe existing request pipeline resolves that category against the selected runtime's `apiExposure.categories.inventoryManagement.enabled`, then the exposure default. It separately authenticates the caller and evaluates access groups, token type and permissions. Schema access, ownership, authoring stage, validation and concurrency still apply behind a generated route. An operation can therefore appear in OpenAPI and still reject a caller or be disabled for that runtime. An untagged route does not inherit another API's exposure gate.\n\nBefore changing a consumer to a different route, compare the effective method, module prefix, version, schema alias, request and response shape, exposure, permissions and business owner. A generated service can exist while its schema's `router.enabled` is false; service availability is not HTTP availability. Do not enable broad generated CRUD merely to replace a consumer adapter when the module requires a narrower domain command.\n\n### Customize and extend safely: API policy metadata\n\nAuthor policy changes in the owning module or a project-owned `src/router/routers.js` contribution and layered `config/properties.js`. For example, a project can disable the `inventoryManagement` category for one server while retaining its routes and schemas for other servers. Preserve token-type, tenant, schema and domain checks; changing frontend visibility cannot replace them. Regenerate OpenAPI from the selected composition and verify both the allowed server and the rejecting server with the intended principal type.\n\nGeneration rejects duplicate method/path declarations with conflicting exposure metadata. Correct the existing route contribution or its governed override; do not add an alias with weaker policy to make generation succeed. Run `nRouter/test/openapiContractGeneration.test.js` and the route authorization tests. Treat a source-composed contract, a contract including governed persisted overlays, and an authenticated live request as separate evidence. A stale deployed contract must be regenerated or refreshed through its existing owner.\n\nOperators need to know whether a route is missing, blocked by permission, failing in controller logic, or stale on only part of a cluster. Documentation must therefore include request path, security mode, expected status codes, error shape, logs, correlation id, tenant scope, and rollback behavior. When route changes are runtime-governed, the page must also explain which event refreshes local registries and how operators prove all nodes are aligned.\n\n| Failure mode | Symptom | Troubleshooting step |\n| --- | --- | --- |\n| Route not registered | Client receives not found. | Check module activation, route metadata, generated CRUD settings, and startup registration logs. |\n| Wrong security mode | Public route asks for a token or private route is exposed. | Inspect route `secured` state, permission config, and pre-authentication classification. |\n| Permission denied | Authenticated user cannot perform an expected action. | Verify profile groups, permission codes, tenant/enterprise scope, and Axis capability metadata. |\n| Controller mismatch | Route exists but fails before service behavior. | Confirm controller name, operation name, request mapping, and facade contract. |\n| Cluster drift | One node handles the route differently. | Compare runtime router registry checksums and propagation-event evidence across nodes. |\n\n## Common mistakes\n\n- Treating a left-navigation link as proof that an API exists.\n- Making Axis hide a button but leaving the route open.\n- Enabling anonymous access without documenting why the request is safe.\n- Exposing generated CRUD for a schema that should only be modified through lifecycle actions.\n- Forgetting tenant and enterprise context when testing APIs locally.\n- Changing runtime route behavior without propagation and rollback evidence.\n- Publishing documentation for a route without source evidence and security classification.\n\n## Verification\n\nVerification starts with the documentation page. It must include the business problem, owning capability, route metadata table, security and access rules, visual request flow, customization guidance, runtime-change behavior, common mistakes, and validation commands. The catalogue entry must include source evidence pointing to route metadata, router services, schema CRUD configuration, and related docs.\n\nImplementation verification should include router syntax checks, generated route tests, authorization denial tests, profile permission resolution tests, request-context tests, controller/facade tests, and runtime router override tests where applicable. Public Nexus routes must be verified separately from Axis authenticated routes. Production-like validation should prove that no draft or restricted route becomes public documentation, no secret-like example is rendered, and all cluster nodes agree on the effective route registry.\n\nSelected project builds and OpenAPI generation use the same runtime metadata resolver. A short server alias such as `platform` resolves to its declared server, such as `platformServer`, before configuration loads. The selected environment is retained. Unknown servers or environments fail; generation must never silently switch to another runtime graph. Generated contracts remain projections of that graph and do not start application resources.\n\n## Module identity and outbound API prefixes\n\nA capability may declare an existing package `prefix` that differs from its logical name. Route registration and static outbound URL construction use that same metadata. For example, Workflow remains `workflow` for ownership and credential scope while its API path uses `/process`. A connection alias selects the deployment endpoint; it does not rename the capability. Discover remote source metadata through the existing runtime roots without activating its services when the prefix is needed by a static connection.\n\nRuntime Registry lease endpoints already carry the canonical module API path. The shared nService client retains that path instead of appending a second logical module segment. Origin-only endpoints use the discovered package prefix or the unchanged logical name. Target-authority checks, scoped authentication, remote-only dispatch and request deadlines still apply.\n\n### CORS header differences\n\nKeep default allowed/exposed header lists in nRouter. Applications add only their header differences using `httpHardening.cors.allowedHeaderOverrides` and `exposedHeaderOverrides`, both empty by default. For example, `exposedHeaderOverrides: { ETag: true }` exposes that response header after the origin passes existing CORS policy. A false entry removes a baseline or previously added header. Exact origins, enablement and credentials remain separate decisions.\n\nNames match the baseline without regard to case. Keep override key spelling consistent across layers; duplicate case variants, invalid HTTP token names and non-boolean maps reject. The consumer preserves its inputs. Use explicit nConfig replacement for clearing inherited overrides and existing array semantics for a complete baseline override. The HTTP hardening test covers two unrelated browser origins, additions/removals, malformed input, default closure and origin denial.\n\n## Origins from configured frontend endpoints\n\nnRouter constructs browser origins from `httpHardening.cors.originEndpoints`, using framework `originDefaults` of HTTP and localhost for structured `{ code, port }` entries. A keyed endpoint map also accepts full origin URLs. Frontend ports can come from the selected environment profile through nConfig: `{ $config: 'profile', path: 'topology.groups.frontends', fields: ['code', 'port'] }`. This is a literal projection through the existing loader, not a new configuration layer. Host and port values must be the published frontend addresses seen by the browser, including any reverse proxy or container mapping.\n\nFor a custom project/environment, override `originDefaults.host` and `.protocol` for structured endpoints, or supply exact URL endpoint values. Replace the endpoint collection using `$config: 'replace'` when changing the deployment. `originEndpointOverrides: { store: false }` denies the named frontend and follows its changed host/port. Explicit allowed origins remain additive; every explicit or endpoint denial wins. Clear obsolete identity overrides when replacing sources. CORS activation and credential policy remain separate, closed framework defaults.\n\nOnly declared sources are used. No request header or backend-listener discovery can grant an origin. Missing profile fields, duplicate frontend codes, unknown restriction codes, malformed ports/URLs and unsafe profile data reject. Source metadata is read at configuration load; later resolved property changes are observed by the router. Profile-file edits require normal configuration reload.\n\nThe complete Local and custom-HTTPS examples, explicit-origin alternative and collection replacement guidance are in `nRouter/llm/examples/README.md#configure-browser-origins`; the exact behavior and failure contract is in `nRouter/llm/contracts/README.md#configured-browser-origin-construction`. Project owners supply deployment choices; framework maintainers own construction, validation and regression coverage. Operators validate browser access after the normal build/restart; prepared configuration checks alone do not prove deployment.\n",
    "keywords": [
      "routing",
      "api-governance",
      "router",
      "route-security",
      "generated-crud",
      "Routing and API Governance",
      "nRouter",
      "API security",
      "Generated CRUD Routes",
      "Route Metadata"
    ],
    "facets": {
      "section": "application-configuration-and-runtime-behavior-management",
      "group": "application-configuration-and-runtime-behavior-management",
      "navigationDepth": 2,
      "documentType": "configuration",
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
  },
  "record3": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataroutingapirequestlifecycle",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataroutingApiRequestLifecycle",
    "title": "API Request Lifecycle and Handler Pipeline",
    "summary": "How each Nodics HTTP request moves from Express route binding through request context, exposure checks, authentication branches, cache lookup, controller dispatch, response handlers, and safe customization.",
    "searchText": "API Request Lifecycle and Handler Pipeline How each Nodics HTTP request moves from Express route binding through request context, exposure checks, authentication branches, cache lookup, controller dispatch, response handlers, and safe customization. # API Request Lifecycle and Handler Pipeline\n\nEvery Nodics HTTP API request enters a governed request lifecycle before it reaches a controller. This page explains that lifecycle from the first Express route binding to the final response handler. It is written for beginners, business users, developers, operators, architects, QA owners, and AI tools that need to understand how a request is accepted, enriched, authorized, dispatched, cached, and returned without moving business logic into the wrong layer.\n\nThe business value is predictable API behavior. A customer action, Axis operation, public Nexus request, integration call, or internal runtime request should be handled by the same contract every time: route metadata selects the operation, the handler pipeline builds trusted request context, authorization checks run before the controller, and response handlers return a standard success or error shape. Developers customize the pipeline only through owning modules or project layers, not by bypassing controller dispatch or adding hidden Express middleware.\n\n## Source map\n\n| Runtime area | Source location | Responsibility |\n| --- | --- | --- |\n| Route definitions | `src/router/routers.js` | Declares common generated CRUD routes, special routes, controller names, operations, security, cache, help, and exposure metadata. |\n| Express bridge | `src/service/router/defaultRouterOperationService.js` | Binds effective router definitions to Express methods and delegates calls to the request handler. |\n| Request entry point | `src/service/defaultRequestHandlerService.js` | Creates the internal request context, sets request/correlation headers, starts `requestHandlerPipeline`, and selects the response handler. |\n| Pipeline definition | `src/pipelines/pipelines.js` | Defines `requestHandlerPipeline`, `handleSecuredRequestPipeline`, and `handleNonSecuredRequestPipeline`. |\n| Main pipeline handlers | `src/service/request/defaultRequestHandlerPipelineService.js` | Handles API exposure, help, headers, body enrichment, branch selection, API cache, and controller dispatch. |\n| Secured branch | `src/service/request/defaultSecuredRequestPipelineService.js` | Validates secured calls, API key, bearer token, request data, and access. |\n| Non-secured branch | `src/service/request/defaultNonSecuredRequestPipelineService.js` | Resolves enterprise and tenant context for approved non-secured routes. |\n| Response handlers | `src/service/handlers/response` | Converts success or error pipeline output into JSON, text, or file responses. |\n| Contract tests | `test/requestPipelineResponseContract.test.js` | Proves success, controller error, missing credentials, public routes, API exposure, and response sanitization. |\n\n## End-to-end flow\n\nFor beginners, think of the handler pipeline as the controlled doorway between the web server and business behavior. Express receives a request, but Nodics does not immediately call a controller. Nodics first converts the route and HTTP request into an internal request object, then runs ordered pipeline nodes.\n\n```mermaid\nflowchart TD\n  Caller[\"API caller\"] --> Express[\"Express route binding\"]\n  Express --> RouterDef[\"Effective router definition\"]\n  RouterDef --> RequestContext[\"DefaultRequestHandlerService creates Nodics request context\"]\n  RequestContext --> Exposure[\"validateApiExposure\"]\n  Exposure --> Help[\"helpRequest\"]\n  Help --> Headers[\"parseHeader\"]\n  Headers --> Body[\"parseBody\"]\n  Body --> Special[\"handleSpecialRequest\"]\n  Special --> Branch[\"redirectRequest\"]\n  Branch -->|secured| Secured[\"handleSecuredRequestPipeline\"]\n  Branch -->|non-secured| NonSecured[\"handleNonSecuredRequestPipeline\"]\n  Branch -->|public| Cache[\"lookupCache\"]\n  Secured --> Cache\n  NonSecured --> Cache\n  Cache --> Controller[\"handleRequest -> CONTROLLER[name][operation]\"]\n  Controller --> Response[\"Configured response handler\"]\n```\n\nThe request context contains the selected router definition, HTTP request and response, request id, parent request id, protocol, host, original URL, method, request body, module name, security flag, and a special-route flag. The response receives `X-Request-Id` and `X-Correlation-Id`, so operators can trace one call through logs, downstream module calls, and error evidence.\n\n## Main pipeline nodes\n\n`requestHandlerPipeline` starts at `validateApiExposure` and ends at `successEnd` when the controller succeeds. Each node has one narrow job.\n\n| Node | What it does | Safe customization |\n| --- | --- | --- |\n| `validateApiExposure` | Blocks route categories disabled for the current runtime, such as an API group hidden from a public node. | Add or tighten exposure categories in route metadata and runtime configuration. |\n| `helpRequest` | Returns route help metadata when the URL ends with `?help`. | Extend route help content from the owning module. |\n| `parseHeader` | Normalizes modern and legacy auth headers into `request.auth`, `request.apiKey`, `request.authToken`, and `request.entCode`. | Add an enterprise-specific credential type only when the security owner accepts the contract. |\n| `parseBody` | Placeholder hook after body parser handlers have run. | Add bounded body normalization or request-context enrichment. |\n| `handleSpecialRequest` | Runs special handler routes that use `handler` instead of `controller`. | Reserve for framework-level utilities such as ping or help behavior. |\n| `redirectRequest` | Chooses secured, non-secured, or public branch by route metadata and credentials. | Change branch rules only through route/security ownership. |\n| `handleSecuredRequest` | Runs the secured nested pipeline. | Extend security checks in security-owned services or project security modules. |\n| `handleNonSecuredRequest` | Runs enterprise and tenant resolution for approved non-secured calls. | Extend enterprise/tenant lookup without exposing private routes. |\n| `lookupCache` | Reads API cache when the route cache policy allows it. | Customize cache policy, key generation, or cache provider behavior. |\n| `handleRequest` | Calls `CONTROLLER[router.controller][router.operation]` and optionally writes cacheable success. | Replace the controller operation or owning service, not the dispatcher itself. |\n\n## Route metadata contract\n\nThe route definition is the request contract that the pipeline obeys. Developers should document every route with method, path, module owner, controller, operation, security mode, permission policy, exposure category, request body shape, response handler, cache behavior, and help text.\n\n```js\nmodule.exports = {\n  customerProductSearch: {\n    key: '/products/search',\n    method: 'POST',\n    controller: 'DefaultProductSearchController',\n    operation: 'search',\n    moduleName: 'product',\n    secured: false,\n    publicAccess: true,\n    apiExposure: {\n      category: 'storefront'\n    },\n    responseHandler: 'jsonResponseHandler',\n    cache: {\n      enabled: true,\n      ttl: 300\n    },\n    help: {\n      summary: 'Search published storefront products.'\n    }\n  }\n};\n```\n\nThis metadata does not contain business decisions such as price calculation, inventory reservation, approval, publication, or refund policy. Those belong in services, pipelines, workflows, and owning module validation. The route only declares how the API is exposed and where the request should be handed off.\n\n## Secured, non-secured, and public branches\n\nThe request pipeline distinguishes three cases:\n\n| Branch | When used | Required context |\n| --- | --- | --- |\n| Secured | `router.secured` is true and the route is not explicitly public. | API key or bearer token, valid request data, resolved access policy, tenant, and enterprise context. |\n| Non-secured | Route is configured as non-secured but still needs enterprise and tenant context. | Enterprise code and valid tenant resolution. |\n| Public | Route is an explicit public probe, public access route, or OpenAPI contract route. | No secret credential is required, but exposure policy and optional tenant context still apply. |\n\nPublic does not mean unmanaged. Public routes still use route metadata, exposure categories, response handlers, bounded payloads, cache rules, and standard errors. Non-secured routes must never be used as a shortcut for private data. A business user may see a friendly action in Nexus or Axis, but the backend route metadata remains the authority for whether the request is allowed.\n\n## Response and error handling\n\nThe request handler chooses the configured response handler before the pipeline runs. A JSON route normally uses `DefaultJsonResponseHandlerService`; plain text and file download routes use dedicated handlers. A controller success becomes the response payload. A controller error, authorization failure, disabled exposure category, broken pipeline, or cache failure flows through the same error path.\n\nThe important rule for developers is low disclosure. Public API responses must not leak internal pipeline contexts, service stacks, router metadata, or raw implementation details. The contract test verifies that internal pipeline contexts are not returned in public JSON errors. Operators should still be able to trace the request through logs using request id, correlation id, route, module, tenant, and sanitized error code.\n\nUse `Error Handling and Status Codes` when defining the actual error code, HTTP status, public message, localization metadata, and project override. This request-lifecycle page explains where the error is caught; the error guide explains the payload contract that must be returned to callers.\n\n## Customization and extension\n\nDevelopers should customize the request lifecycle at the smallest responsible point.\n\n| Need | Recommended extension | Avoid |\n| --- | --- | --- |\n| Add a new API | Add route metadata in the owning module and implement controller/facade/service behavior. | Registering a frontend-only URL or raw Express handler outside the module graph. |\n| Add request validation before controller handoff | Add a pipeline node or secured-branch validation in the owning module. | Putting reusable validation in every controller. |\n| Add tracing or correlation metadata | Extend `DefaultRequestHandlerService` or a pipeline node in a project layer. | Mutating global HTTP state in unrelated middleware. |\n| Add tenant-specific header normalization | Override `normalizeAuthHeaders` or `parseHeader` in a security-approved project module. | Accepting unbounded custom headers in controllers. |\n| Change response shape | Add or select a response handler with a stable route contract. | Returning arbitrary controller payloads that bypass standard errors. |\n| Cache a safe API | Configure route cache and cache policy. | Caching private or mutation responses without policy evidence. |\n\nA project module may override a pipeline definition in a later module layer, but it must preserve route ownership, security, response shape, and test coverage. If the change affects authorization, tenant resolution, or public data visibility, treat it as a security and production behavior change.\n\n## Developer example\n\nSuppose a customer project needs to require a storefront channel header before public product search. The correct shape is a small pipeline node and a route contract update.\n\n```js\nmodule.exports = {\n  requestHandlerPipeline: {\n    nodes: {\n      validateStorefrontChannel: {\n        type: 'function',\n        handler: 'CustomerStorefrontRequestPipelineService.validateChannel',\n        success: 'lookupCache'\n      }\n    }\n  }\n};\n```\n\n```js\nmodule.exports = {\n  validateChannel: function (request, response, process) {\n    const channel = request.httpRequest.get('x-storefront-channel');\n    if (!channel || !['web', 'mobile'].includes(channel)) {\n      process.error(request, response, new CLASSES.NodicsError('ERR_REQ_00010'));\n      return;\n    }\n    request.channel = channel;\n    process.nextSuccess(request, response);\n  }\n};\n```\n\nThe project must also adjust the effective success transition so the node is actually used, add route help metadata explaining the header, and test valid, missing, invalid, and unauthorized requests. The product controller should receive a normalized `request.channel`; it should not parse the raw HTTP header again.\n\n## Operator troubleshooting\n\n| Symptom | Likely layer | First check |\n| --- | --- | --- |\n| `404` or route not found | Router registration | Confirm the module is active and the route exists in effective router metadata. |\n| `401` before controller logs | `parseHeader` or secured branch | Check `Authorization`, `x-api-key`, `x-enterprise-code`, route `secured`, and public flags. |\n| `403` for a previously visible API | API exposure or access check | Inspect `apiExposure`, permission config, profile groups, and runtime category enablement. |\n| Controller did not run | Branch, special route, or cache | Check pipeline branch, cache hit evidence, and controller name/operation spelling. |\n| Different nodes behave differently | Runtime route or pipeline drift | Compare active modules, persisted runtime records, checksums, and propagation events. |\n| Raw technical error leaks to caller | Response handler or error mapping | Check response handler, status definitions, and sanitized `NodicsError` mapping. |\n\n## Common mistakes\n\n- Adding business logic to the request handler pipeline when it belongs in the domain pipeline, workflow, service, or validator.\n- Parsing credentials in controllers instead of relying on normalized request auth and secured pipeline checks.\n- Treating `secured: false` as a public-data guarantee.\n- Exposing a route in Swagger without proving runtime API exposure and permission policy.\n- Copying generated CRUD routes into a project module instead of changing the schema-owned route configuration.\n- Returning raw service or pipeline errors directly to public callers.\n- Editing framework `nRouter` source for a customer-specific request rule that belongs in a later project module.\n\n## Verification\n\nRequest lifecycle changes require focused tests before wider runtime testing. At minimum, verify route registration, successful secured request, successful non-secured request, public request, missing credentials, disabled exposure category, controller success, controller error, response handler output, request/correlation headers, cache hit/miss behavior, and sanitized error payloads. Existing evidence starts with `nRouter/test/requestPipelineResponseContract.test.js`, `nRouter/test/routeActionAuthorization.test.js`, `nRouter/test/openapiContractGeneration.test.js`, and any controller or facade contract tests owned by the changed module.\n\nAfter changing documentation, maintain canonical CMS data and validate the documentation pack:\n\n```bash\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs run validate\n```\n\nFor production-like evidence, start a fresh local runtime, call the affected API with valid and invalid credentials, confirm the expected response shape, check logs by request id, and confirm Axis or Nexus does not invent a parallel route authority.\n",
    "keywords": [
      "request lifecycle",
      "handler pipeline",
      "requestHandlerPipeline",
      "nRouter",
      "controller dispatch",
      "response handler",
      "API Request Lifecycle",
      "Handler Pipeline",
      "Request Context",
      "Controller Dispatch",
      "Response Handler"
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
