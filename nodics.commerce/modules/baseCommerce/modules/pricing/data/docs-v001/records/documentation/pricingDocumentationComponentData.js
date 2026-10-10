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
    "code": "nodicsDocsComponentpricingPromotionsTaxManagement",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "pricing.promotions-tax-management",
      "title": "Pricing, Promotions, and Tax Management",
      "route": "/docs/framework/pricing-promotions-tax-management",
      "section": "pricing-promotions-and-tax",
      "sectionTitle": "Pricing, Promotions, and Tax",
      "group": "pricing-promotions-and-tax",
      "groupTitle": "Pricing, Promotions, and Tax",
      "parentId": "pricing-promotions-and-tax",
      "hierarchyPath": [
        "Pricing, Promotions, and Tax",
        "Pricing, Promotions, and Tax Management"
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
      "summary": "Price books, price rows, promotion decisions, coupon behavior, tax policies, calculation evidence, and extension boundaries.",
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
        "commerce.cart-order",
        "inventory.stock-management",
        "commerce.base-foundations"
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
        "pricing-promotions-and-tax",
        "commercial-decisioning",
        "pricing-promotions-and-tax-management"
      ],
      "topicKeywords": [
        "Pricing, Promotions, and Tax",
        "Commercial Decisioning",
        "Pricing, Promotions, and Tax Management"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "pricingPromotionsTaxManagement-1-business-context",
          "level": 2
        },
        {
          "text": "Journey and ownership",
          "anchor": "pricingPromotionsTaxManagement-2-journey-and-ownership",
          "level": 2
        },
        {
          "text": "Data and configuration detail",
          "anchor": "pricingPromotionsTaxManagement-3-data-and-configuration-detail",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "pricingPromotionsTaxManagement-4-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "pricingPromotionsTaxManagement-5-operations-and-governance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "pricingPromotionsTaxManagement-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "pricingPromotionsTaxManagement-7-verification",
          "level": 2
        },
        {
          "text": "Current implementation coverage",
          "anchor": "pricingPromotionsTaxManagement-8-current-implementation-coverage",
          "level": 2
        },
        {
          "text": "Source authoring APIs",
          "anchor": "pricingPromotionsTaxManagement-9-source-authoring-apis",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Price books, price rows, promotion decisions, coupon behavior, tax policies, calculation evidence, and extension boundaries. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs."
        },
        {
          "kind": "paragraph",
          "text": "Revenue leakage appears when prices, discounts, taxes, and totals are recalculated differently by storefronts, checkout, operators, and integrations. Commercial decisions are made by owner modules and returned as exact evidence. Cart and Checkout coordinate those decisions but do not invent prices, discounts, or tax outcomes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "pricingPromotionsTaxManagement-1-business-context"
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
              "Revenue leakage appears when prices, discounts, taxes, and totals are recalculated differently by storefronts, checkout, operators, and integrations."
            ],
            [
              "Who uses it?",
              "Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools."
            ],
            [
              "What changes can it support?",
              "Commercial decisions are made by owner modules and returned as exact evidence. Cart and Checkout coordinate those decisions but do not invent prices, discounts, or tax outcomes."
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
          "anchor": "pricingPromotionsTaxManagement-2-journey-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Pricing owns price books and decisions, Promotion owns campaign and discount decisions, Tax owns tax policy and decisions, and Cart records calculation evidence. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state."
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
              "Pricing, Promotions, and Tax",
              "Used in navigation and dashboards so readers are not exposed to raw module names first."
            ],
            [
              "Source owner",
              "nodics.commerce",
              "Carries exact implementation, documentation, and validation evidence."
            ],
            [
              "Technical module",
              "pricing",
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
          "anchor": "pricingPromotionsTaxManagement-3-data-and-configuration-detail"
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
          "text": "priceDecision: { sku: \"sku-100\", currency: \"USD\", priceBook: \"retail\", amount: \"49.99\" }"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "pricingPromotionsTaxManagement-4-customization-and-extension"
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
          "anchor": "pricingPromotionsTaxManagement-5-operations-and-governance"
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
          "anchor": "pricingPromotionsTaxManagement-6-common-mistakes"
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
          "anchor": "pricingPromotionsTaxManagement-7-verification"
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
          "anchor": "pricingPromotionsTaxManagement-8-current-implementation-coverage"
        },
        {
          "kind": "paragraph",
          "text": "Pricing, promotions, coupons, and tax are documented together because they all change the financial promise made to the customer. Cart and checkout may ask for a decision, but they do not own the source rules. Pricing owns price books, rows, and selected price evidence. Promotion owns campaign rules, coupon batches, redemptions, budget ledgers, and discount decisions. Tax owns policy and tax decision evidence. The combined calculation must be exact, auditable, tenant-scoped, and reproducible."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Cart[\"Cart context\"] --> Price[\"Price selection\"]\n  Price --> Promotion[\"Promotion and coupon decision\"]\n  Promotion --> Tax[\"Tax policy decision\"]\n  Tax --> Evidence[\"Calculation evidence\"]\n  Evidence --> Checkout[\"Checkout placement\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Capability",
            "Source records",
            "Runtime question"
          ],
          "rows": [
            [
              "Pricing",
              "PriceBook, PriceRow, PriceDecision",
              "Which valid price applies for customer, currency, channel, quantity, and date?"
            ],
            [
              "Promotion",
              "Promotion, Coupon, CouponBatch, PromotionRedemption, PromotionBudgetLedger, DiscountDecision",
              "Which discount is allowed, traceable, budget-safe, and not already redeemed?"
            ],
            [
              "Tax",
              "TaxPolicy, TaxDecision",
              "Which tax rule applies and how is the amount explained?"
            ],
            [
              "Customer summary",
              "CustomerPriceSummary service",
              "What can the storefront show without exposing internal rule details?"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Business customization usually adds market-specific price dimensions, promotion eligibility rules, coupon issue policy, tax jurisdiction mapping, or calculation display requirements. Developer customization should add decision services, validators, or provider ports while preserving exact amount handling and evidence records. Never document a fallback that silently returns zero tax, unlimited discount, or a rounded price without owner approval."
        },
        {
          "kind": "paragraph",
          "text": "Evidence is maintained through pricing selection tests, customer price summary tests, pricing publication tests, promotion simulation and customer API tests, promotion budget schema contracts, tax publication tests, and generated schema contracts for every financial decision record."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source authoring APIs",
          "anchor": "pricingPromotionsTaxManagement-9-source-authoring-apis"
        },
        {
          "kind": "paragraph",
          "text": "PriceRow source authoring uses selective capabilities/search/create/update APIs through the existing generated controller. Generic PriceRow writes now require Staged; Online/Operational/unassigned writes reject. PriceBook and other Pricing schema transports are outside this bounded migration. Publication ingestion keeps its existing domain-owned path. See [selective schema APIs](/docs/framework/schema-data-modeling-management#selective-module-apis-and-route-driven-clients) for payloads, authorization compatibility, route customization, deployment order and remaining acceptance. No live-authenticated acceptance is implied by the source and prepared-runtime tests."
        }
      ],
      "searchText": "Pricing, Promotions, and Tax Management Price books, price rows, promotion decisions, coupon behavior, tax policies, calculation evidence, and extension boundaries. # Pricing, Promotions, and Tax Management\n\nPrice books, price rows, promotion decisions, coupon behavior, tax policies, calculation evidence, and extension boundaries. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nRevenue leakage appears when prices, discounts, taxes, and totals are recalculated differently by storefronts, checkout, operators, and integrations. Commercial decisions are made by owner modules and returned as exact evidence. Cart and Checkout coordinate those decisions but do not invent prices, discounts, or tax outcomes.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | Revenue leakage appears when prices, discounts, taxes, and totals are recalculated differently by storefronts, checkout, operators, and integrations. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | Commercial decisions are made by owner modules and returned as exact evidence. Cart and Checkout coordinate those decisions but do not invent prices, discounts, or tax outcomes. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nPricing owns price books and decisions, Promotion owns campaign and discount decisions, Tax owns tax policy and decisions, and Cart records calculation evidence. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Pricing, Promotions, and Tax | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.commerce | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | pricing | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\npriceDecision: { sku: \"sku-100\", currency: \"USD\", priceBook: \"retail\", amount: \"49.99\" }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n\n## Current implementation coverage\n\nPricing, promotions, coupons, and tax are documented together because they all change the financial promise made to the customer. Cart and checkout may ask for a decision, but they do not own the source rules. Pricing owns price books, rows, and selected price evidence. Promotion owns campaign rules, coupon batches, redemptions, budget ledgers, and discount decisions. Tax owns policy and tax decision evidence. The combined calculation must be exact, auditable, tenant-scoped, and reproducible.\n\n```mermaid\nflowchart LR\n  Cart[\"Cart context\"] --> Price[\"Price selection\"]\n  Price --> Promotion[\"Promotion and coupon decision\"]\n  Promotion --> Tax[\"Tax policy decision\"]\n  Tax --> Evidence[\"Calculation evidence\"]\n  Evidence --> Checkout[\"Checkout placement\"]\n```\n\n| Capability | Source records | Runtime question |\n| --- | --- | --- |\n| Pricing | PriceBook, PriceRow, PriceDecision | Which valid price applies for customer, currency, channel, quantity, and date? |\n| Promotion | Promotion, Coupon, CouponBatch, PromotionRedemption, PromotionBudgetLedger, DiscountDecision | Which discount is allowed, traceable, budget-safe, and not already redeemed? |\n| Tax | TaxPolicy, TaxDecision | Which tax rule applies and how is the amount explained? |\n| Customer summary | CustomerPriceSummary service | What can the storefront show without exposing internal rule details? |\n\nBusiness customization usually adds market-specific price dimensions, promotion eligibility rules, coupon issue policy, tax jurisdiction mapping, or calculation display requirements. Developer customization should add decision services, validators, or provider ports while preserving exact amount handling and evidence records. Never document a fallback that silently returns zero tax, unlimited discount, or a rounded price without owner approval.\n\nEvidence is maintained through pricing selection tests, customer price summary tests, pricing publication tests, promotion simulation and customer API tests, promotion budget schema contracts, tax publication tests, and generated schema contracts for every financial decision record.\n\n## Source authoring APIs\n\nPriceRow source authoring uses selective capabilities/search/create/update APIs through the existing generated controller. Generic PriceRow writes now require Staged; Online/Operational/unassigned writes reject. PriceBook and other Pricing schema transports are outside this bounded migration. Publication ingestion keeps its existing domain-owned path. See [selective schema APIs](/docs/framework/schema-data-modeling-management#selective-module-apis-and-route-driven-clients) for payloads, authorization compatibility, route customization, deployment order and remaining acceptance. No live-authenticated acceptance is implied by the source and prepared-runtime tests.\n",
      "previous": {
        "title": "Inventory and Stock Management",
        "route": "/docs/framework/inventory-stock-management"
      },
      "next": {
        "title": "Commerce overview",
        "route": "/docs/framework/commerce-overview"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "pricing",
        "owner": "pricing",
        "sourcePath": "data/docs-v001/records/documentation/pricingDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/pricingDocumentationComponentData.js",
        "wordCount": 1432,
        "checksum": "fa9bdd2ae944b660194c568eebaebe79511768d99d7619f8ac14d0c1b94e09a3"
      },
      "slug": "pricing-promotions-tax-management",
      "locale": "en",
      "navigationGroup": "Commercial Decisioning",
      "navigationGroupCode": "commercial-decisioning",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore"
        },
        {
          "documentId": "inventory.stock-management",
          "owner": "inventory"
        },
        {
          "documentId": "commerce.base-foundations",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  }
};
