# search AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nSearch/search`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Database fallback defaults to false. A caller/deployment may intentionally select fallback through the existing search options. Search activation and provider selection remain explicit.

## Search Readiness And Read-Source Policy

`nSearch/search` owns the canonical readiness contract for search engine health,
configured modules, initialized engines, index rebuild availability, projection
refresh availability, and database/search read-source policy. BackOffice may
aggregate and Axis may render this information, but neither should infer search
health or rendering policy from frontend route state or customer-project flags.

The owner readiness contract must expose safe operator metadata only:

- effective runtime role, engine, fallback flag, and read-source policy;
- configured module count and initialized/inactive engine counts;
- search index rebuild and projection refresh operations;
- Axis configuration visibility route;
- bounded blockers with repair operation/action labels.

Search readiness must not add custom-project configuration burden. Framework
defaults and active module/runtime configuration define the policy, while later
environment or persisted runtime configuration may override values through the
normal layered configuration model.
