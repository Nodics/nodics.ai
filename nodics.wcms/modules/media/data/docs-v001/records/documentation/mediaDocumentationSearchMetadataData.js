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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagewcmsmediamanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagewcmsMediaManagement",
    "title": "Media management",
    "summary": "Governed upload, storage policy, media metadata, source contexts, and safe frontend boundaries.",
    "searchText": "Media management Governed upload, storage policy, media metadata, source contexts, and safe frontend boundaries. media-management media-lifecycle-and-storage media-management",
    "keywords": [
      "media-management",
      "media-lifecycle-and-storage",
      "media-management"
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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagewcmsmediastoragedelivery",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagewcmsMediaStorageDelivery",
    "title": "Media Storage and Delivery",
    "summary": "Provider, access, URL, cache, and browser delivery model for media used by content and storefront experiences.",
    "searchText": "Media Storage and Delivery Provider, access, URL, cache, and browser delivery model for media used by content and storefront experiences. media-management media-lifecycle-and-storage media-management",
    "keywords": [
      "media-management",
      "media-lifecycle-and-storage",
      "media-management"
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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagewcmsmediaimportpublication",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagewcmsMediaImportPublication",
    "title": "Media Import and Publication",
    "summary": "Complete content-pack preparation for media assets, media records, page references, and Online publication.",
    "searchText": "Media Import and Publication Complete content-pack preparation for media assets, media records, page references, and Online publication. media-management media-lifecycle-and-storage media-management",
    "keywords": [
      "media-management",
      "media-lifecycle-and-storage",
      "media-management"
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
  "record3": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagewcmsmediaoperationsrunbook",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagewcmsMediaOperationsRunbook",
    "title": "Media Operations Runbook",
    "summary": "Operational contract for media import hydration, storage providers, publication transfer, DR replication, cleanup lifecycle, and browser delivery evidence.",
    "searchText": "Media Operations Runbook Operational contract for media import hydration, storage providers, publication transfer, DR replication, cleanup lifecycle, and browser delivery evidence. media storage-provider publication-transfer asset-hydration disaster-recovery",
    "keywords": [
      "media",
      "storage-provider",
      "publication-transfer",
      "asset-hydration",
      "disaster-recovery"
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
  "record4": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatawcmsmediamanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatawcmsMediaManagement",
    "title": "Media management",
    "summary": "Governed upload, storage policy, media metadata, source contexts, and safe frontend boundaries.",
    "searchText": "Media management Governed upload, storage policy, media metadata, source contexts, and safe frontend boundaries. # Media management\n\nMedia Management explains how Nodics stores, relates, publishes, and delivers images and files used by Nexus, Agora, Axis, documentation, and other business experiences. This page is the overview. Detailed asset storage and publication journeys live in the sibling topics.\n\n## Media model\n\n```mermaid\nflowchart LR\n  Source[\"Module or Axis upload\"] --> Asset[\"Physical asset\"]\n  Source --> Media[\"Media record\"]\n  Media --> Usage[\"Page, article, product, or component\"]\n  Usage --> Publish[\"Staged to Online\"]\n  Publish --> Delivery[\"Frontend delivery\"]\n```\n\n| Area | Rule |\n| --- | --- |\n| Physical asset | Must be present, copyable, and tied to the owning module or upload source. |\n| Media record | Must describe business meaning, visibility, and usage context. |\n| Publication | Must move media data and referenced assets together. |\n| Frontend | Must render backend-published media or a deliberate fallback state. |\n\n## Business perspective\n\nFor business users, media is part of the customer experience. A banner, blog image, product image, documentation screenshot, or news asset should not appear by accident or disappear after publishing. Axis should make the media status clear: uploaded, related to content, staged, approved, online, retired, or missing.\n\n## Developer perspective\n\nDevelopers should not bury storefront images in frontend-only folders when the image is business content. Module-owned seed media belongs with module data and must be imported with the related content pack. Runtime uploads need media records, storage provider behavior, access rules, and delivery URLs that match the site and tenant.\n\n## Continue with\n\n- **Media Storage and Delivery** for provider selection, URL generation, access, and runtime delivery behavior.\n- **Media Import and Publication** for seed assets, content packs, media object creation, publication, and fresh-schema verification.\n- **WCMS Content Management** for pages, content areas, and components that use media.\n\n## Operational evidence\n\nThe page should show how a user proves media is not only configured but actually usable. Evidence includes the source module or upload owner, the media code, the related content item, the active provider, the resolved delivery URL, and the browser result. For project customization, add the exact place where the customer changes the provider, asset source, access rule, or validation rule. That evidence matters because media problems usually appear as broken customer pages, not obvious backend errors.\n\n## Reader and implementation contract\n\nA beginner should understand that media is both a file and a governed record. A business user should know why an image is visible, unpublished, retired, or missing. A developer should know where the source asset lives, which media record represents it, which content item references it, and which provider delivers it. An operator should know how to inspect physical availability, Online state, access mode, and browser loading errors.\n\nEvery media topic must include source ownership, storage provider, media record fields, usage relation, visibility, publication behavior, fallback state, and browser verification. If a customer can replace or upload the asset from Axis, the page must also explain permissions, validation, size constraints, and rollback.\n\nThis extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior.\n\n## Common mistakes\n\n- Importing content data without the referenced media records and files.\n- Keeping business images hardcoded in Nexus or Agora source.\n- Publishing a page without validating media delivery in the browser.\n- Documenting a media use case without storage provider and access rules.\n\n## Verification\n\nVerify media by checking the physical asset, media record, usage relation, publication state, frontend URL, browser rendering, and missing-asset fallback. A beginner should understand why the image appears; a developer should know where it comes from; an operator should know how to diagnose it.\n\nCustomer photo operations preserve the authenticated customer bearer header when resolving the canonical owner through Profile. Missing credentials or a tenant mismatch are rejected; request-body credentials are never trusted. Runtime service credentials must not substitute for the customer session in this lookup.\n",
    "keywords": [
      "media-management",
      "media-lifecycle-and-storage",
      "media-management",
      "Media Management",
      "Media Lifecycle and Storage",
      "Media management"
    ],
    "facets": {
      "section": "media-management",
      "group": "media-management",
      "navigationDepth": 2,
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
  "record5": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatawcmsmediastoragedelivery",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatawcmsMediaStorageDelivery",
    "title": "Media Storage and Delivery",
    "summary": "Provider, access, URL, cache, and browser delivery model for media used by content and storefront experiences.",
    "searchText": "Media Storage and Delivery Provider, access, URL, cache, and browser delivery model for media used by content and storefront experiences. # Media Storage and Delivery\n\nMedia Storage and Delivery explains how Nodics serves images and files after they have been registered as media records. It focuses on provider behavior, access control, URL construction, cache behavior, and frontend delivery.\n\n## Delivery flow\n\n```mermaid\nflowchart LR\n  Media[\"Media record\"] --> Provider[\"Storage provider\"]\n  Provider --> Url[\"Delivery URL\"]\n  Url --> Frontend[\"Nexus, Agora, Axis, or Docs\"]\n  Frontend --> Browser[\"Browser render\"]\n```\n\n| Concern | Documentation requirement |\n| --- | --- |\n| Provider | Name local, cloud, or future provider behavior and configuration key. |\n| Path | Explain generated path, module-owned seed path, or upload location. |\n| Access | State whether the asset is public, authenticated, role-scoped, or internal. |\n| Cache | Explain browser, CDN, or application cache invalidation if applicable. |\n| Failure | Show missing, unpublished, forbidden, and retired media behavior. |\n\n## Business perspective\n\nBusiness users care that media appears in the right channel at the right time. A public Nexus hero image, an Agora product image, and an internal Axis document screenshot may have different visibility rules. Documentation must explain the business consequence of changing an image, retiring it, or moving it between public and authenticated delivery.\n\nThe business problem this solves is broken trust: a published page with missing or inaccessible media looks unfinished even when the content records are valid.\n\n## Developer perspective\n\nDevelopers should implement media delivery through a provider contract rather than hardcoded paths. A project can later move from local storage to a cloud provider or secured file gateway if the provider selection, configuration, and URL generation are documented. The media record should be the contract the frontend consumes, not the filesystem path.\n\n## Operator perspective\n\nOperators need a quick path to diagnose broken media. The page should tell them which provider is active, whether the physical artifact exists, whether the media record is Online, whether the page that references it is Online, and whether the frontend is receiving a usable URL.\n\n## Operational evidence\n\nThe documentation should provide enough evidence for a support user to separate provider failure from content failure. Include sample status values, expected HTTP behavior, access mode, and whether the URL is public or generated for an authenticated request. When a provider is replaced in a project layer, document the configuration change and the migration plan for already imported assets. This prevents a future team from changing storage successfully while still breaking every published page that expects older URLs.\n\n## Reader and implementation contract\n\nA beginner should understand that the delivery URL is not the source of truth; the media record and provider contract are. A business user should know whether an asset is safe for public display or limited to authenticated users. A developer should document provider selection, path generation, delivery route, cache policy, and how a different provider can be plugged in later. An operator should know which checks prove the asset is reachable and which failure means record, provider, access, or cache trouble.\n\nThis page must be updated whenever a new provider, access mode, CDN strategy, signed URL rule, or cache invalidation pattern is introduced. The documentation should include diagrams and tables because media failures are easiest to solve when the user can see how record, storage, route, and browser are connected.\n\n## Customization and extension guidance\n\nA project can customize media delivery by replacing the storage provider, changing URL generation, adding signed delivery, or changing cache behavior. Document the configuration key, provider implementation, access rule, migration path, and rollback behavior. The frontend should continue to consume media records and delivery URLs from the backend contract, even when the provider changes.\n\n## Common mistakes\n\n- Treating a static asset path as the media contract.\n- Changing storage provider without documenting migration and rollback.\n- Publishing public pages that reference authenticated-only media.\n- Caching old media after a governed content update.\n\n## Verification\n\nVerify delivery by opening the rendered page, checking image load status, inspecting the media record, confirming access mode, and testing the configured provider. Include browser evidence for business acceptance and API/provider evidence for developer and operator acceptance.\n",
    "keywords": [
      "media-management",
      "media-lifecycle-and-storage",
      "media-management",
      "Media Management",
      "Media Lifecycle and Storage",
      "Media management"
    ],
    "facets": {
      "section": "media-management",
      "group": "media-management",
      "navigationDepth": 2,
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
  "record6": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatawcmsmediaimportpublication",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatawcmsMediaImportPublication",
    "title": "Media Import and Publication",
    "summary": "Complete content-pack preparation for media assets, media records, page references, and Online publication.",
    "searchText": "Media Import and Publication Complete content-pack preparation for media assets, media records, page references, and Online publication. # Media Import and Publication\n\nMedia Import and Publication explains how a content pack prepares a complete site experience, including media files, media records, page references, and Online delivery state. Importing Nexus or Agora data should prepare the whole site, not only text records.\n\n## Import flow\n\n```mermaid\nflowchart TD\n  Pack[\"Content pack\"] --> Assets[\"Module-owned assets\"]\n  Pack --> Records[\"Media and content records\"]\n  Assets --> Staged[\"Staged import\"]\n  Records --> Staged\n  Staged --> Approval[\"Governed approval\"]\n  Approval --> Online[\"Online media and content\"]\n```\n\n## Complete site preparation\n\n| Asset type | What must be imported |\n| --- | --- |\n| Images | Physical file, media record, alt text, usage relation, and visibility. |\n| Blogs and news | Article records, media references, categories, dates, and publication state. |\n| Header and footer | Navigation, branding, links, and any referenced logo media. |\n| Storefront content | Pages, components, content areas, media, and route mapping. |\n\n## Business perspective\n\nWhen an administrator clicks initialize for Nexus or Agora, the expectation is that the business application becomes ready for review. The import should make visible what was created, what is missing, what is waiting for approval, and what will become public after publishing. A customer-friendly unpublished page is acceptable before Online approval; hardcoded demo content is not.\n\n## Developer perspective\n\nDevelopers should keep seed media beside the module that owns the business content, normally under the module data or asset folder. The importer must copy assets, create media records, connect them to pages or business objects, and report failures with enough detail to retry safely. If a customer generates a new corporate site, the installer should copy or generate the right content pack and media assets instead of forcing changes into environment properties.\n\n## Operational evidence\n\nA complete import should leave a trace that business and technical users can both inspect. The evidence should include package version, checksum, target site, target catalog, number of media records, number of physical files copied, missing asset list, publication task, approval decision, and browser route tested after Online activation. If any of those are missing, the import may look successful while the site still fails to render images, articles, or navigation assets for customers.\n\n## Reader and implementation contract\n\nA beginner should understand that content-pack import must prepare a complete experience, not only database rows. A business user should know what becomes ready after import and what still waits for approval. A developer should document the asset folder, manifest, media object, page reference, site, catalog, channel, and importer behavior. An operator should know how to retry import, inspect failures, and prove that Online pages can actually load their media.\n\nThis topic must be kept in sync with Nexus, Agora, documentation, and future accelerator setup. Whenever a module adds blogs, news, banners, product images, logos, or documents, the import documentation must include physical assets, metadata records, relation creation, publication state, and browser evidence.\n\n## Customization and extension guidance\n\nA project can extend media import by adding new seed asset folders, validation rules, content-pack manifests, or post-import checks. Document the owner module, asset path, manifest fields, import command or Axis action, target site, target catalog, and publication dependency. This keeps Nexus, Agora, and future accelerators complete when a customer creates their own content package.\n\n## Common mistakes\n\n- Importing page records while leaving images outside the content pack.\n- Using local environment config to describe customer-specific site media.\n- Showing a storefront header, footer, blogs, or news from frontend defaults when no Online content exists.\n- Marking import successful before media verification is complete.\n\n## Verification\n\nVerify import with a fresh schema. Initialize the content pack, inspect import history, confirm media records and physical files, publish Online, then open the Nexus or Agora page in the browser. A developer should also test missing asset handling and retry behavior.\n",
    "keywords": [
      "media-management",
      "media-lifecycle-and-storage",
      "media-management",
      "Media Management",
      "Media Lifecycle and Storage",
      "Media management"
    ],
    "facets": {
      "section": "media-management",
      "group": "media-management",
      "navigationDepth": 2,
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
  "record7": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatawcmsmediaoperationsrunbook",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatawcmsMediaOperationsRunbook",
    "title": "Media Operations Runbook",
    "summary": "Operational contract for media import hydration, storage providers, publication transfer, DR replication, cleanup lifecycle, and browser delivery evidence.",
    "searchText": "Media Operations Runbook Operational contract for media import hydration, storage providers, publication transfer, DR replication, cleanup lifecycle, and browser delivery evidence. # Media Operations Runbook\n\nMedia has a different lifecycle from normal records because a media object has both metadata and a physical artifact. The record can be declared in a module or project data folder, but the bytes must be copied to the correct storage location before the schema object becomes useful. For beginners, think of media as two linked things: a governed object in the database and a file in managed storage. Both must move from authoring assets to Staged and from Staged to Online before a production page or product can safely render it.\n\n## Business problem\n\nThe business problem is trust in visual and downloadable content. A storefront banner, product image, corporate logo, or document link may look like simple presentation, but a broken file can stop a launch, confuse customers, or make an approved page look unfinished. The media runbook solves that problem by making every physical file traceable from data release to Staged storage, Online storage, delivery URL, and recovery evidence.\n\n## Source map\n\n| Owner operation | Exact framework source |\n| --- | --- |\n| Upload, inspect and version guard | `nodics.wcms/modules/media/src/service/storage/defaultMediaUploadService.js`: inspectUpload, upload. |\n| Provider implementations | `nodics.wcms/modules/media/src/service/storage/provider/defaultLocalMediaStorageProviderService.js`, `defaultNasMediaStorageProviderService.js`, `defaultCloudMediaStorageProviderService.js` in that same directory. |\n| Cleanup and retained lifecycle | `nodics.wcms/modules/media/src/service/storage/defaultMediaCleanupLifecycleService.js`, `defaultMediaLifecycleCoordinationService.js`. |\n| Publication and replication recovery | `nodics.wcms/modules/media/src/service/publication/defaultMediaPublicationTransferService.js`: recordReplicationFailure, replicateAsset, reconcileReplication, retryPendingReplication. |\n| Delivery | `nodics.wcms/modules/media/src/service/storage/defaultMediaDeliveryService.js`. |\n| Import hydration | `nodics.wcms/modules/media/src/service/storage/defaultMediaImportSourceResolverService.js`. |\n\n## Import contract\n\n```mermaid\nsequenceDiagram\n  participant Data as Release data\n  participant Import as nImport\n  participant Resolver as Media source resolver\n  participant Storage as Media storage provider\n  participant Schema as Media schema\n\n  Data->>Import: Header and media record\n  Import->>Resolver: Resolve asset.sourceFile\n  Resolver->>Storage: Copy bytes to Staged storage\n  Storage-->>Import: Return storage key and relative path\n  Import->>Schema: Save media object with managed location\n```\n\nThe data definition is declarative. It can declare `code`, `name`, `folderCode`, `formatCode`, `businessPurpose`, `ownerType`, `ownerReference`, and an `asset.sourceFile` that points inside the release-owned assets folder. It should not declare final storage keys, public URLs, provider-owned paths, or runtime-specific delivery links. Those fields belong to the importer and media runtime.\n\nFor an interactive upload, the transport parses a single file before calling upload with trusted tenant/authData, mediaCode, folderCode and files:[{originalFileName,mimeType,sizeBytes,buffer}]. This is an internal service descriptor, not JSON containing a browser-selected filesystem path. The owner computes checksum and storage coordinates from the bytes; consumers retain the returned media identity, checksum and acknowledged version, not fullPath/storageKey as an authoring instruction.\n\n```js\n// Trusted service-side example after transport file parsing, not a public JSON body.\nconst saved = await SERVICE.DefaultMediaUploadService.upload({\n  tenant: trustedTenant, authData: authorizedActor,\n  mediaCode: 'catalogBanner', folderCode: 'default',\n  files: [{ originalFileName: 'banner.png', mimeType: 'image/png',\n    sizeBytes: parsedBuffer.length, buffer: parsedBuffer }]\n});\n// Read saved.code, saved.checksum, saved.status and (in versioned mode) saved.versionId.\n// Re-upload the same identity only with the current inspected versionId.\n```\n\nIn versioned mode, a first upload requires a save acknowledgement for the exact identity/storageKey and versionId 0. Re-upload requires one unambiguous current record and matching integer versionId; stale/missing/ambiguous metadata returns ERR_MED_00014, and legal hold returns ERR_MED_00019. inspectUpload compares supplied checksum/size/MIME with current metadata and stored bytes; inspect again after a version change. Storage and metadata writes are separate steps, not a promise of atomic file/database commit. After a failed acknowledgement inspect owner evidence before retrying, rather than overwriting with a guessed version.\n\n## Storage and provider model\n\n| Provider / operation | Implemented boundary | Operator qualification |\n| --- | --- | --- |\n| Local | Filesystem-backed implementation under the configured owned root. | Verify permissions, space, path containment, checksum and exact target bytes; local implementation is not production certification. |\n| NAS | Delegates local filesystem operations; health labels SHARED_FILESYSTEM. | Provision and qualify the shared mount yourself. This is not a native NAS protocol client or a proof of distributed locking/failover. |\n| Cloud | Default adapter rejects operations with ERR_MED_00032 and reports NOT_CONFIGURED. | A configured provider label does not install an implementation. Supply and qualify an owner adapter before claiming cloud storage support. |\n| Key strategy | Owner builds managed deterministic coordinates. | Never let data records or public clients dictate final physical paths. |\n| Cleanup | Candidate/approval lifecycle with versioned physical-cleanup guard. | Preview and metadata retirement are not proof that physical deletion is safe. |\n\nConfiguration selects providers and roots, but business data should not change when a provider changes. This keeps customer projects portable across local, Staged, Online, and disaster recovery environments.\n\n## Publication and DR\n\nPublication copies selected source bytes to the Online provider and records target placement; it is not a frontend URL rewrite. Verify source checksum, retained version, primary placement receipt and target bytes separately. PRIMARY_FIRST_WITH_DR_RECONCILIATION may retain primary success while recording DR failure. Strict replication / STRICT_PROD_WITH_DR throws on DR failure, but a prior successful primary copy is not automatically undone.\n\n| Replication evidence | Meaning and recovery |\n| --- | --- |\n| Queue identity | Hash of media code, checksum, manifest identity (or correlation fallback), active location and replication location. Preserve that exact asset/publication identity. |\n| REPLICATION_RETRY_SCHEDULED | Failure record carries retryCount and nextRetryAt (retryDelaySeconds, default 300). Queue persistence is optional: missing queue save service means no durable retry guarantee. |\n| REPLICATION_ESCALATED | retryCount reaches maxRetryAttempts (default 10). Owner intervention must resolve credentials/provider/bytes; do not generate a new publication identity to hide exhaustion. |\n| REPLICATION_SYNCHRONIZED | Successful copy and placement mark the matching queue identity synchronized; inspect receipt and checksum, not only the status label. |\n| retryPendingReplication | Reads due REPLICATION_PENDING/REPLICATION_FAILED/REPLICATION_RETRY_SCHEDULED records, bounded default 100/max 500, increments attempts and retries the exact asset copy. Missing queue service returns ERR_MED_00024. Configure and qualify the scheduling owner; a queue row is not evidence a worker ran. |\n| reconcileReplication | Checks asset bytes/checksum and DR placement, with disabled/retry/escalation outcomes. A missing provider produces ERR_MED_00021; strict policy may fail the publication. |\n\n## Operations\n\nOperators should inspect media import history, storage provider health, reference lookup, publication transfer receipts, cleanup jobs, and delivery responses. A failed image can be caused by missing source bytes, a bad asset manifest entry, storage permission failure, missing media reference, inactive Online object, or route publication missing the media dependency. A safe UI message should explain the visible effect. Technical evidence should carry the media code, release folder, source file, provider code, storage key, checksum, and correlation id.\n\nCleanup sequence: previewCandidates is non-persisting; scan finds eligible retired/expired or retention-expired records and records a candidate with purgeEligibleAt after passive retention (default 30 days). Active references and legal holds defer/block selection. markPassive requires a unique candidate, checks hold and retires metadata before marking PASSIVE; it does not delete bytes. Before physical cleanup, recheck exact retained/publication references and approval with the owning services. The supplied reference-service absence returns false rather than fail-closed, and the purge loop does not atomically recheck every live reference: never treat an empty lookup as universal proof of safe deletion.\n\nrunRetentionCleanup first applies the lifecycle physical-cleanup guard: retained/versioned Media cannot use this destructive cleanup path. For eligible non-versioned PASSIVE/CLEANUP_APPROVED candidates due for purge, approval is required by default; unapproved candidates are skipped. It records CLEANUP_IN_PROGRESS, removes placements, marks CLEANED and metadata DELETED, or records CLEANUP_FAILED per candidate. Provider removals and metadata updates are sequential, not a cross-storage transaction; inspect partial removal before retry. Do not disable the retained guard or delete a current Online asset to clear a cleanup error.\n\nFor delivery failure, start with the public-safe symptom, then inspect exact tenant/media identity, active metadata and access policy, retained version/checksum, source and target placement receipt, physical target read/checksum and delivery route result. READY/Online metadata with missing bytes is not healthy delivery. Do not expose fullPath, credentials or storage errors to public users, and do not repair by pointing Online at Staged bytes. Delivery policy may disable delivery (ERR_MED_00012); legacy metadata lookup must return exactly one allowed-status item. PUBLIC requires publicAccessEnabled; PRIVATE requires policy and an authenticated principal; SIGNED currently refuses delivery because signed-token validation is not configured. Retained Online mode delegates to the retained publication target and uses no-store. Qualify channel access/tenant isolation separately rather than infer it from a URL or provider health.\n\n## Customization and extension guidance\n\nDevelopers can add media formats, folders, storage policies, key strategies, providers, reference lookups, or publication transfer adapters. Keep new business rules in the owning service or policy, not inside seed records. Add tests for upload, import hydration, provider summary, publication transfer, cleanup lifecycle, and delivery. Business users should interact with media through Axis workbenches, while data releases continue to support developer and AI-assisted baselines.\n\n## Common mistakes\n\n- Creating a media record while forgetting the physical file.\n- Putting generated URLs or absolute local paths in release data.\n- Publishing a page without publishing its required media artifacts.\n- Deleting unreferenced files without checking active Online pointers.\n- Treating provider configuration as business data.\n\n## Verification\n\nUse a fresh schema and a clean media storage root. Import a release with media assets, confirm the physical files are copied to Staged, verify media records contain managed paths, publish a page or product that references the media, confirm Online storage receives the file, and open the browser route. Run the media import source resolver, media release hydration, publication transfer, delivery, cleanup lifecycle, and route contract tests before production use.\n",
    "keywords": [
      "media",
      "storage-provider",
      "publication-transfer",
      "asset-hydration",
      "disaster-recovery",
      "Media Management",
      "Media Lifecycle and Storage",
      "Media Operations Runbook"
    ],
    "facets": {
      "section": "media-management",
      "group": "media-management",
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
  }
};
