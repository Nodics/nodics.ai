# Commerce Search Core Agent Contract

- Follow `../../AGENTS.md`.
- Own commerce-specific search ranking and query rules only.
- Product remains the source of product/category/search projection data.
- `nSearch` remains the generic search provider abstraction.
- Axis-facing metadata must be provided by this module, not by group roots.
- Customer APIs must not expose rule internals, operator evidence, or unpublished rules.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
