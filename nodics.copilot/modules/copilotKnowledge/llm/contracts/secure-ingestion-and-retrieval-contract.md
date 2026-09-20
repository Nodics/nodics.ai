# Secure Ingestion And Retrieval Contract

Copilot coordinates knowledge preparation; `nodics.discovery` remains the
source-provider, projection and runtime-search authority, while nSearch remains
the provider/engine authority.

## Ingestion

Only a `SYSTEM` identity with `copilot.knowledge.source.manage` may start
ingestion. The requested source must already be enabled in the immutable source
registry. Its provider must be registered by source type through Discovery.

The repository provider is restricted to non-public sources. It requires an
absolute environment-provided root for the registered repository, resolves the
canonical root, never follows symlinks, rejects path escape, applies configured
include/exclude paths and extensions, and enforces file-count, per-file byte and
per-source byte limits. Runtime-generated `temp`, dependency, build, coverage,
distribution, and generated-LLM trees are excluded by the reusable defaults.

Public content must come from an owning publication-aware provider that proves
the effective item is public and Online. A repository path, filename, Markdown
heading, or source author cannot promote content to `PUBLIC`.

Every candidate file or record must pass secret inspection before chunking.
Rejected reports contain only relative paths and stable finding codes, never
matched values. Accepted content is normalized into deterministic bounded
chunks with SHA-256 digests, source version, provenance and complete security
metadata. Projection uses `DefaultDiscoveryDocumentBuilderService` and
`DefaultDiscoveryDocumentProjectionService`; Copilot must not create an
independent index client.

## Retrieval

Retrieval requires a normalized security context and an immutable effective
registry. Before calling Discovery, Copilot rebuilds the query scope through
`copilotPolicy`. A scope with no allowed sources returns insufficient evidence
without calling Discovery.

The search request must restrict owner type, index-configuration identity,
source codes, classifications and channel. User query text may affect lexical
or semantic matching only; it cannot supply or widen security filters.

Every returned projection is untrusted and must be reauthorized. Its source
must still be enabled and accessible, and its source code, classification,
version, repository, project, module, owner, chunk identity and content digest
must match the current registry/projection contract. Invalid, stale or injected
records are dropped before evidence assembly.

Evidence and citations expose only the allowlisted title, bounded excerpt,
score and provenance fields. Provider prompts may consume this already-scoped
evidence later, but provider selection never changes retrieval authorization.

## Runtime Activation

Reusable defaults keep ingestion and retrieval disabled. A project-layer
activation must provide reviewed immutable source versions, repository roots or
domain providers, Discovery index configuration, service authorization,
operational limits, refresh policy and allowed/denied acceptance evidence.
`UNRESOLVED` source versions must remain disabled.

Repository ingestion excludes standard server-generated service/controller/facade `gen` directories and `generated` output before counting files. These are derived copies, not authored repository knowledge. Preserve the existing classification, secret inspection and file/byte bounds; a generated build must not exhaust a source partition budget.
