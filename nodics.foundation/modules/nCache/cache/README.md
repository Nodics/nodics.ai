# cache

Cache provides the Nodics cache capability for fast runtime lookup, node-local state, invalidation, and provider-backed caching.

## Responsibility

This module owns the cache adapter boundary, cache key handling, invalidation behavior, diagnostics, and provider selection hooks used by framework and project modules.

## Developer Notes

- Keep implementation details in the owning service, adapter, configuration, and tests.
- Use project-layer configuration to switch providers or tune TTL behavior.
- Do not hardcode Redis, local memory, tenant, or node behavior in callers.
- Preserve event-aware invalidation when a cached value can change runtime behavior.

## Documentation

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.foundation/cache-runtime-state.md`
- `nodics.docs/docs/pages/nodics.foundation/runtime-configuration.md`
- `nodics.docs/docs/pages/nodics.foundation/events-messaging-cluster.md`

## Verification

Run cache-focused tests when behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```
