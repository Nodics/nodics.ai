# search AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nSearch/search`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Database fallback defaults to false. A caller/deployment may intentionally select fallback through the existing search options. Search activation and provider selection remain explicit.

Expected startup skips with effective `options.enabled:false` log at debug.
Missing/invalid configuration or an unavailable engine while search is selected
retain warning/error visibility. Diagnostic classification never enables search,
changes provider admission, or converts a provider rejection into success.

## Logical And Physical Index Identity

The layered definition key and `typeName` identify the logical search model.
`indexName` identifies the physical provider index and may be overridden by a later
deployment layer. Implicit generated-service lookup uses the schema's `typeName`,
with `indexName` fallback for legacy definitions without a logical pointer.
Explicit request selectors remain logical; never rewrite them or introduce a
parallel physical-name registry. Model-specific contributors prefer the logical
definition key and retain the existing physical-key contributor as a compatibility
fallback. Engine creation/existence bookkeeping uses the physical lowercase name.
Tenant/module validation and provider activation remain unchanged.

### Historical Retirement Bindings

An explicit `retirement` field reserves a logical model for an existing physical
target. Startup registers it but must not create the physical index, apply schema
mappings or redirect an active schema pointer to that historical target. This
rule also suppresses provisioning for malformed/null declarations; such metadata
does not qualify a retirement command. The owning retirement service remains
responsible for dedicated ownership, scope, immutable UUID and command admission.
After acknowledged erasure, keep the binding to inspect original durable evidence
without recreating the removed index on restart. Ordinary definitions without
the field retain their existing provisioning behavior. Later layers may change
the registered binding only through the owner lifecycle; changed identity cannot
reuse the original review. Verify both paths with the startup retirement and
logical/physical identity tests.

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
