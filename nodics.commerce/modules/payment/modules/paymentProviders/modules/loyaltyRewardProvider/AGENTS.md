# Loyalty Reward Provider Agent Contract

Decision cancel/inspect transport uses original keys, the configured owner paths,
runtime credentials and one attempt. Never forward participant credentials as a
service principal or retry spending to discover denial. Validate exact receipt
binding and noEffects:true; historical cancellation fences remain unconfirmed.

Enterprise wallet admission must apply wildcard capability scopes equally to
allow and deny, preserve tenant/Enterprise qualifiers and let denial win.
Use effective service members for scope matching and original-context checks;
never export private authority. Preserve the real nRouter-backed regression in
`test/loyaltyRewardWalletAuthorization.test.js`.

Preserve the sanitized auction commitment and original signed owner/actor through
Payment execution. The auction adapter must use real protected Loyalty APIs, exact
original hold receipts and Checkout terminal proof; never generic reserve/refund
fallback. Provider paths/defaults remain in this module's config/properties.js.

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

This module is a Commerce Payment provider adapter. It translates Commerce payment operations into Loyalty module calls, but it does not own Loyalty wallet, reward, ledger, reservation, redemption, coupon, product, cart, or order data.

- Keep reward wallet movement in `nodics.loyalty`.
- Keep coupon purchase and order orchestration in Commerce.
- Use `DefaultModuleService.invokeModule` for Loyalty calls so the target can run locally or in a separate cluster.
- Keep provider coordinates and target authority configurable through `config/properties.js`.

## Checkout acceptance ownership

Own the complete reusable `acceptance:loyalty-reward-checkout` suite here, not in
customer projects or Loyalty's domain APIs. Customer projects supply fixture
identifiers, spending limits and ordinary configuration through
`tooling.acceptance.loyaltyRewardCheckout`. Do not embed customer brands, runtime
ports or sample products in the suite. Keep the command protected with
`acceptanceContract: true` and `projectHome: true`.

Require explicit `--execute`, a funded isolated test wallet and already authorized
credentials. Never grant permissions, manufacture service identities, seed ledger
or wallet rows, or repair a denial from acceptance. Use the existing Loyalty and
Commerce APIs. Import and help must remain inert. Require Loyalty's exact reservation
and redemption evidence, Payment's exact journey transaction evidence and Digital's
current-owner delivery evidence. Keep persisted-row context exclusion in the owning
native persistence suite; do not infer it from API projections.
Keep injected success, denial, correlation, amount and customer-adoption tests.

Attempted-Payment bundle cleanup requires the exact canonical purchase fence and
fresh terminal owner proof. Typed CANCELLED/noEffects:true is accepted only from
LOYALTY_RESERVATION_RECONCILIATION_V1 with matching retained original authorization
intent and atomic accounting proof. Reconcile through the Payment runtime using
that original tuple; cancel/inspect remain conservative. Missing retained intent
blocks historical cancellation cleanup. Never reconstruct it from current Cart,
caller fields or balances; never relabel cancellation as DENIED or release seller
listing content holds. Preserve original checkpoint/claim and monotonic CAS.

Auction capture must prove the retained redemption-to-capture-ledger link and
original BIDDING/AUCTION_ROUND provenance before returning canonical ledger
evidence. Payment reference is the ledger code, not redemptionCode; retain exact
auctionCapture binding separately. Preserve rollback and unchanged replay tests.
