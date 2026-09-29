# Commerce Search Core contracts

- `commerceSearchRule` is the staged business rule owned by Commerce Search.
- `commerceSearchRuleVersion` records immutable publication snapshots and evidence.
- `commerceSearchRuleProjection` is the online/search projection used at discovery time.
- Supported scope types are `GLOBAL`, `CATEGORY`, and `SEARCH_TERM`.
- Supported action types are `PIN`, `BOOST`, and `BURY`.
- Publication reads approved staged rules, builds deterministic projections, saves them through generated schema services, and indexes them through nSearch.
- Customer APIs must not expose raw rule internals beyond their effect on product result ordering.

Product's governed catalogue selection remains Product-owned. Commerce Search
ranking receives the already activated, customer-safe Product result set; it
must not refill it from mutable Product sources or hidden prepared projections.
Product graph digests do not freeze independently published ranking rules.
Versioning and governed activation of ranking rules requires its own qualified
owner integration; this Product-only change does not register such a provider.
