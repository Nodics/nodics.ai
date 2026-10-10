# Persisted Digital Ownership Contract

## Purpose And Maturity

A digital ownership purchase changes who owns an existing domain asset. Think
of buying a named certificate: payment and the certificate's ownership register
must agree, but buying the certificate does not move the physical object it
describes. For example, one published Product/SKU may represent one listed Waste
asset. Checkout captures Loyalty points; the domain credits the original seller
and Waste records the original buyer's digital ownership.

This is an implemented, disabled-by-default source integration, not installed or
live qualification. It supports one asset, quantity one, in a one-entry Order,
paid entirely through the original `LOYALTY_REWARD` capture. Domain policy must
explicitly permit the supported settlement. It does not approve a business
proposal, create policy data, install owners or publish Products.

This contract owns the DigitalCore/Checkout interface. The optional
[eWaste owner contract](../../../../../../../nodics.accelerators/modules/waste/modules/eWaste/llm/contracts/digital-ownership-sale.md)
owns exact Waste binding, domain policy, Loyalty settlement and cancellation
proof. These links are documentation references, not a new runtime dependency.

## Authority Map

| Owner | Responsibility | Prohibited substitution |
| --- | --- | --- |
| Product and Store | Retained published Product/SKU/locale and merchant Store | Caller or search-index payload is not retained Product authority. |
| Checkout and Payment | Original Cart scope, Order, authorization and captured payment | A reservation, matching amount or browser flag is not captured-payment proof. |
| DigitalCore | Classification, binding contract, digital entitlement and delivery evidence | No asset transfer store, wallet settlement or physical stock fallback. |
| Waste | Persisted asset lock, ownership event, revisions and current owner | No local DigitalCore transfer shadow or direct database update. |
| eWaste | Secured domain orchestration and exact supported settlement policy | Do not call its legacy marketplace purchase to charge the buyer again. |
| Loyalty | Original buyer capture and idempotent seller earning ledger | No invented ledger reference or compensation success. |
| Profile | Canonical customer identity, including login-to-code resolution | A login string is not automatically the customer record code. |

## Exact Classification And Availability

Ownership dispatch requires all three retained Product attributes:

| Field | Required value |
| --- | --- |
| `productType` | `DIGITAL` |
| `digitalDeliveryType` | `DIGITAL_OWNERSHIP` |
| `inventoryStrategy` | `DIGITAL_COMMERCE` |

Never use generic `saleMode` to classify these units. Historical coupon Products
can carry `saleMode: DIGITAL_OWNERSHIP` while their actual delivery is
`COUPON_CODE` with `COUPON_CODE_POOL`. The coupon path remains Promotion-owned.
Contradictory digital metadata and missing digital owners refuse before physical
Inventory effects. Physical products retain their existing Inventory path.

`availability(request)` resolves one retained Product through the existing pinned
Product reader. `availabilityFromProjection(request, projection)` accepts only
the internal already-pinned retained record, not arbitrary API input. Both check
tenant, enterprise, Store, locale, Product and SKU. `CURRENT` and `STALE` retained
record compatibility is not permission to bypass Product's active publication
pointer or expose arbitrary historical records through customer discovery.

The ownership adapter requires one exact retained variant/SKU and quantity one.
It reads one ACTIVE `digitalProductBinding` with `providerOwner: wasteCore`,
the exact three classification fields, revision, canonical provider reference
and locale-specific retained Product pins. One binding can contain multiple
locale pins; translations do not create multiple asset supplies. Pins are a
unique-locale array of 1..20 entries:

```text
evidence.retainedProducts[] = { locale, code, sourceHash, publicationVersion }
```

The selected pin must match the retained projection exactly, and its localized
`assetCode` must match the binding. See the eWaste contract for reverse binding,
Store reference normalization and required policy identities.

Availability is non-reserving. Its response includes `available`,
`status: AVAILABLE | UNAVAILABLE`, `guaranteed: false`,
`reservableAt: CHECKOUT_BEFORE_PAYMENT`, the exact three classification fields,
and private `assetCode`, `bindingCode`, `sku`, `variantCode`, `locale`.
Public Product enrichment must keep its existing safe DTO allowlist; these
private binding fields are not a new public asset-record API.

Only `DefaultDigitalCommerceOwnershipService.availability` treats an unselected
integration as expected unavailable supply. When `enabled !== true` or
`qualified !== true`, it returns `available:false`, `status:UNAVAILABLE`,
`guaranteed:false`, `reservableAt:CHECKOUT_BEFORE_PAYMENT` and the canonical three
classification fields before any binding or HTTP read. Its bounded `reasonCode`
is `DIGITAL_OWNERSHIP_NOT_SELECTED` when enabled is not exactly true, otherwise
`DIGITAL_OWNERSHIP_NOT_QUALIFIED`, from `DigitalOwnershipAvailabilityReason`.
It includes no asset, binding, SKU or retained pin evidence. Product reduces this
to its existing `available:false/status:OUT_OF_STOCK` summary for that item;
coupon and physical Products keep their independent owners and remain visible.

With both flags exactly true, `settings()` and all existing retained binding,
authorization, transport and owner-response checks still run and throw on failure.
Malformed selected configuration, corrupt bindings or owner faults never become
expected unavailable supply. `settings`, reserve, Checkout and writes retain
their strict admission; this read result grants no allocation or mutation right.
No configuration or qualification flag is changed. Focused DigitalCore metadata,
Product mixed-discovery/PDP and eWaste bridge regressions cover this distinction;
they establish source behavior, not native or installed acceptance.

## Checkout Interface

The existing methods on `DefaultDigitalCommerceCheckoutService` remain the
integration points. No new Checkout or Payment mutation endpoint is introduced.

| Method | Input and authoritative context | Result |
| --- | --- | --- |
| `reserveForCheckout(request, calculation)` | Trusted tenant/enterprise/buyer; original root key; `payload.orderCode`; persisted Cart `storeCode` and nonempty `locale`; calculated entry `code/productCode/sku/quantity:1` and exact classification | Persisted `RESERVED` ownership units, or original acquisition recovery evidence. |
| `confirmSale(request, order, reservations)` | Original units and persisted Order identity after capture | `SOLD` only after domain proof and exact entitlement readback. |
| `deliver(request, order, sales)` | Original sale units, including saved locale and root key | `DELIVERED` only after fresh owner proof and exact delivery readback. |
| `releaseReservations(request, reservations)` | Original persisted reservation identity | Per-unit release result; uncertainty remains `FAILED`, never optimistic success. |

Reserve uses only the authoritative request `storeCode` and `r.locale` supplied
by Checkout from its owned Cart. It ignores entry-level locale and body-selected
Store/locale. It re-resolves Product/binding, ignoring calculation-carried owner
selectors. A subsequent availability read may report unavailable because this
same command already holds the lock; only the persisted owner distinguishes
that replay from a competing buyer.

The root key and per-unit key are distinct and retained:

```text
checkoutIdempotencyKey = original Checkout request.idempotencyKey
idempotencyKey = <root>:digital:<original-entry-code>:0
```

Confirmation, delivery and release use the original unit's locale and root key.
Missing saved values refuse; later caller values cannot reconstruct them.
Cart's original entry code can contain pipe delimiters and is not replaced by
the generated OrderEntry code `<orderCode>:<entryCode>`.

### Configured Owner Wire Contract

DigitalCore invokes its server-configured owner with one POST, `maxAttempts: 1`,
15-second timeout, trusted tenant context and enterprise/correlation/idempotency
headers. The eWaste route is `/internal/digital-sales/:phase`; phases are
`availability`, `reserve`, `confirm`, `deliver`, `cancel`, and the original-sale
`refund-preview/refund-prepare/refund-settle/refund-complete` phases below. No automatic mutation
retry is implied by module invocation.

| Request field | Meaning |
| --- | --- |
| `bindingCode/productCode/sku/storeCode/locale` | Availability selectors; reserve re-resolves them from canonical owners. |
| `ownerId/orderCode/entryCode` | Added for reserve and retained for later phases. `ownerId` is Checkout's buyer identity. |
| `checkoutIdempotencyKey/idempotencyKey` | Original root and original per-unit command keys. |
| `code` | Original Waste ownership-event code, required for confirm/deliver/cancel. |

Tenant, actor and provider target come from trusted transport and configured
service authority. The exact business enterprise is carried separately in the
body; it is admitted only by the domain's approved deployment grant, never by
rewriting the signed runtime enterprise or a business enterprise header. Module
transport supplies its retained service credential, not the customer/staff token.
The owner independently checks these authorities. Availability returns
`{status: OWNER_CHECKED, available: boolean, assetCode}`; it does not reserve.

### Ownership Unit Response

| Fields | Required interpretation |
| --- | --- |
| `code/status/providerOwner/digitalDeliveryType` | Original Waste event; `RESERVED`, `SOLD`, `DELIVERED`, `CANCELLED` or `EXPIRED`; typed `wasteCore`/`DIGITAL_OWNERSHIP`. |
| `tenant/enterpriseCode/ownerId/soldTo/orderCode/entryCode` | Original scoped purchase identity. |
| `productCode/sku/storeCode/locale/bindingCode/assetCode` | Original retained Product-to-asset binding. |
| `idempotencyKey/checkoutIdempotencyKey/expiresAt` | Original immutable command keys and original reservation deadline. |
| `soldAt/deliveredAt` | Original persisted ownership timestamp; delivery time equals sale time, not local record creation time. |
| `evidence.transferCode/buyerRef/sellerRef` | Original Waste event and canonical Profile references. |
| `evidence.capture` | Original Payment entry, authorization entry, merchant enterprise, root key, Loyalty reservation and buyer-debit ledger; amount/currency. |
| `evidence.settlement` | Original seller earning reference and empty carbon references for this supported path. |
| `evidence.physicalCustodyTransferred` | Exactly `false`; digital delivery cannot certify physical movement. |

Pending phases do not invent sale/delivery times or completed settlement evidence.
Failed envelopes, missing endpoints, malformed responses and scope/binding drift
are unavailable/recovery outcomes, not successful delivery.

## Persisted Digital Evidence

After Waste confirms the sale, DigitalCore records through the existing generated
`digitalEntitlement` and `digitalDelivery` services. There is no parallel transfer
state store. Entitlement identity derives from original purchase/provider identity;
delivery code is `digitalDelivery:<Waste-event-code>`.

The shared save helper deliberately permits lifecycle state on ordinary replays.
Ownership therefore performs an additional fresh exact readback for both records:
one active record, exact expected status (`ACTIVE` entitlement, `DELIVERED`
delivery), purchase/provider identities, SKU and delivery type where applicable,
original dates and complete capture/settlement/asset/binding/transfer evidence.
Framework timestamps, revision and correlation changes do not replace original
financial or ownership evidence. A same-code foreign, partial, inactive or
nonterminal record cannot qualify. Delivery-save acknowledgement alone is not
accepted. Failure after financial commitment requires original-command recovery,
not another charge or invented delivery.
Native Date values use exact `getTime()` milliseconds when compared with original
ISO transport timestamps; never pass Date objects through `Date.parse`, which
loses milliseconds during coercion. Invalid dates, non-date values and exact
one-millisecond drift refuse in ownership readback and refund admission.

## Compensation And Unsupported Outcomes

Acquisition errors retain `error.digitalReservations`,
`digitalReservationRecoveryRequired: true` and
`digitalReservationUncertainKey`. An empty confirmed list does not prove the
attempted unit was never locked. Release returns
`{type: DIGITAL_OWNERSHIP_RELEASE, code, status: COMPLETED}` only after owner
cancellation proof; otherwise status is `FAILED` with
`DIGITAL_OWNERSHIP_RECOVERY_REQUIRED`.

Expiry alone never releases ownership. Checkout compensation must retain its
durable checkpoint and original payment reversal evidence; a first release
attempt before confirmed VOID can correctly fail. After proof exists, recovery
may repeat the original release. Captured or uncertain seller settlement remains
locked for domain/manual recovery. The exact proof matrix and sequence are in
the eWaste contract; do not substitute a boolean cancellation flag.

Generic entitlement REFUND remains nonrefundable `MANUAL_REVIEW`; RETURN remains
nonrefundable `BLOCKED`. The narrow reviewed original-sale path below does not
inherit unused-coupon refund policy. Onward ownership prevents delivery replay
and original-sale reversal. Physical custody, shipping, collection,
physical inventory return, carbon issuance/transfer, split payments, mixed
monetary allocation and external item fulfillment are not established here.

## Original Sale Refund

`DefaultDigitalCommerceRefundService` dispatches only a complete one-entry,
quantity-one `wasteCore/DIGITAL_OWNERSHIP` purchase to the existing ownership
adapter. Mixed, extra, empty, foreign or duplicate units refuse; coupon dispatch
and Promotion revocation remain separate. Every phase reloads exact entitlement
scope, Product/SKU and original OrderEntry identity. The original event, asset,
capture, seller and settlement remain immutable evidence, not API overrides.

| Order phase | Digital responsibility | Domain responsibility |
| --- | --- | --- |
| Preview | Reuse fresh Order `paymentAuthority(..., false)` and exact full purchase units. | Read original sale/capture/earning, exact current retained policies, active original entitlement and latest buyer-held asset. Return typed `DIGITAL_OWNERSHIP` plan with sale/asset/refund/entitlement identities. |
| PREPARE | Revalidate signed staff approval with `paymentAuthority(..., PREFLIGHT)` and persisted `digitalCore` ownership plan; lock entitlement REFUND_PENDING with original refund code. | Independently reread Order approval and lock; CAS original asset LOCKED and retain a linked reversal command/event before financial effects. |
| SETTLE | Revalidate original approval/entitlement lock; no buyer debit or local wallet write. | Require durable Order PREPARE, reverse only original seller EARN through Loyalty and verify fresh exact original-entry ledger; retain that reference under the reversal. |
| PAYMENT | Existing Order/Payment owners perform the full original-capture refund after successful PREPARE/SETTLE. | No substitute eWaste buyer refund operation. |
| COMPLETE | Revalidate `paymentAuthority(..., true)`; only after domain completion mark entitlement REVOKED and retain exact Digital reversal evidence. | Require Order SETTLE/PAYMENT checkpoints plus original PaymentTransaction/Loyalty readback, restore original seller's digital ownership, complete linked event and clear only original lock. |

The existing owner transport carries only original sale code, entitlement code,
Order/buyer selectors, canonical refund code and the same refund idempotency key.
No staff bearer impersonation, financial selector, refund flag or extra debit is
forwarded. A service token alone cannot authorize an unapproved refund. Local
Order still refreshes signed staff scope on each attempt; eWaste independently
verifies persisted approved business authority through protected owning reads.

The explicit active transfer-policy term must already be retained in the original
sale command: `metadata.digitalOwnership.refund` equals
`ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER`. No flag or imported
proposal supplies this term automatically, and old sale snapshots are never
backfilled. The current transfer/reward/carbon policies must exactly match those
original pins. Only original seller proceeds, no fee/no carbon, one original
Loyalty capture are supported. Missing term, changed policies or spent proceeds
requires review/recovery rather than assumed eligibility or another financial key.
The [eWaste refund contract](../../../../../../../nodics.accelerators/modules/waste/modules/eWaste/llm/contracts/digital-ownership-sale.md#original-sale-refund)
owns the full reference and recovery matrix.

Source tests exercise real Order approval/lifecycle and Payment dispatch, Digital,
eWaste, Waste and Loyalty reversal owners through isolated persistence/transport
and a staff-admission double. Lost seller acknowledgements/postings, concurrent
retries, interrupted ownership/event cleanup and Digital writes keep original
references and recover without repeating balances. They do not prove installed
private transports, Profile admission, database atomicity or approved deployment
policy. No native mutation, automatic recovery worker or physical return is added.

## Admission, Extension And Verification

`digitalCore.digitalOwnership` defaults to `enabled:false`, `qualified:false`,
with null `owner.moduleName/connectionName/targetAuthority/apiPrefix`. Those
fields are integration admission controls, not evidence of provider or native
qualification. Effective service registration, secured routes, installed CAS and
unique identity, exact approved policies, retained binding and publication must
be qualified separately. Do not enable generic reads or synthesize grants to
make an unavailable owner appear installed.

Partners customize their project-owned layers through ordinary module/config
inheritance and approved bindings/policies, not copies of these services.
Smallest safe customization is a later-loaded availability override that calls
the inherited owner checks and narrows availability; it must not select a new
asset, replace retained scope or supply settlement success. Source tests exercise
this override. Supporting another settlement/custody mode needs an owning domain
contract and tests, not a Product flag or Checkout physical fallback.

Business evaluators should distinguish ownership-record delivery from physical
delivery. Business users follow their authorized application journey, not this
service-only endpoint. Administrators own installed transport and policy review;
developers/AI tools preserve the above owner boundaries. There is no new public
UI, notification, asset publishing or documentation import action in this work.

From the framework root, run:

```bash
node --test nodics.accelerators/modules/waste/modules/eWaste/test/eWasteDigitalOwnershipBridge.test.js
node --test nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/*.test.js
node --test nodics.commerce/modules/payment/modules/paymentCore/test/*.test.js
node --test nodics.commerce/modules/checkout/modules/checkoutCore/test/*.test.js
```

The bridge fixture uses actual DigitalCore, eWaste, Waste and Payment transaction
builders with isolated generated persistence, transport and Loyalty doubles.
It covers success/replay, canonical locale/Store/merchant binding, no second debit,
lost acknowledgements, uncertain credit, persisted cleanup recovery, expiry/VOID,
tampered entitlement/delivery evidence, missing owners, onward transfer, unapproved
refund refusal, the scoped original-sale refund and later-layer availability narrowing. It does not prove installed
database/provider atomicity, service grants, publication, live settlement or
automatic recovery workers. See the eWaste contract for complete test ownership
and installed/publication acceptance gates.
