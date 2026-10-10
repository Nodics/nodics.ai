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
  "nodicsDocsComponentwcmsExperiencePlacementDelivery": {
    "code": "nodicsDocsComponentwcmsExperiencePlacementDelivery",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "wcms.experience-placement-delivery",
      "title": "WCMS Experience Placement and Delivery",
      "route": "/docs/framework/wcms-experience-placement-delivery",
      "section": "wcms-and-content-management",
      "sectionTitle": "WCMS and Content Management",
      "group": "wcms-and-content-management",
      "groupTitle": "WCMS and Content Management",
      "parentId": "wcms-and-content-management",
      "hierarchyPath": [
        "WCMS and Content Management",
        "WCMS Experience Placement and Delivery"
      ],
      "hierarchyDepth": 2,
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
      "businessAudience": [
        "business user",
        "implementation partner",
        "wcmsExperience capability owner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "WCMS Experience Placement and Delivery: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "version": "0.16.29",
      "maturityState": "partial",
      "implementationState": "source-verified",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "wcms.cms-source-map-authoring-contract",
        "wcms.publishing-lifecycle",
        "discovery.search-indexing",
        "commerce.search-guide"
      ],
      "sourceEvidence": [
        "src/service/defaultWcmsExperienceResolverService.js",
        "src/service/defaultWcmsExperienceProjectionService.js",
        "src/service/defaultWcmsExperiencePublicationIndexingService.js",
        "test/wcmsExperienceResolverContract.test.js",
        "test/wcmsExperiencePublicationIndexingContract.test.js",
        "llm/contracts/experience-governance-contract.md",
        "src/router/routers.js",
        "src/controller/defaultWcmsExperienceDeliveryController.js",
        "src/controller/defaultWcmsExperienceAuthoringController.js",
        "src/schemas/schemas.js",
        "config/properties.js",
        "llm/contracts/developer-implementation-contract.md"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "wcmsExperience",
        "source-backed",
        "ownership",
        "operations"
      ],
      "topicKeywords": [
        "WCMS Experience Placement and Delivery",
        "WCMS and Content Management"
      ],
      "headings": [
        {
          "text": "WCMS Experience Placement and Delivery",
          "anchor": "wcms-experience-placement-delivery",
          "level": 1
        },
        {
          "text": "Placement versus renderable content",
          "anchor": "wcmsExperiencePlacementDelivery-1-placement-versus-renderable-content",
          "level": 2
        },
        {
          "text": "Selection and fallback semantics",
          "anchor": "wcmsExperiencePlacementDelivery-2-selection-and-fallback-semantics",
          "level": 2
        },
        {
          "text": "Projection indexing and deployment qualification",
          "anchor": "wcmsExperiencePlacementDelivery-3-projection-indexing-and-deployment-qualification",
          "level": 2
        },
        {
          "text": "Verification and failure investigation",
          "anchor": "wcmsExperiencePlacementDelivery-4-verification-and-failure-investigation",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "wcms-experience-placement-delivery-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Documentation selection assets and acceptance",
          "anchor": "wcmsExperiencePlacementDelivery-5-documentation-selection-assets-and-acceptance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "wcms-experience-placement-delivery-common-mistakes",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "WCMS Experience Placement and Delivery",
          "anchor": "wcms-experience-placement-delivery"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Placement versus renderable content",
          "anchor": "wcmsExperiencePlacementDelivery-1-placement-versus-renderable-content"
        },
        {
          "kind": "paragraph",
          "text": "Beginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow."
        },
        {
          "kind": "paragraph",
          "text": "wcmsExperience decides when and where an existing CMS component or container appears. cmsExperiencePlacement is the rule and placement entity, not a second renderable-component model. CMS remains content authority, Discovery/Search remains delivery projection authority and Axis is the authoring and preview control plane. Commerce still owns product grids, variants, prices, inventory, filters and pagination. The first vertical slice is a default or collection-targeted product-listing hero; attaching arbitrary Page Designer rules is not implied by that slice."
        },
        {
          "kind": "paragraph",
          "text": "The resolver validates site, pageType, targetType and targetCode after normalization. Omitted target values default to DEFAULT and *, so site and pageType are the minimum useful body; locale, channel and device default to en-US, web and desktop. The request example contract shows all target fields explicitly. Trusted tenant/authentication context comes from the API envelope, not that body. POST /delivery/resolve forces previewMode=false; POST /authoring/preview forces true and requires WCMS_EXPERIENCE_PREVIEW. GET /authoring/index-status requires WCMS_EXPERIENCE_PUBLISH_STATUS. These are module-relative route keys. A direct resolver helper call provides no independent authorization."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  CMS[Canonical components and placements] --> Publish[Governed CMS publication]\n  Publish --> Index[Experience publication indexing]\n  Index --> Discovery[Versioned Discovery projections]\n  Discovery --> Resolver[Bounded placement resolver]\n  Resolver --> Slots[Safe slot component descriptors]\n  Slots --> Consumer[Storefront renderer]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Selection and fallback semantics",
          "anchor": "wcmsExperiencePlacementDelivery-2-selection-and-fallback-semantics"
        },
        {
          "kind": "paragraph",
          "text": "isActivePlacement filters by site, pageType, optional locale/channel/device and validFrom/validTo. Supplied deliveryStatus must be ACTIVE; supplied publicationStatus must match public delivery or STAGED preview. Absent statuses pass, and invalid dates are not explicitly rejected by these comparisons. The resolver normalizes region and customerSegments but does not filter them in this predicate; the projection query can filter region, while fixture results bypass that query. Public and authoring controllers force preview mode, but the helper itself trusts its context. Qualify status provenance and targeting at the owner boundary; arbitrary objects or fixtures are not safe published projections merely because they match."
        },
        {
          "kind": "paragraph",
          "text": "Exact targets override defaults per slot: an exact hero leaves an unrelated default slot available. Ordering is specificity descending, priority descending, updatedAt descending and code ascending. diagnostics.fallbackUsed is true only when no exact placement exists and defaults exist; it can be false while default content remains in other slots. fallbackComponent is carried by indexing but is not used by this selection algorithm. Slot descriptors select placementCode, componentCode, rendererKey, contractVersion, properties and media. properties and media are shallow copies, not recursively sanitized or renderer-allowlisted here. Components are not hydrated from CMS by this helper; a qualified projection must already contain their safe renderable data."
        },
        {
          "kind": "table",
          "headers": [
            "Layer",
            "Implemented seam",
            "Qualification requirement"
          ],
          "rows": [
            [
              "Projection provider",
              "DefaultDiscoveryRuntimeService search",
              "Trusted source and bounded query"
            ],
            [
              "Candidate lookup",
              "Site/page/target/locale/channel query",
              "Correct runtime isolation and indexes"
            ],
            [
              "Fixture fallback",
              "Discovery empty/error uses fixtures unless disabled; missing Discovery/FIXTURE branch always uses fixtures",
              "Disable fallback, keep fixtures absent and qualify provider readiness"
            ],
            [
              "Slot resolution",
              "Exact target overrides fallback per slot",
              "Renderer and preview access checks"
            ],
            [
              "Publication event",
              "DEPLOY, ROLLBACK or WITHDRAW",
              "Actual manifest/index/alias acceptance"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Projection indexing and deployment qualification",
          "anchor": "wcmsExperiencePlacementDelivery-3-projection-indexing-and-deployment-qualification"
        },
        {
          "kind": "paragraph",
          "text": "With provider other than FIXTURE and DefaultDiscoveryRuntimeService.search present, findPlacements queries Discovery by owner/index, CURRENT status, site, pageType, target/default and locale/channel. A region is queried when present. Device is queried only with context.deviceAuthored=true, which normalizeContext does not set; the resolver still applies a placement's device predicate. Search options request page 1 with maxComponents, default 200, and deterministic ordering. There is no pagination loop, final slot cap, depth enforcement or resolver-level cache implementation here: maxSlots, maxDepth and cache defaults are not proof of those guarantees. The public route separately declares caching. Validate positive bounded limits in the effective deployment."
        },
        {
          "kind": "paragraph",
          "text": "fixtureFallbackEnabled=false prevents fixture fallback after a Discovery empty result/error. It does not stop fixturePlacements when provider is FIXTURE or Discovery search is unavailable: shouldUseDiscovery is then false and the fixture branch is unconditional. For authoritative delivery, keep fixturePlacements absent, require a working Discovery seam and explicitly disable fallback. Missing-provider failure is not fail-closed in this helper, so deployment readiness must reject that condition before enabling delivery."
        },
        {
          "kind": "paragraph",
          "text": "Publication indexing accepts CMS_ONLINE_CHANGED with DEPLOY, ROLLBACK or WITHDRAW and skips unsupported events/operations or disabled/FIXTURE deployments. It derives version identity from manifest/event code and a SHA-256 sourceHash from JSON.stringify(payload), saves documents sequentially and attempts alias switching afterward. Save exceptions or returned errors stop the switch. A missing alias provider returns ALIAS_PROVIDER_UNAVAILABLE rather than failing the whole handler; WITHDRAW uses ARCHIVED/INACTIVE payloads and the staged alias template because its context is not the public publication status. These source behaviors require explicit deployment qualification against the governance contract's alias/rollback/withdrawal guarantees."
        },
        {
          "kind": "paragraph",
          "text": "Placement loading first trusts request.cmsExperiencePlacements, then manifest.cmsExperiencePlacements, then queries DefaultCmsExperiencePlacementService for active rows, scoped by site when present and limited by maxComponents. The fallback query is not bound to an immutable manifest version; missing placement service returns an empty list. toProjectionPayload stamps publication context and shallow-copies placement properties/media without hydrating the referenced component. Treat the committed outbox origin, snapshot contents, source-version binding and complete component projection as integration requirements. A helper return or deterministic document code does not prove approved source, collision-free placement identity, index completeness or alias atomicity."
        },
        {
          "kind": "paragraph",
          "text": "For a seasonal collection hero, prepare the CMS component and placement in Staged, review targeting and time bounds, and preview with the authorized employee. Publish through the existing CMS process, inspect the matching indexed snapshot and resolve using the storefront context. Test the default hero when no exact collection rule applies, exact override for the selected slot and withdrawal of the published version. Do not fix missing content by enabling fixture fallback in production or allowing a public caller to request Staged preview. Keep product-listing behavior in Commerce rather than using a CMS placement to redefine product truth."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification and failure investigation",
          "anchor": "wcmsExperiencePlacementDelivery-4-verification-and-failure-investigation"
        },
        {
          "kind": "paragraph",
          "text": "Read and run resolver, fallback, projection-adapter, governance, publication-indexing, module and route-security contracts for capability qualification. Extend deployment acceptance to missing statuses, invalid dates, region/segment targeting, missing Discovery with fallback disabled, actual query caps, missing alias provider and withdrawal alias behavior. Existing doubles do not qualify those integrations. If indexing fails, preserve the committed event and inspect its manifest, saved projections and actual alias before an owner-governed replay. If alias result is skipped or withdrawal leaves old public results, treat delivery as unqualified rather than claiming successful publication. Never repair delivery with broad CMS scans or copied Staged payloads."
        },
        {
          "kind": "heading",
          "text": "Customize and extend safely",
          "anchor": "wcms-experience-placement-delivery-customize-and-extend-safely",
          "level": 2
        },
        {
          "kind": "paragraph",
          "text": "Prerequisites: a project-owned CMS component and supported renderer, governed default/collection placements, a qualified Discovery provider and an employee with preview permission. Keep content and placement records in the customer's business release under modules/customerExperience/data/<business-release>/records/cms/customerExperiencePlacementData.js, with its normal header/manifest declaration. In modules/customerExperience/config/properties.js, the following later-layer export changes only the intended query cap and disables Discovery error/empty-result fixture fallback; provider and index identity remain inherited. Keep fixturePlacements absent and verify missing-provider readiness separately."
        },
        {
          "kind": "code",
          "language": "javascript",
          "text": "module.exports = {\n    wcmsExperience: {\n        resolver: { maxComponents: 50 },\n        projection: { fixtureFallbackEnabled: false }\n    }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Illustrative JSON body for the module-relative delivery POST, not a publication or preview approval. Given a qualified default hero/default footer and a summer-edit hero, the exact hero should replace only that slot and the footer should remain. An unknown collection should select defaults. Sending previewMode=true to public delivery still uses public mode; use the secured authoring preview route for Staged inspection."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"site\": \"exampleShop\",\n  \"pageType\": \"PRODUCT_LISTING\",\n  \"targetType\": \"COLLECTION\",\n  \"targetCode\": \"summer-edit\",\n  \"locale\": \"en-US\",\n  \"channel\": \"web\",\n  \"device\": \"desktop\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "Projects can override named members in src/service/defaultWcmsExperienceResolverService.js or src/service/defaultWcmsExperienceProjectionService.js through the existing loader; preserve API envelopes, owner isolation, trusted projections, preview separation and deterministic selection. Test exact/default slots, unknown target, denied preview, query cap, missing provider and failed indexing before activation. If a hero is wrong, correct the project-owned source and follow normal review/publication; rollback requires the prior approved projection and verified alias outcome. Reverting configuration does not undo a CMS publication or repair missing orchestration."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation selection assets and acceptance",
          "anchor": "wcmsExperiencePlacementDelivery-5-documentation-selection-assets-and-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "Partner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference."
        },
        {
          "kind": "paragraph",
          "text": "This guide is canonical CMS data owned by wcmsExperience. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation."
        },
        {
          "kind": "paragraph",
          "text": "Images belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded."
        },
        {
          "kind": "paragraph",
          "text": "Canonical authoring begins in DRAFT with an inactive route. After an authorized source editorial review, the owning Component, Node, PageMetadata, SearchMetadata and PublicationState records may move to STAGED and the owning route may be active for subsequent normal publication. STAGED is not approved or published; an active authoring route is only a publication candidate. The release owner must complete release-integrity preparation and validation, governed import, staged inspection and normal owner approvals before publication. Source review does not validate existing checksums, create approval receipts or prove Online delivery or browser acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "wcms-experience-placement-delivery-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not confuse a helper result with a completed authorized business operation. Do not bypass the owning persistence, publication or recovery contract to clear a dashboard. Do not copy shared behavior into an accelerator or put capability data into a composition-only group. Do not treat fixture output, missing measurement or a passing source test as live qualification. Preserve original evidence and report uncertain outcomes without an automatic replay."
        }
      ],
      "searchText": "WCMS Experience Placement and Delivery WCMS Experience Placement and Delivery: source-backed behavior, ownership, extension, failure handling and acceptance boundaries. # WCMS Experience Placement and Delivery\n\n## Placement versus renderable content\n\nBeginner reading path: start with the business purpose, use the diagram to follow the owning boundaries, then compare the contract table with the worked example. Developers should inspect the listed source before extending behavior. An operator should use the verification section to distinguish a source check from an installed operation. The guide labels schema-only behavior explicitly; a record definition is not a completed business workflow.\n\nwcmsExperience decides when and where an existing CMS component or container appears. cmsExperiencePlacement is the rule and placement entity, not a second renderable-component model. CMS remains content authority, Discovery/Search remains delivery projection authority and Axis is the authoring and preview control plane. Commerce still owns product grids, variants, prices, inventory, filters and pagination. The first vertical slice is a default or collection-targeted product-listing hero; attaching arbitrary Page Designer rules is not implied by that slice.\n\nThe resolver validates site, pageType, targetType and targetCode after normalization. Omitted target values default to DEFAULT and *, so site and pageType are the minimum useful body; locale, channel and device default to en-US, web and desktop. The request example contract shows all target fields explicitly. Trusted tenant/authentication context comes from the API envelope, not that body. POST /delivery/resolve forces previewMode=false; POST /authoring/preview forces true and requires WCMS_EXPERIENCE_PREVIEW. GET /authoring/index-status requires WCMS_EXPERIENCE_PUBLISH_STATUS. These are module-relative route keys. A direct resolver helper call provides no independent authorization.\n\n```mermaid\nflowchart LR\n  CMS[Canonical components and placements] --> Publish[Governed CMS publication]\n  Publish --> Index[Experience publication indexing]\n  Index --> Discovery[Versioned Discovery projections]\n  Discovery --> Resolver[Bounded placement resolver]\n  Resolver --> Slots[Safe slot component descriptors]\n  Slots --> Consumer[Storefront renderer]\n```\n\n## Selection and fallback semantics\n\nisActivePlacement filters by site, pageType, optional locale/channel/device and validFrom/validTo. Supplied deliveryStatus must be ACTIVE; supplied publicationStatus must match public delivery or STAGED preview. Absent statuses pass, and invalid dates are not explicitly rejected by these comparisons. The resolver normalizes region and customerSegments but does not filter them in this predicate; the projection query can filter region, while fixture results bypass that query. Public and authoring controllers force preview mode, but the helper itself trusts its context. Qualify status provenance and targeting at the owner boundary; arbitrary objects or fixtures are not safe published projections merely because they match.\n\nExact targets override defaults per slot: an exact hero leaves an unrelated default slot available. Ordering is specificity descending, priority descending, updatedAt descending and code ascending. diagnostics.fallbackUsed is true only when no exact placement exists and defaults exist; it can be false while default content remains in other slots. fallbackComponent is carried by indexing but is not used by this selection algorithm. Slot descriptors select placementCode, componentCode, rendererKey, contractVersion, properties and media. properties and media are shallow copies, not recursively sanitized or renderer-allowlisted here. Components are not hydrated from CMS by this helper; a qualified projection must already contain their safe renderable data.\n\n| Layer | Implemented seam | Qualification requirement |\n| --- | --- | --- |\n| Projection provider | DefaultDiscoveryRuntimeService search | Trusted source and bounded query |\n| Candidate lookup | Site/page/target/locale/channel query | Correct runtime isolation and indexes |\n| Fixture fallback | Discovery empty/error uses fixtures unless disabled; missing Discovery/FIXTURE branch always uses fixtures | Disable fallback, keep fixtures absent and qualify provider readiness |\n| Slot resolution | Exact target overrides fallback per slot | Renderer and preview access checks |\n| Publication event | DEPLOY, ROLLBACK or WITHDRAW | Actual manifest/index/alias acceptance |\n\n## Projection indexing and deployment qualification\n\nWith provider other than FIXTURE and DefaultDiscoveryRuntimeService.search present, findPlacements queries Discovery by owner/index, CURRENT status, site, pageType, target/default and locale/channel. A region is queried when present. Device is queried only with context.deviceAuthored=true, which normalizeContext does not set; the resolver still applies a placement's device predicate. Search options request page 1 with maxComponents, default 200, and deterministic ordering. There is no pagination loop, final slot cap, depth enforcement or resolver-level cache implementation here: maxSlots, maxDepth and cache defaults are not proof of those guarantees. The public route separately declares caching. Validate positive bounded limits in the effective deployment.\n\nfixtureFallbackEnabled=false prevents fixture fallback after a Discovery empty result/error. It does not stop fixturePlacements when provider is FIXTURE or Discovery search is unavailable: shouldUseDiscovery is then false and the fixture branch is unconditional. For authoritative delivery, keep fixturePlacements absent, require a working Discovery seam and explicitly disable fallback. Missing-provider failure is not fail-closed in this helper, so deployment readiness must reject that condition before enabling delivery.\n\nPublication indexing accepts CMS_ONLINE_CHANGED with DEPLOY, ROLLBACK or WITHDRAW and skips unsupported events/operations or disabled/FIXTURE deployments. It derives version identity from manifest/event code and a SHA-256 sourceHash from JSON.stringify(payload), saves documents sequentially and attempts alias switching afterward. Save exceptions or returned errors stop the switch. A missing alias provider returns ALIAS_PROVIDER_UNAVAILABLE rather than failing the whole handler; WITHDRAW uses ARCHIVED/INACTIVE payloads and the staged alias template because its context is not the public publication status. These source behaviors require explicit deployment qualification against the governance contract's alias/rollback/withdrawal guarantees.\n\nPlacement loading first trusts request.cmsExperiencePlacements, then manifest.cmsExperiencePlacements, then queries DefaultCmsExperiencePlacementService for active rows, scoped by site when present and limited by maxComponents. The fallback query is not bound to an immutable manifest version; missing placement service returns an empty list. toProjectionPayload stamps publication context and shallow-copies placement properties/media without hydrating the referenced component. Treat the committed outbox origin, snapshot contents, source-version binding and complete component projection as integration requirements. A helper return or deterministic document code does not prove approved source, collision-free placement identity, index completeness or alias atomicity.\n\nFor a seasonal collection hero, prepare the CMS component and placement in Staged, review targeting and time bounds, and preview with the authorized employee. Publish through the existing CMS process, inspect the matching indexed snapshot and resolve using the storefront context. Test the default hero when no exact collection rule applies, exact override for the selected slot and withdrawal of the published version. Do not fix missing content by enabling fixture fallback in production or allowing a public caller to request Staged preview. Keep product-listing behavior in Commerce rather than using a CMS placement to redefine product truth.\n\n## Verification and failure investigation\n\nRead and run resolver, fallback, projection-adapter, governance, publication-indexing, module and route-security contracts for capability qualification. Extend deployment acceptance to missing statuses, invalid dates, region/segment targeting, missing Discovery with fallback disabled, actual query caps, missing alias provider and withdrawal alias behavior. Existing doubles do not qualify those integrations. If indexing fails, preserve the committed event and inspect its manifest, saved projections and actual alias before an owner-governed replay. If alias result is skipped or withdrawal leaves old public results, treat delivery as unqualified rather than claiming successful publication. Never repair delivery with broad CMS scans or copied Staged payloads.\n\n## Customize and extend safely\n\nPrerequisites: a project-owned CMS component and supported renderer, governed default/collection placements, a qualified Discovery provider and an employee with preview permission. Keep content and placement records in the customer's business release under modules/customerExperience/data/<business-release>/records/cms/customerExperiencePlacementData.js, with its normal header/manifest declaration. In modules/customerExperience/config/properties.js, the following later-layer export changes only the intended query cap and disables Discovery error/empty-result fixture fallback; provider and index identity remain inherited. Keep fixturePlacements absent and verify missing-provider readiness separately.\n\n```javascript\nmodule.exports = {\n    wcmsExperience: {\n        resolver: { maxComponents: 50 },\n        projection: { fixtureFallbackEnabled: false }\n    }\n};\n```\n\nIllustrative JSON body for the module-relative delivery POST, not a publication or preview approval. Given a qualified default hero/default footer and a summer-edit hero, the exact hero should replace only that slot and the footer should remain. An unknown collection should select defaults. Sending previewMode=true to public delivery still uses public mode; use the secured authoring preview route for Staged inspection.\n\n```json\n{\n  \"site\": \"exampleShop\",\n  \"pageType\": \"PRODUCT_LISTING\",\n  \"targetType\": \"COLLECTION\",\n  \"targetCode\": \"summer-edit\",\n  \"locale\": \"en-US\",\n  \"channel\": \"web\",\n  \"device\": \"desktop\"\n}\n```\n\nProjects can override named members in src/service/defaultWcmsExperienceResolverService.js or src/service/defaultWcmsExperienceProjectionService.js through the existing loader; preserve API envelopes, owner isolation, trusted projections, preview separation and deterministic selection. Test exact/default slots, unknown target, denied preview, query cap, missing provider and failed indexing before activation. If a hero is wrong, correct the project-owned source and follow normal review/publication; rollback requires the prior approved projection and verified alias outcome. Reverting configuration does not undo a CMS publication or repair missing orchestration.\n\n## Documentation selection assets and acceptance\n\nPartner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference.\n\nThis guide is canonical CMS data owned by wcmsExperience. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation.\n\nImages belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded.\n\nCanonical authoring begins in DRAFT with an inactive route. After an authorized source editorial review, the owning Component, Node, PageMetadata, SearchMetadata and PublicationState records may move to STAGED and the owning route may be active for subsequent normal publication. STAGED is not approved or published; an active authoring route is only a publication candidate. The release owner must complete release-integrity preparation and validation, governed import, staged inspection and normal owner approvals before publication. Source review does not validate existing checksums, create approval receipts or prove Online delivery or browser acceptance.\n\n## Common mistakes\n\nDo not confuse a helper result with a completed authorized business operation. Do not bypass the owning persistence, publication or recovery contract to clear a dashboard. Do not copy shared behavior into an accelerator or put capability data into a composition-only group. Do not treat fixture output, missing measurement or a passing source test as live qualification. Preserve original evidence and report uncertain outcomes without an automatic replay.\n",
      "source": {
        "repository": "nodics.ai",
        "owner": "wcmsExperience",
        "functionalModule": "nodics.wcms",
        "technicalModule": "wcmsExperience",
        "path": "data/docs-v001/records/documentation/wcmsExperienceDocumentationComponentData.js",
        "sourcePath": "data/docs-v001/records/documentation/wcmsExperienceDocumentationComponentData.js",
        "checksum": "f25ebfbecb6d9b6b8252a7e74e8d8aca6adad84881f904fab5cb067c3fdd5ece",
        "wordCount": 1779
      },
      "slug": "wcms-experience-placement-delivery",
      "locale": "en",
      "navigationGroup": "WCMS Experience",
      "navigationGroupCode": "wcmsExperience",
      "navigationGroupOrder": 70,
      "navigationOrder": 2010,
      "references": [
        {
          "documentId": "wcms.cms-source-map-authoring-contract",
          "owner": "cms"
        },
        {
          "documentId": "wcms.publishing-lifecycle",
          "owner": "cms"
        },
        {
          "documentId": "discovery.search-indexing",
          "owner": "discoveryRuntime"
        },
        {
          "documentId": "commerce.search-guide",
          "owner": "commerceSearchCore"
        }
      ],
      "sourceCoverage": [
        {
          "modulePath": ".",
          "implementationState": "IMPLEMENTED",
          "anchors": [
            "wcmsExperiencePlacementDelivery-1-placement-versus-renderable-content",
            "wcmsExperiencePlacementDelivery-2-selection-and-fallback-semantics",
            "wcmsExperiencePlacementDelivery-3-projection-indexing-and-deployment-qualification",
            "wcmsExperiencePlacementDelivery-4-verification-and-failure-investigation",
            "wcms-experience-placement-delivery-customize-and-extend-safely",
            "wcmsExperiencePlacementDelivery-5-documentation-selection-assets-and-acceptance"
          ],
          "evidence": [
            "src/service/defaultWcmsExperienceResolverService.js",
            "src/service/defaultWcmsExperienceProjectionService.js",
            "src/service/defaultWcmsExperiencePublicationIndexingService.js",
            "test/wcmsExperienceResolverContract.test.js",
            "test/wcmsExperiencePublicationIndexingContract.test.js",
            "llm/contracts/experience-governance-contract.md",
            "src/router/routers.js",
            "src/controller/defaultWcmsExperienceDeliveryController.js",
            "src/controller/defaultWcmsExperienceAuthoringController.js",
            "src/schemas/schemas.js",
            "config/properties.js",
            "llm/contracts/developer-implementation-contract.md"
          ]
        }
      ]
    },
    "active": true
  }
};
