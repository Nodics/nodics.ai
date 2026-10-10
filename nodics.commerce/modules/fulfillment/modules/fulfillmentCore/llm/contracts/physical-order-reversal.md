# Physical Order Reversal

## Ownership And Authority

Fulfillment owns actual consignment, shipment, return intent, package receipt and
inspection. Inventory owns balance, original hold, remaining quantity and movement.
Order owns customer review, immutable full-refund approval, order lock and recovery.
Payment owns original capture, remaining financial authority and refund execution.
Profile owns current signed employee scope. No parallel ledger or customer
impersonation is introduced.

`DefaultPhysicalOrderReversalService.preview/prepare/settle/complete` implements
the local `fulfillmentCore` provider of the existing guarded Order refund processor.
`order.refunds.ownerByStore.<storeCode>` selects it using only the retained
`order.evidence.storeCode`, verified against the original owner-bound Cart Store.
Explicit `storeCodes.<storeCode>: true` admits that Store. Legacy configured
`orderCodePrefixes` and `defaultOwnerPort` remain supported for external domains;
they do not implicitly admit a physical Store. Unknown owner selectors reject.
Framework disputes/refunds and `fulfillmentCore.physicalOperations.enabled` default
disabled. Applications declare actual Store/feature selections, not copied defaults.

Each effect re-resolves Profile scope. Order requires `commerce.dispute.review`;
physical work independently requires `commerce.fulfillment.return` with current
Commerce/Fulfillment scope. Financial execution additionally requires
`commerce.refund.execute`. Request body scope, owner, amounts, original captures,
shipment flags, inspection results and approval objects never replace retained
owner evidence. Review approvals pin original Order/case/entries/consignment,
full amount/currency, original capture, reason and stable command.

## Supported Process

This is a bounded full-physical-order bridge. Mixed digital/physical orders,
partial financial refunds, split consignments, unproved legacy holds and unsupported
dispositions fail closed. Checkout already creates a retained READY consignment
after capture; absence of a shipment alone does not prove cancellation authority.
Every original Order entry must match exactly one retained Inventory reservation
and its acquisition balance/movement proof.

Cancellation requires explicit `CANCELLATION` review and original READY consignment
with no dispatch ownership. Prepare CAS-locks that consignment CANCELLATION_PENDING.
Inventory atomically releases every original ACTIVE hold, lowers reserved, raises
available, retains onHand and inserts unique RELEASE evidence. Payment follows.
Physical CANCELLED is projected only after confirmed original Payment refund.
If Payment is uncertain, released stock is not reserved again: the existing Order
checkpoint remains reconciliation work and same-command recovery cannot replenish
stock twice.

Return requires explicit `RETURN` review and an owner-issued finalized SHIPPED
record with exact original hold lines. Prepare CAS-locks RETURN_PENDING and retains
the FulfillmentReturn intent before any stock effect. Return preparation can be
approved before goods arrive, but settlement blocks until cumulative receipts
exactly cover shipped quantity and every receipt has an accepted inspection.
Receipt/inspection commands can proceed under that same persisted approval while
the original refund command stays RECONCILIATION_REQUIRED. Retry the original
refund case/key/reason after completing logistics; never create a new financial
command or approve a second case.

Multiple partial package receipts are supported, bounded by configured limits.
Each receipt references the original shipment and exact reservation quantities.
Every receipt serializes on the consignment revision, so concurrent commands cannot
exceed the remaining shipped authority. A package reference cannot be received
again under a different key. One immutable inspection binds an exact receipt;
changed replay cannot replace its disposition. Accepted RESTOCK restores onHand
and available. Accepted SCRAP records genuine RETURN disposition evidence but
restores neither: goods have been returned and disposed, not made saleable.
REJECT_RETURN blocks stock settlement and Payment. REFURBISH is not silently mapped
to available or allocated stock; it needs a separately qualified quarantine owner.

Inventory commits all dispositions in one transaction, advancing original hold
returnedQuantity and recording every receipt/inspection-specific RETURN movement.
It refuses excess/negative/malformed quantities, foreign sources and unproved
movement histories. Final RETURNED projection requires confirmed Payment refund
and exact stock proof. Neither receipt nor inspection directly issues money.

## Manual Operational APIs

All paths below are within the Fulfillment module API prefix, POST, secured access
tokens, employee group, `commerce.fulfillment.return`, `commerceManagement` exposure.
Headers include private Authorization, selected enterprise and a stable
`Idempotency-Key`; correlation is optional. Bodies require `confirmed:true` and a
reason of 10-2000 characters.

| Path | Additional Body | Meaning |
| --- | --- | --- |
| `/physical/orders/:code/dispatch` | `handoverReference` | Actual manual warehouse handover for the original Order. |
| `/physical/reviews/:code/receipt` | `receiptReference`, `lines:[{reservationCode,quantity}]` | Actual received package against the approved original return case. |
| `/physical/reviews/:code/inspection` | owner-issued `receiptCode`, `disposition` | Immutable inspection of that exact package. |

Dispatch requires explicit manual handover confirmation and retains the reviewed
operator, reason, reference, exact original lines and command before changing stock.
Its DISPATCH_PENDING lock excludes cancellation. Inventory then atomically consumes
original holds, lowers reserved/onHand and records SHIP movements. Only after stock
proof does Fulfillment atomically issue the actual retained SHIPPED record and
finalize the consignment. The source contract uses `MANUAL_ATTESTATION`; an operator
must actually perform and attest the warehouse event. It is not external carrier
confirmation, tracking verification or a qualified live carrier integration.
The route reuses the existing physical-operation permission; no new grant is created.

## Persistence And Recovery

Consignment, Shipment, FulfillmentReturn, ReturnReceipt and ReturnInspection require
installed nonversioned models, unconditional unique code indexes, compare-and-set,
explicit eligible side-effect-free transactions and disabled cache/event effects.
Generic CRUD mutations are disabled. Existing records require owner migration or
an explicitly approved disposable reset before qualification; a source schema flag
alone does not prove installed persistence. Inventory independently checks installed
balance/reservation/movement models and unique code plus stock-scope indexes.

Fulfillment and Inventory transactions are separate. Opaque transaction tokens must
never cross databases. The consignment's durable monotonic dispatch/reversal lock
precedes stock effects; stock proof precedes shipment or physical completion.
Failed acknowledgements recover only from exact original persisted identity,
quantities, movement and status. Divergence stays reconciliation work. No automatic
unlock, new command identity, fabricated SHIPPED result or compensating restock is
permitted when the original effect is uncertain. A current employee must remain
authorized during recovery.

## Verification And Extension

`test/physicalOrderReversalContract.test.js` connects actual Order, Fulfillment and
Inventory source services through isolated rollback-capable generated stores.
It covers cancellation/replay, actual source-linked manual dispatch, multi-package
returns, RESTOCK/SCRAP/rejection, concurrent receipt/stock commands, lost acknowledgements,
foreign/stale/missing evidence, model/index qualification and later-layer movement
customization. Existing Order refund, dispute, reverse safety and Inventory
reservation/legacy RETURN tests remain required. This is source/integration evidence,
not native database, real warehouse, carrier or external financial-provider acceptance.
Native acceptance separately exercises the same normal APIs and readback through
the approved disposable deployment; it must not seed fake shipment/inspection rows.

Later layers may override exported service members and narrow policies. Preserve
all authority, exactness, transaction, replay and evidence contracts; do not infer
a new provider's qualification from manual or offline conformance. Partner
extensions implement capabilities in their own source and qualify them independently.
