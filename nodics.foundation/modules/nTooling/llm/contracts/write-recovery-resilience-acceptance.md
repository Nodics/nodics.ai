# Write-Recovery Resilience Acceptance

`acceptance:write-recovery-resilience` is an nTooling-owned coordinator. It does
not own a business write, domain assertion, persistence adapter, identity,
permission, fixture or recovery decision.

## Selection Boundary

The caller supplies one bounded JSON selection from the selected project. The
framework contains only reusable limits and allowed fault phases. A selection
has `contractVersion: 1`, a stable `code`, and between two and eight operations
owned by at least two distinct capability modules. Each operation declares:

- a stable operation `code`;
- one canonical non-nTooling `ownerCommand` registered with
  `acceptanceContract: true`;
- a project adapter under `scripts/acceptance/adapters/*.mjs`;
- explicit topology runtime codes in dependency order;
- one framework-admitted fault phase; and
- bounded, non-sensitive owner-command fixture arguments.

Credentials, bearer values and business defaults are never selection fields or
command arguments. They remain governed runtime environment inputs. Project
operations and adapters are not framework defaults and cannot replace owner
pass criteria.

## Execution Protocol

Execution requires `--execute`, `--approve-fault-injection`,
`--approve-restarts`, a stable `--run-id`, and one
`--approve-operation=<code>` for every selected operation. The coordinator then:

1. proves the selected runtimes are owned and ready;
2. calls the adapter once for `PREPARE` and once for `ARM_FAULT`;
3. invokes the canonical owner acceptance command exactly once;
4. requires `OBSERVE` evidence for the admitted fault;
5. performs one bounded restart through project topology tooling;
6. proves the selected runtimes are ready again;
7. calls `RECONCILE` with the same deterministic operation key; and
8. calls `CLEANUP` once after an armed fault, including failure paths.

The operation key is `<run-id>:<operation-code>` and is identical in every phase.
The owner command must treat an expected injected fault as verified acceptance
evidence and exit successfully. A non-zero owner command is an acceptance
failure, not permission to assume that the fault occurred.

## Adapter Evidence

An adapter emits one JSON object and no prose for each invocation. It repeats
`contractVersion`, `operationCode`, `operationKey`, `phase`, `status`,
`writeDisposition`, and literal `retryAttempted: false`. Reconciliation must
confirm one of `NOT_APPLIED` or `APPLIED_ONCE` and `receiptConfirmed: true`.

The coordinator never invokes the uncertain owner write a second time. It does
not infer success from process exit, retry an adapter phase, inspect owner
persistence, or turn `UNCERTAIN` into `APPLIED_ONCE`. Domain-specific evidence
and reconciliation remain with the owner command and adapter.

Aggregate output is bounded and recursively redacted for credential-shaped
keys, bearer values, JWT-shaped strings and secret query parameters. Raw owner
stdout/stderr is not copied into the aggregate receipt. Selection and adapter
paths are realpath-contained by the selected project, so symlinks cannot move
execution into framework or external source.

## Verification

Run:

```bash
node --test nodics.foundation/modules/nTooling/test/writeRecoveryResilienceAcceptance.test.mjs
```

The focused suite proves inert import/help, canonical command ownership,
selection containment, explicit approvals, stable operation keys, one owner
write per operation, restart ordering, no uncertain-write retry, failure-stop
behavior and redacted evidence.
