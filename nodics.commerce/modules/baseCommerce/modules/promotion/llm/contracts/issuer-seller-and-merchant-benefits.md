# Issuer Seller Consent And Merchant Benefits

## Ownership And Readiness

### Large Setup Contributions

Deployments sharing a finite authority-transport budget may select
`promotion.setupPacing.preflightDelayMs` and `issuanceDelayMs` (integer 0..10000,
default 0). Each delay precedes fresh secure-owner batch admission and runs
outside its transaction. Caller headers and payloads cannot choose pacing.
Every issuer scope, active enterprise, consent, original-unit, persistence and
post-commit check remains mandatory. Budget-only contributions have no batch wait.
Align the trusted BackOffice data-release timeout with the bounded operation;
timeouts and rate-limit errors never authorize takeover of a RUNNING receipt.
For a FAILED attempt, reconcile exact version/checksum and original retained units,
then explicitly retry through nImport without forceCurrent or replenishment.

Issuer and seller activity is read through Profile's bounded service-only
`/references/read` with one exact enterprise code. Require the returned code and
`active: true`, under the original signed runtime's reference permission. Generic
Enterprise CRUD and manufactured service groups are not this integration.
Human consent authority and fresh Profile scope checks remain independent.

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

Related owner contracts: [trusted distribution read admission](trusted-distribution-read-admission.md)
documents the implemented Product-bound public/trusted read hooks and their
consumer regression gates. [Exact issuer merchant stock admission](issuer-merchant-stock-admission.md)
documents the separate original-staff handoff, confirmed Digital write phases
and recovery. [Coupon-bound accounting](coupon-bound-issuer-budget.md) documents
explicit benefit consent, first-COMMIT fencing and receipt-only recovery. None
of these contracts treats isolated source tests as native qualification.

## Independent LOCAL Prerequisite Selection

`qualified` is an operator assertion about the selected owner's prerequisites,
not a certificate that purchase, redemption or refund has completed. Do not use
fixture success, display names or successful source compilation as installed
evidence. Conversely, requiring a completed priced journey before selecting
seller consent creates a circular dependency that this contract does not impose.
Seller consent has no Pricing or monetary-benefit dependency.

The supported native sequence uses the existing bootstrapped topology and
original signed human actors, not a second bootstrap or a diagnostic/eval API:

1. Attest the disposable LOCAL scope, actual Mongo transaction topology and
   private console/upstream/APM capture qualification. Verify current Profile
   issuer permissions and exact enterprise scopes through their existing owners.
   Active enterprise references use Profile's existing service-only
   `POST /references/read` with `{type: "enterprise", codes: [exactCode]}` and the
   signed runtime's `profile.enterprise.reference.read` permission. Its bounded
   `code`, `name`, `active` projection must prove exactly one matching active
   identity; this adds no generic Enterprise CRUD grant to the human role.
2. Run the existing nImport/BackOffice preflight for each explicitly selected
   **budget-only** immutable pack (`couponBatches: []`). It reaches
   `DefaultPromotionBudgetAdmissionService.prepare`, which checks retained active
   policy/fingerprint, signed management authority, installed model/hooks/index
   and absence of conflicting history without seller qualification or writes.
   It is budget readiness only, not secure issuance or consent readiness.
3. After reviewing those independent prerequisites, explicitly select
   `promotion.sellerAuthorization.enabled: true` and `qualified: true`, preserving
   the inherited seller bound. Enable the existing
   `apiExposure.categories.commerceSellerAuthorizationManagement.enabled` category.
   This selection belongs only in the reviewed LOCAL configuration, never an
   import pack, test fixture, source default or automatic employee assignment.
4. Inspect the campaign through the existing signed seller-authorization GET,
   then submit the reviewed GRANT with its exact current revision. GET checks
   current issuer authority but is **not** an installed-readiness certificate.
   POST, including exact replay and REVOKE, runs the actual Distribution
   `assertInstalled` before consent CAS. It checks real Promotion/coupon schemas,
   hooks, indexes, privacy and atomic persistence; missing prerequisites refuse.
   Secure issuance independently checks the actual persistent token key owner.
5. Select the issuer's existing issuance pack through nImport. Its preflight
   checks current consent, retained policy, token keys and installed persistence.
   Issuance does not call the monetary Pricing adapter. Retain secret-free owner
   receipts and then execute real purchase/redemption/refund to establish journey
   evidence; neither flag selection nor issuance proves that journey.

There is no flag-free public aggregate consent-readiness endpoint:
`DefaultPromotionDistributionAdmissionService.assertInstalled` first requires the
selected seller policy. The secure owner's `persistence` checks themselves do not
depend on that flag, but are internal operations in the existing bootstrap, not
an external harness entrypoint. Do not bypass the policy guard or introduce a
readiness API merely to produce a pre-selection success. Independent native
evidence plus explicit operator selection followed by the normal guarded POST is
the supported path; report any refusal as a concrete unmet prerequisite.

For the separately human-approved `kickoffLocal` ITEM simulation, keep the
existing exact Fulfillment simulator/environment selection. In addition to
seller consent, select `promotion.purchasedRights.{enabled,qualified}: true`
before purchasing retained coupon rights and
`digitalCore.merchantRedemption.enabled: true` with
`storeScope.{enabled,qualified}: true` before outlet redemption. Store scope
qualification requires the actual active outlet records, original staff session,
fresh Profile direct STORE ALLOW/DENY checks and protected Store read admission.
Retain `promotion.merchantBenefits.enabled: true`,
`itemEvidenceMode: "LOCAL_SIMULATION"` and
`itemEvidenceService: "DefaultFulfillmentItemSimulationService"`; its actual
`assertSelected` must admit the LOCAL environment. Keep all of the following false:

- `promotion.merchantBenefits.qualified` (real delivery/monetary qualification).
- `promotion.merchantBenefits.pricedSource.qualified`.
- `digitalCore.merchantRedemption.pricedProvider.qualified`.
- `pricing.merchantEvidence.qualified`.

Do not change independent asset-ownership or notification selections as part of
this ITEM prerequisite choice. The 29 ITEM journeys can execute without outlet
AED baskets; their results must remain explicitly simulated/unverified. The nine
monetary journeys require separately reviewed issuer-owned AED data and their
own Pricing/transport/provider qualification. Neither branch proves the other.

Native monetary transport preserves its original signed service principal. The
runtime hosting the Promotion priced adapter calls Pricing with body
`enterpriseCode` derived through MerchantScope's private evidence binding; no
enterprise header, token or group rewrite is permitted. The actual caller's
deployment grant must contain `commerce.pricing.merchant.evidence` and admit both
pricing/promotion modules. For a different signed namespace, Pricing independently
requires the exact disabled-by-default `merchantEvidence.businessCallers` grant:
tenant, principal/business enterprise, service ID and all five signed deployment
coordinates, with selected environment and COMMERCE role checks. Same-enterprise
requests keep the existing strict path. This is neither customer admission nor a
generic authority bridge. See [Pricing membership and handoff](../../../pricing/llm/contracts/native-merchant-priced-evidence-v1.md).
Keep `commerceMerchantPricing` exposure and `pricing.merchantEvidence.qualified`
off until the separately approved native owner exercise. Promotion's independent
monetary/priced-source and Digital Core's priced-provider qualification remain
separate; source fixtures do not attest any installed provider or policy.

### Native Configuration Checkpoint

Select only the reviewed LOCAL deployment override, not framework defaults or
immutable data-release payloads. Configuration selection is explicit operator
consent to exercise the guarded owner, not evidence that its installed checks
passed. The sidecar's isolated provider tests authorize no qualification change.

| Selection | Independent native evidence / normal owner guard |
| --- | --- |
| `sellerAuthorization.{enabled,qualified}: true` and seller-management exposure | Original signed issuer and fresh Profile scopes/active references; reviewed private-capture attestation. Budget-only preflight is independent evidence, not consent proof. Actual consent POST must pass Distribution `assertInstalled` before CAS or replay. |
| `purchasedRights.{enabled,qualified}: true` for the approved ITEM test | Retained approved rights and the existing purchase owner; installed private coupon lifecycle/CAS and secure issuance remain required. No claim of completed purchase is made by selecting the policy. |
| `merchantRedemption.enabled: true`, `storeScope.{enabled,qualified}: true` | Original staff session; active exact issuer outlet; fresh direct Profile STORE scopes and DENY precedence; Store's protected merchant read and normal Digital workspace/validation. No broad Store schema grant. |
| `merchantBenefits.enabled: true`, `itemEvidenceMode: "LOCAL_SIMULATION"`, existing simulator owner | Actual Fulfillment `assertSelected` must admit the approved LOCAL environment; exact retained ITEM rights and original outlet binding. Leave `merchantBenefits.qualified: false`; label outputs simulated/unverified. |
| Monetary benefit/priced-source/provider qualification | Separate native owner-priced evidence and transport/provider acceptance. Consent, budget preflight, ITEM simulation and source tests do not prove these prerequisites. Keep unqualified until those are evidenced. |

Distribution's installed gate requires an operational runtime; the non-versioned
Promotion model with code identity, explicit revision, generated CAS and
transaction-safe/no-side-effect schema; exact seller and coupon protection hooks;
an installed non-sparse/non-partial binary unique campaign identity; and actual
secure-issuance persistence. The latter checks fail-closed transaction selection
and real multi-record atomic capability, non-versioned protected coupon/batch
models, CAS/read-projection guards, private write hooks, unique code indexes and
the coupon's unique `(tenant, tokenHash)` index. Request privacy must be qualified
with the actual sensitive-operation/capture-protection owners. Persistent token
keys are checked independently at secure issuance. Do not equate a configured
index declaration, model file, green fixture or qualified flag with any of these
installed results.

Use canonical GET/POST `/promotions/:promotionCode/seller-authorization` under the
original issuer token; POST a separately reviewed exact current revision, seller,
GRANT/REVOKE and command reference. Then use existing nImport preflight/install
for issuance, and the normal Digital `/merchant/redemptions/workspace`,
`/merchant/redemptions/validate` and `/:code/confirm` actions with original staff.
The test-only `test/helpers/runInstalledOwnerAcceptance.js` is callable solely
inside an existing reviewed bootstrap after `foundation.start`; it is not an HTTP
endpoint or supported standalone process and never selects configuration. Do not
add an eval/diagnostic route or bootstrap another server to invoke it. Record
guarded native results separately from subsequent purchase/redemption/refund.

## Issuer Administration

The separate `commerceSellerAuthorizationManagement` exposure category defaults
false. GET and POST `/promotions/:promotionCode/seller-authorization` both require
an access token, employee group and `commerce.coupon.seller.manage`. The service
independently requires a human issuer session, exact signed tenant/enterprise,
original access token and current Profile `/identity/scopes/me`. Relevant explicit
DENY overrides ALLOW. The browser cannot supply another issuer or Profile result.

Every supplied routed or signed tenant/enterprise alias must agree, including
empty aliases. The original bounded Bearer header and human login are retained;
refresh, customer and service principals cannot administer issuer consent.
Profile responses are checked at every envelope layer, with at most seven
wrappers: failed, ambiguous `data`/`result`, malformed error or non-success code
envelopes refuse even when their payload looks successful. Enterprise lookup
requires exactly one matching active identity through the routed Profile owner.
Profile's `Enterprise.tenant` business relationship is not compared with that
lookup's storage partition; Profile remains responsible for lookup isolation.

Effective scopes and denials must both be arrays, with at most 1,000 combined
rows. A supplied `scopeCount` must match the allow array. Malformed selectors,
contradictory effects and inactive rows refuse the entire admission rather than
silently losing a denial. Canonical absent, null or empty optional qualifiers
remain unrestricted. Enterprise qualifiers apply even to GLOBAL and TENANT
scopes; wildcard capabilities participate in DENY precedence. The owner reads
Profile afresh for each admission, not caller-provided scopes or cached grants.

Consent inspection and management detach command/authentication inputs before
their first owner read. Mutation of the original caller object during an await
cannot change the reviewed seller, command or actor. These checks are bounded
observations, not a lock across Profile and the campaign transaction. They add no
grants by themselves and do not authorize arbitrary delegated issuer-budget
spending or issuer employees to operate vendor-owned stock. Coupon-specific
benefit consumption additionally requires the explicitly reviewed purpose and
private canonical merchant handoff described below.

GET returns `promotionCode`, `promotionRevision` and safe seller consent summaries.
It excludes command hashes and grant actor identifiers. POST accepts only
`sellerEnterpriseCode`, `expectedRevision`, `action`, optional `expiresAt`,
`commandReference`, and the optional GRANT-only `benefitConsumption` field.
GRANT requires a future bounded timestamp and a currently active Profile seller.
The only benefit purpose is exactly `ISSUED_COUPON_BENEFIT_V1`; malformed or
REVOKE-supplied purposes refuse. Absence stays distribution-only, including a
fresh regrant, and cannot inherit or implicitly upgrade a prior purpose. A fresh
GRANT advances consent revision; stock issued under an older revision cannot
adopt it. REVOKE preserves original purpose and expiry. Exact-command retries
compare purpose and hash; changing purpose on a retry refuses, while absent
purpose preserves the legacy distribution-only hash format. Safe summaries
include the validated purpose when present but omit private command evidence.
The actual [Distribution admission owner](../../src/service/defaultPromotionDistributionAdmissionService.js)
and a strict successful
`assertInstalled(request)` are required before consent write or replay, including
when delivery selection is unselected. Missing installed CAS, secure hooks,
privacy capture, indexes or transaction topology cannot be bypassed with flags.
Its installed checks and actual owner hooks are detailed in
[trusted distribution read admission](trusted-distribution-read-admission.md#existing-owner-integration).
See [coupon-bound accounting](coupon-bound-issuer-budget.md) for the narrow
private benefit receiver and exact original inverse; management permission alone
is insufficient. The maximum
distinct seller count defaults to 100 and can be narrowed, never exceeded.

The command writes under campaign revision CAS with private request-object
admission. It stores issuer, seller, state, consent revision, expiry, reviewed
actor/time and command hash. Readback must match the complete intended consent at
the exact successor campaign revision. A lost acknowledgement is reconciled only
by that exact readback, never by another write. Same command replay must retain
the original actor, revision, expiry and command contents. Conflicts require a
fresh inspection; they do not become automatic retries.

## Allocation And Sale

### Delegated Secure Issuance

The bounded maintainer extension reuses
`DefaultCouponSellerAuthorizationService.authorizeIssuance(r, policy, expected)`.
This mergeable member is a read-only internal owner contract, not a new route,
caller identity switch, consent registry or pack grant. `r` retains the signed
human issuer management context and original access-token `authorization`.
The pinned activated `policy` supplies the canonical issuer and vendor. The
member requires the authenticated issuer to match that policy, qualified seller
authorization, current Profile issuer administration with explicit DENY precedence,
active Profile issuer/vendor and a fresh ACTIVE operational campaign whose exact
tenant, code, issuer and vendor match. It then validates one current unexpired
issuer-approved consent through the existing pure `proof` member. The vendor
scope supplied to that pure validator is derived from policy only; authentication
and generated persistence context remain issuer-owned.

`expected`, when supplied, is the original issuer/seller/promotion/grant-revision
proof. Changed, expired, revoked or revoked-then-regranted consent refuses rather
than adopting another revision. Secure issuance stores this proof, both exact
canonical references and original signed issuer authority in its immutable batch
command, authenticates the grant through nSystem AEAD, and retains it in each
coupon's existing `sellerAuthorizationProof`. The coupon's general association
and compatibility enterprise identify its operational vendor, not its issuer.
Only the secure owner's exact in-flight generated insertion identity may initialize
that proof. Copied requests and public flags grant nothing. Existing private
reservation/release paths preserve the proof; disabling authorization or regranting
cannot make these units unbound legacy stock. Self-issued legacy receipts and
ciphertext bindings are unchanged and require no fabricated grant.

Fresh Profile and consent rechecks surround original stock inspection, generated
transaction inserts and committed readback. Observed changes abort the transaction
or refuse confirmation without replacement tokens. These are bounded checks,
not an atomic lock across Profile, consent and transaction commit; native race
and isolation acceptance remain mandatory. Already committed stock retains its
original grant and receipt even when subsequent confirmation refuses.

The study/readiness scope is the two Promotion owner services, focused issuance/
seller tests, existing nSystem encryption, private logger context, generated
insert/transaction/read-protection owners and pinned policy/budget contracts.
Mode is explicitly framework maintainer; no setup installer, Operation service,
business identities, policy proposal, configuration, runtime or data reset is
changed. The source tests exercise successful issuance, rejection, recovery,
association tampering and later-layer narrowing with isolated ports; they do not
qualify native Profile, database or customer checkout. The following read bridge
provides policy integration; the separate
[issuer merchant bridge](issuer-merchant-stock-admission.md) and
[coupon-bound budget receiver](coupon-bound-issuer-budget.md) integrate confirmed
monetary COMMIT without authentication rewriting. RELEASE still requires a
canonical original reversal handoff. Do not duplicate accounting owners.

### Seller Policy And Budget Reads

`DefaultPromotionSellerPolicyService` resolves distribution from an existing
secure issuance receipt, never from a body-selected issuer, a new configuration
map or an inferred Product name. Its binding includes signed issuing authority,
canonical issuer/vendor references, Store/root, original policy fingerprint,
original grant revision, immutable issuance fingerprint and original admission
provenance. The secure owner privately reads the batch, while generated unique
identities, protected receipt writes and the existing owner lifecycle remain the
durable authority. No token is decrypted or returned by these policy reads.

Before any system-owner publication read, the bridge validates signed access-token
seller scope, resolves the original generated receipt, verifies the selected
Store/root and rereads current active Profile enterprises and live issuer consent.
Exactly the original grant must remain valid. It creates an in-flight private
read identity for `DefaultPromotionPublicationService.readSellerPolicy`, which
rejects copied, broadened or retained envelopes before obtaining system authority.
The Publication owner constructs a distinct Identity Governance system read
context with an explicit issuer selector; it does not alter caller authentication,
claim the customer is an issuer or relax `scope`, `readRecord`, `capturePolicy`
or ordinary `readActivated` enterprise equality. Only these exact private reads
opt out of caches. Publication mutation routes and independent Staged approval
remain unchanged.

The canonical activated reader must resolve the current issuer root and retained
release. The bridge additionally requires a completed current operation receipt
whose canonical key, root pointer/version/revision and release fingerprint agree.
Unfinished activation is refused, never settled or repaired during a customer
read. Exactly one retained campaign must match the issuance fingerprint, tenant,
issuer, vendor and ACTIVE status. Only that campaign is returned, not siblings
from its release. Superseding publication does not silently move old stock to a
new policy; an incompatible pin requires a reviewed owner lifecycle decision.

The issuer's fresh operational budget must retain the original admission actor,
provenance, command, Store/root and policy fingerprint, exact issuer associations,
valid current revision/spend and unchanged approved limit. Later issuance packs
use their explicit original `admissionContribution` and admission command. Older
combined packs bind through their original common contribution, Store/root and
policy pin; their existing admission command is preserved rather than invented.
No seller budget is created or substituted. After reads, the original receipt and
live grant are rechecked, and activated policy is checked again before returning.
These are bounded observations, not a distributed lock or budget reservation.
Publication returns a separate pure `retainedPolicy` and consumption-enriched
preview `policy`. Only the preview incorporates current `budget.spent`.
`readCoupon` returns the pure retained policy byte-for-structure, whose fingerprint
must remain the original published pin, so `capturePurchasedRights` cannot retain
a consumption-dependent fingerprint. Neither result publishes live consent.

The implemented Distribution hooks are narrow exceptions to ordinary signed
read admission, not general service/anonymous authority.
[SellerPolicy](../../src/service/defaultPromotionSellerPolicyService.js) `context`
and [SellerAuthorization](../../src/service/defaultCouponSellerAuthorizationService.js)
`sellerReadContext` resolve only an exact in-flight `resolveReadContext(request)`.
SellerPolicy's root/coupon/Product/budget entry points enforce `assertReadPurpose`;
Product selection also enforces `assertProductPolicy` on the retained policy.
See [the Distribution integration contract](trusted-distribution-read-admission.md#existing-owner-integration)
for public/trusted entry points, cleanup and the remaining direct-batch/Cart
consumer regression gates. This read identity grants no merchant write or budget
mutation; those require their separate canonical private owners.

| Parent integration helper | Result and use |
| --- | --- |
| `readRoot(request, rootCode)` | Delegated policy array with issuer budget spend, or `undefined` for the parent's existing own-enterprise reader |
| `readCoupon(request, observedCoupon)` | Fresh generated coupon/receipt membership and `{campaign: pureRetainedPolicy, activated:true}`, without live spend/consent; disabled/unselected stock carrying consent proof throws, unprotected legacy or verified self-issued stock returns `undefined` |
| `readProduct(request, productCode)` | Exactly one approved source Product binding and `{campaign, batchCode}`, or legacy `undefined`; parent keeps stock counts and reservation |
| `readBudget(request, exactReturnedPolicy)` | Fresh safe `{tenant, enterpriseCode, promotionCode, revision, budget}` issuer snapshot; a cloned policy cannot claim private owner identity |

In `Operation.promotions`, call `readRoot` with the original signed request for
each selected root **before** converting it to an ordinary internal service-read
context. Use the legacy activated reader only on `undefined`, never after a
thrown delegated refusal. Preserve duplicate campaign detection. In
`couponPurchaseCampaign`, use `readCoupon` before the existing activated/legacy
selection and keep its qualification and supported-benefit checks. In
`couponPoolAvailability`, use `readProduct` for the approved Product-to-batch
binding, then retain bounded seller-scoped live stock reads, exact unit/ref/proof
validation and checkout-time reservation. A caller's batch/issuer selector does
not establish this Product binding. On `undefined`, only the existing exact
same-enterprise Product-policy/batch resolution may run, never arbitrary batch
acceptance. `readRoot` must preserve the existing generic root mapping and
ordinary own-enterprise reader on `undefined`, not infer roots from campaign names.

Each `readProduct` call discovers private batches once, bounded by the existing
publication dependency ceiling, and filters their exact receipt Store and
selected roots using an in-call Set. It does not call `readRoot` once per root.
The mergeable Seller member `productPolicyCandidates(request, productCode,
bindings)` performs one bounded fresh generated campaign query: exact tenant,
vendor, Product metadata and a disjunction of receipt-derived issuer/campaign
pairs. It returns identities only. Current metadata is a narrowing hint, never
approved Product policy, consent or budget authority. Every candidate still
rereads its original receipt and passes the complete fresh Profile/consent,
activated policy pin and issuer budget checks. A candidate whose pinned Product
differs is refused, not omitted with legacy fallback. No candidate means
`undefined`; this cannot grant access to delegated stock through the strict
same-enterprise legacy path. Candidate lookup failure, overflow, duplicates or
foreign returned identities refuse. No cache or persistent mapping is introduced.
Discovery scales with selected roots plus bounded batches, not their product;
unrelated campaigns do not trigger full Profile/publication/budget checks.

Disabled/unselected legacy paths do not select this bridge, except retained
coupon consent proof still forbids legacy fallback. Selected but
unqualified authorization refuses. A delegated receipt with invalid consent,
missing/corrupt activation or budget provenance never falls back to mutable policy.
Discovery is bounded by the existing publication dependency ceiling and fails on
oversized, failed or ambiguous generated results. No new enablement flag or
distribution registry is introduced.

`readBudget` is a read snapshot, **not mutation authority**. Parent consumption,
ledger and reversal must explicitly preserve the issuer budget owner and original
receipt while keeping customer/redemption identity seller-scoped. Do not feed an
issuer-rewritten customer request into `consumeActivatedBudget`, broaden generic
CRUD or treat a returned selector as permission. No arbitrary issuer write
context/callback is exported by this read bridge. The separate confirmed merchant
handoff now supplies COMMIT integration; installed native acceptance and canonical
original RELEASE admission remain separate gates.

### Supported Callers And Remaining Integration Gates

The supported caller is an already authenticated **human or customer access-token**
principal, with a bounded principal identifier, exact signed tenant/enterprise
aliases and selected Store. Secured entry routes remain responsible for their
independent permissions. Pass that original request to the bridge before any
`serviceAuthData` conversion. The bridge does not authenticate a request body or
manufacture customer identity. Service principals (including Identity Governance
system auth), anonymous/public Shop requests, copied flags and claimed customer
objects are refused when this bridge is selected. Disabled/unselected legacy
behavior does not expand that support.

Product's `DefaultProductSearchEnrichmentService.consumerSummaries` preserves the
original authentication before adding retained catalogue scope, and
`consumerAvailability` passes that authentication to Digital availability without
service-principal conversion or manufactured enterprise claims. Physical inventory
and pricing retain their existing owner contexts. The authenticated human/customer
Product path can therefore use this bridge when the original signed scope meets
all requirements above. Catalogue scope alone, including an enterprise absent
from the original authentication, does not confer signed seller authority.

Direct service/anonymous calls to this policy bridge remain refused. The separate
[Distribution admission owner](trusted-distribution-read-admission.md) now admits
only exact non-reserving Product reads. Public reads require current pinned
catalogue visibility and return only availability/status. Trusted service handoffs
retain original signed authority separately, never reconstructing a customer
from persisted Cart fields. Product and Cart call these fixed helpers before
authority is lost. A downstream service identity without its genuine original
owner context remains unsupported. Product admission cannot enumerate roots,
inspect coupons/budgets, reserve stock or mutate records. Installed consent/private
persistence is checked through actual owners, not configuration flags.

Merchant redemption uses the separate
[exact issuer merchant handoff](issuer-merchant-stock-admission.md), which admits
one original securely issued vendor purchase under fresh signed issuer staff,
outlet and live consent. Generic enterprise equality remains unchanged. Read
admission grants no writes: canonical Digital confirmation phases supply exact
private instruction/claim/provider-receipt/redeem commands. Monetary benefit COMMIT
uses the private coupon-bound issuer receiver. ITEM still requires an independently
authenticated delivery owner; source fallback and staff confirmation do not prove
delivery. Native merchant acceptance remains separate from these source tests.

For configuration owners, the existing independently qualified seller policy and
exact Online publication delivery Store/root selection remain mandatory. Business
instructions must retain issuer-owned approved campaign/budget admission and
vendor-owned operational coupon stock, canonical Profile references, exact policy
pin and an actual issuer-reviewed live grant. Importing an unapproved proposal
does not satisfy these instructions. Budget admission, consumption or reversal
with the seller enterprise in place of the signed issuer is an ownership mismatch,
not a reason to change the budget owner or relax enterprise checks. Parent owners
must retain actual policy approval and installed qualification independently of
source integration. Imported packs cannot manufacture live grants or readiness.

Readiness scope is explicitly maintainer-owned: Seller authorization, the new
mergeable read service, Publication's exact private reader and focused tests.
The parent has integrated Operation's `promotions`, `couponPurchaseCampaign` and
`couponPoolAvailability` with the real bridge and a mergeable selected-owner guard.
The coordinated source batch additionally integrates Distribution Product reads,
issuer merchant stock admission and coupon-bound COMMIT. Their contracts describe
separate private authority; none turns policy read scope into mutation permission.
`promotionSellerPolicyBridgeContract.test.js` exercises real issued consent/
receipt owners and the canonical activated reader with isolated persistence ports,
covering scope/legacy refusal, grant changes, current activation, budget provenance,
private identity, replay membership, failure, 38-root/43-Product bounded discovery,
candidate metadata refusal, service/anonymous denial and later-layer
narrowing. Actual Operation regressions cover live preview spend of `17`, a pure
purchase-policy fingerprint stable across spend changes, exact vendor batch
availability of three units, refusal of a different batch, revoked-grant and
missing-selected-owner denial, and unchanged self-issued own-root fallback.
Native schema/index/privacy/Profile qualification and storefront
acceptance are not inferred from those tests.

Ownership/placement review: **PASS for this source-only maintainer slice**.
The mergeable Promotion owners, focused owner tests and nearest contracts reuse
existing Profile, Identity Governance, private receipt, publication and budget
authorities. No parallel registry, issuer impersonation, generic enterprise
relaxation, configuration/business record or runtime action is introduced here.
Operation read integration is verified by actual-method regressions, not budget
mutation authority. Generated contexts and canonical builds are refreshed after
source freeze. Canonical used-benefit reversal admission, authenticated ITEM
delivery, installed qualification and native end-to-end acceptance remain open;
source tests are not accepted live evidence.

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

### Consent CAS On Admitted Campaigns

Budget-admitted campaigns accept the existing issuer command through the declared
ordered generated update guards. Only the exact in-flight request registered by
`DefaultCouponSellerAuthorizationService.manage` is admitted through
`isSellerConsentWrite`. Its tenant and equality selector (`code`, `tenant`,
`revision`) must remain unchanged. Its entire model is restricted to `code`,
successor `revision` and `sellerAuthorizations`, with unchanged owner-built values.
Budget, admission receipt, alternate models and update operators are not allowed.
Copied requests, body flags and retained requests after success or failure grant
no admission. The budget receipt and consumption remain unchanged; generic
updates retain the existing atomic absence fence. Signed issuer/Profile checks,
revision CAS and exact readback still apply.

### Published Purchase And Live Consent

`capturePurchasedRights` retains approved benefit rules and windows exclusively
from the selected activated policy. Seller consents remain live operational
authority and are never added to immutable policy or its fingerprint. Published
issuer/vendor references must match the reserved unit. Fresh authorization is
rechecked after policy loading against the original observed proof and the
reservation's grant revision; revocation or revoke/regrant cannot revive it.
Current Profile enterprise checks precede the final fresh campaign read so a
consent change during those asynchronous checks is observed. This is bounded
read-time validation, not an atomic transaction across Profile, policy and sale.
Completed sale replay retains its existing financial history. Disabled defaults
and installed qualification gates remain unchanged.

## Monetary Benefit Evidence

The optional merchant-benefit owner supports declared fixed discounts, percentage
discounts, maximum discount caps and minimum subtotal using the framework's exact
amount service. It rejects conflicting declarations, percentages over 100,
negative/malformed amounts and discounts exceeding the authoritative subtotal.
Unsupported monetary action keys remain refused. Descriptive offer names do not
establish approved fulfillment products; exact ITEM promises use the separate
[verified item integration](verified-item-benefits.md), not monetary conversion.

`ITEM` benefits require the qualified exact owning integration, independently of
the monetary adapter. `DefaultPromotionItemBenefitService` validates bounded
canonical SKU/quantity/`EACH` promises and eligible outlets; a loader-visible
`merchantBenefits.itemEvidenceService.evaluate` must independently verify the
original immutable DELIVERED receipt bound to coupon, buyer, campaign revision,
outlet, target and complete items. Digital Core's existing merchant-screen path
dispatches ITEM to its dedicated item provider and retains the existing instruction/
receipt coordination. Neither selection nor staff confirmation proves fulfillment.
Defaults remain unqualified with no item evidence owner selected, and the current
reference application has no qualified native delivery source. Product-driven
availability, reservations, first sale capture and merchant eligibility therefore
continue to refuse unsupported/unqualified promises with
`ERR_PROMOTION_BENEFIT_UNCONFIRMED`. Mixed item/monetary actions remain unsupported. Existing
completed-sale replay and release/refund recovery retain their original evidence;
the guard does not convert old item rights into money or replenish a budget.
Checkout's existing compensation/recovery remains required if policy changes
after reservation and payment capture but before first sale confirmation.

Qualifying item fulfillment requires reviewed canonical item or bundle
definitions, exact quantities and units, permitted choices/substitutions, outlet
eligibility and independently verified delivery evidence. Reuse Digital Core's
validation, durable command/receipt and redemption coordination. Staff-screen
confirmation alone cannot establish that the promised items were delivered.

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

## Activated Own-Enterprise Budget Accounting

`DefaultPromotionBudgetMutationService` is the mergeable accounting owner used by
`Operation.consumeActivatedBudget` and selected `releaseBudget`. It reuses the
existing `promotionBudgetLedger`, live Promotion counter and
`DefaultDatabaseTransactionService`; it introduces no journal, route, grant,
configuration flag or delegated authority. The runtime must explicitly be
`COMMERCE` (string or `{code}`), the Store must select activated delivery, and
the original authenticated tenant and every enterprise alias must agree.
General delegated issuer-budget mutation remains refused by these ordinary
entry points. The separate [coupon-bound private receiver](coupon-bound-issuer-budget.md)
admits only explicitly consented original purchased-coupon benefits. Unselected legacy accounting
retains its existing behavior and is not upgraded to exactly-once accounting.
An admitted counter is never legacy policy input. Disabling delivery or selecting
another Store cannot downgrade its consumption/reversal into the old mutable
accounting path; the operation refuses without changing its receipts or spend.
Legacy writes retain an atomic `budgetAdmission: {$exists:false}` selector and
never receive private admitted-counter authority. A replacement between read and
update cannot be overwritten. Both legacy consumption and reversal require a
positive single-row generated update before ledger append; missing update owners,
zero/multi-match, negative or uncertain acknowledgements never fall back to save.
This fence does not upgrade legacy accounting to transactional ledger atomicity.

The activated counter must retain its original first-use `budgetAdmission`.
An ordinary snapshot with a matching limit is insufficient. The owner verifies
the original immutable contribution, actor, command reference, tenant, issuer,
campaign, Store/root and pure published policy fingerprint through the existing
admission replay member. It retains that exact admission command and full
admission fingerprint in each private mutation command. Missing, altered or
foreign admission fails before writes; accounting never creates or repairs it.

| Accounting invariant | Required implementation |
| --- | --- |
| COMMIT identity | Tenant, signed enterprise, COMMIT and original exact idempotency key only; never spend, time, target or campaign |
| Conflict detection | Retained campaign, target/type, buyer, Store/root, policy pin, amount, currency, redemption code and original admission must all agree |
| RELEASE fence | Exact original COMMIT and retained amount; one RELEASE identity per COMMIT, independent of a new reversal key |
| Atomicity | One opaque transaction inserts the immutable ledger row and CAS-updates the original revision/spend; readback must confirm both before callback completion |
| Uncertain acknowledgement | Inspect only the exact original receipt and original admission; no inferred success, replacement receipt or additional mutation |
| Generated boundary | Exact in-flight insert envelope, boolean insert-only and original transaction identity; generic save/upsert, update and remove cannot forge, alter or erase a receipt |
| Installed readiness | Actual unversioned transaction schemas, disabled cache/events/search, private hooks/read protection, unique identity indexes and qualified atomic topology |

Explicit and natural idempotency keys retain their original bounded printable
text. Buyer/principal IDs may be email-shaped; campaign, Store and Cart codes
remain bounded identifiers. Routed Express objects and opaque tokens are not
deep-cloned. Only needed authority/data inputs are detached before awaits.
Private reads pin original tenant/auth/query/options and exact transaction
identity, allow canonical generated metadata/option normalization, reject count
contradictions and suppress private command evidence from generic reads/exports.
Negative acknowledgements refuse; counter CAS requires acknowledged, matched-one
and modified-one evidence. Copied or changed private envelopes grant nothing.

This guarantee covers budget accounting only, not the enclosing apply/reverse,
coupon, redemption, payment or full Checkout transaction. Publication/Profile
observations are not a distributed lock. Release uses the original admitted
COMMIT, not a newly published benefit. A retained no-budget policy needs no
budget compensation; a budget policy without its original COMMIT refuses.
Do not infer original consumption from historical mutable ledger/snapshot data.

`promotionActivatedBudgetMutationContract.test.js` exercises real owner dispatch,
generated hooks/read suppression, insert/update persistence and opaque
transactions with an isolated atomic adapter. It covers races, rollback,
callback replay, lost acknowledgement, same-key changed target/campaign,
admission drift, forged/public writes, read-envelope/count tampering, negative
acknowledgements, email IDs, Express cycles, wrong runtime roles, missing
installed protections and later-layer narrowing. It does not qualify native
database failover, installed indexes or authenticated end-to-end checkout.

## Customization And Validation

Later layers may narrow maximum sellers, choose a qualified monetary owner and
override small exported helpers through the existing load hierarchy. Preserve
the private write boundary, scope recheck, stable command identity, revision
binding and exact amounts. Do not copy this service into Kickoff or create a
parallel consent registry. Publication installation and operational owner schemas
must be qualified together; no Staged/Online activation is performed here.

Source regression fixtures: `couponSellerAuthorizationContract.test.js`,
`purchasedCouponLifecycleContract.test.js` and `promotionMerchantBenefitContract.test.js`
under the module's `test/`. The isolated ordered generated-update guard tests cover
consent-only CAS on admitted campaigns, copied/mutated request refusal and unchanged
budget receipts; purchase tests cover grant-free activated policy and live-consent races.
`promotionUnsupportedItemBenefitContract.test.js` covers unsupported-item refusal
independently of monetary selection and preserves unrelated lifecycle behavior.
The broader fixtures cover
consent revocation/non-revival, lost acknowledgement, same-command replay,
generic proof denial, disabled qualification and later-layer adapter refusal.
Static syntax/format checks do not replace shared runtime, race, security and
customer/operator acceptance.
