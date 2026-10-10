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
    "code": "nodicsDocsComponentcatalogProductDiscoveryManagement",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "catalog.product-discovery-management",
      "title": "Product Catalog and Discovery Management",
      "route": "/docs/framework/catalog-product-discovery-management",
      "section": "product-catalog-and-discovery",
      "sectionTitle": "Product Catalog and Discovery",
      "group": "product-catalog-and-discovery",
      "groupTitle": "Product Catalog and Discovery",
      "parentId": "product-catalog-and-discovery",
      "hierarchyPath": [
        "Product Catalog and Discovery",
        "Product Catalog and Discovery Management"
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
      "summary": "Products, categories, variants, localized attributes, catalog publication, discovery projections, and project customization.",
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
        "commerce.base-foundations",
        "discovery.search-indexing",
        "wcms.media-management"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/manifest.json",
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
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
        "product-catalog-and-discovery",
        "catalog-model-and-publication",
        "product-catalog-and-discovery-management"
      ],
      "topicKeywords": [
        "Product Catalog and Discovery",
        "Catalog Model and Publication",
        "Product Catalog and Discovery Management"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "catalogProductDiscoveryManagement-1-business-context",
          "level": 2
        },
        {
          "text": "Journey and ownership",
          "anchor": "catalogProductDiscoveryManagement-2-journey-and-ownership",
          "level": 2
        },
        {
          "text": "Data and configuration detail",
          "anchor": "catalogProductDiscoveryManagement-3-data-and-configuration-detail",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "catalogProductDiscoveryManagement-4-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "catalogProductDiscoveryManagement-5-operations-and-governance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "catalogProductDiscoveryManagement-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "catalogProductDiscoveryManagement-7-verification",
          "level": 2
        },
        {
          "text": "Current implementation coverage",
          "anchor": "catalogProductDiscoveryManagement-8-current-implementation-coverage",
          "level": 2
        },
        {
          "text": "Source authoring APIs",
          "anchor": "catalogProductDiscoveryManagement-9-source-authoring-apis",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Products, categories, variants, localized attributes, catalog publication, discovery projections, and project customization. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs."
        },
        {
          "kind": "paragraph",
          "text": "Business teams need product data that can be enriched, localized, approved, published, searched, and customized without mixing catalog ownership with checkout or order ownership. Product catalog owns sellable item structure and discovery projections. Search providers consume indexed projections; checkout consumes selected product and price evidence at calculation time."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "catalogProductDiscoveryManagement-1-business-context"
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
              "Business teams need product data that can be enriched, localized, approved, published, searched, and customized without mixing catalog ownership with checkout or order ownership."
            ],
            [
              "Who uses it?",
              "Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools."
            ],
            [
              "What changes can it support?",
              "Product catalog owns sellable item structure and discovery projections. Search providers consume indexed projections; checkout consumes selected product and price evidence at calculation time."
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
          "anchor": "catalogProductDiscoveryManagement-2-journey-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Commerce product capabilities own product, category, variant, localization, and publication records. Media owns assets, Pricing owns price decisions, and Search owns query/index behavior. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state."
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
              "Product Catalog and Discovery",
              "Used in navigation and dashboards so readers are not exposed to raw module names first."
            ],
            [
              "Source owner",
              "nodics.commerce",
              "Carries exact implementation, documentation, and validation evidence."
            ],
            [
              "Technical module",
              "product",
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
          "anchor": "catalogProductDiscoveryManagement-3-data-and-configuration-detail"
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
          "text": "productExtension: { code: \"shirt-100\", attributes: { fabric: \"cotton\" }, publishTo: \"onlineCatalog\" }"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "catalogProductDiscoveryManagement-4-customization-and-extension"
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
          "anchor": "catalogProductDiscoveryManagement-5-operations-and-governance"
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
          "anchor": "catalogProductDiscoveryManagement-6-common-mistakes"
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
          "anchor": "catalogProductDiscoveryManagement-7-verification"
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
          "level": 2,
          "text": "Current implementation coverage",
          "anchor": "catalogProductDiscoveryManagement-8-current-implementation-coverage"
        },
        {
          "kind": "paragraph",
          "text": "The product catalog page covers the source records that create sellable and discoverable assortments: Product, Category, ProductVariant, localized product and category records, product publication records, and product search projections. Product management is not only a list of items. It is the business journey that lets a merchandiser define what can be sold, where it is visible, which localized attributes appear to customers, and which discovery projection is safe to index."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Product[\"Product and Variant\"] --> Localization[\"Localized attributes\"]\n  Product --> Category[\"Category assignment\"]\n  Localization --> Publication[\"Catalog publication\"]\n  Category --> Publication\n  Publication --> Projection[\"Search projection\"]\n  Projection --> Discovery[\"Discovery index\"]\n  Discovery --> Storefront[\"Storefront and Axis preview\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Entity or service area",
            "Business purpose",
            "Developer extension point"
          ],
          "rows": [
            [
              "Product and ProductVariant",
              "Own sellable identity, classification, status, and variant structure.",
              "Add project-layer schema properties and validation services."
            ],
            [
              "ProductLocalization and CategoryLocalization",
              "Own locale-specific names, descriptions, slugs, SEO, and completeness.",
              "Add locale fields and fallback behavior through localization-aware services."
            ],
            [
              "ProductPublication",
              "Controls whether catalog data is ready for customer-facing publication.",
              "Extend publication validation and evidence capture."
            ],
            [
              "ProductSearchProjection",
              "Provides indexable, rebuildable discovery data.",
              "Extend projection builder instead of editing index records directly."
            ],
            [
              "Product BackOffice capability",
              "Declares Axis workbench metadata for business users.",
              "Add backend-declared columns, summaries, and actions."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Project customization should happen in the owning product layer or a later project module. For example, an apparel project can add size charts, fabric composition, sustainability badges, and fit attributes while keeping the base Product identity and publication contract intact. An electronics project can add warranty, energy rating, and technical specifications. Those properties must be documented with type, validation, indexing, import/export, Axis visibility, and publication behavior."
        },
        {
          "kind": "paragraph",
          "text": "Implementation evidence is held in product schemas, product discovery API contracts, product localization contracts, domain enrichment tests, localized search publication tests, and generated schema contracts for Product, Category, Variant, Localization, Publication, and Search Projection."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source authoring APIs",
          "anchor": "catalogProductDiscoveryManagement-9-source-authoring-apis"
        },
        {
          "kind": "paragraph",
          "text": "Product source authoring is available through selective capabilities/search/create/update APIs using its existing generated controller. Broad CRUD stays disabled; writes require Staged. Axis follows the backend route projection and Copilot uses the canonical Product PUT API after confirmation. See [selective schema APIs](/docs/framework/schema-data-modeling-management#selective-module-apis-and-route-driven-clients) for payloads, authorization compatibility, route customization, deployment order and remaining acceptance. No live-authenticated acceptance is implied by the source and prepared-runtime tests."
        }
      ],
      "searchText": "Product Catalog and Discovery Management Products, categories, variants, localized attributes, catalog publication, discovery projections, and project customization. # Product Catalog and Discovery Management\n\nProducts, categories, variants, localized attributes, catalog publication, discovery projections, and project customization. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nBusiness teams need product data that can be enriched, localized, approved, published, searched, and customized without mixing catalog ownership with checkout or order ownership. Product catalog owns sellable item structure and discovery projections. Search providers consume indexed projections; checkout consumes selected product and price evidence at calculation time.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | Business teams need product data that can be enriched, localized, approved, published, searched, and customized without mixing catalog ownership with checkout or order ownership. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | Product catalog owns sellable item structure and discovery projections. Search providers consume indexed projections; checkout consumes selected product and price evidence at calculation time. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nCommerce product capabilities own product, category, variant, localization, and publication records. Media owns assets, Pricing owns price decisions, and Search owns query/index behavior. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Product Catalog and Discovery | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.commerce | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | product | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\nproductExtension: { code: \"shirt-100\", attributes: { fabric: \"cotton\" }, publishTo: \"onlineCatalog\" }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n\n## Current implementation coverage\n\nThe product catalog page covers the source records that create sellable and discoverable assortments: Product, Category, ProductVariant, localized product and category records, product publication records, and product search projections. Product management is not only a list of items. It is the business journey that lets a merchandiser define what can be sold, where it is visible, which localized attributes appear to customers, and which discovery projection is safe to index.\n\n```mermaid\nflowchart LR\n  Product[\"Product and Variant\"] --> Localization[\"Localized attributes\"]\n  Product --> Category[\"Category assignment\"]\n  Localization --> Publication[\"Catalog publication\"]\n  Category --> Publication\n  Publication --> Projection[\"Search projection\"]\n  Projection --> Discovery[\"Discovery index\"]\n  Discovery --> Storefront[\"Storefront and Axis preview\"]\n```\n\n| Entity or service area | Business purpose | Developer extension point |\n| --- | --- | --- |\n| Product and ProductVariant | Own sellable identity, classification, status, and variant structure. | Add project-layer schema properties and validation services. |\n| ProductLocalization and CategoryLocalization | Own locale-specific names, descriptions, slugs, SEO, and completeness. | Add locale fields and fallback behavior through localization-aware services. |\n| ProductPublication | Controls whether catalog data is ready for customer-facing publication. | Extend publication validation and evidence capture. |\n| ProductSearchProjection | Provides indexable, rebuildable discovery data. | Extend projection builder instead of editing index records directly. |\n| Product BackOffice capability | Declares Axis workbench metadata for business users. | Add backend-declared columns, summaries, and actions. |\n\nProject customization should happen in the owning product layer or a later project module. For example, an apparel project can add size charts, fabric composition, sustainability badges, and fit attributes while keeping the base Product identity and publication contract intact. An electronics project can add warranty, energy rating, and technical specifications. Those properties must be documented with type, validation, indexing, import/export, Axis visibility, and publication behavior.\n\nImplementation evidence is held in product schemas, product discovery API contracts, product localization contracts, domain enrichment tests, localized search publication tests, and generated schema contracts for Product, Category, Variant, Localization, Publication, and Search Projection.\n\n## Source authoring APIs\n\nProduct source authoring is available through selective capabilities/search/create/update APIs using its existing generated controller. Broad CRUD stays disabled; writes require Staged. Axis follows the backend route projection and Copilot uses the canonical Product PUT API after confirmation. See [selective schema APIs](/docs/framework/schema-data-modeling-management#selective-module-apis-and-route-driven-clients) for payloads, authorization compatibility, route customization, deployment order and remaining acceptance. No live-authenticated acceptance is implied by the source and prepared-runtime tests.\n",
      "previous": {
        "title": "Site Publication and Visibility",
        "route": "/docs/framework/wcms-site-publication-visibility"
      },
      "next": {
        "title": "Search, Indexing, and Discovery",
        "route": "/docs/framework/discovery-search-indexing"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "product",
        "owner": "product",
        "sourcePath": "data/docs-v001/records/documentation/productDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/productDocumentationComponentData.js",
        "wordCount": 1473,
        "checksum": "58753c6854fc36a128c505f5658e92dd1ad50384eeaa81b8ac90ed5ef4795cea"
      },
      "slug": "catalog-product-discovery-management",
      "locale": "en",
      "navigationGroup": "Catalog Model and Publication",
      "navigationGroupCode": "catalog-model-and-publication",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "commerce.base-foundations",
          "owner": "nodics.docs"
        },
        {
          "documentId": "discovery.search-indexing",
          "owner": "discoveryRuntime"
        },
        {
          "documentId": "wcms.media-management",
          "owner": "media"
        }
      ]
    },
    "active": true
  }
};
