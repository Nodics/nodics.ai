# Checkout Core

The protected `acceptance:commerce-journey --execute` command runs the complete
customer journey against already-running PLATFORM and COMMERCE roles. Its inert
export accepts injected configuration and fetch for isolated testing. Customer
applications supply only fixtures through `tooling.acceptance.commerceJourney`.
Promotion acceptance consumes an existing `promotionCode` using the authenticated
persisted cart's Store, products and calculated subtotal. It never authors campaigns
or issues coupons. Every campaign is previewed and quoted before Checkout alone
commits it after payment; the runner never calls standalone apply. Coupon-backed
journeys additionally require a legitimately purchased `couponCode` and that buyer's
existing customer credentials. Profile membership/signup failures propagate.
See [acceptance configuration and effects](llm/contracts/README.md#commerce-journey-acceptance).

Checkout Core is its named Commerce capability boundary. Reusable contracts and behavior belong to this named capability boundary. Archived gComm is reference-only.

Payment compensation requires confirmed terminal original-intent evidence;
pending, failed or unconfirmed responses retain `COMPENSATION_REQUIRED`. Matching
retained recovery replays without repeating owner actions. See the
[compensation contract](llm/contracts/README.md#payment-compensation-confirmation).

Bidding lifecycle belongs to [Bidding](../../../bidding/README.md). Checkout validates accepted Pricing quote bindings before normal reservation and payment.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
