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
  "nodicsDocsSearchnodenodicsdocsnodepagelocationsharedmapconfiguration": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagelocationsharedmapconfiguration",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagelocationSharedMapConfiguration",
    "title": "Shared Map Configuration and Delivery",
    "summary": "Shared Map Configuration and Delivery: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "searchText": "Shared Map Configuration and Delivery Shared Map Configuration and Delivery: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "keywords": [
      "locationMap",
      "source-backed",
      "ownership",
      "operations"
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
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  },
  "nodicsDocsSearchpagenodicsdocsmetadatalocationsharedmapconfiguration": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatalocationsharedmapconfiguration",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatalocationSharedMapConfiguration",
    "title": "Shared Map Configuration and Delivery",
    "summary": "Shared Map Configuration and Delivery: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "searchText": "Shared Map Configuration and Delivery Shared Map Configuration and Delivery: source-backed behavior, ownership, extension, failure handling and acceptance boundaries. # Shared Map Configuration and Delivery\n\n## Shared authority and reader model\n\nBeginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow.\n\nlocationMap owns the reusable effective map configuration consumed by Axis and customer applications. A usageCode selects presentation context, not a place or access grant. preferredConfiguration rejects multiple non-archived SHARED rows. Without a SHARED row it chooses a legacy AXIS row, preferring one with a distinct fallback provider; multiple such legacy primaries are rejected. Other legacy rows can still be selected by active setup or input order, so the implementation does not reject every possible legacy ambiguity. Saving the same legacy code migrates it in place to SHARED. FALLBACK rows provide alternatives rather than primary settings.\n\nBusiness operators can manage shared configuration without every accelerator copying provider policy. The router declares GET /location/maps/configurations and GET /location/maps/configurations/effective with system.schema.view, and PUT /location/maps/configurations with system.schema.manage; the shared-map narrative contract's workbench permission name differs from this implemented router. Send expectedRevision from the editor: the service checks it against an existing row when supplied, but does not require it. Updates also use the stored revision in the repository predicate. Reload stale edits and inspect uncertain save results; the service does not itself verify the repository's update count. Configuration never grants visibility to private Location or business records.\n\n```mermaid\nflowchart LR\n  Editor[Authorized Axis editor] --> Operation[Location configuration operation]\n  Operation --> Repository[Generated repository and revision]\n  Repository --> Effective[One effective usage configuration]\n  Effective --> Axis[Axis map]\n  Effective --> Public[Allowlisted public projection]\n  Visibility[Independent location visibility] --> Axis\n  Visibility --> Public\n```\n\n## Providers coordinates and safe presentation\n\nA Mapbox client token must start with pk.; sk. tokens are rejected. ACTIVE Mapbox setup without a token is rejected on save, while incomplete setup may be stored and returns configured=false. publicProjection calculates fallbackAllowed from the primary record's status, setupStatus, frontendSafe flag and fallbackPolicy. INACTIVE, INVALID or ARCHIVED primary setup disables fallback permission. This is not full validation of every alternative: fallbackSelection prefers a matching provider row with ACTIVE setup, can otherwise use another matching row, and can synthesize the built-in OSM descriptor. Consumers must honor configured and fallbackAllowed rather than treating the presence of fallbackRenderer as permission to use it. Public token shape does not prove provider-side restrictions, account readiness or network availability.\n\nBusiness records retain named latitude and longitude. The Location adapter converts {latitude:25.2048,longitude:55.2708} to [55.2708,25.2048] only at the provider boundary. It checks numeric bounds but cannot detect a swapped pair that remains in range. Presentation accepts one to twelve unique lowercase category identifiers, labels of one to eighty characters, six-digit hex colors and at most twenty matching terms of up to sixty characters each. Labels are text; the validator does not sanitize arbitrary markup for a renderer. defaultCategoryCode must identify a configured category. Consumers match nondefault categories in order and use that default otherwise; no executable filters belong in this metadata.\n\n| Control | Contract | Failure interpretation |\n| --- | --- | --- |\n| Primary configuration | One non-archived SHARED row per usage | Multiple shared rows fail; legacy AXIS selection has narrower ambiguity checks |\n| Public usage | Explicit publicUsageCodes allowlist | No implicit exposure of every usage |\n| Mapbox token | Public pk token only | Secret token must not reach client |\n| Category list | Maximum twelve unique categories | Reject unsupported presentation |\n| Coordinate order | Named values then provider adapter | Do not persist unlabeled arrays |\n\n## Delivery and user interaction\n\nAuthenticated consumers read GET /location/maps/configurations/effective?usageCode=COLLECTION_CENTRE_MAP. Anonymous consumers read GET /location/maps/configurations/public?usageCode=COLLECTION_CENTRE_MAP only when the server's locationMapConfiguration.publicUsageCodes allows it. Router keys are shown; the installed nRouter base/module prefix must be resolved from deployment. Both paths need trusted runtime tenant context. The browser projection includes contractVersion 1, code, revision, refreshIntervalMs, renderDescriptor, defaultCenter, zoom, enabledControls, presentation and interaction. It intentionally includes the frontend-safe public token and omits private metadata/token references. Refresh defaults to 15000 ms and is clamped to 5000-60000 ms. A missing primary returns setup-required configuration, not proof of a usable map.\n\nWheel behavior supports MODIFIER, FREE and DISABLED. MODIFIER uses Cmd on macOS and Ctrl or Cmd elsewhere, including the first wheel event and its cooldown behavior. This avoids a map trapping page scrolling while preserving intentional zoom. A partner should qualify desktop and mobile interaction with the actual renderer, not infer UX quality from a returned configuration object. Provider attribution, rendering errors and keyboard accessibility also need consumer acceptance. The configuration service does not prove that tiles loaded or that markers are visible.\n\nFor a collection-site map, read the existing editable configuration, retain its code and revision, change the intended fields and save the complete editable payload with expectedRevision. model() supplies defaults for omitted provider, viewport, controls and status values, so PUT is not a generic partial-patch contract. Resolve the effective configuration through the application's read route. Supply markers only from a separately qualified authorized location source: locationProjection has no completed projector or public marker delivery orchestration today. Test permitted primary-provider fallback and independently qualify alternatives. A route or distance display never proves collection arrival.\n\n## Verification and operational recovery\n\nRead and run the coordinate-adapter, provider-configuration and shared-configuration contracts during capability qualification. They cover known coordinate ordering, declared route permissions, shared/legacy selection, stale supplied revisions, private usage denial, secret tokens and declarative presentation. They do not establish installed permissions, atomic repository update outcomes, safe eligibility of every fallback row or browser wheel behavior. A public read denied with ERR_LOCATION_MAP_PUBLIC_USAGE_DENIED requires an intentional operator allowlist decision. A revision conflict requires reload and review. On an uncertain save, read back the existing code/revision before retrying. Provider/rendering failures require effective-configuration and browser investigation without widening Location visibility.\n\n## Customize and extend safely\n\nPrerequisite: an authorized operator has read the current shared row through GET /location/maps/configurations. In Axis Map Configuration, preserve the full row, change repair to label Device repair and color #8033aa, then save with its current expectedRevision. Other consumers of the same usage should receive the changed category on refresh. Reject a duplicate category, color such as red, missing default category, out-of-range wheel step or stale supplied revision. To recover, reload and reapply the intended change; to undo, restore the prior label/color against the latest revision. Verify another consumer and restore the original values after acceptance.\n\nFor a deployment-wide refresh difference, a later-loaded project module can contribute the following complete properties export at modules/customerLocationExtensions/config/properties.js. This changes the default refresh interval when the effective service reads it; it does not create another primary row or change public visibility. Stored presentation overrides remain authoritative for their row. Use the existing shared record for live label/color edits. If overriding validators under src/service/defaultLocationMapPresentationService.js, preserve all category and interaction bounds and test the effective layered implementation.\n\n```javascript\nmodule.exports = {\n    locationMapConfiguration: { refreshIntervalMs: 30000 }\n};\n```\n\nKeep the public-usage allowlist explicit and map renderers local and allowlisted. Run the shared-configuration and provider/coordinate contracts for the intended difference, then qualify refresh, first wheel/modifier events, mobile framing, supported descriptors and attribution in each real consumer. Reverting project source does not undo a stored configuration save; restore that record separately through the secured owner.\n\n## Documentation selection assets and acceptance\n\nPartner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference.\n\nThis guide is canonical CMS data owned by locationMap. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation.\n\nImages belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded.\n\nCanonical authoring begins in DRAFT with an inactive route. After an authorized source editorial review, the owning Component, Node, PageMetadata, SearchMetadata and PublicationState records may move to STAGED and the owning route may be active for subsequent normal publication. STAGED is not approved or published; an active authoring route is only a publication candidate. The release owner must complete release-integrity preparation and validation, governed import, staged inspection and normal owner approvals before publication. Source review does not validate existing checksums, create approval receipts or prove Online delivery or browser acceptance.\n\n## Common mistakes\n\nDo not confuse a helper result with a completed authorized business operation. Do not bypass the owning persistence, publication or recovery contract to clear a dashboard. Do not copy shared behavior into an accelerator or put capability data into a composition-only group. Do not treat fixture output, missing measurement or a passing source test as live qualification. Preserve original evidence and report uncertain outcomes without an automatic replay.\n",
    "keywords": [
      "locationMap",
      "source-backed",
      "ownership",
      "operations"
    ],
    "facets": {
      "section": "accelerators-and-industry-solution-templates",
      "group": "accelerators-and-industry-solution-templates",
      "navigationDepth": 2,
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
      "maturityState": "partial"
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
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  }
};
