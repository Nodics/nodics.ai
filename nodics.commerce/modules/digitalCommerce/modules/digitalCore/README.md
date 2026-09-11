# Digital Core

Digital Core bridges normal Checkout with digital unit owners.

For coupon products, it identifies calculation entries backed by a `COUPON_CODE_POOL`, asks Promotion to reserve one code per purchased unit during checkout placement, confirms the sale after payment authorization, and marks delivery after fulfillment release.

Merchant fulfillment follows [the merchant redemption contract](llm/contracts/merchant-redemption-contract.md).
