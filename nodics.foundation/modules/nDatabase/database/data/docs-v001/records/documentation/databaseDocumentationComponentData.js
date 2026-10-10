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
    "code": "nodicsDocsComponentschemaDataModelingManagement",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "schema.data-modeling-management",
      "title": "Data Modeling and Schema Management",
      "route": "/docs/framework/schema-data-modeling-management",
      "section": "data-modeling-and-schema-management",
      "sectionTitle": "Data Modeling and Schema Management",
      "group": "data-modeling-and-schema-management",
      "groupTitle": "Data Modeling and Schema Management",
      "parentId": "data-modeling-and-schema-management",
      "hierarchyPath": [
        "Data Modeling and Schema Management",
        "Data Modeling and Schema Management"
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
      "summary": "How schemas define model behavior, generated services, API contracts, validation, and project-layer property extension.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.9",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "persistence.provider-data-access-layer",
        "framework.customization-guide",
        "axis.business-customization"
      ],
      "sourceEvidence": [
        "../../../../nodics.docs/data/manifest.json",
        "../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "data-modeling-and-schema-management",
        "schema-and-model-extension",
        "data-modeling-and-schema-management"
      ],
      "topicKeywords": [
        "Data Modeling and Schema Management",
        "Schema and Model Extension",
        "Data Modeling and Schema Management"
      ],
      "headings": [
        {
          "text": "Shared schema metadata for every API consumer",
          "anchor": "schemaDataModelingManagement-1-shared-schema-metadata-for-every-api-consumer",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "schemaDataModelingManagement-2-customize-and-extend-safely",
          "level": 3
        },
        {
          "text": "Failure, compatibility and operational rollout",
          "anchor": "schemaDataModelingManagement-3-failure-compatibility-and-operational-rollout",
          "level": 3
        },
        {
          "text": "Validation and remaining route migration",
          "anchor": "schemaDataModelingManagement-4-validation-and-remaining-route-migration",
          "level": 3
        },
        {
          "text": "Generated create, update and delete contracts",
          "anchor": "schemaDataModelingManagement-5-generated-create-update-and-delete-contracts",
          "level": 2
        },
        {
          "text": "Compatibility, errors and retries",
          "anchor": "schemaDataModelingManagement-6-compatibility-errors-and-retries",
          "level": 3
        },
        {
          "text": "Canonical schema discovery",
          "anchor": "schemaDataModelingManagement-7-canonical-schema-discovery",
          "level": 3
        },
        {
          "text": "Selective module APIs and route-driven clients",
          "anchor": "schemaDataModelingManagement-8-selective-module-apis-and-route-driven-clients",
          "level": 3
        },
        {
          "text": "Domain setup and confirmation",
          "anchor": "schemaDataModelingManagement-9-domain-setup-and-confirmation",
          "level": 3
        },
        {
          "text": "Rollout and verification",
          "anchor": "schemaDataModelingManagement-10-rollout-and-verification",
          "level": 3
        },
        {
          "text": "Publication-aware Generic Authoring",
          "anchor": "schemaDataModelingManagement-11-publication-aware-generic-authoring",
          "level": 2
        },
        {
          "text": "Customize and Extend Safely",
          "anchor": "schemaDataModelingManagement-12-customize-and-extend-safely",
          "level": 3
        },
        {
          "text": "Installed Version Migration",
          "anchor": "schemaDataModelingManagement-13-installed-version-migration",
          "level": 2
        },
        {
          "text": "Failure And Recovery",
          "anchor": "schemaDataModelingManagement-14-failure-and-recovery",
          "level": 3
        },
        {
          "text": "Customize And Extend Safely",
          "anchor": "schemaDataModelingManagement-15-customize-and-extend-safely",
          "level": 3
        },
        {
          "text": "Technical revisions without manual arithmetic",
          "anchor": "schemaDataModelingManagement-16-technical-revisions-without-manual-arithmetic",
          "level": 2
        },
        {
          "text": "Developer service example",
          "anchor": "schemaDataModelingManagement-17-developer-service-example",
          "level": 3
        },
        {
          "text": "Conflict and recovery behavior",
          "anchor": "schemaDataModelingManagement-18-conflict-and-recovery-behavior",
          "level": 3
        },
        {
          "text": "Customize and extend safely",
          "anchor": "schemaDataModelingManagement-19-customize-and-extend-safely",
          "level": 3
        },
        {
          "text": "Business context",
          "anchor": "schemaDataModelingManagement-20-business-context",
          "level": 2
        },
        {
          "text": "Journey and ownership",
          "anchor": "schemaDataModelingManagement-21-journey-and-ownership",
          "level": 2
        },
        {
          "text": "Data and configuration detail",
          "anchor": "schemaDataModelingManagement-22-data-and-configuration-detail",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "schemaDataModelingManagement-23-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "schemaDataModelingManagement-24-operations-and-governance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "schemaDataModelingManagement-25-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "schemaDataModelingManagement-26-verification",
          "level": 2
        },
        {
          "text": "Governed local maintenance",
          "anchor": "schemaDataModelingManagement-27-governed-local-maintenance",
          "level": 3
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Shared schema metadata for every API consumer",
          "anchor": "schemaDataModelingManagement-1-shared-schema-metadata-for-every-api-consumer"
        },
        {
          "kind": "paragraph",
          "text": "A module owns its data and APIs. Axis, exports, Copilot and another application consume the same capability contracts. Foundation's existing `nDatabase` Schema Utility service describes the effective schema; Safe Query translates bounded search; generated controllers, facades and services retain the normal persistence pipeline. No Workbench service, parallel registry or extra architectural layer is required."
        },
        {
          "kind": "paragraph",
          "text": "For an operator, this means a field added through an authorized schema extension appears consistently in discovery, forms and search. It does not grant access to that field or authorize a business transition. Schema access, property rules, tenant/record ownership, publication and concurrency remain backend decisions."
        },
        {
          "kind": "table",
          "headers": [
            "Capability",
            "Canonical interface relative to the module endpoint",
            "Owner"
          ],
          "rows": [
            [
              "Schema collection",
              "`GET /schemas`",
              "Schema Utility `listSchemas`"
            ],
            [
              "Schema detail",
              "`GET /schemas/:schema`",
              "Schema Utility `getSchema`"
            ],
            [
              "Resource capabilities",
              "`GET /<schema>/capabilities`",
              "Generated transport to the same Utility owner"
            ],
            [
              "Bounded search",
              "`POST /<schema>/safe-search`",
              "Safe Query and generated read"
            ],
            [
              "Create",
              "`PUT /<schema>` with a raw model",
              "Generated save pipeline"
            ],
            [
              "Update",
              "`PATCH /<schema>` with query/model/options",
              "Generated update pipeline"
            ],
            [
              "Delete impact",
              "`POST /<schema>/delete-impact` with an identity",
              "Utility and Reference Integrity"
            ],
            [
              "Delete",
              "`DELETE /<schema>` with a query",
              "Generated remove pipeline"
            ],
            [
              "Explicit bounded bulk",
              "`POST /<schema>/bulk`",
              "Utility and generated remove"
            ],
            [
              "Enterprise setup",
              "`POST /enterprises` in Profile",
              "Enterprise Management"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize and extend safely",
          "anchor": "schemaDataModelingManagement-2-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Declare fields in the owning schema through the existing module hierarchy. Use its `backoffice` metadata for client-safe fields, forms, relationships and permitted operations. For example:"
        },
        {
          "kind": "code",
          "language": "javascript",
          "text": "backoffice: {\n    excludedFields: ['internalNotes'],\n    form: {\n        sections: {\n            businessDetails: { label: 'Business details', fields: ['name', 'customerReference'] }\n        }\n    }\n}"
        },
        {
          "kind": "paragraph",
          "text": "The fields must exist in the effective schema. Preserve inherited exclusions when overriding an array. A deleted field disappears; ungrouped editable fields remain available. Form visibility cannot bypass required input or authorization. When metadata is insufficient, override the existing `DefaultSchemaUtilityService` helper through ordinary module service inheritance. Do not copy a base service, create another schema catalogue or place metadata authority in a UI."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Failure, compatibility and operational rollout",
          "anchor": "schemaDataModelingManagement-3-failure-compatibility-and-operational-rollout"
        },
        {
          "kind": "paragraph",
          "text": "The framework is unreleased. All `/schema/workbench` endpoints and their controller, facade and service are removed. The owning configuration is now `schemaApi`, with `system.schema.view` and `system.schema.manage` defaults. Current callers, configuration and bootstrap grants move together; there are no old-route aliases or second namespace defaults. Persisted grants from an earlier local database need the normal governed data update before authenticated use. This source migration does not rewrite stored records or permission documents."
        },
        {
          "kind": "paragraph",
          "text": "Unknown, inactive, excluded and inaccessible schemas fail closed. A missing owner is an error, not permission to load raw schema or another service implementation. Protected filters and unbounded searches fail before reads. Rebuild and restart affected runtimes, and verify allowed and denied identities against their actual policy. Source composition and mocked persistence checks do not establish live HTTP authentication, custom service overrides or persisted policy acceptance."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Validation and remaining route migration",
          "anchor": "schemaDataModelingManagement-4-validation-and-remaining-route-migration"
        },
        {
          "kind": "paragraph",
          "text": "Canonical schema transport migration is complete in source. Contract tests cover compiled controller/facade/service templates, active aliases, effective overrides, field filtering, original revisions, tenant/owner scope, callbacks and no-write rejections. Axis tests cover the actual client requests and persisted responses. Prepared Local/Docker runtime checks inspect API coverage, permissions and OpenAPI metadata without binding a listener. Live signed-in acceptance remains separate."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Generated create, update and delete contracts",
          "anchor": "schemaDataModelingManagement-5-generated-create-update-and-delete-contracts"
        },
        {
          "kind": "paragraph",
          "text": "Controllers map declared input instead of merging arbitrary body properties into the secured request. Authentication, tenant, enterprise, module/schema identity, transaction and trace context stay server-owned, including non-enumerable values. Unknown, protected and read-only top-level model fields are omitted; fixed schema values and trusted scope are applied. Nested validation stays with schema owners. Operator model patches such as `$set`, `$inc` and dotted paths are rejected."
        },
        {
          "kind": "paragraph",
          "text": "Selective schema APIs use one scalar primary identity for update/delete and keep the original revision when required. They cannot accept a broad operator query in place of the selected record. An explicit domain create command blocks generic create/createAll. Staged-only and read-only metadata reject writes independently of the client's form, the route's visibility or the presence of a manage grant."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"query\": { \"code\": \"record-one\", \"revision\": 4 },\n  \"model\": { \"name\": \"Updated label\" },\n  \"options\": { \"recursive\": false, \"returnModified\": true }\n}"
        },
        {
          "kind": "paragraph",
          "text": "For this update, the concurrency owner compares revision 4 and computes the next value. Missing, malformed and stale managed tokens retain the existing 428, 400 and 409 contracts. Reload and review a conflict; never automatically replace its token with a freshly fetched revision. Advanced broad-query/by-ID interfaces, when explicitly exposed by the owning schema, retain their separate contracts. Internal domain/import calls use their existing policy and persistence pipeline."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Compatibility, errors and retries",
          "anchor": "schemaDataModelingManagement-6-compatibility-errors-and-retries"
        },
        {
          "kind": "paragraph",
          "text": "Keep the generated response envelope. A create/update client must receive one persisted record with its identity and usable managed revision: a direct record, a single-record array or the generated `models` result. A count, missing identity, empty/multiple models or unusable revision is an error for record editing. `modifiedCount: 0` can be a valid no-op when one persisted record is returned. An invalid success response may follow an applied write; retain user input and inspect/reload the data before retrying. Never synthesize success from form input."
        },
        {
          "kind": "paragraph",
          "text": "Generic idempotency-key forwarding is not a durable replay ledger. Domain commands retain their existing principal-bound key, input digest and recovery rules. Selected bulk deletion is schema-opted-in, bounded and keyed, and retains every identity's required revision in the remove query. It uses Reference Integrity and the normal generated remove pipeline. The current provider contract does not support managed-counter multi-record CAS, so those schemas do not advertise bulk DELETE and reject it before dispatch. They remain editable one record at a time. The governed Local reset has its separate provider-issued maintenance authority; a caller flag or lookalike object cannot activate it."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Canonical schema discovery",
          "anchor": "schemaDataModelingManagement-7-canonical-schema-discovery"
        },
        {
          "kind": "paragraph",
          "text": "`GET /schemas` returns `{ code, data: { moduleName, schemas } }`; detail and capabilities return `{ code, data: descriptor }`. An authorized empty module returns an empty list. An unavailable detail returns the existing unavailable error. Thin controller/facade adapters pass the original secured request and the route-selected schema separately to Utility `listSchemas/getSchema`."
        },
        {
          "kind": "paragraph",
          "text": "Discovery preserves active aliases, effective extensions, safe fields, authoring, form/reference/concurrency metadata and prepared API routes. Collection/detail use `schemaApi.discoveryPermission` (default `system.schema.view`), secured `userGroup` access and exposure category `schemaApi`. Tagged resource reads use `schemaApi.readPermission`; writes use `schemaApi.writePermission`. Change grants through the existing identity owner. Metadata and exposure never grant access."
        },
        {
          "kind": "paragraph",
          "text": "Axis uses the canonical collection and detail paths, or an advertised capability route for detail. Import/export, documentation, media and other schema screens share this typed client. Missing/disabled routes and authorization errors remain visible. No fallback selects Workbench, another runtime or Online authoring. Successful connections retain their identity when another connection fails."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Selective module APIs and route-driven clients",
          "anchor": "schemaDataModelingManagement-8-selective-module-apis-and-route-driven-clients"
        },
        {
          "kind": "paragraph",
          "text": "An eligible model can opt into the existing nRouter template group without exposing broad raw-query, by-ID or unrestricted bulk-create routes:"
        },
        {
          "kind": "code",
          "language": "javascript",
          "text": "router: { enabled: true, groups: { schemaOperations: true } }"
        },
        {
          "kind": "paragraph",
          "text": "This group contains the seven resource operations above. Effective schema access and authoring determine which are usable. Product and PriceRow use this group; source writes require Staged. Editorial Online projections and publication receipts permit secured inspection while rejecting generated writes. Public Editorial delivery continues through its sanitized business APIs."
        },
        {
          "kind": "paragraph",
          "text": "`router.enabled: false` still disables generated routes. An explicit empty groups object selects none; `schemaOperations: false` removes an inherited group. Unknown groups and non-boolean entries fail configuration rather than enabling broad CRUD. Omitting `groups` preserves the schema's existing full default-group selection. Global module HTTP enablement remains independent; internal schema contributors do not acquire listeners or API hosts merely by declaring a model."
        },
        {
          "kind": "paragraph",
          "text": "`apiOperations` comes from prepared matching generated-controller routes. It is an inert projection, not another registry. Each operation declares `method`, a static relative `path`, `apiVersion` and `active`:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\"create\":{\"method\":\"PUT\",\"path\":\"/product\",\"apiVersion\":\"v0\",\"active\":true}}"
        },
        {
          "kind": "paragraph",
          "text": "Axis validates and follows this path under the selected connection. Missing optional route metadata uses the standard canonical resource path; no response triggers a second transport. Disabled declarations send no request. Ambiguous routes, unsafe paths, unsupported methods or versions fail closed. Later modules can override the existing routes; use `active: false` to disable an inherited operation instead of introducing a competing endpoint."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Domain setup and confirmation",
          "anchor": "schemaDataModelingManagement-9-domain-setup-and-confirmation"
        },
        {
          "kind": "paragraph",
          "text": "Schema `aggregateOperations` can name an existing owning controller operation; Utility resolves its actual prepared route. Service names are not executable client metadata and there is no generic aggregate dispatcher. Profile's declared enterprise setup maps to `POST /enterprises` with `{ model: { ... } }` and a valid `Idempotency-Key` header. Profile validates writable fields, keeps tenant setup server-owned, preserves references and uses its existing activation retry logic. A generic enterprise PUT cannot replace that business operation."
        },
        {
          "kind": "paragraph",
          "text": "Copilot prepares Product actions at `/products/prepare` and executes through its confirmation API. The duplicate Product execution HTTP adapter is removed. Confirmed Product/PriceRow writes use canonical module PUT resources and retain fresh policy, connection/tenant/target scope and key forwarding. They do not create an automatic transaction or durable replay guarantee."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Rollout and verification",
          "anchor": "schemaDataModelingManagement-10-rollout-and-verification"
        },
        {
          "kind": "paragraph",
          "text": "Upgrade backend source, generated output, current clients and governed grants as one coordinated change. Existing metadata extensions move to Schema Utility; application identity stays in application contributions. Keep domain workflows, original revisions, policy rejection and response errors visible. Verify default and later-layer behavior, disabled groups/routes, allowed/denied identities, Staged/Online, aliases, tenant isolation, conflict recovery and missing owners. No migration silently rewrites stored data. Generated documentation and runtime preparation evidence complement, rather than replace, authenticated live checks."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Publication-aware Generic Authoring",
          "anchor": "schemaDataModelingManagement-11-publication-aware-generic-authoring"
        },
        {
          "kind": "paragraph",
          "text": "Canonical owner: Foundation's `nDatabase` resolves generic authoring policy; `nController` checks generated HTTP mutations before request-body mapping. The owning schema declares its lifecycle in existing `backoffice` metadata. The existing server-owned `runtimeRole.publication` supplies Staged/Online context."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "backoffice: {\n    mutationPolicy: { lifecycle: 'PUBLISHABLE', publishRequired: true }\n}"
        },
        {
          "kind": "paragraph",
          "text": "This source may be authored only where the runtime publication role is STAGED. ONLINE, OPERATIONAL, unknown and missing roles do not grant authoring. Read/search remain subject to normal access checks. Workbench removes write, bulk and aggregate capabilities; generated HTTP mutations reject before persistence, including saveAll and delete-by-code/id. A body field cannot override the role."
        },
        {
          "kind": "paragraph",
          "text": "For an owner-managed projection or receipt use:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "backoffice: { mutationMode: 'READ_ONLY', operations: ['search', 'read'] }"
        },
        {
          "kind": "paragraph",
          "text": "That denies generic HTTP and Workbench mutations, not the owning publication service. nPublish/domain providers and approved import workflows retain their existing generated-service paths, authentication, lifecycle and tenant checks. This boundary does not authorize arbitrary internal writes or replace approval."
        },
        {
          "kind": "paragraph",
          "text": "CMS content, Editorial sources, and Product/Category/Variant catalogue sources declare the publication rule. Their publication evidence and derived projections declare read-only generic authoring. Store/Point of Service remain operational. Do not infer publication from a module name, technical revision or native version field. Mixed-lifecycle modules are supported intentionally."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n    A[Effective schema metadata] --> P[Shared authoring policy]\n    R[Existing runtime role] --> P\n    P --> W[Workbench descriptor and mutation checks]\n    P --> C[Generated HTTP mutation guard]\n    W --> S[Authorized source CRUD]\n    C --> S\n    D[Owning publication workflow] --> O[Online projection and activation]"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize and Extend Safely",
          "anchor": "schemaDataModelingManagement-12-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Add the fragment above to the owning custom module's `src/schemas/schemas.js`; retain normal fields, references and access groups. Use its existing environment `config/properties.js` to declare `runtimeRole: { code: 'PROJECT_STAGED', publication: 'STAGED' }`. Do not add a separate publication-schema registry or infer authority in Axis. A service override may extend `DefaultSchemaAuthoringPolicyService` but must preserve fail-closed Online/missing-role behavior and the existing writer owner."
        },
        {
          "kind": "paragraph",
          "text": "Example: promotional copy requires Staged authoring and publication, while an order in the same module remains operational. A publication receipt must be read-only in Workbench even for an administrator; changing its state manually is not publishing. Reclassifying an inherited source as operational requires removing all publication markers through schema composition and documenting a real change in ownership, not bypassing approval for convenience."
        },
        {
          "kind": "paragraph",
          "text": "Run `schemaAuthoringAuthorityContract.test.js`, `schemaWorkbenchContract.test.js`, the owning publication tests and Axis Workbench tests. Verify missing role, read-only targets, body spoofing, promise/callback errors, and no persistence on rejection. A full Published view must read active domain projections; these generic guards do not create a publication workflow or a source/Online diff UI."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Installed Version Migration",
          "anchor": "schemaDataModelingManagement-13-installed-version-migration"
        },
        {
          "kind": "paragraph",
          "text": "Converting installed ordinary records to versioned authoring is a maintenance operation, separate from moving source code, changing a technical revision, resetting a schema or publishing a release. Database owns the scoped command and orchestration; the selected database provider owns conditional record/index effects, nImport owns strict `importRun` evidence, and nTooling owns local outage inspection. Operators control downtime and reopening. Business users do not run this procedure through generic CRUD or Axis."
        },
        {
          "kind": "paragraph",
          "text": "The current native-local sequence is: stop and exclude all writers; capture and review an immutable scoped plan; durably begin/checkpoint the attempt; backfill only `versionId: 0`; create/verify version-qualified unique indexes before dropping mapped old constraints; verify every planned record/index; then separately adopt source flags and variants before reopening. No other record values, revisions or timestamps are regenerated. Batch intent acknowledgement reduces journal writes, but each record remains conditional and requires reconciliation after interruption."
        },
        {
          "kind": "paragraph",
          "text": "Planning and execution require ordinary source schemas. Do not enable `isVersionedEnabled` first and let startup reconcile installed indexes. After verified forward completion, opt in the owning schemas explicitly, include `vDatabase`, `vService` and the matching provider variant, and qualify CURRENT authoring reads where intended. Invalidate affected caches and account for every tenant/database loading that source, including separate Online installations. CURRENT reads do not activate a published release. The maintenance result always leaves `writersMayRestart: false` pending this handoff."
        },
        {
          "kind": "paragraph",
          "text": "Qualify read privacy separately from version selection:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Retain the prepared schema's `readProtection` and its existing native owner. CURRENT reads invoke the same provider read guard as ordinary reads before aggregation. Missing or denied hooks must produce no provider query.",
            "Keep the original employee/tenant request throughout selection. Choosing the newest record does not grant access to that record or its fields.",
            "Apply the native provider-result projector before returning the aggregate envelope. A changed or rejected result policy must not deliver raw rows.",
            "Test authorized, denied, missing-owner and redacted-result cases alongside latest-before-filter/count/paging tests. Private durable journals stay on their unversioned protocol and cannot use CURRENT aggregation."
          ]
        },
        {
          "kind": "paragraph",
          "text": "The MongoDB variant reuses `guardProtectedRead` and `projectReadResult`; it does not own a second permission registry. These protections also apply to native read APIs consumed by Copilot. Run the opt-in current-version MongoDB test in disposable storage and then the affected authenticated application journey."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Failure And Recovery",
          "anchor": "schemaDataModelingManagement-14-failure-and-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Missing outage evidence, source/index drift, storage failure, wrong worker or unplanned record state stops the operation. Preserve the original plan/checksum, identity and journal, and keep writers offline. Resume or interrupted-attempt rollback applies only to a RUNNING journal with verified previous-worker stop evidence. It must not reopen a terminal COMPLETED/ROLLED_BACK journal."
        },
        {
          "kind": "paragraph",
          "text": "Pre-reopen compensation of a completed migration needs a **new linked journal**, fresh outage and verification of the exact unchanged target. The parent remains COMPLETED; successful linked compensation becomes ROLLED_BACK. Database owns the command integration and rollback-direction enforcement; the journal API alone does not execute compensation. Preserve/restore the reviewed ordinary source composition without bypassing its original hash. Any subsequent authoring or unaccounted state requires separately qualified repair, not deletion of history."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize And Extend Safely",
          "anchor": "schemaDataModelingManagement-15-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Project owners select actual environment/server/tenant/schema scope through the existing command and effective configuration; generic mechanics stay in the framework. `installedVersionMigration.limits` controls bounded source/plan work; the strict journal has a separate aggregate evidence budget. A project's `modules/<owning-module>/src/schemas/schemas.js` may later select `isVersionedEnabled: true` and `versionedReadMode: 'CURRENT'` on qualified schemas. Do not edit the global base, invent a journal or copy provider operations into a customer script. Extensions cannot weaken immutable scope/checksum, durability, worker fencing, outage, conditional writes, index ordering or terminal evidence."
        },
        {
          "kind": "paragraph",
          "text": "Follow the [operator contract](../../../../nodics.foundation/modules/nDatabase/database/llm/contracts/installed-version-migration.md) and [worked local example](../../../../nodics.foundation/modules/nDatabase/database/llm/examples/installed-version-migration.md). Validate command parsing, orchestration, provider/journal contracts and outage failure cases, then retain separate installed-run and post-restart application evidence. This authored guide is not proof of a live migration, CMS documentation update, publication or production qualification."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Technical revisions without manual arithmetic",
          "anchor": "schemaDataModelingManagement-16-technical-revisions-without-manual-arithmetic"
        },
        {
          "kind": "paragraph",
          "text": "Canonical owner: `nodics.foundation`, implemented by `nDatabase/database` and the MongoDB provider. A technical edit counter detects two people changing the same record. It is not a business version, a published content version, or a data-release version. The existing effective schema declares who manages it:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "backoffice: {\n    concurrency: { field: 'revision', managed: true }\n}"
        },
        {
          "kind": "paragraph",
          "text": "This is schema metadata, not a new configuration file, registry, or importer. The first migrated framework schemas are `store.store`, `store.salesChannel`, and `store.pointOfService`. Other schemas are not automatically migrated merely because they contain a property named `revision`."
        },
        {
          "kind": "table",
          "headers": [
            "Operation",
            "Caller responsibility",
            "Framework responsibility"
          ],
          "rows": [
            [
              "Create",
              "Supply business fields and stable identity, no counter",
              "Initialize counter to 1"
            ],
            [
              "Edit",
              "Retain the original read token, send changed business fields",
              "Compare original token atomically and increment once"
            ],
            [
              "Save unchanged",
              "Retain original token",
              "Return current record without advancing counter or mutation events"
            ],
            [
              "Delete",
              "Retain original token and identity",
              "Apply access/reference checks and conditional delete"
            ],
            [
              "Import `saveAll`",
              "Author ordinary data rows without counters",
              "Read original tokens and use generated CRUD"
            ],
            [
              "Concurrent change",
              "Review newer data and resolve the user's intended edit",
              "Reject stale write; never silently overwrite"
            ]
          ]
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n    participant A as Editor A\n    participant B as Editor B\n    participant G as Generated CRUD\n    participant D as Database provider\n    A->>G: Read record\n    G-->>A: Record with revision 7\n    B->>G: Read record\n    G-->>B: Record with revision 7\n    A->>G: Edit with original token 7\n    G->>D: Atomic match identity and revision 7\n    D-->>A: Persisted record with revision 8\n    B->>G: Edit with original token 7\n    G-->>B: 409 conflict, review latest record"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Developer service example",
          "anchor": "schemaDataModelingManagement-17-developer-service-example"
        },
        {
          "kind": "paragraph",
          "text": "Use the existing generated service inside an authorized module operation. The example assumes `tenant` and `authData` come from the authenticated request:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "const response = await SERVICE.DefaultPointOfServiceService.get({\n  tenant,\n  authData,\n  query: { code: \"project-web-pos\" },\n});\nconst original = response.result[0];\nconst saved = await SERVICE.DefaultPointOfServiceService.update({\n  tenant,\n  authData,\n  query: { code: original.code, revision: original.revision ?? 0 },\n  model: { name: \"Updated web service point\" },\n  options: { returnModified: true },\n});\nconst nextEditingSnapshot = saved.result.models[0];"
        },
        {
          "kind": "paragraph",
          "text": "Point of Service uses a string name. Other schemas may use localized objects; always follow the effective field type. Never write `revision + 1` in the caller. Axis carries the original token automatically and treats the returned record as the next editing snapshot. It excludes managed counters from editable payloads."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Conflict and recovery behavior",
          "anchor": "schemaDataModelingManagement-18-conflict-and-recovery-behavior"
        },
        {
          "kind": "table",
          "headers": [
            "Response",
            "Meaning",
            "Recovery"
          ],
          "rows": [
            [
              "409 / `ERR_CONCURRENCY_00001`",
              "Record changed, disappeared, or identity raced during creation",
              "Preserve draft, read latest through the owning service, review differences, deliberately resubmit"
            ],
            [
              "428 / `ERR_CONCURRENCY_00002`",
              "Existing-record edit omitted original token",
              "Fix caller to retain its read result; do not manufacture a token"
            ],
            [
              "400 / `ERR_CONCURRENCY_00003`",
              "Invalid token, broad selector, operator patch, unsupported provider/schema",
              "Correct the contract; do not disable concurrency to suppress the error"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Legacy records with no counter use token 0 and a missing-field compare-and-set. Their first changed write creates counter 1. Existing populated counters never reset. An old token cannot succeed by supplying a newer number in the payload: the query token takes precedence. Audit timestamps alone do not count as edits."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize and extend safely",
          "anchor": "schemaDataModelingManagement-19-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Use your existing later-loaded project module's `src/schemas/schemas.js`, not a new revision configuration layer. For a project-owned non-versioned schema whose writes all use generated CRUD, declare a typed technical field and metadata:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  projectOperations: {\n    serviceDesk: {\n      definition: {\n        code: { type: \"string\", required: true, unique: true },\n        editCounter: {\n          type: \"long\",\n          required: true,\n          default: 1,\n          description:\n            \"Framework-managed counter used to detect concurrent edits.\",\n        },\n      },\n      backoffice: { concurrency: { field: \"editCounter\", managed: true } },\n    },\n  },\n};"
        },
        {
          "kind": "paragraph",
          "text": "Compose this fragment with the project's established model, access and ownership defaults. Keep a scalar unique primary identity. Audit every writer before migration: generated single-record save/update/delete supports plain field patches, not `$inc`, `$set`, dotted paths, or mass updates. Domain services already incrementing their own counters must retain that authority until deliberately migrated. `managed: false` leaves that existing behavior intact; it is not a concurrency bypass to apply to an already-managed shared schema."
        },
        {
          "kind": "paragraph",
          "text": "`versionId` and `isVersionedEnabled: true` cannot use this managed-counter path. The versioned provider and nPublish remain authoritative. A project cannot customize away access checks, tenant selection, atomic matching, original-token requirements, or genuine conflict rejection. Alternate providers must implement the same atomic `compareAndSetItem` boundary and return the persisted record."
        },
        {
          "kind": "paragraph",
          "text": "Test create, successive edits, no-op, stale/missing/malformed token, simultaneous writers, ownership denial, legacy missing counter, deletion restrictions, and project field-name overrides. Run `modelConcurrencyContract.test.js` under `nDatabase/database/test` and `mongodbManagedConcurrencyContract.test.js` under `nDatabase/mongodb/test`. In Axis, create a disposable Point of Service, edit it twice, and verify that the counter is read-only. Never delete real business data to test a revision migration."
        },
        {
          "kind": "paragraph",
          "text": "This mechanism protects one record. Nested model saves and import files can complete some writes before a later conflict; they are not transactions. Use the existing supported database transaction or owning workflow for atomic business operations. See the import documentation for retry and release boundaries."
        },
        {
          "kind": "paragraph",
          "text": "How schemas define model behavior, generated services, API contracts, validation, and project-layer property extension. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs."
        },
        {
          "kind": "paragraph",
          "text": "Customers need to add fields, validation, and domain records without bypassing generated services, route contracts, permissions, or publication behavior. Nodics uses schema metadata as the model authority. Generated controllers, services, validators, routes, and workbench screens derive from effective schema composition."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "schemaDataModelingManagement-20-business-context"
        },
        {
          "kind": "paragraph",
          "text": "For a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed."
        },
        {
          "kind": "table",
          "headers": [
            "Business question",
            "Answer for this topic"
          ],
          "rows": [
            [
              "What problem does it solve?",
              "Customers need to add fields, validation, and domain records without bypassing generated services, route contracts, permissions, or publication behavior."
            ],
            [
              "Who uses it?",
              "Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools."
            ],
            [
              "What changes can it support?",
              "Nodics uses schema metadata as the model authority. Generated controllers, services, validators, routes, and workbench screens derive from effective schema composition."
            ],
            [
              "What must be governed?",
              "Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Journey and ownership",
          "anchor": "schemaDataModelingManagement-21-journey-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Foundation schema services own schema compilation and generated artifacts. Each functional module owns its business schema definitions and allowed extension points. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]"
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
              "Business capability name",
              "Data Modeling and Schema Management",
              "Used in navigation and dashboards so readers are not exposed to raw module names first."
            ],
            [
              "Functional visibility",
              "nodics.foundation",
              "Carries exact implementation, documentation, and validation evidence."
            ],
            [
              "Technical module",
              "database",
              "Holds the relevant schema, service, router, data, or contract detail where applicable."
            ],
            [
              "Axis experience",
              "Backend-declared workspace",
              "Axis renders metadata and actions but does not become the authority."
            ],
            [
              "Public experience",
              "Online content delivery",
              "Nexus renders only records approved for public access."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Data and configuration detail",
          "anchor": "schemaDataModelingManagement-22-data-and-configuration-detail"
        },
        {
          "kind": "paragraph",
          "text": "Every topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override."
        },
        {
          "kind": "table",
          "headers": [
            "Detail area",
            "What to document",
            "Verification signal"
          ],
          "rows": [
            [
              "Model or record",
              "Type code, catalog, tenant, enterprise, state, owner, and lifecycle.",
              "Schema contract or generated model test."
            ],
            [
              "Configuration key",
              "Default value, override location, environment scope, and runtime impact.",
              "Config validation and runtime refresh evidence."
            ],
            [
              "API or event",
              "Route/event name, payload boundary, permission, idempotency, and failure mode.",
              "Route, service, event, and authorization tests."
            ],
            [
              "Publication and access",
              "Staged/Online state, access mode, roles, groups, and permissions.",
              "Content-pack validation and access-policy test."
            ]
          ]
        },
        {
          "kind": "code",
          "language": "js",
          "text": "schemaExtension: { typeCode: \"Product\", properties: { fit: { type: \"String\", localized: true } } }"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "schemaDataModelingManagement-23-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Developers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself."
        },
        {
          "kind": "table",
          "headers": [
            "Customization type",
            "Recommended path",
            "Avoid"
          ],
          "rows": [
            [
              "Business label, navigation, or content area",
              "Axis-managed content catalog item with publication workflow.",
              "Hardcoding labels or page trees in the frontend."
            ],
            [
              "Runtime setting",
              "Module configuration with validation and governed runtime propagation.",
              "Editing node-local files on each server by hand."
            ],
            [
              "Domain behavior",
              "Extension service, validator, pipeline step, or provider adapter.",
              "Forking the standard module for customer-only logic."
            ],
            [
              "Public visibility",
              "Access policy with public/authenticated/role-based state.",
              "Exposing internal or draft pages through Nexus."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and governance",
          "anchor": "schemaDataModelingManagement-24-operations-and-governance"
        },
        {
          "kind": "paragraph",
          "text": "Operators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected."
        },
        {
          "kind": "table",
          "headers": [
            "Operational concern",
            "Required documentation detail"
          ],
          "rows": [
            [
              "Security",
              "Authentication mode, permission code, role/group, tenant and enterprise isolation."
            ],
            [
              "Audit",
              "Actor, timestamp, source record, checksum, approval, route/event, and result."
            ],
            [
              "Resilience",
              "Retry, idempotency, compensation, fallback, cache invalidation, and rollback."
            ],
            [
              "Observability",
              "Logs, metrics, dashboard cards, health checks, and support evidence."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "schemaDataModelingManagement-25-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating a friendly navigation label as the technical source owner.",
            "Writing only developer details and skipping the business decision that the page supports.",
            "Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.",
            "Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.",
            "Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.",
            "Changing runtime behavior without explaining production impact, cluster propagation, and rollback.",
            "Leaving CMS documentation without source evidence, validation commands, and maturity state."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "schemaDataModelingManagement-26-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required."
        },
        {
          "kind": "paragraph",
          "text": "For implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Governed local maintenance",
          "anchor": "schemaDataModelingManagement-27-governed-local-maintenance"
        },
        {
          "kind": "paragraph",
          "text": "The governed Local reset is a separate maintenance operation. Its existing provider-issued opaque authority permits bulk removal of configured local models, including managed-counter schemas, through the generated remove pipeline. Caller-supplied flags or lookalike authority objects cannot enable this path. Ordinary generated deletes still require a scalar identity and the original revision; no client or project may disable these checks for editing."
        }
      ],
      "searchText": "Data Modeling and Schema Management How schemas define model behavior, generated services, API contracts, validation, and project-layer property extension. # Data Modeling and Schema Management\n\n## Shared schema metadata for every API consumer\n\nA module owns its data and APIs. Axis, exports, Copilot and another application consume the same capability contracts. Foundation's existing `nDatabase` Schema Utility service describes the effective schema; Safe Query translates bounded search; generated controllers, facades and services retain the normal persistence pipeline. No Workbench service, parallel registry or extra architectural layer is required.\n\nFor an operator, this means a field added through an authorized schema extension appears consistently in discovery, forms and search. It does not grant access to that field or authorize a business transition. Schema access, property rules, tenant/record ownership, publication and concurrency remain backend decisions.\n\n| Capability | Canonical interface relative to the module endpoint | Owner |\n| --- | --- | --- |\n| Schema collection | `GET /schemas` | Schema Utility `listSchemas` |\n| Schema detail | `GET /schemas/:schema` | Schema Utility `getSchema` |\n| Resource capabilities | `GET /<schema>/capabilities` | Generated transport to the same Utility owner |\n| Bounded search | `POST /<schema>/safe-search` | Safe Query and generated read |\n| Create | `PUT /<schema>` with a raw model | Generated save pipeline |\n| Update | `PATCH /<schema>` with query/model/options | Generated update pipeline |\n| Delete impact | `POST /<schema>/delete-impact` with an identity | Utility and Reference Integrity |\n| Delete | `DELETE /<schema>` with a query | Generated remove pipeline |\n| Explicit bounded bulk | `POST /<schema>/bulk` | Utility and generated remove |\n| Enterprise setup | `POST /enterprises` in Profile | Enterprise Management |\n\n### Customize and extend safely\n\nDeclare fields in the owning schema through the existing module hierarchy. Use its `backoffice` metadata for client-safe fields, forms, relationships and permitted operations. For example:\n\n```javascript\nbackoffice: {\n    excludedFields: ['internalNotes'],\n    form: {\n        sections: {\n            businessDetails: { label: 'Business details', fields: ['name', 'customerReference'] }\n        }\n    }\n}\n```\n\nThe fields must exist in the effective schema. Preserve inherited exclusions when overriding an array. A deleted field disappears; ungrouped editable fields remain available. Form visibility cannot bypass required input or authorization. When metadata is insufficient, override the existing `DefaultSchemaUtilityService` helper through ordinary module service inheritance. Do not copy a base service, create another schema catalogue or place metadata authority in a UI.\n\n### Failure, compatibility and operational rollout\n\nThe framework is unreleased. All `/schema/workbench` endpoints and their controller, facade and service are removed. The owning configuration is now `schemaApi`, with `system.schema.view` and `system.schema.manage` defaults. Current callers, configuration and bootstrap grants move together; there are no old-route aliases or second namespace defaults. Persisted grants from an earlier local database need the normal governed data update before authenticated use. This source migration does not rewrite stored records or permission documents.\n\nUnknown, inactive, excluded and inaccessible schemas fail closed. A missing owner is an error, not permission to load raw schema or another service implementation. Protected filters and unbounded searches fail before reads. Rebuild and restart affected runtimes, and verify allowed and denied identities against their actual policy. Source composition and mocked persistence checks do not establish live HTTP authentication, custom service overrides or persisted policy acceptance.\n\n### Validation and remaining route migration\n\nCanonical schema transport migration is complete in source. Contract tests cover compiled controller/facade/service templates, active aliases, effective overrides, field filtering, original revisions, tenant/owner scope, callbacks and no-write rejections. Axis tests cover the actual client requests and persisted responses. Prepared Local/Docker runtime checks inspect API coverage, permissions and OpenAPI metadata without binding a listener. Live signed-in acceptance remains separate.\n\n## Generated create, update and delete contracts\n\nControllers map declared input instead of merging arbitrary body properties into the secured request. Authentication, tenant, enterprise, module/schema identity, transaction and trace context stay server-owned, including non-enumerable values. Unknown, protected and read-only top-level model fields are omitted; fixed schema values and trusted scope are applied. Nested validation stays with schema owners. Operator model patches such as `$set`, `$inc` and dotted paths are rejected.\n\nSelective schema APIs use one scalar primary identity for update/delete and keep the original revision when required. They cannot accept a broad operator query in place of the selected record. An explicit domain create command blocks generic create/createAll. Staged-only and read-only metadata reject writes independently of the client's form, the route's visibility or the presence of a manage grant.\n\n```json\n{\n  \"query\": { \"code\": \"record-one\", \"revision\": 4 },\n  \"model\": { \"name\": \"Updated label\" },\n  \"options\": { \"recursive\": false, \"returnModified\": true }\n}\n```\n\nFor this update, the concurrency owner compares revision 4 and computes the next value. Missing, malformed and stale managed tokens retain the existing 428, 400 and 409 contracts. Reload and review a conflict; never automatically replace its token with a freshly fetched revision. Advanced broad-query/by-ID interfaces, when explicitly exposed by the owning schema, retain their separate contracts. Internal domain/import calls use their existing policy and persistence pipeline.\n\n### Compatibility, errors and retries\n\nKeep the generated response envelope. A create/update client must receive one persisted record with its identity and usable managed revision: a direct record, a single-record array or the generated `models` result. A count, missing identity, empty/multiple models or unusable revision is an error for record editing. `modifiedCount: 0` can be a valid no-op when one persisted record is returned. An invalid success response may follow an applied write; retain user input and inspect/reload the data before retrying. Never synthesize success from form input.\n\nGeneric idempotency-key forwarding is not a durable replay ledger. Domain commands retain their existing principal-bound key, input digest and recovery rules. Selected bulk deletion is schema-opted-in, bounded and keyed, and retains every identity's required revision in the remove query. It uses Reference Integrity and the normal generated remove pipeline. The current provider contract does not support managed-counter multi-record CAS, so those schemas do not advertise bulk DELETE and reject it before dispatch. They remain editable one record at a time. The governed Local reset has its separate provider-issued maintenance authority; a caller flag or lookalike object cannot activate it.\n\n### Canonical schema discovery\n\n`GET /schemas` returns `{ code, data: { moduleName, schemas } }`; detail and capabilities return `{ code, data: descriptor }`. An authorized empty module returns an empty list. An unavailable detail returns the existing unavailable error. Thin controller/facade adapters pass the original secured request and the route-selected schema separately to Utility `listSchemas/getSchema`.\n\nDiscovery preserves active aliases, effective extensions, safe fields, authoring, form/reference/concurrency metadata and prepared API routes. Collection/detail use `schemaApi.discoveryPermission` (default `system.schema.view`), secured `userGroup` access and exposure category `schemaApi`. Tagged resource reads use `schemaApi.readPermission`; writes use `schemaApi.writePermission`. Change grants through the existing identity owner. Metadata and exposure never grant access.\n\nAxis uses the canonical collection and detail paths, or an advertised capability route for detail. Import/export, documentation, media and other schema screens share this typed client. Missing/disabled routes and authorization errors remain visible. No fallback selects Workbench, another runtime or Online authoring. Successful connections retain their identity when another connection fails.\n\n### Selective module APIs and route-driven clients\n\nAn eligible model can opt into the existing nRouter template group without exposing broad raw-query, by-ID or unrestricted bulk-create routes:\n\n```javascript\nrouter: { enabled: true, groups: { schemaOperations: true } }\n```\n\nThis group contains the seven resource operations above. Effective schema access and authoring determine which are usable. Product and PriceRow use this group; source writes require Staged. Editorial Online projections and publication receipts permit secured inspection while rejecting generated writes. Public Editorial delivery continues through its sanitized business APIs.\n\n`router.enabled: false` still disables generated routes. An explicit empty groups object selects none; `schemaOperations: false` removes an inherited group. Unknown groups and non-boolean entries fail configuration rather than enabling broad CRUD. Omitting `groups` preserves the schema's existing full default-group selection. Global module HTTP enablement remains independent; internal schema contributors do not acquire listeners or API hosts merely by declaring a model.\n\n`apiOperations` comes from prepared matching generated-controller routes. It is an inert projection, not another registry. Each operation declares `method`, a static relative `path`, `apiVersion` and `active`:\n\n```json\n{\"create\":{\"method\":\"PUT\",\"path\":\"/product\",\"apiVersion\":\"v0\",\"active\":true}}\n```\n\nAxis validates and follows this path under the selected connection. Missing optional route metadata uses the standard canonical resource path; no response triggers a second transport. Disabled declarations send no request. Ambiguous routes, unsafe paths, unsupported methods or versions fail closed. Later modules can override the existing routes; use `active: false` to disable an inherited operation instead of introducing a competing endpoint.\n\n### Domain setup and confirmation\n\nSchema `aggregateOperations` can name an existing owning controller operation; Utility resolves its actual prepared route. Service names are not executable client metadata and there is no generic aggregate dispatcher. Profile's declared enterprise setup maps to `POST /enterprises` with `{ model: { ... } }` and a valid `Idempotency-Key` header. Profile validates writable fields, keeps tenant setup server-owned, preserves references and uses its existing activation retry logic. A generic enterprise PUT cannot replace that business operation.\n\nCopilot prepares Product actions at `/products/prepare` and executes through its confirmation API. The duplicate Product execution HTTP adapter is removed. Confirmed Product/PriceRow writes use canonical module PUT resources and retain fresh policy, connection/tenant/target scope and key forwarding. They do not create an automatic transaction or durable replay guarantee.\n\n### Rollout and verification\n\nUpgrade backend source, generated output, current clients and governed grants as one coordinated change. Existing metadata extensions move to Schema Utility; application identity stays in application contributions. Keep domain workflows, original revisions, policy rejection and response errors visible. Verify default and later-layer behavior, disabled groups/routes, allowed/denied identities, Staged/Online, aliases, tenant isolation, conflict recovery and missing owners. No migration silently rewrites stored data. Generated documentation and runtime preparation evidence complement, rather than replace, authenticated live checks.\n\n## Publication-aware Generic Authoring\n\nCanonical owner: Foundation's `nDatabase` resolves generic authoring policy; `nController` checks generated HTTP mutations before request-body mapping. The owning schema declares its lifecycle in existing `backoffice` metadata. The existing server-owned `runtimeRole.publication` supplies Staged/Online context.\n\n```js\nbackoffice: {\n    mutationPolicy: { lifecycle: 'PUBLISHABLE', publishRequired: true }\n}\n```\n\nThis source may be authored only where the runtime publication role is STAGED. ONLINE, OPERATIONAL, unknown and missing roles do not grant authoring. Read/search remain subject to normal access checks. Workbench removes write, bulk and aggregate capabilities; generated HTTP mutations reject before persistence, including saveAll and delete-by-code/id. A body field cannot override the role.\n\nFor an owner-managed projection or receipt use:\n\n```js\nbackoffice: { mutationMode: 'READ_ONLY', operations: ['search', 'read'] }\n```\n\nThat denies generic HTTP and Workbench mutations, not the owning publication service. nPublish/domain providers and approved import workflows retain their existing generated-service paths, authentication, lifecycle and tenant checks. This boundary does not authorize arbitrary internal writes or replace approval.\n\nCMS content, Editorial sources, and Product/Category/Variant catalogue sources declare the publication rule. Their publication evidence and derived projections declare read-only generic authoring. Store/Point of Service remain operational. Do not infer publication from a module name, technical revision or native version field. Mixed-lifecycle modules are supported intentionally.\n\n```mermaid\nflowchart LR\n    A[Effective schema metadata] --> P[Shared authoring policy]\n    R[Existing runtime role] --> P\n    P --> W[Workbench descriptor and mutation checks]\n    P --> C[Generated HTTP mutation guard]\n    W --> S[Authorized source CRUD]\n    C --> S\n    D[Owning publication workflow] --> O[Online projection and activation]\n```\n\n### Customize and Extend Safely\n\nAdd the fragment above to the owning custom module's `src/schemas/schemas.js`; retain normal fields, references and access groups. Use its existing environment `config/properties.js` to declare `runtimeRole: { code: 'PROJECT_STAGED', publication: 'STAGED' }`. Do not add a separate publication-schema registry or infer authority in Axis. A service override may extend `DefaultSchemaAuthoringPolicyService` but must preserve fail-closed Online/missing-role behavior and the existing writer owner.\n\nExample: promotional copy requires Staged authoring and publication, while an order in the same module remains operational. A publication receipt must be read-only in Workbench even for an administrator; changing its state manually is not publishing. Reclassifying an inherited source as operational requires removing all publication markers through schema composition and documenting a real change in ownership, not bypassing approval for convenience.\n\nRun `schemaAuthoringAuthorityContract.test.js`, `schemaWorkbenchContract.test.js`, the owning publication tests and Axis Workbench tests. Verify missing role, read-only targets, body spoofing, promise/callback errors, and no persistence on rejection. A full Published view must read active domain projections; these generic guards do not create a publication workflow or a source/Online diff UI.\n\n## Installed Version Migration\n\nConverting installed ordinary records to versioned authoring is a maintenance operation, separate from moving source code, changing a technical revision, resetting a schema or publishing a release. Database owns the scoped command and orchestration; the selected database provider owns conditional record/index effects, nImport owns strict `importRun` evidence, and nTooling owns local outage inspection. Operators control downtime and reopening. Business users do not run this procedure through generic CRUD or Axis.\n\nThe current native-local sequence is: stop and exclude all writers; capture and review an immutable scoped plan; durably begin/checkpoint the attempt; backfill only `versionId: 0`; create/verify version-qualified unique indexes before dropping mapped old constraints; verify every planned record/index; then separately adopt source flags and variants before reopening. No other record values, revisions or timestamps are regenerated. Batch intent acknowledgement reduces journal writes, but each record remains conditional and requires reconciliation after interruption.\n\nPlanning and execution require ordinary source schemas. Do not enable `isVersionedEnabled` first and let startup reconcile installed indexes. After verified forward completion, opt in the owning schemas explicitly, include `vDatabase`, `vService` and the matching provider variant, and qualify CURRENT authoring reads where intended. Invalidate affected caches and account for every tenant/database loading that source, including separate Online installations. CURRENT reads do not activate a published release. The maintenance result always leaves `writersMayRestart: false` pending this handoff.\n\nQualify read privacy separately from version selection:\n\n1. Retain the prepared schema's `readProtection` and its existing native owner. CURRENT reads invoke the same provider read guard as ordinary reads before aggregation. Missing or denied hooks must produce no provider query.\n2. Keep the original employee/tenant request throughout selection. Choosing the newest record does not grant access to that record or its fields.\n3. Apply the native provider-result projector before returning the aggregate envelope. A changed or rejected result policy must not deliver raw rows.\n4. Test authorized, denied, missing-owner and redacted-result cases alongside latest-before-filter/count/paging tests. Private durable journals stay on their unversioned protocol and cannot use CURRENT aggregation.\n\nThe MongoDB variant reuses `guardProtectedRead` and `projectReadResult`; it does not own a second permission registry. These protections also apply to native read APIs consumed by Copilot. Run the opt-in current-version MongoDB test in disposable storage and then the affected authenticated application journey.\n\n### Failure And Recovery\n\nMissing outage evidence, source/index drift, storage failure, wrong worker or unplanned record state stops the operation. Preserve the original plan/checksum, identity and journal, and keep writers offline. Resume or interrupted-attempt rollback applies only to a RUNNING journal with verified previous-worker stop evidence. It must not reopen a terminal COMPLETED/ROLLED_BACK journal.\n\nPre-reopen compensation of a completed migration needs a **new linked journal**, fresh outage and verification of the exact unchanged target. The parent remains COMPLETED; successful linked compensation becomes ROLLED_BACK. Database owns the command integration and rollback-direction enforcement; the journal API alone does not execute compensation. Preserve/restore the reviewed ordinary source composition without bypassing its original hash. Any subsequent authoring or unaccounted state requires separately qualified repair, not deletion of history.\n\n### Customize And Extend Safely\n\nProject owners select actual environment/server/tenant/schema scope through the existing command and effective configuration; generic mechanics stay in the framework. `installedVersionMigration.limits` controls bounded source/plan work; the strict journal has a separate aggregate evidence budget. A project's `modules/<owning-module>/src/schemas/schemas.js` may later select `isVersionedEnabled: true` and `versionedReadMode: 'CURRENT'` on qualified schemas. Do not edit the global base, invent a journal or copy provider operations into a customer script. Extensions cannot weaken immutable scope/checksum, durability, worker fencing, outage, conditional writes, index ordering or terminal evidence.\n\nFollow the [operator contract](../../../../nodics.foundation/modules/nDatabase/database/llm/contracts/installed-version-migration.md) and [worked local example](../../../../nodics.foundation/modules/nDatabase/database/llm/examples/installed-version-migration.md). Validate command parsing, orchestration, provider/journal contracts and outage failure cases, then retain separate installed-run and post-restart application evidence. This authored guide is not proof of a live migration, CMS documentation update, publication or production qualification.\n\n## Technical revisions without manual arithmetic\n\nCanonical owner: `nodics.foundation`, implemented by `nDatabase/database` and the MongoDB provider. A technical edit counter detects two people changing the same record. It is not a business version, a published content version, or a data-release version. The existing effective schema declares who manages it:\n\n```js\nbackoffice: {\n    concurrency: { field: 'revision', managed: true }\n}\n```\n\nThis is schema metadata, not a new configuration file, registry, or importer. The first migrated framework schemas are `store.store`, `store.salesChannel`, and `store.pointOfService`. Other schemas are not automatically migrated merely because they contain a property named `revision`.\n\n| Operation | Caller responsibility | Framework responsibility |\n| --- | --- | --- |\n| Create | Supply business fields and stable identity, no counter | Initialize counter to 1 |\n| Edit | Retain the original read token, send changed business fields | Compare original token atomically and increment once |\n| Save unchanged | Retain original token | Return current record without advancing counter or mutation events |\n| Delete | Retain original token and identity | Apply access/reference checks and conditional delete |\n| Import `saveAll` | Author ordinary data rows without counters | Read original tokens and use generated CRUD |\n| Concurrent change | Review newer data and resolve the user's intended edit | Reject stale write; never silently overwrite |\n\n```mermaid\nsequenceDiagram\n    participant A as Editor A\n    participant B as Editor B\n    participant G as Generated CRUD\n    participant D as Database provider\n    A->>G: Read record\n    G-->>A: Record with revision 7\n    B->>G: Read record\n    G-->>B: Record with revision 7\n    A->>G: Edit with original token 7\n    G->>D: Atomic match identity and revision 7\n    D-->>A: Persisted record with revision 8\n    B->>G: Edit with original token 7\n    G-->>B: 409 conflict, review latest record\n```\n\n### Developer service example\n\nUse the existing generated service inside an authorized module operation. The example assumes `tenant` and `authData` come from the authenticated request:\n\n```js\nconst response = await SERVICE.DefaultPointOfServiceService.get({\n  tenant,\n  authData,\n  query: { code: \"project-web-pos\" },\n});\nconst original = response.result[0];\nconst saved = await SERVICE.DefaultPointOfServiceService.update({\n  tenant,\n  authData,\n  query: { code: original.code, revision: original.revision ?? 0 },\n  model: { name: \"Updated web service point\" },\n  options: { returnModified: true },\n});\nconst nextEditingSnapshot = saved.result.models[0];\n```\n\nPoint of Service uses a string name. Other schemas may use localized objects; always follow the effective field type. Never write `revision + 1` in the caller. Axis carries the original token automatically and treats the returned record as the next editing snapshot. It excludes managed counters from editable payloads.\n\n### Conflict and recovery behavior\n\n| Response | Meaning | Recovery |\n| --- | --- | --- |\n| 409 / `ERR_CONCURRENCY_00001` | Record changed, disappeared, or identity raced during creation | Preserve draft, read latest through the owning service, review differences, deliberately resubmit |\n| 428 / `ERR_CONCURRENCY_00002` | Existing-record edit omitted original token | Fix caller to retain its read result; do not manufacture a token |\n| 400 / `ERR_CONCURRENCY_00003` | Invalid token, broad selector, operator patch, unsupported provider/schema | Correct the contract; do not disable concurrency to suppress the error |\n\nLegacy records with no counter use token 0 and a missing-field compare-and-set. Their first changed write creates counter 1. Existing populated counters never reset. An old token cannot succeed by supplying a newer number in the payload: the query token takes precedence. Audit timestamps alone do not count as edits.\n\n### Customize and extend safely\n\nUse your existing later-loaded project module's `src/schemas/schemas.js`, not a new revision configuration layer. For a project-owned non-versioned schema whose writes all use generated CRUD, declare a typed technical field and metadata:\n\n```js\nmodule.exports = {\n  projectOperations: {\n    serviceDesk: {\n      definition: {\n        code: { type: \"string\", required: true, unique: true },\n        editCounter: {\n          type: \"long\",\n          required: true,\n          default: 1,\n          description:\n            \"Framework-managed counter used to detect concurrent edits.\",\n        },\n      },\n      backoffice: { concurrency: { field: \"editCounter\", managed: true } },\n    },\n  },\n};\n```\n\nCompose this fragment with the project's established model, access and ownership defaults. Keep a scalar unique primary identity. Audit every writer before migration: generated single-record save/update/delete supports plain field patches, not `$inc`, `$set`, dotted paths, or mass updates. Domain services already incrementing their own counters must retain that authority until deliberately migrated. `managed: false` leaves that existing behavior intact; it is not a concurrency bypass to apply to an already-managed shared schema.\n\n`versionId` and `isVersionedEnabled: true` cannot use this managed-counter path. The versioned provider and nPublish remain authoritative. A project cannot customize away access checks, tenant selection, atomic matching, original-token requirements, or genuine conflict rejection. Alternate providers must implement the same atomic `compareAndSetItem` boundary and return the persisted record.\n\nTest create, successive edits, no-op, stale/missing/malformed token, simultaneous writers, ownership denial, legacy missing counter, deletion restrictions, and project field-name overrides. Run `modelConcurrencyContract.test.js` under `nDatabase/database/test` and `mongodbManagedConcurrencyContract.test.js` under `nDatabase/mongodb/test`. In Axis, create a disposable Point of Service, edit it twice, and verify that the counter is read-only. Never delete real business data to test a revision migration.\n\nThis mechanism protects one record. Nested model saves and import files can complete some writes before a later conflict; they are not transactions. Use the existing supported database transaction or owning workflow for atomic business operations. See the import documentation for retry and release boundaries.\n\nHow schemas define model behavior, generated services, API contracts, validation, and project-layer property extension. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nCustomers need to add fields, validation, and domain records without bypassing generated services, route contracts, permissions, or publication behavior. Nodics uses schema metadata as the model authority. Generated controllers, services, validators, routes, and workbench screens derive from effective schema composition.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | Customers need to add fields, validation, and domain records without bypassing generated services, route contracts, permissions, or publication behavior. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | Nodics uses schema metadata as the model authority. Generated controllers, services, validators, routes, and workbench screens derive from effective schema composition. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nFoundation schema services own schema compilation and generated artifacts. Each functional module owns its business schema definitions and allowed extension points. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Data Modeling and Schema Management | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Functional visibility | nodics.foundation | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | database | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\nschemaExtension: { typeCode: \"Product\", properties: { fit: { type: \"String\", localized: true } } }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n\n### Governed local maintenance\n\nThe governed Local reset is a separate maintenance operation. Its existing provider-issued opaque authority permits bulk removal of configured local models, including managed-counter schemas, through the generated remove pipeline. Caller-supplied flags or lookalike authority objects cannot enable this path. Ordinary generated deletes still require a scalar identity and the original revision; no client or project may disable these checks for editing.\n",
      "previous": {
        "title": "Localization and Internationalization",
        "route": "/docs/framework/localization-internationalization"
      },
      "next": {
        "title": "Provider and Data Access Layer",
        "route": "/docs/framework/persistence-provider-data-access-layer"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "database",
        "owner": "database",
        "sourcePath": "data/docs-v001/records/documentation/databaseDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/databaseDocumentationComponentData.js",
        "wordCount": 4557,
        "checksum": "1b87c548734134dfa122036ff4f76f65124168d5e08413be26d272c478573738"
      },
      "slug": "schema-data-modeling-management",
      "locale": "en",
      "navigationGroup": "Schema and Model Extension",
      "navigationGroupCode": "schema-and-model-extension",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "persistence.provider-data-access-layer",
          "owner": "database"
        },
        {
          "documentId": "framework.customization-guide",
          "owner": "nodics.docs"
        },
        {
          "documentId": "axis.business-customization",
          "owner": "backoffice"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentpersistenceProviderDataAccessLayer",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "persistence.provider-data-access-layer",
      "title": "Provider and Data Access Layer",
      "route": "/docs/framework/persistence-provider-data-access-layer",
      "section": "database-and-persistence-management",
      "sectionTitle": "Database and Persistence Management",
      "group": "database-and-persistence-management",
      "groupTitle": "Database and Persistence Management",
      "parentId": "database-and-persistence-management",
      "hierarchyPath": [
        "Database and Persistence Management",
        "Provider and Data Access Layer"
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
      "summary": "How the Nodics data access layer uses MongoDB today while preserving provider seams for additional database providers.",
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
        "schema.data-modeling-management",
        "configuration.runtime-behavior-management",
        "foundation.overview"
      ],
      "sourceEvidence": [
        "../../../../nodics.docs/data/manifest.json",
        "../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "database-and-persistence-management",
        "provider-and-data-access-layer",
        "provider-and-data-access-layer"
      ],
      "topicKeywords": [
        "Database and Persistence Management",
        "Provider and Data Access Layer",
        "Provider and Data Access Layer"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "persistenceProviderDataAccessLayer-1-business-context",
          "level": 2
        },
        {
          "text": "Runtime model",
          "anchor": "persistenceProviderDataAccessLayer-2-runtime-model",
          "level": 2
        },
        {
          "text": "MongoDB provider detail",
          "anchor": "persistenceProviderDataAccessLayer-3-mongodb-provider-detail",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "persistenceProviderDataAccessLayer-4-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "persistenceProviderDataAccessLayer-5-operations-and-governance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "persistenceProviderDataAccessLayer-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "persistenceProviderDataAccessLayer-7-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "The provider and data access layer is the Nodics contract that lets business capabilities work with models, repositories, schemas, tenants, and databases without coupling every service to one database implementation. MongoDB is the current concrete provider. The documentation must explain both truths clearly: Nodics runs on MongoDB today, and the framework keeps provider logic behind database and model adapters so another database provider can be added through the same ownership pattern."
        },
        {
          "kind": "paragraph",
          "text": "This page is for beginners, business users, developers, operators, QA owners, architects, and AI tools. A business reader should understand which data is persisted and how persistence choices affect project delivery. A developer should understand where schemas, connections, models, indexes, validators, repositories, transactions, and provider-specific behavior belong."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "persistenceProviderDataAccessLayer-1-business-context"
        },
        {
          "kind": "paragraph",
          "text": "Enterprises need persistence that is customizable but not chaotic. A customer project may add a property to a commerce item, introduce a new operational record, change tenant database configuration, add indexes, or later certify a different database provider. Those changes should not require every API, pipeline, and business service to be rewritten."
        },
        {
          "kind": "table",
          "headers": [
            "Business need",
            "Data-access answer"
          ],
          "rows": [
            [
              "Add domain data without breaking framework modules",
              "Define schema/model ownership and let the model handler build the runtime model."
            ],
            [
              "Support tenants and enterprises",
              "Resolve database configuration per module and tenant, with default fallback where allowed."
            ],
            [
              "Keep provider change possible",
              "Place provider-specific connection, schema conversion, transactions, and index logic in adapters."
            ],
            [
              "Improve performance safely",
              "Document indexes, cache flags, query paths, and operational validation."
            ],
            [
              "Explain production behavior",
              "Show which database, collection, tenant, model, validator, and repository path is used."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime model",
          "anchor": "persistenceProviderDataAccessLayer-2-runtime-model"
        },
        {
          "kind": "paragraph",
          "text": "The database capability loads raw schema definitions, validates database configuration, creates tenant databases, builds runtime models, and delegates provider-specific work to configured handlers. `DefaultDatabaseConfigurationService` collects raw schemas and database settings. `DefaultDatabaseConnectionHandlerService` creates master and test connections, checks required connection readiness, and registers lifecycle hooks for closing database connections. `DefaultDatabaseModelHandlerService` builds models for active modules and tenants."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Schema[\"Module schema\"] --> Config[\"Database configuration\"]\n  Config --> Connection[\"Connection handler\"]\n  Connection --> Provider[\"Database provider\"]\n  Provider --> ModelHandler[\"Provider model handler\"]\n  ModelHandler --> RuntimeModel[\"Runtime model registry\"]\n  RuntimeModel --> Repository[\"Repository/service access\"]\n  Repository --> Business[\"Business capability\"]"
        },
        {
          "kind": "paragraph",
          "text": "Nodics validates that an active database module has configured options, database type, connection handler, master URI, and database name. It then merges tenant default configuration with module-specific database configuration. This lets a project centralize common tenant connection rules and only override module-level details where needed."
        },
        {
          "kind": "table",
          "headers": [
            "Layer",
            "Main responsibility",
            "Current behavior"
          ],
          "rows": [
            [
              "Schema owner",
              "Defines model properties, model flag, versioning, cache, validators, and indexes.",
              "Loaded from module schema files and governed runtime schema where applicable."
            ],
            [
              "Database configuration",
              "Resolves database type, connection handler, URI, database name, and options.",
              "Merges default tenant settings with module settings."
            ],
            [
              "Connection handler",
              "Opens and tracks database connections.",
              "Creates master connection and optional test-channel connection."
            ],
            [
              "Model handler",
              "Converts Nodics schema into provider model structure.",
              "Builds and registers tenant models under module runtime state."
            ],
            [
              "Provider adapter",
              "Implements database-specific connection, transaction, index, and validator behavior.",
              "MongoDB adapter uses `MongoClient`, collection validators, BSON mappings, and indexes."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "MongoDB provider detail",
          "anchor": "persistenceProviderDataAccessLayer-3-mongodb-provider-detail"
        },
        {
          "kind": "paragraph",
          "text": "The MongoDB provider creates connections with `MongoClient`, lists existing collections, discovers server capabilities, creates missing collections, and updates validators. Its model handler converts Nodics schema properties into MongoDB `$jsonSchema`, resolves BSON types, applies required fields, prepares default values, validates primary-key rules, and creates indexes. It rejects multiple primary keys and protects versioned schemas that do not have a primary key."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  database: {\n    default: { options: { databaseType: 'mongodb' } },\n    example: {\n      mongodb: {\n        master: { URI: 'mongodb://db.example.invalid:27017', databaseName: 'exampleOwner' }\n      }\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "This later-layer example inherits database.default.mongodb handler/options defaults. The selected adapter block is database.<module>.mongodb, not a sibling master block under generic options. CONFIG.get('database', tenant) resolves tenant-effective defaults plus module deltas; namespace isolation/binding and concrete adapter capabilities remain mandatory. It is not tenant provisioning or proof of an installed database."
        },
        {
          "kind": "paragraph",
          "text": "The provider also discovers transaction capabilities. MongoDB transactions require logical sessions and a replica-set or sharded topology. That detail must be documented for any topic that promises transactional behavior, because local single-node development and production clustered database topology may not behave the same way."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "persistenceProviderDataAccessLayer-4-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Developers should customize persistence through schemas, validators, interceptors, indexes, module database configuration, provider configuration, or repository extension. A project that adds a property to a schema must document the business meaning, validation, default value, index impact, publication or tenant impact, API exposure, and migration considerations. A project that adds a new provider must implement the provider connection handler and provider model handler rather than leaking database-specific calls into domain services."
        },
        {
          "kind": "table",
          "headers": [
            "Customization goal",
            "Recommended path",
            "Required documentation"
          ],
          "rows": [
            [
              "Add a property",
              "Project-layer schema contribution.",
              "Property meaning, type, default, validation, query/index impact, and migration risk."
            ],
            [
              "Add a new model",
              "Schema with `model: true` and owning module lifecycle.",
              "Collection/table name, tenant scope, APIs, events, import/export, and security."
            ],
            [
              "Change tenant database location",
              "Tenant/module database configuration.",
              "Active module, tenant code, default fallback, URI handling, and secret management."
            ],
            [
              "Add MongoDB index",
              "Schema index definition.",
              "Query supported, uniqueness, rollout impact, and index reconciliation test."
            ],
            [
              "Add a new database provider",
              "Provider connection and model adapters.",
              "Capability mapping, schema conversion, transactions, indexes, validators, and limitations."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and governance",
          "anchor": "persistenceProviderDataAccessLayer-5-operations-and-governance"
        },
        {
          "kind": "paragraph",
          "text": "Operators need to know what has to be available before a capability becomes ready. Database connections register runtime lifecycle and health readiness contributors. Required connections must have a master connection for every database-enabled active module and tenant. Shutdown closes provider connections through the configured provider handler."
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
              "Missing database configuration",
              "Module does not create a model registry.",
              "Check active module database settings, database type, connection handler, URI, and database name."
            ],
            [
              "Tenant not active",
              "Model access fails for a tenant.",
              "Verify enterprise and tenant activation plus default-tenant fallback rules."
            ],
            [
              "BSON type mismatch",
              "Collection validator rejects data.",
              "Compare Nodics property type with provider BSON mapping."
            ],
            [
              "Index not applied",
              "Query is slow or uniqueness is not enforced.",
              "Check schema index definitions and provider index reconciliation."
            ],
            [
              "Transaction unavailable",
              "Atomic work rejects on an unqualified topology; it must not silently downgrade.",
              "Confirm MongoDB session support and replica-set or sharded topology."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "persistenceProviderDataAccessLayer-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Calling MongoDB directly from a business service instead of using model or repository contracts.",
            "Documenting the provider as if MongoDB-specific behavior applies to every future provider.",
            "Adding schema properties without business meaning, validation, search impact, import/export behavior, and migration notes.",
            "Forgetting tenant-specific database configuration and default fallback behavior.",
            "Promising transactions without documenting provider topology requirements.",
            "Treating indexes as purely technical and skipping the business query they support.",
            "Updating schema configuration without regenerating runtime models and maintaining the canonical CMS documentation data."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "persistenceProviderDataAccessLayer-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verification must prove both provider-independent behavior and MongoDB provider behavior. Documentation validation must confirm that the page contains the business context, model and configuration tables, visual data flow, provider explanation, customization path, troubleshooting matrix, common mistakes, and validation evidence. Implementation validation should exercise database configuration merging, required connection readiness, runtime schema loading, model creation, BSON type mapping, index reconciliation, validators, transactions, and connection shutdown."
        },
        {
          "kind": "paragraph",
          "text": "Useful focused checks include database runtime configuration contract tests, model initializer pipeline tests, MongoDB BSON mapping tests, MongoDB index reconciliation tests, MongoDB transaction tests, and runtime lifecycle tests. When persistence docs change, maintain and validate the canonical CMS documentation data and run the docs quality gate so Axis and Nexus receive the same backend-owned content catalogue."
        }
      ],
      "searchText": "Provider and Data Access Layer How the Nodics data access layer uses MongoDB today while preserving provider seams for additional database providers. # Provider and Data Access Layer\n\nThe provider and data access layer is the Nodics contract that lets business capabilities work with models, repositories, schemas, tenants, and databases without coupling every service to one database implementation. MongoDB is the current concrete provider. The documentation must explain both truths clearly: Nodics runs on MongoDB today, and the framework keeps provider logic behind database and model adapters so another database provider can be added through the same ownership pattern.\n\nThis page is for beginners, business users, developers, operators, QA owners, architects, and AI tools. A business reader should understand which data is persisted and how persistence choices affect project delivery. A developer should understand where schemas, connections, models, indexes, validators, repositories, transactions, and provider-specific behavior belong.\n\n## Business context\n\nEnterprises need persistence that is customizable but not chaotic. A customer project may add a property to a commerce item, introduce a new operational record, change tenant database configuration, add indexes, or later certify a different database provider. Those changes should not require every API, pipeline, and business service to be rewritten.\n\n| Business need | Data-access answer |\n| --- | --- |\n| Add domain data without breaking framework modules | Define schema/model ownership and let the model handler build the runtime model. |\n| Support tenants and enterprises | Resolve database configuration per module and tenant, with default fallback where allowed. |\n| Keep provider change possible | Place provider-specific connection, schema conversion, transactions, and index logic in adapters. |\n| Improve performance safely | Document indexes, cache flags, query paths, and operational validation. |\n| Explain production behavior | Show which database, collection, tenant, model, validator, and repository path is used. |\n\n## Runtime model\n\nThe database capability loads raw schema definitions, validates database configuration, creates tenant databases, builds runtime models, and delegates provider-specific work to configured handlers. `DefaultDatabaseConfigurationService` collects raw schemas and database settings. `DefaultDatabaseConnectionHandlerService` creates master and test connections, checks required connection readiness, and registers lifecycle hooks for closing database connections. `DefaultDatabaseModelHandlerService` builds models for active modules and tenants.\n\n```mermaid\nflowchart LR\n  Schema[\"Module schema\"] --> Config[\"Database configuration\"]\n  Config --> Connection[\"Connection handler\"]\n  Connection --> Provider[\"Database provider\"]\n  Provider --> ModelHandler[\"Provider model handler\"]\n  ModelHandler --> RuntimeModel[\"Runtime model registry\"]\n  RuntimeModel --> Repository[\"Repository/service access\"]\n  Repository --> Business[\"Business capability\"]\n```\n\nNodics validates that an active database module has configured options, database type, connection handler, master URI, and database name. It then merges tenant default configuration with module-specific database configuration. This lets a project centralize common tenant connection rules and only override module-level details where needed.\n\n| Layer | Main responsibility | Current behavior |\n| --- | --- | --- |\n| Schema owner | Defines model properties, model flag, versioning, cache, validators, and indexes. | Loaded from module schema files and governed runtime schema where applicable. |\n| Database configuration | Resolves database type, connection handler, URI, database name, and options. | Merges default tenant settings with module settings. |\n| Connection handler | Opens and tracks database connections. | Creates master connection and optional test-channel connection. |\n| Model handler | Converts Nodics schema into provider model structure. | Builds and registers tenant models under module runtime state. |\n| Provider adapter | Implements database-specific connection, transaction, index, and validator behavior. | MongoDB adapter uses `MongoClient`, collection validators, BSON mappings, and indexes. |\n\n## MongoDB provider detail\n\nThe MongoDB provider creates connections with `MongoClient`, lists existing collections, discovers server capabilities, creates missing collections, and updates validators. Its model handler converts Nodics schema properties into MongoDB `$jsonSchema`, resolves BSON types, applies required fields, prepares default values, validates primary-key rules, and creates indexes. It rejects multiple primary keys and protects versioned schemas that do not have a primary key.\n\n```js\nmodule.exports = {\n  database: {\n    default: { options: { databaseType: 'mongodb' } },\n    example: {\n      mongodb: {\n        master: { URI: 'mongodb://db.example.invalid:27017', databaseName: 'exampleOwner' }\n      }\n    }\n  }\n};\n```\n\nThis later-layer example inherits database.default.mongodb handler/options defaults. The selected adapter block is database.<module>.mongodb, not a sibling master block under generic options. CONFIG.get('database', tenant) resolves tenant-effective defaults plus module deltas; namespace isolation/binding and concrete adapter capabilities remain mandatory. It is not tenant provisioning or proof of an installed database.\n\nThe provider also discovers transaction capabilities. MongoDB transactions require logical sessions and a replica-set or sharded topology. That detail must be documented for any topic that promises transactional behavior, because local single-node development and production clustered database topology may not behave the same way.\n\n## Customization and extension\n\nDevelopers should customize persistence through schemas, validators, interceptors, indexes, module database configuration, provider configuration, or repository extension. A project that adds a property to a schema must document the business meaning, validation, default value, index impact, publication or tenant impact, API exposure, and migration considerations. A project that adds a new provider must implement the provider connection handler and provider model handler rather than leaking database-specific calls into domain services.\n\n| Customization goal | Recommended path | Required documentation |\n| --- | --- | --- |\n| Add a property | Project-layer schema contribution. | Property meaning, type, default, validation, query/index impact, and migration risk. |\n| Add a new model | Schema with `model: true` and owning module lifecycle. | Collection/table name, tenant scope, APIs, events, import/export, and security. |\n| Change tenant database location | Tenant/module database configuration. | Active module, tenant code, default fallback, URI handling, and secret management. |\n| Add MongoDB index | Schema index definition. | Query supported, uniqueness, rollout impact, and index reconciliation test. |\n| Add a new database provider | Provider connection and model adapters. | Capability mapping, schema conversion, transactions, indexes, validators, and limitations. |\n\n## Operations and governance\n\nOperators need to know what has to be available before a capability becomes ready. Database connections register runtime lifecycle and health readiness contributors. Required connections must have a master connection for every database-enabled active module and tenant. Shutdown closes provider connections through the configured provider handler.\n\n| Failure mode | Symptom | Troubleshooting step |\n| --- | --- | --- |\n| Missing database configuration | Module does not create a model registry. | Check active module database settings, database type, connection handler, URI, and database name. |\n| Tenant not active | Model access fails for a tenant. | Verify enterprise and tenant activation plus default-tenant fallback rules. |\n| BSON type mismatch | Collection validator rejects data. | Compare Nodics property type with provider BSON mapping. |\n| Index not applied | Query is slow or uniqueness is not enforced. | Check schema index definitions and provider index reconciliation. |\n| Transaction unavailable | Atomic work rejects on an unqualified topology; it must not silently downgrade. | Confirm MongoDB session support and replica-set or sharded topology. |\n\n## Common mistakes\n\n- Calling MongoDB directly from a business service instead of using model or repository contracts.\n- Documenting the provider as if MongoDB-specific behavior applies to every future provider.\n- Adding schema properties without business meaning, validation, search impact, import/export behavior, and migration notes.\n- Forgetting tenant-specific database configuration and default fallback behavior.\n- Promising transactions without documenting provider topology requirements.\n- Treating indexes as purely technical and skipping the business query they support.\n- Updating schema configuration without regenerating runtime models and maintaining the canonical CMS documentation data.\n\n## Verification\n\nVerification must prove both provider-independent behavior and MongoDB provider behavior. Documentation validation must confirm that the page contains the business context, model and configuration tables, visual data flow, provider explanation, customization path, troubleshooting matrix, common mistakes, and validation evidence. Implementation validation should exercise database configuration merging, required connection readiness, runtime schema loading, model creation, BSON type mapping, index reconciliation, validators, transactions, and connection shutdown.\n\nUseful focused checks include database runtime configuration contract tests, model initializer pipeline tests, MongoDB BSON mapping tests, MongoDB index reconciliation tests, MongoDB transaction tests, and runtime lifecycle tests. When persistence docs change, maintain and validate the canonical CMS documentation data and run the docs quality gate so Axis and Nexus receive the same backend-owned content catalogue.\n",
      "previous": {
        "title": "Data Modeling and Schema Management",
        "route": "/docs/framework/schema-data-modeling-management"
      },
      "next": {
        "title": "Caching and Runtime State Management",
        "route": "/docs/framework/cache-runtime-state-management"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "database",
        "owner": "database",
        "sourcePath": "data/docs-v001/records/documentation/databaseDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/databaseDocumentationComponentData.js",
        "wordCount": 1202,
        "checksum": "8f359deed9539b8976fec434992d1c35328dc96139bd4d8a0bdf8841933cd41f"
      },
      "slug": "persistence-provider-data-access-layer",
      "locale": "en",
      "navigationGroup": "Provider and Data Access Layer",
      "navigationGroupCode": "provider-and-data-access-layer",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "schema.data-modeling-management",
          "owner": "database"
        },
        {
          "documentId": "configuration.runtime-behavior-management",
          "owner": "config"
        },
        {
          "documentId": "foundation.overview",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  },
  "record2": {
    "code": "nodicsDocsComponentfoundationDatabaseProviderBoundaries",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "foundation.database-provider-boundaries",
      "title": "Database Provider Boundaries",
      "route": "/docs/framework/foundation-database-provider-boundaries",
      "section": "database-and-persistence-management",
      "sectionTitle": "Database and Persistence Management",
      "group": "database-and-persistence-management",
      "groupTitle": "Database and Persistence Management",
      "parentId": "database-and-persistence-management",
      "hierarchyPath": [
        "Database and Persistence Management",
        "Database Provider Boundaries"
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
      "summary": "How MongoDB, virtual DB, Cassandra, Elasticsearch, schemas, query translation, indexes, migration, and provider validation are separated.",
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
        "persistence.provider-data-access-layer",
        "foundation.cache-provider-runbooks",
        "discovery.search-indexing"
      ],
      "sourceEvidence": [
        "../../../../nodics.docs/data/manifest.json",
        "../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../package.json",
        "package.json",
        "vDatabase/package.json",
        "../mongodb/package.json",
        "../mongodb/vMongodb/package.json",
        "../cassandradb/package.json",
        "../elasticdb/package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "database",
        "mongodb",
        "cassandra",
        "elasticsearch",
        "provider"
      ],
      "topicKeywords": [
        "Database and Persistence Management",
        "Database Provider Contracts",
        "Database Provider Boundaries"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "foundationDatabaseProviderBoundaries-1-source-map",
          "level": 2
        },
        {
          "text": "Boundary model",
          "anchor": "foundationDatabaseProviderBoundaries-2-boundary-model",
          "level": 2
        },
        {
          "text": "Contract rules",
          "anchor": "foundationDatabaseProviderBoundaries-3-contract-rules",
          "level": 2
        },
        {
          "text": "Provider comparison",
          "anchor": "foundationDatabaseProviderBoundaries-4-provider-comparison",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "foundationDatabaseProviderBoundaries-5-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "foundationDatabaseProviderBoundaries-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "foundationDatabaseProviderBoundaries-7-verification",
          "level": 2
        },
        {
          "text": "Customizing MongoDB schema keyword selection",
          "anchor": "foundationDatabaseProviderBoundaries-8-customizing-mongodb-schema-keyword-selection",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Database is the provider-neutral schema/model and tenant/module persistence owner. MongoDB has a concrete persistence adapter in this source tree. vDatabase and vMongodb add versioned persistence machinery; they are not virtual/mock databases. Cassandra and elasticdb are skeletal module boundaries here, not usable interchangeable database adapters. The schema/service owns business meaning and access even when provider mechanics differ. For beginners, read the provider-status matrix first and use the concrete MongoDB configuration example in a disposable approved environment. Verify the selected tenant, module and transaction capabilities before an owner operation. A configuration name does not install an adapter, and a successful simple read does not qualify version history, transactions, recovery or tenant isolation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "foundationDatabaseProviderBoundaries-1-source-map"
        },
        {
          "kind": "paragraph",
          "text": "A developer extends the provider contract behind the existing schema/service authority, not inside a caller's business module. Test tenant selection, generated operations, versioned reads, transaction refusal and recovery for the actual adapter. Keep the provider-status matrix honest: adding configuration for a skeletal package does not implement those capabilities."
        },
        {
          "kind": "table",
          "headers": [
            "Area",
            "Source location"
          ],
          "rows": [
            [
              "Database group",
              "`../package.json`"
            ],
            [
              "Core database contract",
              "`package.json`"
            ],
            [
              "Versioned schema machinery",
              "`vDatabase/package.json`"
            ],
            [
              "MongoDB provider",
              "`../mongodb/package.json`"
            ],
            [
              "Version-aware MongoDB",
              "`../mongodb/vMongodb/package.json`"
            ],
            [
              "Cassandra skeletal boundary",
              "`../cassandradb/package.json`"
            ],
            [
              "elasticdb skeletal boundary",
              "`../elasticdb/package.json`"
            ],
            [
              "Provider overview",
              "Canonical guide `persistence.provider-data-access-layer`"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Boundary model",
          "anchor": "foundationDatabaseProviderBoundaries-2-boundary-model"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Api[\"Authorized route/service\"] --> Schema[\"Owning schema/model contract\"]\n  Schema --> Config[\"Tenant + module database configuration\"]\n  Config --> Adapter[\"Implemented adapter + qualified capabilities\"]\n  Adapter --> Mongo[\"MongoDB persistence\"]\n  Version[\"vDatabase / vMongodb versioned machinery\"] --> Schema\n  Search[\"nSearch projections: separate owner\"] -.-> Schema"
        },
        {
          "kind": "paragraph",
          "text": "Provider portability is an extension contract, not evidence that every named package implements it. Business callers must retain schema authorization, tenant isolation and owner invariants; adding a backend requires actual connection/schema/model behavior and qualification. Search projections are not replacement authoritative database storage."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Contract rules",
          "anchor": "foundationDatabaseProviderBoundaries-3-contract-rules"
        },
        {
          "kind": "paragraph",
          "text": "DefaultDatabaseConfigurationService resolves CONFIG.get('database', tenant), merges database.default with database.<module>, selects options.databaseType, then merges generic options with the selected adapter.options. It requires an active module/tenant, concrete connectionHandler and master.URI/databaseName. The default tenant has its own effective configuration; non-default tenants also pass namespace isolation/binding checks. Do not reuse another tenant's database or infer tenant routing from a browser-supplied provider name."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  database: {\n    default: { options: { databaseType: 'mongodb' } },\n    example: {\n      options: { databaseType: 'mongodb' },\n      mongodb: {\n        master: { URI: 'mongodb://db.example.invalid:27017', databaseName: 'exampleOwner' },\n        test: { URI: 'mongodb://db.example.invalid:27017', databaseName: 'exampleOwnerTest' }\n      }\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "This illustrative deployment overlay inherits MongoDB's connection/schema/model handlers and driver options from database.default.mongodb. It is not a full tenant onboarding or credential configuration. Tenant properties supply the effective database block through nConfig; DERIVED tenants require the existing owner-persisted namespace binding, not a manual pin fabricated in source. Inspect only sanitized module/tenant/type/database identity. Never publish credential-bearing URIs."
        },
        {
          "kind": "paragraph",
          "text": "Schema validation/interceptors/services retain domain semantics. MongoDB owns driver queries, indexes, pagination and transaction mechanics. discoverCapabilities checks hello/isMaster for logical sessions and replica-set/sharded topology; executeTransaction refuses unqualified topology before opening a session. A provider label or a standalone Mongo connection does not prove multi-record atomicity. Use the existing transaction owner and declared capability, not a business-level driver/session escape hatch."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Provider comparison",
          "anchor": "foundationDatabaseProviderBoundaries-4-provider-comparison"
        },
        {
          "kind": "table",
          "headers": [
            "Module",
            "Implemented status",
            "Required boundary"
          ],
          "rows": [
            [
              "mongodb",
              "Concrete connection, schema/model handlers, indexes, validation and capability-qualified transactions.",
              "Qualify actual topology, authorization, tenant namespaces, migrations and backup/restore."
            ],
            [
              "database/vDatabase",
              "Shared abstract default.versioned schema (model/service/router disabled) and versionId initialization.",
              "Schema opts in with isVersionedEnabled:true; missing version contract rejects. It is not a test store or fallback."
            ],
            [
              "mongodb/vMongodb",
              "Version-aware Mongo model methods including current-version aggregation and new immutable versions.",
              "Uses Mongo persistence, not an in-memory simulator. CURRENT authoring reads do not select published content."
            ],
            [
              "cassandradb",
              "Skeletal: empty provider properties and no concrete connection/model service implementation in this module.",
              "Unsupported as a usable database provider until an adapter and provider qualification exist."
            ],
            [
              "elasticdb",
              "Skeletal database module, not equivalent to nSearch's Elasticsearch adapter.",
              "Unsupported database provider; nSearch search/index projections have a separate owner and contract."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "vDatabase initializes versionId only when undefined on a versioned model, preserving supplied values for validation. vMongodb implements storage/version operations; it does not authorize changing business ownership or publication state. Retain ordinary-schema behavior and qualify installed-data/index migration before enabling versioning or CURRENT reads."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "foundationDatabaseProviderBoundaries-5-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Customize effective database configuration, schema-owned validation and existing provider seams. A new database needs concrete connection, schema/model, error, index, tenant, pagination and lifecycle contracts plus honest transaction/durable persistence capabilities. Qualify ordinary and versioned writes, exact/current/history reads, concurrent conflicts, authorization denial, startup/provider failure, restart, migration and backup/restore. No Cassandra/elasticdb production runbook can be claimed from empty configuration or package existence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "foundationDatabaseProviderBoundaries-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating vDatabase/vMongodb as development stubs rather than shared/version-aware persistence machinery.",
            "Advertising Cassandra or elasticdb as supported storage without an implemented and qualified adapter.",
            "Treating a search projection as authoritative database storage.",
            "Changing databaseType without concrete handlers, tenant isolation and topology capability checks.",
            "Silently weakening validation or multi-record atomicity on provider failure."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "foundationDatabaseProviderBoundaries-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Use persistence.provider-data-access-layer for Mongo runtime, provider and operational detail. Qualify actual selected module/tenant configuration, schema/index preparation, CRUD/version behavior, transaction refusal on an unqualified topology, migrations and restore through owner APIs. Provider outage recovery must reconcile committed/uncertain writes before retry; publication rollback cannot undo data writes. The concrete schema keyword customization below remains part of the contract."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customizing MongoDB schema keyword selection",
          "anchor": "foundationDatabaseProviderBoundaries-8-customizing-mongodb-schema-keyword-selection"
        },
        {
          "kind": "paragraph",
          "text": "The effective `database.default.mongodb.options.schemaProperties` value is a keyed boolean map. For example, a project can disable one inherited keyword:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  database: { default: { mongodb: { options: {\n    schemaProperties: { pattern: false }\n  } } } }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Other inherited enabled keywords remain selected. A schema minimum of `0` or a selected boolean value of `false` is copied as declared; truthiness must not drop it. An array, null, or a non-boolean selector is rejected during model preparation. This selection chooses which declared keywords reach the provider; it does not replace domain validation or authorize relaxing tenant/security guarantees."
        }
      ],
      "searchText": "Database Provider Boundaries How MongoDB, virtual DB, Cassandra, Elasticsearch, schemas, query translation, indexes, migration, and provider validation are separated. # Database Provider Boundaries\n\nDatabase is the provider-neutral schema/model and tenant/module persistence owner. MongoDB has a concrete persistence adapter in this source tree. vDatabase and vMongodb add versioned persistence machinery; they are not virtual/mock databases. Cassandra and elasticdb are skeletal module boundaries here, not usable interchangeable database adapters. The schema/service owns business meaning and access even when provider mechanics differ. For beginners, read the provider-status matrix first and use the concrete MongoDB configuration example in a disposable approved environment. Verify the selected tenant, module and transaction capabilities before an owner operation. A configuration name does not install an adapter, and a successful simple read does not qualify version history, transactions, recovery or tenant isolation.\n\n## Source map\n\nA developer extends the provider contract behind the existing schema/service authority, not inside a caller's business module. Test tenant selection, generated operations, versioned reads, transaction refusal and recovery for the actual adapter. Keep the provider-status matrix honest: adding configuration for a skeletal package does not implement those capabilities.\n\n| Area | Source location |\n| --- | --- |\n| Database group | `../package.json` |\n| Core database contract | `package.json` |\n| Versioned schema machinery | `vDatabase/package.json` |\n| MongoDB provider | `../mongodb/package.json` |\n| Version-aware MongoDB | `../mongodb/vMongodb/package.json` |\n| Cassandra skeletal boundary | `../cassandradb/package.json` |\n| elasticdb skeletal boundary | `../elasticdb/package.json` |\n| Provider overview | Canonical guide `persistence.provider-data-access-layer` |\n\n## Boundary model\n\n```mermaid\nflowchart TD\n  Api[\"Authorized route/service\"] --> Schema[\"Owning schema/model contract\"]\n  Schema --> Config[\"Tenant + module database configuration\"]\n  Config --> Adapter[\"Implemented adapter + qualified capabilities\"]\n  Adapter --> Mongo[\"MongoDB persistence\"]\n  Version[\"vDatabase / vMongodb versioned machinery\"] --> Schema\n  Search[\"nSearch projections: separate owner\"] -.-> Schema\n```\n\nProvider portability is an extension contract, not evidence that every named package implements it. Business callers must retain schema authorization, tenant isolation and owner invariants; adding a backend requires actual connection/schema/model behavior and qualification. Search projections are not replacement authoritative database storage.\n\n## Contract rules\n\nDefaultDatabaseConfigurationService resolves CONFIG.get('database', tenant), merges database.default with database.<module>, selects options.databaseType, then merges generic options with the selected adapter.options. It requires an active module/tenant, concrete connectionHandler and master.URI/databaseName. The default tenant has its own effective configuration; non-default tenants also pass namespace isolation/binding checks. Do not reuse another tenant's database or infer tenant routing from a browser-supplied provider name.\n\n```js\nmodule.exports = {\n  database: {\n    default: { options: { databaseType: 'mongodb' } },\n    example: {\n      options: { databaseType: 'mongodb' },\n      mongodb: {\n        master: { URI: 'mongodb://db.example.invalid:27017', databaseName: 'exampleOwner' },\n        test: { URI: 'mongodb://db.example.invalid:27017', databaseName: 'exampleOwnerTest' }\n      }\n    }\n  }\n};\n```\n\nThis illustrative deployment overlay inherits MongoDB's connection/schema/model handlers and driver options from database.default.mongodb. It is not a full tenant onboarding or credential configuration. Tenant properties supply the effective database block through nConfig; DERIVED tenants require the existing owner-persisted namespace binding, not a manual pin fabricated in source. Inspect only sanitized module/tenant/type/database identity. Never publish credential-bearing URIs.\n\nSchema validation/interceptors/services retain domain semantics. MongoDB owns driver queries, indexes, pagination and transaction mechanics. discoverCapabilities checks hello/isMaster for logical sessions and replica-set/sharded topology; executeTransaction refuses unqualified topology before opening a session. A provider label or a standalone Mongo connection does not prove multi-record atomicity. Use the existing transaction owner and declared capability, not a business-level driver/session escape hatch.\n\n## Provider comparison\n\n| Module | Implemented status | Required boundary |\n| --- | --- | --- |\n| mongodb | Concrete connection, schema/model handlers, indexes, validation and capability-qualified transactions. | Qualify actual topology, authorization, tenant namespaces, migrations and backup/restore. |\n| database/vDatabase | Shared abstract default.versioned schema (model/service/router disabled) and versionId initialization. | Schema opts in with isVersionedEnabled:true; missing version contract rejects. It is not a test store or fallback. |\n| mongodb/vMongodb | Version-aware Mongo model methods including current-version aggregation and new immutable versions. | Uses Mongo persistence, not an in-memory simulator. CURRENT authoring reads do not select published content. |\n| cassandradb | Skeletal: empty provider properties and no concrete connection/model service implementation in this module. | Unsupported as a usable database provider until an adapter and provider qualification exist. |\n| elasticdb | Skeletal database module, not equivalent to nSearch's Elasticsearch adapter. | Unsupported database provider; nSearch search/index projections have a separate owner and contract. |\n\nvDatabase initializes versionId only when undefined on a versioned model, preserving supplied values for validation. vMongodb implements storage/version operations; it does not authorize changing business ownership or publication state. Retain ordinary-schema behavior and qualify installed-data/index migration before enabling versioning or CURRENT reads.\n\n## Customization and extension guidance\n\nCustomize effective database configuration, schema-owned validation and existing provider seams. A new database needs concrete connection, schema/model, error, index, tenant, pagination and lifecycle contracts plus honest transaction/durable persistence capabilities. Qualify ordinary and versioned writes, exact/current/history reads, concurrent conflicts, authorization denial, startup/provider failure, restart, migration and backup/restore. No Cassandra/elasticdb production runbook can be claimed from empty configuration or package existence.\n\n## Common mistakes\n\n- Treating vDatabase/vMongodb as development stubs rather than shared/version-aware persistence machinery.\n- Advertising Cassandra or elasticdb as supported storage without an implemented and qualified adapter.\n- Treating a search projection as authoritative database storage.\n- Changing databaseType without concrete handlers, tenant isolation and topology capability checks.\n- Silently weakening validation or multi-record atomicity on provider failure.\n\n## Verification\n\nUse persistence.provider-data-access-layer for Mongo runtime, provider and operational detail. Qualify actual selected module/tenant configuration, schema/index preparation, CRUD/version behavior, transaction refusal on an unqualified topology, migrations and restore through owner APIs. Provider outage recovery must reconcile committed/uncertain writes before retry; publication rollback cannot undo data writes. The concrete schema keyword customization below remains part of the contract.\n\n## Customizing MongoDB schema keyword selection\n\nThe effective `database.default.mongodb.options.schemaProperties` value is a keyed boolean map. For example, a project can disable one inherited keyword:\n\n```js\nmodule.exports = {\n  database: { default: { mongodb: { options: {\n    schemaProperties: { pattern: false }\n  } } } }\n};\n```\n\nOther inherited enabled keywords remain selected. A schema minimum of `0` or a selected boolean value of `false` is copied as declared; truthiness must not drop it. An array, null, or a non-boolean selector is rejected during model preparation. This selection chooses which declared keywords reach the provider; it does not replace domain validation or authorize relaxing tenant/security guarantees.\n",
      "previous": {
        "title": "Cache Provider Runbooks",
        "route": "/docs/framework/foundation-cache-provider-runbooks"
      },
      "next": {
        "title": "OTP and Security Flow",
        "route": "/docs/framework/security-otp-security-flow"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "database",
        "owner": "database",
        "sourcePath": "data/docs-v001/records/documentation/databaseDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/databaseDocumentationComponentData.js",
        "wordCount": 967,
        "checksum": "496a452735af73f49926ff8e1c68a031b6212f12203f9d48cded4c71047a7125"
      },
      "slug": "foundation-database-provider-boundaries",
      "locale": "en",
      "navigationGroup": "Database Provider Contracts",
      "navigationGroupCode": "database-provider-contracts",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "persistence.provider-data-access-layer",
          "owner": "database"
        },
        {
          "documentId": "foundation.cache-provider-runbooks",
          "owner": "cache"
        },
        {
          "documentId": "discovery.search-indexing",
          "owner": "discoveryRuntime"
        }
      ]
    },
    "active": true
  }
};
