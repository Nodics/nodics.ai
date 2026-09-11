# Enterprise Merchant Redemption

Every merchant is a Profile enterprise. Its registered employees perform the
merchant journey in Axis at `/commerce/coupons/fulfillment`. The Profile
`MERCHANT_OPERATOR` enterprise-access role assigns the canonical nAuth
`commerceMerchantUserGroup`; membership and current enterprise scope are checked
at each operation. Explicit denials win over broader grants. There is no separate
merchant registry, frontend merchant identity or Circa merchant screen.

The issuing enterprise comes from the purchased Promotion coupon's
`issuerEnterpriseRef`, with the existing enterprise association compatibility
mapping for older records. Profile must still resolve an active enterprise.
The authenticated record partition and the business issuing enterprise are
separate checks; employee scope must match the issuer.

The customer uses the existing purchased coupon code display. Axis posts that
code to Digital Core validation. Promotion resolves its token hash and checks
purchase state, customer ownership, issuer, active campaign, validity dates and
supported campaign conditions. Unsupported conditions fail closed until an owning
Promotion extension validates them. Validation neither claims nor redeems a
coupon and returns no raw token, token hash or customer identity.

A validation proof binds the coupon, entitlement revision, issuer and five-minute
expiry. The employee reviews the benefit and enters their transaction/receipt
reference before confirming. Digital Core persists the instruction, claims under
the original customer's ownership, obtains the configured fulfillment provider's
acknowledgement, records delivery evidence and invokes Promotion redemption.
The merchant-screen provider records authenticated staff attestation; it does not
claim to have contacted an external POS. The existing customer claim API remains
compatible, but no new customer screen is required.

Confirmation is idempotent and cannot change the entered receipt. If completion
is interrupted after the instruction is persisted, the scoped Axis queue exposes
recovery under the original reference; another customer action is unnecessary.
Redeemed coupons return their receipt and cannot be reused. Coupon redemption does
not change attached asset carbon or invoke a refund.

These owning operations support the future merchant POS integration boundary.
External connectors, provider credentials and public POS qualification remain a
separate integration task. The framework defaults merchant redemption off.

Validation: `test/digitalCommerceMerchantContract.test.js` and the connected Axis
employee journey with persisted customer receipt history.

Promotion retains canonical `TENANT_UPPERCASE_SHA256` issuance. A deployment may
explicitly enable `promotion.legacyTokenHashPolicies` with
`TENANT_COLON_UPPERCASE_SHA256` for previously issued coupons. Lookup stays inside
Promotion and accepts exactly one matching purchased row. No plaintext lookup or
reissue is performed. New Circa sample data uses the canonical digest; its project
configuration enables compatibility for existing sample purchases.
