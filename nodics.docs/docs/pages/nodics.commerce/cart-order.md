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

## Explicit store context across applications

Cart APIs belong to Cart. A customer selects its store in the request rather than
creating a store-specific controller, route or framework configuration. For example,
`POST /carts` accepts `{ "storeCode": "duStore" }`; another customer uses the same
endpoint with `{ "storeCode": "independentStore" }`. Paths are relative to the selected
Cart module endpoint. The usual access token, permissions and ownership apply.

Cart and Shopping List reuse the existing Store context service. Identifier input
may come from payload, query or established request context; supplied sources must
agree. Missing, blank, surrounding-whitespace and non-string values fail before
persistence. These checks validate identifier agreement; they do not look up Store
master data or grant selling eligibility. The existing Store/channel and downstream
domain owners retain those checks, without elevated credentials or raw database access.

The same resolved code feeds Cart identity and its model. An existing owned Cart
uses its persisted store when read, updated or calculated by saved ID. Conflicting
input, a missing persisted store, or an attempt to recreate that ID in another store
is rejected. Activation must include Store when these operations run; a missing
context service is unavailable, not a reason to infer a store.

### Customize and extend safely

Keep actual store selection in the calling application's established configuration
and send it as operation data. No `cart.customerApi.defaultStoreCode` or
`shoppingList.customerApi.defaultStoreCode` fallback is consumed. A later-loaded
customer module may tighten the existing Store context service's exported validation
method while preserving required context, agreement and authentication boundaries.
Use the service override mechanism; do not add a resolver registry or copied API.

### Upgrade, failure and recovery

Update legacy callers that omitted `storeCode` before upgrading and remove unused
server fallback declarations. Explicit-store Cart hashes and Shopping List ID formats
remain unchanged. Existing records/entries are not automatically rekeyed or reassigned.
Retain saved Cart IDs: an ID created by the old request-context-only hashing bug is
still readable by ID, but recomputing the corrected hash cannot locate that old ID.
Resolve orphaned or inconsistent references through a governed owner migration;
never guess a store or fall back to a different list. Explicit Cart create/replace
retains its prior lifecycle behavior and adds no new transactional retry guarantee.

### Verification of context changes

The customer API contracts exercise independent stores through identical routes,
legacy explicit IDs, context-only identity, missing/malformed/conflicting input,
existing-record reuse, wrong owner/tenant, and effective-service overrides. Run
Cart and Shopping List customer tests with the Commerce foundation and route
security checks, then verify selected runtime activation and actual client requests.
Prepared composition and mocked contract tests do not constitute live database or
browser acceptance. Production migration must separately verify real owned records.
