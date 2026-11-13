# redisCache AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nCache/redisCache`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Redis provider properties own the default `cache.default.engines.redis.options.prefix`
value `localRuntimeAuth`. Inherit it through nConfig; a Local environment enabling
Redis declares only `enabled: true`. Later deployment layers may override the prefix
for isolation. A prefix does not enable Redis or replace channel/module/tenant keying.

The Sentinel facade exposes dynamic `isReady` and `isOpen` values from its provider lifecycle. Connecting, reconnecting and closed states must not pass shared readiness; closed clients must be observable after shutdown. Test-only cross-module clients use the provider factory with explicit options, and cleanup invokes the owning cache/registry service.
