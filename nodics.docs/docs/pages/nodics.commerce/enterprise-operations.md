# Commerce enterprise operations and migration

## Operational outcome

Commerce is safe to release only when correctness, capacity, recovery, compatibility, and migration evidence tell the same story. Unit tests prove deterministic rules; they do not prove that a production database, payment provider, carrier, region, or traffic profile is qualified.

The business value is controlled growth without sacrificing financial
correctness, customer trust, recoverability, or upgrade safety.

| Evidence layer | Framework proof | Deployment proof |
| --- | --- | --- |
| Capacity | bounded pages, carts, batches, retries, and a reference arithmetic harness | representative load and soak against production-like topology |
| Providers | adapter, timeout, callback, replay, idempotency, and offline conformance tests | credentialed sandbox certification and contracted limits |
| Recovery | checkpoints, restore-manifest comparison, retry and reconciliation contracts | backup, restore, failover, RPO and RTO rehearsal |
| Compatibility | version comparison, alias window, successor and sunset evidence | consumer matrix and upgrade/rollback rehearsal |
| Migration | dry-run mapping, count, hash, quarantine, cutover and rollback contracts | tenant-by-tenant approved execution and reconciliation |
| Retirement | active runtime scan and standard module identity | completed rollback window and operational owner acceptance |

## Beginner mental model

Think of a Commerce release as moving a warehouse while customers continue ordering. First count and label everything. Then rehearse the move, quarantine anything that does not map, move one controlled section, compare the old and new ledgers, and keep a rollback route until the agreed window ends.

The framework provides the checklist and evidence shapes. A customer deployment supplies real volumes, infrastructure, provider accounts, recovery regions, legal policy, and named approvers. This separation prevents local tests from being presented as production certification.

## Capacity and backpressure

The reference configuration bounds page size at 100, Cart entries at 500, batch size at 100, and concurrent provider requests at 25. Retry uses exponential delay, a maximum attempt count, and a maximum delay. These are reference defaults, not universal service-level objectives.

Developers preserve limits at every API, repository, queue, export, and provider boundary. Operators monitor p50, p95, p99, throughput, error rate, saturation, queue depth, retry age, stale reservations, placement checkpoint age, unknown payments, shipment exceptions, and reconciliation lag. DevOps teams test hot products, concurrent Cart revisions, promotion bursts, inventory contention, dependency latency, callback storms, provider throttling, and regional failure.

The included capacity test executes 50,000 exact decimal additions and records elapsed time as a regression harness. It is deliberately not called a production load test.

## Backup, restore, and disaster recovery

A backup manifest records tenant, counts for Orders, Payments, Shipments, lifecycle requests and history, checksum, and checkpoint. Restore verification compares counts and checksum before traffic resumes. A mismatch becomes DRIFTED and blocks automatic continuation.

Recovery resumes from durable checkpoints and reuses original idempotency keys. Unknown Payment and carrier outcomes are reconciled externally before replay. Disaster recovery must never reissue an authorization, capture, shipment, void, or refund merely because local state was restored.

Each deployment rehearses backup, restore, regional failover, dependency unavailability, and return to the primary region. It records measured recovery point and recovery time rather than copying the reference targets.

## Compatibility and upgrades

Contracts use semantic versions and classify compatible, deprecated, or breaking change. The default compatibility alias window is two minor releases or 180 days. A deprecated alias has a successor and sunset date. It translates identity at the boundary and never keeps a duplicate service or schema authority active.

Upgrade rehearsal runs old consumers against the new compatible surface, then new consumers against the supported server matrix. Rollback rehearsal proves that application rollback does not corrupt newer durable evidence. A breaking database change requires forward and rollback migration plans.

## Tenant migration journey

Migration defaults to DRY_RUN. For every tenant and schema, record source count, target count, source hash, mapping version, errors, quarantined records, and rollback reference. The approved order is Store, Product, Pricing, Tax, Promotion, Inventory, Cart, Order, Payment, Fulfillment, then reverse lifecycle evidence.

Cutover is allowed only after dry-run counts and hashes reconcile. Failed records are quarantined; they are not silently skipped. Rollback removes or deactivates only records created by that migration release and preserves immutable audit evidence.

The archived Commerce repository remains historical reference. Active package metadata, runtime source, configuration, server graphs, routes, and imports use `nodics.commerce`. A retirement contract scans active runtime paths for executable archived references.

## Developer guidance

Add operational evidence to the owning module. Checkout Core may coordinate cross-domain checkpoints, but Pricing still owns price decisions and Payment still owns reconciliation. Generated schema, service, controller, route-test, OpenAPI, and LLM artifacts come from effective source and are regenerated after changes.

Never hardcode machine paths, credentials, provider secrets, or customer data into evidence. Hashes prove integrity, not confidentiality. Redact protected payloads and retain only references needed for audit.

## Operator and release-owner guidance

The release owner reviews framework tests, effective graph, generated artifacts, Axis journey, documentation, migration rehearsal, provider qualification, load/soak, restore/failover, compatibility matrix, rollback, known limitations, and residual risks. Finance approves payment/reconciliation policy; Operations approves fulfillment and recovery; Security approves callback, secret, access and audit controls; Product approves customer policy; the deployment owner accepts environment-specific targets.

## Common mistakes

- Calling a microbenchmark a production load test.
- Claiming provider qualification from an offline simulator.
- Retrying unknown money movement with a new key.
- Migrating all tenants before a reconciled dry run.
- Keeping two active schemas behind a compatibility alias.
- Restoring counts without comparing a checksum.
- Retiring the archive before the rollback window ends.
- Editing generated artifacts instead of source.

## Verification

Run focused Commerce contracts, all generated schema and route contracts, controlled Commerce plus Process graph build, module metadata, syntax, ownership, documentation, LLM generation and validation, Axis verify, and the active-runtime retirement scan. Record the generated counts and observed capacity-harness duration.

Deployment release remains conditional until named owners attach representative load and soak results, credentialed provider and carrier qualification, backup/restore and failover measurements, tenant migration reconciliation, upgrade/rollback rehearsal, and residual-risk acceptance. That conditional gate is a feature of honest enterprise readiness, not an implementation omission.

## Customization and extension

Commerce projects may extend operations with tenant migration policies,
provider qualification matrices, regional rollout gates, capacity dashboards,
and release-owner approvals. The extension must keep pricing, payment,
fulfillment, inventory, order, and publication evidence with the owning
capability, while the enterprise operations page summarizes release readiness
and residual risk.
