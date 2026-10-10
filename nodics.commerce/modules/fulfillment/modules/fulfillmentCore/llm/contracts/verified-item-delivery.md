# Verified ITEM Delivery Boundary

## Implemented Contract

`DefaultFulfillmentItemDeliveryEvidenceService.evaluate(context)` is a
loader-visible, non-mutating boundary for Promotion's existing `itemEvidenceService`
selection. It always rejects with `ERR_FULFILLMENT_ITEM_DELIVERY_UNCONFIRMED`.
Valid selectors produce `AUTHENTICATED_ALLOCATION_RECEIPT_NOT_IMPLEMENTED`;
malformed selectors produce `INVALID_ITEM_DELIVERY_CONTEXT`. `contract()` reports
`available: false`. No successful native delivery proof or receipt issuance is
implemented. No flags, routes, schemas, databases or carrier endpoints are changed.

The exact input is tenant, enterpriseCode, issuerEnterpriseCode, ownerId,
couponCode, productCode, promotionCode, promotionRevision, storeCode, targetCode,
merchantReceiptReference and items. Identities are non-whitespace strings of
1-192 characters; the receipt handle follows Promotion's 1-119 character grammar.
The revision is a nonnegative safe integer. Items contain only sku, quantity and
unit: 1-20 distinct SKUs, SKU codes of 1-128 characters, safe integer quantities
1-100, unit EACH. `context()` returns a detached, deeply frozen, SKU-sorted
projection; it validates syntax, not ownership, qualification or delivery.
There are no tenant/buyer aliases, default identity values, response envelopes,
accessors, inherited fields, arbitrary proof payloads or caller-injected ports.

Read the consumer's canonical [verified ITEM benefits contract](../../../../../baseCommerce/modules/promotion/llm/contracts/verified-item-benefits.md).
Promotion retains purchased rights, issuer identity, original sale time and its
own qualification gates. This adapter cannot grant a benefit, consume a coupon,
activate a campaign, deliver goods, change stock or settle money. Selecting its
service name does not qualify ITEM sale or redemption; keep merchant benefits
disabled/unqualified and do not use availability of `evaluate` as certification.

## Why Existing Sources Cannot Qualify

| Existing boundary | Actual evidence | Why it is insufficient |
| --- | --- | --- |
| Carrier readiness `validateAdapter` | Declarative signature/idempotency/certification requirements | No executable signature verifier or authenticated delivery admission |
| `DefaultCarrierSandboxAdapterService` | Outbound credentialed sandbox request; reference and status response | Explicitly sandbox-only; no verified inbound event or original allocation binding |
| `DefaultCarrierExecutionService` | Idempotent carrier operation interface | No installed authenticated delivery receipt owner or coupon allocation authority |
| Generic tracking and lifecycle methods | Caller tracking payload or status transition | DELIVERED is not a signature, immutable receipt or proof of exact contents |
| Reviewed physical Shipment and return bridge | Protected original warehouse handover and manual return attestations | SHIPPED is not customer delivery; manual staff evidence cannot qualify ITEM |

Outbound credentials and `webhookSignatureValidation: true` declarations are
requirements, not evidence that a specific event was authenticated. Payment's
offline original-capture receipts are explicitly consistency checks, not carrier
authentication; they must not be transplanted as delivery authority. No existing
Fulfillment executable contract safely identifies an authenticated delivery
source and binds it to a protected original ITEM allocation. Consequently the
default evaluator does not read ordinary Shipment or tracking rows and cannot be
convinced by forged `verified`, `immutable`, `eligible`, `liveQualified`, provider
codes, staff permissions, a receipt-shaped JSON object or a caller-provided hash.

## Explicit Local Simulation

`DefaultFulfillmentItemSimulationService` is a separate loader-visible owner for
testing existing orchestration. It never changes the real evaluator's refusal.
Defaults are `fulfillmentCore.itemSimulation.enabled: false` and an empty
`environmentAllowlist`. Promotion defaults to `itemEvidenceMode: VERIFIED`.

Every simulator evaluation requires all of the following, before and after
canonicalizing context:

- nConfig's package-derived `environment.class` is exactly `LOCAL`.
- The canonical selected environment from NODICS is in a bounded, unique explicit
  `fulfillmentCore.itemSimulation.environmentAllowlist`; no name heuristic or
  caller environment value is trusted.
- `fulfillmentCore.itemSimulation.enabled` and Promotion merchant benefits are true.
- Promotion selects exactly `LOCAL_SIMULATION` and
  `DefaultFulfillmentItemSimulationService`.

Simulation uses the real boundary's detached/frozen context grammar plus the
positive safe integer Store revision observed by the merchant owner. References
must start `SIM:` and contain 1-115 permitted suffix characters. The result has
exact original identities and bundle, `eligible: true`, `simulated: true`,
`verified: false`, `immutable: false`, `status: SIMULATED`,
`sourceType: ITEM_SIMULATION`, `sourceStage: SIMULATED_ITEMS`, the original
reference, `sourceRevision: 0`, and no `deliveredAt` or monetary amount.

Its SHA-256 hashes JSON containing protocol `ITEM_SIMULATION_V1` and the canonical
SKU-sorted context. Identical context deterministically produces the same hash;
this is correlation, not authentication, an immutable receipt or a durable
physical-delivery replay fence. The evaluator performs no database, provider,
transport, inventory, allocation or receipt issuance work. Digital Core alone
retains its ordinary protected merchant coordination receipt and replay behavior.

| Scenario | Required outcome |
| --- | --- |
| Approved exact bundle in an opted-in LOCAL environment | Clearly simulated projection only |
| Non-LOCAL, missing environment, wrong mode/service or absent allowlist entry | Typed refusal, no verified fallback |
| Missing/extra context, duplicate SKU, bad quantity, missing Store revision or non-SIM reference | Refuse before orchestration can acknowledge it |
| Selection revoked during consumer evaluation | Consumer refuses; previously simulated data cannot become real proof |
| Partner customization | May narrow exported admission through `this`; must preserve tags and cannot qualify delivery |

Business evaluators can assess the merchant journey, not delivery readiness.
Business users see simulated/unverified goods. Operators must select this only
for disposable approved Local demonstrations; normal permissions, Store scope,
consent, purchase and persistence gates still apply. Partner developers and AI
tools must never present simulated status as DELIVERED or infer stock movement.
Framework maintainers retain the authenticated owner work below as a separate
integration. Used-benefit reversal approval is independent and is not granted.

`fulfillmentItemSimulationContract.test.js` forbids persistence/transport ports
and checks deterministic/concurrent results, detachment, strict selectors,
revocation and narrowing customization. Promotion's simulation consumer and the
real private merchant flow have separate integration fixtures. These are source
tests, not installed cross-worker acceptance, browser acceptance or real delivery.

## Required Shipment Owner Integration

A later implementation must meet all requirements below before replacing the
refusal. These are prerequisites, not implemented behavior or implicit approval
to change a shared schema.

1. Reuse the configured carrier/provider authority and runtime secret boundary.
   Define an executable provider-owned event verifier/admission contract that
   checks raw signed bytes, signature algorithm, key/account binding, tenant,
   issuer, timestamp/replay window and event identity. Unknown, disabled,
   sandbox-only, revoked or unqualified sources fail closed. An authenticated
   provider status still does not establish parcel contents or purchased rights.
   Qualification declarations alone cannot admit events. Do not add a parallel
   provider registry, a browser-selectable provider or staff delivery attestation.
2. Derive allocations from protected original purchase/fulfillment owners, not
   request JSON. Bind each original coupon, target, buyer, issuer enterprise,
   tenant, operational enterprise, product, promotion and retained revision,
   outlet/store and positive original store revision to exact original SKU/unit/
   quantities and Shipment/Order allocation identities. Resolve canonical Profile
   enterprise identity independently; do not equate a business tenant relationship
   to the storage tenant. A signed parcel event without this linkage cannot qualify.
3. Coordinate any Shipment schema/index/private-write change with its owner and
   existing physical reversal work before edits. Use the existing Shipment owner,
   not a second fulfillment ledger. Private receipt issuance requires guarded,
   atomic, insert-only original allocation binding, actual unique indexes,
   non-versioned protected storage and independent exact readback. Generic saves,
   tracking routes and lifecycle transitions must not create or replace receipts.
   Keep private raw provider evidence and credentials out of customer results.
4. Pin the admitted provider event, immutable original allocation, source revision,
   canonical source hash and authenticated deliveredAt. Define hash serialization
   and content explicitly. The hash is integrity metadata, never authentication.
   Delivered time must be non-future and no earlier than the protected sale.
   Original sale time and current rights must be independently read, not asserted
   by the evaluator caller. An outlet revision is an owner read, not a default 1.
5. Enforce replay at event identity and original coupon/target allocation identity.
   Exact replay returns the original hash/time without another issue or delivery;
   changed scope, contents, provider, reference or quantities is refused. A lost
   commit acknowledgement requires exact owner readback or reconciliation, not a
   new key. A caller must not be able to split or reuse one allocation across
   coupons, targets or distinct receipt handles.
6. Re-read current provider revocation, original allocation cancellation and
   Fulfillment return/receipt/inspection state on every evaluation, including
   replay. Serialize issuance against original Shipment return/reversal guards
   and specify the race boundary with Promotion consumption. Returned, revoked,
   conflicting, partial, extra, pending, failed, stale or ambiguous evidence is
   denied, never cached as an unconditional successful proof. Do not infer
   delivery from an original SHIPPED/manual record or invert a return into delivery.
7. Only after these checks may a read-only evaluator emit the consumer's exact
   ITEM_DELIVERY/FULFILLED_ITEMS proof, with independent owner-issued verified and
   immutable semantics, exact identity/items, sourceReference, sourceHash,
   sourceRevision, storeRevision and deliveredAt. Those booleans must describe
   successfully checked protected source authority, not be copied from callers.
   No stock effects or delivery issuance may occur in `evaluate`.

## Extension And Acceptance

Later layers may narrow request admission using exported helpers and `this`.
To implement success they must replace the evaluation path with the qualified
owner integration above, not override `contract()` or a refusal message. The
base evaluator throws even when a customized context helper returns a fabricated
successful proof. There is intentionally no injected evidence callback or
configuration flag that enables its base success path.

`test/fulfillmentItemDeliveryEvidenceContract.test.js` checks exact context,
detachment, bounded items, malformed/forged evidence, inert defaults, sequential
and concurrent refusal, narrowing overrides and the real Promotion consumer.
These isolated refusals are not successful delivery, provider authentication,
database race or installed qualification tests. Future success coverage must
exercise actual verifier admission, owner-private writes/indexes, full original
allocation checks, altered replay, lost acknowledgement, provider revocation,
returns and consumption races. Native installed qualification remains a separate
acceptance gate; no local-demo or production delivery is claimed by this change.

In VERIFIED mode, business users and operators receive refusal, not a manual fallback.
Partner developers and AI tools must preserve it until the owner prerequisites
exist. Framework maintainers own shared receipt persistence/security changes;
administrators cannot qualify a source by toggling readiness flags alone.
