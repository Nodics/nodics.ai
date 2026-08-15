# Commerce Search Core Agent Contract

- Follow `../../AGENTS.md`.
- Own commerce-specific search ranking and query rules only.
- Product remains the source of product/category/search projection data.
- `nSearch` remains the generic search provider abstraction.
- Axis-facing metadata must be provided by this module, not by group roots.
- Customer APIs must not expose rule internals, operator evidence, or unpublished rules.
