# Commerce Capability Coverage Matrix

| Journey area | Customer operation | BackOffice operation | Backend owner | Current status | Next validation |
| --- | --- | --- | --- | --- | --- |
| Home discovery | View featured products, collections, best sellers | Configure content sections and Product source | WCMS, Product, Discovery | Implemented first slice | Live indexed data smoke |
| PLP/search | Browse by collection, brand, search query, quick view | Configure facets, query profile, ranking profile | Product, Discovery, Commerce Search | Implemented first slice | Live ranking and facet proof |
| PDP | View gallery, variants, price, availability, shipping/returns | Manage Product, localization, pricing, inventory | Product, Pricing, Inventory, Fulfillment | Implemented first slice | Enriched media/review integration |
| Cart | Add/update/remove items, calculate totals, view subtotal | Inspect cart evidence if exposed | Cart | Live mutation and non-owner rejection accepted | Entry-level UI quantity editor |
| Checkout customer | Login and provide customer details | Customer lookup and support | Profile, Checkout | Authenticated live placement accepted | Customer profile edit remains Profile-owned handoff |
| Shipping | Enter address, choose shipping method | Maintain shipping method policy | Fulfillment | Implemented first slice | Live method API smoke |
| Payment | Select card/wallet/COD token | Provider/reconciliation visibility | Payment | Sandbox token/order handoff accepted | Live provider certification |
| Order confirmation | View order confirmation and backend order detail | Inspect order projection | Order | Live read and non-owner rejection accepted | Order history list/pagination |
| Cancellation | Preview eligibility, choose reason/items/quantity, submit | Approve/reject/retry/reconcile | Order, Payment, Inventory, Workflow | Live preview/create accepted | BackOffice decision workflow |
| Return | Preview eligibility, choose return method, receive RMA | Track pickup/drop-off/store return, receipt, inspection | Order, Fulfillment, Inventory, Payment, Workflow | Live preview/create accepted | Fulfillment shipment/receipt/inspection integration |
| Refund | View preview/status, delayed/reconciliation handling | Maker-checker refund and reconciliation | Order, Payment, Workflow | Live preview/create accepted | Provider execution/reconciliation tests |
| Partial lifecycle | Partial cancellation, partial return, partial refund | Item-level operations | Order plus downstream owners | Evidence supports quantity/product codes | Entry-level persistence and validation |
| Exchange/replacement | Request exchange/replacement | Replacement order or fulfillment workflow | Order, Fulfillment, Inventory, Payment | Live preview/create and automation plan accepted | Real fulfillment/provider execution tests |
| Rejection/appeal | View rejection and appeal option | Reject, appeal, re-review | Order, Workflow | Live preview/create and appeal SLA plan accepted | Real workflow/provider execution tests |
| Axis visibility | None | Manage Discovery, Commerce Search, Orders, lifecycle | Axis consumes backend metadata | Present via workbench/capability metadata | Focused Axis workbench regression and live bootstrap smoke |
| Customer data isolation | Own cart/order only | Support users operate via governed BackOffice APIs | Cart, Order, Profile | Live non-owner cart/order rejection accepted with customer-safe access denial | Support-role escalation policy |

## Accepted local runtime batch

The current Commerce/Agora batch has been accepted through the local runtime path:

1. Publish Product search projections and restore Pricing, Inventory, and Tax operational Online records.
2. Read search-backed Home/PLP/PDP data through customer-safe Product Discovery APIs.
3. Register and authenticate generated storefront customers.
4. Create/read cart, add/update/remove items, and calculate totals without leaking internal price-row, warehouse, SKU, or supplier evidence.
5. Place checkout with authenticated customer context and internal cart calculation evidence.
6. Read customer-owned order detail and lifecycle history.
7. Preview and create cancellation, return, and refund requests.
8. Confirm a second customer cannot read the first customer’s cart or order.
9. Preview and create exchange/replacement and appeal lifecycle requests.
10. Validate backend-owned automation plans in local and Docker acceptance.

## Reference-site use

The reference storefront is a journey checklist, not a source-code or visual-copy authority. Every extracted feature must be classified as customer operation, backoffice operation, backend owner, API/resolver, data-pack record, current status, gap, and priority before production implementation.
