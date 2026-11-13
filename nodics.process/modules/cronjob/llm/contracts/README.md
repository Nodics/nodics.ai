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
