# Coupon Offers And Acquisition

Promotion owns `promotion.couponOffer`, secure coupon units, offer-wide supply,
lifetime purchasing-owner allowance, bilateral redemption participation and
protected acquisition reporting. These are shared Commerce capabilities. Digital
and Checkout retain acquisition orchestration, certificate owner calls, optional
Payment consideration, entitlements, reveal, delivery and staff redemption.

## Governed Offer

For a fixed-expiry offer, set `couponOffer.expiryReminderEnabled` to `true`
to opt purchases into Digital reminder eligibility. Promotion retains the
choice at purchase. Omitted or false choices preserve ordinary coupon rights
and do not enroll the purchase. Recipient and channel eligibility are checked
again at delivery.

New publication capture, validation and target preparation require a valid
`couponOffer` whenever a policy declares `couponOffer`,
`conditions.sourceProductCode` or `purchasedCouponPolicy`.
`conditions.couponRequired: true` alone requires a redemption code, not a
purchasable offer; generic code-based discount promotions remain publishable
without acquisition policy.
Legacy purchase-relative policy alone is not current offer evidence. This check
does not alter retained historical reads, installed coupons or ordinary discount
promotions. Missing rights must be resolved by the author, not inferred from
price, a technical issuance batch, or a campaign's date window.
Mixing `couponOffer` with `purchasedCouponPolicy` also refuses: fixed/NONE and
purchase-relative expiry are not interchangeable promises.

Create an offer through the existing draft owner with `couponOffer`, `actions`
and `conditions`. This requires ordinary draft access plus
`commerce.promotion.manage`. The issuer always resolves to the original signed
Enterprise, including for Platform administrators; no scope override is accepted.
For a new offer only, optional `vendorEnterpriseRef` selects a marketplace using
the exact `{ "moduleName": "profile", "schemaName": "enterprise", "code": "marketplace" }`
shape. Omission retains the signed Enterprise as vendor. Promotion checks an
explicit selection through Profile's existing active-enterprise reference API
and rechecks original caller admission after that read, before persistence.
Missing, inactive, foreign-result, ambiguous or failed reference reads refuse.
This reference selects a business seller, not authority to act as that seller.
It grants no seller consent, participation, budget, stock or publication approval.
Those normal owner gates remain independently required. Vendor and issuer remain
immutable after creation; ordinary metadata updates cannot retarget either.

The coupon authoring frontend should provide an optional canonical Enterprise
selection and send `vendorEnterpriseRef` only on explicit new-offer creation.
Do not add it to ordinary campaign metadata editing or copy approvals/consent from
prefill. Existing legacy offers still cannot use current-offer prefill. Discovery
continues to require both draft-write and manage permissions plus qualified
Staged storage; a selectable vendor does not broaden `canCreate`.

Source publication retains the complete `couponOffer`:

New-offer creation additionally accepts `budget: { "limit": "3000" }`: an
explicit non-negative decimal string, never a supply quantity, spent counter,
opening receipt or default financial commitment. Omit only while preparing an
incomplete draft; submission of a CouponOffer requires its explicit budget.
Existing offer rights and financial limits cannot be changed through metadata
updates. `enterpriseRef` and `issuerEnterpriseRef` derive from signed issuer
scope; explicit vendor selection never changes those references.

The existing Staged `/promotions/:promotionCode/submit`, `/approve`, `/schedule`,
`/suspend` and `/archive` POST actions require exactly
`{expectedVersionId, expectedRevision, reasonCode}`. Both preconditions are
non-negative safe integers from fresh owner readback; reasonCode is a nonempty
string of at most 512 characters. Source storage must be qualified CURRENT
versioned storage. Each successful command appends one version, checks the
generated acknowledgement and reads it back; there is no retry, upsert or
fabricated success model. Metadata updates remain DRAFT-only.

SUBMIT takes DRAFT to SUBMITTED. APPROVE requires the existing separate
`commerce.promotion.approve` permission and preserves the pre-existing
`DefaultPromotionOperationService.assertLifecycleApproval` maker-checker rule;
it takes SUBMITTED to APPROVED. Other actions retain `commerce.promotion.manage`.
SCHEDULE takes APPROVED (or an already SCHEDULED offer) to SCHEDULED before its
validFrom, otherwise ACTIVE, using server time. A due scheduled offer uses the
same explicit SCHEDULE command; no scheduler or activation is inferred.
Expired sale windows or fixed coupon expiry refuse activation. SUSPEND accepts
ACTIVE/SCHEDULED; ARCHIVE accepts DRAFT/SUSPENDED. Neither expiry nor suspension
rewrites existing issued rights. ACTIVE source is not Online publication or
operational budget/consent/issuance authority.

Inspection now returns `budget: {limit}`, `vendorEnterpriseRef`, and
`lifecycleActions`, in addition to the existing fields. The array contains only
currently available actions, each shaped as
`{actionCode, labelKey, method, route, expectedVersionId, expectedRevision}`.
Routes are module-relative `/promotions/<code>/<action>`; clients use Promotion's
v0 base. Availability rechecks permission, source qualification, original scope,
state, approval and validity. It never substitutes for command admission.
Workspace labels are `budgetLimit`, `submit`, `approve`, `schedule`, `suspend`,
`archive`, and `reasonCode`. Axis must render these owner-provided actions, not a
status dropdown or client-selected ACTIVE state. Prefill copies budget limit and
vendor reference as unsaved selections, never actors, approvals or consent.

```json
{
  "version": 1,
  "supply": { "mode": "LIMITED", "quantity": 50 },
  "ownerLimit": 2,
  "expiry": { "mode": "FIXED", "at": "2027-12-31T23:59:59.000Z" },
  "requirements": {
    "type": "BOTH",
    "priceRef": "coupon-points-price",
    "certificates": {
      "quantity": 1,
      "categoryCode": "electronics",
      "milestoneCode": "RECYCLED"
    }
  },
  "terms": ["Single use. Completed purchases are final."]
}
```

`UNLIMITED` omits quantity. `NONE` expiry omits `at`. Omit `ownerLimit` for no
additional lifetime limit. Requirements are `REWARDS`, `CERTIFICATES` or `BOTH`;
only the applicable price/certificate branches are accepted. Optional canonical
`brandCodes` and `modelCodes` constrain certificate selection. Unsupported keys
fail. Price references belong to Pricing; no local balance or price calculation.

Benefits, conditions, acquisition rules, supply and retained terms become immutable
at creation. Generic, imported and successor-version mutations cannot change
them or remove the offer. Text correction uses the existing metadata command.
Immutable-offer guards retain any supplied revision precondition; a stale
command cannot be silently rebased to the revision observed by the hook.
`GET /promotions/:promotionCode/prefill` returns unsaved reusable content only;
normal explicit create produces a separate identity with no stock, approvals,
acceptances, actors, purchases or history copied.

## Acquisition Ports

### Catalogue Validity Projection

The existing allocation availability read returns validated `couponOffer.expiry`.
Distribution's private allowlist retains it. `publicSupply` emits only
availability/status, safe acquisition requirements and `expiry`: exactly
`{mode: "FIXED", at: "<canonical ISO UTC>"}`, `{mode: "NONE"}`, or null.
The instant is copied from the approved structured promise, never parsed from
terms, identifiers, campaign sale dates or calculated from purchase time.
Missing validity stays null/unavailable; malformed validity refuses. Expired
fixed rights remain disclosed but unavailable. Supply=false stays false.
No price references, counters, policy bodies, coupon secrets or private receipts
are added to the public DTO.

Product uses this same DTO for anonymous batch and signed consumer enrichment;
eWaste translates FIXED.at to its existing expiresAt field. NONE has no date.
Read projection does not change immutable publication payloads, terms, units,
purchase policy or entitlements. Existing approved publications require no
recreation or republication for this read-only source correction.
Adopt the coordinated Product/Promotion/eWaste implementation before qualifying
the expanded four-field DTO; mixed old/new runtimes are not qualified.
Missing approved structured rights require owner investigation, not backfill.
Later service overrides must preserve the DTO and existing admission checks.
No new configuration, default, activation flag or customer wiring is introduced;
framework limits and deployment selections retain their existing owners.

Digital supplies a loader-visible `DefaultDigitalCommerceCouponAcquisitionService`
with these fixed methods. Its implemented readers and checkpoint operations,
plus remaining shared Checkout/domain wiring, are documented in Digital's
[coupon source contract](../../../../../digitalCommerce/modules/digitalCore/llm/contracts/coupon-acquisition-source.md).
Implemented ports alone do not establish an operational purchase journey:

- `authorize(request)` rechecks original buyer/employee permissions, Enterprise
  purchase settings and common order identity. Return exact `{tenant, ownerRef,
  ownerId, orderCode}`. `ownerRef` is `{type: CUSTOMER|ENTERPRISE, code}`;
  `ownerId` is the existing Digital ownership key, never implicitly the employee.
- `readCertificateEligibility(request)` reads canonical component-owner evidence
  for the exact `certificateCodes`. Return `{code, ownerRef, valid, consumed,
  available, reservationCode?, categoryCode, brandCode?, modelCode?, milestoneCodes}`
  per selected certificate. The owner, not caller data, attests these fields.
- `completion(request)` reconciles required inputs under the exact order and
  returns `{status: COMPLETED, orderCode, ownerRef, certificateCodes,
  rewardCaptureReference?}` only after every selected certificate is consumed and
  required points captured. Certificate-only omits capture entirely. It must not
  depend on a usable coupon existing first: this is the consideration checkpoint.
- `failed(request)` returns `{status: FAILED, orderCode, couponUsable: false,
  inputsReconciled: true}` only when canonical common recovery confirms genuine
  failure. Unknown or completed outcomes must refuse.
- `reportingEvents({tenant, authData, channelCode, pageSize, cursor?, snapshotId?})`
  returns canonical confirmed purchase/redemption events with stable snapshot
  identity, complete history, event-time Enterprise/Store/owner associations and
  coverage. See reporting below. No browser-supplied events are accepted.

For new offers, `reserveCouponCodeForCheckout` receives `payload.promotionCode`,
exact order/entry/product identity, selected `certificateCodes`, original
`idempotencyKey`, canonical `ownerRef` and existing `ownerId`. It reserves one unit
per existing checkout allocation command. Multiple units use distinct existing
unit commands, all counted against the same offer and purchasing owner.

The allocation owner uses generated services and qualified multi-record
transactions for the supply counter, owner counter, reservation receipt and coupon
CAS. Unlimited stock securely issues one unit per command through the existing
encrypted issuance owner. It never creates artificial large pools. Limited
technical batches do not grant additional offer supply. No store/channel quota.

`confirmCouponCodeSale` requires the original acquisition identity and consideration
checkpoint, then commits lifetime counters and sale atomically. Replay preserves
completed/claimed/redeemed states. `releaseCouponCodeReservation` requires the
original failed-acquisition proof; unknown outcomes retain holds. Expiry,
redemption and withdrawal never restore completed allowance or supply.

Purchased `purchasePolicy.version = 2` retains fixed or explicit NONE expiry,
original owner, benefits, acquisition rules and participation. Digital must copy
this exact policy into the entitlement, admit NONE expiry consistently, prevent
post-completion refunds/transfer, and require complete consideration plus delivery
before reveal. Missing historical expiry is not NONE. Existing unrelated
purchase-relative contracts retain their separate version-1 semantics.

## Participation And Staff

`POST /promotions/:promotionCode/redeemer-participation` accepts `AUTHORIZE`,
`ACCEPT`, or `WITHDRAW`, `redeemerEnterpriseCode`, `expectedRevision` and stable
`commandReference`. AUTHORIZE additionally selects `{mode: SELECTED, storeCodes}`
or `{mode: ALL_ELIGIBLE}`. Issuer authorization and redeemer acceptance use fresh
Profile staff scope/DENY checks; acceptance validates selected Store ownership.
No group membership or seller consent implies redeemer acceptance.

Purchase retains accepted scopes. Later withdrawal blocks new acquisition through
that acceptance without erasing purchased rights. Current staff authority and
current Store ownership remain mandatory when exercising retained rights.
`authorizeRedemption(request, coupon)` is the Promotion scope check for Digital's
existing merchant flow. Digital must call it within its private staff admission,
use identical token validation for QR/manual entry, and retain actual issuer,
redeemer, outlet and employee separately in the existing confirmed receipt.
Customer presentation grants no self-redemption. Validation never consumes; the
existing explicit merchant confirmation remains the single-use commit. No payment,
reward credit, inter-Enterprise settlement or merchant guarantee is added.

## Reporting And Privacy

`DefaultCouponAcquisitionReportingService.refresh` is an inactive-by-default
service command suitable for the existing scheduler. No schedule is activated.
Canonical source responses include `{tenant, snapshotId, coverageThrough,
historyComplete: true, events, complete, nextCursor}`. Every page shares the same
snapshot and coverage. Events contain `sourceId`, `kind: PURCHASE|REDEMPTION`,
`confirmedAt` ISO UTC, `promotionCode`, `issuerEnterpriseCode`, `channel`,
`confirmed: true`, `historyKnown`, and canonical `ownerRef` or explicit null.
REDEMPTION also carries actual `redeemerEnterpriseCode` and `storeCode`. The
selected channel is governed business data (Circa selects its own channel code),
never a framework project default. All-time complete history is necessary for a
New-through-channel claim; missing identity/history remains Unknown.

The persisted private projection orders by authoritative event time and stable
source identity. Late-event refresh reclassifies the affected history. Enterprise
purchasers count once per Enterprise rather than once per acting employee.
`POST /promotions/:promotionCode/acquisition-report` accepts `view: ISSUER|REDEEMER`
and `channelCode`. The existing analytics admission enforces original signed
Enterprise. Issuers receive campaign purchase/redemption aggregates only;
redeemers receive New/Returning-through-channel/Unknown counts. No names,
contacts, owner identifiers, token, unrelated history or identifying rows escape.

Privacy runs after allowed filters over distinct owners. Any small/unknown-owner
cell protects all related counts, returning null with PROTECTED rather than zero.
Dashboards and exports use this same API. No arbitrary date/outlet/owner filters,
raw drill-downs or alternate export reads are authorized. `dataUpdatedThrough`
is successful source coverage with `timezone: UTC`; failed refresh leaves the
previous projection intact. This does not claim partner CRM history or billing
authority. `DefaultCouponAcquisitionReportScopeService` binds ENTERPRISE to the
signed Enterprise; GROUP requires a human access token and derives its bounded
members from Profile's current explicit administration VIEW grants. It does not
infer access from parent/child relationships or accept caller-provided members.
OUTLET reads one exact active Store under caller authority and accepts only its
canonical Profile Enterprise association when that Enterprise is in the current
Profile-authorized set. Report query re-resolves scope before returning results.
All failures deny the query without exposing Profile or Store diagnostics.

## Configuration And Verification

All reusable bounds/defaults live in Promotion `config/properties.js` under
`couponOffers` and `acquisitionReporting`; owner validation rejects missing/invalid
effective leaves. Later layers supply intentional overriding values only. Offer
choices, consent, owners and source coverage are governed records. Privacy is
mandatory even when reporting configuration is overridden. Installed private
hooks, unique indexes and transaction topology are checked before writes.

Focused unit tests use isolated generated-owner ports and transaction rollback;
they are not installed database, provider, live delivery or E2E acceptance.
Digital acquisition/Checkout, Waste callback, typed Enterprise list/reveal and
Profile-backed IN_APP expiry delivery now have composed source tests under Digital.
Runtime adoption and installed/private persistence qualification remain separate;
do not infer them from ports or unit results. Digital's owner contracts document
the exact source paths and remaining merchant benefit integration limits.

Communication supplies the existing persisted intent and a fixed current-source
eligibility hook; Digital must contribute its source mapping and read-only expiry
owner. Promotion does not create reminder intents, contacts or schedules.
MerchantScope now admits retained participants to exact purchased stock using
current Profile/outlet scope and secure issuance membership. Item/priced benefit
and budget guards remain enforced; their issuer/Store assumptions still need
coordinated v2 integration. Admission alone is not complete fulfillment. Unlimited
own-issuer issuance is implemented; initial third-party seller distribution still
requires the existing receipt-bound publication/setup provenance and is not
established by an on-demand issuance batch. Delegated unlimited offers are
explicitly unavailable and refuse allocation before supply/owner holds or token
creation. Both allocation and secure issuance enforce this boundary. Supporting
that case requires retaining the original selected root, policy fingerprint and
contribution provenance, plus discovery that distinguishes repeated on-demand
units from the original distribution binding. No fallback bypass is authorized.

## Native Workspaces

`GET /promotions/coupon-offers/workspace` returns effective framework-owned
labels/options, bounds and `canCreate`, with the existing DTO shape unchanged.
The BackOffice provider resolves the hash-declared `couponOfferPresentation`
SOURCE_CONTRIBUTION in `data/backoffice`, using its mergeable
`couponOfferPresentationData` member. It is source data, not an executable CMS
import. Later provider layers may customize copy; configuration continues to own
policy bounds, and runtime services independently determine `canCreate`.
`GET /promotions/:promotionCode/coupon-offer` returns one exact authorized persisted
offer with revision/version. Creation remains `PUT /promotions/drafts`; name-only
correction uses the existing draft PATCH. Prefill never copies live state.
Inspection and prefill read the exact current scoped record, including inactive
DRAFT offers; they must not use active-sales campaign admission. Both recheck
original employee scope after the generated read, and prefill additionally
retains draft permission. Missing, ambiguous and foreign rows refuse.

Workspace keys: `promotion.couponOffers` / `authoring` uses COMMERCE_STAGED/STAGED;
`promotion.couponAcquisition` / `reporting` uses COMMERCE/ONLINE. Both require
`commerce.promotion.read`; creation also requires draft admission and manage
permission. Axis registry registration is separate from backend navigation.
Report export consumes the same protected aggregate endpoint, never raw rows.
## Public Acquisition Requirements

Promotion validates the canonical offer through `DefaultCouponOfferService` and
projects its live `purchaseRequirements` into `acquisitionRequirements`:

```ts
type AcquisitionRequirements = null | { type: 'REWARDS' } | {
  type: 'CERTIFICATES' | 'BOTH';
  certificates: {
    quantity: number;
    categoryCode: string;
    milestoneCode: string;
    brandCodes?: string[];
    modelCodes?: string[];
  };
};
```

The non-reserving public supply DTO has exactly `available`, `status` and
`acquisitionRequirements`. Product carries this as its availability projection;
eWaste carries the requirements at offer level in list and detail. Neither
copies requirements from Product attributes, indexed snapshots or browser input.
Missing canonical policy returns `null`, `available:false`, `OUT_OF_STOCK`.
Malformed policy rejects; consumers must never infer REWARDS from unknown.
Known exhausted supply retains its requirements but remains unavailable.
`CERTIFICATES` has no reward payment; `BOTH` needs both inputs. Pricing owns the
displayed price and Checkout recalculates/revalidates before acquisition.
This DTO is guidance, not certificate eligibility, a reservation or authority.
Private priceRef, campaign, batch, counts, limits and tokens are excluded.
Validation bounds inherit `promotion.couponOffers` including later overrides;
there are no customer defaults or new activation/qualification flags.
Regression coverage composes the actual admission, offer/allocation, Product
and marketplace services over isolated persistence/owner boundaries; it does
not establish live, database, provider or end-to-end acceptance.

## Lifecycle Timestamp Ownership

`commitLifecycleCoupon` excludes only framework-managed `updated` from its
domain patch and expected readback. The generated preUpdate timestamp interceptor
still owns the persisted timestamp. All other existing domain/identity readback,
revision/status/tenant/merchant CAS, explicit `$unset` checks and independent
secure issuance verification remain mandatory.

Plain forward updates previously passed because the generated mutation and
expected patch were the same object: the interceptor updated both through that
alias. Release constructs a separate `$set`/`$unset` mutation. The interceptor
adds a fresh root `updated`, which the Mongo adapter merges into `$set`, while
the separate expected patch retained the old timestamp. Readback then rejected
an otherwise matching release and the enclosing owner transaction rolled back.
Do not disable readback or transaction protection to accommodate this metadata.

`test/couponLifecycleGeneratedTimestamp.test.js` composes actual generated update
steps, seller/secure write guards, the inherited timestamp interceptor and Mongo
update adapter over isolated in-memory storage. It covers both mutation shapes,
domain/identity drift, unapplied unsets, zero-match CAS and secure material drift.
It does not certify native transaction rollback, installed validators/indexes,
signed authorization or runtime adoption. Keep uncertain commands held until
reviewed source adoption and separately authorized exact-key recovery; neither
this fix nor absent records establishes historical payment no-effects proof.

## Private Acquisition Issuance Inspection

`DefaultCouponSecureIssuanceService.assertAcquisitionIssuance(request, scope,
observedCoupon, frozenCampaign)` accepts the original capture-protected Digital
source callback and already admitted tenant/merchant placement. It privately
reads exactly the coupon and its original batch through the secure read owner.
The generic lifecycle snapshot must match in full after applying the same secure
field projection. Original issuance command tenant/issuer/vendor/promotion/batch,
unit count and unique matching membership, retained token hash and ciphertext
fingerprint must agree. Existing stock-scope validation preserves delegated seller
proof. Both rows are reread unchanged before returning true. Missing/foreign or
changed evidence rejects; no token decryption, writes or secret output occurs.
Digital invokes this before reserve/consume/release proof and at final readback.
Generic reads and exports continue stripping all private issuance fields.
The composed regression is Digital Core’s `digitalCouponSourceIssuanceProjection.test.js`.

## Quantity-independent lifecycle acceptance

The Promotion couponOfferLifecycle runner accepts any positive LIMITED quantity
and an optional positive integer ownerLimit. Reviewed expected terms must still
match the canonical offer exactly. It reads initial canonical availability, then
uses at most the existing first/second reviewed owners, skipping the second when
stock is exhausted. Every successful single-code purchase, including the separate
withdrawal-offer purchase, must change remaining by -1, completed by +1 and leave
reserved unchanged. Nonzero initial counters are retained as the baseline. On every read, remaining +
reserved + completed must not exceed the exact reviewed offer supply; a smaller
issued pool is valid. Initial limited-offer availability must permit a purchase,
so an empty fixture cannot pass without exercising a sale.

Only observed available:false with remaining:0 permits the SUPPLY_EXHAUSTED
probe. Otherwise sharedSupply.exhaustion is NOT_EXERCISED. The first-owner repeat
probe requires actual fixture ownerLimit:1 and remaining stock; confirmed refusal
sets lifetimeOwnerAllowance to ENFORCED. Other positive limits, or a limit-one
fixture already out of stock, report NOT_EXERCISED; absent limits report
NOT_APPLICABLE. Refusal probes must leave availability counters unchanged.
The result retains the initial counters and exact purchased code list. PASSED
means executed assertions passed, never full exhaustion/cap coverage.

No stock depletion loop, bulk owners, new flags/defaults, grants, runtime imports
or business-policy changes are introduced. The ordinary two-unit scenario still
exercises both refusals; one-unit stock exercises exhaustion without pretending
to isolate an owner cap; 100-unit stock exercises deltas without draining stock.
The separate participation withdrawal and retained-rights checks remain mandatory.

## Ordinary owner-cap refusal before writes

After exact reservation replay handling, allocation reads the canonical owner
allowance inside the existing transaction before participation or counter writes.
A valid allowance already at its configured lifetime limit returns registered
`ERR_PROMOTION_COUPON_OWNER_LIMIT` (409). Corrupt counters remain unconfirmed.
The original error/request pair privately qualifies only this unit as pre-write;
public codes, copied requests and copied errors cannot supply that proof. Any
attempt reaching the write phase permanently disables clean classification for
that invocation, including later transaction retries. Existing atomic counter
checks and revision guards remain authoritative for races. No rollback guarantee
is inferred from a rejected transaction. Digital consumes the proof once and
retains earlier reservations for normal compensation. This is no new allowance,
refund, transfer or expiry restoration path.

## ITEM purchase rights versus fulfillment

Catalogue availability, reservation and purchased-rights capture validate exact
ITEM actions through DefaultPromotionItemBenefitService.assertTerms. Purchasing
a coupon does not require a goods-delivery provider, verified receipt or simulator.
Malformed/mixed item terms remain refused; source publication, consent, supply,
ownership and consideration checks remain unchanged.

Integrated merchant redemption independently requires assertPolicy and validate
from the ITEM owner, including qualified delivery or explicitly admitted simulation
evidence. The existing separately admitted MERCHANT_SCREEN staff-recording path
uses terms only and records external merchant use; it does not claim authenticated
goods fulfillment. No integration selection, simulation enablement or provider
qualification follows from catalogue availability or a completed purchase.


## Business report selection

Coupon workspace `reportChannels` projects validated
`promotion.acquisitionReporting.channelOptions`, whose framework default is an
empty list. Deployments supply only actual channel selections (code/name); names
are presentation, never a grant or report-data source. Duplicate or malformed
choices fail validation. Business campaign safe search advertises the public name
field as well as code while retaining signed tenant/Enterprise predicates. Axis
uses the admitted Staged source for offer-name selection and the operational owner
for report data. Localized watermark display retains the original UTC timestamp
and exported aggregate; privacy suppression and billing boundaries are unchanged.

### Search Membership Browsing Scope

`couponIssuerMemberships` preserves the original signed caller and request
snapshot, while resolving the selected public Store through activated and retained
Product evidence independently of the browsing Enterprise selector. Its private
operational read uses only the Enterprise on that canonical projection. A caller's
session Enterprise is not a claim to own the Store catalogue. The existing direct
availability, Cart, tenant, service-principal refusal and private read-purpose
checks are unchanged. No grant, consent, quantity or financial authority is inferred.
