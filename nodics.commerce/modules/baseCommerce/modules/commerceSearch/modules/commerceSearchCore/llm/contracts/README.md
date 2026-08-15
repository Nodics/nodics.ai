# Commerce Search Core contracts

- `commerceSearchRule` is the staged business rule owned by Commerce Search.
- `commerceSearchRuleVersion` records immutable publication snapshots and evidence.
- `commerceSearchRuleProjection` is the online/search projection used at discovery time.
- Supported scope types are `GLOBAL`, `CATEGORY`, and `SEARCH_TERM`.
- Supported action types are `PIN`, `BOOST`, and `BURY`.
- Publication reads approved staged rules, builds deterministic projections, saves them through generated schema services, and indexes them through nSearch.
- Customer APIs must not expose raw rule internals beyond their effect on product result ordering.
