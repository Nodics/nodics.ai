# nodics.cron

## Inheritance

- Follow the repository AGENTS contract: `../AGENTS.md`.
- Follow global AI/development guidance:
  `../nodics.core/modules/nSetup/llm/ai-enablement-index.md`.
- If a child module has its own `AGENTS.md`, follow that file for changes
  inside the child module.

## Module Work Rules

- Keep scheduled-job runtime authority inside the `cronjob` module.
- Do not move job scheduling, node ownership, or execution lifecycle into Axis.
- Treat `nodics.cron` as an optional functional module unless a customer
  server composition explicitly requires it.
- `nodics.cron` may be included in a shared Process/Automation runtime, such as
  a customer `processServer`, but its functional identity, BackOffice
  capability metadata, permissions, scheduler data, and lifecycle services
  remain Cron-owned.
