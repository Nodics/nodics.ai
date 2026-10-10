# Checkout Core examples

Use canonical Commerce documentation; archived examples are not current contracts.

For a physical journey backed by a purchased coupon, supply the existing campaign
as `tooling.acceptance.commerceJourney.promotionCode` and its legitimately delivered
redeemable token as `couponCode`. Supply the purchasing customer's login/password
through the existing environment inputs and leave registration disabled for that
buyer. Digital purchase/delivery and retained-policy configuration are operator
prerequisites. The runner quotes with that token, previews against the persisted
Cart and verifies Checkout's committed promotion evidence. Every campaign uses
this preview/quote/Checkout-commit sequence; standalone apply is never called on
the journey cart. A Profile membership/signup failure remains a blocking owner
gate, not permission to provision a substitute customer or enable qualification
flags. See the [acceptance contract](../contracts/README.md#existing-promotion-and-coupon-acceptance).
