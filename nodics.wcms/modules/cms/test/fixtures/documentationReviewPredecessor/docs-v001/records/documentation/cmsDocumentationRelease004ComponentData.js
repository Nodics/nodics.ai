/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Immutable documentation provenance correction 0.0.2; article bodies preserved, normal Staged review and Online publication required. */
module.exports = {
  "record0": {
    "code": "nodicsDocsComponentwcmsPublishingLifecycle",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "wcms.publishing-lifecycle",
      "title": "Staged-to-Online publishing lifecycle",
      "route": "/docs/framework/wcms-publishing-lifecycle",
      "section": "release-staging-and-publication",
      "sectionTitle": "Release, Staging, and Publication",
      "group": "release-staging-and-publication",
      "groupTitle": "Release, Staging, and Publication",
      "parentId": "release-staging-and-publication",
      "hierarchyPath": [
        "Release, Staging, and Publication",
        "Staged-to-Online publishing lifecycle"
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
      "summary": "Author, approve, deploy, recover, and customize immutable WCMS releases across physically separated Staged and Online runtimes.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "version": "0.0.4",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "wcms.overview",
        "docs.overview"
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
        "release-staging-and-publication",
        "content-publication-lifecycle",
        "staged-to-online-publishing-lifecycle"
      ],
      "topicKeywords": [
        "Release, Staging, and Publication",
        "Content Publication Lifecycle",
        "Staged-to-Online publishing lifecycle"
      ],
      "headings": [
        {
          "text": "Why separate Staged and Online",
          "anchor": "wcmsPublishingLifecycle-1-why-separate-staged-and-online",
          "level": 2
        },
        {
          "text": "Data lifecycle categories",
          "anchor": "wcmsPublishingLifecycle-2-data-lifecycle-categories",
          "level": 2
        },
        {
          "text": "Running example",
          "anchor": "wcmsPublishingLifecycle-3-running-example",
          "level": 2
        },
        {
          "text": "Site bundle shape",
          "anchor": "wcmsPublishingLifecycle-4-site-bundle-shape",
          "level": 2
        },
        {
          "text": "Initialization and reusable site bundles",
          "anchor": "wcmsPublishingLifecycle-5-initialization-and-reusable-site-bundles",
          "level": 2
        },
        {
          "text": "Security and integrity rules",
          "anchor": "wcmsPublishingLifecycle-6-security-and-integrity-rules",
          "level": 2
        },
        {
          "text": "Customization boundary",
          "anchor": "wcmsPublishingLifecycle-7-customization-boundary",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "wcmsPublishingLifecycle-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "wcmsPublishingLifecycle-9-verification",
          "level": 2
        },
        {
          "text": "Coordinated pack and asset approvals",
          "anchor": "wcms-coordinated-pack-asset-approvals",
          "level": 2
        },
        {
          "text": "Exact Media readiness and capacity",
          "anchor": "wcms-exact-media-readiness-capacity",
          "level": 2
        },
        {
          "text": "Review frozen documentation before approval",
          "anchor": "wcms-publishing-lifecycle-frozen-document-review",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Publishing is the governed movement of an exact, approved content version from an authoring runtime to a delivery runtime. Think of Staged as a newsroom where editors prepare and verify an edition, and Online as the distribution system that serves only editions formally released. Saving a page does not make it public; publishing its frozen version does."
        },
        {
          "kind": "paragraph",
          "text": "This beginner-friendly guide is for business users, administrators, developers, architects, operators, testers, partners, and AI tools working with publishable Nodics content. WCMS owns content and deployment behavior, `nPublish` owns the generic publication lifecycle, Process owns approval workflow state, and Platform/Axis provides the employee administration surface. A public client consumes Online only."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Why separate Staged and Online",
          "anchor": "wcmsPublishingLifecycle-1-why-separate-staged-and-online"
        },
        {
          "kind": "paragraph",
          "text": "A content editor needs freedom to create incomplete versions without exposing them to customers. Physical runtime separation also prevents a public request from accidentally resolving an unpublished record. Publishing therefore uses separate runtime roles, databases, credentials, routes, APIs, and media stores."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Author[\"Business user in Axis\"] --> Staged[\"WCMS Staged: author and freeze\"]\n  Staged --> Process[\"Process: approval workflow\"]\n  Process --> Publish[\"nPublish: authorized lifecycle\"]\n  Publish --> Online[\"WCMS Online: deploy and activate\"]\n  Online --> Public[\"Nexus or another public client\"]"
        },
        {
          "kind": "paragraph",
          "text": "Axis may reach authoring and delivery operations through backend-declared routing. Nexus and other public applications receive only Online coordinates; they must never receive a Staged host, credential, or operation route."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Data lifecycle categories",
          "anchor": "wcmsPublishingLifecycle-2-data-lifecycle-categories"
        },
        {
          "kind": "paragraph",
          "text": "Not all records should be published:"
        },
        {
          "kind": "table",
          "headers": [
            "Category",
            "Examples",
            "Lifecycle"
          ],
          "rows": [
            [
              "Publishable and versioned",
              "sites, catalogs, pages, templates, components, navigation, routes, selected media and editorial projections",
              "Author and freeze in Staged; approve; deploy an immutable package to Online"
            ],
            [
              "Operational and versioned",
              "orders, workflow state, governed submissions and audit history",
              "Remain in the owning Online/operational runtime; version for history without Staged-to-Online publication"
            ],
            [
              "Operational reference",
              "users, customers, runtime registrations and similar identity/reference records",
              "Remain with the owning module; do not invent publication or business-version semantics"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Every module-owned data bundle declares its lifecycle and destination. Import does not grant authority to publish, and export does not become an import or publication bypass."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Running example",
          "anchor": "wcmsPublishingLifecycle-3-running-example"
        },
        {
          "kind": "paragraph",
          "text": "An editor changes a page template and page data in WCMS Staged. The editor selects a specific version and requests publication. WCMS freezes the exact dependency graph—including required components, routes, localization, media, and accepted editorial members—into an immutable manifest. Process creates or resumes the approval workflow. After an authorized decision, `nPublish` invokes the WCMS adapter, which validates the Online role, promotes required media, deploys the manifest transactionally, activates Online pointers, and records an idempotent receipt and outbox evidence. The public client then resolves that Online version."
        },
        {
          "kind": "paragraph",
          "text": "A validation rejection, approval rejection, signature failure, missing media, or transaction failure leaves the previous Online version active. A repeated request with the same operation identity converges on the existing result. Rollback reactivates a previously deployed immutable release; it does not copy the latest Staged state."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Before rollback, read the BackOffice application initialization status and selected CMS baseline publication. Record profile/baseline, publication.code, current revision, source/target version, previousOnlineVersion, current Online pointer/manifest, actor, reason and correlation. Inspect the prior immutable snapshot and its Media dependencies; do not choose an arbitrary latest version.",
            "Use an authorized human administrator through BackOffice POST /applications/:profileCode/initialization/rollback with applicationInitialization:{reason,correlationId}. The route requires backoffice.application.initialization.rollback and the runtime administrator group. Obtain explicit operator confirmation; this is a governed mutation, not a readiness refresh.",
            "BackOffice forwards the fixed profile-owned baseline endpoint using service authentication and delegated requestedBy. CMS POST /publication/baselines/:baselineCode/rollback is internal service-token transport, not a public human-token shortcut. CMS assertStaged and actorRequest preserve delegated actor, reason and correlation.",
            "CMS rereads the publication and permits baseline rollback only while state is ONLINE and previousOnlineVersion is present, then calls nPublish.rollback with the current expectedRevision. CMS_BASELINE_ROLLBACK_UNAVAILABLE means there is no eligible previous version/current Online state; stop and inspect, not seed an invented previous version.",
            "nPublish transitions ROLLING_BACK, asks the version provider to restore previousOnlineVersion, runs the domain afterRollback hook, and records ROLLED_BACK; failure records FAILED / ROLLBACK_FAILED. Revision conflict or a concurrently changed pointer requires a new status read and fresh human decision, not automatic broader replay.",
            "Afterward inspect rollback receipt/state/revision/correlation, active Online pointer and exact restored manifest. Verify served article version, navigation/access/search projection and every required retained Media byte. Only close the operator recovery once those target checks agree; a ROLLED_BACK label alone is insufficient."
          ]
        },
        {
          "kind": "paragraph",
          "text": "This procedure restores the governed previous Online version/pointer within the publication adapter's scope. It does not revert repository source, nImport writes, unrelated operational records or physically delete/restore Media. Multi-service rollback and cache freshness are not globally atomic. Preserve the failure evidence and inspect actual target state after a partial hook failure. Migration rollback is a separate audit-backed data recovery operation; see `wcms.cms-source-map-authoring-contract`."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Site bundle shape",
          "anchor": "wcmsPublishingLifecycle-4-site-bundle-shape"
        },
        {
          "kind": "paragraph",
          "text": "Most site publications move as one immutable `SITE` manifest. The manifest contains the selected site, routes, page versions, component graph, localization references, and media references. Online imports the manifest, promotes required media into Online-owned storage, then atomically activates the route pointers that make the release visible."
        },
        {
          "kind": "paragraph",
          "text": "Large documentation or content sites may exceed the configured source-side `siteBundleChunkThresholdBytes` policy. In that case WCMS keeps the same business lifecycle but changes the transfer shape:"
        },
        {
          "kind": "table",
          "headers": [
            "Shape",
            "Purpose"
          ],
          "rows": [
            [
              "Route chunk manifest",
              "Carries one route's frozen page, dependency graph, and required media. Online imports it as prepared content without activating public pointers yet."
            ],
            [
              "`SITE_INDEX` manifest",
              "Carries the release identity and a route index pointing to the prepared chunk manifests with content hashes. This is the version `nPublish` records as the Online target."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Online activates a chunked site only after every referenced route chunk is present, matches the expected route scope, and matches the expected content hash. The final `SITE_INDEX` activation switches all route pointers in one governed transaction. Reconciliation, verification, rollback, support bundles, and withdrawal operate through the index and its child route manifests, so the operator still sees one release even when transport used multiple manifests."
        },
        {
          "kind": "paragraph",
          "text": "Chunking is runtime publication behavior, not release-data business logic. Authors still define sites, pages, routes, components, and media as normal records. They must not add custom code or procedural import steps to make a bundle publishable."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Initialization and reusable site bundles",
          "anchor": "wcmsPublishingLifecycle-5-initialization-and-reusable-site-bundles"
        },
        {
          "kind": "paragraph",
          "text": "Mandatory framework data such as the standard publication approval workflow and baseline policy is installed from its owning backend module. Application or website bundles are imported into Staged through governed nImport APIs. An administrator verifies the content and explicitly publishes it. This supports Axis initialization, partner website starters, and additional template bundles without making the frontend or a customer database script the content owner."
        },
        {
          "kind": "paragraph",
          "text": "Axis includes a minimal bundled recovery login so an administrator can sign in when CMS data is not initialized. Once the Axis content baseline is Online, the normal WCMS-delivered experience replaces that recovery surface."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Security and integrity rules",
          "anchor": "wcmsPublishingLifecycle-6-security-and-integrity-rules"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Never create, repair, seed, version, publish, restore, or verify business data through direct database CRUD. Use Nodics APIs or owning services.",
            "Human and service identities are distinct. Internal deployment credentials cannot substitute for a human approval decision.",
            "Online refuses authoring and publication-source export operations. Staged, Online, Process, Platform, and public routes fail closed for the wrong role.",
            "Tenant and enterprise identity, manifest checksum, source version, actor, approval, correlation ID, target receipt, and delivery outcome remain linked in audit evidence.",
            "Media is promoted to Online-owned storage before metadata activation. Online never reads a Staged media path.",
            "Reconciliation may rebuild missing evidence only when the target already points to the exact manifest. Pointer drift is reported and never silently overwritten."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization boundary",
          "anchor": "wcmsPublishingLifecycle-7-customization-boundary"
        },
        {
          "kind": "paragraph",
          "text": "A customer project may contribute later-loaded content bundles, environment properties, server compositions, approval policy, or service overlays through the standard Nodics extension hierarchy. It must preserve functional ownership, runtime-role checks, immutable package identity, authorization, tenant isolation, audit lineage, and idempotency. Do not fork `nPublish`, introduce a second workflow authority, hardcode Staged routing in a frontend, or place backend-importable CMS data in Axis or Nexus."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "wcmsPublishingLifecycle-8-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not treat a database copy as publication: it loses the selected-version, approval, receipt, audit, and retry guarantees. Do not point Nexus at Staged to preview a change, publish whichever version happens to be latest, seed Online through an importer, or let a Process definition become content authority. Do not store Axis or Nexus CMS records in the frontend merely because those applications render them. Finally, do not report Local timing or automated accessibility checks as production or human assurance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "wcmsPublishingLifecycle-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify a release through the complete path: Staged import and version, frozen manifest, Process approval, authenticated deployment, Online receipt and pointer, media availability, outbox delivery, audit correlation, and public delivery. Also test rejection, response loss, retry, concurrent requests, restart recovery, rollback, and unpublished isolation."
        },
        {
          "kind": "paragraph",
          "text": "Local production simulation may prove container health, network separation, authenticated data services, failover, backup/restore rehearsal, bounded load, and soak behavior. It is not production certification. Managed-provider failover, regional residency, real external providers, independent penetration testing, production-scale load, and human assistive-technology review require environment-specific evidence and accountable approval."
        },
        {
          "kind": "paragraph",
          "text": "For executable reference-project commands, use the owning Kickoff Local publishing operations guide. For content concepts and delivery structure, read the WCMS overview and Media management guides next."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Coordinated pack and asset approvals",
          "anchor": "wcms-coordinated-pack-asset-approvals"
        },
        {
          "kind": "paragraph",
          "text": "A documentation or CMS content-pack import includes its declared asset files and Media records in the same governed closure. Business DATA_RELEASE imports do not implicitly install optional documentation. Publication is separate: the Documentation publication action coordinates CMS approval and all unqualified exact Media dependencies through existing owner APIs. Operators no longer handle every image manually. CMS derives stable asset publication identities from the exact target manifest, Media code, metadata version and checksum; Axis does not calculate release ownership or execute command URLs from evidence."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n Import[Import pack and assets] --> CMS[Normal CMS approval]\n CMS --> Exact[Exact manifest dependencies]\n Exact --> Media[Native employee Media requests]\n Media --> Process[Normal Media Process decisions]\n Process --> Verify[Verify exact metadata and bytes]\n Verify --> Ready[READY only when all dependencies qualify]"
        },
        {
          "kind": "table",
          "headers": [
            "Condition",
            "Behavior",
            "Evidence"
          ],
          "rows": [
            [
              "Already active asset",
              "Skip another approval",
              "Exact metadata, active pointer and retained bytes"
            ],
            [
              "Missing activation",
              "Request exact version and checksum",
              "Native employee permissions and normal Process task"
            ],
            [
              "Denied or failed task",
              "Stop; do not replay later commands",
              "Visible partial progress and owner audit"
            ],
            [
              "Interrupted operation",
              "Explicitly resume using stable identity",
              "Fresh readiness; no approval on page load"
            ],
            [
              "CMS Online, asset incomplete",
              "Keep MEDIA_DEPENDENCIES_PENDING",
              "CMS state alone is never READY"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Coordination is not a cross-runtime atomic transaction or substituted approval. A successful CMS decision is not automatically undone if a later Media task is denied. Original CMS and Media audit records remain authoritative. Refresh evidence, resolve the cause and explicitly resume. Missing versions, changed checksums, unavailable tasks or missing Staged connections block completion. Service credentials and administrator-name exceptions cannot replace signed-in employee approval permissions."
        },
        {
          "kind": "heading",
          "level": 2,
          "anchor": "wcms-exact-media-readiness-capacity",
          "text": "Exact Media readiness and capacity"
        },
        {
          "kind": "paragraph",
          "text": "Repeated imports retain version history. Publication dependency limits apply to distinct stable record codes, not to the number of historical rows. The CMS adapter reads bounded, descending-version batches and excludes codes already resolved before the next read, retaining the original tenant, employee authority and source query. This prevents a heavily revised shared page from hiding other capability routes or their assets. Exceeding the distinct dependency boundary or receiving non-advancing provider evidence rejects publication instead of silently truncating it. Regression coverage is in cmsPublicationHistoryCapacity.test.js; schema-owned HISTORY/CURRENT read semantics and immutable exact-version loading remain unchanged."
        },
        {
          "kind": "paragraph",
          "text": "An Online CMS state is not sufficient to declare a content pack ready. The retained Media owner must prove the exact pinned metadata and target bytes, and CMS must confirm that activation has not changed during that inspection. The default provider uses two bounded unique pointer batches around one exact integrity batch through the existing service-authenticated status and reconcile routes. For 54 active images this requires three remote reads instead of 162, with no server-side READY cache and no relaxed router rate limit. Each image still receives its own physical-byte check through existing Media cleanup authority. The whole integrity selection is validated before owner reads, and ordered evidence must match every exact Media code and manifest. The batch does not approve, activate, repair or delete anything; missing, reordered, foreign or malformed evidence is unavailable, damaged or inactive bytes are BYTES_UNAVAILABLE, and an altered final pointer is ACTIVATION_CHANGED. A later transport supporting only pointer batching retains N+2 remote calls; a provider without batching retains the single-asset contract."
        },
        {
          "kind": "table",
          "headers": [
            "Observation",
            "Meaning",
            "Operator response"
          ],
          "rows": [
            [
              "UNAVAILABLE",
              "Inspection failed; readiness is not established",
              "Use the fixed inspection stage and safe owner error code; never infer missing data from a failed read"
            ],
            [
              "BYTES_UNAVAILABLE",
              "Target-owned integrity evidence did not qualify",
              "Inspect retained Media through its owner; do not repair a pointer from the dashboard"
            ],
            [
              "ACTIVATION_CHANGED",
              "Version or revision changed during verification",
              "Inspect the newer operation and explicitly refresh; do not silently rebase the approved release"
            ],
            [
              "Repeated UI reads",
              "Multiple views may request the same expensive evidence",
              "Share the bounded display query; explicit refresh still calls the owner and mutation authorization remains fresh"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "For an Editorial article withdrawal, choose Prepare withdrawal in the article detail. Axis reads the exact owning nPublish request and shows its state, source article revision and publication concurrency revision before explicit confirmation. Those revisions are separate; do not substitute one for the other. Editorial requires the actual article pointer, Editorial root and source revision to match, delegates withdrawal to nPublish, and marks the exact article WITHDRAWN only after owner confirmation. Retain the publication reference and history. If the reply or article status update is uncertain, inspect again and explicitly reconcile the same withdrawn request; never replay automatically. Verify that public article delivery returns HTTP 404, rather than an authorization denial or server failure."
        },
        {
          "kind": "paragraph",
          "text": "Editorial validation, readiness and review submission inspect the saved exact article revision, saved localized copy and current active content-type policy on the Staged runtime under the original employee and tenant. Save edits before validating. Caller-supplied copy, status, required-language policy and workflow selection cannot replace owner evidence. Required saved translations remain blocking. Validation marks only an eligible exact revision READY after an acknowledged conditional state update. Review uses the owner workflow and exact Process instance identity; if Process accepted but the article changed before IN_REVIEW was confirmed, inspect the exact instance and saved article before continuing. Readiness is read-only and separately reports the inspected revision and article status. Atomic draft commands are described separately below."
        },
        {
          "kind": "paragraph",
          "text": "Editorial News and Blog content-type policies are reference data that govern saved Staged authoring. In Data Exchange, Initialization data, validate and install Editorial foundations before validating dependent articles. The exact release remains editorial:init-v001 with its declared reference lifecycle and source hashes. Content-type authoring remains Staged-only through the shared allowedStages metadata, independently of publication-required article and translation sources. Online projections remain read-only, and policy installation never approves or publishes content. Missing or inactive current policy blocks validation and review; browser-supplied policy cannot replace it."
        },
        {
          "kind": "paragraph",
          "text": "Editorial editing uses owner draft commands. Create supplies DRAFT revision 1 after checking authorized websites, authors and an active saved content type. Save atomically advances the article and all saved translations to one new business revision under the original employee and tenant; incomplete translations remain drafts and required languages still block review. Save clears previous review correlation while retaining the exact publication reference and its source revision. Save does not publish or withdraw content. The editor preserves unsaved copy through preview, blocks lifecycle actions while dirty, confirms discarding edits and inspects uncertain original commands without replay. Unknown inspection evidence does not prove failure. Unsupported structured bodies remain read-only and unchanged extension fields are preserved. Archive requires the exact saved revision and refuses a retained Online publication. Review and publication continue through Process and nPublish; withdrawing an older Online copy preserves newer working copy. Configure inert English/Arabic presentation through Editorial properties or the matching CMS component override. Generic article updates and localization writes are unavailable to HTTP clients; governed source import retains its explicit Staged path. Native source-frozen acceptance and multi-row Online deployment/rollback qualification remain separate from isolated draft command tests."
        },
        {
          "kind": "paragraph",
          "text": "Atomic Online Editorial publication switches the complete website and language set, URL claims, article pointer and original operation receipt in one qualified database transaction. Staged requires its configured distinct Online owner and never substitutes local writes. The target uses existing receipt ownership and managed concurrency, not another publication lifecycle or journal. Original activation keys retain predecessor version and revision, including zero for an absent pointer; lost acknowledgements are inspected against the original durable receipt. Historical completion is separate from current visibility, and UNKNOWN does not prove failure. Rollback restores the complete retained predecessor, refuses intervening article or URL owners and explicitly withdrawn copy, and reaches the actual Online transport. Exact older-request withdrawal preserves newer published content. Before lifecycle effects, the saved source claims a bounded publication request code and source revision; draft save and archive cannot change that source while confirmation is pending. The previous Online reference remains available. Explicit resume continues the same request; failed lifecycle recovery belongs to nPublish. Confirmed Online and source completion clear the pending descriptor. Public delivery enforces active current content, trusted website and language, embargo and publication windows; component filters cannot override visibility, denied reads are unavailable evidence and duplicate slugs are ambiguous. Isolated failure and concurrency checks do not establish native or final fresh-start acceptance. Never insert, update or repair source, projections or receipts directly in the database."
        },
        {
          "kind": "paragraph",
          "text": "Submitting a newer saved revision for Editorial review preserves the exact older publication reference and its source revision. Only review status and workflow correlation change. The older Online copy remains independently inspectable and withdrawable; submission neither withdraws it nor removes that reference. A body-supplied pointer cannot replace the actual saved owner reference. Complete review and publication through the normal owner APIs; never restore a lost reference by editing database records."
        },
        {
          "kind": "paragraph",
          "text": "Rollback and withdrawal recovery preserves the original operation captured in the nPublish transition journal. Qualified failures resume that same target receipt across advancing lifecycle revisions; activation failures retain their normal validation and approval rules. Inspect before an explicit retry, and never infer failure from a lost response. The Editorial workspace separately identifies current deployment, verified absence or unknown evidence while retaining latest article publication history. After rollback, inspect and withdraw the owner-proven restored request without rewriting newer working copy. Archive is held while a copy is deployed or deployment absence is unverified. Deployment does not override embargo, dates or access rules. All changes continue through owner APIs, scoped credentials, normal Process approval and transactional generated services; never repair business records directly in the database."
        },
        {
          "kind": "paragraph",
          "text": "The publication request workspace offers only owner-qualified recovery operations that also pass current BackOffice permission filtering. Preparation rereads the original request; explicit confirmation sends its inspected publication revision. Revalidation is not approval or delivery. Qualified rollback checks current target evidence and preserves intervening publications. Missing original command evidence and unknown responses remain held for inspection, with no automatic replay, credential changes or database repairs. Actor, source and access changes retire prepared evidence. For an Editorial draft with verified no deployed copy, withdrawal controls are omitted while history remains available; a retained rolled-back request is inspectable history, not another withdrawal to perform."
        },
        {
          "kind": "paragraph",
          "text": "A renewed activation of an identical current immutable Editorial copy retains already-matching same-publication route claims without inventing a timestamp change. The distinct original activation receipt and article head still change through the managed transactional owner. Foreign URL claims, changed immutable copy and intervening publications remain fenced. A zero-modified response never becomes a fabricated revision advance. These same-instant guarantees are qualified through composed managed-owner tests, without changing live source statuses or database records."
        },
        {
          "kind": "paragraph",
          "text": "Business navigation keeps publication history separate from current working copy and delivery. Explicit request selection records its admitted source and reference in the URL; browser Back/Forward retires previous private command evidence without replay. Editorial publications link to the admitted all-types working article search only when one available Staged origin matches the publication source. Missing or ambiguous origins do not fall back to another runtime. Canonical Editorial Content retains the same permission-filtered actions as News and Blogs. Exact workflow handoffs show their selected timeline before the recent instance list. Initial owner reads do not describe unloaded translations as missing, command progress distinguishes archive from draft saving, and closing confirmation retains the reviewed intent. Qualified Online history checks current target evidence even without a predecessor; stored publication state alone is not proof of current public delivery. These changes add no permission, approval shortcut, direct database mutation or automatic recovery."
        },
        {
          "kind": "paragraph",
          "text": "Article image intake uses an Editorial-configured Media purpose and inert English/Arabic copy. Media owns the current safe contexts, file-specific policy and original upload inspection. Review the selected image, explicitly upload once, then separately use the confirmed asset and save the article. The browser accepts only an exact positive persisted receipt or matching versioned byte inspection. Unconfirmed responses preserve the original Media reference and never automatically resend, replace an asset or claim publication. Nonversioned inspection does not prove byte reuse. Busy article commands and callbacks from a retired private source are held. Customize the existing Editorial purpose and Media policies without hardcoded customer folders, copied storage registries, new grants, direct database writes or publication shortcuts."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Review frozen documentation before approval",
          "anchor": "wcms-publishing-lifecycle-frozen-document-review"
        },
        {
          "kind": "paragraph",
          "text": "A CMS approval task shows the exact frozen documentation article body alongside its target route, dependency pins and comparison with the retained Online snapshot. Headings, paragraphs, lists, tables, examples and diagram source are projected as plain text. Media references remain governed identities; the review never loads provider URLs or executes markup."
        },
        {
          "kind": "paragraph",
          "text": "The body projection is bounded to 40,000 characters per article within the shared review budget. Unsupported blocks or exceeded bounds set the explicit truncated flag. Inspect complete source evidence before approving a truncated review. A title or a successful import alone is not evidence that the article body was reviewed."
        },
        {
          "kind": "paragraph",
          "text": "Use the normal Process task and current CMS reviewer permission. The publisher cannot bypass approval by changing a lifecycle field, and a closed or unrelated task cannot read the frozen body. Later draft edits do not alter the requested revision. Verify the final section, predecessor text, protected fields and the same task identity after a runtime restart."
        },
        {
          "kind": "paragraph",
          "text": "A selected page can restore its exact predecessor even when that predecessor was published as part of a larger Site release. The Online owner verifies the current pointer and its previous-manifest lineage inside the transaction, restores only the selected delivery scope and preserves sibling routes. It rejects a stale pointer, missing route, different Site or unrelated predecessor. Review of older Site releases without a catalog field uses the exact frozen Site dependency to prove catalog ownership; a latest authoring read cannot supply that proof."
        }
      ],
      "searchText": "# Staged-to-Online publishing lifecycle\n\nPublishing is the governed movement of an exact, approved content version from an authoring runtime to a delivery runtime. Think of Staged as a newsroom where editors prepare and verify an edition, and Online as the distribution system that serves only editions formally released. Saving a page does not make it public; publishing its frozen version does.\n\nThis beginner-friendly guide is for business users, administrators, developers, architects, operators, testers, partners, and AI tools working with publishable Nodics content. WCMS owns content and deployment behavior, `nPublish` owns the generic publication lifecycle, Process owns approval workflow state, and Platform/Axis provides the employee administration surface. A public client consumes Online only.\n\n## Why separate Staged and Online\n\nA content editor needs freedom to create incomplete versions without exposing them to customers. Physical runtime separation also prevents a public request from accidentally resolving an unpublished record. Publishing therefore uses separate runtime roles, databases, credentials, routes, APIs, and media stores.\n\n```mermaid\nflowchart LR\n  Author[\"Business user in Axis\"] --> Staged[\"WCMS Staged: author and freeze\"]\n  Staged --> Process[\"Process: approval workflow\"]\n  Process --> Publish[\"nPublish: authorized lifecycle\"]\n  Publish --> Online[\"WCMS Online: deploy and activate\"]\n  Online --> Public[\"Nexus or another public client\"]\n```\n\nAxis may reach authoring and delivery operations through backend-declared routing. Nexus and other public applications receive only Online coordinates; they must never receive a Staged host, credential, or operation route.\n\n## Data lifecycle categories\n\nNot all records should be published:\n\n| Category | Examples | Lifecycle |\n| --- | --- | --- |\n| Publishable and versioned | sites, catalogs, pages, templates, components, navigation, routes, selected media and editorial projections | Author and freeze in Staged; approve; deploy an immutable package to Online |\n| Operational and versioned | orders, workflow state, governed submissions and audit history | Remain in the owning Online/operational runtime; version for history without Staged-to-Online publication |\n| Operational reference | users, customers, runtime registrations and similar identity/reference records | Remain with the owning module; do not invent publication or business-version semantics |\n\nEvery module-owned data bundle declares its lifecycle and destination. Import does not grant authority to publish, and export does not become an import or publication bypass.\n\n## Running example\n\nAn editor changes a page template and page data in WCMS Staged. The editor selects a specific version and requests publication. WCMS freezes the exact dependency graph—including required components, routes, localization, media, and accepted editorial members—into an immutable manifest. Process creates or resumes the approval workflow. After an authorized decision, `nPublish` invokes the WCMS adapter, which validates the Online role, promotes required media, deploys the manifest transactionally, activates Online pointers, and records an idempotent receipt and outbox evidence. The public client then resolves that Online version.\n\nA validation rejection, approval rejection, signature failure, missing media, or transaction failure leaves the previous Online version active. A repeated request with the same operation identity converges on the existing result. Rollback reactivates a previously deployed immutable release; it does not copy the latest Staged state.\n\n1. Before rollback, read the BackOffice application initialization status and selected CMS baseline publication. Record profile/baseline, publication.code, current revision, source/target version, previousOnlineVersion, current Online pointer/manifest, actor, reason and correlation. Inspect the prior immutable snapshot and its Media dependencies; do not choose an arbitrary latest version.\n2. Use an authorized human administrator through BackOffice POST /applications/:profileCode/initialization/rollback with applicationInitialization:{reason,correlationId}. The route requires backoffice.application.initialization.rollback and the runtime administrator group. Obtain explicit operator confirmation; this is a governed mutation, not a readiness refresh.\n3. BackOffice forwards the fixed profile-owned baseline endpoint using service authentication and delegated requestedBy. CMS POST /publication/baselines/:baselineCode/rollback is internal service-token transport, not a public human-token shortcut. CMS assertStaged and actorRequest preserve delegated actor, reason and correlation.\n4. CMS rereads the publication and permits baseline rollback only while state is ONLINE and previousOnlineVersion is present, then calls nPublish.rollback with the current expectedRevision. CMS_BASELINE_ROLLBACK_UNAVAILABLE means there is no eligible previous version/current Online state; stop and inspect, not seed an invented previous version.\n5. nPublish transitions ROLLING_BACK, asks the version provider to restore previousOnlineVersion, runs the domain afterRollback hook, and records ROLLED_BACK; failure records FAILED / ROLLBACK_FAILED. Revision conflict or a concurrently changed pointer requires a new status read and fresh human decision, not automatic broader replay.\n6. Afterward inspect rollback receipt/state/revision/correlation, active Online pointer and exact restored manifest. Verify served article version, navigation/access/search projection and every required retained Media byte. Only close the operator recovery once those target checks agree; a ROLLED_BACK label alone is insufficient.\n\nThis procedure restores the governed previous Online version/pointer within the publication adapter's scope. It does not revert repository source, nImport writes, unrelated operational records or physically delete/restore Media. Multi-service rollback and cache freshness are not globally atomic. Preserve the failure evidence and inspect actual target state after a partial hook failure. Migration rollback is a separate audit-backed data recovery operation; see `wcms.cms-source-map-authoring-contract`.\n\n## Site bundle shape\n\nMost site publications move as one immutable `SITE` manifest. The manifest contains the selected site, routes, page versions, component graph, localization references, and media references. Online imports the manifest, promotes required media into Online-owned storage, then atomically activates the route pointers that make the release visible.\n\nLarge documentation or content sites may exceed the configured source-side `siteBundleChunkThresholdBytes` policy. In that case WCMS keeps the same business lifecycle but changes the transfer shape:\n\n| Shape | Purpose |\n| --- | --- |\n| Route chunk manifest | Carries one route's frozen page, dependency graph, and required media. Online imports it as prepared content without activating public pointers yet. |\n| `SITE_INDEX` manifest | Carries the release identity and a route index pointing to the prepared chunk manifests with content hashes. This is the version `nPublish` records as the Online target. |\n\nOnline activates a chunked site only after every referenced route chunk is present, matches the expected route scope, and matches the expected content hash. The final `SITE_INDEX` activation switches all route pointers in one governed transaction. Reconciliation, verification, rollback, support bundles, and withdrawal operate through the index and its child route manifests, so the operator still sees one release even when transport used multiple manifests.\n\nChunking is runtime publication behavior, not release-data business logic. Authors still define sites, pages, routes, components, and media as normal records. They must not add custom code or procedural import steps to make a bundle publishable.\n\n## Initialization and reusable site bundles\n\nMandatory framework data such as the standard publication approval workflow and baseline policy is installed from its owning backend module. Application or website bundles are imported into Staged through governed nImport APIs. An administrator verifies the content and explicitly publishes it. This supports Axis initialization, partner website starters, and additional template bundles without making the frontend or a customer database script the content owner.\n\nAxis includes a minimal bundled recovery login so an administrator can sign in when CMS data is not initialized. Once the Axis content baseline is Online, the normal WCMS-delivered experience replaces that recovery surface.\n\n## Security and integrity rules\n\n- Never create, repair, seed, version, publish, restore, or verify business data through direct database CRUD. Use Nodics APIs or owning services.\n- Human and service identities are distinct. Internal deployment credentials cannot substitute for a human approval decision.\n- Online refuses authoring and publication-source export operations. Staged, Online, Process, Platform, and public routes fail closed for the wrong role.\n- Tenant and enterprise identity, manifest checksum, source version, actor, approval, correlation ID, target receipt, and delivery outcome remain linked in audit evidence.\n- Media is promoted to Online-owned storage before metadata activation. Online never reads a Staged media path.\n- Reconciliation may rebuild missing evidence only when the target already points to the exact manifest. Pointer drift is reported and never silently overwritten.\n\n## Customization boundary\n\nA customer project may contribute later-loaded content bundles, environment properties, server compositions, approval policy, or service overlays through the standard Nodics extension hierarchy. It must preserve functional ownership, runtime-role checks, immutable package identity, authorization, tenant isolation, audit lineage, and idempotency. Do not fork `nPublish`, introduce a second workflow authority, hardcode Staged routing in a frontend, or place backend-importable CMS data in Axis or Nexus.\n\n## Common mistakes\n\nDo not treat a database copy as publication: it loses the selected-version, approval, receipt, audit, and retry guarantees. Do not point Nexus at Staged to preview a change, publish whichever version happens to be latest, seed Online through an importer, or let a Process definition become content authority. Do not store Axis or Nexus CMS records in the frontend merely because those applications render them. Finally, do not report Local timing or automated accessibility checks as production or human assurance.\n\n## Verification\n\nVerify a release through the complete path: Staged import and version, frozen manifest, Process approval, authenticated deployment, Online receipt and pointer, media availability, outbox delivery, audit correlation, and public delivery. Also test rejection, response loss, retry, concurrent requests, restart recovery, rollback, and unpublished isolation.\n\nLocal production simulation may prove container health, network separation, authenticated data services, failover, backup/restore rehearsal, bounded load, and soak behavior. It is not production certification. Managed-provider failover, regional residency, real external providers, independent penetration testing, production-scale load, and human assistive-technology review require environment-specific evidence and accountable approval.\n\nFor executable reference-project commands, use the owning Kickoff Local publishing operations guide. For content concepts and delivery structure, read the WCMS overview and Media management guides next.\n\n## Coordinated pack and asset approvals\n\nA documentation or CMS content-pack import includes its declared asset files and Media records in the same governed closure. Business DATA_RELEASE imports do not implicitly install optional documentation. Publication is separate: the Documentation publication action coordinates CMS approval and all unqualified exact Media dependencies through existing owner APIs. Operators no longer handle every image manually. CMS derives stable asset publication identities from the exact target manifest, Media code, metadata version and checksum; Axis does not calculate release ownership or execute command URLs from evidence.\n\n```mermaid\nflowchart TD\n Import[Import pack and assets] --> CMS[Normal CMS approval]\n CMS --> Exact[Exact manifest dependencies]\n Exact --> Media[Native employee Media requests]\n Media --> Process[Normal Media Process decisions]\n Process --> Verify[Verify exact metadata and bytes]\n Verify --> Ready[READY only when all dependencies qualify]\n```\n\n| Condition | Behavior | Evidence |\n| --- | --- | --- |\n| Already active asset | Skip another approval | Exact metadata, active pointer and retained bytes |\n| Missing activation | Request exact version and checksum | Native employee permissions and normal Process task |\n| Denied or failed task | Stop; do not replay later commands | Visible partial progress and owner audit |\n| Interrupted operation | Explicitly resume using stable identity | Fresh readiness; no approval on page load |\n| CMS Online, asset incomplete | Keep MEDIA_DEPENDENCIES_PENDING | CMS state alone is never READY |\n\nCoordination is not a cross-runtime atomic transaction or substituted approval. A successful CMS decision is not automatically undone if a later Media task is denied. Original CMS and Media audit records remain authoritative. Refresh evidence, resolve the cause and explicitly resume. Missing versions, changed checksums, unavailable tasks or missing Staged connections block completion. Service credentials and administrator-name exceptions cannot replace signed-in employee approval permissions.\n\n## Exact Media readiness and capacity\n\nRepeated imports retain version history. Publication dependency limits apply to distinct stable record codes, not to the number of historical rows. The CMS adapter reads bounded, descending-version batches and excludes codes already resolved before the next read, retaining the original tenant, employee authority and source query. This prevents a heavily revised shared page from hiding other capability routes or their assets. Exceeding the distinct dependency boundary or receiving non-advancing provider evidence rejects publication instead of silently truncating it. Regression coverage is in cmsPublicationHistoryCapacity.test.js; schema-owned HISTORY/CURRENT read semantics and immutable exact-version loading remain unchanged.\n\nAn Online CMS state is not sufficient to declare a content pack ready. The retained Media owner must prove the exact pinned metadata and target bytes, and CMS must confirm that activation has not changed during that inspection. The default provider uses two bounded unique pointer batches around one exact integrity batch through the existing service-authenticated status and reconcile routes. For 54 active images this requires three remote reads instead of 162, with no server-side READY cache and no relaxed router rate limit. Each image still receives its own physical-byte check through existing Media cleanup authority. The whole integrity selection is validated before owner reads, and ordered evidence must match every exact Media code and manifest. The batch does not approve, activate, repair or delete anything; missing, reordered, foreign or malformed evidence is unavailable, damaged or inactive bytes are BYTES_UNAVAILABLE, and an altered final pointer is ACTIVATION_CHANGED. A later transport supporting only pointer batching retains N+2 remote calls; a provider without batching retains the single-asset contract.\n\n| Observation | Meaning | Operator response |\n| --- | --- | --- |\n| UNAVAILABLE | Inspection failed; readiness is not established | Use the fixed inspection stage and safe owner error code; never infer missing data from a failed read |\n| BYTES_UNAVAILABLE | Target-owned integrity evidence did not qualify | Inspect retained Media through its owner; do not repair a pointer from the dashboard |\n| ACTIVATION_CHANGED | Version or revision changed during verification | Inspect the newer operation and explicitly refresh; do not silently rebase the approved release |\n| Repeated UI reads | Multiple views may request the same expensive evidence | Share the bounded display query; explicit refresh still calls the owner and mutation authorization remains fresh |\n\nFor an Editorial article withdrawal, choose Prepare withdrawal in the article detail. Axis reads the exact owning nPublish request and shows its state, source article revision and publication concurrency revision before explicit confirmation. Those revisions are separate; do not substitute one for the other. Editorial requires the actual article pointer, Editorial root and source revision to match, delegates withdrawal to nPublish, and marks the exact article WITHDRAWN only after owner confirmation. Retain the publication reference and history. If the reply or article status update is uncertain, inspect again and explicitly reconcile the same withdrawn request; never replay automatically. Verify that public article delivery returns HTTP 404, rather than an authorization denial or server failure.\n\nEditorial validation, readiness and review submission inspect the saved exact article revision, saved localized copy and current active content-type policy on the Staged runtime under the original employee and tenant. Save edits before validating. Caller-supplied copy, status, required-language policy and workflow selection cannot replace owner evidence. Required saved translations remain blocking. Validation marks only an eligible exact revision READY after an acknowledged conditional state update. Review uses the owner workflow and exact Process instance identity; if Process accepted but the article changed before IN_REVIEW was confirmed, inspect the exact instance and saved article before continuing. Readiness is read-only and separately reports the inspected revision and article status. Atomic draft commands are described separately below.\n\nEditorial News and Blog content-type policies are reference data that govern saved Staged authoring. In Data Exchange, Initialization data, validate and install Editorial foundations before validating dependent articles. The exact release remains editorial:init-v001 with its declared reference lifecycle and source hashes. Content-type authoring remains Staged-only through the shared allowedStages metadata, independently of publication-required article and translation sources. Online projections remain read-only, and policy installation never approves or publishes content. Missing or inactive current policy blocks validation and review; browser-supplied policy cannot replace it.\n\nEditorial editing uses owner draft commands. Create supplies DRAFT revision 1 after checking authorized websites, authors and an active saved content type. Save atomically advances the article and all saved translations to one new business revision under the original employee and tenant; incomplete translations remain drafts and required languages still block review. Save clears previous review correlation while retaining the exact publication reference and its source revision. Save does not publish or withdraw content. The editor preserves unsaved copy through preview, blocks lifecycle actions while dirty, confirms discarding edits and inspects uncertain original commands without replay. Unknown inspection evidence does not prove failure. Unsupported structured bodies remain read-only and unchanged extension fields are preserved. Archive requires the exact saved revision and refuses a retained Online publication. Review and publication continue through Process and nPublish; withdrawing an older Online copy preserves newer working copy. Configure inert English/Arabic presentation through Editorial properties or the matching CMS component override. Generic article updates and localization writes are unavailable to HTTP clients; governed source import retains its explicit Staged path. Native source-frozen acceptance and multi-row Online deployment/rollback qualification remain separate from isolated draft command tests.\n\nAtomic Online Editorial publication switches the complete website and language set, URL claims, article pointer and original operation receipt in one qualified database transaction. Staged requires its configured distinct Online owner and never substitutes local writes. The target uses existing receipt ownership and managed concurrency, not another publication lifecycle or journal. Original activation keys retain predecessor version and revision, including zero for an absent pointer; lost acknowledgements are inspected against the original durable receipt. Historical completion is separate from current visibility, and UNKNOWN does not prove failure. Rollback restores the complete retained predecessor, refuses intervening article or URL owners and explicitly withdrawn copy, and reaches the actual Online transport. Exact older-request withdrawal preserves newer published content. Before lifecycle effects, the saved source claims a bounded publication request code and source revision; draft save and archive cannot change that source while confirmation is pending. The previous Online reference remains available. Explicit resume continues the same request; failed lifecycle recovery belongs to nPublish. Confirmed Online and source completion clear the pending descriptor. Public delivery enforces active current content, trusted website and language, embargo and publication windows; component filters cannot override visibility, denied reads are unavailable evidence and duplicate slugs are ambiguous. Isolated failure and concurrency checks do not establish native or final fresh-start acceptance. Never insert, update or repair source, projections or receipts directly in the database.\n\nSubmitting a newer saved revision for Editorial review preserves the exact older publication reference and its source revision. Only review status and workflow correlation change. The older Online copy remains independently inspectable and withdrawable; submission neither withdraws it nor removes that reference. A body-supplied pointer cannot replace the actual saved owner reference. Complete review and publication through the normal owner APIs; never restore a lost reference by editing database records.\n\nRollback and withdrawal recovery preserves the original operation captured in the nPublish transition journal. Qualified failures resume that same target receipt across advancing lifecycle revisions; activation failures retain their normal validation and approval rules. Inspect before an explicit retry, and never infer failure from a lost response. The Editorial workspace separately identifies current deployment, verified absence or unknown evidence while retaining latest article publication history. After rollback, inspect and withdraw the owner-proven restored request without rewriting newer working copy. Archive is held while a copy is deployed or deployment absence is unverified. Deployment does not override embargo, dates or access rules. All changes continue through owner APIs, scoped credentials, normal Process approval and transactional generated services; never repair business records directly in the database.\n\nThe publication request workspace offers only owner-qualified recovery operations that also pass current BackOffice permission filtering. Preparation rereads the original request; explicit confirmation sends its inspected publication revision. Revalidation is not approval or delivery. Qualified rollback checks current target evidence and preserves intervening publications. Missing original command evidence and unknown responses remain held for inspection, with no automatic replay, credential changes or database repairs. Actor, source and access changes retire prepared evidence. For an Editorial draft with verified no deployed copy, withdrawal controls are omitted while history remains available; a retained rolled-back request is inspectable history, not another withdrawal to perform.\n\nA renewed activation of an identical current immutable Editorial copy retains already-matching same-publication route claims without inventing a timestamp change. The distinct original activation receipt and article head still change through the managed transactional owner. Foreign URL claims, changed immutable copy and intervening publications remain fenced. A zero-modified response never becomes a fabricated revision advance. These same-instant guarantees are qualified through composed managed-owner tests, without changing live source statuses or database records.\n\nBusiness navigation keeps publication history separate from current working copy and delivery. Explicit request selection records its admitted source and reference in the URL; browser Back/Forward retires previous private command evidence without replay. Editorial publications link to the admitted all-types working article search only when one available Staged origin matches the publication source. Missing or ambiguous origins do not fall back to another runtime. Canonical Editorial Content retains the same permission-filtered actions as News and Blogs. Exact workflow handoffs show their selected timeline before the recent instance list. Initial owner reads do not describe unloaded translations as missing, command progress distinguishes archive from draft saving, and closing confirmation retains the reviewed intent. Qualified Online history checks current target evidence even without a predecessor; stored publication state alone is not proof of current public delivery. These changes add no permission, approval shortcut, direct database mutation or automatic recovery.\n\nArticle image intake uses an Editorial-configured Media purpose and inert English/Arabic copy. Media owns the current safe contexts, file-specific policy and original upload inspection. Review the selected image, explicitly upload once, then separately use the confirmed asset and save the article. The browser accepts only an exact positive persisted receipt or matching versioned byte inspection. Unconfirmed responses preserve the original Media reference and never automatically resend, replace an asset or claim publication. Nonversioned inspection does not prove byte reuse. Busy article commands and callbacks from a retired private source are held. Customize the existing Editorial purpose and Media policies without hardcoded customer folders, copied storage registries, new grants, direct database writes or publication shortcuts.\n\n## Review frozen documentation before approval\n\nA CMS approval task shows the exact frozen documentation article body alongside its target route, dependency pins and comparison with the retained Online snapshot. Headings, paragraphs, lists, tables, examples and diagram source are projected as plain text. Media references remain governed identities; the review never loads provider URLs or executes markup.\n\nThe body projection is bounded to 40,000 characters per article within the shared review budget. Unsupported blocks or exceeded bounds set the explicit truncated flag. Inspect complete source evidence before approving a truncated review. A title or a successful import alone is not evidence that the article body was reviewed.\n\nUse the normal Process task and current CMS reviewer permission. The publisher cannot bypass approval by changing a lifecycle field, and a closed or unrelated task cannot read the frozen body. Later draft edits do not alter the requested revision. Verify the final section, predecessor text, protected fields and the same task identity after a runtime restart.\n\nA selected page can restore its exact predecessor even when that predecessor was published as part of a larger Site release. The Online owner verifies the current pointer and its previous-manifest lineage inside the transaction, restores only the selected delivery scope and preserves sibling routes. It rejects a stale pointer, missing route, different Site or unrelated predecessor. Review of older Site releases without a catalog field uses the exact frozen Site dependency to prove catalog ownership; a latest authoring read cannot supply that proof.\n",
      "previous": {
        "title": "Docs overview",
        "route": "/docs/framework/docs-overview"
      },
      "next": {
        "title": "Nexus Data and Content Guide",
        "route": "/docs/framework/applications-nexus-data-content-guide"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.wcms",
        "technicalModule": "cms",
        "owner": "cms",
        "sourcePath": "data/docs-v001/records/documentation/cmsDocumentationRelease004ComponentData.js",
        "path": "data/docs-v001/records/documentation/cmsDocumentationRelease004ComponentData.js",
        "wordCount": 3758,
        "checksum": "b48577f4c72910e680359cc1b7cf46e778af571209761338eae242451ac52159"
      },
      "slug": "wcms-publishing-lifecycle",
      "locale": "en",
      "navigationGroup": "Content Publication Lifecycle",
      "navigationGroupCode": "content-publication-lifecycle",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "wcms.overview",
          "owner": "wcms"
        },
        {
          "documentId": "docs.overview",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentwcmsCmsSourceMapAuthoringContract",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "wcms.cms-source-map-authoring-contract",
      "title": "CMS Source Map and Authoring Contract",
      "route": "/docs/framework/wcms-cms-source-map-authoring-contract",
      "section": "wcms-and-content-management",
      "sectionTitle": "WCMS and Content Management",
      "group": "wcms-and-content-management",
      "groupTitle": "WCMS and Content Management",
      "parentId": "wcms-and-content-management",
      "hierarchyPath": [
        "WCMS and Content Management",
        "CMS Source Map and Authoring Contract"
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
      "summary": "Exact CMS implementation map for sites, routes, pages, components, renderers, migration, publication manifests, delivery cache, and governance.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "version": "0.0.4",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "wcms.overview",
        "wcms.content-catalog-model",
        "wcms.page-designer-components",
        "wcms.publishing-lifecycle"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "src/schemas/schemas.js",
        "src/service/delivery/defaultCmsDeliveryService.js",
        "src/service/publication/defaultCmsPublicationManifestOrchestrationService.js",
        "data/manifest.json",
        "test/cmsPublicationManifestContract.test.js",
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
        "cms",
        "source-map",
        "authoring",
        "publication-manifest",
        "delivery-cache"
      ],
      "topicKeywords": [
        "WCMS and Content Management",
        "Content Model and Delivery",
        "CMS Source Map and Authoring Contract"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "wcmsCmsSourceMapAuthoringContract-1-source-map",
          "level": 2
        },
        {
          "text": "Content model",
          "anchor": "wcmsCmsSourceMapAuthoringContract-2-content-model",
          "level": 2
        },
        {
          "text": "Authoring contract",
          "anchor": "wcmsCmsSourceMapAuthoringContract-3-authoring-contract",
          "level": 2
        },
        {
          "text": "Publication and delivery",
          "anchor": "wcmsCmsSourceMapAuthoringContract-4-publication-and-delivery",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "wcmsCmsSourceMapAuthoringContract-5-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Operational checks",
          "anchor": "wcmsCmsSourceMapAuthoringContract-6-operational-checks",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "wcmsCmsSourceMapAuthoringContract-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "wcmsCmsSourceMapAuthoringContract-8-verification",
          "level": 2
        },
        {
          "text": "Choose an authorized application before authoring",
          "anchor": "wcms-cms-source-map-authoring-contract-frozen-document-review",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "CMS is the backend authority for sites, pages, routes, templates, slots, components, renderers, content localization, migration, publication manifests, and Online delivery pointers. Axis can offer the business authoring journey, Nexus can render the public website, and Agora can consume storefront content, but CMS owns the data contract. This page gives beginners a precise map of where the implementation lives and gives developers enough detail to customize content safely."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "wcmsCmsSourceMapAuthoringContract-1-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Capability",
            "Exact framework source / operation"
          ],
          "rows": [
            [
              "Schemas and transport",
              "`nodics.wcms/modules/cms/src/schemas/schemas.js`, `nodics.wcms/modules/cms/src/router/routers.js`: model and permission contracts."
            ],
            [
              "Designer authoring",
              "`nodics.wcms/modules/cms/src/service/designer/defaultCmsDesignerCompositionService.js`: getAuthoringModel, validateDraftComposition, saveDraftComposition, assignRoute, assignNavigation. Saves use existing generated CMS services, not a second content store."
            ],
            [
              "Delivery",
              "`nodics.wcms/modules/cms/src/service/delivery/defaultCmsDeliveryService.js`: resolvePage, resolvePublishedManifest, resolveRoute and projectComponent; publication-enabled and legacy delivery paths are distinct."
            ],
            [
              "Manifest orchestration",
              "`nodics.wcms/modules/cms/src/service/publication/defaultCmsPublicationManifestOrchestrationService.js`: buildSnapshot, persist, importManifest, activate, withdraw."
            ],
            [
              "Migration",
              "`nodics.wcms/modules/cms/src/service/migration/defaultCmsMigrationService.js`: previewMigration, applyMigration, rollbackMigration."
            ],
            [
              "Cache invalidation",
              "`nodics.wcms/modules/cms/src/service/delivery/defaultCmsDeliveryCacheInvalidationService.js`: invalidate."
            ],
            [
              "Documentation governance",
              "`nodics.wcms/modules/cms/src/service/documentation/defaultCmsDocumentationGovernanceService.js`: validateAuthoringRecords, renderProjection, search, publicationHandoff."
            ],
            [
              "Governed baseline recovery",
              "`nodics.wcms/modules/cms/src/service/publication/defaultCmsPublicationBaselineService.js`: status, actorRequest, rollback; shared nPublish authority is `nodics.foundation/modules/nPublish/src/service/defaultPublicationLifecycleService.js`."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Content model",
          "anchor": "wcmsCmsSourceMapAuthoringContract-2-content-model"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Site[\"cmsSite\"] --> Route[\"cmsPageRoute\"]\n  Route --> Page[\"cmsPage version\"]\n  Page --> Slot[\"cmsSlot\"]\n  Slot --> Component[\"cmsComponent\"]\n  Component --> Renderer[\"itemRenderer\"]\n  Component --> Media[\"media reference\"]\n  Page --> Localization[\"localized content\"]\n  Route --> Delivery[\"Online delivery pointer\"]"
        },
        {
          "kind": "paragraph",
          "text": "The business value is governed composition. A content administrator should be able to prepare a page in Staged, preview it, request approval, and publish a controlled version. A developer should know which schema owns each object and where to extend validation, delivery, or rendering. An operator should know which publication, cache, and route evidence proves that production is serving the approved version."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Authoring contract",
          "anchor": "wcmsCmsSourceMapAuthoringContract-3-authoring-contract"
        },
        {
          "kind": "paragraph",
          "text": "Release headers target existing CMS schemas; interactive authoring uses Designer composition operations and generated owner services. `validateDraftComposition` normalizes and validates the draft graph without saving. `saveDraftComposition` validates, then saves page, components, localizations, placements and media sequentially, optionally assigns route/navigation, and invalidates delivery afterward. A failure can leave earlier saves present; this is not a transaction across the composition. Inspect saved identities and reread the graph before a bounded replay. Axis availability does not imply every schema has a qualified authoring workbench."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  cms: {\n    pages: {\n      options: {\n        enabled: true,\n        schemaName: 'cmsPage',\n        operation: 'saveAll',\n        dataFilePrefix: 'defaultCmsPageData'\n      },\n      query: { code: '$code', tenant: '$tenant', catalogVersion: '$catalogVersion' }\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The header says where records go. The record says what should exist. The CMS service decides whether the object is valid. The publication workflow decides when it becomes Online. This separation keeps business users, developers, AI tools, and operators from creating parallel authorities."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Publication and delivery",
          "anchor": "wcmsCmsSourceMapAuthoringContract-4-publication-and-delivery"
        },
        {
          "kind": "paragraph",
          "text": "CMS publication starts in Staged. The publication adapter loads the selected root version, resolves dependencies, validates graph limits, builds a deterministic manifest, includes media references, and sends the manifest to the Online target. The target imports the manifest, validates integrity, activates delivery scopes, and invalidates the relevant delivery cache. Staged must not write Online storage directly."
        },
        {
          "kind": "paragraph",
          "text": "With cms.publication.enabled, resolvePage delegates to resolvePublishedManifest and the active Online snapshot; component projection applies localization/renderer hints. The legacy non-publication path instead resolves active route/page/generated records, and employee shared composition refuses that path with ERR_CMS_00090. Do not claim every configured resolver enforces an Online pointer: production deployment must select and verify governed publication delivery. Nexus and storefront consumers should surface unavailable content safely, not invent an approved page."
        },
        {
          "kind": "paragraph",
          "text": "Designer save calls invalidateDelivery after the composition succeeds. The cache invalidation owner delegates tenant-scoped configured delivery resource names to nCache, defaulting to resolvePublicPage and resolveAuthenticatedPage. If cache.invalidateResource is absent it resolves successfully without cache work. Invalidation is not proof that a remote CDN, browser cache or every consumer has refreshed; inspect the active manifest/pointer and the delivered page revision separately after activation. A partial authoring failure may occur before the invalidation call."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "wcmsCmsSourceMapAuthoringContract-5-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Developers can customize CMS by adding schemas, item renderers, composition rules, validation handlers, migration adapters, or publication adapters. The extension should live in the owning module or customer project and should add tests beside the capability it changes. Business users should see the result as new fields, components, page templates, workflow states, or validation messages in Axis."
        },
        {
          "kind": "paragraph",
          "text": "When adding a component type, define the renderer, allowed properties, localization behavior, media relation behavior, authoring validation, and publication dependency collection. When adding a migration path, define source classification, mapping rules, conflict behavior, partial failure handling, and retry evidence."
        },
        {
          "kind": "paragraph",
          "text": "For migration, POST /migration/preview computes changes and manualActions against current state; inspect conflicts and manual work before authorizing apply. POST /migration/apply recomputes the preview, persists an APPLYING audit with before-images, applies changes sequentially, then records APPLIED or NO_CHANGES; an error records FAILED with a redacted diagnostic. Manual actions are counted, not automatically repaired or necessarily an apply blocker. Preview is not a frozen approval token and apply is not all-or-nothing. Protect concurrent edits and capture the audit code and correlation before deciding whether to resume or recover."
        },
        {
          "kind": "paragraph",
          "text": "POST /migration/rollback requires cmsMigration.auditCode and a stored snapshot, reverses snapshot changes in reverse order (remove CREATE; update prior values for UPDATE), then records ROLLED_BACK; repeating an already rolled-back audit is idempotent. Missing audit/snapshot blocks recovery. This does not promise removal of every newly introduced field, restoration of concurrent edits, physical Media recovery, or atomic multi-record rollback. The routes require their distinct cms.migration.preview/apply/rollback permissions and runtime administrator group; source migration, publication approval, and Online pointer rollback are separate operations."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational checks",
          "anchor": "wcmsCmsSourceMapAuthoringContract-6-operational-checks"
        },
        {
          "kind": "table",
          "headers": [
            "Check",
            "Owner operation",
            "What it does not prove"
          ],
          "rows": [
            [
              "Authoring graph",
              "Designer validation and saved CMS identities; inspect partial saves.",
              "No implicit Online activation or composition-wide atomicity."
            ],
            [
              "Documentation pack readiness",
              "validateAuthoringRecords returns READY/BLOCKED after hierarchy, access, visuals, publication/search coverage and checksum checks.",
              "READY is editorial/record validation, not import, approval or execution."
            ],
            [
              "Documentation projection/handoff",
              "renderProjection/search apply governed projection rules; publicationHandoff describes the owner handoff.",
              "Neither creates a frontend publication authority."
            ],
            [
              "Delivery activation",
              "Manifest import/activation and exact current delivery pointer.",
              "Metadata alone does not prove every Media byte or external cache is ready."
            ],
            [
              "Recovery",
              "Migration audit for data changes; baseline status and prior immutable publication for Online rollback.",
              "These are different recovery scopes; see `wcms.publishing-lifecycle` Running example."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "wcmsCmsSourceMapAuthoringContract-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Creating components without renderer or media dependency rules.",
            "Adding a route without an active page version.",
            "Treating a Staged preview as Online publication.",
            "Putting logic or environment-specific URLs into data record files.",
            "Updating Nexus or Agora to hide a CMS data problem instead of fixing CMS authoring, import, or publication."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "wcmsCmsSourceMapAuthoringContract-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run CMS contract tests for authoring, delivery, migration, publication manifest, workflow callbacks, localization, and storefront delivery. Then run a fresh-schema import, publish a sample page, open the consuming application in the browser, and prove that production delivery reads an active Online manifest with the expected page, component, media, and route evidence."
        },
        {
          "kind": "paragraph",
          "text": "When inspecting CMS source records in Schema Workbench, keep the code and source version visible together. Different immutable revisions can share one business code. Owner default columns place these identities before descriptive fields. Existing operator column preferences remain respected; use Grid settings to reset to current owner defaults. Workbench presentation does not authorize generic updates or replace Page Designer and governed publication."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Choose an authorized application before authoring",
          "anchor": "wcms-cms-source-map-authoring-contract-frozen-document-review"
        },
        {
          "kind": "paragraph",
          "text": "The Designer reads available websites, content catalogs, templates and component types from the current enterprise. Optional Site and Catalog selectors must identify an owned pair; missing, conflicting and foreign application selections are refused."
        },
        {
          "kind": "paragraph",
          "text": "Application hints cannot supply authority. A configured draft default appears only when its website, catalog, template, page type and slots are available in the current metadata. Component kind hints require an available type. Empty tenants never inherit Nexus references."
        },
        {
          "kind": "paragraph",
          "text": "Generic behavior remains in the CMS Framework module. Accelerators own their application-specific form hints, and Kickoff supplies only intentional project or environment selections."
        }
      ],
      "searchText": "# CMS Source Map and Authoring Contract\n\nCMS is the backend authority for sites, pages, routes, templates, slots, components, renderers, content localization, migration, publication manifests, and Online delivery pointers. Axis can offer the business authoring journey, Nexus can render the public website, and Agora can consume storefront content, but CMS owns the data contract. This page gives beginners a precise map of where the implementation lives and gives developers enough detail to customize content safely.\n\n## Source map\n\n| Capability | Exact framework source / operation |\n| --- | --- |\n| Schemas and transport | `nodics.wcms/modules/cms/src/schemas/schemas.js`, `nodics.wcms/modules/cms/src/router/routers.js`: model and permission contracts. |\n| Designer authoring | `nodics.wcms/modules/cms/src/service/designer/defaultCmsDesignerCompositionService.js`: getAuthoringModel, validateDraftComposition, saveDraftComposition, assignRoute, assignNavigation. Saves use existing generated CMS services, not a second content store. |\n| Delivery | `nodics.wcms/modules/cms/src/service/delivery/defaultCmsDeliveryService.js`: resolvePage, resolvePublishedManifest, resolveRoute and projectComponent; publication-enabled and legacy delivery paths are distinct. |\n| Manifest orchestration | `nodics.wcms/modules/cms/src/service/publication/defaultCmsPublicationManifestOrchestrationService.js`: buildSnapshot, persist, importManifest, activate, withdraw. |\n| Migration | `nodics.wcms/modules/cms/src/service/migration/defaultCmsMigrationService.js`: previewMigration, applyMigration, rollbackMigration. |\n| Cache invalidation | `nodics.wcms/modules/cms/src/service/delivery/defaultCmsDeliveryCacheInvalidationService.js`: invalidate. |\n| Documentation governance | `nodics.wcms/modules/cms/src/service/documentation/defaultCmsDocumentationGovernanceService.js`: validateAuthoringRecords, renderProjection, search, publicationHandoff. |\n| Governed baseline recovery | `nodics.wcms/modules/cms/src/service/publication/defaultCmsPublicationBaselineService.js`: status, actorRequest, rollback; shared nPublish authority is `nodics.foundation/modules/nPublish/src/service/defaultPublicationLifecycleService.js`. |\n\n## Content model\n\n```mermaid\nflowchart TD\n  Site[\"cmsSite\"] --> Route[\"cmsPageRoute\"]\n  Route --> Page[\"cmsPage version\"]\n  Page --> Slot[\"cmsSlot\"]\n  Slot --> Component[\"cmsComponent\"]\n  Component --> Renderer[\"itemRenderer\"]\n  Component --> Media[\"media reference\"]\n  Page --> Localization[\"localized content\"]\n  Route --> Delivery[\"Online delivery pointer\"]\n```\n\nThe business value is governed composition. A content administrator should be able to prepare a page in Staged, preview it, request approval, and publish a controlled version. A developer should know which schema owns each object and where to extend validation, delivery, or rendering. An operator should know which publication, cache, and route evidence proves that production is serving the approved version.\n\n## Authoring contract\n\nRelease headers target existing CMS schemas; interactive authoring uses Designer composition operations and generated owner services. `validateDraftComposition` normalizes and validates the draft graph without saving. `saveDraftComposition` validates, then saves page, components, localizations, placements and media sequentially, optionally assigns route/navigation, and invalidates delivery afterward. A failure can leave earlier saves present; this is not a transaction across the composition. Inspect saved identities and reread the graph before a bounded replay. Axis availability does not imply every schema has a qualified authoring workbench.\n\n```js\nmodule.exports = {\n  cms: {\n    pages: {\n      options: {\n        enabled: true,\n        schemaName: 'cmsPage',\n        operation: 'saveAll',\n        dataFilePrefix: 'defaultCmsPageData'\n      },\n      query: { code: '$code', tenant: '$tenant', catalogVersion: '$catalogVersion' }\n    }\n  }\n};\n```\n\nThe header says where records go. The record says what should exist. The CMS service decides whether the object is valid. The publication workflow decides when it becomes Online. This separation keeps business users, developers, AI tools, and operators from creating parallel authorities.\n\n## Publication and delivery\n\nCMS publication starts in Staged. The publication adapter loads the selected root version, resolves dependencies, validates graph limits, builds a deterministic manifest, includes media references, and sends the manifest to the Online target. The target imports the manifest, validates integrity, activates delivery scopes, and invalidates the relevant delivery cache. Staged must not write Online storage directly.\n\nWith cms.publication.enabled, resolvePage delegates to resolvePublishedManifest and the active Online snapshot; component projection applies localization/renderer hints. The legacy non-publication path instead resolves active route/page/generated records, and employee shared composition refuses that path with ERR_CMS_00090. Do not claim every configured resolver enforces an Online pointer: production deployment must select and verify governed publication delivery. Nexus and storefront consumers should surface unavailable content safely, not invent an approved page.\n\nDesigner save calls invalidateDelivery after the composition succeeds. The cache invalidation owner delegates tenant-scoped configured delivery resource names to nCache, defaulting to resolvePublicPage and resolveAuthenticatedPage. If cache.invalidateResource is absent it resolves successfully without cache work. Invalidation is not proof that a remote CDN, browser cache or every consumer has refreshed; inspect the active manifest/pointer and the delivered page revision separately after activation. A partial authoring failure may occur before the invalidation call.\n\n## Customization and extension guidance\n\nDevelopers can customize CMS by adding schemas, item renderers, composition rules, validation handlers, migration adapters, or publication adapters. The extension should live in the owning module or customer project and should add tests beside the capability it changes. Business users should see the result as new fields, components, page templates, workflow states, or validation messages in Axis.\n\nWhen adding a component type, define the renderer, allowed properties, localization behavior, media relation behavior, authoring validation, and publication dependency collection. When adding a migration path, define source classification, mapping rules, conflict behavior, partial failure handling, and retry evidence.\n\nFor migration, POST /migration/preview computes changes and manualActions against current state; inspect conflicts and manual work before authorizing apply. POST /migration/apply recomputes the preview, persists an APPLYING audit with before-images, applies changes sequentially, then records APPLIED or NO_CHANGES; an error records FAILED with a redacted diagnostic. Manual actions are counted, not automatically repaired or necessarily an apply blocker. Preview is not a frozen approval token and apply is not all-or-nothing. Protect concurrent edits and capture the audit code and correlation before deciding whether to resume or recover.\n\nPOST /migration/rollback requires cmsMigration.auditCode and a stored snapshot, reverses snapshot changes in reverse order (remove CREATE; update prior values for UPDATE), then records ROLLED_BACK; repeating an already rolled-back audit is idempotent. Missing audit/snapshot blocks recovery. This does not promise removal of every newly introduced field, restoration of concurrent edits, physical Media recovery, or atomic multi-record rollback. The routes require their distinct cms.migration.preview/apply/rollback permissions and runtime administrator group; source migration, publication approval, and Online pointer rollback are separate operations.\n\n## Operational checks\n\n| Check | Owner operation | What it does not prove |\n| --- | --- | --- |\n| Authoring graph | Designer validation and saved CMS identities; inspect partial saves. | No implicit Online activation or composition-wide atomicity. |\n| Documentation pack readiness | validateAuthoringRecords returns READY/BLOCKED after hierarchy, access, visuals, publication/search coverage and checksum checks. | READY is editorial/record validation, not import, approval or execution. |\n| Documentation projection/handoff | renderProjection/search apply governed projection rules; publicationHandoff describes the owner handoff. | Neither creates a frontend publication authority. |\n| Delivery activation | Manifest import/activation and exact current delivery pointer. | Metadata alone does not prove every Media byte or external cache is ready. |\n| Recovery | Migration audit for data changes; baseline status and prior immutable publication for Online rollback. | These are different recovery scopes; see `wcms.publishing-lifecycle` Running example. |\n\n## Common mistakes\n\n- Creating components without renderer or media dependency rules.\n- Adding a route without an active page version.\n- Treating a Staged preview as Online publication.\n- Putting logic or environment-specific URLs into data record files.\n- Updating Nexus or Agora to hide a CMS data problem instead of fixing CMS authoring, import, or publication.\n\n## Verification\n\nRun CMS contract tests for authoring, delivery, migration, publication manifest, workflow callbacks, localization, and storefront delivery. Then run a fresh-schema import, publish a sample page, open the consuming application in the browser, and prove that production delivery reads an active Online manifest with the expected page, component, media, and route evidence.\n\nWhen inspecting CMS source records in Schema Workbench, keep the code and source version visible together. Different immutable revisions can share one business code. Owner default columns place these identities before descriptive fields. Existing operator column preferences remain respected; use Grid settings to reset to current owner defaults. Workbench presentation does not authorize generic updates or replace Page Designer and governed publication.\n\n## Choose an authorized application before authoring\n\nThe Designer reads available websites, content catalogs, templates and component types from the current enterprise. Optional Site and Catalog selectors must identify an owned pair; missing, conflicting and foreign application selections are refused.\n\nApplication hints cannot supply authority. A configured draft default appears only when its website, catalog, template, page type and slots are available in the current metadata. Component kind hints require an available type. Empty tenants never inherit Nexus references.\n\nGeneric behavior remains in the CMS Framework module. Accelerators own their application-specific form hints, and Kickoff supplies only intentional project or environment selections.\n",
      "previous": {
        "title": "Axis Setup and User-Safe Error Contracts",
        "route": "/docs/framework/applications-axis-setup-error-contracts"
      },
      "next": {
        "title": "Media Operations Runbook",
        "route": "/docs/framework/wcms-media-operations-runbook"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.wcms",
        "technicalModule": "cms",
        "owner": "cms",
        "sourcePath": "data/docs-v001/records/documentation/cmsDocumentationRelease004ComponentData.js",
        "path": "data/docs-v001/records/documentation/cmsDocumentationRelease004ComponentData.js",
        "wordCount": 1316,
        "checksum": "a378f66da9e6f633ec5078af80282e9859f9b821a8f7c0f1442681e7810b9db9"
      },
      "slug": "wcms-cms-source-map-authoring-contract",
      "locale": "en",
      "navigationGroup": "Content Model and Delivery",
      "navigationGroupCode": "content-model-and-delivery",
      "navigationGroupOrder": 10,
      "navigationOrder": 50,
      "references": [
        {
          "documentId": "wcms.overview",
          "owner": "wcms"
        },
        {
          "documentId": "wcms.content-catalog-model",
          "owner": "wcms"
        },
        {
          "documentId": "wcms.page-designer-components",
          "owner": "wcms"
        },
        {
          "documentId": "wcms.publishing-lifecycle",
          "owner": "cms"
        }
      ]
    },
    "active": true
  }
};
