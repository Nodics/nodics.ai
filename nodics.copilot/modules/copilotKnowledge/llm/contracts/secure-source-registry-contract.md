# Secure Source Registry Contract

Every source must pass `DefaultCopilotKnowledgeSourceRegistryService.normalize`
before ingestion or retrieval. A valid definition includes a unique code,
repository, project, module, owner, version, source type, classification,
relative included paths, allowed channels, required secret scanning, and all
applicable tenant, enterprise, customer, customer-project, environment,
permission, role, and group restrictions.

Classification may be stronger than the configured default for a source type,
never weaker. Public sources must be explicitly public, Online, and published
documentation. Customer sources require a tenant plus an enterprise, customer,
or customer-project boundary. Customer-project sources always require an
explicit customer-project scope. Missing channel scope or secret-scan policy is
invalid.

Repository definitions may also declare `excludedPaths`, `allowedExtensions`,
and per-source file/byte limits. These controls are narrowing-only: a source
partition cannot add an extension or exceed a bound forbidden by the effective
global ingestion configuration. Invalid paths, extensions, or limits fail
registration.

Registries are immutable and reject duplicate source codes. Only enabled
sources that `copilotPolicy` permits may appear in a query scope. Discovery,
indexes, caches, providers, and prompts must consume the policy-filtered scope;
they may not reconstruct, enlarge, or bypass it.

Registration does not mean ingestion succeeded. Later ingestion must attach a
content digest, effective version, classification and provenance to every
chunk, reject detected secrets, preserve publication state, and audit the
projection lifecycle before a source becomes searchable.

## Opt-in Source Templates

`copilot.knowledge.sourceRegistry.templates` owns reusable source controls.
A definition selects a template explicitly and overlays its own fields; arrays
replace rather than concatenate. Expansion precedes all existing normalization
and security validation, so a template cannot bypass scope, classification,
channel, permission or secret-scan requirements.

Templates may contain source type, classification, paths, exclusions, extensions,
limits, channels, permissions and secret-scan policy only. Identity, repository
root, version, enablement, publication state and customer scope remain explicit
source-definition responsibilities. Unknown templates and unsupported template
keys fail closed. Adding a template neither registers a source nor activates
Copilot on an unselected runtime.

## Selected Native Inspections

Database source selection is a narrowing boundary, not mutation authority.
Schema details and capabilities use fixed canonical read contracts through the
original employee transport. Technical delete-impact inspection additionally
requires independent `copilot.mutation.prepare` and native delete advertisement.
Recheck current source policy and independent grants before and after the native
inspection. No alternative route or provider fallback is permitted.

Return only bounded visible field definitions or target-count/blocked summary.
Exclude defaults, values, related collections, transport metadata and schema
internals; scan the final projection for secrets. An observed operation or an
unblocked preview does not grant execution, prove complete business impact or
establish mutation completion. The conversation owner retains recording/replay
authority and excludes these exchanges from subsequent model history.
