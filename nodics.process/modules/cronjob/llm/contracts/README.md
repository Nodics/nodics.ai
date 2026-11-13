# cronjob AI Contracts

Inactive provisioning: [reviewed schedule drafts](inactive-schedule-drafts.md).
Use this contract for the new default-disabled create-only command; do not route
drafts through the legacy active generated-save form.

This folder contains module-specific AI/developer contracts for `nodics.process/modules/cronjob`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Runtime scheduler authority

- `DefaultCronJobRuntimeService` is the only process-local tenant/job pool.
- `DefaultCronJobService` owns persisted-definition orchestration and delegates
  runtime lifecycle operations through the effective runtime service.
- `CronJob` remains an independently constructed wrapper for one scheduled job.
- Later modules override the smallest runtime service member and preserve tenant
  isolation, node ownership, drain, idempotency, and partial-failure behavior.
- Do not restore `CronJobContainer` or introduce a parallel scheduler pool.
- Removing an existing timer forwards the selected `removeJob(tenant, code)`
  tenant unchanged into `defaultCronJobRemovedHandlerPipeline`. Validator lookup
  must retain this trusted partition during ordinary reactivation after stop;
  never infer another tenant or bypass tenant validation. The real-pipeline
  regression is `test/cronJobRemovalTenantPipeline.test.js`. Same-code jobs in
  other tenants and existing uncertain lifecycle evidence remain independent.

## Operational activation and runtime revocation

Every new job target invocation passes `DefaultCronJobService.assertOperational`.
The existing registration agent supplies bounded business activation and the
existing authentication service verifies the runtime credential. Missing, stale,
inactive, expired or revoked authority rejects execution. A schedule may remain
loaded for management/recovery while targets are disabled. Do not synthesize a
new unrestricted service identity for a Process handoff: forward the verified
runtime principal. Already-admitted jobs finish or recover under the existing
Cronjob lifecycle; deactivation does not abruptly terminate their process.

## Process Handoff Context

Merge configured `jobDetail.processTrigger.context` first, then the scheduler-owned
`source`, `cronJobCode`, `cronJobTenant`, `scheduledExpression` and `firedAt`.
The definition remains unchanged. Forward the verified runtime principal, never
credentials or grants supplied through context. Source/fingerprint inputs remain
business context for the target's fresh admission, not new Cron authority.
Verify `cronJobProcessTriggerContract.test.js` and the Copilot workflow integration
when extending this handoff. This contract does not provision schedules, stop
in-flight work, qualify cross-node exclusion or establish physical writer quiescence.

## Scheduled execution acceptance

`acceptance:cronjob-execution` owns only schedule activation and firing proof.
Its reusable timeouts and command registration belong in this module's
`config/properties.js`; a project contributes only a reviewed acceptance
selection and a runtime-supplied operator session. The selected job must already
be a saved inactive schedule draft. Acceptance uses Cron's lifecycle preview,
confirmed execute, one-time run and persisted job read APIs. It must observe a
new start/end pair and `SUCCESS`; an HTTP acknowledgement alone is insufficient.
Do not add domain records, notification assertions, customer identities or
credentials here. A downstream owner proves its own source and effects.


## Business scheduler workspace

New schedules use the existing reviewed inactive-draft contract and explicitly
configured targets. The Axis business workspace no longer supplies an active
demo definition, execution node or one-second timer. This changes no generic
Cron API, group, permission, target or activation default. Technical clients
remain independently owner-authorized; generic save is not a draft fallback.

The Cron BackOffice contribution declares the existing create/run/start/stop/
pause/resume transports under `cronjob.lifecycle.manage`. BackOffice filters each
action independently of `cronjob.backoffice.view`; metadata is not a grant.
Missing or ambiguous declarations offer no browser command. State hints never
replace Cron enforcement. Inventory needs a positive owner envelope and actual
identities/active flags. A command acknowledgement is not completed execution.
After an uncertain response, retain its job reference and inspect scheduler/log
evidence with the owner before another operation; do not replay automatically.

Customize labels/approved targets through Cron configuration or the smallest
project renderer, preserving source/actor scope and the reviewed draft protocol.
`cronJobBusinessNavigation.test.js` composes actual BackOffice permission filtering
with existing secured routers. Axis client/action/page tests cover malformed
evidence and scope retirement. Actual scheduled firing and role journeys remain
separate live acceptance, not inferred from these source checks.

## Execution failure and overlap

On one execution node, manual runs and natural ticks use the same tenant/job pool wrapper. A second manual run is rejected while the full target pipeline is pending; natural ticks during work are skipped and never replayed. There is no catch-up queue or automatic scheduler retry. Stop prevents new ticks and preserves admitted completion; refresh/removal cannot replace a running wrapper. Persisted start/end times and terminal status establish completion, not a command acknowledgement. Safe failure attribution contains only a stable error code and target kind; provider payloads, credentials, URLs and stacks are not business evidence. Last skipped tick is a bounded observation, not a complete run history. A stopped or paused timer remains stopped or paused when its admitted execution ends. This is single-process exclusion, not distributed exactly-once delivery or crash-recovery certification.

## Lifecycle Commands

CronJob supports create/register, update, run, start, stop, remove, pause, and
resume through its owning controller, orchestration service, and
`DefaultCronJobRuntimeService`. The runtime service is the sole process-local
tenant/job pool authority; later modules may override individual lifecycle
members without replacing scheduler state or the per-job `CronJob` type.
State-changing routes are secured command APIs: `POST` for create, run, start,
stop, pause, and resume; `PATCH` for update; and `DELETE` for removal. Do not
expose these operations through `GET` or place business logic in route handlers.
Every lifecycle command route declares the stable
`cronjob.lifecycle.manage` permission in addition to its access-group guard.
The reference runtime administrator group receives this permission through the
identity-governance migration target, but customer projects should narrow it
for production operators when needed.

Scheduled triggers and manual `run` commands share the job definition and
handler contract. Manual execution must not bypass tenant context, node
eligibility, running-job protection, target permissions, logging, or failure
handling. A human bearer token can authorize a CronJob command; module calls
performed by the job use the separate tenant-scoped internal service-token flow.

Scheduler bookkeeping uses owner-bound `persistRuntimeState`, never business
execution authority. The [detailed guide](../../data/docs-v001/records/documentation/cronjobDocumentationRelease002ComponentData.js)
defines its permitted fields, exact acknowledgement and drain guarantees.

Axis can present a Cron operation panel, but it remains a client. Saving a job
uses the Cron-owned generated `cronJob` schema route, and lifecycle buttons call
Cron-owned command routes. Axis must not create an alternate scheduler state,
calculate job ownership, or execute job handlers in the browser.

Axis may apply a conservative button policy to reduce operator mistakes. For
example, an inactive job should not show `run` or `start` as immediately
available, a running job should make `stop` and `pause` visible, and a paused
job should make `resume` visible. That policy is only presentation guidance.
Cron remains the final authority and must validate every command server-side.

The inactive-draft save acknowledgement describes the original save. Its copy
points operators to Schedule control for the current state, so it remains truthful
after activation or a completed run. Actual timer inspection and persisted execution
evidence remain separate from that historical receipt. The current inspection
also identifies the scheduler time zone and stored expression. Only a proven
active timer can report a next eligible tick. A tick can be skipped if another
execution already holds the job.

When a Cron job declares `jobDetail.processTrigger`, Cron may start a governed
Process trigger through Process APIs. The Cron definition still owns schedule
and execution timing. Process owns the trigger relationship, started instance,
task creation, and audit timeline.
Configured business context is retained, but Cron supplies `source: 'cronjob'`,
the actual job/tenant, scheduled expression and fire time after merging it. A
frontend source label or configured conflicting field cannot override that
provenance. Process and the target still perform independent authorization.

## Execution And Ownership Model

```text
persisted tenant job -> eligible CronJob module instance -> assigned node pool
                    -> scheduled/manual trigger -> handler or target module
                    -> state, log, event, and operational evidence
```

The persisted definition is authoritative; the in-memory pool is disposable.
A node creates a scheduler only when its identifier matches `runOnNode` or an
approved temporary `tempNode`. Node-down handling may create temporary local
ownership, and node-up handling removes that temporary copy. Projects must
enable and qualify node monitoring before depending on failover in production.

This model prevents intentional duplicate placement, but it is not a
distributed transaction or universal exactly-once guarantee. Network
partitions, delayed failure detection, process termination, and downstream
timeouts can create uncertain outcomes. Jobs that change external state must
define an idempotency key, duplicate/overlap policy, timeout, retry safety, and
reconciliation or compensation behavior.
