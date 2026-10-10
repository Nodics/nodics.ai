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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagediscoverysearchindexing",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagediscoverySearchIndexing",
    "title": "Search, Indexing, and Discovery",
    "summary": "Elasticsearch, Solr, provider adapters, catalog/content indexing, ranking, query profiles, and search metadata governance.",
    "searchText": "Search, Indexing, and Discovery Elasticsearch, Solr, provider adapters, catalog/content indexing, ranking, query profiles, and search metadata governance. search-and-discovery search-providers-and-indexing search-indexing-and-discovery",
    "keywords": [
      "search-and-discovery",
      "search-providers-and-indexing",
      "search-indexing-and-discovery"
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
    "code": "nodicsDocsSearchpagenodicsdocsmetadatadiscoverysearchindexing",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatadiscoverySearchIndexing",
    "title": "Search, Indexing, and Discovery",
    "summary": "Elasticsearch, Solr, provider adapters, catalog/content indexing, ranking, query profiles, and search metadata governance.",
    "searchText": "Search, Indexing, and Discovery Elasticsearch, Solr, provider adapters, catalog/content indexing, ranking, query profiles, and search metadata governance. # Search, Indexing, and Discovery\n\nElasticsearch, Solr, provider adapters, catalog/content indexing, ranking, query profiles, and search metadata governance. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nSearch should serve products, content, and documentation without forcing each domain to know provider-specific index APIs or ranking details. Discovery separates source projection, index configuration, provider adapters, ranking profiles, and query profiles so a project can replace or add providers while preserving business ownership.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | Search should serve products, content, and documentation without forcing each domain to know provider-specific index APIs or ranking details. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | Discovery separates source projection, index configuration, provider adapters, ranking profiles, and query profiles so a project can replace or add providers while preserving business ownership. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nDiscovery owns source providers, field mappings, index configuration, ranking, query profiles, and provider adapters. Content, Product, and Docs own their source records. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Search and Discovery | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.discovery | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | discovery | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\ndiscoveryIndex: { source: \"documentationContentCatalog\", provider: \"elastic\", fields: [\"title\", \"summary\", \"body\"] }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n\n## Current implementation coverage\n\nDiscovery is broader than product search. The current implementation contains configuration, field mapping, document projection, query, ranking, runtime, publication, and source-provider modules. Commerce product discovery is one consumer of this capability; content catalog and documentation search can use the same pattern because the discovery layer works with index configuration, source providers, field mappings, ranking profiles, and publication policies rather than hardcoded product-only assumptions.\n\n```mermaid\nflowchart LR\n  Source[\"Source provider\"] --> Mapping[\"Field mapping and policy\"]\n  Mapping --> Projection[\"Document projection\"]\n  Projection --> Publication[\"Index publication plan\"]\n  Publication --> Runtime[\"Runtime index provider\"]\n  Runtime --> Query[\"Query profile and ranking\"]\n  Query --> Result[\"Customer, Axis, or Nexus result\"]\n```\n\n| Discovery item | What it controls | Evidence to maintain |\n| --- | --- | --- |\n| Index configuration | Index name, owner type, provider behavior, and lifecycle. | Discovery config and runtime contracts. |\n| Source provider | Where documents come from and how they are grouped. | Source-provider schema and source contracts. |\n| Field mapping | Which fields are indexed, displayed, filtered, or hidden. | Field mapping schema and field policy tests. |\n| Query profile | Query shape, filters, facets, pagination, and response boundaries. | Query contracts and Axis result validation. |\n| Ranking profile/action | Boosting and demotion rules with explainable evidence. | Ranking engine and ranking action tests. |\n| Publication policy | How staged source data becomes indexable runtime data. | Publication planner and publication contracts. |\n\nFor business users, Discovery solves findability and relevance. For developers, it is the extension surface for Elasticsearch, Solr, or other provider adapters. A project should add a source provider or mapping policy instead of letting a storefront build private search documents. Each new searchable domain must explain source ownership, projection rebuild, publication timing, provider constraints, security filtering, and index rollback.\n\nDEAP, the Data Engineering and Analytics Platform solution use case, should link back to this page whenever analytics, operational dashboards, or customer search depend on governed source providers, projections, indexes, ranking rules, and rebuildable search metadata. Discovery explains the indexing and query contract; DEAP explains the broader data engineering journey.\n",
    "keywords": [
      "search-and-discovery",
      "search-providers-and-indexing",
      "search-indexing-and-discovery",
      "Search and Discovery",
      "Search Providers and Indexing",
      "Search, Indexing, and Discovery"
    ],
    "facets": {
      "section": "search-and-discovery",
      "group": "search-and-discovery",
      "navigationDepth": 2,
      "documentType": "integration",
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
