# Checkout Core

Fixed-price placement and recovery retain merchant scope separately from signed
participant authority. No repeated Store selector is needed after Cart creation.
Command status exposes validated original Cart/Order bindings. See
[merchant scope](../cart/llm/contracts/merchant-scope.md) and run
`node --test test/merchantScopeContract.test.js` for offline namespace integration.

Selected auctions use the existing placement and Payment owners with a persisted
original-hold commitment, immutable terminal evidence and same-command recovery.
See [selected auction Checkout](llm/contracts/auction-checkout.md) for owner DTOs,
signed participant versus merchant partition, cancellation and consumer behavior.

Governed certificate-only coupon purchases omit Payment rather than inventing a
zero-value charge. Exact retained calculation decisions and original allocation
evidence determine consideration. Coupon input compensation runs only after
persisted failure and any required terminal Payment reversal. See
[coupon consideration](llm/contracts/README.md#governed-coupon-consideration).

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

Enterprise placement calls the shared Commerce participant spending policy with
the Profile-authorized owner and actor and the authoritative calculated total,
before Inventory, Digital or Payment acquisition. Missing or unconfirmed policy
admission fails closed. This also covers coupon purchases through Checkout;
Bidding uses the same policy owner, not a separate Wallet employee cap. Completed
placement replay returns retained completion without reapplying new spend limits.

The existing Axis employee business-access dialog includes a small Checkout-owned
purchase-limit control. It reads/updates the selected employee loginId and explicit
currency with revision checks; no permission designer or policy defaults live in
Axis. The optional `enterpriseSpendWorkspace` CMS release supplies labels.
`enterpriseSpendingAccessGroups` and `enterpriseSpendingAccessRoles` expose an
explicit Purchase limits / Full control catalogue definition only. No grants,
imports or assignments ran. See [Axis control](llm/contracts/axis-enterprise-spending.md).

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

# Original Purchase Recovery

See [forward recovery](llm/contracts/forward-purchase-recovery.md) for the qualified
command-status action union and explicit original-key confirmation endpoint.
Bundle/coupon continuation never creates another Payment or reprices a Cart;
selected auctions resume their original phase journal and protected hold.
