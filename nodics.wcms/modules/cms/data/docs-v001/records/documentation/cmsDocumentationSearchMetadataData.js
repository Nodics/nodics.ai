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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagewcmspublishinglifecycle",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagewcmsPublishingLifecycle",
    "title": "Staged-to-Online publishing lifecycle",
    "summary": "Author, approve, deploy, recover, and customize immutable WCMS releases across physically separated Staged and Online runtimes.",
    "searchText": "Staged-to-Online publishing lifecycle Author, approve, deploy, recover, and customize immutable WCMS releases across physically separated Staged and Online runtimes. release-staging-and-publication content-publication-lifecycle staged-to-online-publishing-lifecycle",
    "keywords": [
      "release-staging-and-publication",
      "content-publication-lifecycle",
      "staged-to-online-publishing-lifecycle"
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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagewcmscmssourcemapauthoringcontract",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagewcmsCmsSourceMapAuthoringContract",
    "title": "CMS Source Map and Authoring Contract",
    "summary": "Exact CMS implementation map for sites, routes, pages, components, renderers, migration, publication manifests, delivery cache, and governance.",
    "searchText": "CMS Source Map and Authoring Contract Exact CMS implementation map for sites, routes, pages, components, renderers, migration, publication manifests, delivery cache, and governance. cms source-map authoring publication-manifest delivery-cache",
    "keywords": [
      "cms",
      "source-map",
      "authoring",
      "publication-manifest",
      "delivery-cache"
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
    "code": "nodicsDocsSearchpagenodicsdocsmetadatawcmspublishinglifecycle",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatawcmsPublishingLifecycle",
    "title": "Staged-to-Online publishing lifecycle",
    "summary": "Author, approve, deploy, recover, and customize immutable WCMS releases across physically separated Staged and Online runtimes.",
    "searchText": "Staged-to-Online publishing lifecycle Author, approve, deploy, recover, and customize immutable WCMS releases across physically separated Staged and Online runtimes. # Staged-to-Online publishing lifecycle\n\nPublishing is the governed movement of an exact, approved content version from an authoring runtime to a delivery runtime. Think of Staged as a newsroom where editors prepare and verify an edition, and Online as the distribution system that serves only editions formally released. Saving a page does not make it public; publishing its frozen version does.\n\nThis beginner-friendly guide is for business users, administrators, developers, architects, operators, testers, partners, and AI tools working with publishable Nodics content. WCMS owns content and deployment behavior, `nPublish` owns the generic publication lifecycle, Process owns approval workflow state, and Platform/Axis provides the employee administration surface. A public client consumes Online only.\n\n## Why separate Staged and Online\n\nA content editor needs freedom to create incomplete versions without exposing them to customers. Physical runtime separation also prevents a public request from accidentally resolving an unpublished record. Publishing therefore uses separate runtime roles, databases, credentials, routes, APIs, and media stores.\n\n```mermaid\nflowchart LR\n  Author[\"Business user in Axis\"] --> Staged[\"WCMS Staged: author and freeze\"]\n  Staged --> Process[\"Process: approval workflow\"]\n  Process --> Publish[\"nPublish: authorized lifecycle\"]\n  Publish --> Online[\"WCMS Online: deploy and activate\"]\n  Online --> Public[\"Nexus or another public client\"]\n```\n\nAxis may reach authoring and delivery operations through backend-declared routing. Nexus and other public applications receive only Online coordinates; they must never receive a Staged host, credential, or operation route.\n\n## Data lifecycle categories\n\nNot all records should be published:\n\n| Category | Examples | Lifecycle |\n| --- | --- | --- |\n| Publishable and versioned | sites, catalogs, pages, templates, components, navigation, routes, selected media and editorial projections | Author and freeze in Staged; approve; deploy an immutable package to Online |\n| Operational and versioned | orders, workflow state, governed submissions and audit history | Remain in the owning Online/operational runtime; version for history without Staged-to-Online publication |\n| Operational reference | users, customers, runtime registrations and similar identity/reference records | Remain with the owning module; do not invent publication or business-version semantics |\n\nEvery module-owned data bundle declares its lifecycle and destination. Import does not grant authority to publish, and export does not become an import or publication bypass.\n\n## Running example\n\nAn editor changes a page template and page data in WCMS Staged. The editor selects a specific version and requests publication. WCMS freezes the exact dependency graph—including required components, routes, localization, media, and accepted editorial members—into an immutable manifest. Process creates or resumes the approval workflow. After an authorized decision, `nPublish` invokes the WCMS adapter, which validates the Online role, promotes required media, deploys the manifest transactionally, activates Online pointers, and records an idempotent receipt and outbox evidence. The public client then resolves that Online version.\n\nA validation rejection, approval rejection, signature failure, missing media, or transaction failure leaves the previous Online version active. A repeated request with the same operation identity converges on the existing result. Rollback reactivates a previously deployed immutable release; it does not copy the latest Staged state.\n\n1. Before rollback, read the BackOffice application initialization status and selected CMS baseline publication. Record profile/baseline, publication.code, current revision, source/target version, previousOnlineVersion, current Online pointer/manifest, actor, reason and correlation. Inspect the prior immutable snapshot and its Media dependencies; do not choose an arbitrary latest version.\n2. Use an authorized human administrator through BackOffice POST /applications/:profileCode/initialization/rollback with applicationInitialization:{reason,correlationId}. The route requires backoffice.application.initialization.rollback and the runtime administrator group. Obtain explicit operator confirmation; this is a governed mutation, not a readiness refresh.\n3. BackOffice forwards the fixed profile-owned baseline endpoint using service authentication and delegated requestedBy. CMS POST /publication/baselines/:baselineCode/rollback is internal service-token transport, not a public human-token shortcut. CMS assertStaged and actorRequest preserve delegated actor, reason and correlation.\n4. CMS rereads the publication and permits baseline rollback only while state is ONLINE and previousOnlineVersion is present, then calls nPublish.rollback with the current expectedRevision. CMS_BASELINE_ROLLBACK_UNAVAILABLE means there is no eligible previous version/current Online state; stop and inspect, not seed an invented previous version.\n5. nPublish transitions ROLLING_BACK, asks the version provider to restore previousOnlineVersion, runs the domain afterRollback hook, and records ROLLED_BACK; failure records FAILED / ROLLBACK_FAILED. Revision conflict or a concurrently changed pointer requires a new status read and fresh human decision, not automatic broader replay.\n6. Afterward inspect rollback receipt/state/revision/correlation, active Online pointer and exact restored manifest. Verify served article version, navigation/access/search projection and every required retained Media byte. Only close the operator recovery once those target checks agree; a ROLLED_BACK label alone is insufficient.\n\nThis procedure restores the governed previous Online version/pointer within the publication adapter's scope. It does not revert repository source, nImport writes, unrelated operational records or physically delete/restore Media. Multi-service rollback and cache freshness are not globally atomic. Preserve the failure evidence and inspect actual target state after a partial hook failure. Migration rollback is a separate audit-backed data recovery operation; see `wcms.cms-source-map-authoring-contract`.\n\n## Site bundle shape\n\nMost site publications move as one immutable `SITE` manifest. The manifest contains the selected site, routes, page versions, component graph, localization references, and media references. Online imports the manifest, promotes required media into Online-owned storage, then atomically activates the route pointers that make the release visible.\n\nLarge documentation or content sites may exceed the configured source-side `siteBundleChunkThresholdBytes` policy. In that case WCMS keeps the same business lifecycle but changes the transfer shape:\n\n| Shape | Purpose |\n| --- | --- |\n| Route chunk manifest | Carries one route's frozen page, dependency graph, and required media. Online imports it as prepared content without activating public pointers yet. |\n| `SITE_INDEX` manifest | Carries the release identity and a route index pointing to the prepared chunk manifests with content hashes. This is the version `nPublish` records as the Online target. |\n\nOnline activates a chunked site only after every referenced route chunk is present, matches the expected route scope, and matches the expected content hash. The final `SITE_INDEX` activation switches all route pointers in one governed transaction. Reconciliation, verification, rollback, support bundles, and withdrawal operate through the index and its child route manifests, so the operator still sees one release even when transport used multiple manifests.\n\nChunking is runtime publication behavior, not release-data business logic. Authors still define sites, pages, routes, components, and media as normal records. They must not add custom code or procedural import steps to make a bundle publishable.\n\n## Initialization and reusable site bundles\n\nMandatory framework data such as the standard publication approval workflow and baseline policy is installed from its owning backend module. Application or website bundles are imported into Staged through governed nImport APIs. An administrator verifies the content and explicitly publishes it. This supports Axis initialization, partner website starters, and additional template bundles without making the frontend or a customer database script the content owner.\n\nAxis includes a minimal bundled recovery login so an administrator can sign in when CMS data is not initialized. Once the Axis content baseline is Online, the normal WCMS-delivered experience replaces that recovery surface.\n\n## Security and integrity rules\n\n- Never create, repair, seed, version, publish, restore, or verify business data through direct database CRUD. Use Nodics APIs or owning services.\n- Human and service identities are distinct. Internal deployment credentials cannot substitute for a human approval decision.\n- Online refuses authoring and publication-source export operations. Staged, Online, Process, Platform, and public routes fail closed for the wrong role.\n- Tenant and enterprise identity, manifest checksum, source version, actor, approval, correlation ID, target receipt, and delivery outcome remain linked in audit evidence.\n- Media is promoted to Online-owned storage before metadata activation. Online never reads a Staged media path.\n- Reconciliation may rebuild missing evidence only when the target already points to the exact manifest. Pointer drift is reported and never silently overwritten.\n\n## Customization boundary\n\nA customer project may contribute later-loaded content bundles, environment properties, server compositions, approval policy, or service overlays through the standard Nodics extension hierarchy. It must preserve functional ownership, runtime-role checks, immutable package identity, authorization, tenant isolation, audit lineage, and idempotency. Do not fork `nPublish`, introduce a second workflow authority, hardcode Staged routing in a frontend, or place backend-importable CMS data in Axis or Nexus.\n\n## Common mistakes\n\nDo not treat a database copy as publication: it loses the selected-version, approval, receipt, audit, and retry guarantees. Do not point Nexus at Staged to preview a change, publish whichever version happens to be latest, seed Online through an importer, or let a Process definition become content authority. Do not store Axis or Nexus CMS records in the frontend merely because those applications render them. Finally, do not report Local timing or automated accessibility checks as production or human assurance.\n\n## Verification\n\nVerify a release through the complete path: Staged import and version, frozen manifest, Process approval, authenticated deployment, Online receipt and pointer, media availability, outbox delivery, audit correlation, and public delivery. Also test rejection, response loss, retry, concurrent requests, restart recovery, rollback, and unpublished isolation.\n\nLocal production simulation may prove container health, network separation, authenticated data services, failover, backup/restore rehearsal, bounded load, and soak behavior. It is not production certification. Managed-provider failover, regional residency, real external providers, independent penetration testing, production-scale load, and human assistive-technology review require environment-specific evidence and accountable approval.\n\nFor executable reference-project commands, use the owning Kickoff Local publishing operations guide. For content concepts and delivery structure, read the WCMS overview and Media management guides next.\n\n## Coordinated pack and asset approvals\n\nA documentation or CMS content-pack import includes its declared asset files and Media records in the same governed closure. Business DATA_RELEASE imports do not implicitly install optional documentation. Publication is separate: the Documentation publication action coordinates CMS approval and all unqualified exact Media dependencies through existing owner APIs. Operators no longer handle every image manually. CMS derives stable asset publication identities from the exact target manifest, Media code, metadata version and checksum; Axis does not calculate release ownership or execute command URLs from evidence.\n\n```mermaid\nflowchart TD\n Import[Import pack and assets] --> CMS[Normal CMS approval]\n CMS --> Exact[Exact manifest dependencies]\n Exact --> Media[Native employee Media requests]\n Media --> Process[Normal Media Process decisions]\n Process --> Verify[Verify exact metadata and bytes]\n Verify --> Ready[READY only when all dependencies qualify]\n```\n\n| Condition | Behavior | Evidence |\n| --- | --- | --- |\n| Already active asset | Skip another approval | Exact metadata, active pointer and retained bytes |\n| Missing activation | Request exact version and checksum | Native employee permissions and normal Process task |\n| Denied or failed task | Stop; do not replay later commands | Visible partial progress and owner audit |\n| Interrupted operation | Explicitly resume using stable identity | Fresh readiness; no approval on page load |\n| CMS Online, asset incomplete | Keep MEDIA_DEPENDENCIES_PENDING | CMS state alone is never READY |\n\nCoordination is not a cross-runtime atomic transaction or substituted approval. A successful CMS decision is not automatically undone if a later Media task is denied. Original CMS and Media audit records remain authoritative. Refresh evidence, resolve the cause and explicitly resume. Missing versions, changed checksums, unavailable tasks or missing Staged connections block completion. Service credentials and administrator-name exceptions cannot replace signed-in employee approval permissions.\n\n## Exact Media readiness and capacity\n\nRepeated imports retain version history. Publication dependency limits apply to distinct stable record codes, not to the number of historical rows. The CMS adapter reads bounded, descending-version batches and excludes codes already resolved before the next read, retaining the original tenant, employee authority and source query. This prevents a heavily revised shared page from hiding other capability routes or their assets. Exceeding the distinct dependency boundary or receiving non-advancing provider evidence rejects publication instead of silently truncating it. Regression coverage is in cmsPublicationHistoryCapacity.test.js; schema-owned HISTORY/CURRENT read semantics and immutable exact-version loading remain unchanged.\n\nAn Online CMS state is not sufficient to declare a content pack ready. The retained Media owner must prove the exact pinned metadata and target bytes, and CMS must confirm that activation has not changed during that inspection. The default provider uses two bounded unique pointer batches around one exact integrity batch through the existing service-authenticated status and reconcile routes. For 54 active images this requires three remote reads instead of 162, with no server-side READY cache and no relaxed router rate limit. Each image still receives its own physical-byte check through existing Media cleanup authority. The whole integrity selection is validated before owner reads, and ordered evidence must match every exact Media code and manifest. The batch does not approve, activate, repair or delete anything; missing, reordered, foreign or malformed evidence is unavailable, damaged or inactive bytes are BYTES_UNAVAILABLE, and an altered final pointer is ACTIVATION_CHANGED. A later transport supporting only pointer batching retains N+2 remote calls; a provider without batching retains the single-asset contract.\n\n| Observation | Meaning | Operator response |\n| --- | --- | --- |\n| UNAVAILABLE | Inspection failed; readiness is not established | Use the fixed inspection stage and safe owner error code; never infer missing data from a failed read |\n| BYTES_UNAVAILABLE | Target-owned integrity evidence did not qualify | Inspect retained Media through its owner; do not repair a pointer from the dashboard |\n| ACTIVATION_CHANGED | Version or revision changed during verification | Inspect the newer operation and explicitly refresh; do not silently rebase the approved release |\n| Repeated UI reads | Multiple views may request the same expensive evidence | Share the bounded display query; explicit refresh still calls the owner and mutation authorization remains fresh |\n",
    "keywords": [
      "release-staging-and-publication",
      "content-publication-lifecycle",
      "staged-to-online-publishing-lifecycle",
      "Release, Staging, and Publication",
      "Content Publication Lifecycle",
      "Staged-to-Online publishing lifecycle"
    ],
    "facets": {
      "section": "release-staging-and-publication",
      "group": "release-staging-and-publication",
      "navigationDepth": 2,
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
    "code": "nodicsDocsSearchpagenodicsdocsmetadatawcmscmssourcemapauthoringcontract",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatawcmsCmsSourceMapAuthoringContract",
    "title": "CMS Source Map and Authoring Contract",
    "summary": "Exact CMS implementation map for sites, routes, pages, components, renderers, migration, publication manifests, delivery cache, and governance.",
    "searchText": "CMS Source Map and Authoring Contract Exact CMS implementation map for sites, routes, pages, components, renderers, migration, publication manifests, delivery cache, and governance. # CMS Source Map and Authoring Contract\n\nCMS is the backend authority for sites, pages, routes, templates, slots, components, renderers, content localization, migration, publication manifests, and Online delivery pointers. Axis can offer the business authoring journey, Nexus can render the public website, and Agora can consume storefront content, but CMS owns the data contract. This page gives beginners a precise map of where the implementation lives and gives developers enough detail to customize content safely.\n\n## Source map\n\n| Capability | Exact framework source / operation |\n| --- | --- |\n| Schemas and transport | `nodics.wcms/modules/cms/src/schemas/schemas.js`, `nodics.wcms/modules/cms/src/router/routers.js`: model and permission contracts. |\n| Designer authoring | `nodics.wcms/modules/cms/src/service/designer/defaultCmsDesignerCompositionService.js`: getAuthoringModel, validateDraftComposition, saveDraftComposition, assignRoute, assignNavigation. Saves use existing generated CMS services, not a second content store. |\n| Delivery | `nodics.wcms/modules/cms/src/service/delivery/defaultCmsDeliveryService.js`: resolvePage, resolvePublishedManifest, resolveRoute and projectComponent; publication-enabled and legacy delivery paths are distinct. |\n| Manifest orchestration | `nodics.wcms/modules/cms/src/service/publication/defaultCmsPublicationManifestOrchestrationService.js`: buildSnapshot, persist, importManifest, activate, withdraw. |\n| Migration | `nodics.wcms/modules/cms/src/service/migration/defaultCmsMigrationService.js`: previewMigration, applyMigration, rollbackMigration. |\n| Cache invalidation | `nodics.wcms/modules/cms/src/service/delivery/defaultCmsDeliveryCacheInvalidationService.js`: invalidate. |\n| Documentation governance | `nodics.wcms/modules/cms/src/service/documentation/defaultCmsDocumentationGovernanceService.js`: validateAuthoringRecords, renderProjection, search, publicationHandoff. |\n| Governed baseline recovery | `nodics.wcms/modules/cms/src/service/publication/defaultCmsPublicationBaselineService.js`: status, actorRequest, rollback; shared nPublish authority is `nodics.foundation/modules/nPublish/src/service/defaultPublicationLifecycleService.js`. |\n\n## Content model\n\n```mermaid\nflowchart TD\n  Site[\"cmsSite\"] --> Route[\"cmsPageRoute\"]\n  Route --> Page[\"cmsPage version\"]\n  Page --> Slot[\"cmsSlot\"]\n  Slot --> Component[\"cmsComponent\"]\n  Component --> Renderer[\"itemRenderer\"]\n  Component --> Media[\"media reference\"]\n  Page --> Localization[\"localized content\"]\n  Route --> Delivery[\"Online delivery pointer\"]\n```\n\nThe business value is governed composition. A content administrator should be able to prepare a page in Staged, preview it, request approval, and publish a controlled version. A developer should know which schema owns each object and where to extend validation, delivery, or rendering. An operator should know which publication, cache, and route evidence proves that production is serving the approved version.\n\n## Authoring contract\n\nRelease headers target existing CMS schemas; interactive authoring uses Designer composition operations and generated owner services. `validateDraftComposition` normalizes and validates the draft graph without saving. `saveDraftComposition` validates, then saves page, components, localizations, placements and media sequentially, optionally assigns route/navigation, and invalidates delivery afterward. A failure can leave earlier saves present; this is not a transaction across the composition. Inspect saved identities and reread the graph before a bounded replay. Axis availability does not imply every schema has a qualified authoring workbench.\n\n```js\nmodule.exports = {\n  cms: {\n    pages: {\n      options: {\n        enabled: true,\n        schemaName: 'cmsPage',\n        operation: 'saveAll',\n        dataFilePrefix: 'defaultCmsPageData'\n      },\n      query: { code: '$code', tenant: '$tenant', catalogVersion: '$catalogVersion' }\n    }\n  }\n};\n```\n\nThe header says where records go. The record says what should exist. The CMS service decides whether the object is valid. The publication workflow decides when it becomes Online. This separation keeps business users, developers, AI tools, and operators from creating parallel authorities.\n\n## Publication and delivery\n\nCMS publication starts in Staged. The publication adapter loads the selected root version, resolves dependencies, validates graph limits, builds a deterministic manifest, includes media references, and sends the manifest to the Online target. The target imports the manifest, validates integrity, activates delivery scopes, and invalidates the relevant delivery cache. Staged must not write Online storage directly.\n\nWith cms.publication.enabled, resolvePage delegates to resolvePublishedManifest and the active Online snapshot; component projection applies localization/renderer hints. The legacy non-publication path instead resolves active route/page/generated records, and employee shared composition refuses that path with ERR_CMS_00090. Do not claim every configured resolver enforces an Online pointer: production deployment must select and verify governed publication delivery. Nexus and storefront consumers should surface unavailable content safely, not invent an approved page.\n\nDesigner save calls invalidateDelivery after the composition succeeds. The cache invalidation owner delegates tenant-scoped configured delivery resource names to nCache, defaulting to resolvePublicPage and resolveAuthenticatedPage. If cache.invalidateResource is absent it resolves successfully without cache work. Invalidation is not proof that a remote CDN, browser cache or every consumer has refreshed; inspect the active manifest/pointer and the delivered page revision separately after activation. A partial authoring failure may occur before the invalidation call.\n\n## Customization and extension guidance\n\nDevelopers can customize CMS by adding schemas, item renderers, composition rules, validation handlers, migration adapters, or publication adapters. The extension should live in the owning module or customer project and should add tests beside the capability it changes. Business users should see the result as new fields, components, page templates, workflow states, or validation messages in Axis.\n\nWhen adding a component type, define the renderer, allowed properties, localization behavior, media relation behavior, authoring validation, and publication dependency collection. When adding a migration path, define source classification, mapping rules, conflict behavior, partial failure handling, and retry evidence.\n\nFor migration, POST /migration/preview computes changes and manualActions against current state; inspect conflicts and manual work before authorizing apply. POST /migration/apply recomputes the preview, persists an APPLYING audit with before-images, applies changes sequentially, then records APPLIED or NO_CHANGES; an error records FAILED with a redacted diagnostic. Manual actions are counted, not automatically repaired or necessarily an apply blocker. Preview is not a frozen approval token and apply is not all-or-nothing. Protect concurrent edits and capture the audit code and correlation before deciding whether to resume or recover.\n\nPOST /migration/rollback requires cmsMigration.auditCode and a stored snapshot, reverses snapshot changes in reverse order (remove CREATE; update prior values for UPDATE), then records ROLLED_BACK; repeating an already rolled-back audit is idempotent. Missing audit/snapshot blocks recovery. This does not promise removal of every newly introduced field, restoration of concurrent edits, physical Media recovery, or atomic multi-record rollback. The routes require their distinct cms.migration.preview/apply/rollback permissions and runtime administrator group; source migration, publication approval, and Online pointer rollback are separate operations.\n\n## Operational checks\n\n| Check | Owner operation | What it does not prove |\n| --- | --- | --- |\n| Authoring graph | Designer validation and saved CMS identities; inspect partial saves. | No implicit Online activation or composition-wide atomicity. |\n| Documentation pack readiness | validateAuthoringRecords returns READY/BLOCKED after hierarchy, access, visuals, publication/search coverage and checksum checks. | READY is editorial/record validation, not import, approval or execution. |\n| Documentation projection/handoff | renderProjection/search apply governed projection rules; publicationHandoff describes the owner handoff. | Neither creates a frontend publication authority. |\n| Delivery activation | Manifest import/activation and exact current delivery pointer. | Metadata alone does not prove every Media byte or external cache is ready. |\n| Recovery | Migration audit for data changes; baseline status and prior immutable publication for Online rollback. | These are different recovery scopes; see `wcms.publishing-lifecycle` Running example. |\n\n## Common mistakes\n\n- Creating components without renderer or media dependency rules.\n- Adding a route without an active page version.\n- Treating a Staged preview as Online publication.\n- Putting logic or environment-specific URLs into data record files.\n- Updating Nexus or Agora to hide a CMS data problem instead of fixing CMS authoring, import, or publication.\n\n## Verification\n\nRun CMS contract tests for authoring, delivery, migration, publication manifest, workflow callbacks, localization, and storefront delivery. Then run a fresh-schema import, publish a sample page, open the consuming application in the browser, and prove that production delivery reads an active Online manifest with the expected page, component, media, and route evidence.\n",
    "keywords": [
      "cms",
      "source-map",
      "authoring",
      "publication-manifest",
      "delivery-cache",
      "WCMS and Content Management",
      "Content Model and Delivery",
      "CMS Source Map and Authoring Contract"
    ],
    "facets": {
      "section": "wcms-and-content-management",
      "group": "wcms-and-content-management",
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
