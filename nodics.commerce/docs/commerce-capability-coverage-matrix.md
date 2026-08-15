# Commerce Capability Coverage Matrix

| Journey area | Customer operation | BackOffice operation | Backend owner | Current status | Next validation |
| --- | --- | --- | --- | --- | --- |
| Home discovery | View featured products, collections, best sellers | Configure content sections and Product source | WCMS, Product, Discovery | Implemented first slice | Live indexed data smoke |
| PLP/search | Browse by collection, brand, search query, quick view | Configure facets, query profile, ranking profile | Product, Discovery, Commerce Search | Implemented first slice | Live ranking and facet proof |
| PDP | View gallery, variants, price, availability, shipping/returns | Manage Product, localization, pricing, inventory | Product, Pricing, Inventory, Fulfillment | Implemented first slice | Enriched media/review integration |
| Cart | Add/remove items, view subtotal | Inspect cart evidence if exposed | Cart | Implemented first slice | Live authenticated cart smoke |
| Checkout customer | Login or provide customer details | Customer lookup and support | Profile, Checkout | Implemented first slice | Real storefront customer seed/auth |
| Shipping | Enter address, choose shipping method | Maintain shipping method policy | Fulfillment | Implemented first slice | Live method API smoke |
| Payment | Select card/wallet/COD token | Provider/reconciliation visibility | Payment | Implemented first slice | Provider-specific tests |
| Order confirmation | View order confirmation and backend order detail | Inspect order projection | Order | Implemented first slice | Live order read smoke |
| Cancellation | Preview eligibility, choose reason/items/quantity, submit | Approve/reject/retry/reconcile | Order, Payment, Inventory, Workflow | Structured preview/create added | Live request and decision tests |
| Return | Preview eligibility, choose return method, receive RMA | Track pickup/drop-off/store return, receipt, inspection | Order, Fulfillment, Inventory, Payment, Workflow | Structured preview evidence added | Fulfillment integration tests |
| Refund | View preview/status, delayed/reconciliation handling | Maker-checker refund and reconciliation | Order, Payment, Workflow | Preview/status evidence added | Provider/reconciliation tests |
| Partial lifecycle | Partial cancellation, partial return, partial refund | Item-level operations | Order plus downstream owners | Evidence supports quantity/product codes | Entry-level persistence and validation |
| Exchange/replacement | Request exchange/replacement | Replacement order or fulfillment workflow | Order, Fulfillment, Inventory, Payment | Not implemented | Decide MVP vs later phase |
| Rejection/appeal | View rejection and appeal option | Reject, appeal, re-review | Order, Workflow | Policy flag exposed | Add customer appeal API/action |
| Axis visibility | None | Manage Discovery, Commerce Search, Orders, lifecycle | Axis consumes backend metadata | Present via workbench/capability metadata | Live bootstrap/catalogue smoke |

## Reference-site use

The reference storefront is a journey checklist, not a source-code or visual-copy authority. Every extracted feature must be classified as customer operation, backoffice operation, backend owner, API/resolver, data-pack record, current status, gap, and priority before production implementation.
