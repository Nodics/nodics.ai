# cronjob AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.cron/modules/cronjob`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Runtime scheduler authority

- `DefaultCronJobRuntimeService` is the only process-local tenant/job pool.
- `DefaultCronJobService` owns persisted-definition orchestration and delegates
  runtime lifecycle operations through the effective runtime service.
- `CronJob` remains an independently constructed wrapper for one scheduled job.
- Later modules override the smallest runtime service member and preserve tenant
  isolation, node ownership, drain, idempotency, and partial-failure behavior.
- Do not restore `CronJobContainer` or introduce a parallel scheduler pool.
