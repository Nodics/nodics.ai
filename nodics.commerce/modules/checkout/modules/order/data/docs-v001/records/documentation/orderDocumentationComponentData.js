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
    "code": "nodicsDocsComponentorderManagementLifecycle",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "order.management-lifecycle",
      "title": "Order Management Lifecycle",
      "route": "/docs/framework/order-management-lifecycle",
      "section": "order-management",
      "sectionTitle": "Order Management",
      "group": "order-management",
      "groupTitle": "Order Management",
      "parentId": "order-management",
      "hierarchyPath": [
        "Order Management",
        "Order Management Lifecycle"
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
      "summary": "Order state, operational ownership, fulfillment coordination, lifecycle requests, history, reversals, and support visibility.",
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
        "commerce.returns-refunds",
        "fulfillment.shipping-management"
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
        "order-management",
        "order-state-and-operations",
        "order-management-lifecycle"
      ],
      "topicKeywords": [
        "Order Management",
        "Order State and Operations",
        "Order Management Lifecycle"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "orderManagementLifecycle-1-business-context",
          "level": 2
        },
        {
          "text": "Journey and ownership",
          "anchor": "orderManagementLifecycle-2-journey-and-ownership",
          "level": 2
        },
        {
          "text": "Data and configuration detail",
          "anchor": "orderManagementLifecycle-3-data-and-configuration-detail",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "orderManagementLifecycle-4-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "orderManagementLifecycle-5-operations-and-governance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "orderManagementLifecycle-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "orderManagementLifecycle-7-verification",
          "level": 2
        },
        {
          "text": "Current implementation coverage",
          "anchor": "orderManagementLifecycle-8-current-implementation-coverage",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Order state, operational ownership, fulfillment coordination, lifecycle requests, history, reversals, and support visibility. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs."
        },
        {
          "kind": "paragraph",
          "text": "After placement, business users need to manage order state, exceptions, fulfillment, support actions, and lifecycle changes without rewriting the original commercial facts. Order Management stores durable order state and append-only history, coordinates lifecycle requests, and links to fulfillment, payment, cancellation, return, and refund evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "orderManagementLifecycle-1-business-context"
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
              "After placement, business users need to manage order state, exceptions, fulfillment, support actions, and lifecycle changes without rewriting the original commercial facts."
            ],
            [
              "Who uses it?",
              "Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools."
            ],
            [
              "What changes can it support?",
              "Order Management stores durable order state and append-only history, coordinates lifecycle requests, and links to fulfillment, payment, cancellation, return, and refund evidence."
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
          "anchor": "orderManagementLifecycle-2-journey-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Order owns the post-placement commercial lifecycle. Checkout owns creation, Fulfillment owns shipment execution, and reverse lifecycle capabilities own cancellation, return, and refund workflows. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state."
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
              "Order Management",
              "Used in navigation and dashboards so readers are not exposed to raw module names first."
            ],
            [
              "Source owner",
              "nodics.commerce",
              "Carries exact implementation, documentation, and validation evidence."
            ],
            [
              "Technical module",
              "order",
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
          "anchor": "orderManagementLifecycle-3-data-and-configuration-detail"
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
          "text": "orderLifecycleRequest: { order: \"order-100\", action: \"cancel\", reason: \"customer-request\", approval: \"policy\" }"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "orderManagementLifecycle-4-customization-and-extension"
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
          "anchor": "orderManagementLifecycle-5-operations-and-governance"
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
          "anchor": "orderManagementLifecycle-6-common-mistakes"
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
          "anchor": "orderManagementLifecycle-7-verification"
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
          "anchor": "orderManagementLifecycle-8-current-implementation-coverage"
        },
        {
          "kind": "paragraph",
          "text": "Order management starts after checkout creates the order. Cart and order creation belong to the checkout journey; this page owns what happens after the order exists: state changes, operational readiness, history, lifecycle requests, lifecycle versions, checkpoints, reverse operations, and support visibility. This separation helps business users understand that checkout places an order, while order management protects and governs the order after placement."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Checkout[\"Checkout placement\"] --> Order[\"Commerce order\"]\n  Order --> History[\"Order history\"]\n  Order --> Request[\"Lifecycle request\"]\n  Request --> Version[\"Lifecycle version\"]\n  Version --> Checkpoint[\"Lifecycle checkpoint\"]\n  Checkpoint --> Reverse[\"Cancellation, return, or refund flow\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Record or service",
            "Business purpose",
            "Developer concern"
          ],
          "rows": [
            [
              "CommerceOrder and CommerceOrderEntry",
              "Durable commercial promise created by checkout.",
              "Preserve totals, ownership, tenant, and original calculation evidence."
            ],
            [
              "OrderHistory",
              "Append-only explanation of important changes.",
              "Never erase history to correct a state."
            ],
            [
              "OrderLifecycleRequest",
              "Governed request for cancellation, return, refund, hold, or support action.",
              "Enforce eligibility, permission, and expected revision."
            ],
            [
              "OrderLifecycleVersion",
              "Versioned decision evidence for lifecycle operations.",
              "Preserve policy version and actor evidence."
            ],
            [
              "OrderLifecycleCheckpoint",
              "Restart-safe recovery point.",
              "Make retries idempotent and observable."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Axis should show order state, lifecycle requests, exceptions, reverse-flow status, customer ownership, and support evidence. Developer customization should add lifecycle policies, workflow hooks, projections, or domain services instead of editing the generated order service. Any project extension must explain whether it changes eligibility, state transition, audit, customer visibility, or compensation."
        },
        {
          "kind": "paragraph",
          "text": "Implementation evidence comes from order customer API tests, reverse lifecycle depth tests, operational readiness tests, and generated schema contracts for Order, OrderEntry, History, Lifecycle Request, Lifecycle Version, Lifecycle Checkpoint, and Reversal Calculation."
        }
      ],
      "searchText": "Order Management Lifecycle Order state, operational ownership, fulfillment coordination, lifecycle requests, history, reversals, and support visibility. # Order Management Lifecycle\n\nOrder state, operational ownership, fulfillment coordination, lifecycle requests, history, reversals, and support visibility. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nAfter placement, business users need to manage order state, exceptions, fulfillment, support actions, and lifecycle changes without rewriting the original commercial facts. Order Management stores durable order state and append-only history, coordinates lifecycle requests, and links to fulfillment, payment, cancellation, return, and refund evidence.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | After placement, business users need to manage order state, exceptions, fulfillment, support actions, and lifecycle changes without rewriting the original commercial facts. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | Order Management stores durable order state and append-only history, coordinates lifecycle requests, and links to fulfillment, payment, cancellation, return, and refund evidence. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nOrder owns the post-placement commercial lifecycle. Checkout owns creation, Fulfillment owns shipment execution, and reverse lifecycle capabilities own cancellation, return, and refund workflows. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Order Management | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.commerce | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | order | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\norderLifecycleRequest: { order: \"order-100\", action: \"cancel\", reason: \"customer-request\", approval: \"policy\" }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n\n## Current implementation coverage\n\nOrder management starts after checkout creates the order. Cart and order creation belong to the checkout journey; this page owns what happens after the order exists: state changes, operational readiness, history, lifecycle requests, lifecycle versions, checkpoints, reverse operations, and support visibility. This separation helps business users understand that checkout places an order, while order management protects and governs the order after placement.\n\n```mermaid\nflowchart LR\n  Checkout[\"Checkout placement\"] --> Order[\"Commerce order\"]\n  Order --> History[\"Order history\"]\n  Order --> Request[\"Lifecycle request\"]\n  Request --> Version[\"Lifecycle version\"]\n  Version --> Checkpoint[\"Lifecycle checkpoint\"]\n  Checkpoint --> Reverse[\"Cancellation, return, or refund flow\"]\n```\n\n| Record or service | Business purpose | Developer concern |\n| --- | --- | --- |\n| CommerceOrder and CommerceOrderEntry | Durable commercial promise created by checkout. | Preserve totals, ownership, tenant, and original calculation evidence. |\n| OrderHistory | Append-only explanation of important changes. | Never erase history to correct a state. |\n| OrderLifecycleRequest | Governed request for cancellation, return, refund, hold, or support action. | Enforce eligibility, permission, and expected revision. |\n| OrderLifecycleVersion | Versioned decision evidence for lifecycle operations. | Preserve policy version and actor evidence. |\n| OrderLifecycleCheckpoint | Restart-safe recovery point. | Make retries idempotent and observable. |\n\nAxis should show order state, lifecycle requests, exceptions, reverse-flow status, customer ownership, and support evidence. Developer customization should add lifecycle policies, workflow hooks, projections, or domain services instead of editing the generated order service. Any project extension must explain whether it changes eligibility, state transition, audit, customer visibility, or compensation.\n\nImplementation evidence comes from order customer API tests, reverse lifecycle depth tests, operational readiness tests, and generated schema contracts for Order, OrderEntry, History, Lifecycle Request, Lifecycle Version, Lifecycle Checkpoint, and Reversal Calculation.\n",
      "previous": {
        "title": "Shipping and Fulfillment Management",
        "route": "/docs/framework/fulfillment-shipping-management"
      },
      "next": {
        "title": "Cancellation, return, and refund lifecycle",
        "route": "/docs/framework/commerce-returns-refunds"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "order",
        "owner": "order",
        "sourcePath": "data/docs-v001/records/documentation/orderDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/orderDocumentationComponentData.js",
        "wordCount": 1342,
        "checksum": "71ae5c8d28bccccbc8518ae4e7f3efa8dd71efd153f202708a365834c23aa3d3"
      },
      "slug": "order-management-lifecycle",
      "locale": "en",
      "navigationGroup": "Order State and Operations",
      "navigationGroupCode": "order-state-and-operations",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore"
        },
        {
          "documentId": "commerce.returns-refunds",
          "owner": "order"
        },
        {
          "documentId": "fulfillment.shipping-management",
          "owner": "fulfillmentCore"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentcommerceReturnsRefunds",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "commerce.returns-refunds",
      "title": "Cancellation, return, and refund lifecycle",
      "route": "/docs/framework/commerce-returns-refunds",
      "section": "cancellations-returns-and-refunds",
      "sectionTitle": "Cancellations, Returns, and Refunds",
      "group": "cancellations-returns-and-refunds",
      "groupTitle": "Cancellations, Returns, and Refunds",
      "parentId": "cancellations-returns-and-refunds",
      "hierarchyPath": [
        "Cancellations, Returns, and Refunds",
        "Cancellation, return, and refund lifecycle"
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
      "summary": "Structured self-service and operator journey for policy, maker-checker approval, owner intents, checkpoints, recovery, and final Order evidence.",
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
        "commerce.payment-fulfillment"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/manifest.json",
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "cancellations-returns-and-refunds",
        "reverse-order-lifecycle",
        "cancellation-return-and-refund-lifecycle"
      ],
      "topicKeywords": [
        "Cancellations, Returns, and Refunds",
        "Reverse Order Lifecycle",
        "Cancellation, return, and refund lifecycle"
      ],
      "headings": [
        {
          "text": "Staged Purchased Coupon Increment",
          "anchor": "commerceReturnsRefunds-1-staged-purchased-coupon-increment",
          "level": 2
        },
        {
          "text": "Why one lifecycle is needed",
          "anchor": "commerceReturnsRefunds-2-why-one-lifecycle-is-needed",
          "level": 2
        },
        {
          "text": "Customer self-service journey",
          "anchor": "commerceReturnsRefunds-3-customer-self-service-journey",
          "level": 2
        },
        {
          "text": "Administrator and operator journey",
          "anchor": "commerceReturnsRefunds-4-administrator-and-operator-journey",
          "level": 2
        },
        {
          "text": "Developer guidance",
          "anchor": "commerceReturnsRefunds-5-developer-guidance",
          "level": 2
        },
        {
          "text": "Operator and DevOps guidance",
          "anchor": "commerceReturnsRefunds-6-operator-and-devops-guidance",
          "level": 2
        },
        {
          "text": "Security and privacy",
          "anchor": "commerceReturnsRefunds-7-security-and-privacy",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "commerceReturnsRefunds-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "commerceReturnsRefunds-9-verification",
          "level": 2
        },
        {
          "text": "Return Receipt And Reversal Calculation Coverage",
          "anchor": "commerceReturnsRefunds-10-return-receipt-and-reversal-calculation-coverage",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Staged Purchased Coupon Increment",
          "anchor": "commerceReturnsRefunds-1-staged-purchased-coupon-increment"
        },
        {
          "kind": "paragraph",
          "text": "Coupon purchases reuse Commerce rather than a customer-specific refund engine. The staged source strengthens owner CAS/readback, preserves original sale time on replay and hands partial digital acquisitions to Checkout compensation. An uncertain unit remains recovery-required; known releases do not prove all effects were undone."
        },
        {
          "kind": "paragraph",
          "text": "Promotion's purchasedRights defaults disabled/unqualified. Qualified campaign policy can retain a purchase-relative duration, disclosed terms, benefit/outlet conditions and optional refund window/request types. The clock starts at the original successful sale, not offer launch or delayed delivery. Legacy codes keep their existing policy; historical issued rights must not be silently rewritten. A stored JSON snapshot is not proof of immutable storage or complete generic-CRUD provenance protection."
        },
        {
          "kind": "paragraph",
          "text": "Digital Core checks retained refund eligibility before locking an unused entitlement. Missing terms require manual review, rather than a universal digital-product refund rule. Order/Payment remain the approval, capture reversal and recovery owners. Current automatic full-order refund capture supports qualified original loyalty points evidence; this is not general cash-provider or split-tender acceptance. Circa displays backend-provided expiration and retained text terms; browser dates do not authorize redemption or refunds."
        },
        {
          "kind": "paragraph",
          "text": "Digital Core now compares a complete bounded purchase-unit multiset at preview, preparation and completion: aggregate repeated-product entries, unique entitlement and provider identities, exact tenant/enterprise/customer/order/Promotion binding, and no missing/extra units. An empty read cannot return completed reversal. The 100-unit complete-read boundary and installed provider pagination remain explicit qualification constraints, not universal large-order support."
        },
        {
          "kind": "paragraph",
          "text": "Purchase/refund EMAIL/SMS bundles are module-owned optional resources. They contain no coupon code, require explicit selection and do not activate lifecycle triggers. Only confirmed owner purchase/refund evidence can authorize a notification intent; pending or uncertain reversal must not send a completed-refund message. Override individual HTML/text files through existing customer/runtime template layers."
        },
        {
          "kind": "paragraph",
          "text": "Source availability and authored fixtures are not installed qualification. Seller authorization, receipt minimum-spend/cap/item validation, protected policy provenance, all races/partial recovery and real provider/customer acceptance remain gates."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Why one lifecycle is needed",
          "anchor": "commerceReturnsRefunds-2-why-one-lifecycle-is-needed"
        },
        {
          "kind": "paragraph",
          "text": "Cancellation, return, and refund are related but different business intents. Cancellation tries to stop unfulfilled work. Return moves delivered goods back through Fulfillment and Inventory. Refund moves money through Payment. Order owns the customer intent, eligibility snapshot, approval trail, checkpoints, and final history projection."
        },
        {
          "kind": "table",
          "headers": [
            "Intent",
            "Typical prerequisite",
            "Domain actions"
          ],
          "rows": [
            [
              "Cancellation",
              "cancellable unfulfilled quantity",
              "Fulfillment stop, Inventory release, Payment void or refund"
            ],
            [
              "Return",
              "delivered eligible quantity",
              "RMA, receipt, inspection, Inventory disposition, Payment refund"
            ],
            [
              "Refund",
              "captured refundable amount",
              "maker-checker approval, Payment refund, reconciliation"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Catalog and Product screens do not initiate these actions because a product alone has no customer, quantity, shipment, payment, or settlement evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customer self-service journey",
          "anchor": "commerceReturnsRefunds-3-customer-self-service-journey"
        },
        {
          "kind": "paragraph",
          "text": "For beginners, requesting a reversal is not the same as completing it."
        },
        {
          "kind": "paragraph",
          "text": "The customer opens an owned Order, selects eligible entries and quantities, chooses a reason, and requests a preview. The backend evaluates policy and returns exact refundable amounts, non-refundable charges, tax and discount allocation, expected logistics, approval requirements, and expiry. Submitting creates an immutable request version with an idempotency key."
        },
        {
          "kind": "paragraph",
          "text": "The customer can read only their own requests. A retry returns the original result. The UI shows pending, awaiting approval, logistics, inspection, refund, reconciliation, completed, rejected, or failed states from backend evidence. It never promises money before Payment confirms the outcome."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Administrator and operator journey",
          "anchor": "commerceReturnsRefunds-4-administrator-and-operator-journey"
        },
        {
          "kind": "paragraph",
          "text": "An operator sees queues grouped by Order lifecycle, not Catalog keywords. Approval is governed by tenant scope, workflow state, and explicit permissions, with requester identity retained as audit evidence. The approver sees policy version, quantities, exact allocation, source Order revision, fulfillment state, payment state, customer reason, and risk evidence."
        },
        {
          "kind": "paragraph",
          "text": "After approval, the workflow calls Fulfillment, Inventory, and Payment through owner intents. Each step records a checkpoint. Failures remain retryable and reconcilable. Emergency stop may pause new execution but cannot erase already completed provider or warehouse evidence."
        },
        {
          "kind": "paragraph",
          "text": "Axis keeps Cancellation, Return, and Refund as distinct workspaces and provides links only within the backend-published hierarchy. Payment reconciliation remains in Payment Operations. Return receipt and inspection remain in Fulfillment Operations. Catalog displays the explicit message that no catalog-only refund action exists."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer guidance",
          "anchor": "commerceReturnsRefunds-5-developer-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Developers change eligibility through versioned policy pipelines. Exact reversal allocation must reference original price, discount, tax, payment, shipment, and prior reversal evidence. Never recalculate a historic order using today’s price or tax policy."
        },
        {
          "kind": "paragraph",
          "text": "Workflow definitions are configured for cancellation, return, and refund with maker-checker steps. Order coordinates but delegates physical and monetary actions. Every service accepts tenant and correlation evidence. Customer extensions may add policy steps or approval thresholds through later layers while retaining owner contracts and history."
        },
        {
          "kind": "paragraph",
          "text": "Compatibility aliases support migration for two minor releases or 180 days, whichever approved window applies. Aliases map old names to new contracts; they do not keep duplicate authorities alive."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator and DevOps guidance",
          "anchor": "commerceReturnsRefunds-6-operator-and-devops-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Monitor pending approvals, checkpoint age, retry counts, unknown payment outcomes, return-in-transit age, inspection backlog, disposition drift, and Order projection lag. Recovery resumes from the last durable checkpoint and reuses idempotency keys."
        },
        {
          "kind": "paragraph",
          "text": "Backup/restore acceptance must prove requests, versions, approvals, checkpoints, owner evidence, and Order history remain consistent. Disaster recovery must not reissue refunds. Reconciliation compares restored state with Payment and Fulfillment providers before progressing unknown work."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Security and privacy",
          "anchor": "commerceReturnsRefunds-7-security-and-privacy"
        },
        {
          "kind": "paragraph",
          "text": "Customer access requires ownership checks. Operator and approver permissions are separate. Service calls use service audiences. Reasons and evidence may contain protected data, so Axis receives only necessary projections and exports are bounded, audited, and retention-controlled."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "commerceReturnsRefunds-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Starting refunds from Product or Catalog.",
            "Treating requester identity as the approval gate instead of checking tenant scope, workflow state, and explicit permissions.",
            "Repricing historic orders with current policy.",
            "Issuing a second refund after timeout.",
            "Updating the original Order instead of appending history.",
            "Restocking before receipt and inspection evidence.",
            "Treating UI visibility as backend authorization."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "commerceReturnsRefunds-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Test customer ownership, tenant isolation, eligibility rejection, exact partial allocation, duplicate request, approval permission enforcement, cancellation before and after shipment, partial return, failed pickup, inspection disposition, void versus refund, provider timeout, checkpoint restart, reconciliation, and final Order history. Axis tests verify domain hierarchy, no Catalog refund action, accessibility, responsive rendering, and backend denial behavior. Production release requires approved policy, provider, legal, finance, operations, recovery, and residual-risk evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Return Receipt And Reversal Calculation Coverage",
          "anchor": "commerceReturnsRefunds-10-return-receipt-and-reversal-calculation-coverage"
        },
        {
          "kind": "paragraph",
          "text": "Cancellation, return, and refund documentation must show how the reverse journey is assembled from order lifecycle, fulfillment return, receipt, inspection, payment refund, and reversal calculation evidence. The key business rule is that no domain acts alone: order owns lifecycle eligibility, fulfillment owns physical return evidence, payment owns money movement, and history explains the final customer-visible state."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Request[\"Lifecycle request\"] --> Eligibility[\"Order eligibility\"]\n  Eligibility --> Reversal[\"Order reversal calculation\"]\n  Reversal --> Return[\"Fulfillment return\"]\n  Return --> Receipt[\"Return receipt\"]\n  Receipt --> Inspection[\"Return inspection\"]\n  Inspection --> Refund[\"Payment refund\"]\n  Refund --> History[\"Order history\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Reverse-flow record",
            "Purpose",
            "Documentation requirement"
          ],
          "rows": [
            [
              "OrderReversalCalculation",
              "Calculates eligible cancellation, return, or refund amount.",
              "Explain exact amount, historic pricing, tax, discounts, shipping, and partial quantity."
            ],
            [
              "FulfillmentReturn",
              "Owns operational return process.",
              "Explain pickup/drop-off, carrier, warehouse, and failed return behavior."
            ],
            [
              "ReturnReceipt",
              "Proves returned goods were received.",
              "Explain receipt time, location, quantity, and condition evidence."
            ],
            [
              "ReturnInspection",
              "Decides restock, reject, repair, or dispose.",
              "Explain policy, actor, reason, and inventory impact."
            ],
            [
              "Payment refund entry",
              "Moves money only after approved evidence.",
              "Explain idempotency, provider outcome, reconciliation, and duplicate prevention."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Axis should present this as a single guided business journey with links to the owning records. Developers should extend eligibility policy, inspection policy, or provider execution through owning services and tests."
        }
      ],
      "searchText": "Cancellation, return, and refund lifecycle Structured self-service and operator journey for policy, maker-checker approval, owner intents, checkpoints, recovery, and final Order evidence. # Cancellation, return, and refund lifecycle\n\n## Staged Purchased Coupon Increment\n\nCoupon purchases reuse Commerce rather than a customer-specific refund engine. The staged source strengthens owner CAS/readback, preserves original sale time on replay and hands partial digital acquisitions to Checkout compensation. An uncertain unit remains recovery-required; known releases do not prove all effects were undone.\n\nPromotion's purchasedRights defaults disabled/unqualified. Qualified campaign policy can retain a purchase-relative duration, disclosed terms, benefit/outlet conditions and optional refund window/request types. The clock starts at the original successful sale, not offer launch or delayed delivery. Legacy codes keep their existing policy; historical issued rights must not be silently rewritten. A stored JSON snapshot is not proof of immutable storage or complete generic-CRUD provenance protection.\n\nDigital Core checks retained refund eligibility before locking an unused entitlement. Missing terms require manual review, rather than a universal digital-product refund rule. Order/Payment remain the approval, capture reversal and recovery owners. Current automatic full-order refund capture supports qualified original loyalty points evidence; this is not general cash-provider or split-tender acceptance. Circa displays backend-provided expiration and retained text terms; browser dates do not authorize redemption or refunds.\n\nDigital Core now compares a complete bounded purchase-unit multiset at preview, preparation and completion: aggregate repeated-product entries, unique entitlement and provider identities, exact tenant/enterprise/customer/order/Promotion binding, and no missing/extra units. An empty read cannot return completed reversal. The 100-unit complete-read boundary and installed provider pagination remain explicit qualification constraints, not universal large-order support.\n\nPurchase/refund EMAIL/SMS bundles are module-owned optional resources. They contain no coupon code, require explicit selection and do not activate lifecycle triggers. Only confirmed owner purchase/refund evidence can authorize a notification intent; pending or uncertain reversal must not send a completed-refund message. Override individual HTML/text files through existing customer/runtime template layers.\n\nSource availability and authored fixtures are not installed qualification. Seller authorization, receipt minimum-spend/cap/item validation, protected policy provenance, all races/partial recovery and real provider/customer acceptance remain gates.\n\n## Why one lifecycle is needed\n\nCancellation, return, and refund are related but different business intents. Cancellation tries to stop unfulfilled work. Return moves delivered goods back through Fulfillment and Inventory. Refund moves money through Payment. Order owns the customer intent, eligibility snapshot, approval trail, checkpoints, and final history projection.\n\n| Intent | Typical prerequisite | Domain actions |\n| --- | --- | --- |\n| Cancellation | cancellable unfulfilled quantity | Fulfillment stop, Inventory release, Payment void or refund |\n| Return | delivered eligible quantity | RMA, receipt, inspection, Inventory disposition, Payment refund |\n| Refund | captured refundable amount | maker-checker approval, Payment refund, reconciliation |\n\nCatalog and Product screens do not initiate these actions because a product alone has no customer, quantity, shipment, payment, or settlement evidence.\n\n## Customer self-service journey\n\nFor beginners, requesting a reversal is not the same as completing it.\n\nThe customer opens an owned Order, selects eligible entries and quantities, chooses a reason, and requests a preview. The backend evaluates policy and returns exact refundable amounts, non-refundable charges, tax and discount allocation, expected logistics, approval requirements, and expiry. Submitting creates an immutable request version with an idempotency key.\n\nThe customer can read only their own requests. A retry returns the original result. The UI shows pending, awaiting approval, logistics, inspection, refund, reconciliation, completed, rejected, or failed states from backend evidence. It never promises money before Payment confirms the outcome.\n\n## Administrator and operator journey\n\nAn operator sees queues grouped by Order lifecycle, not Catalog keywords. Approval is governed by tenant scope, workflow state, and explicit permissions, with requester identity retained as audit evidence. The approver sees policy version, quantities, exact allocation, source Order revision, fulfillment state, payment state, customer reason, and risk evidence.\n\nAfter approval, the workflow calls Fulfillment, Inventory, and Payment through owner intents. Each step records a checkpoint. Failures remain retryable and reconcilable. Emergency stop may pause new execution but cannot erase already completed provider or warehouse evidence.\n\nAxis keeps Cancellation, Return, and Refund as distinct workspaces and provides links only within the backend-published hierarchy. Payment reconciliation remains in Payment Operations. Return receipt and inspection remain in Fulfillment Operations. Catalog displays the explicit message that no catalog-only refund action exists.\n\n## Developer guidance\n\nDevelopers change eligibility through versioned policy pipelines. Exact reversal allocation must reference original price, discount, tax, payment, shipment, and prior reversal evidence. Never recalculate a historic order using today’s price or tax policy.\n\nWorkflow definitions are configured for cancellation, return, and refund with maker-checker steps. Order coordinates but delegates physical and monetary actions. Every service accepts tenant and correlation evidence. Customer extensions may add policy steps or approval thresholds through later layers while retaining owner contracts and history.\n\nCompatibility aliases support migration for two minor releases or 180 days, whichever approved window applies. Aliases map old names to new contracts; they do not keep duplicate authorities alive.\n\n## Operator and DevOps guidance\n\nMonitor pending approvals, checkpoint age, retry counts, unknown payment outcomes, return-in-transit age, inspection backlog, disposition drift, and Order projection lag. Recovery resumes from the last durable checkpoint and reuses idempotency keys.\n\nBackup/restore acceptance must prove requests, versions, approvals, checkpoints, owner evidence, and Order history remain consistent. Disaster recovery must not reissue refunds. Reconciliation compares restored state with Payment and Fulfillment providers before progressing unknown work.\n\n## Security and privacy\n\nCustomer access requires ownership checks. Operator and approver permissions are separate. Service calls use service audiences. Reasons and evidence may contain protected data, so Axis receives only necessary projections and exports are bounded, audited, and retention-controlled.\n\n## Common mistakes\n\n- Starting refunds from Product or Catalog.\n- Treating requester identity as the approval gate instead of checking tenant scope, workflow state, and explicit permissions.\n- Repricing historic orders with current policy.\n- Issuing a second refund after timeout.\n- Updating the original Order instead of appending history.\n- Restocking before receipt and inspection evidence.\n- Treating UI visibility as backend authorization.\n\n## Verification\n\nTest customer ownership, tenant isolation, eligibility rejection, exact partial allocation, duplicate request, approval permission enforcement, cancellation before and after shipment, partial return, failed pickup, inspection disposition, void versus refund, provider timeout, checkpoint restart, reconciliation, and final Order history. Axis tests verify domain hierarchy, no Catalog refund action, accessibility, responsive rendering, and backend denial behavior. Production release requires approved policy, provider, legal, finance, operations, recovery, and residual-risk evidence.\n\n## Return Receipt And Reversal Calculation Coverage\n\nCancellation, return, and refund documentation must show how the reverse journey is assembled from order lifecycle, fulfillment return, receipt, inspection, payment refund, and reversal calculation evidence. The key business rule is that no domain acts alone: order owns lifecycle eligibility, fulfillment owns physical return evidence, payment owns money movement, and history explains the final customer-visible state.\n\n```mermaid\nflowchart LR\n  Request[\"Lifecycle request\"] --> Eligibility[\"Order eligibility\"]\n  Eligibility --> Reversal[\"Order reversal calculation\"]\n  Reversal --> Return[\"Fulfillment return\"]\n  Return --> Receipt[\"Return receipt\"]\n  Receipt --> Inspection[\"Return inspection\"]\n  Inspection --> Refund[\"Payment refund\"]\n  Refund --> History[\"Order history\"]\n```\n\n| Reverse-flow record | Purpose | Documentation requirement |\n| --- | --- | --- |\n| OrderReversalCalculation | Calculates eligible cancellation, return, or refund amount. | Explain exact amount, historic pricing, tax, discounts, shipping, and partial quantity. |\n| FulfillmentReturn | Owns operational return process. | Explain pickup/drop-off, carrier, warehouse, and failed return behavior. |\n| ReturnReceipt | Proves returned goods were received. | Explain receipt time, location, quantity, and condition evidence. |\n| ReturnInspection | Decides restock, reject, repair, or dispose. | Explain policy, actor, reason, and inventory impact. |\n| Payment refund entry | Moves money only after approved evidence. | Explain idempotency, provider outcome, reconciliation, and duplicate prevention. |\n\nAxis should present this as a single guided business journey with links to the owning records. Developers should extend eligibility policy, inspection policy, or provider execution through owning services and tests.\n",
      "previous": {
        "title": "Order Management Lifecycle",
        "route": "/docs/framework/order-management-lifecycle"
      },
      "next": {
        "title": "Customer reviews and ratings",
        "route": "/docs/framework/engagement-customer-reviews"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "order",
        "owner": "order",
        "sourcePath": "data/docs-v001/records/documentation/orderDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/orderDocumentationComponentData.js",
        "wordCount": 1230,
        "checksum": "e9ce1c97dc92dfed6e74f852143abf1a64367e6a051c200d5a64e902fa2bfe4f"
      },
      "slug": "commerce-returns-refunds",
      "locale": "en",
      "navigationGroup": "Reverse Order Lifecycle",
      "navigationGroupCode": "reverse-order-lifecycle",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore"
        },
        {
          "documentId": "commerce.payment-fulfillment",
          "owner": "paymentCore"
        }
      ]
    },
    "active": true
  }
};
