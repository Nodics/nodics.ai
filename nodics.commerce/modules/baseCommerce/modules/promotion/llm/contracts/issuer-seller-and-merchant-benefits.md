# Issuer Seller Consent And Merchant Benefits

## Ownership And Readiness

This authorized maintainer implementation extends Promotion, not a customer
registry. Studied owners include the root and Commerce contracts, generated
campaign/coupon schemas, lifecycle CAS, Profile scope resolution, merchant
confirmation, exact-money operations and existing publication guidance. Campaigns
already retain issuer/vendor references, but references alone did not admit seller
distribution. The new owner keeps consent on the existing campaign; it does not
change enterprise identity, parent administration or product ownership.

Source is authored, not installed or behaviorally qualified. The independent
`promotion.sellerAuthorization` and `promotion.merchantBenefits` defaults remain
disabled/unqualified. Their source methods use mergeable exports and `this` helper
resolution. Installed schema adoption, campaign identity uniqueness, real CAS,
private interceptor request identity and cross-runtime Profile admission remain
mandatory shared acceptance gates. No business identities or approved grants are
created by this source change.

## Issuer Administration

The separate `commerceSellerAuthorizationManagement` exposure category defaults
false. GET and POST `/promotions/:promotionCode/seller-authorization` both require
an access token, employee group and `commerce.coupon.seller.manage`. The service
independently requires a human issuer session, exact signed tenant/enterprise,
original access token and current Profile `/identity/scopes/me`. Relevant explicit
DENY overrides ALLOW. The browser cannot supply another issuer or Profile result.

GET returns `promotionCode`, `promotionRevision` and safe seller consent summaries.
It excludes command hashes and grant actor identifiers. POST accepts only
`sellerEnterpriseCode`, `expectedRevision`, `action`, optional `expiresAt`, and
`commandReference`. GRANT requires a future bounded timestamp and a currently
active Profile seller. REVOKE cannot rewrite the original expiry. The maximum
distinct seller count defaults to 100 and can be narrowed, never exceeded.

The command writes under campaign revision CAS with private request-object
admission. It stores issuer, seller, state, consent revision, expiry, reviewed
actor/time and command hash. Readback must match the complete intended consent at
the exact successor campaign revision. A lost acknowledgement is reconciled only
by that exact readback, never by another write. Same command replay must retain
the original actor, revision, expiry and command contents. Conflicts require a
fresh inspection; they do not become automatic retries.

## Allocation And Sale

When qualified selection is enabled, allocation reads the fresh campaign and
requires the authenticated seller to match the coupon vendor. Canonical issuer
and seller Profile enterprises must both be active. The issuer may sell its own
units without a delegated consent; another enterprise requires exactly one
current ACTIVE, unexpired issuer consent. A shared parent or matching name is not
authority. No seller may grant its own cross-enterprise rights.

Reservations retain `sellerAuthorizationProof` with issuer, seller, campaign and
grant revision. The owner rereads consent before the first SOLD transition. A
revoked, expired or revoked-then-regranted consent cannot satisfy that original
reservation. Existing completed sale replays retain their original financial
history rather than re-selling a code. Disabling the consent policy cannot verify
a reservation that already carries protected consent evidence. Legacy records
without such evidence retain the prior path while selection is disabled.

Generic campaign writes cannot manufacture or remove consents. Issuer changes are
refused on consent-bearing campaigns, and removals have an atomic no-consent
predicate. Generic coupon updates/removals have a no-proof predicate; owner-built
coupon CAS requests alone pass private admission. This is not permission to
restore historic grants by import, reset, copied HTTP flags or raw storage.
Installed save/upsert uniqueness and concurrent issuer-change tests are required
before qualification; the guard is not a distributed transaction across Profile
and Promotion.

## Monetary Benefit Evidence

The optional merchant-benefit owner supports declared fixed discounts, percentage
discounts, maximum discount caps and minimum subtotal using the framework's exact
amount service. It rejects conflicting declarations, percentages over 100,
negative/malformed amounts and discounts exceeding the authoritative subtotal.
Unsupported action keys and SKU/bundle promises remain refused: descriptive offer
names do not establish approved fulfillment products.

Activation requires an explicit loader-visible `evidenceService.evaluate` owner.
That adapter must read its canonical priced transaction and return independently
verified evidence bound to tenant, enterprise, original buyer, coupon, campaign
revision, selected outlet and source reference. It must report its verified
currency, subtotal and already applicable discount. Promotion recalculates the
declared discount and compares it exactly. Browser subtotal, pasted receipt copy
and the default merchant-screen attestation do not establish price authority.

The framework supplies a concrete native Cart/activated-Pricing adapter and
Digital Core merchant provider. See [native priced evidence v1](../../../pricing/llm/contracts/native-merchant-priced-evidence-v1.md).
PRICED_CART is priced native intent, not fabricated external POS settlement.
A deployment must qualify its actual canonical owners before enabling this selection. It must test
receipt freshness, source replay, price rounding, outlet/customer/currency denial,
provider confirmation and recovery through Digital Core. Empty or missing proof
does not produce a free-item or discount success.

## Customization And Validation

Later layers may narrow maximum sellers, choose a qualified monetary owner and
override small exported helpers through the existing load hierarchy. Preserve
the private write boundary, scope recheck, stable command identity, revision
binding and exact amounts. Do not copy this service into Kickoff or create a
parallel consent registry. Publication installation and operational owner schemas
must be qualified together; no Staged/Online activation is performed here.

Authored, unexecuted fixtures: `couponSellerAuthorizationContract.test.js` and
`promotionMerchantBenefitContract.test.js` under the module's `test/`. They cover
consent revocation/non-revival, lost acknowledgement, same-command replay,
generic proof denial, disabled qualification and later-layer adapter refusal.
Static syntax/format checks do not replace shared runtime, race, security and
customer/operator acceptance.
