# Coupon Offers And Acquisition

Promotion owns `promotion.couponOffer`, secure coupon units, offer-wide supply,
lifetime purchasing-owner allowance, bilateral redemption participation and
protected acquisition reporting. These are shared Commerce capabilities. Digital
and Checkout retain acquisition orchestration, certificate owner calls, optional
Payment consideration, entitlements, reveal, delivery and staff redemption.

## Governed Offer

Create an offer through the existing draft owner with `couponOffer`, `actions`
and `conditions`. This requires ordinary draft access plus
`commerce.promotion.manage`. Issuer/vendor initially resolve to the signed
Enterprise. Source publication retains the complete `couponOffer`:

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
