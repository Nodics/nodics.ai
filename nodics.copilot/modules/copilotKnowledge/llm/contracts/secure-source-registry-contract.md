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
