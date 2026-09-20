# copilotKnowledge

Evidence, citation, retrieval, and grounding over Nodics Discovery.

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

Ingestion and retrieval remain disabled in reusable framework defaults. A
project must provide reviewed source versions, repository-root coordinates,
Discovery index configuration, source-provider registrations, and explicit
enablement before runtime use.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

Repository ingestion excludes standard server-generated service/controller/facade `gen` directories and `generated` output before counting files. These are derived copies, not authored repository knowledge. Preserve the existing classification, secret inspection and file/byte bounds; a generated build must not exhaust a source partition budget.
