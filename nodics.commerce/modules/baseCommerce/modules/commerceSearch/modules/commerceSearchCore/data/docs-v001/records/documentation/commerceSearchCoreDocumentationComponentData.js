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
    "code": "nodicsDocsComponentcommerceSearchGuide",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "commerce.search-guide",
      "title": "Commerce Search Guide",
      "route": "/docs/framework/commerce-search-guide",
      "section": "search-and-discovery",
      "sectionTitle": "Search and Discovery",
      "group": "search-and-discovery",
      "groupTitle": "Search and Discovery",
      "parentId": "search-and-discovery",
      "hierarchyPath": [
        "Search and Discovery",
        "Commerce Search Guide"
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
      "summary": "How commerce search projections, ranking rules, index freshness, rebuild evidence, and storefront discovery are governed.",
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
        "discovery.search-indexing",
        "catalog.product-discovery-management",
        "commerce.data-authoring-fulfillment"
      ],
      "sourceEvidence": [
        "../../../../../../../nodics.docs/data/manifest.json",
        "../../../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../../package.json",
        "package.json",
        "../../../product/package.json",
        "../../../../../../../../nodics.kickoff/modules/agora.apparel/data/sample-v001/commerce/headers/commerceSearch",
        "src/schemas",
        "src/service",
        "src/service/defaultCommerceSearchRankingService.js",
        "src/service/defaultCommerceSearchPublicationService.js",
        "src/service/defaultCommerceSearchProjectionBuilderService.js",
        "test/commerceSearchRankingContract.test.js",
        "test/commerceSearchPublicationContract.test.js"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "commerce-search",
        "projection",
        "ranking",
        "index",
        "agora"
      ],
      "topicKeywords": [
        "Search and Discovery",
        "Search Providers and Indexing",
        "Commerce Search Guide"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "commerceSearchGuide-1-source-map",
          "level": 2
        },
        {
          "text": "Projection flow",
          "anchor": "commerceSearchGuide-2-projection-flow",
          "level": 2
        },
        {
          "text": "Ranking and rules",
          "anchor": "commerceSearchGuide-3-ranking-and-rules",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "commerceSearchGuide-4-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Implementation handoff",
          "anchor": "commerceSearchGuide-5-implementation-handoff",
          "level": 2
        },
        {
          "text": "Evidence checklist",
          "anchor": "commerceSearchGuide-6-evidence-checklist",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "commerceSearchGuide-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "commerceSearchGuide-8-verification",
          "level": 2
        },
        {
          "text": "Commerce Search rule selection and ownership",
          "anchor": "commerce-search-guide-source-depth-1",
          "level": 2
        },
        {
          "text": "Ranking actions deterministic order and edge cases",
          "anchor": "commerce-search-guide-source-depth-2",
          "level": 2
        },
        {
          "text": "Publication batching and partial failure",
          "anchor": "commerce-search-guide-source-depth-3",
          "level": 2
        },
        {
          "text": "Verification and adoption",
          "anchor": "commerce-search-guide-source-depth-4",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Commerce Search applies published merchandising rules to Product-owned discovery results. Product owns catalog/discovery projections, generic nSearch owns provider/index abstraction, and Commerce Search owns its tenant/store-scoped rule projection and ranking. A search result is not price, operational stock or fulfillment authority. Rebuild and verify the appropriate owner projection after changes rather than assume all signals are synchronized by one Search operation. For beginners, first verify that Product discovery returns the expected published product without a merchandising rule. Then author one inactive rule for the correct store and category, follow the Search owner's publication procedure, and compare the resulting order. Diagnose missing products at Product before changing ranking; checkout must still recheck price and stock."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "commerceSearchGuide-1-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Owner",
            "Framework source"
          ],
          "rows": [
            [
              "Rule schema",
              "`nodics.commerce/modules/baseCommerce/modules/commerceSearch/modules/commerceSearchCore/src/schemas/schemas.js`: commerceSearchRule and published rule/projection records."
            ],
            [
              "Runtime ranking",
              "`nodics.commerce/modules/baseCommerce/modules/commerceSearch/modules/commerceSearchCore/src/service/defaultCommerceSearchRankingService.js`: loadRules, applies, actionScore, ranked and rank."
            ],
            [
              "Rule publication",
              "`nodics.commerce/modules/baseCommerce/modules/commerceSearch/modules/commerceSearchCore/src/service/defaultCommerceSearchPublicationService.js`: bounded projection and index publication."
            ],
            [
              "Product discovery",
              "`nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductDiscoveryService.js`; Search does not author operational stock."
            ],
            [
              "Owner guides",
              "`catalog.product-discovery-management`, `commerce.enterprise-operations`; read the detailed rule-selection and partial-failure sections below."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Projection flow",
          "anchor": "commerceSearchGuide-2-projection-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Product[\"Product discovery owner\"] --> Results[\"Published discovery results\"]\n  Rules[\"Published Commerce rules\"] --> Projection[\"CURRENT rule projection\"]\n  Projection --> Ranking[\"Commerce ranking\"]\n  Results --> Ranking\n  Ranking --> Storefront[\"Storefront result ordering\"]\n  Storefront -. \"command-time checks\" .-> Owners[\"Price, Inventory and Checkout owners\"]"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is findability. A product that exists but cannot be found is not commercially ready. Business users need ranking, filtering, and availability to match merchandising intent. Developers need deterministic projection rules. Operators need freshness, index health, and rebuild evidence before production acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Ranking and rules",
          "anchor": "commerceSearchGuide-3-ranking-and-rules"
        },
        {
          "kind": "paragraph",
          "text": "The implemented fallback applies PIN, BOOST and BURY to existing Product discovery results, scoped by tenant/store, optional locale, GLOBAL/CATEGORY/SEARCH_TERM, validity and current published projection. A separately configured ranking engine may supply other semantics, but exclusion/filtering, market rules and analyzer changes are not implemented by this fallback. Do not put unsupported actions or a top-level boost into a rule and expect behavior."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  catalogCategoryBoost: {\n    code: 'catalogCategoryBoost', tenant: 'demo',\n    name: 'Boost featured catalog product', storeCode: 'catalogStore',\n    locale: 'en', scopeType: 'CATEGORY', categoryCode: 'linen',\n    status: 'DRAFT', revision: 0, priority: 100,\n    actions: [{ productCode: 'linenDress', actionType: 'BOOST', weight: 2 }]\n  }\n};\n// DRAFT authoring data is not a CURRENT runtime projection.\n// Review and publish through the Search owner before expecting ranking."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "commerceSearchGuide-4-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Extend rule validation, publication adapters or a configured ranking engine in the owning module with bounded tests. Engine delegation must document its own semantics; the fallback's PIN/BOOST/BURY contract does not imply exclusion, stock filtering or arbitrary analyzer support. Product/Price/Inventory remain their own authorities, and Axis may expose only an installed authorized owner operation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Implementation handoff",
          "anchor": "commerceSearchGuide-5-implementation-handoff"
        },
        {
          "kind": "paragraph",
          "text": "Each search change should name the source schemas, projection service, index provider, ranking rules, rebuild trigger, and browser search scenario. This gives business users a merchandising journey, developers a controlled extension point, operators production freshness evidence, and QA owners a repeatable way to prove that imported products become discoverable only when their authoritative records allow it."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Evidence checklist",
          "anchor": "commerceSearchGuide-6-evidence-checklist"
        },
        {
          "kind": "paragraph",
          "text": "The release package should show which products entered the projection, which ones were skipped, and why. The index run should record tenant, catalog version, locale, market, source checksum, item count, failure count, and last successful completion. In production, operators should be able to compare the search document with the product record, price row, inventory balance, and published media reference before deciding whether to rebuild or repair data."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "commerceSearchGuide-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating search documents as product authority.",
            "Forgetting to rebuild projections after import or publication.",
            "Showing inactive products because index filters are incomplete.",
            "Adding ranking rules without locale or market scope.",
            "Hiding indexing failures from operators."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "commerceSearchGuide-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Validate the complete rule example and owner lifecycle, publish Product and rule projections, then inspect tenant/store/locale/category/term ordering, no-rule behavior and partial publication recovery described below. Use Inventory operations for stock, not imported operational snapshots. Browser queries, index freshness and live acceptance are separate from accurate source editorial coverage."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Commerce Search rule selection and ownership",
          "anchor": "commerce-search-guide-source-depth-1"
        },
        {
          "kind": "paragraph",
          "text": "commerceSearchCore owns Commerce ranking rules and projection preparation behind the commerceSearch family. It does not create another Product, Price or Inventory authority. The ranking service reads CURRENT rules in exact tenant and store context, optionally locale, and respects effective windows. GLOBAL rules apply broadly, CATEGORY rules bind the intended category and SEARCH_TERM rules use case-insensitive query matching. Keep that scope explicit in the business review: a merchandising rule for one store must not be presented as an automatic change to every storefront."
        },
        {
          "kind": "paragraph",
          "text": "With fewer than two products the ranking method returns early. With no selected rules it preserves the input product-card order. When DefaultDiscoveryRankingEngineService is available, Commerce adapts product action identity to the generic target identity and delegates ranking. Without that service it uses its own bounded action interpretation. This is supported composition behavior, not permission to install an unrelated search engine in Axis or copy ranking truth into React components. Validate both configured engine paths when changing the rule vocabulary."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Rules[Reviewed Commerce ranking rules] --> Publish[Commerce Search publication]\n  Publish --> Projection[Generated projection persistence]\n  Projection --> Search[Owning search save]\n  Search --> Candidates[Scoped product candidates]\n  Candidates --> Rank[Discovery engine or Commerce fallback]\n  Rank --> Cards[Ordered product cards]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Ranking actions deterministic order and edge cases",
          "anchor": "commerce-search-guide-source-depth-2"
        },
        {
          "kind": "paragraph",
          "text": "The fallback supports PIN, BOOST and BURY actions for productCode values that exist in the candidate set. PIN uses positions of at least one and selects the highest-priority relevant action per product. BOOST and BURY apply configured score deltas, defaulting to positive and negative one thousand. Actions naming absent products do not create products or expand the result set. Original input order remains the tie breaker for equal ranking values, so a merchandising rule must not depend on accidental database enumeration order outside that defined input."
        },
        {
          "kind": "paragraph",
          "text": "Rule priorities are sorted descending before application. A pin is a ranking instruction, not a guarantee that an unavailable or unauthorized product becomes sellable. Product candidate selection, eligibility, price, stock and delivery safety remain with their canonical owners. Business users should preview the exact query, store, locale and candidate set to understand why a rule has no effect. For example, a search-term action on a product not present in those candidates cannot make the product appear; investigate discovery or publication before changing the pin priority."
        },
        {
          "kind": "table",
          "headers": [
            "Observation",
            "Source explanation",
            "Investigation"
          ],
          "rows": [
            [
              "No rules matched",
              "Original ordering retained",
              "Check store, locale and effective window"
            ],
            [
              "Action names an absent product",
              "Action ignored for candidates",
              "Check Product publication and discovery"
            ],
            [
              "Fewer than two candidates",
              "Ranking returns early",
              "Do not infer rule publication failed"
            ],
            [
              "Equal rank values",
              "Original input order retained",
              "Review source ordering"
            ],
            [
              "Pinned unavailable item",
              "Ranking is not inventory authority",
              "Inspect canonical eligibility and stock"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Publication batching and partial failure",
          "anchor": "commerce-search-guide-source-depth-3"
        },
        {
          "kind": "paragraph",
          "text": "Publication requires tenant context and selects approved or published rules through the owning generated service, with optional exact store, locale and requested codes. The configured batch defaults to fifty and the lookup requests one extra row so overflow can fail visibly. This is not silent pagination of an unbounded publication request. Operators should deliberately select a supported batch and retain its source rule identities rather than assume every rule in a tenant was processed."
        },
        {
          "kind": "paragraph",
          "text": "For each rule, the service builds its projection, saves that projection through the generated service and then calls the owning search save. Rules are processed sequentially. The inspected implementation does not establish an atomic transaction across all rules, all projection records and the external index, nor an alias rollback for the whole batch. If a later rule fails, earlier writes may already be durable. Inspect the exact rule, projection and index evidence before replaying; never claim all-or-nothing publication merely because the method returns one promise."
        },
        {
          "kind": "paragraph",
          "text": "A worked campaign begins with a draft rule scoped to the intended store and query. Review action product codes against the canonical published catalogue, approve through the normal rule process and publish a bounded selection. Compare saved projection evidence and the index result, then preview actual cards. Change effective times or priorities in the source rule through its owner rather than editing the search projection directly. If the index call is uncertain after projection save, preserve the source identity and inspect actual index state; do not broaden the batch or force another publication under a different store."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification and adoption",
          "anchor": "commerce-search-guide-source-depth-4"
        },
        {
          "kind": "paragraph",
          "text": "Run Commerce Search ranking and publication contracts for no-rule preservation, priority ordering, candidate absence, pins, boosts, buries, scope mismatch and batch overflow. Add installed failure injection between projection save and search save and between consecutive rules to qualify recovery. Test generic Discovery delegation separately from the fallback. Browser acceptance should verify query-specific card order while Product, Pricing and Inventory still govern the displayed offer. Keep documentation import independent of merchandising data import: installing this guide must not create a rule or publish a product. Passing source contracts proves these seams, not live index consistency, storefront rendering or customer eligibility."
        },
        {
          "kind": "paragraph",
          "text": "Record the tested source rule codes, approved versions, query, store, locale, effective time and candidate identities in acceptance evidence. Compare order before and after publication without changing stock or price fixtures at the same time. Include a query outside the rule scope to prove that unrelated discovery remains unchanged. A browser screenshot should show the actual returned cards and publication version, not a hardcoded sorted fixture. If an operator disables a rule, qualify how its old projection is withdrawn in the installed runtime before promising immediate removal. Report index acknowledgement, saved projection and displayed order as separate observations when their timing differs."
        }
      ],
      "searchText": "Commerce Search Guide How commerce search projections, ranking rules, index freshness, rebuild evidence, and storefront discovery are governed. # Commerce Search Guide\n\nCommerce Search applies published merchandising rules to Product-owned discovery results. Product owns catalog/discovery projections, generic nSearch owns provider/index abstraction, and Commerce Search owns its tenant/store-scoped rule projection and ranking. A search result is not price, operational stock or fulfillment authority. Rebuild and verify the appropriate owner projection after changes rather than assume all signals are synchronized by one Search operation. For beginners, first verify that Product discovery returns the expected published product without a merchandising rule. Then author one inactive rule for the correct store and category, follow the Search owner's publication procedure, and compare the resulting order. Diagnose missing products at Product before changing ranking; checkout must still recheck price and stock.\n\n## Source map\n\n| Owner | Framework source |\n| --- | --- |\n| Rule schema | `nodics.commerce/modules/baseCommerce/modules/commerceSearch/modules/commerceSearchCore/src/schemas/schemas.js`: commerceSearchRule and published rule/projection records. |\n| Runtime ranking | `nodics.commerce/modules/baseCommerce/modules/commerceSearch/modules/commerceSearchCore/src/service/defaultCommerceSearchRankingService.js`: loadRules, applies, actionScore, ranked and rank. |\n| Rule publication | `nodics.commerce/modules/baseCommerce/modules/commerceSearch/modules/commerceSearchCore/src/service/defaultCommerceSearchPublicationService.js`: bounded projection and index publication. |\n| Product discovery | `nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductDiscoveryService.js`; Search does not author operational stock. |\n| Owner guides | `catalog.product-discovery-management`, `commerce.enterprise-operations`; read the detailed rule-selection and partial-failure sections below. |\n\n## Projection flow\n\n```mermaid\nflowchart LR\n  Product[\"Product discovery owner\"] --> Results[\"Published discovery results\"]\n  Rules[\"Published Commerce rules\"] --> Projection[\"CURRENT rule projection\"]\n  Projection --> Ranking[\"Commerce ranking\"]\n  Results --> Ranking\n  Ranking --> Storefront[\"Storefront result ordering\"]\n  Storefront -. \"command-time checks\" .-> Owners[\"Price, Inventory and Checkout owners\"]\n```\n\nThe business problem is findability. A product that exists but cannot be found is not commercially ready. Business users need ranking, filtering, and availability to match merchandising intent. Developers need deterministic projection rules. Operators need freshness, index health, and rebuild evidence before production acceptance.\n\n## Ranking and rules\n\nThe implemented fallback applies PIN, BOOST and BURY to existing Product discovery results, scoped by tenant/store, optional locale, GLOBAL/CATEGORY/SEARCH_TERM, validity and current published projection. A separately configured ranking engine may supply other semantics, but exclusion/filtering, market rules and analyzer changes are not implemented by this fallback. Do not put unsupported actions or a top-level boost into a rule and expect behavior.\n\n```js\nmodule.exports = {\n  catalogCategoryBoost: {\n    code: 'catalogCategoryBoost', tenant: 'demo',\n    name: 'Boost featured catalog product', storeCode: 'catalogStore',\n    locale: 'en', scopeType: 'CATEGORY', categoryCode: 'linen',\n    status: 'DRAFT', revision: 0, priority: 100,\n    actions: [{ productCode: 'linenDress', actionType: 'BOOST', weight: 2 }]\n  }\n};\n// DRAFT authoring data is not a CURRENT runtime projection.\n// Review and publish through the Search owner before expecting ranking.\n```\n\n## Customization and extension guidance\n\nExtend rule validation, publication adapters or a configured ranking engine in the owning module with bounded tests. Engine delegation must document its own semantics; the fallback's PIN/BOOST/BURY contract does not imply exclusion, stock filtering or arbitrary analyzer support. Product/Price/Inventory remain their own authorities, and Axis may expose only an installed authorized owner operation.\n\n## Implementation handoff\n\nEach search change should name the source schemas, projection service, index provider, ranking rules, rebuild trigger, and browser search scenario. This gives business users a merchandising journey, developers a controlled extension point, operators production freshness evidence, and QA owners a repeatable way to prove that imported products become discoverable only when their authoritative records allow it.\n\n## Evidence checklist\n\nThe release package should show which products entered the projection, which ones were skipped, and why. The index run should record tenant, catalog version, locale, market, source checksum, item count, failure count, and last successful completion. In production, operators should be able to compare the search document with the product record, price row, inventory balance, and published media reference before deciding whether to rebuild or repair data.\n\n## Common mistakes\n\n- Treating search documents as product authority.\n- Forgetting to rebuild projections after import or publication.\n- Showing inactive products because index filters are incomplete.\n- Adding ranking rules without locale or market scope.\n- Hiding indexing failures from operators.\n\n## Verification\n\nValidate the complete rule example and owner lifecycle, publish Product and rule projections, then inspect tenant/store/locale/category/term ordering, no-rule behavior and partial publication recovery described below. Use Inventory operations for stock, not imported operational snapshots. Browser queries, index freshness and live acceptance are separate from accurate source editorial coverage.\n\n## Commerce Search rule selection and ownership\n\ncommerceSearchCore owns Commerce ranking rules and projection preparation behind the commerceSearch family. It does not create another Product, Price or Inventory authority. The ranking service reads CURRENT rules in exact tenant and store context, optionally locale, and respects effective windows. GLOBAL rules apply broadly, CATEGORY rules bind the intended category and SEARCH_TERM rules use case-insensitive query matching. Keep that scope explicit in the business review: a merchandising rule for one store must not be presented as an automatic change to every storefront.\n\nWith fewer than two products the ranking method returns early. With no selected rules it preserves the input product-card order. When DefaultDiscoveryRankingEngineService is available, Commerce adapts product action identity to the generic target identity and delegates ranking. Without that service it uses its own bounded action interpretation. This is supported composition behavior, not permission to install an unrelated search engine in Axis or copy ranking truth into React components. Validate both configured engine paths when changing the rule vocabulary.\n\n```mermaid\nflowchart LR\n  Rules[Reviewed Commerce ranking rules] --> Publish[Commerce Search publication]\n  Publish --> Projection[Generated projection persistence]\n  Projection --> Search[Owning search save]\n  Search --> Candidates[Scoped product candidates]\n  Candidates --> Rank[Discovery engine or Commerce fallback]\n  Rank --> Cards[Ordered product cards]\n```\n\n## Ranking actions deterministic order and edge cases\n\nThe fallback supports PIN, BOOST and BURY actions for productCode values that exist in the candidate set. PIN uses positions of at least one and selects the highest-priority relevant action per product. BOOST and BURY apply configured score deltas, defaulting to positive and negative one thousand. Actions naming absent products do not create products or expand the result set. Original input order remains the tie breaker for equal ranking values, so a merchandising rule must not depend on accidental database enumeration order outside that defined input.\n\nRule priorities are sorted descending before application. A pin is a ranking instruction, not a guarantee that an unavailable or unauthorized product becomes sellable. Product candidate selection, eligibility, price, stock and delivery safety remain with their canonical owners. Business users should preview the exact query, store, locale and candidate set to understand why a rule has no effect. For example, a search-term action on a product not present in those candidates cannot make the product appear; investigate discovery or publication before changing the pin priority.\n\n| Observation | Source explanation | Investigation |\n| --- | --- | --- |\n| No rules matched | Original ordering retained | Check store, locale and effective window |\n| Action names an absent product | Action ignored for candidates | Check Product publication and discovery |\n| Fewer than two candidates | Ranking returns early | Do not infer rule publication failed |\n| Equal rank values | Original input order retained | Review source ordering |\n| Pinned unavailable item | Ranking is not inventory authority | Inspect canonical eligibility and stock |\n\n## Publication batching and partial failure\n\nPublication requires tenant context and selects approved or published rules through the owning generated service, with optional exact store, locale and requested codes. The configured batch defaults to fifty and the lookup requests one extra row so overflow can fail visibly. This is not silent pagination of an unbounded publication request. Operators should deliberately select a supported batch and retain its source rule identities rather than assume every rule in a tenant was processed.\n\nFor each rule, the service builds its projection, saves that projection through the generated service and then calls the owning search save. Rules are processed sequentially. The inspected implementation does not establish an atomic transaction across all rules, all projection records and the external index, nor an alias rollback for the whole batch. If a later rule fails, earlier writes may already be durable. Inspect the exact rule, projection and index evidence before replaying; never claim all-or-nothing publication merely because the method returns one promise.\n\nA worked campaign begins with a draft rule scoped to the intended store and query. Review action product codes against the canonical published catalogue, approve through the normal rule process and publish a bounded selection. Compare saved projection evidence and the index result, then preview actual cards. Change effective times or priorities in the source rule through its owner rather than editing the search projection directly. If the index call is uncertain after projection save, preserve the source identity and inspect actual index state; do not broaden the batch or force another publication under a different store.\n\n## Verification and adoption\n\nRun Commerce Search ranking and publication contracts for no-rule preservation, priority ordering, candidate absence, pins, boosts, buries, scope mismatch and batch overflow. Add installed failure injection between projection save and search save and between consecutive rules to qualify recovery. Test generic Discovery delegation separately from the fallback. Browser acceptance should verify query-specific card order while Product, Pricing and Inventory still govern the displayed offer. Keep documentation import independent of merchandising data import: installing this guide must not create a rule or publish a product. Passing source contracts proves these seams, not live index consistency, storefront rendering or customer eligibility.\n\nRecord the tested source rule codes, approved versions, query, store, locale, effective time and candidate identities in acceptance evidence. Compare order before and after publication without changing stock or price fixtures at the same time. Include a query outside the rule scope to prove that unrelated discovery remains unchanged. A browser screenshot should show the actual returned cards and publication version, not a hardcoded sorted fixture. If an operator disables a rule, qualify how its old projection is withdrawn in the installed runtime before promising immediate removal. Report index acknowledgement, saved projection and displayed order as separate observations when their timing differs.\n",
      "previous": {
        "title": "Module Registry Journey",
        "route": "/docs/framework/platform-module-registry-journey"
      },
      "next": {
        "title": "Localization Runtime Authoring",
        "route": "/docs/framework/localization-runtime-authoring"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "commerceSearchCore",
        "owner": "commerceSearchCore",
        "sourcePath": "data/docs-v001/records/documentation/commerceSearchCoreDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/commerceSearchCoreDocumentationComponentData.js",
        "wordCount": 1603,
        "checksum": "f4bacee607b4206ed11059a280a4ab8745d1a3fa222281222bcee29271f3d587"
      },
      "slug": "commerce-search-guide",
      "locale": "en",
      "navigationGroup": "Search Providers and Indexing",
      "navigationGroupCode": "search-providers-and-indexing",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "discovery.search-indexing",
          "owner": "discoveryRuntime"
        },
        {
          "documentId": "catalog.product-discovery-management",
          "owner": "product"
        },
        {
          "documentId": "commerce.data-authoring-fulfillment",
          "owner": "nodics.docs"
        }
      ],
      "sourceCoverage": [
        {
          "modulePath": ".",
          "implementationState": "IMPLEMENTED",
          "anchors": [
            "commerce-search-guide-source-depth-1",
            "commerce-search-guide-source-depth-2",
            "commerce-search-guide-source-depth-3",
            "commerce-search-guide-source-depth-4"
          ],
          "evidence": [
            "src/service/defaultCommerceSearchRankingService.js",
            "src/service/defaultCommerceSearchPublicationService.js",
            "src/service/defaultCommerceSearchProjectionBuilderService.js",
            "test/commerceSearchRankingContract.test.js",
            "test/commerceSearchPublicationContract.test.js"
          ]
        }
      ]
    },
    "active": true
  }
};
