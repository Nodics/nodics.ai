# Checkout Core

The protected `acceptance:commerce-journey --execute` command runs the complete
customer journey against already-running PLATFORM and COMMERCE roles. Its inert
export accepts injected configuration and fetch for isolated testing. Customer
applications supply only fixtures through `tooling.acceptance.commerceJourney`.
See [acceptance configuration and effects](llm/contracts/README.md#commerce-journey-acceptance).

Checkout Core is its named Commerce capability boundary. Reusable contracts and behavior belong to this named capability boundary. Archived gComm is reference-only.

Bidding lifecycle belongs to [Bidding](../../../bidding/README.md). Checkout validates accepted Pricing quote bindings before normal reservation and payment.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
