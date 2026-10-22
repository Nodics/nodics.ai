# Persisted Digital Ownership Contract

## Purpose And Maturity

A digital ownership purchase changes who owns an existing domain asset. Think
of buying a named certificate: payment and the certificate's ownership register
must agree, but buying the certificate does not move the physical object it
describes. For example, one published Product/SKU may represent one listed Waste
asset. Checkout captures Loyalty points; the domain credits the original seller
and Waste records the original buyer's digital ownership.

This contract describes the retained one-asset DigitalCore interface and its
original evidence, not permission for a new eWaste sale. The historical shape is
one asset, quantity one, in a one-entry Order paid through the original
`LOYALTY_REWARD` capture. New Circa/eWaste sales use
[common bundle settlement](bundle-settlement.md) and are final sales with no
return/refund path. The retired one-asset eWaste adapter reports unavailable,
refuses new reserve and incomplete confirm, and permits only exact completed
evidence readback and bounded original incomplete-purchase recovery. Historical
policy snapshots cannot re-enable it. Neither source integration nor this
contract proves installed/live qualification or creates policy, owners or
published Products.

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
| eWaste | Secured retained-evidence checks, bounded incomplete-purchase recovery and delegation to common bundle owners | No retired marketplace purchase, seller-credit writer or completed-sale reversal. |
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

The selected pin must match its original retained projection exactly, and its
localized `assetCode` must match the binding. Customer discovery may supply a
newer governed Product publication, such as a media correction, without
rewriting that historical pin. Availability validates the original pinned row
and independently requires the current projection to preserve the same asset,
variant, SKU, delivery type and inventory identity. A missing or changed
historical row, or a successor that changes those ownership identities, refuses.
See the eWaste contract for reverse binding, Store reference normalization and
required policy identities.

An exact zero-row binding read means the published listing is not yet saleable.
Availability returns bounded unavailable evidence with
`DIGITAL_OWNERSHIP_BINDING_UNAVAILABLE` and does not call Waste. More than one
binding, or any malformed/stale retained binding, remains an owner-evidence error.
This distinction permits safe catalogue browsing before binding admission without
inventing inventory or weakening checkout's exact reservation requirement.

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
headers. The retained eWaste route is `/internal/digital-sales/:phase`.
`availability` reports `COMMON_COMMERCE_BUNDLE_REQUIRED`; new `reserve` and
incomplete `confirm` refuse. Completed `confirm`/`deliver` check exact original
evidence without new settlement or transfer. `cancel` and `compensation-resolve`
remain bounded original-purchase recovery, with `evidence` supplying protected
owner readback. `refund-preview` returns final-sale ineligibility and all
`refund-prepare/refund-settle/refund-complete` mutation phases refuse. They are
not executable reversal endpoints. No automatic mutation retry is implied.

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
one-millisecond drift refuse in ownership readback and historical evidence checks.

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
nonrefundable `BLOCKED`. These generic review labels do not grant a Circa/eWaste
completed-sale refund. Common Commerce retains separately governed coupon,
physical-order and original-payment recovery contracts; their eligibility and
evidence do not transfer to completed ownership sales. Onward ownership prevents
original delivery replay and grants no reversal authority. Physical custody, shipping, collection,
physical inventory return, carbon issuance/transfer, split payments, mixed
monetary allocation and external item fulfillment are not established here.

## Completed Sales And Historical Refund Evidence

Completed Circa/eWaste certificate and bundle purchases cannot be refunded or
returned. Digital's bundle refund preview returns
`eligible:false/reason:COMPLETED_BUNDLE_FINAL_SALE`; mutation phases throw.
The retained eWaste dispatcher likewise returns ineligible at `refund-preview`
and refuses `refund-prepare`, `refund-settle` and `refund-complete`. Old private
service selectors, staff approval, a generic Order refund plan or a historical
policy flag cannot activate the removed domain bridge. Do not restore a
compatibility mutation or add a replacement eWaste accounting path.

Supported common Commerce recovery is distinct from a completed-sale reversal:

| Situation | Current owner behavior |
| --- | --- |
| Unstarted acquisition with confirmed original compensation evidence | Checkout may release only the original confirmed reservation through the existing owner port; uncertain acquisition remains recovery-required. |
| Persisted bundle Order, capture or component transfer | Resume original Checkout forward recovery with retained terms and exact owner evidence. Do not reprice, rebuild a Cart, refund a completed sale or create another debit. |
| Retained one-asset reservation with original failed-purchase Payment compensation | Use only the bounded eWaste cancellation/refunded-reservation cleanup contract and original keys. This does not reverse a completed sale or execute another financial operation. |
| Completed Circa/eWaste ownership sale | Final-sale refusal, regardless of old refund terms or later ownership. |
| Independently eligible coupon or physical Commerce order | Its existing Order/Payment/domain policy governs; this contract neither removes those supported contracts nor extends them to final ownership sales. |

Historical records may retain `metadata.digitalOwnership.refund` with
`ORIGINAL_TRANSFER_REVERSAL_ONLY_BEFORE_ONWARD_TRANSFER`, original policy pins,
refund codes, PREPARE/SETTLE/PAYMENT checkpoints, captures, seller earnings and
reversal references. Preserve them unchanged for provenance and owner-led
reconciliation. They are not current executable instructions, cannot be
backfilled to manufacture eligibility, and do not authorize releasing uncertain
locks or altering balances. The generic Digital dispatcher retaining historical
validation logic does not establish an available eWaste reversal implementation.

See [eWaste finality and original recovery](../../../../../../../nodics.accelerators/modules/waste/modules/eWaste/llm/contracts/digital-ownership-sale.md#completed-purchases-are-final)
and [common bundle forward recovery](bundle-settlement.md). Both preserve original
commands and qualified owner evidence. Source tests establish refusal, retained
evidence and isolated recovery behavior only; installed private transports,
Profile admission, database atomicity and provider settlement remain separate
acceptance gates.

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
final-sale refund refusal, retained original-purchase recovery and later-layer
availability narrowing. Historical reversal fixtures are not current bridge
qualification. It does not prove installed
database/provider atomicity, service grants, publication, live settlement or
automatic recovery workers. See the eWaste contract for complete test ownership
and installed/publication acceptance gates.
