# cronjob AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.cron/modules/cronjob` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

To customize scheduler runtime behavior, override an exported member such as
`startJobs` on `DefaultCronJobRuntimeService` in a later module and call the
earlier implementation when appropriate. Prove dispatch through
`DefaultCronJobService`; do not construct a second pool or replace the
tenant-scoped `CronJob` wrapper with singleton state.
