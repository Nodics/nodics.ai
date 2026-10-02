# Digital Core

Digital Core bridges normal Checkout with digital unit owners.

The staged increment strengthens generated write/readback and partial reservation
compensation, retains Promotion purchase-derived expiry/terms, and supplies inert
layered purchase/refund EMAIL/SMS resources. This is not installed qualification;
see [owning contracts](llm/contracts/README.md) for remaining provenance, receipt,
seller-authority and lifecycle-trigger gates.

Post-commit messaging and original-intent recovery are described in
[committed coupon notifications](llm/contracts/committed-coupon-notifications.md).
The source defaults remain off; approved recipients, transport and installed
acceptance are required before enabling EMAIL/SMS.

For coupon products, it identifies calculation entries backed by a `COUPON_CODE_POOL`, asks Promotion to reserve one code per purchased unit during checkout placement, confirms the sale after payment authorization, and marks delivery after fulfillment release.

Merchant fulfillment follows [the merchant redemption contract](llm/contracts/merchant-redemption-contract.md).

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
