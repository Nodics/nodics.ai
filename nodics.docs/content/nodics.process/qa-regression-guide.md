# Process QA and Regression Guide

Process automation touches business operations, so small bugs can become noisy
in production. QA must test both the happy path and the boundaries.

## Minimum backend regression

Run the Process contract suite:

```bash
cd nodics.ai/nodics.process
npm test
```

This validates module structure, secured routes, permission catalog coverage,
generated schemas, graph validation, definition lifecycle, operation inspection,
runtime lifecycle, trigger execution, and action adapter blocking.

## Fresh database acceptance

From the reference customer project, run the fresh local acceptance when you
need evidence that bootstrap, imports, module registration, Axis content, and
runtime servers still cooperate:

```bash
cd nodics.kickoff
npm run acceptance:local:fresh
```

This is heavier than unit tests, but it catches integration drift.

## Manual Axis smoke checklist

1. Login to Axis.
2. Open Business Process & Automation.
3. Create a sample draft.
4. Save a graph change in Designer.
5. Validate the draft.
6. Publish the draft.
7. Start an instance.
8. Claim and complete a task.
9. Create a scheduled trigger relationship.
10. Activate and execute the trigger.
11. Confirm a new instance appears.
12. Open the timeline and verify audit evidence.

## Negative tests that matter

- Unknown action adapter must fail.
- Paused or archived trigger must not execute.
- Draft definition must not start.
- Archived trigger must not update.
- User without Process permission must be denied.
- Axis refresh must not be required after every operation.

If these fail, stop and fix the contract before adding more UI.

## Regression evidence matrix

| Layer | Positive proof | Negative or recovery proof |
| --- | --- | --- |
| Definition | Valid graph saves, validates, and publishes. | Invalid transition, unsupported node, and stale version are rejected. |
| Runtime | Published definition starts and reaches the expected terminal state. | Failure creates an incident and restart preserves durable state. |
| Task | Authorized user claims and completes a task. | Unauthorized, expired, and competing updates are rejected. |
| Action | Registered adapter executes once with bounded output. | Unknown adapter, timeout, duplicate delivery, and malformed output fail safely. |
| Trigger | Active trigger executes with correlation and audit. | Inactive or unauthorized trigger does not execute. |
| Cron composition | Process and Cron are observed in processServer. | No standalone Cron listener or duplicate schedule authority exists. |
| Axis | Authorized pages render current backend state. | Deep links and actions remain guarded when permission or module availability is absent. |

The regression run starts with deterministic contract tests, then uses an empty
local database so every schema, import release, registration, and default record
must be rebuilt from source. It finishes with retained-data acceptance to prove
repeatability and immutable release handling. Manual database edits invalidate
the result because they hide missing generators or import contracts.

A beginner developer should record the exact command, commit, environment,
runtime graph, database names, and outcome. Production qualification adds
dependency outage, restart, concurrency, capacity, redaction, and rollback
evidence. Operators should inspect error-level startup output and persisted
incidents instead of relying only on exit code or HTTP 200.

Security regression covers cross-tenant identifiers, missing and insufficient
permissions, malformed graph metadata, oversized input, executable strings,
secret-bearing output, replayed correlation identifiers, and unauthorized
recovery. Performance regression covers large but bounded graphs, navigation,
task queues, audit history, and retry storms. Each boundary needs a documented
limit and a stable rejection or degradation behavior.

## Common mistakes

- Testing only successful API responses while skipping permissions, stale state, retry bounds, recovery, and restart behavior.
- Accepting UI refresh workarounds or manually repaired database records as valid regression evidence.

## Verification

Run the complete Process contract suite and bounded fresh local acceptance against empty databases, then repeat the live smoke against retained data and inspect startup logs for error-level output.
A beginner developer should be able to follow the same regression sequence without manual database repair.
