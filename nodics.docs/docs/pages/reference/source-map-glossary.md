# Reference Source Map and Glossary

Business-friendly names, technical source owners, module identifiers, common terms, and navigation-to-code references for documentation readers. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.

Business names should be easy to read, but developers and AI tools also need exact source ownership to avoid changing the wrong module or creating parallel authorities. The reference source map keeps friendly navigation labels connected to module groups, capability modules, docs folders, data records, generated files, and validation commands.

## Business context

For a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.

For beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.

| Business question | Answer for this topic |
| --- | --- |
| What problem does it solve? | Business names should be easy to read, but developers and AI tools also need exact source ownership to avoid changing the wrong module or creating parallel authorities. |
| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |
| What changes can it support? | The reference source map keeps friendly navigation labels connected to module groups, capability modules, docs folders, data records, generated files, and validation commands. |
| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |

## Journey and ownership

Nodics Docs owns the reader-facing reference map. Exact module facts are sourced from package metadata, catalogue entries, generated manifests, and module contracts. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.

```mermaid
flowchart LR
  Reader["Business or developer request"] --> Axis["Axis or Nexus view"]
  Axis --> Backend["Owning backend capability"]
  Backend --> Catalog["Content/catalog/schema/config records"]
  Catalog --> Runtime["Runtime behavior or published page"]
  Runtime --> Evidence["Audit, validation, and support evidence"]
```

| Responsibility | Owner | Notes |
| --- | --- | --- |
| Business capability name | Reference | Used in navigation and dashboards so readers are not exposed to raw module names first. |
| Source owner | nodics.docs | Carries exact implementation, documentation, and validation evidence. |
| Technical module | documentation | Holds the relevant schema, service, router, data, or contract detail where applicable. |
| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |
| Public experience | Online content delivery | Nexus renders only records approved for public access. |

## Data and configuration detail

Every topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.

| Detail area | What to document | Verification signal |
| --- | --- | --- |
| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |
| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |
| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |
| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |

```js
sourceMap: { label: "Payment Management", owner: "nodics.commerce/payment", docs: "docs/pages/nodics.commerce" }
```

## Customization and extension

Developers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.

| Customization type | Recommended path | Avoid |
| --- | --- | --- |
| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |
| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |
| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |
| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |

## Operations and governance

Operators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.

| Operational concern | Required documentation detail |
| --- | --- |
| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |
| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |
| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |
| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |

## Common mistakes

- Treating a friendly navigation label as the technical source owner.
- Writing only developer details and skipping the business decision that the page supports.
- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.
- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.
- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.
- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.
- Leaving generated documentation without source evidence, validation commands, and maturity state.

## Verification

Verification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers then run the documentation generator and content-pack validator so the page becomes backend-owned data with checksum, lifecycle, navigation, access policy, publication state, and search metadata.

For implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.

## Business Capability Coverage Map

This section records the approved 50-item batch as a source map. It keeps the
reader-facing hierarchy business-friendly while giving developers and AI tools
the exact page where each topic is covered. When a new topic is added, update
the owning page, source evidence, validation commands, and generated content
pack rather than creating a disconnected page tree.

| No. | Business capability | Primary documentation page | Main implementation evidence |
| --- | --- | --- | --- |
| 1 | Product Catalog and Discovery | Product Catalog and Discovery Management | Product, Category, Variant, localization, publication, and projection schemas. |
| 2 | Base Commerce | Base Commerce foundations | Store, sales channel, point of service, and commerce composition contracts. |
| 3 | Cart and Checkout | Cart, checkout, and order placement | Cart, CartEntry, CartCalculation, CheckoutSession, placement ports, and customer APIs. |
| 4 | Pricing, Promotions, and Tax | Pricing, Promotions, and Tax Management | PriceBook, PriceRow, PriceDecision, Promotion, Coupon, DiscountDecision, TaxPolicy, and TaxDecision. |
| 5 | Inventory and Stock Management | Inventory and Stock Management | InventoryBalance, InventoryMovement, InventoryReservation, Warehouse, and availability services. |
| 6 | Order Management | Order Management Lifecycle | CommerceOrder, OrderEntry, lifecycle request/version/checkpoint, history, and readiness services. |
| 7 | Payments | Payment and fulfillment operations | PaymentTransaction, entries, instruments, reconciliation, refund execution, and provider readiness. |
| 8 | Shipping and Fulfillment | Shipping and Fulfillment Management | Consignment, Shipment, carrier adapters, warehouse task, exception, and return services. |
| 9 | Returns, Refunds, and Cancellations | Cancellation, return, and refund lifecycle | Order reversal, return inspection, receipt, payment refund, and fulfillment return execution. |
| 10 | Commerce Enterprise Operations | Commerce enterprise operations and migration | Commerce operations, migration, compatibility, capacity, recovery, and retirement contracts. |
| 11 | Search and Discovery Providers | Search, Indexing, and Discovery | Discovery config, mapping, projection, source, runtime, publication, and ranking modules. |
| 12 | WCMS Commerce References | WCMS content management | CMS site, route, page, template, slot, component, renderer, restriction, media, and publication data. |
| 13 | WCMS and Content Management | WCMS content management | CMS authoring schemas, delivery contracts, designer composition, publication workflow, and site references. |
| 14 | CMS Entity Model | WCMS content management | CmsSite, CmsPage, CmsPageRoute, CmsPageTemplate, CmsSlotDefinition, CmsComponent, and renderer mapping. |
| 15 | Content Publication Lifecycle | Staged-to-Online publishing lifecycle | Publication manifest, outbox, deployment receipt, workflow callback, and online pointer tests. |
| 16 | Media Management and Asset Delivery | Media management | Media, folders, formats, artifacts, references, sets, providers, delivery, upload, cleanup, and replication. |
| 17 | Localization and Internationalization | Localization and Internationalization | LocalizationKey, LocalizationValue, release, online pointer, import/export, publication, and translation memory port. |
| 18 | Customer Identity and Profile | Security, Identity, and Access Governance | Customer, employee, user, password, auth provider, session, registration, and profile routes. |
| 19 | Enterprise, Tenant, Group, Role, and Permission Management | Security, Identity, and Access Governance | Enterprise, tenant, user group, principal scope assignment, authorization, and permission resolution. |
| 20 | Customer Engagement | Unified engagement operations | Activity, assignment, consent, relation, dashboard, privacy, publication reference, and queue items. |
| 21 | Customer Feedback | Customer feedback, complaints, and closed-loop action | Feedback, classification, resolution, follow-up, handoff, insight, metrics, and privacy operations. |
| 22 | Customer Reviews | Customer reviews and ratings | Review, version, moderation, projection, aggregate, abuse, helpfulness, request, syndication, and response. |
| 23 | Communication and Notification Templates | Communication, delivery, and verification | Intent, template, version, attempt, inbox, suppression, verification, provider, and callback contracts. |
| 24 | Import, Export, and Migration | Data Import, Export, and Migration | Import definitions, import runs, data packs, migration register, media import staging, and release evidence. |
| 25 | Channel and Store Management | Base Commerce foundations | Store, SalesChannel, StoreContext, and Stores & Channels Axis capability. |
| 26 | Point of Service and Warehouse Management | Inventory and Stock Management | PointOfService, Warehouse, WarehouseTask, stock movements, and fulfillment handoff. |
| 27 | Coupon and Promotion Budget Governance | Pricing, Promotions, and Tax Management | Coupon, CouponBatch, PromotionBudgetLedger, PromotionRedemption, and simulation services. |
| 28 | Tax Policy and Decision Evidence | Pricing, Promotions, and Tax Management | TaxPolicy, TaxDecision, publication checks, and calculation evidence. |
| 29 | Order History and Checkpoints | Order Management Lifecycle | OrderHistory, OrderLifecycleCheckpoint, OrderLifecycleVersion, and recovery checkpoint data. |
| 30 | Payment Reconciliation | Payment and fulfillment operations | PaymentTransaction, PaymentTransactionEntry, instrument reference, reconciliation, and refund execution. |
| 31 | Consignments and Exceptions | Shipping and Fulfillment Management | Consignment, Shipment, FulfillmentException, tracking event, and carrier sandbox adapter. |
| 32 | Return Receipts and Reversal Calculations | Cancellation, return, and refund lifecycle | ReturnReceipt, ReturnInspection, FulfillmentReturn, and OrderReversalCalculation. |
| 33 | Discovery Rules and Ranking | Search, Indexing, and Discovery | CommerceSearchRule, DiscoveryRankingProfile, DiscoveryRankingAction, QueryProfile, and FacetProfile. |
| 34 | Discovery Sources and Field Mappings | Search, Indexing, and Discovery | DiscoverySourceProvider, DiscoveryFieldMapping, SourceMixConfiguration, and field policy. |
| 35 | Editorial Content | WCMS content management | EditorialArticle, Author, Series, TaxonomyTerm, ContentType, Correction, and localization. |
| 36 | Editorial Publication | Staged-to-Online publishing lifecycle | Editorial publication service, target, online projection, publication receipt, and workflow adapter. |
| 37 | Contact Operations | Unified engagement operations | ContactRequest, ContactAttempt, Correspondence, Handoff, Resolution, Verification, and provider recovery. |
| 38 | Engagement Automation | Unified engagement operations | EngagementAutomationDecision, evaluation, batch run, operational execution, privacy, and retention. |
| 39 | Testimonials | Unified engagement operations | TestimonialCandidate, Consent, Version, Projection, public intake, lifecycle, and publication adapter. |
| 40 | Tracking Events and Analytics Capture | Shipping and Fulfillment Management | TrackingEvent, shipment visibility, carrier event evidence, and fulfillment customer policy. |
| 41 | Process Workflows | Business Process and Automation Overview | ProcessDefinition, Instance, Task, Trigger, AuditEvent, Incident, graph validation, and publication approval. |
| 42 | Cron and Scheduled Automation | Cron operations | CronJob, CronJobLog, scheduler container, node handoff, process trigger, and runtime service. |
| 43 | Data Installation and Seed Packs | Data Import, Export, and Migration | Data installation records, content packs, headers, manifests, checksum, and init/sample/core layers. |
| 44 | Accelerators and Industry Templates | Accelerators and Industry Solution Templates | Agora Apparel, Electronics, Telco package metadata and shared commerce/content contracts. |
| 45 | Agora Apparel | Accelerators and Industry Solution Templates | Apparel storefront package, domain sample data, responsive journey, and backend API consumption. |
| 46 | Agora Electronics | Accelerators and Industry Solution Templates | Electronics storefront package, catalog/search journey, media, pricing, and checkout APIs. |
| 47 | Agora Telco | Accelerators and Industry Solution Templates | Telco storefront package, offer/catalog journey, customer onboarding, and commerce API boundaries. |
| 48 | TEE Solution Use Case | TEE and DEAP Solution Use Cases | Task Execution Engine composition through Process, Cron, Pipeline, EMS, and governed runtime change. |
| 49 | DEAP Solution Use Case | TEE and DEAP Solution Use Cases | Data Engineering and Analytics Platform composition through import/export, discovery, events, jobs, and publication. |
| 50 | Reference Source Map and Glossary | Reference Source Map and Glossary | Catalogue metadata, source evidence, business-friendly names, and exact implementation references. |
| 51 | Routing and API Governance | Routing and API Governance | Route metadata, generated CRUD routes, request context, HTTP hardening, OpenAPI generation, authorization, and runtime router configuration. |
