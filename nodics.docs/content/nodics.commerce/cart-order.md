# Cart, checkout, and order placement

## Customer journey

Cart stores customer purchase intent. Calculation asks Pricing, Promotion, Tax, and Inventory for authoritative decisions. Checkout validates the final intent and coordinates placement. Order records the durable result and append-only history. These responsibilities are deliberately separate. The business value is a reliable purchase promise: customers see defensible totals, stock is protected, and retries do not create duplicate orders or charges.

| Stage | Owner | Result |
| --- | --- | --- |
| Add or change entries | Cart | versioned customer intent |
| Calculate | Cart coordinating domain owners | exact calculation evidence |
| Reserve | Inventory | idempotent stock reservation |
| Authorize | Payment | authorization evidence |
| Create durable purchase | Order | immutable order and entries |
| Release goods | Fulfillment | release or consignment evidence |
| Recover failure | Checkout and each owner | checkpoint and compensation evidence |

A customer can retry placement with the same idempotency key. Checkout first looks for an existing result. It does not create a second order, reservation, or authorization. Each completed step is checkpointed. If a later step fails, compensation asks the original owner to release or void its evidence.

## Calculation explained for beginners

Suppose one entry costs `20.00`, a promotion grants `2.00`, and Tax returns `0.90`. Cart records subtotal `20`, discount `2`, tax `0.9`, and total `18.9`. The formatting can be localized in Axis, but the backend values remain exact decimal strings with a currency.

Calculation is a snapshot, not permanent truth. Before placement, Checkout verifies the Cart revision, owner decision versions, inventory availability, customer ownership, store context, and expiry. A changed Cart cannot reuse evidence from an older revision.

## Developer guidance

Developers add Cart rules through validation and calculation pipelines, not by calling provider SDKs. Owner ports make dependency contracts explicit and testable. A customer extension can add an entry validator or replace a Pricing resolver without forking Cart.

Order data is immutable commercial evidence. Corrections append history or create a governed lifecycle request; they do not rewrite the original placed facts. Store display labels separately from stable codes. Keep protected addresses and payment references in bounded schemas and projections.

Placement bridges must have deterministic idempotency keys. Derive child keys from the placement key and operation name so retry calls reach the same Inventory and Payment operations. Persist checkpoints before advancing. Do not infer success from a timeout; reconcile with the owner.

## Operator and DevOps guidance

Operators need calculation diagnostics, placement checkpoints, dependency latency, compensation status, stale reservations, and duplicate-attempt indicators. Axis displays backend evidence and refreshes after actions. It does not mark a placement successful because a button was clicked.

Set bounded Cart sizes, pagination, timeouts, retry budgets, and queue backpressure. Load tests must include concurrent updates to one Cart, hot products, promotion bursts, inventory contention, provider timeout, and replay. Backup and restore tests prove that Orders and history survive while transient Carts follow the approved retention policy.

## Security and failure behavior

Customer routes require customer access tokens and ownership checks. Employee routes require explicit Commerce permissions. Service bridges use service tokens. Tenant comes from trusted authentication context and cannot be overridden by payload data.

A failed dependency leaves a diagnostic and returns an honest incomplete result. Compensation is idempotent and retryable. A Payment timeout becomes unknown until reconciliation, never automatically declined or authorized. Inventory reservation failure prevents Order creation unless an approved backorder policy explicitly applies.

## Common mistakes

- Recalculating money with browser or floating-point logic.
- Creating Order before durable reservation and authorization evidence.
- Reusing a calculation after Cart revision changes.
- Retrying with a new idempotency key.
- Deleting Order history to correct a mistake.
- Treating timeout as a known provider outcome.
- Putting compensation logic inside an unrelated domain.

## Verification

Run Cart calculation and placement tests for success, unauthorized ownership, cross-tenant access, stale revision, concurrency, idempotent replay, dependency failure, each compensation boundary, and recovery after restart. Generate schema and route contracts from the effective Commerce graph. Validate Axis loading, empty, error, keyboard, responsive, and stale-evidence states. Production release additionally requires load and soak evidence at approved Cart size, order rate, and dependency latency budgets.
