# Promotion Agent Contract

Large setup contributions may use trusted `promotion.setupPacing` delays of
0..10000ms before each preflight and issuance batch. Wait outside transactions,
then run every fresh authority, consent and persistence check. HTTP/payload
values never select pacing. Do not increase rate limits, cache approvals or skip
original-unit verification to finish an import; qualified FAILED retries preserve
original batches and unchanged immutable contribution identity.

Online retained policy reads are not Staged capture. Preserve the separate
`activatedReadAuth` admission: signed human/customer scope must agree, and
only a human with `commerce.product.publish` plus the effective domain setup
permission may receive canonical authority for this owner's exact release,
pointer and receipt services. Ordinary consumers retain schema authorization;
services gain no new authority. Keep capture/retention writes Staged-qualified.
Preserve exact activated pointer/receipt/release proof and the shared
`nodics.commerce/test/helpers/policyActivatedReadAdmission.js` regressions.

Publication capture/retention may use canonical local persistence authority for
an authenticated Staged human with `publish.lifecycle.create`,
`commerce.product.publish` and the effective `publish.setup.permissions.promotion`, only after
signed tenant/enterprise aliases agree. Exact source reads and retained writes
remain scoped; foreign policy refuses before retention. Never grant generic
CRUD or replace the nPublish caller. Preserve the publisher admission regressions
in `test/promotionPolicyProvider.test.js`.

For runtime publication, preserve deployment claims and use only explicitly
selected business scope plus exact stored source authorization. Never forward a
human enterprise header or caller token to the target. Follow
[cross-enterprise handoff](llm/contracts/promotion-lifecycle-and-publication.md#cross-enterprise-runtime-handoff)
and preserve the real-owner admission/transport regressions in the same suite.

For trusted service/public Product supply reads, follow
[explicit distribution admission](llm/contracts/trusted-distribution-read-admission.md).
Keep private request identity Product-bound and short-lived; root/coupon/budget
reads and mutations receive no public grant. Preserve original signed authority,
use Product's pinned retained visibility rather than caller projections, and
check installed consent/private persistence owners rather than configuration alone.
When the exact in-flight Product distribution read has no eligible receipt-bound
policy, return unavailable before signed/root enumeration or coupon-unit reads.
Do not populate public auth from retained enterprise scope. Preserve errors from
corrupt receipts, consent, installed guards and retained publication; this branch
does not qualify supply or enable own-issuer anonymous fallback.
Monetary evidence uses the signed issuer only through MerchantScope's private
`evidenceEnterprise` validation child; the purchased unit remains vendor-scoped.
The priced transport sends that derived business issuer in the body, never an
enterprise header or rewritten token. Pricing independently admits the original
runtime namespace through its exact disabled business-caller policy. Keep fixed
transport, private capture and request/policy drift checks; permission alone is
not business, customer or merchant admission.
Merchant rights and priced transport diagnostics retain only fixed stages in
original-error WeakMaps. Digital's private validation controller may select
registered RIGHTS substages; copied errors, cause text and caller stage fields
never become diagnostics or admission authority. Preserve existing status IDs.

For selectable accelerator setup, read [setup contributions](llm/contracts/accelerator-setup-contributions.md).
Use nImport's fixed immutable JSON reader and this owner's insert-only admission;
never import live counters or claim hash-only coupon issuance as secure delivery.
No new BackOffice operation, importer or qualification flag is required. Verify
the installed receipt schema, private interceptors and unique insert owner per command.
Contribution snapshots map only the original nImport HTTP Authorization header
to the seller owner's detached bearer field before awaits. Preserve signed human
claims, reject malformed/conflicting bearer values and ignore body token fields;
fresh Profile scope/DENY checks remain mandatory for issuance and replay.
Secure coupon setup uses `DefaultCouponSecureIssuanceService` plus nSystem's
`DefaultSecretProtectionService`; ciphertext stays on coupon aggregates, never a
parallel vault. Keep the purpose key private and persistent, historical key versions
available, generated transactions atomic, and generic reads/exports/writes fenced.
Only private customer reveal with current committed digital purchase/payment/delivery
evidence may return a token. No plaintext legacy-field or hash-only reveal fallback.

Keep Store-specific `publication.delivery.rootCodesByStore` exact and fail-closed.
Do not union another Store's roots or fall back to mutable policy when a mapped
root is unavailable. Preserve legacy `rootCodes` when no map is supplied.

For issuer-reviewed seller consent and owner-priced merchant benefits, read
[the owner contract](llm/contracts/issuer-seller-and-merchant-benefits.md).
Qualify seller consent against its installed private writes/CAS, privacy, indexes,
transaction topology and current Profile scopes independently of merchant pricing.
An explicit LOCAL operator prerequisite selection is not completed journey evidence;
the actual installed guards still run on consent writes and replays. Monetary
benefits and priced-source selection separately require their own owner acceptance.
Do not require a priced purchase/redemption/refund before consent can be selected.
References or display names are not grants.
Current issuer/seller activity uses Profile's bounded service-only
`/references/read` enterprise projection, not generic Enterprise CRUD. Require
the exact code and active flag; preserve original signed runtime authority and
the separate human issuer/scope checks.
For exact ITEM promises, follow [verified item benefits](llm/contracts/verified-item-benefits.md).
Item descriptions and staff confirmation never establish delivered goods.
The separate `LOCAL_SIMULATION` mode requires the actual Fulfillment simulator's
LOCAL/selected-environment admission, never `qualified: true`. Keep exact ITEM
rights and store revisions, distinct SIMULATED_ITEMS tags, unverified status and
no deliveredAt or monetary fallback. Default VERIFIED behavior stays unqualified
until its real owner integration exists.

Issuer administration must retain the original bounded Bearer and signed human
identity, reject every conflicting tenant/enterprise alias, and validate every
Profile response wrapper. Require bounded well-formed allow and denial arrays;
never discard a malformed denial. Apply enterprise qualifiers to GLOBAL/TENANT
scopes and wildcard capability DENY. Detach reviewed commands before owner awaits.
These checks alone grant neither vendor-stock merchant access nor delegated budget writes.
Exact purchases use the separate [issuer merchant handoff](llm/contracts/issuer-merchant-stock-admission.md).
Preserve its real generated token/batch pipeline regression. Private
`admissionFailureStage` diagnostics are original-error WeakMap lookups only,
never caller flags, public cause details, persisted proof or admission authority.
Read admission cannot authorize writes: retain Digital's private confirmation
phase, exact argument identity, fresh scopes/consent and provider receipt fences.

Activated own-enterprise budget consumption and reversal use
`DefaultPromotionBudgetMutationService`: generated counter CAS and an insert-only
ledger receipt must commit in one qualified database transaction. Require original
first-use admission, exact immutable policy and command identity, and installed
private hooks/indexes. Disabling or unselecting delivery must never downgrade an
admitted counter into legacy accounting. This owner does not grant delegated
issuer mutation; see the activated budget section in the issuer/seller contract.

Public `budgetLedger` completeness comes only from an explicit successful generated
query count and a consistent bounded page, never `entries.length` or analytics
agreement. Use uncached nonrecursive `searchOptions.pageSize/pageNumber` with
stable code sort; top-level pageSize is not generated pagination. Preserve legacy
unscoped UI reads with metadata `enterpriseCode: null`; issuer acceptance must
require its exact scope and a complete first page. Do not change global
`listFromService`, grant private receipt reads, or label separate Mongo count/find
observations an atomic snapshot. See [public ledger completeness](llm/contracts/coupon-bound-issuer-budget.md#public-ledger-completeness)
and preserve the real generated/Mongo/protected-projection regressions in
`test/promotionBudgetLedgerCompletenessContract.test.js`.
The ledger-only facade `applyBudgetLedgerContext` must derive enterprise from
original signed `authData.entCode`/`enterpriseCode`, not assume nRouter supplied
`request.enterpriseCode`. Independently reject conflicting signed, request,
header, body and query namespace aliases before persistence; headers never grant
scope or rewrite auth. Legacy HTTP unscoped reads require a signed tenant/operator
with no enterprise claim or presented enterprise selector. Preserve the
controller/facade/generated-read regression, including complete empty issuer pages.

Coupon-specific delegated benefit accounting has a separate private receiver:
read [coupon-bound issuer budget](llm/contracts/coupon-bound-issuer-budget.md).
`DefaultPromotionCouponBudgetService` accepts only the canonical merchant owner's
in-flight handoff, original secure coupon/batch membership and explicit original
grant benefit purpose. Keep distribution Store and verified redemption outlet
distinct. Contract-v2 COMMIT identity is lifetime coupon-bound, not a new retry
key; RELEASE references its actual original COMMIT. Ordinary policy reads and
issuer management permission grant no accounting authority. GRANT may explicitly
retain only `ISSUED_COUPON_BENEFIT_V1`; REVOKE preserves its original purpose and
replay must compare it. Require the actual Distribution `assertInstalled` owner
before consent writes/replay, with no selection-based bypass. A first COMMIT
atomically fences unused CLAIMED coupon revision with ledger/counter; REDEEMED
recovery requires the actual exact original receipt and never creates a charge.
Isolated handoff/readiness/provider fixtures are not installed qualification.
Do not invent RELEASE admission without canonical original reversal authority.
Already-redeemed benefit reversals remain explicitly unsupported in the approved
local-demo scope. Genuine COMMIT identity cannot grant RELEASE. Preserve unused
purchase refund and original-sale asset refund contracts independently; simulation
approval does not widen either policy.

Before minting private append-only budget receipt admission, apply the installed
generated save initializer's effective inherited and tenant defaults, then pin
the exact resulting model. Normal generated save still runs. Never allowlist
arbitrary additional/default fields; changed defaults and copied requests refuse.
Cover the real default step, not only preSave hooks and an isolated insert adapter.
Accounting diagnostics retain only fixed original-error WeakMap stages, never
private transaction causes; reset the stage on each transaction callback attempt.

Budget-admitted campaign consent changes require the exact private
`isSellerConsentWrite` CAS identity and unchanged consent-only field allowlist;
never admit copied requests or budget/receipt changes. Published purchases retain
immutable policy authority for benefits and recheck fresh operational consent
against the reservation grant revision. Do not copy grants into publication.

- Follow `../../../../../AGENTS.md` and `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow ancestor contracts and read local guidance.

Preserve Commerce ownership, tenant security, exact evidence, idempotency, audit and generation discipline. Read the current active source and owning contracts before changes.

Coupon checkout must retain the selected Store's activated-policy authority.
For legacy fixed-window campaigns, sale retains the approved campaign window
intersected with the original unit's narrower window. Do not enable the separate
purchase-relative policy or infer new rights to populate missing expiry evidence.
Product-driven coupon availability resolves exactly one approved source-Product
policy and generated batch before bounded uncached live-unit reads. Never count
failed, duplicate, oversized or foreign results as supply or accept caller batch
selectors as Product binding. Availability is non-reserving and secret-free.
Release must explicitly remove persisted reservation fields through the generated
owner; preserve CAS/readback rather than treating undefined fields as deletion.
Checkout coupon consumption and reversal use the same private lifecycle CAS,
with fresh readback and narrow counter/status patches. Generic writes correctly
exclude encrypted aggregates; a zero-match acknowledgement is not redemption.

This capability declares an inert model-service inventory for [governed Local reset](../../../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

See [publication qualification](llm/contracts/README.md#publication-qualification-boundary):
policy capture is a projection, not immutable storage proof. Mutable restoration
is disabled; provider registration and activation require owner migration,
retained target policy, durable receipts, pointer CAS and no-source-fallback reads.
