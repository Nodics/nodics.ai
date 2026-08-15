# Nodics Commerce and Agora Implementation Plan

## Purpose

This document explains the full Commerce implementation path for Nodics from a beginner-friendly, enterprise-framework point of view. It uses the archived Commerce implementation as reference evidence only. Active ownership remains in `nodics.ai`, `nodics.kickoff`, `nodics.agora`, and `nodics.axis` according to current module contracts.

## Module ownership

| Area | Owner | Responsibility |
| --- | --- | --- |
| Product truth and product search projections | `nodics.commerce/modules/baseCommerce/modules/product` | Product, Category, Variant, localization, publication evidence, customer-safe Product discovery/PDP projections |
| Generic indexing, mapping, source mix, query, facet, ranking mechanics | `nodics.discovery` | Reusable Discovery configuration and runtime contracts for Product, content, page, media, documentation, and later domains |
| Commerce-specific boost, bury, pin and search business rules | `nodics.commerce/modules/baseCommerce/modules/commerceSearch/modules/commerceSearchCore` | Product discovery ranking rules managed by business users from Axis |
| Cart, checkout, order placement | `nodics.commerce/modules/checkout` | Customer cart, checkout placement, immutable order projection |
| Cancellation, return, refund intent and history | `nodics.commerce/modules/checkout/modules/order` | Reverse lifecycle intent, eligibility preview, history, operator decisions |
| Payment authorization/refund provider evidence | `nodics.commerce/modules/payment` | Payment method/provider authorization, refund execution and reconciliation evidence |
| Shipping, return methods, return logistics | `nodics.commerce/modules/fulfillment` | Shipping methods, return methods, RMA/logistics status, receipt tracking |
| Inventory reservation, release, disposition | `nodics.commerce/modules/baseCommerce/modules/inventory` | Stock reservation/release and disposition after cancellation or return inspection |
| Workflow coordination | `nodics.process` | Approval, maker-checker, compensation, retry, appeal, reconciliation workflow |
| Storefront frontend | `nodics.agora` | Customer journey rendering and customer-safe API consumption |
| Project sample data | `nodics.kickoff/modules/agoraData` | Agora WCMS, sample Product/Pricing/Inventory/Discovery/CommerceSearch import data |
| BackOffice frontend | `nodics.axis` | Backend-governed workbench rendering for Product, Discovery, Commerce Search, Order lifecycle, Payment, Fulfillment |

## Enterprise data flow

```text
agoraData data folder
  -> Commerce/WCMS Staged schema
  -> approved publication
  -> Online/customer-safe projection schema
  -> nSearch/Elasticsearch index
  -> customer APIs
  -> nodics.agora frontend
```

The storefront must not read Staged catalog records. Home, PLP/search, and PDP are served from customer-safe indexed projections.

## Implementation sequence

1. Import project data into Staged records.
2. Publish Product/localized records into customer-safe Online projections.
3. Index Online projections into the Product Discovery index.
4. Configure Discovery index, source mix, field mapping, query profile, facet profile, ranking profile, and publication policy.
5. Configure Commerce Search rules for product boost, bury, and pin.
6. Render Home/PLP/PDP in `nodics.agora` from WCMS/content template structure and Product Discovery APIs.
7. Enable authenticated customer cart creation, cart item updates, calculation, checkout placement, and order confirmation.
8. Enable order detail/history and reverse lifecycle actions: cancellation, return, refund.
9. Expose backoffice visibility through Axis workbenches, driven by backend capability metadata.
10. Add acceptance automation for route surface, search-backed discovery, checkout, order read, lifecycle preview/create.
11. Add final test folder structure and production-quality regression suites.

## Governance and framework compliance

- Keep group roots composition-only.
- Put behavior in the concrete owning child module.
- Use configuration first where possible.
- Keep customer/project-specific data in Kickoff/agoraData, not framework modules.
- Keep executable rendering in frontend repositories, not data packs.
- Keep public storefront APIs customer-safe.
- Do not index raw operational records unless the owning module exposes a safe projection.
- Do not put credentials or secrets in public data packs.
- Preserve tenant, store, locale, idempotency, exact money, authorization, and audit boundaries.
- Update generated/LLM artifacts when backend module shape or contracts change.

## Current batch status

- Product discovery/PDP now returns metadata proving search-index backed delivery.
- Commerce Search owns Product boost/bury/pin rules and Axis capability metadata.
- Agora consumes shipping and return methods and submits structured lifecycle evidence.
- Kickoff acceptance validates route surface, search-backed discovery, checkout, order read, cancellation and return preview.
- Reverse lifecycle preview now includes eligibility, reason options, RMA, refund preview, downstream owner hints, and appeal support.

## Remaining production gates

- Run local acceptance with actual configured customer credentials.
- Confirm Product publication from Staged to Online and indexing against a live search engine.
- Validate Payment refund execution and reconciliation with provider-specific adapters.
- Validate Fulfillment return shipment/receipt/inspection/disposition with real logistics providers.
- Connect Axis detail panels and actions to backend maker-checker operations where required.
- Finalize test folder structure and full regression suites after implementation stabilizes.
