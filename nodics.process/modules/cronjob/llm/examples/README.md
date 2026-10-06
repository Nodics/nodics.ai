# cronjob AI Examples

- [Reviewed inactive schedule draft](inactive-schedule-drafts.md): explicit
  preview/confirmation and no-replay uncertainty boundaries.

This folder contains examples that help AI agents and developers work correctly inside the `nodics.process/modules/cronjob` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

To customize scheduler runtime behavior, override an exported member such as
`startJobs` on `DefaultCronJobRuntimeService` in a later module and call the
earlier implementation when appropriate. Prove dispatch through
`DefaultCronJobService`; do not construct a second pool or replace the
tenant-scoped `CronJob` wrapper with singleton state.

## Supplying Process Business Context

1. Publish a definition and create its trigger through the owning Process APIs.
2. Configure `jobDetail.processTrigger.triggerCode` in the Cron definition.
3. Put only target-approved business fields in `processTrigger.context`, for
   example `{ businessDate: '2026-10-03' }`. Do not put credentials or grants there.
4. Run a controlled test through normal operational admission. Cron supplies its
   actual source, tenant, job, expression and fire time after copying business
   context; the stored definition is unchanged.
5. Inspect Process and target evidence before enabling recurrence. A timeout is
   not permission to replay a target mutation or proof that a writer has stopped.

For Copilot refresh, target-approved inputs include the assigned source code and
current policy fingerprint. Follow Knowledge's Process-backed-refresh guide for
assignment and runtime grants; do not add Copilot-specific policy to Cron.
