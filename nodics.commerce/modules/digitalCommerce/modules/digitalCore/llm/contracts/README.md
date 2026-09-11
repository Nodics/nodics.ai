# Digital Core Contracts

Digital Core follows `nodics.commerce/llm/contracts/digital-commerce-and-coupon-marketplace-contract.md`.

See [merchant redemption](merchant-redemption-contract.md) for customer claim,
scoped employee confirmation, provider verification and recovery.

Unused purchased coupons use `DefaultDigitalCommerceRefundService` as the Order
refund owner port. Entitlements enter REFUND_PENDING before Payment refunds;
Promotion locks the original coupon, then both owners complete revocation under
the canonical refund reference. Claimed, redeemed and mixed orders need manual
resolution. See the Order purchase review contract and
`test/digitalCommerceRefundContract.test.js`.
