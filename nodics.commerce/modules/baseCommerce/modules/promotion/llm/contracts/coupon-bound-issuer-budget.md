# Coupon-Bound Issuer Benefit Accounting

## Authority And Readiness

Promotion owns this source-only extension of its existing budget counter and
append-only budget ledger. It creates no accounting journal, generated CRUD
exception, importer, router, configuration flag or enterprise impersonation.
The ordinary `consume` and `release` entry points remain own-enterprise only.
Seller policy reads and `commerce.coupon.seller.manage` do not grant spending.

The studied contracts are root-to-leaf maintainer guidance, secure generated
issuance/private read protection, original budget admission, completed retained
publication, original issuer/vendor consent, purchased coupon lifecycle and
qualified database transactions. The owned files are the existing budget and
seller-authorization services, the loader-visible coupon budget service, their
focused tests and the narrow private Publication reader plus this owner guidance.
No runtime operations, installed grants, schemas, business data, configuration
or frontend state are changed by this extension.

The receiver requires the canonical merchant owner's exact private handoff below.
Consent administration now explicitly retains the benefit authority on a newly
reviewed grant revision. The canonical merchant owner supplies COMMIT integration;
the receiver tests independently exercise the actual consent/issuance/accounting
owners with isolated merchant, installed-readiness and provider ports. They are
not deployment readiness, installed consent, native failover or authenticated
checkout evidence. Used-benefit reversals are explicitly outside the supported
local-demo scope: RELEASE stays disabled at the actual canonical merchant owner.
The defensive receiver and its isolated inverse tests do not enable that journey
or create a pending promise to implement it for this batch.

## Supported Scope: Used-Benefit Reversals Disabled

The approved scope supports original coupon-bound COMMIT and recovery of its
actual original receipt. It does not support reversing an already-redeemed
benefit or replenishing its budget. `DefaultPromotionMerchantScopeService`
resolves only `COMMIT`; `RELEASE` refuses even with the genuine in-flight COMMIT
command. Copies, retained commands, plausible inverse/receipt fields, seller
management permission and explicit benefit consent grant no reversal authority.
There is no canonical used-benefit reversal handoff or release caller. No new
flag, public API, refund policy or automatic compensation is introduced.

Unused purchase refunds remain a separate existing journey. Promotion still
locks an eligible original unused purchase as `REFUND_PENDING`, completes it as
`REVOKED`, and replays the same approved refund reference without repeated writes.
It retains buyer/order/reference checks and rejects used or claimed coupons for
manual resolution. Digital retains purchase-time refund-window/request-type
checks, claimed/redeemed manual review and physical-return refusal. These paths
do not release consumed benefit spend or bypass Payment/Order approvals.

Simulated ITEM delivery approval does not authorize reversing a redeemed benefit.
Its delivery evidence and implementation remain with the delivery owner, outside
this accounting contract. Recovery must distinguish an uncertain acknowledgement
from an authorized refund; neither permits an invented inverse.

## Private Integration Contract

`DefaultPromotionCouponBudgetService.consume(command)` and `.release(command)`
require the canonical merchant owner's exact in-flight command identity. The
actual owner currently mints only COMMIT commands and refuses all RELEASE;
the receiver's inverse checks below describe defensive internals, not a supported
used-benefit reversal endpoint.
There is no caller-supplied issuer context, transaction, amount endpoint or
arbitrary callback. `DefaultPromotionMerchantScopeService.resolveBudgetRequest`
must refuse copied, changed, expired or retained commands and independently
recheck original signed staff authority, current issuer/outlet scope and the
original owner-verified benefit. Any hypothetical inverse would additionally
require canonical exact reversal authority, which is not provided or enabled.
See [exact issuer merchant stock admission](issuer-merchant-stock-admission.md)
for the canonical staff handoff, confirmed Digital write phases and durable
merchant receipt recovery. [Trusted distribution read admission](trusted-distribution-read-admission.md)
documents the separate Product-only read identity and actual installed consent
prerequisites; that read admission never grants this mutation authority.

`resolveBudgetRequest(command, mutationType)` returns detached original evidence:

```js
{
    request, // Original signed human issuer staff, including original Bearer.
    couponCode,
    vendorEnterpriseCode,
    distributionStoreCode, // Original secure issuance/publication Store.
    storeCode, // Independently verified merchant redemption outlet.
    ownerId,
    targetCode,
    targetType, // POS or CART, from persisted owner evidence.
    operationCode, // Canonical immutable original benefit operation.
    benefit: { amount, currency, sourceReference }
}
```

The original request is not rewritten to vendor or issuer persistence scope.
The receipt-derived distribution Store is a private selection coordinate, not
the employee's outlet or a substitute authentication scope. The receiver checks
the COMMERCE role, signed tenant/enterprise aliases, human access principal and
original bounded Bearer. Fresh Profile scope admission remains with the merchant
owner. The receiver constructs a separate Identity Governance system persistence
context only after private identity admission. Arbitrary admitted-looking objects
cannot obtain that context.

Each mutation rereads the exact vendor coupon and original private batch through
the secure generated owner. It requires installed secure transaction schemas,
private hooks/read protection and installed unique identities. It verifies
canonical references, original issuance command, complete unit membership,
token hash, protected-token fingerprint, original grant, buyer, original sale,
claim target and original purchase identity. No token is decrypted or returned.
Fixed-window purchases need no fabricated `purchasePolicy`; existing snapshots
and retained validity fields are included when present. Before private receipt
admission, the installed generated save initializer applies effective inherited
and tenant defaults. The guard pins that complete model before dispatch; normal
generated save still runs its authorization, defaults, validators and hooks.
Legitimate inherited defaults such as `accessGroups` therefore remain exact,
not allowlisted additions. Tests exercise the real default step with tenant
overrides and changed-default refusal. An expired unit cannot
start a new COMMIT. Defensive inverse validation cannot extend coupon validity;
it is not reachable through the current merchant owner.

The private accounting envelope is independently identity-bound and revalidated
after owner awaits, within the Promotion transaction and after committed
readback. It expires when dispatch completes. Normal read-policy objects, copied
envelopes, generic flags and public generated requests grant nothing.
`Publication.readCouponBudgetPolicy` resolves only that exact private envelope,
uses the existing uncached private completed-activation reader and returns just
the original pure campaign. Ordinary `scope` and `readActivated` are unchanged.
Publication is rechecked after COMMIT; observed replacement refuses confirmation
without rewriting or automatically reversing the committed original receipt.

## Explicit Benefit Consent

A first COMMIT requires exactly the original active, unexpired seller grant
revision plus `benefitConsumption: "ISSUED_COUPON_BENEFIT_V1"`. The meaning is
limited to the monetary benefit of an original securely issued purchased coupon,
not arbitrary issuer campaign accounting. Current distribution-only grants do
not acquire this permission because this source exists. Management authority
must explicitly review the additional purpose; imported records and source
fixtures cannot establish it. A changed/regranted revision cannot revive stock
issued under an older grant.

POST seller authorization accepts the optional `benefitConsumption` field only
for GRANT and only with the exact string `ISSUED_COUPON_BENEFIT_V1`. Explicit
`undefined`, null, alternate strings, arrays and other malformed values refuse.
Fresh signed human issuer permission, current Profile ALLOW without matching
DENY and an active seller remain mandatory. The Distribution admission owner
must be present and its actual `assertInstalled(request)` must return exactly
`true` before consent writes or exact-command replay; unselected delivery and
successful-looking flags/envelopes cannot skip this prerequisite. That owner
checks installed consent CAS, schema/hooks/indexes, private capture and secure
transaction topology. Test-only readiness doubles establish no installed proof.

The existing campaign `sellerAuthorizations` array retains the scope; no new
schema, registry or generic writer is introduced. Each fresh GRANT advances the
original seller consent revision. An omitted field remains distribution-only and
does not inherit a previous benefit purpose. REVOKE cannot select a purpose;
it preserves the original purpose and expiry while advancing the revision.
Exact-command replay compares purpose as well as command hash. Distribution-only
commands retain the original hash format, so adding purpose on their retry
refuses instead of upgrading consent. Safe summaries expose the validated purpose
and original consent revision, never actor IDs, command hashes or private receipts.

The same transaction reads the live campaign's original admission and current
consent before the receipt insert and counter revision/spend CAS. A consent
change that advances campaign revision before CAS causes refusal/rollback.
Profile and publication checks remain bounded observations, not distributed
locks. The merchant handoff must likewise distinguish original benefit authority
from current issuer administration.

## Accounting And Recovery

| Concern | Contract |
| --- | --- |
| Durable owner | Existing issuer campaign budget and `promotionBudgetLedger` |
| COMMIT identity | Contract v2 + tenant + issuer + vendor + original coupon code; never a caller retry key |
| Original operation | Receipt retains canonical benefit operation, target/type, buyer, source, exact amount/currency and outlet |
| Immutable pins | Secure batch/issuance fingerprint, original purchase fingerprint, grant proof, Store/root/policy and original budget admission |
| Duplicate protection | Changing retry, target, operation or amount cannot create a second COMMIT for the same coupon |
| Atomicity | First COMMIT fences the original unused CLAIMED coupon revision, inserts the immutable ledger row and CAS-updates campaign revision/spend in one qualified opaque Promotion transaction |
| Coupon race fence | Revision-only generated coupon CAS; positive single-row acknowledgement and exact same-transaction readback; original/successor revisions retained in private receipt proof |
| REDEEMED recovery | Same-transaction exact original COMMIT receipt required; never a first COMMIT, replacement receipt, coupon fence or second charge |
| Supported RELEASE | Disabled: actual MerchantScope refuses every RELEASE, including genuine COMMIT command identity |
| Defensive inverse identity | Receiver-only validation: exactly one inverse of the actual original v2 COMMIT, independent of new retry references; no enabled caller |
| Compensation | No automatic used-benefit compensation; original receipt recovery only, without a newly authorized inverse |
| Consent revocation | Stops new consumption; does not enable reversal or revive an old grant. Defensive inverse checks do not require grant reactivation |
| Lost acknowledgement | Read only the exact original receipt/admission; never infer success from spend or insert a replacement |
| Defensive lifetime use | Isolated receiver tests verify replay after an inverse cannot recharge the original coupon; this does not authorize a live RELEASE |

The existing qualified persistence admission remains mandatory on every command,
including replay. It checks real transaction topology, unversioned side-effect-free
schemas, disabled mutable-record caches/events/search, private generated hooks,
protected ledger projection and installed unconditional unique code identities.
Source booleans and injected test adapters cannot replace installed evidence.

The transaction inspects and validates the exact lifetime coupon COMMIT before
attempting any new accounting. If it exists, recovery must match its original
operation, benefit source, amount/currency, target, buyer and all immutable pins.
The canonical merchant owner may recover those exact priced fields from its
immutable original merchant receipt for REDEEMED stock, since fresh source
pricing is then state-ineligible. This never authorizes a first charge: without
the actual original COMMIT, the transaction requires unused CLAIMED stock and
fails the new revision fence for REDEEMED stock. CLAIMED first-use evidence still
requires fresh independent pricing at the merchant owner. A concurrent lifecycle
write and first accounting contend on the same coupon revision; the qualified
provider must enforce transactional write conflicts. Isolated snapshot-race
fixtures model that behavior but do not qualify a native provider.

This guarantee is budget accounting plus a coupon revision fence only. It does
not atomically commit Digital entitlement redemption, merchant receipts, the
business transition to coupon REDEEMED, priced-source
settlement, Payment or Checkout. A provider failure after budget COMMIT must use
the existing owner recovery flow and the actual original receipt. It must not
automatically release spend, invent reversal authority or promise an unsupported
used-benefit refund. Do not infer an inverse from uncertain external fulfillment
or claim a cross-owner database transaction. New budget selection does not
qualify ITEM delivery evidence.

## Public Ledger Completeness

The existing read-only `GET /promotions/:promotionCode/budget-ledger` retains
`promotionCode` and `entries` for paginated UI consumers.

The existing secured route retains its `access` token, employee access-group,
`commerce.promotion.read` permission and `commerceManagement` exposure gates.
The controller maps HTTP parameters without manufacturing enterprise scope;
the ledger-only facade `applyBudgetLedgerContext` independently derives the
issuer from original signed `authData.entCode` or `authData.enterpriseCode`.
Signed tenant aliases must also agree. Native nRouter supplies `request.entCode`
but does not promise `request.enterpriseCode`; absence of the latter must not
silently turn an authenticated issuer read into an unscoped ledger.

Every present signed, root-request, normalized authentication, HTTP header,
body and query enterprise/tenant alias must agree with the signed scope.
Conflicting, null or malformed claims and header-only/body-only issuer selectors
refuse before generated persistence. No credential, signed claim, group or grant
is rewritten. The original authenticated actor and signed tenant remain required;
request actor fallbacks cannot manufacture them. An explicitly presented token
type other than access refuses. Legacy authenticated HTTP requests with signed
tenant/operator but no enterprise claim and no presented enterprise selector
remain unscoped, visibly `enterpriseCode: null`. Internal operation callers retain
their existing trusted context contract. Other operator facade methods and
analytics are not changed by this ledger-specific scope mapping.

The response additionally returns:

```js
completeness: {
    contractVersion: 1,
    tenant,
    enterpriseCode, // Exact requested enterprise, or null for legacy unscoped reads.
    promotionCode,
    totalCount, // Explicit successful generated count of the whole scoped query.
    returnedCount,
    pageNumber,
    pageSize,
    complete // First page only, with totalCount === returnedCount.
}
```

Only this operation bypasses the legacy `listFromService` result unwrapping to
retain the generated envelope. The service and analytics helper are otherwise
unchanged. Pages use `searchOptions.pageSize/pageNumber`, deterministic code sort,
uncached and nonrecursive generated reads, and the existing protected public
projection. Top-level `pageSize` is not consumed by the generated initializer.
Page size defaults to 100 and is bounded to 1..1000; page number defaults to 1
and both it and its computed offset must be positive/nonnegative safe integers.
HTTP decimal integer strings are accepted; malformed explicit selectors refuse.
No transaction context or private persistence selector is used or accepted.
Ordinary Mongo count is `countDocuments(query)` independent of cursor limit/skip;
the transaction path's returned-row count cannot establish query completeness.

The operation requires an explicit successful generated status, safe nonnegative
count, array result, normalized limit/skip, and exact expected page length
`min(pageSize, max(0, totalCount - offset))`. Missing owners, contradictory or
malformed successful-looking envelopes, duplicate/missing row codes, and rows
outside the requested tenant/campaign/optional enterprise refuse with
`ERR_PROMOTION_BUDGET_LEDGER_UNCONFIRMED` (409). Genuine generated rejections
remain rejections. A successful explicit count zero is distinct from failed,
missing or inferred empty evidence. Public projection still strips private
`budgetMutation`; completeness grants no private receipt, mutation or issuer
authority. Legacy unscoped UI pages may contain multiple enterprises, but their
metadata must remain `enterpriseCode: null`, never a manufactured issuer.

Partial pages remain valid UI results with `complete: false`. Issuer acceptance
must require contract version, exact tenant/issuer/campaign, first page, explicit
`complete: true`, both counts equal the actual bounded unique entries, and then
independently sum those rows before comparing analytics. Agreement with analytics
alone does not qualify completeness, and analytics is not upgraded to complete
accounting by this change. Completion, replay and resumed acceptance require fresh
qualified ledger evidence as well as the original exact COMMIT identity.

Mongo count and find are separate observations, not an atomic snapshot or a lock
against concurrent consumption. An observed count/page inconsistency refuses;
this contract cannot detect all same-count concurrent changes. Native acceptance
must retain its existing isolated-operation and original-evidence checks.

`promotionBudgetLedgerCompletenessContract.test.js` uses the actual generated
service template, pipeline, option initializer, schema access, Mongo read/count
and protected projection over isolated cursor/count storage. It proves full and
partial pages (including nonzero skip), explicit empty evidence, legacy unscoped
UI behavior, malformed evidence/scope refusal, private-field suppression and a
later-layer service override preserving the default contract. Cursor pagination
and total count are independent; service.get is not replaced by a row-length
count double. These tests establish source behavior, not installed/native proof.
The same suite invokes the actual controller and facade over native-shaped
already-authenticated requests with signed `entCode` but no root enterpriseCode,
covering explicit empty issuer pages, the independent enterpriseCode/tenantCode
aliases, foreign issuer row exclusion, original-auth preservation, alias conflicts
before reads, and the legitimate unscoped legacy HTTP case. Route metadata is
asserted unchanged; fixtures do not establish cryptographic or live admission.

Ownership/placement review: this completeness correction belongs to Promotion's
existing read operation, status definitions, tests and nearest contract/guidance.
No generated artifact, route, permission, analytics behavior, write path, runtime
configuration, customer data or Checkout runner is changed by this owner batch.

## Acceptance And Customization

`promotionDelegatedCouponBudgetContract.test.js` exercises real secure issuance,
completed retained-policy reads, private accounting dispatch, generated hooks and
opaque atomic accounting with isolated Profile/merchant/provider ports. It checks
successful issuer-only accounting, fixed-window identity, distinct distribution
Store/outlet, concurrent duplicate commands, shared-budget exhaustion, changed
original evidence, copied/expired handoffs, explicit purpose refusal, consent CAS
races, rollback, transaction callback replay, uncertain acknowledgement, exact
inverse after revocation/publication replacement and immutable receipt guards.
Additional cases cover installed-owner absence/failure on consent and replay,
explicit-purpose command conflicts, revisioned regrant without stock upgrades,
REDEEMED first-use refusal, exact receipt recovery, missing/corrupt original
receipts, generated coupon-fence tampering/acknowledgement/readback refusal and
both coupon-lifecycle/accounting race orderings.

`promotionUsedBenefitReversalDisabledContract.test.js` validates the actual
MerchantScope and coupon-budget receiver boundary, including a genuine command
minted during actual merchant dispatch that positively resolves as COMMIT but
cannot resolve as RELEASE. It checks copied/retained/plausible commands, failed
dispatch cleanup, arbitrary reversal operation refusal and no accounting effects.
It also exercises actual Promotion unused-refund CAS/readback, completion and
replay, and the actual Digital refund-policy decisions. Digital staff/phase/
receipt ports and installed persistence are isolated fixtures; these tests prove
source refusal and unchanged policy behavior, not installed readiness, a real
budget COMMIT, authenticated checkout or native financial execution.

Business evaluators and users receive their canonical merchant outcome, not
private receipts or new accounting UI. Administrators must explicitly establish
the reviewed benefit purpose through consent administration. Operators must
qualify installed schema/hooks/indexes/topology and diagnose original receipts
through private owners without database access. Partner developers may narrow
mergeable `handoff`, `assertCurrent` or mutation members through existing layering;
they must not introduce replacement grant or receipt registries. Maintainers and
AI tools must qualify the actual owner handoff, installed consent prerequisites
and transactions before calling this source installed or enabling native execution.

Ownership/placement review: PASS for these source files, tests and local contract
within Promotion. The only Publication addition is a private identity-bound
reader; generic publication scope and APIs remain unchanged. No schema, runtime
configuration, business data or Operation call site is changed here. Consent
administration is implemented in its existing owner, including the narrow
coupon-fence identity check. Canonical COMMIT merchant integration is present;
installed/native acceptance remains separate from passing isolated tests.
Canonical used-benefit reversal admission is intentionally absent under the
approved supported scope, not an unfinished promise for this batch. The
reversal-disabled validation changes only its new Promotion test and this
contract; runtime source, ITEM configuration, refund policy and semantic pins
remain unchanged by that validation slice.
