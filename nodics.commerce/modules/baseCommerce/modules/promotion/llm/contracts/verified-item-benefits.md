# Verified Item Benefits

## Ownership And Maturity

Promotion owns the purchased promise. Digital Core owns the existing merchant
validation, durable confirmation instruction, receipt and redemption coordination.
The selected delivery provider owns the independently verified delivery truth.
This source contract does not qualify an installed delivery provider, publish a
campaign, create menu Products or authorize stock. Defaults remain disabled and
unqualified; `merchantBenefits.itemEvidenceService` is `null`.

Use the existing layered `promotion.merchantBenefits` selection. `enabled` and
`qualified` must both be true for default `itemEvidenceMode: VERIFIED`, and
`itemEvidenceService` must name a loader-visible
owner with `evaluate`. Selecting a name is not evidence that its implementation or
deployed receipt source has been qualified. No alternative importer, fulfillment
registry, financial ledger or staff-owned delivery store is introduced.

An explicitly selected `LOCAL_SIMULATION` path is described below. It is not
verified delivery and does not set or inherit real-delivery qualification.

## Exact Purchased Promise

An ITEM action permits only `benefitType`, optional `benefitDescription`, `items`,
optional `reasonCode` and optional `exclusionGroup`. `benefitType` is exactly
`ITEM`. `items` contains one to twenty distinct bounded SKU identifiers, each with
integer `quantity` from one to one hundred and `unit: EACH`. Retained campaign
conditions must include a nonempty bounded unique `storeCodes` list.

```json
{
  "actions": {
    "benefitType": "ITEM",
    "benefitDescription": "Tea and two cookies",
    "items": [
      { "sku": "MENU_TEA", "quantity": 1, "unit": "EACH" },
      { "sku": "MENU_COOKIE", "quantity": 2, "unit": "EACH" }
    ]
  },
  "conditions": { "storeCodes": ["approvedOutlet"] }
}
```

Descriptions establish no SKU, monetary value or substitute. This version does
not support choice sets, substitutions, weighted items or a mixed monetary/item
action. Such declarations fail before purchase admission. Canonical Product/menu
definitions and the policy approval belong to the selected business owner, not
to this example. An item issuance cap is not a monetary campaign budget.

## Independent Receipt Contract

The adapter receives detached tenant, signed merchant enterprise, issuer,
original buyer, coupon, source Product, campaign/revision, outlet, redemption
target, original `merchantReceiptReference` and the canonical sorted item list.
It must independently read its secured authoritative receipt, not echo the
request or accept browser receipt JSON. Reads must enforce provenance, exact
scope, completeness, immutability and original coupon/target allocation.

| Evidence | Required contract |
| --- | --- |
| Qualification | `eligible`, `verified`, `immutable` exactly true |
| Outcome | `status: DELIVERED`, not reserved, packed or staff-confirmed |
| Kind | `sourceType: ITEM_DELIVERY`, `sourceStage: FULFILLED_ITEMS` |
| Identity | All tenant/enterprise/issuer/buyer/coupon/Product/campaign/revision/outlet/target fields exactly match |
| Original reference | `sourceReference` equals the original bounded receipt handle |
| Content integrity | Lowercase SHA-256 `sourceHash`, nonnegative integer `sourceRevision` |
| Outlet integrity | Positive integer `storeRevision` |
| Delivery time | Parseable nonfuture `deliveredAt`, not before the coupon's persisted original `soldAt` |
| Complete promise | Exact SKU, quantity and unit equality after canonical ordering; no missing or additional item |

The adapter must reject a receipt reused for another coupon, customer or target,
revoked or returned delivery, partial/oversized read and failed envelopes. It must
retain the original source hash/time across same-command retries. A `verified`
boolean without that owner behavior is not independent verification.

## Coordinated Merchant Flow

```mermaid
sequenceDiagram
  participant Staff as Authorized outlet employee
  participant Digital as Digital Core
  participant Promotion
  participant Delivery as Qualified delivery evidence owner
  Staff->>Digital: Validate token, outlet and original receipt handle
  Digital->>Promotion: Resolve purchased coupon and retained promise
  Promotion->>Delivery: Read exact independently verified delivered items
  Delivery-->>Promotion: Immutable scoped receipt and complete items
  Promotion-->>Digital: Bound item benefit
  Digital-->>Staff: Expiring validation bound to receipt hash
  Staff->>Digital: Confirm original validation and command
  Digital->>Digital: Persist original instruction and claim target
  Digital->>Promotion: Revalidate same original delivery evidence
  Promotion->>Delivery: Fresh read; changed evidence is refused
  Digital->>Digital: Persist exact merchant receipt
  Digital->>Promotion: Redeem through original customer entitlement
```

The default merchant-screen adapter dispatches an ITEM benefit to
`DefaultDigitalCommerceItemMerchantProviderService`, which reuses fresh Profile
and Store authority through `pricedAuthority`. Despite that historical helper
name, ITEM evidence does not become priced Cart evidence. The receipt remains
bound through the existing `pricedBenefit`/`pricedBinding` fields to avoid a
second receipt engine. No `discountAmount` is fabricated.

ITEM confirmation must pass the exact object returned by `pricedAuthority` to
`Merchant.validateCoupon`. That dispatcher retains Promotion's private issuer
staff admission for vendor-owned stock; a copied request or direct Operation
call loses the handoff. Same-enterprise confirmation keeps the ordinary exact
Promotion validation path. Missing or changed delivery evidence propagates as a
failure, with no direct-read, monetary or staff-attestation fallback. This routing
contract does not qualify the selected delivery source.

When both item and native priced adapters are selected, handle grammar is checked
by the selected benefit owner after coupon resolution. Monetary `PRICED_CART`
still requires the native `CART:` grammar in Pricing and Digital Core binding;
an item receipt cannot enter the monetary provider. Staff `confirmed: true`
acknowledges the command only; it never proves delivery.

Existing exact receipt replay and redemption recovery remain authoritative.
Missing owners, changed hash/revision/items/outlet, failed read, expired validation
or lost staff scope refuse confirmation. A preexisting sold ITEM coupon without
this qualified evidence does not gain monetary rights or automatic delivery.

## Validation And Deployment

### Explicit Local Simulation

The separate Fulfillment [simulator admission](../../../../../fulfillment/modules/fulfillmentCore/llm/contracts/verified-item-delivery.md#explicit-local-simulation)
requires canonical LOCAL deployment classification, the exact selected environment
allowlist, enabled simulator and matching Promotion mode/service. Promotion's
`simulationSelected()` calls that real owner; a mode string or browser flag alone
cannot admit it. `qualified` remains false for real delivery. `enabled` must still
be true, with the same exact approved action, Store and purchased bundle checks.

The merchant owner supplies observed positive `storeRevision`. The simulator
requires a `SIM:` receipt reference and returns exact context and bundle with
`simulated: true`, `verified: false`, `immutable: false`, `status: SIMULATED`,
`sourceType: ITEM_SIMULATION`, `sourceStage: SIMULATED_ITEMS`, hash, revision and
no deliveredAt. Promotion validates every identity, reference and quantity and
rechecks selection after awaiting the evaluator. VERIFIED mode rejects this
shape even when its qualification flag is true. Simulation rejects promoted
verified/immutable flags, a DELIVERED status or FULFILLED_ITEMS stage.

The bound benefit preserves `benefitType: ITEM`, exact items, source integrity,
Store/revision, simulated/unverified tags and ITEM_SIMULATION source type. It has
no `discountAmount`, price, currency or delivery timestamp. Digital Core freshly
revalidates the same binding through its existing provider; persisted receipt,
claim/redemption and replay remain the existing owner flow, not physical delivery.
Original staff identity, private issuer admission, consent and Store permissions
are unchanged. Simulation is not an installed-persistence qualification shortcut.

`promotionItemSimulationContract.test.js` exercises the actual simulator and
consumer, including malformed/missing proof, promotion into real-delivery fields,
wrong Store revision and selection revocation. The actual MerchantScope fixture
also exercises validation, claim, receipt, redemption, replay, queue and original
receipt inspection with isolated persistence and original issuer identity. The
29 approved demo bundle declarations are tested unchanged by the owning project.
These tests do not issue stock, publish campaigns or prove native/browser success.

Already-redeemed benefit inverses remain disabled under the approved local-demo
scope; see [coupon-bound issuer budget](coupon-bound-issuer-budget.md#supported-scope-used-benefit-reversals-disabled).
Unused purchase refunds and original-sale asset refunds retain their independent
owner policies. No simulation step enables budget RELEASE or a used-coupon refund.

### Verified Delivery Acceptance

`promotionItemBenefitContract.test.js` covers exact bundles, all required receipt
fields, mixed actions, missing owners, unqualified selection, substitutions,
partial delivery, wrong scope and changed receipt before confirmation. Existing
unsupported-item and monetary-provider suites retain their refusal paths.
Digital Core's `digitalCommerceItemMerchantContract.test.js` exercises its actual
provider and validation dispatcher with private identity-bound Promotion ports,
covering issuer handoff, same-enterprise routing, changed receipt fields and owner
failure without fallback.
These isolated evidence ports do not prove deployed delivery, installed receipt
indexes, cross-worker races, authorized publication or browser acceptance.

Before selecting this path in a deployment, qualify the actual provider against
those cases, including original receipt allocation and concurrent retries, then
use the existing exact publication and operational setup owners. Never set a
flag merely to make an unavailable fulfillment source report ready.
