# nConfig

nConfig owns Nodics configuration loading, precedence, runtime registry composition, startup scripts, and environment/server/node configuration boundaries.

## Responsibility

This module determines how framework defaults, project overrides, server properties, environment values, and runtime-governed records become effective application behavior.

## Developer Notes

- Keep configuration ownership with the module that owns the behavior.
- Use pre-start and post-start scripts for controlled lifecycle extension.
- Preserve redaction for secrets and operational logs.
- Treat runtime-refreshable settings separately from startup-only settings.

## Documentation

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.foundation/runtime-configuration.md`
- `nodics.docs/docs/pages/nodics.foundation/framework-startup-lifecycle.md`
- `nodics.docs/docs/pages/nodics.foundation/governed-runtime-change.md`
- `nodics.docs/docs/pages/nodics.foundation/events-messaging-cluster.md`

## Verification

Run configuration and runtime-governance tests when behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```
