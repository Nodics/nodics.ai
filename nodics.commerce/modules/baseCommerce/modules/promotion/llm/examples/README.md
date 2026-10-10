# Promotion examples

For a public coupon Product, `DefaultPromotionDistributionAdmissionService.publicAvailability`
returns only availability/status after current activated catalogue and retained
distribution checks. A copied admission, service label, caller projection or
`qualified` flag cannot grant access. A later `visibleProduct` override may
narrow the catalogue and is called through the effective service. See the
[integration and recovery examples](../contracts/trusted-distribution-read-admission.md).

Use canonical Commerce documentation; archived examples are not current contracts.

For a selectable accelerator setup instruction and successful, rejected, retry,
scale and later-layer examples, read the [owner contribution contract](../contracts/accelerator-setup-contributions.md).
An identical retry after spend returns the current counter; an old campaign with
missing consumption rejects instead of initializing it. Nonempty coupon issuance
instructions require the purpose key owner, private capture and installed transactional
persistence before any campaign write. Replay preserves original encrypted stock and
actor; losing a historical key requires key recovery, never replacement issuance.

For issuer consent admission, an exact human access context with current matching
Profile ENTERPRISE/TENANT/GLOBAL scope may proceed. A relevant wildcard DENY wins.
A GLOBAL scope qualified for a different enterprise does not authorize this issuer.
An `ERR_PROFILE` wrapper around valid-looking scopes, a malformed denial row or a
conflicting empty `entCode` refuses. Changing the original seller/actor object
during the campaign read cannot replace the detached reviewed command. Later
layers may narrow `profileResult`; refusal never falls back to the base reader.
See [the issuer contract](../contracts/issuer-seller-and-merchant-benefits.md#issuer-administration)
and `promotionIssuerAuthorityContract.test.js`. These isolated tests prove neither
installed Profile admission nor cross-owner spending or merchant fulfillment.

For coupon-bound accounting, a canonical merchant owner calls
`DefaultPromotionCouponBudgetService.consume(privateCommand)` only after its
original signed issuer/outlet and benefit evidence are admitted. Two retries for
the same original coupon have one COMMIT, while a changed operation or amount
refuses. An exact owner-admitted `.release(privateCommand)` references the actual
original receipt even after distribution revocation; a distribution-only grant,
copied command, missing installed transaction or caller-selected amount refuses.
The distribution Store and redemption outlet remain distinct. Later layers may
narrow `assertCurrent` without changing generated scopes or creating a journal.
See [the contract](../contracts/coupon-bound-issuer-budget.md) and
`promotionDelegatedCouponBudgetContract.test.js` for isolated owner fixtures;
installed merchant/consent/transaction qualification remains a separate gate.

For an explicitly reviewed benefit grant, POST the existing seller-authorization
command with `action: "GRANT"`, current `expectedRevision`, new
`commandReference`, seller and future expiry, plus
`benefitConsumption: "ISSUED_COUPON_BENEFIT_V1"`. The original signed issuer human
and installed Distribution owner remain mandatory. Omit purpose for
distribution-only consent. Reusing that same command reference to add purpose
refuses; a fresh reviewed GRANT advances revision and does not upgrade old stock.
REVOKE omits purpose and expiry, preserving both from the original consent.

If Digital recovery observes REDEEMED stock after the original budget COMMIT,
the merchant handoff must provide the immutable original receipt's exact priced
benefit. The receiver returns only its exact existing COMMIT: removing the
original ledger receipt or changing operation/source/amount refuses without a
new charge. CLAIMED first use still requires fresh independent pricing. RELEASE
has no legitimate caller until the canonical original reversal owner supplies
its identity-bound handoff; a copied receipt or proposed reversal is insufficient.
