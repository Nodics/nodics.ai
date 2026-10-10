# copilotKnowledge

The [Knowledge Progress and Recovery guide](data/docs-v001/records/documentation/copilotKnowledgeDocumentationComponentData.js)
also covers reviewed dedicated legacy-index retirement, verified replacements,
native provider barriers, original inspection and retained-data limitations.

For employee-reviewed Process starts and original execution inspection, see
[recorded manual refresh](llm/examples/recorded-manual-refresh.md). This opt-in
journey reuses canonical Process evidence and does not backfill legacy runs.

[Source events and incremental refresh](llm/examples/source-events-and-incremental-refresh.md)
describes the default-disabled scoped event bridge, canonical Process replay,
explicit workflow release and durable unchanged-source detection. Changed sources
still publish complete generations; no per-file cache or watcher is installed.

[Pending writer recovery](llm/examples/pending-writer-recovery.md) explains the
default-disabled review/confirm journey, independent permission, minimum age,
durable audit and Discovery retirement CAS. No worker stop or deletion is implied.

Infrastructure readiness awaits the same scoped durable generation and physical
count evidence as Studio when generation publication is enabled. Read the
[readiness guide](llm/examples/durable-readiness.md) for bounded coverage, unresolved
writers, cleanup debt and the distinction from refresh-job or provider health.

[Reviewed cleanup recovery](llm/examples/reviewed-cleanup.md) documents the
permissioned Studio review/confirm journey, private maintenance receipts and
operator-only legacy/abandoned debt.

[Complete knowledge generations](llm/examples/generation-publication.md) documents
opt-in atomic refresh, durable/physical status, supported text formats, exact
obsolete cleanup, uncertain-writer inspection and migration limits.

[Live evidence in conversation](llm/examples/live-evidence-conversation.md)
documents the business-user database/incident query form, owner authorization,
recording/model-history isolation, setup, recovery and customization.

Read the [Process-backed refresh guide](llm/examples/process-backed-refresh.md)
for definition/source authorization, service grants, schedule setup and uncertain
outcomes. Workflow/Cronjob remain execution/schedule owners; this adapter does not
add a scheduler or durable per-source progress UI.

Live collection selection and inspection use the domain's authorized schema and
safe-search APIs. See [Live Database Sources](llm/examples/live-database-sources.md)
for registration, exclusions, Axis steps, contracts, recovery and customization.
Selected collection fields/capabilities and technical deletion-impact previews
also run through these native owners in conversation. See the canonical
[collection inspection guide](data/docs-v001/records/documentation/copilotKnowledgeDocumentationComponentData.js).
An impact preview is not deletion, business cancellation or permission to execute.

[Runtime-bound partitions](llm/examples/runtime-source-partitions.md) reuse the
actual nConfig load order and preserve module provenance for code and internal
documentation. Explicit source registration and current permissions still apply.

The opt-in [external incident evidence foundation](llm/examples/external-incident-evidence.md)
queries a registered observability owner through Discovery. It preserves bounded
scope, original identity, durable owner audit and incomplete coverage. A data lake
or conversation investigation adapter is not deployed by this capability.

Settings authoring follows the
[administration guide](../copilotPolicy/llm/examples/governed-administration.md).
Source-policy fingerprints invalidate stale content before retrieval; refresh
legacy chunks before claiming readiness. This is not physical index deletion.

Evidence, citation, retrieval, and grounding over Nodics Discovery.

Knowledge Studio now projects an authorized source inventory and read-only
ingestion preview. See the [step-by-step guide](llm/examples/knowledge-studio.md)
for permissions, status meanings, customization, recovery and deployment limits.
Group authoring and revision activation are not implied by source preview.

Configured groups now restrict employee retrieval to active assigned groups and
an explicit tenant/enterprise source ceiling. See the [group setup and selection
guide](llm/examples/knowledge-groups.md). This does not grant source permissions
or introduce a separate publication authority.

The implemented source registry validates immutable source definitions before
retrieval. Definitions require repository/project/module provenance, version,
included paths, owner, source type, classification, channel scope, secret-scan
policy, and any customer or tenant boundaries. It rejects unclassified sources,
weak classification, unpublished public content, duplicate codes, unscoped
customer projects, and missing secret-scan requirements.

`DefaultCopilotKnowledgeSourceRegistryService` produces a policy-filtered query
scope containing only authorized source codes and classifications.

The implemented ingestion path reads registered non-public repository sources
through bounded roots, rejects symlinks and path escapes, applies file and byte
limits, detects high-confidence secrets, creates deterministic chunks and
digests, and writes only safe projections through `nodics.discovery`. Raw
repository files cannot become public sources; published public documentation
requires a publication-aware provider from the owning documentation domain.
Each repository partition may narrow its own paths, exclusions, extensions,
file count, per-file bytes, and total bytes without widening the global policy.

The implemented retrieval path rebuilds the authorized source scope before
search, sends source/classification/channel filters to Discovery, reauthorizes
every returned projection, validates provenance and digests, and exposes only
allowlisted evidence and citations. The selected LLM provider is not involved
in either authorization decision.

Ingestion and retrieval remain disabled and source selections empty in reusable
framework defaults. Admins register active runtime module partitions through
governed administration, not application properties. nConfig supplies framework
and project roots; nDynamo owns durable selections and nSystem restores them.
See [runtime knowledge configuration](llm/contracts/runtime-knowledge-configuration-contract.md)
and [runtime registration](llm/examples/runtime-source-partitions.md).

Trusted deployment hooks may delegate late startup ingestion to
`DefaultCopilotKnowledgeRuntimeService.ingestOnStart()`. Optional startup narrowing
and operational policy live in `copilot.knowledge.ingestion.startup`; source
selections remain governed runtime records. Reusable
orchestration stays here. See the [startup contract](llm/contracts/secure-ingestion-and-retrieval-contract.md#trusted-startup-delegation)
for opt-in gates, failure semantics and authorization boundaries.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

Repository ingestion excludes standard server-generated service/controller/facade `gen` directories and `generated` output before counting files. These are derived copies, not authored repository knowledge. Preserve the existing classification, secret inspection and file/byte bounds; a generated build must not exhaust a source partition budget.
## Durable Refresh Inspection

Administrators can independently inspect [maintenance receipts](llm/examples/maintenance-receipts.md)
for cleanup and pending-writer retirement. These bounded read-only records remain
available with write gates disabled; authorization alone never proves completion.

Knowledge Studio can inspect existing Process-backed source refresh executions.
See [the step-by-step history guide](llm/examples/refresh-execution-history.md)
for setup, permission boundaries, uncertain outcomes and customization. This does
not provision schedules or replace Process incident recovery.

Source managers can optionally prepare a fingerprint-bound inactive schedule
through the existing Cron owner. See [source-aware schedule setup](data/docs-v001/records/documentation/copilotKnowledgeDocumentationComponentData.js#prepare-a-draft-from-knowledge-studio).
`studio.sourceScheduleDraftsEnabled` defaults false; the Axis surface additionally
requires authorized Cron navigation and an exact approved target binding. Saving
a draft never proves activation or bypasses source callback admission.

## Authenticated Erasure Acceptance

The [local authenticated acceptance guide](llm/examples/authenticated-erasure-acceptance.md)
covers disposable Profile operators, actual source publication, native retirement
and removal, gate-disabled restart inspection and separately owned Axis browser
testing. It distinguishes real component evidence from full application admission.
