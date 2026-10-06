# Secure Ingestion And Retrieval Contract

With generation publication enabled, Discovery's current manifest is mandatory
before retrieval and rechecked after search. All writes and search visibility
must be acknowledged before publishing a generation; old chunks are never
overwritten in place by its pending writer. Physical cleanup targets only exact
recorded obsolete generation IDs. Missing manifests and uncertain counts never
fall back to process-local readiness or legacy chunks. See
[generation publication](../examples/generation-publication.md).

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

### Live Database Discovery And Queries

DATABASE sources use native schema discovery under the original employee, not
indexed corpus retrieval. Every descriptor must match the registered module.
Only active canonical safe-search POST declarations for that same collection
are eligible; descriptor metadata never grants arbitrary transport execution.
Recheck source policy after asynchronous discovery before fetching records and
again before releasing the result. Success-shaped error envelopes fail closed.

Conversational collection discovery reuses this inventory and returns selected
metadata only, with observation time and source-policy provenance. Its input is
empty; it cannot request excluded collections, raw schemas or record data.
Like record/incident evidence, the exchange remains outside provider context,
uses the existing recording policy and does not refetch on accepted-turn replay.
See [the live-evidence guide](../examples/live-evidence-conversation.md) and the
database/live-conversation regressions for the public customization boundary.

### Configured Group Selection

When enabled, configured groups narrow employee knowledge by exact tenant and
enterprise assignment, explicit source ceiling, active group membership and
optional per-turn narrowing. Current source policy remains mandatory. Missing
assignments grant nothing; invalid configuration fails closed. Apply the same
intersection to inventory, status and employee management before service delegation.
Filter the registry passed to Discovery retrieval so returned excluded chunks
cannot pass the post-query registry check. Employee index tenant must match the
trusted security context. Do not resend historical messages to the model while
group governance is enabled unless a future owner provides source-aware current
reauthorization. Configuration selection is not a replacement publication engine.

### Employee Source Inventory and Preview

The secured Copilot API constructs trusted employee context before Knowledge
inventory, refresh or preview. Management permission never substitutes for
source visibility. Deny absent/inaccessible sources equivalently before provider
work; require a matching request/index tenant and an explicit enterprise context.
Inventory can show independently authorized disabled definitions without enabling
them. It exposes only bounded provenance and selection metadata, never roots,
content, source secrets or raw provider failures.

Preview reuses ingestion with `dryRun: true`; neither success nor failure may
change active reports or timestamps. Process-local reports are keyed by index
tenant and source; version mismatch means STALE and absent evidence means UNKNOWN.
They are diagnostics, not durable audit or complete index reconciliation evidence.
Group revision activation must reuse nPublish and its qualified providers.

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

### Trusted Startup Delegation

`DefaultCopilotKnowledgeRuntimeService.ingestOnStart()` owns reusable startup
orchestration. It accepts no caller overrides and has no API route. Both
`copilot.knowledge.ingestion.enabled` and `ingestOnStart` must be explicitly true;
disabled execution performs no registry or provider work. A deployment may call
it from its late server `postInit` hook to preserve dependency readiness. The
knowledge module lifecycle only registers providers; it does not start ingestion.

The existing `ingestion.startup` configuration controls source selection and
operational policy: `sourceProject: null` selects all enabled registered sources;
a string narrows to that exact project. Source definitions are governed runtime
records, never an authored project catalog. Deployment owns identity labels,
rejection messages and summary preferences. Environment context supplies
`startup.environment`; later layers may disable or narrow selection. Framework
defaults own the neutral policy and fixed `copilot.knowledge.source.manage`
permission. Neither request input nor model output can change startup authority.

Execution uses the canonical registry, policy, secret inspection, chunking and
Discovery projection path. Invalid policy fails before ingestion; provider
failure stops later sources. `failOnRejectedFiles` rejects startup after the
source report is saved, but does not roll back already projected safe files.
Explicit retries use the existing ingestion path without a second skip ledger.
Optional summary logs contain counts and source/state only, never source text,
rejected paths or credentials. Owner tests run independently of customer code;
project tests retain only configuration adoption and lifecycle delegation checks.

Reusable defaults keep ingestion and retrieval disabled. A project-layer
activation provides transport, Discovery index configuration and service authorization.
Administrators select reviewed immutable source versions and scopes at runtime,
with
operational limits, refresh policy and allowed/denied acceptance evidence.
`UNRESOLVED` source versions must remain disabled.

Repository ingestion excludes standard server-generated service/controller/facade `gen` directories and `generated` output before counting files. These are derived copies, not authored repository knowledge. Preserve the existing classification, secret inspection and file/byte bounds; a generated build must not exhaust a source partition budget.
## Durable Inspection And Authored File Coverage

Refresh execution inspection remains Process-owned and separately scoped to the
target module, tenant, enterprise, project, environment, definition and version.
Employee source/group authorization is required before and after inspection.
Return only minimized execution metadata; no callbacks, retries, raw contexts or
decisions may become browser actions. Latest-action history does not prove
complete attempt coverage or current physical index state.

A registered `**/*` repository pattern covers all supported authored files at
root and nested paths. Apply extension and generated-output exclusions before
counting files against the source budget. Unsupported binary files must never be
decoded as text or counted as successfully ingested knowledge.
