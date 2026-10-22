# Coupon Owner Acceptance

Checkout Core owns two registered, project-independent commands:

- `acceptance:coupon-acquisition`
- `acceptance:coupon-redemption`

Both commands execute
`src/service/acceptance/defaultCouponJourneyHttpAcceptanceService.mjs`. Importing
the service is inert. Execution requires `--execute`, one reviewed project
acceptance profile, existing runtime sessions, running owner APIs and an atomic
tooling checkpoint. The runner never creates identities, permissions, balances,
coupon stock, offers, certificates, outlets or reusable defaults.

## Acquisition

The selected profile defaults to `tooling.acceptance.couponAcquisition` and may
be changed with `--acceptance=<name>`. It must identify exactly three existing
published coupon products, one for each canonical consideration type:
`REWARDS`, `CERTIFICATES` and `BOTH`.

The runner uses normal Cart and Checkout APIs. Reward-funded purchases retain the
selected Loyalty payment. Certificate-only purchases omit Payment and require an
exact zero total. Certificate and combined purchases send only the selected
certificate codes through Checkout's existing `couponSelections` contract.
Checkout, Order and Digital owner readback must prove the exact Cart, entry,
consideration phases, Order, entitlement and private reveal.

Final issuance is not refund authority. The runner creates a deterministic
customer refund-policy review case, asks the existing Order reviewer preview to
evaluate it, and requires `PURCHASE_REFUND_POLICY_REQUIRES_REVIEW` with no preview
token or executable reversal plan. It never calls refund execution. This proves
the default version-2 purchased-coupon finality path; explicit exceptional legal
or operator processes are outside this acceptance command.

Runtime-only sessions:

- `NODICS_COUPON_ACCEPTANCE_CUSTOMER_TOKEN`
- `NODICS_COUPON_ACCEPTANCE_REVIEWER_TOKEN`

## Staff Redemption

The selected profile defaults to `tooling.acceptance.couponRedemption`. It names
existing purchased entitlements by their immutable Order, Cart, entry, Product,
SKU and Promotion bindings, plus the expected issuer outlet and ITEM or PRICED
benefit.

The staff journey is the Axis/manual first-phase backend contract:

1. read the signed employee's merchant workspace and canonical outlet choices;
2. reveal the customer's private coupon through the customer owner API;
3. validate the presented token for the selected outlet and receipt reference;
4. explicitly confirm the whole coupon once;
5. inspect the immutable completed receipt;
6. replay the same confirmation key and require the same receipt;
7. require a repeated validation of the original token to return
   `ALREADY_REDEEMED`.

The installed OpenAPI contract must expose validate, confirm and receipt query,
and must expose no partial-redemption or completed-redemption reversal route.
Employee identity, permissions, Enterprise scope, outlet facts and participation
remain owned and enforced by Profile, Store, Promotion and Digital APIs; Checkout
does not copy them.

Runtime-only sessions:

- `NODICS_COUPON_ACCEPTANCE_CUSTOMER_TOKEN`
- `NODICS_COUPON_REDEMPTION_STAFF_TOKEN`

## Defaults And Recovery

Reusable timeout, case bound and checkpoint location are defined only in
`checkoutCore.couponAcceptance` in this module's `config/properties.js`.
Customer projects may override those defined values and select acceptance
profiles; they do not redefine the contract. The default checkpoint directory is
`.nodics/acceptance/checkout-coupon` beneath the selected project root. Checkpoint
files contain only stable case state and public business identifiers, never bearer
tokens, coupon tokens or validation capabilities.

An uncertain Checkout placement is read through the original Order status and is
never redispatched under a new key. An uncertain staff confirmation requires the
original persisted marker and completed owner state. Changed profile selection,
case identity or journey cannot adopt an existing checkpoint.

Validation:

```bash
node --test nodics.commerce/modules/checkout/modules/checkoutCore/test/couponJourneyHttpAcceptance.test.mjs
```
