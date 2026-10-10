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
    "code": "nodicsDocsComponentroutingApiGovernance",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "routing.api-governance",
      "title": "Routing and API Governance",
      "route": "/docs/framework/routing-api-governance",
      "section": "application-configuration-and-runtime-behavior-management",
      "sectionTitle": "Application Configuration and Runtime Behavior Management",
      "group": "application-configuration-and-runtime-behavior-management",
      "groupTitle": "Application Configuration and Runtime Behavior Management",
      "parentId": "application-configuration-and-runtime-behavior-management",
      "hierarchyPath": [
        "Application Configuration and Runtime Behavior Management",
        "Routing and API Governance"
      ],
      "hierarchyDepth": 2,
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
      "summary": "How Nodics owns route metadata, generated CRUD routes, security, permissions, request context, and runtime API behavior.",
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
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "configuration.runtime-behavior-management",
        "runtime.governed-change",
        "security.identity-access-governance",
        "routing.api-request-lifecycle",
        "foundation.error-handling-status-codes",
        "foundation.module-to-module-communication"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "README.md",
        "src/router/routers.js",
        "src/service/router/defaultRouterService.js",
        "src/service/router/defaultRouterInitializerService.js",
        "src/service/defaultHttpHardeningService.js",
        "test/routeActionAuthorization.test.js",
        "test/openapiContractGeneration.test.js",
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
        "routing",
        "api-governance",
        "router",
        "route-security",
        "generated-crud"
      ],
      "topicKeywords": [
        "Routing and API Governance",
        "nRouter",
        "API security",
        "Generated CRUD Routes",
        "Route Metadata"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "routingApiGovernance-1-business-context",
          "level": 2
        },
        {
          "text": "Journey and ownership",
          "anchor": "routingApiGovernance-2-journey-and-ownership",
          "level": 2
        },
        {
          "text": "Data and configuration detail",
          "anchor": "routingApiGovernance-3-data-and-configuration-detail",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "routingApiGovernance-4-customization-and-extension",
          "level": 2
        },
        {
          "text": "Related developer guides",
          "anchor": "routingApiGovernance-5-related-developer-guides",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "routingApiGovernance-6-operations-and-governance",
          "level": 2
        },
        {
          "text": "Reading the effective API policy",
          "anchor": "routingApiGovernance-7-reading-the-effective-api-policy",
          "level": 3
        },
        {
          "text": "Customize and extend safely: API policy metadata",
          "anchor": "routingApiGovernance-8-customize-and-extend-safely-api-policy-metadata",
          "level": 3
        },
        {
          "text": "Common mistakes",
          "anchor": "routingApiGovernance-9-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "routingApiGovernance-10-verification",
          "level": 2
        },
        {
          "text": "Module identity and outbound API prefixes",
          "anchor": "routingApiGovernance-11-module-identity-and-outbound-api-prefixes",
          "level": 2
        },
        {
          "text": "CORS header differences",
          "anchor": "routingApiGovernance-12-cors-header-differences",
          "level": 3
        },
        {
          "text": "Origins from configured frontend endpoints",
          "anchor": "routingApiGovernance-13-origins-from-configured-frontend-endpoints",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Routing and API Governance explains how Nodics decides which backend routes exist, which controller operation handles each request, whether authentication is required, which permission groups apply, and how generated CRUD endpoints stay aligned with schema ownership. This page is for business users, beginners, developers, operators, architects, QA owners, and AI tools that need to understand API behavior without turning Axis or Nexus into the route authority."
        },
        {
          "kind": "paragraph",
          "text": "The business problem is predictable access. Enterprise teams need customer journeys, Axis operations, integrations, imports, and runtime administration to call APIs that are discoverable, secured, version-aware, and explainable. A route that is added in one place, hidden in another, and secured somewhere else creates audit gaps. Nodics keeps routing metadata backend-owned so route availability, security, request context, and generated behavior can be validated together."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "routingApiGovernance-1-business-context"
        },
        {
          "kind": "paragraph",
          "text": "For business users, routing is not just a developer concern. It decides whether a customer can submit a review, whether an operator can approve a return, whether Axis can load a workbench, whether Nexus can render public documentation, and whether an integration can call an authenticated endpoint. A well-governed route tells the business what operation is exposed, who can use it, what data it accepts, and what evidence exists when it fails."
        },
        {
          "kind": "table",
          "headers": [
            "Business question",
            "Routing answer"
          ],
          "rows": [
            [
              "What problem does it solve?",
              "It makes API availability, security, ownership, and operational behavior explicit instead of scattered across frontend code and controllers."
            ],
            [
              "Who uses it?",
              "Developers define routes, Axis and Nexus consume them, operators monitor them, QA validates them, and business users experience the workflows they enable."
            ],
            [
              "What decisions are supported?",
              "Whether a route is public, authenticated, operator-only, internal, generated from schema metadata, or overridden by a customer project."
            ],
            [
              "What changes runtime behavior?",
              "Route metadata, generated CRUD settings, security flags, access groups, controller operation mapping, and governed runtime router records."
            ],
            [
              "What is the business impact?",
              "Incorrect route governance can expose private data, block legitimate users, bypass approval, or make clustered nodes behave differently."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Journey and ownership",
          "anchor": "routingApiGovernance-2-journey-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "The technical module is `nRouter`, but the reader-facing capability is Routing and API Governance. Functional modules declare the APIs they own. `nRouter` registers those declarations, generated route metadata, route utilities, request context, and HTTP behavior. Axis may render operations and documentation links from backend metadata. Nexus may call public Online routes. Neither frontend becomes the source of truth for route existence or access."
        },
        {
          "kind": "paragraph",
          "text": "Use this page to decide whether a route should exist and who owns it. Use `API Request Lifecycle and Handler Pipeline` when a developer needs the step-by-step runtime path from Express binding through request parsing, security branching, cache lookup, controller dispatch, response handlers, and safe customization."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Module[\"Owning capability module\"] --> Metadata[\"Route metadata\"]\n  Schema[\"Schema CRUD settings\"] --> Generated[\"Generated CRUD routes\"]\n  Metadata --> Router[\"nRouter registration\"]\n  Generated --> Router\n  Router --> Guard[\"Auth, permission, tenant context\"]\n  Guard --> Controller[\"Controller operation\"]\n  Controller --> Service[\"Owning service\"]\n  Service --> Evidence[\"Logs, status, audit, tests\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Responsibility",
            "Owner",
            "Notes"
          ],
          "rows": [
            [
              "Business capability",
              "Owning functional module",
              "Explains why the API exists and who should use it."
            ],
            [
              "Route registration",
              "`nRouter`",
              "Registers static and generated route metadata into the runtime router."
            ],
            [
              "Controller operation",
              "Owning module",
              "Executes behavior through the module service/facade boundary."
            ],
            [
              "Authentication policy",
              "Route metadata and security services",
              "Defines `secured`, pre-authentication, internal token, customer, or operator behavior."
            ],
            [
              "Permission policy",
              "Profile and capability metadata",
              "Resolves groups, roles, permissions, enterprise, and tenant scope."
            ],
            [
              "Axis action",
              "Backend-declared BackOffice capability",
              "Axis renders actions from metadata but does not invent route authority."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Data and configuration detail",
          "anchor": "routingApiGovernance-3-data-and-configuration-detail"
        },
        {
          "kind": "paragraph",
          "text": "Routing changes behavior when route metadata changes. A route definition needs a method, path, controller, operation, request processing behavior, security flag, access group or permission mapping, and generated-route relationship where applicable. Generated CRUD routes must remain tied to the schema owner so a module does not expose another module's data without a deliberate contract."
        },
        {
          "kind": "table",
          "headers": [
            "Route detail",
            "What to document",
            "Verification signal"
          ],
          "rows": [
            [
              "Method and path",
              "HTTP method, route path, version prefix, and public/internal audience.",
              "Router registration test and API smoke test."
            ],
            [
              "Controller binding",
              "Controller service and operation name.",
              "Controller/facade contract test."
            ],
            [
              "Security mode",
              "Public, pre-authentication, authenticated, operator, internal token, or restricted.",
              "Authorization and denial-path tests."
            ],
            [
              "Access policy",
              "Permission code, group, role, tenant, enterprise, and ownership checks.",
              "Profile permission and scoped access tests."
            ],
            [
              "Generated CRUD",
              "Schema owner, allowed operations, query behavior, and disabled operations.",
              "Generated route and model contract tests."
            ],
            [
              "Runtime override",
              "Source record, approval, event propagation, checksum, and rollback.",
              "Governed runtime-change tests and cluster propagation evidence."
            ]
          ]
        },
        {
          "kind": "code",
          "language": "js",
          "text": "route: {\n  method: \"GET\",\n  path: \"/nodics/example/v0/items\",\n  controller: \"DefaultExampleController\",\n  operation: \"search\",\n  secured: true,\n  permissionConfig: \"example.item.read\"\n}"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "routingApiGovernance-4-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Developers should customize routing from the project layer or the owning capability, not by editing Axis links. A customer project may add a new endpoint, disable generated CRUD behavior, tighten access groups, add request processors, or replace a controller operation when it preserves the route contract and source ownership. Business users may control some route-related behavior indirectly through Axis when the backend exposes governed records, such as documentation visibility, runtime configuration, or workflow action availability."
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
              "Add a customer API",
              "Project-layer route contribution with service/facade ownership.",
              "Adding a frontend-only URL that assumes a backend handler exists."
            ],
            [
              "Restrict an existing API",
              "Override route access policy through backend-owned metadata.",
              "Hiding the button in Axis while the route remains callable."
            ],
            [
              "Enable generated CRUD",
              "Schema-owned generated route configuration.",
              "Copying generic CRUD routes into a separate module."
            ],
            [
              "Change anonymous access",
              "Explicit route security configuration and allow-list evidence.",
              "Treating `secured: false` as a casual convenience."
            ],
            [
              "Refresh routes at runtime",
              "Governed runtime router change plus propagation event.",
              "Editing local files on one node in a cluster."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Related developer guides",
          "anchor": "routingApiGovernance-5-related-developer-guides"
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
              "Explain how an accepted route is processed after Express receives the HTTP request."
            ],
            [
              "`Pipeline and Business Logic Orchestration`",
              "Add or adjust ordered business behavior behind a route."
            ],
            [
              "`Module-to-Module Communication`",
              "Call another module without copying its schema or bypassing its API authority."
            ],
            [
              "`Error Handling and Status Codes`",
              "Define stable status codes, HTTP statuses, safe error bodies, localization metadata, and project-specific overrides."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and governance",
          "anchor": "routingApiGovernance-6-operations-and-governance"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Reading the effective API policy",
          "anchor": "routingApiGovernance-7-reading-the-effective-api-policy"
        },
        {
          "kind": "paragraph",
          "text": "OpenAPI describes registered contracts; it is not a grant to execute them. Each operation's `x-nodics` metadata preserves its route `accessGroups`, literal and configured permissions, accepted token types, and `apiExposure` declaration. The exposure value remains a string category or the authored object, for example:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "{\n  \"x-nodics\": {\n    \"permissionConfig\": \"inventory.management.permission\",\n    \"apiExposure\": { \"category\": \"inventoryManagement\" },\n    \"authTokenTypes\": [\"service\"]\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "The existing request pipeline resolves that category against the selected runtime's `apiExposure.categories.inventoryManagement.enabled`, then the exposure default. It separately authenticates the caller and evaluates access groups, token type and permissions. Schema access, ownership, authoring stage, validation and concurrency still apply behind a generated route. An operation can therefore appear in OpenAPI and still reject a caller or be disabled for that runtime. An untagged route does not inherit another API's exposure gate."
        },
        {
          "kind": "paragraph",
          "text": "Before changing a consumer to a different route, compare the effective method, module prefix, version, schema alias, request and response shape, exposure, permissions and business owner. A generated service can exist while its schema's `router.enabled` is false; service availability is not HTTP availability. Do not enable broad generated CRUD merely to replace a consumer adapter when the module requires a narrower domain command."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize and extend safely: API policy metadata",
          "anchor": "routingApiGovernance-8-customize-and-extend-safely-api-policy-metadata"
        },
        {
          "kind": "paragraph",
          "text": "Author policy changes in the owning module or a project-owned `src/router/routers.js` contribution and layered `config/properties.js`. For example, a project can disable the `inventoryManagement` category for one server while retaining its routes and schemas for other servers. Preserve token-type, tenant, schema and domain checks; changing frontend visibility cannot replace them. Regenerate OpenAPI from the selected composition and verify both the allowed server and the rejecting server with the intended principal type."
        },
        {
          "kind": "paragraph",
          "text": "Generation rejects duplicate method/path declarations with conflicting exposure metadata. Correct the existing route contribution or its governed override; do not add an alias with weaker policy to make generation succeed. Run `nRouter/test/openapiContractGeneration.test.js` and the route authorization tests. Treat a source-composed contract, a contract including governed persisted overlays, and an authenticated live request as separate evidence. A stale deployed contract must be regenerated or refreshed through its existing owner."
        },
        {
          "kind": "paragraph",
          "text": "Operators need to know whether a route is missing, blocked by permission, failing in controller logic, or stale on only part of a cluster. Documentation must therefore include request path, security mode, expected status codes, error shape, logs, correlation id, tenant scope, and rollback behavior. When route changes are runtime-governed, the page must also explain which event refreshes local registries and how operators prove all nodes are aligned."
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
              "Route not registered",
              "Client receives not found.",
              "Check module activation, route metadata, generated CRUD settings, and startup registration logs."
            ],
            [
              "Wrong security mode",
              "Public route asks for a token or private route is exposed.",
              "Inspect route `secured` state, permission config, and pre-authentication classification."
            ],
            [
              "Permission denied",
              "Authenticated user cannot perform an expected action.",
              "Verify profile groups, permission codes, tenant/enterprise scope, and Axis capability metadata."
            ],
            [
              "Controller mismatch",
              "Route exists but fails before service behavior.",
              "Confirm controller name, operation name, request mapping, and facade contract."
            ],
            [
              "Cluster drift",
              "One node handles the route differently.",
              "Compare runtime router registry checksums and propagation-event evidence across nodes."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "routingApiGovernance-9-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating a left-navigation link as proof that an API exists.",
            "Making Axis hide a button but leaving the route open.",
            "Enabling anonymous access without documenting why the request is safe.",
            "Exposing generated CRUD for a schema that should only be modified through lifecycle actions.",
            "Forgetting tenant and enterprise context when testing APIs locally.",
            "Changing runtime route behavior without propagation and rollback evidence.",
            "Publishing documentation for a route without source evidence and security classification."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "routingApiGovernance-10-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verification starts with the documentation page. It must include the business problem, owning capability, route metadata table, security and access rules, visual request flow, customization guidance, runtime-change behavior, common mistakes, and validation commands. The catalogue entry must include source evidence pointing to route metadata, router services, schema CRUD configuration, and related docs."
        },
        {
          "kind": "paragraph",
          "text": "Implementation verification should include router syntax checks, generated route tests, authorization denial tests, profile permission resolution tests, request-context tests, controller/facade tests, and runtime router override tests where applicable. Public Nexus routes must be verified separately from Axis authenticated routes. Production-like validation should prove that no draft or restricted route becomes public documentation, no secret-like example is rendered, and all cluster nodes agree on the effective route registry."
        },
        {
          "kind": "paragraph",
          "text": "Selected project builds and OpenAPI generation use the same runtime metadata resolver. A short server alias such as `platform` resolves to its declared server, such as `platformServer`, before configuration loads. The selected environment is retained. Unknown servers or environments fail; generation must never silently switch to another runtime graph. Generated contracts remain projections of that graph and do not start application resources."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Module identity and outbound API prefixes",
          "anchor": "routingApiGovernance-11-module-identity-and-outbound-api-prefixes"
        },
        {
          "kind": "paragraph",
          "text": "A capability may declare an existing package `prefix` that differs from its logical name. Route registration and static outbound URL construction use that same metadata. For example, Workflow remains `workflow` for ownership and credential scope while its API path uses `/process`. A connection alias selects the deployment endpoint; it does not rename the capability. Discover remote source metadata through the existing runtime roots without activating its services when the prefix is needed by a static connection."
        },
        {
          "kind": "paragraph",
          "text": "Runtime Registry lease endpoints already carry the canonical module API path. The shared nService client retains that path instead of appending a second logical module segment. Origin-only endpoints use the discovered package prefix or the unchanged logical name. Target-authority checks, scoped authentication, remote-only dispatch and request deadlines still apply."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "CORS header differences",
          "anchor": "routingApiGovernance-12-cors-header-differences"
        },
        {
          "kind": "paragraph",
          "text": "Keep default allowed/exposed header lists in nRouter. Applications add only their header differences using `httpHardening.cors.allowedHeaderOverrides` and `exposedHeaderOverrides`, both empty by default. For example, `exposedHeaderOverrides: { ETag: true }` exposes that response header after the origin passes existing CORS policy. A false entry removes a baseline or previously added header. Exact origins, enablement and credentials remain separate decisions."
        },
        {
          "kind": "paragraph",
          "text": "Names match the baseline without regard to case. Keep override key spelling consistent across layers; duplicate case variants, invalid HTTP token names and non-boolean maps reject. The consumer preserves its inputs. Use explicit nConfig replacement for clearing inherited overrides and existing array semantics for a complete baseline override. The HTTP hardening test covers two unrelated browser origins, additions/removals, malformed input, default closure and origin denial."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Origins from configured frontend endpoints",
          "anchor": "routingApiGovernance-13-origins-from-configured-frontend-endpoints"
        },
        {
          "kind": "paragraph",
          "text": "nRouter constructs browser origins from `httpHardening.cors.originEndpoints`, using framework `originDefaults` of HTTP and localhost for structured `{ code, port }` entries. A keyed endpoint map also accepts full origin URLs. Frontend ports can come from the selected environment profile through nConfig: `{ $config: 'profile', path: 'topology.groups.frontends', fields: ['code', 'port'] }`. This is a literal projection through the existing loader, not a new configuration layer. Host and port values must be the published frontend addresses seen by the browser, including any reverse proxy or container mapping."
        },
        {
          "kind": "paragraph",
          "text": "For a custom project/environment, override `originDefaults.host` and `.protocol` for structured endpoints, or supply exact URL endpoint values. Replace the endpoint collection using `$config: 'replace'` when changing the deployment. `originEndpointOverrides: { store: false }` denies the named frontend and follows its changed host/port. Explicit allowed origins remain additive; every explicit or endpoint denial wins. Clear obsolete identity overrides when replacing sources. CORS activation and credential policy remain separate, closed framework defaults."
        },
        {
          "kind": "paragraph",
          "text": "Only declared sources are used. No request header or backend-listener discovery can grant an origin. Missing profile fields, duplicate frontend codes, unknown restriction codes, malformed ports/URLs and unsafe profile data reject. Source metadata is read at configuration load; later resolved property changes are observed by the router. Profile-file edits require normal configuration reload."
        },
        {
          "kind": "paragraph",
          "text": "The complete Local and custom-HTTPS examples, explicit-origin alternative and collection replacement guidance are in `nRouter/llm/examples/README.md#configure-browser-origins`; the exact behavior and failure contract is in `nRouter/llm/contracts/README.md#configured-browser-origin-construction`. Project owners supply deployment choices; framework maintainers own construction, validation and regression coverage. Operators validate browser access after the normal build/restart; prepared configuration checks alone do not prove deployment."
        }
      ],
      "searchText": "Routing and API Governance How Nodics owns route metadata, generated CRUD routes, security, permissions, request context, and runtime API behavior. # Routing and API Governance\n\nRouting and API Governance explains how Nodics decides which backend routes exist, which controller operation handles each request, whether authentication is required, which permission groups apply, and how generated CRUD endpoints stay aligned with schema ownership. This page is for business users, beginners, developers, operators, architects, QA owners, and AI tools that need to understand API behavior without turning Axis or Nexus into the route authority.\n\nThe business problem is predictable access. Enterprise teams need customer journeys, Axis operations, integrations, imports, and runtime administration to call APIs that are discoverable, secured, version-aware, and explainable. A route that is added in one place, hidden in another, and secured somewhere else creates audit gaps. Nodics keeps routing metadata backend-owned so route availability, security, request context, and generated behavior can be validated together.\n\n## Business context\n\nFor business users, routing is not just a developer concern. It decides whether a customer can submit a review, whether an operator can approve a return, whether Axis can load a workbench, whether Nexus can render public documentation, and whether an integration can call an authenticated endpoint. A well-governed route tells the business what operation is exposed, who can use it, what data it accepts, and what evidence exists when it fails.\n\n| Business question | Routing answer |\n| --- | --- |\n| What problem does it solve? | It makes API availability, security, ownership, and operational behavior explicit instead of scattered across frontend code and controllers. |\n| Who uses it? | Developers define routes, Axis and Nexus consume them, operators monitor them, QA validates them, and business users experience the workflows they enable. |\n| What decisions are supported? | Whether a route is public, authenticated, operator-only, internal, generated from schema metadata, or overridden by a customer project. |\n| What changes runtime behavior? | Route metadata, generated CRUD settings, security flags, access groups, controller operation mapping, and governed runtime router records. |\n| What is the business impact? | Incorrect route governance can expose private data, block legitimate users, bypass approval, or make clustered nodes behave differently. |\n\n## Journey and ownership\n\nThe technical module is `nRouter`, but the reader-facing capability is Routing and API Governance. Functional modules declare the APIs they own. `nRouter` registers those declarations, generated route metadata, route utilities, request context, and HTTP behavior. Axis may render operations and documentation links from backend metadata. Nexus may call public Online routes. Neither frontend becomes the source of truth for route existence or access.\n\nUse this page to decide whether a route should exist and who owns it. Use `API Request Lifecycle and Handler Pipeline` when a developer needs the step-by-step runtime path from Express binding through request parsing, security branching, cache lookup, controller dispatch, response handlers, and safe customization.\n\n```mermaid\nflowchart LR\n  Module[\"Owning capability module\"] --> Metadata[\"Route metadata\"]\n  Schema[\"Schema CRUD settings\"] --> Generated[\"Generated CRUD routes\"]\n  Metadata --> Router[\"nRouter registration\"]\n  Generated --> Router\n  Router --> Guard[\"Auth, permission, tenant context\"]\n  Guard --> Controller[\"Controller operation\"]\n  Controller --> Service[\"Owning service\"]\n  Service --> Evidence[\"Logs, status, audit, tests\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability | Owning functional module | Explains why the API exists and who should use it. |\n| Route registration | `nRouter` | Registers static and generated route metadata into the runtime router. |\n| Controller operation | Owning module | Executes behavior through the module service/facade boundary. |\n| Authentication policy | Route metadata and security services | Defines `secured`, pre-authentication, internal token, customer, or operator behavior. |\n| Permission policy | Profile and capability metadata | Resolves groups, roles, permissions, enterprise, and tenant scope. |\n| Axis action | Backend-declared BackOffice capability | Axis renders actions from metadata but does not invent route authority. |\n\n## Data and configuration detail\n\nRouting changes behavior when route metadata changes. A route definition needs a method, path, controller, operation, request processing behavior, security flag, access group or permission mapping, and generated-route relationship where applicable. Generated CRUD routes must remain tied to the schema owner so a module does not expose another module's data without a deliberate contract.\n\n| Route detail | What to document | Verification signal |\n| --- | --- | --- |\n| Method and path | HTTP method, route path, version prefix, and public/internal audience. | Router registration test and API smoke test. |\n| Controller binding | Controller service and operation name. | Controller/facade contract test. |\n| Security mode | Public, pre-authentication, authenticated, operator, internal token, or restricted. | Authorization and denial-path tests. |\n| Access policy | Permission code, group, role, tenant, enterprise, and ownership checks. | Profile permission and scoped access tests. |\n| Generated CRUD | Schema owner, allowed operations, query behavior, and disabled operations. | Generated route and model contract tests. |\n| Runtime override | Source record, approval, event propagation, checksum, and rollback. | Governed runtime-change tests and cluster propagation evidence. |\n\n```js\nroute: {\n  method: \"GET\",\n  path: \"/nodics/example/v0/items\",\n  controller: \"DefaultExampleController\",\n  operation: \"search\",\n  secured: true,\n  permissionConfig: \"example.item.read\"\n}\n```\n\n## Customization and extension\n\nDevelopers should customize routing from the project layer or the owning capability, not by editing Axis links. A customer project may add a new endpoint, disable generated CRUD behavior, tighten access groups, add request processors, or replace a controller operation when it preserves the route contract and source ownership. Business users may control some route-related behavior indirectly through Axis when the backend exposes governed records, such as documentation visibility, runtime configuration, or workflow action availability.\n\n| Customization goal | Recommended path | Avoid |\n| --- | --- | --- |\n| Add a customer API | Project-layer route contribution with service/facade ownership. | Adding a frontend-only URL that assumes a backend handler exists. |\n| Restrict an existing API | Override route access policy through backend-owned metadata. | Hiding the button in Axis while the route remains callable. |\n| Enable generated CRUD | Schema-owned generated route configuration. | Copying generic CRUD routes into a separate module. |\n| Change anonymous access | Explicit route security configuration and allow-list evidence. | Treating `secured: false` as a casual convenience. |\n| Refresh routes at runtime | Governed runtime router change plus propagation event. | Editing local files on one node in a cluster. |\n\n## Related developer guides\n\n| Topic | When to use it |\n| --- | --- |\n| `API Request Lifecycle and Handler Pipeline` | Explain how an accepted route is processed after Express receives the HTTP request. |\n| `Pipeline and Business Logic Orchestration` | Add or adjust ordered business behavior behind a route. |\n| `Module-to-Module Communication` | Call another module without copying its schema or bypassing its API authority. |\n| `Error Handling and Status Codes` | Define stable status codes, HTTP statuses, safe error bodies, localization metadata, and project-specific overrides. |\n\n## Operations and governance\n\n### Reading the effective API policy\n\nOpenAPI describes registered contracts; it is not a grant to execute them. Each operation's `x-nodics` metadata preserves its route `accessGroups`, literal and configured permissions, accepted token types, and `apiExposure` declaration. The exposure value remains a string category or the authored object, for example:\n\n```js\n{\n  \"x-nodics\": {\n    \"permissionConfig\": \"inventory.management.permission\",\n    \"apiExposure\": { \"category\": \"inventoryManagement\" },\n    \"authTokenTypes\": [\"service\"]\n  }\n}\n```\n\nThe existing request pipeline resolves that category against the selected runtime's `apiExposure.categories.inventoryManagement.enabled`, then the exposure default. It separately authenticates the caller and evaluates access groups, token type and permissions. Schema access, ownership, authoring stage, validation and concurrency still apply behind a generated route. An operation can therefore appear in OpenAPI and still reject a caller or be disabled for that runtime. An untagged route does not inherit another API's exposure gate.\n\nBefore changing a consumer to a different route, compare the effective method, module prefix, version, schema alias, request and response shape, exposure, permissions and business owner. A generated service can exist while its schema's `router.enabled` is false; service availability is not HTTP availability. Do not enable broad generated CRUD merely to replace a consumer adapter when the module requires a narrower domain command.\n\n### Customize and extend safely: API policy metadata\n\nAuthor policy changes in the owning module or a project-owned `src/router/routers.js` contribution and layered `config/properties.js`. For example, a project can disable the `inventoryManagement` category for one server while retaining its routes and schemas for other servers. Preserve token-type, tenant, schema and domain checks; changing frontend visibility cannot replace them. Regenerate OpenAPI from the selected composition and verify both the allowed server and the rejecting server with the intended principal type.\n\nGeneration rejects duplicate method/path declarations with conflicting exposure metadata. Correct the existing route contribution or its governed override; do not add an alias with weaker policy to make generation succeed. Run `nRouter/test/openapiContractGeneration.test.js` and the route authorization tests. Treat a source-composed contract, a contract including governed persisted overlays, and an authenticated live request as separate evidence. A stale deployed contract must be regenerated or refreshed through its existing owner.\n\nOperators need to know whether a route is missing, blocked by permission, failing in controller logic, or stale on only part of a cluster. Documentation must therefore include request path, security mode, expected status codes, error shape, logs, correlation id, tenant scope, and rollback behavior. When route changes are runtime-governed, the page must also explain which event refreshes local registries and how operators prove all nodes are aligned.\n\n| Failure mode | Symptom | Troubleshooting step |\n| --- | --- | --- |\n| Route not registered | Client receives not found. | Check module activation, route metadata, generated CRUD settings, and startup registration logs. |\n| Wrong security mode | Public route asks for a token or private route is exposed. | Inspect route `secured` state, permission config, and pre-authentication classification. |\n| Permission denied | Authenticated user cannot perform an expected action. | Verify profile groups, permission codes, tenant/enterprise scope, and Axis capability metadata. |\n| Controller mismatch | Route exists but fails before service behavior. | Confirm controller name, operation name, request mapping, and facade contract. |\n| Cluster drift | One node handles the route differently. | Compare runtime router registry checksums and propagation-event evidence across nodes. |\n\n## Common mistakes\n\n- Treating a left-navigation link as proof that an API exists.\n- Making Axis hide a button but leaving the route open.\n- Enabling anonymous access without documenting why the request is safe.\n- Exposing generated CRUD for a schema that should only be modified through lifecycle actions.\n- Forgetting tenant and enterprise context when testing APIs locally.\n- Changing runtime route behavior without propagation and rollback evidence.\n- Publishing documentation for a route without source evidence and security classification.\n\n## Verification\n\nVerification starts with the documentation page. It must include the business problem, owning capability, route metadata table, security and access rules, visual request flow, customization guidance, runtime-change behavior, common mistakes, and validation commands. The catalogue entry must include source evidence pointing to route metadata, router services, schema CRUD configuration, and related docs.\n\nImplementation verification should include router syntax checks, generated route tests, authorization denial tests, profile permission resolution tests, request-context tests, controller/facade tests, and runtime router override tests where applicable. Public Nexus routes must be verified separately from Axis authenticated routes. Production-like validation should prove that no draft or restricted route becomes public documentation, no secret-like example is rendered, and all cluster nodes agree on the effective route registry.\n\nSelected project builds and OpenAPI generation use the same runtime metadata resolver. A short server alias such as `platform` resolves to its declared server, such as `platformServer`, before configuration loads. The selected environment is retained. Unknown servers or environments fail; generation must never silently switch to another runtime graph. Generated contracts remain projections of that graph and do not start application resources.\n\n## Module identity and outbound API prefixes\n\nA capability may declare an existing package `prefix` that differs from its logical name. Route registration and static outbound URL construction use that same metadata. For example, Workflow remains `workflow` for ownership and credential scope while its API path uses `/process`. A connection alias selects the deployment endpoint; it does not rename the capability. Discover remote source metadata through the existing runtime roots without activating its services when the prefix is needed by a static connection.\n\nRuntime Registry lease endpoints already carry the canonical module API path. The shared nService client retains that path instead of appending a second logical module segment. Origin-only endpoints use the discovered package prefix or the unchanged logical name. Target-authority checks, scoped authentication, remote-only dispatch and request deadlines still apply.\n\n### CORS header differences\n\nKeep default allowed/exposed header lists in nRouter. Applications add only their header differences using `httpHardening.cors.allowedHeaderOverrides` and `exposedHeaderOverrides`, both empty by default. For example, `exposedHeaderOverrides: { ETag: true }` exposes that response header after the origin passes existing CORS policy. A false entry removes a baseline or previously added header. Exact origins, enablement and credentials remain separate decisions.\n\nNames match the baseline without regard to case. Keep override key spelling consistent across layers; duplicate case variants, invalid HTTP token names and non-boolean maps reject. The consumer preserves its inputs. Use explicit nConfig replacement for clearing inherited overrides and existing array semantics for a complete baseline override. The HTTP hardening test covers two unrelated browser origins, additions/removals, malformed input, default closure and origin denial.\n\n## Origins from configured frontend endpoints\n\nnRouter constructs browser origins from `httpHardening.cors.originEndpoints`, using framework `originDefaults` of HTTP and localhost for structured `{ code, port }` entries. A keyed endpoint map also accepts full origin URLs. Frontend ports can come from the selected environment profile through nConfig: `{ $config: 'profile', path: 'topology.groups.frontends', fields: ['code', 'port'] }`. This is a literal projection through the existing loader, not a new configuration layer. Host and port values must be the published frontend addresses seen by the browser, including any reverse proxy or container mapping.\n\nFor a custom project/environment, override `originDefaults.host` and `.protocol` for structured endpoints, or supply exact URL endpoint values. Replace the endpoint collection using `$config: 'replace'` when changing the deployment. `originEndpointOverrides: { store: false }` denies the named frontend and follows its changed host/port. Explicit allowed origins remain additive; every explicit or endpoint denial wins. Clear obsolete identity overrides when replacing sources. CORS activation and credential policy remain separate, closed framework defaults.\n\nOnly declared sources are used. No request header or backend-listener discovery can grant an origin. Missing profile fields, duplicate frontend codes, unknown restriction codes, malformed ports/URLs and unsafe profile data reject. Source metadata is read at configuration load; later resolved property changes are observed by the router. Profile-file edits require normal configuration reload.\n\nThe complete Local and custom-HTTPS examples, explicit-origin alternative and collection replacement guidance are in `nRouter/llm/examples/README.md#configure-browser-origins`; the exact behavior and failure contract is in `nRouter/llm/contracts/README.md#configured-browser-origin-construction`. Project owners supply deployment choices; framework maintainers own construction, validation and regression coverage. Operators validate browser access after the normal build/restart; prepared configuration checks alone do not prove deployment.\n",
      "previous": {
        "title": "Framework Startup Lifecycle",
        "route": "/docs/framework/configuration-framework-startup-lifecycle"
      },
      "next": {
        "title": "API Request Lifecycle and Handler Pipeline",
        "route": "/docs/framework/routing-api-request-lifecycle"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "router",
        "owner": "router",
        "sourcePath": "data/docs-v001/records/documentation/routerDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/routerDocumentationComponentData.js",
        "wordCount": 2303,
        "checksum": "f3d130298fbfaf81301ab1617c9394f080dc4418c2be0a439e8e0d9002293e86"
      },
      "slug": "routing-api-governance",
      "locale": "en",
      "navigationGroup": "Configuration Layers and Behavior",
      "navigationGroupCode": "configuration-layers-and-behavior",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "configuration.runtime-behavior-management",
          "owner": "config"
        },
        {
          "documentId": "runtime.governed-change",
          "owner": "config"
        },
        {
          "documentId": "security.identity-access-governance",
          "owner": "profile"
        },
        {
          "documentId": "routing.api-request-lifecycle",
          "owner": "router"
        },
        {
          "documentId": "foundation.error-handling-status-codes",
          "owner": "nCommon"
        },
        {
          "documentId": "foundation.module-to-module-communication",
          "owner": "nService"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentroutingApiRequestLifecycle",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "routing.api-request-lifecycle",
      "title": "API Request Lifecycle and Handler Pipeline",
      "route": "/docs/framework/routing-api-request-lifecycle",
      "section": "application-configuration-and-runtime-behavior-management",
      "sectionTitle": "Application Configuration and Runtime Behavior Management",
      "group": "application-configuration-and-runtime-behavior-management",
      "groupTitle": "Application Configuration and Runtime Behavior Management",
      "parentId": "application-configuration-and-runtime-behavior-management",
      "hierarchyPath": [
        "Application Configuration and Runtime Behavior Management",
        "API Request Lifecycle and Handler Pipeline"
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
      "summary": "How each Nodics HTTP request moves from Express route binding through request context, exposure checks, authentication branches, cache lookup, controller dispatch, response handlers, and safe customization.",
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
        "routing.api-governance",
        "foundation.error-handling-status-codes",
        "pipeline.business-logic-orchestration",
        "foundation.service-runtime-overrides",
        "foundation.module-to-module-communication"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "src/service/defaultRequestHandlerService.js",
        "src/pipelines/pipelines.js",
        "src/service/request/defaultRequestHandlerPipelineService.js",
        "src/service/request/defaultSecuredRequestPipelineService.js",
        "src/service/request/defaultNonSecuredRequestPipelineService.js",
        "src/service/handlers/response/defaultJsonResponseHandlerService.js",
        "test/requestPipelineResponseContract.test.js",
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
        "request lifecycle",
        "handler pipeline",
        "requestHandlerPipeline",
        "nRouter",
        "controller dispatch",
        "response handler"
      ],
      "topicKeywords": [
        "API Request Lifecycle",
        "Handler Pipeline",
        "Request Context",
        "Controller Dispatch",
        "Response Handler"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "routingApiRequestLifecycle-1-source-map",
          "level": 2
        },
        {
          "text": "End-to-end flow",
          "anchor": "routingApiRequestLifecycle-2-end-to-end-flow",
          "level": 2
        },
        {
          "text": "Main pipeline nodes",
          "anchor": "routingApiRequestLifecycle-3-main-pipeline-nodes",
          "level": 2
        },
        {
          "text": "Route metadata contract",
          "anchor": "routingApiRequestLifecycle-4-route-metadata-contract",
          "level": 2
        },
        {
          "text": "Secured, non-secured, and public branches",
          "anchor": "routingApiRequestLifecycle-5-secured-non-secured-and-public-branches",
          "level": 2
        },
        {
          "text": "Response and error handling",
          "anchor": "routingApiRequestLifecycle-6-response-and-error-handling",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "routingApiRequestLifecycle-7-customization-and-extension",
          "level": 2
        },
        {
          "text": "Developer example",
          "anchor": "routingApiRequestLifecycle-8-developer-example",
          "level": 2
        },
        {
          "text": "Operator troubleshooting",
          "anchor": "routingApiRequestLifecycle-9-operator-troubleshooting",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "routingApiRequestLifecycle-10-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "routingApiRequestLifecycle-11-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Every Nodics HTTP API request enters a governed request lifecycle before it reaches a controller. This page explains that lifecycle from the first Express route binding to the final response handler. It is written for beginners, business users, developers, operators, architects, QA owners, and AI tools that need to understand how a request is accepted, enriched, authorized, dispatched, cached, and returned without moving business logic into the wrong layer."
        },
        {
          "kind": "paragraph",
          "text": "The business value is predictable API behavior. A customer action, Axis operation, public Nexus request, integration call, or internal runtime request should be handled by the same contract every time: route metadata selects the operation, the handler pipeline builds trusted request context, authorization checks run before the controller, and response handlers return a standard success or error shape. Developers customize the pipeline only through owning modules or project layers, not by bypassing controller dispatch or adding hidden Express middleware."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "routingApiRequestLifecycle-1-source-map"
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
              "Route definitions",
              "`src/router/routers.js`",
              "Declares common generated CRUD routes, special routes, controller names, operations, security, cache, help, and exposure metadata."
            ],
            [
              "Express bridge",
              "`src/service/router/defaultRouterOperationService.js`",
              "Binds effective router definitions to Express methods and delegates calls to the request handler."
            ],
            [
              "Request entry point",
              "`src/service/defaultRequestHandlerService.js`",
              "Creates the internal request context, sets request/correlation headers, starts `requestHandlerPipeline`, and selects the response handler."
            ],
            [
              "Pipeline definition",
              "`src/pipelines/pipelines.js`",
              "Defines `requestHandlerPipeline`, `handleSecuredRequestPipeline`, and `handleNonSecuredRequestPipeline`."
            ],
            [
              "Main pipeline handlers",
              "`src/service/request/defaultRequestHandlerPipelineService.js`",
              "Handles API exposure, help, headers, body enrichment, branch selection, API cache, and controller dispatch."
            ],
            [
              "Secured branch",
              "`src/service/request/defaultSecuredRequestPipelineService.js`",
              "Validates secured calls, API key, bearer token, request data, and access."
            ],
            [
              "Non-secured branch",
              "`src/service/request/defaultNonSecuredRequestPipelineService.js`",
              "Resolves enterprise and tenant context for approved non-secured routes."
            ],
            [
              "Response handlers",
              "`src/service/handlers/response`",
              "Converts success or error pipeline output into JSON, text, or file responses."
            ],
            [
              "Contract tests",
              "`test/requestPipelineResponseContract.test.js`",
              "Proves success, controller error, missing credentials, public routes, API exposure, and response sanitization."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "End-to-end flow",
          "anchor": "routingApiRequestLifecycle-2-end-to-end-flow"
        },
        {
          "kind": "paragraph",
          "text": "For beginners, think of the handler pipeline as the controlled doorway between the web server and business behavior. Express receives a request, but Nodics does not immediately call a controller. Nodics first converts the route and HTTP request into an internal request object, then runs ordered pipeline nodes."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Caller[\"API caller\"] --> Express[\"Express route binding\"]\n  Express --> RouterDef[\"Effective router definition\"]\n  RouterDef --> RequestContext[\"DefaultRequestHandlerService creates Nodics request context\"]\n  RequestContext --> Exposure[\"validateApiExposure\"]\n  Exposure --> Help[\"helpRequest\"]\n  Help --> Headers[\"parseHeader\"]\n  Headers --> Body[\"parseBody\"]\n  Body --> Special[\"handleSpecialRequest\"]\n  Special --> Branch[\"redirectRequest\"]\n  Branch -->|secured| Secured[\"handleSecuredRequestPipeline\"]\n  Branch -->|non-secured| NonSecured[\"handleNonSecuredRequestPipeline\"]\n  Branch -->|public| Cache[\"lookupCache\"]\n  Secured --> Cache\n  NonSecured --> Cache\n  Cache --> Controller[\"handleRequest -> CONTROLLER[name][operation]\"]\n  Controller --> Response[\"Configured response handler\"]"
        },
        {
          "kind": "paragraph",
          "text": "The request context contains the selected router definition, HTTP request and response, request id, parent request id, protocol, host, original URL, method, request body, module name, security flag, and a special-route flag. The response receives `X-Request-Id` and `X-Correlation-Id`, so operators can trace one call through logs, downstream module calls, and error evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Main pipeline nodes",
          "anchor": "routingApiRequestLifecycle-3-main-pipeline-nodes"
        },
        {
          "kind": "paragraph",
          "text": "`requestHandlerPipeline` starts at `validateApiExposure` and ends at `successEnd` when the controller succeeds. Each node has one narrow job."
        },
        {
          "kind": "table",
          "headers": [
            "Node",
            "What it does",
            "Safe customization"
          ],
          "rows": [
            [
              "`validateApiExposure`",
              "Blocks route categories disabled for the current runtime, such as an API group hidden from a public node.",
              "Add or tighten exposure categories in route metadata and runtime configuration."
            ],
            [
              "`helpRequest`",
              "Returns route help metadata when the URL ends with `?help`.",
              "Extend route help content from the owning module."
            ],
            [
              "`parseHeader`",
              "Normalizes modern and legacy auth headers into `request.auth`, `request.apiKey`, `request.authToken`, and `request.entCode`.",
              "Add an enterprise-specific credential type only when the security owner accepts the contract."
            ],
            [
              "`parseBody`",
              "Placeholder hook after body parser handlers have run.",
              "Add bounded body normalization or request-context enrichment."
            ],
            [
              "`handleSpecialRequest`",
              "Runs special handler routes that use `handler` instead of `controller`.",
              "Reserve for framework-level utilities such as ping or help behavior."
            ],
            [
              "`redirectRequest`",
              "Chooses secured, non-secured, or public branch by route metadata and credentials.",
              "Change branch rules only through route/security ownership."
            ],
            [
              "`handleSecuredRequest`",
              "Runs the secured nested pipeline.",
              "Extend security checks in security-owned services or project security modules."
            ],
            [
              "`handleNonSecuredRequest`",
              "Runs enterprise and tenant resolution for approved non-secured calls.",
              "Extend enterprise/tenant lookup without exposing private routes."
            ],
            [
              "`lookupCache`",
              "Reads API cache when the route cache policy allows it.",
              "Customize cache policy, key generation, or cache provider behavior."
            ],
            [
              "`handleRequest`",
              "Calls `CONTROLLER[router.controller][router.operation]` and optionally writes cacheable success.",
              "Replace the controller operation or owning service, not the dispatcher itself."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Route metadata contract",
          "anchor": "routingApiRequestLifecycle-4-route-metadata-contract"
        },
        {
          "kind": "paragraph",
          "text": "The route definition is the request contract that the pipeline obeys. Developers should document every route with method, path, module owner, controller, operation, security mode, permission policy, exposure category, request body shape, response handler, cache behavior, and help text."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  customerProductSearch: {\n    key: '/products/search',\n    method: 'POST',\n    controller: 'DefaultProductSearchController',\n    operation: 'search',\n    moduleName: 'product',\n    secured: false,\n    publicAccess: true,\n    apiExposure: {\n      category: 'storefront'\n    },\n    responseHandler: 'jsonResponseHandler',\n    cache: {\n      enabled: true,\n      ttl: 300\n    },\n    help: {\n      summary: 'Search published storefront products.'\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "This metadata does not contain business decisions such as price calculation, inventory reservation, approval, publication, or refund policy. Those belong in services, pipelines, workflows, and owning module validation. The route only declares how the API is exposed and where the request should be handed off."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Secured, non-secured, and public branches",
          "anchor": "routingApiRequestLifecycle-5-secured-non-secured-and-public-branches"
        },
        {
          "kind": "paragraph",
          "text": "The request pipeline distinguishes three cases:"
        },
        {
          "kind": "table",
          "headers": [
            "Branch",
            "When used",
            "Required context"
          ],
          "rows": [
            [
              "Secured",
              "`router.secured` is true and the route is not explicitly public.",
              "API key or bearer token, valid request data, resolved access policy, tenant, and enterprise context."
            ],
            [
              "Non-secured",
              "Route is configured as non-secured but still needs enterprise and tenant context.",
              "Enterprise code and valid tenant resolution."
            ],
            [
              "Public",
              "Route is an explicit public probe, public access route, or OpenAPI contract route.",
              "No secret credential is required, but exposure policy and optional tenant context still apply."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Public does not mean unmanaged. Public routes still use route metadata, exposure categories, response handlers, bounded payloads, cache rules, and standard errors. Non-secured routes must never be used as a shortcut for private data. A business user may see a friendly action in Nexus or Axis, but the backend route metadata remains the authority for whether the request is allowed."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Response and error handling",
          "anchor": "routingApiRequestLifecycle-6-response-and-error-handling"
        },
        {
          "kind": "paragraph",
          "text": "The request handler chooses the configured response handler before the pipeline runs. A JSON route normally uses `DefaultJsonResponseHandlerService`; plain text and file download routes use dedicated handlers. A controller success becomes the response payload. A controller error, authorization failure, disabled exposure category, broken pipeline, or cache failure flows through the same error path."
        },
        {
          "kind": "paragraph",
          "text": "The important rule for developers is low disclosure. Public API responses must not leak internal pipeline contexts, service stacks, router metadata, or raw implementation details. The contract test verifies that internal pipeline contexts are not returned in public JSON errors. Operators should still be able to trace the request through logs using request id, correlation id, route, module, tenant, and sanitized error code."
        },
        {
          "kind": "paragraph",
          "text": "Use `Error Handling and Status Codes` when defining the actual error code, HTTP status, public message, localization metadata, and project override. This request-lifecycle page explains where the error is caught; the error guide explains the payload contract that must be returned to callers."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "routingApiRequestLifecycle-7-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Developers should customize the request lifecycle at the smallest responsible point."
        },
        {
          "kind": "table",
          "headers": [
            "Need",
            "Recommended extension",
            "Avoid"
          ],
          "rows": [
            [
              "Add a new API",
              "Add route metadata in the owning module and implement controller/facade/service behavior.",
              "Registering a frontend-only URL or raw Express handler outside the module graph."
            ],
            [
              "Add request validation before controller handoff",
              "Add a pipeline node or secured-branch validation in the owning module.",
              "Putting reusable validation in every controller."
            ],
            [
              "Add tracing or correlation metadata",
              "Extend `DefaultRequestHandlerService` or a pipeline node in a project layer.",
              "Mutating global HTTP state in unrelated middleware."
            ],
            [
              "Add tenant-specific header normalization",
              "Override `normalizeAuthHeaders` or `parseHeader` in a security-approved project module.",
              "Accepting unbounded custom headers in controllers."
            ],
            [
              "Change response shape",
              "Add or select a response handler with a stable route contract.",
              "Returning arbitrary controller payloads that bypass standard errors."
            ],
            [
              "Cache a safe API",
              "Configure route cache and cache policy.",
              "Caching private or mutation responses without policy evidence."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "A project module may override a pipeline definition in a later module layer, but it must preserve route ownership, security, response shape, and test coverage. If the change affects authorization, tenant resolution, or public data visibility, treat it as a security and production behavior change."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer example",
          "anchor": "routingApiRequestLifecycle-8-developer-example"
        },
        {
          "kind": "paragraph",
          "text": "Suppose a customer project needs to require a storefront channel header before public product search. The correct shape is a small pipeline node and a route contract update."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  requestHandlerPipeline: {\n    nodes: {\n      validateStorefrontChannel: {\n        type: 'function',\n        handler: 'CustomerStorefrontRequestPipelineService.validateChannel',\n        success: 'lookupCache'\n      }\n    }\n  }\n};"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  validateChannel: function (request, response, process) {\n    const channel = request.httpRequest.get('x-storefront-channel');\n    if (!channel || !['web', 'mobile'].includes(channel)) {\n      process.error(request, response, new CLASSES.NodicsError('ERR_REQ_00010'));\n      return;\n    }\n    request.channel = channel;\n    process.nextSuccess(request, response);\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The project must also adjust the effective success transition so the node is actually used, add route help metadata explaining the header, and test valid, missing, invalid, and unauthorized requests. The product controller should receive a normalized `request.channel`; it should not parse the raw HTTP header again."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator troubleshooting",
          "anchor": "routingApiRequestLifecycle-9-operator-troubleshooting"
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Likely layer",
            "First check"
          ],
          "rows": [
            [
              "`404` or route not found",
              "Router registration",
              "Confirm the module is active and the route exists in effective router metadata."
            ],
            [
              "`401` before controller logs",
              "`parseHeader` or secured branch",
              "Check `Authorization`, `x-api-key`, `x-enterprise-code`, route `secured`, and public flags."
            ],
            [
              "`403` for a previously visible API",
              "API exposure or access check",
              "Inspect `apiExposure`, permission config, profile groups, and runtime category enablement."
            ],
            [
              "Controller did not run",
              "Branch, special route, or cache",
              "Check pipeline branch, cache hit evidence, and controller name/operation spelling."
            ],
            [
              "Different nodes behave differently",
              "Runtime route or pipeline drift",
              "Compare active modules, persisted runtime records, checksums, and propagation events."
            ],
            [
              "Raw technical error leaks to caller",
              "Response handler or error mapping",
              "Check response handler, status definitions, and sanitized `NodicsError` mapping."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "routingApiRequestLifecycle-10-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Adding business logic to the request handler pipeline when it belongs in the domain pipeline, workflow, service, or validator.",
            "Parsing credentials in controllers instead of relying on normalized request auth and secured pipeline checks.",
            "Treating `secured: false` as a public-data guarantee.",
            "Exposing a route in Swagger without proving runtime API exposure and permission policy.",
            "Copying generated CRUD routes into a project module instead of changing the schema-owned route configuration.",
            "Returning raw service or pipeline errors directly to public callers.",
            "Editing framework `nRouter` source for a customer-specific request rule that belongs in a later project module."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "routingApiRequestLifecycle-11-verification"
        },
        {
          "kind": "paragraph",
          "text": "Request lifecycle changes require focused tests before wider runtime testing. At minimum, verify route registration, successful secured request, successful non-secured request, public request, missing credentials, disabled exposure category, controller success, controller error, response handler output, request/correlation headers, cache hit/miss behavior, and sanitized error payloads. Existing evidence starts with `nRouter/test/requestPipelineResponseContract.test.js`, `nRouter/test/routeActionAuthorization.test.js`, `nRouter/test/openapiContractGeneration.test.js`, and any controller or facade contract tests owned by the changed module."
        },
        {
          "kind": "paragraph",
          "text": "After changing documentation, maintain canonical CMS data and validate the documentation pack:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "npm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs run validate"
        },
        {
          "kind": "paragraph",
          "text": "For production-like evidence, start a fresh local runtime, call the affected API with valid and invalid credentials, confirm the expected response shape, check logs by request id, and confirm Axis or Nexus does not invent a parallel route authority."
        }
      ],
      "searchText": "API Request Lifecycle and Handler Pipeline How each Nodics HTTP request moves from Express route binding through request context, exposure checks, authentication branches, cache lookup, controller dispatch, response handlers, and safe customization. # API Request Lifecycle and Handler Pipeline\n\nEvery Nodics HTTP API request enters a governed request lifecycle before it reaches a controller. This page explains that lifecycle from the first Express route binding to the final response handler. It is written for beginners, business users, developers, operators, architects, QA owners, and AI tools that need to understand how a request is accepted, enriched, authorized, dispatched, cached, and returned without moving business logic into the wrong layer.\n\nThe business value is predictable API behavior. A customer action, Axis operation, public Nexus request, integration call, or internal runtime request should be handled by the same contract every time: route metadata selects the operation, the handler pipeline builds trusted request context, authorization checks run before the controller, and response handlers return a standard success or error shape. Developers customize the pipeline only through owning modules or project layers, not by bypassing controller dispatch or adding hidden Express middleware.\n\n## Source map\n\n| Runtime area | Source location | Responsibility |\n| --- | --- | --- |\n| Route definitions | `src/router/routers.js` | Declares common generated CRUD routes, special routes, controller names, operations, security, cache, help, and exposure metadata. |\n| Express bridge | `src/service/router/defaultRouterOperationService.js` | Binds effective router definitions to Express methods and delegates calls to the request handler. |\n| Request entry point | `src/service/defaultRequestHandlerService.js` | Creates the internal request context, sets request/correlation headers, starts `requestHandlerPipeline`, and selects the response handler. |\n| Pipeline definition | `src/pipelines/pipelines.js` | Defines `requestHandlerPipeline`, `handleSecuredRequestPipeline`, and `handleNonSecuredRequestPipeline`. |\n| Main pipeline handlers | `src/service/request/defaultRequestHandlerPipelineService.js` | Handles API exposure, help, headers, body enrichment, branch selection, API cache, and controller dispatch. |\n| Secured branch | `src/service/request/defaultSecuredRequestPipelineService.js` | Validates secured calls, API key, bearer token, request data, and access. |\n| Non-secured branch | `src/service/request/defaultNonSecuredRequestPipelineService.js` | Resolves enterprise and tenant context for approved non-secured routes. |\n| Response handlers | `src/service/handlers/response` | Converts success or error pipeline output into JSON, text, or file responses. |\n| Contract tests | `test/requestPipelineResponseContract.test.js` | Proves success, controller error, missing credentials, public routes, API exposure, and response sanitization. |\n\n## End-to-end flow\n\nFor beginners, think of the handler pipeline as the controlled doorway between the web server and business behavior. Express receives a request, but Nodics does not immediately call a controller. Nodics first converts the route and HTTP request into an internal request object, then runs ordered pipeline nodes.\n\n```mermaid\nflowchart TD\n  Caller[\"API caller\"] --> Express[\"Express route binding\"]\n  Express --> RouterDef[\"Effective router definition\"]\n  RouterDef --> RequestContext[\"DefaultRequestHandlerService creates Nodics request context\"]\n  RequestContext --> Exposure[\"validateApiExposure\"]\n  Exposure --> Help[\"helpRequest\"]\n  Help --> Headers[\"parseHeader\"]\n  Headers --> Body[\"parseBody\"]\n  Body --> Special[\"handleSpecialRequest\"]\n  Special --> Branch[\"redirectRequest\"]\n  Branch -->|secured| Secured[\"handleSecuredRequestPipeline\"]\n  Branch -->|non-secured| NonSecured[\"handleNonSecuredRequestPipeline\"]\n  Branch -->|public| Cache[\"lookupCache\"]\n  Secured --> Cache\n  NonSecured --> Cache\n  Cache --> Controller[\"handleRequest -> CONTROLLER[name][operation]\"]\n  Controller --> Response[\"Configured response handler\"]\n```\n\nThe request context contains the selected router definition, HTTP request and response, request id, parent request id, protocol, host, original URL, method, request body, module name, security flag, and a special-route flag. The response receives `X-Request-Id` and `X-Correlation-Id`, so operators can trace one call through logs, downstream module calls, and error evidence.\n\n## Main pipeline nodes\n\n`requestHandlerPipeline` starts at `validateApiExposure` and ends at `successEnd` when the controller succeeds. Each node has one narrow job.\n\n| Node | What it does | Safe customization |\n| --- | --- | --- |\n| `validateApiExposure` | Blocks route categories disabled for the current runtime, such as an API group hidden from a public node. | Add or tighten exposure categories in route metadata and runtime configuration. |\n| `helpRequest` | Returns route help metadata when the URL ends with `?help`. | Extend route help content from the owning module. |\n| `parseHeader` | Normalizes modern and legacy auth headers into `request.auth`, `request.apiKey`, `request.authToken`, and `request.entCode`. | Add an enterprise-specific credential type only when the security owner accepts the contract. |\n| `parseBody` | Placeholder hook after body parser handlers have run. | Add bounded body normalization or request-context enrichment. |\n| `handleSpecialRequest` | Runs special handler routes that use `handler` instead of `controller`. | Reserve for framework-level utilities such as ping or help behavior. |\n| `redirectRequest` | Chooses secured, non-secured, or public branch by route metadata and credentials. | Change branch rules only through route/security ownership. |\n| `handleSecuredRequest` | Runs the secured nested pipeline. | Extend security checks in security-owned services or project security modules. |\n| `handleNonSecuredRequest` | Runs enterprise and tenant resolution for approved non-secured calls. | Extend enterprise/tenant lookup without exposing private routes. |\n| `lookupCache` | Reads API cache when the route cache policy allows it. | Customize cache policy, key generation, or cache provider behavior. |\n| `handleRequest` | Calls `CONTROLLER[router.controller][router.operation]` and optionally writes cacheable success. | Replace the controller operation or owning service, not the dispatcher itself. |\n\n## Route metadata contract\n\nThe route definition is the request contract that the pipeline obeys. Developers should document every route with method, path, module owner, controller, operation, security mode, permission policy, exposure category, request body shape, response handler, cache behavior, and help text.\n\n```js\nmodule.exports = {\n  customerProductSearch: {\n    key: '/products/search',\n    method: 'POST',\n    controller: 'DefaultProductSearchController',\n    operation: 'search',\n    moduleName: 'product',\n    secured: false,\n    publicAccess: true,\n    apiExposure: {\n      category: 'storefront'\n    },\n    responseHandler: 'jsonResponseHandler',\n    cache: {\n      enabled: true,\n      ttl: 300\n    },\n    help: {\n      summary: 'Search published storefront products.'\n    }\n  }\n};\n```\n\nThis metadata does not contain business decisions such as price calculation, inventory reservation, approval, publication, or refund policy. Those belong in services, pipelines, workflows, and owning module validation. The route only declares how the API is exposed and where the request should be handed off.\n\n## Secured, non-secured, and public branches\n\nThe request pipeline distinguishes three cases:\n\n| Branch | When used | Required context |\n| --- | --- | --- |\n| Secured | `router.secured` is true and the route is not explicitly public. | API key or bearer token, valid request data, resolved access policy, tenant, and enterprise context. |\n| Non-secured | Route is configured as non-secured but still needs enterprise and tenant context. | Enterprise code and valid tenant resolution. |\n| Public | Route is an explicit public probe, public access route, or OpenAPI contract route. | No secret credential is required, but exposure policy and optional tenant context still apply. |\n\nPublic does not mean unmanaged. Public routes still use route metadata, exposure categories, response handlers, bounded payloads, cache rules, and standard errors. Non-secured routes must never be used as a shortcut for private data. A business user may see a friendly action in Nexus or Axis, but the backend route metadata remains the authority for whether the request is allowed.\n\n## Response and error handling\n\nThe request handler chooses the configured response handler before the pipeline runs. A JSON route normally uses `DefaultJsonResponseHandlerService`; plain text and file download routes use dedicated handlers. A controller success becomes the response payload. A controller error, authorization failure, disabled exposure category, broken pipeline, or cache failure flows through the same error path.\n\nThe important rule for developers is low disclosure. Public API responses must not leak internal pipeline contexts, service stacks, router metadata, or raw implementation details. The contract test verifies that internal pipeline contexts are not returned in public JSON errors. Operators should still be able to trace the request through logs using request id, correlation id, route, module, tenant, and sanitized error code.\n\nUse `Error Handling and Status Codes` when defining the actual error code, HTTP status, public message, localization metadata, and project override. This request-lifecycle page explains where the error is caught; the error guide explains the payload contract that must be returned to callers.\n\n## Customization and extension\n\nDevelopers should customize the request lifecycle at the smallest responsible point.\n\n| Need | Recommended extension | Avoid |\n| --- | --- | --- |\n| Add a new API | Add route metadata in the owning module and implement controller/facade/service behavior. | Registering a frontend-only URL or raw Express handler outside the module graph. |\n| Add request validation before controller handoff | Add a pipeline node or secured-branch validation in the owning module. | Putting reusable validation in every controller. |\n| Add tracing or correlation metadata | Extend `DefaultRequestHandlerService` or a pipeline node in a project layer. | Mutating global HTTP state in unrelated middleware. |\n| Add tenant-specific header normalization | Override `normalizeAuthHeaders` or `parseHeader` in a security-approved project module. | Accepting unbounded custom headers in controllers. |\n| Change response shape | Add or select a response handler with a stable route contract. | Returning arbitrary controller payloads that bypass standard errors. |\n| Cache a safe API | Configure route cache and cache policy. | Caching private or mutation responses without policy evidence. |\n\nA project module may override a pipeline definition in a later module layer, but it must preserve route ownership, security, response shape, and test coverage. If the change affects authorization, tenant resolution, or public data visibility, treat it as a security and production behavior change.\n\n## Developer example\n\nSuppose a customer project needs to require a storefront channel header before public product search. The correct shape is a small pipeline node and a route contract update.\n\n```js\nmodule.exports = {\n  requestHandlerPipeline: {\n    nodes: {\n      validateStorefrontChannel: {\n        type: 'function',\n        handler: 'CustomerStorefrontRequestPipelineService.validateChannel',\n        success: 'lookupCache'\n      }\n    }\n  }\n};\n```\n\n```js\nmodule.exports = {\n  validateChannel: function (request, response, process) {\n    const channel = request.httpRequest.get('x-storefront-channel');\n    if (!channel || !['web', 'mobile'].includes(channel)) {\n      process.error(request, response, new CLASSES.NodicsError('ERR_REQ_00010'));\n      return;\n    }\n    request.channel = channel;\n    process.nextSuccess(request, response);\n  }\n};\n```\n\nThe project must also adjust the effective success transition so the node is actually used, add route help metadata explaining the header, and test valid, missing, invalid, and unauthorized requests. The product controller should receive a normalized `request.channel`; it should not parse the raw HTTP header again.\n\n## Operator troubleshooting\n\n| Symptom | Likely layer | First check |\n| --- | --- | --- |\n| `404` or route not found | Router registration | Confirm the module is active and the route exists in effective router metadata. |\n| `401` before controller logs | `parseHeader` or secured branch | Check `Authorization`, `x-api-key`, `x-enterprise-code`, route `secured`, and public flags. |\n| `403` for a previously visible API | API exposure or access check | Inspect `apiExposure`, permission config, profile groups, and runtime category enablement. |\n| Controller did not run | Branch, special route, or cache | Check pipeline branch, cache hit evidence, and controller name/operation spelling. |\n| Different nodes behave differently | Runtime route or pipeline drift | Compare active modules, persisted runtime records, checksums, and propagation events. |\n| Raw technical error leaks to caller | Response handler or error mapping | Check response handler, status definitions, and sanitized `NodicsError` mapping. |\n\n## Common mistakes\n\n- Adding business logic to the request handler pipeline when it belongs in the domain pipeline, workflow, service, or validator.\n- Parsing credentials in controllers instead of relying on normalized request auth and secured pipeline checks.\n- Treating `secured: false` as a public-data guarantee.\n- Exposing a route in Swagger without proving runtime API exposure and permission policy.\n- Copying generated CRUD routes into a project module instead of changing the schema-owned route configuration.\n- Returning raw service or pipeline errors directly to public callers.\n- Editing framework `nRouter` source for a customer-specific request rule that belongs in a later project module.\n\n## Verification\n\nRequest lifecycle changes require focused tests before wider runtime testing. At minimum, verify route registration, successful secured request, successful non-secured request, public request, missing credentials, disabled exposure category, controller success, controller error, response handler output, request/correlation headers, cache hit/miss behavior, and sanitized error payloads. Existing evidence starts with `nRouter/test/requestPipelineResponseContract.test.js`, `nRouter/test/routeActionAuthorization.test.js`, `nRouter/test/openapiContractGeneration.test.js`, and any controller or facade contract tests owned by the changed module.\n\nAfter changing documentation, maintain canonical CMS data and validate the documentation pack:\n\n```bash\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs run docs:check\nnpm --prefix nodics.docs run validate\n```\n\nFor production-like evidence, start a fresh local runtime, call the affected API with valid and invalid credentials, confirm the expected response shape, check logs by request id, and confirm Axis or Nexus does not invent a parallel route authority.\n",
      "previous": {
        "title": "Routing and API Governance",
        "route": "/docs/framework/routing-api-governance"
      },
      "next": {
        "title": "Error Handling and Status Codes",
        "route": "/docs/framework/foundation-error-handling-status-codes"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "router",
        "owner": "router",
        "sourcePath": "data/docs-v001/records/documentation/routerDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/routerDocumentationComponentData.js",
        "wordCount": 1833,
        "checksum": "8a7476061601fc9f8c18c0d79f9cd6a7c80c50a308b04116d36c2a130190c49e"
      },
      "slug": "api-request-lifecycle-handler-pipeline",
      "locale": "en",
      "navigationGroup": "Configuration Layers and Behavior",
      "navigationGroupCode": "configuration-layers-and-behavior",
      "navigationGroupOrder": 10,
      "navigationOrder": 30,
      "references": [
        {
          "documentId": "routing.api-governance",
          "owner": "router"
        },
        {
          "documentId": "foundation.error-handling-status-codes",
          "owner": "nCommon"
        },
        {
          "documentId": "pipeline.business-logic-orchestration",
          "owner": "pipeline"
        },
        {
          "documentId": "foundation.service-runtime-overrides",
          "owner": "nService"
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
