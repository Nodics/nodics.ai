# copilotKnowledge contracts

[Runtime knowledge configuration](runtime-knowledge-configuration-contract.md)
defines the permanent source-selection boundary, runtime discovery, durable
administration and migration requirements. No per-accelerator source catalogs.

[Recorded manual refresh](../examples/recorded-manual-refresh.md) preserves
employee review, stable Process identity, default-disabled admission and exact
read-only original-attempt inspection. No parallel jobs or synchronous fallback.

Reviewed cleanup is source orchestration over Discovery, not another index owner.
Require independent cleanup/management grants, fresh scope/routing, revision-bound
review, exact authorization/completion receipts and published-origin eligibility.
Private receipt CRUD stays disabled. Read [reviewed cleanup](../examples/reviewed-cleanup.md).

Legacy retirement and permanent erasure are separate commands. Erasure requires
its own default-disabled admission and grant, acknowledged original retirement,
fresh source/replacement authority and nSearch-qualified historical writer
decommissioning. Discovery owns the one-shot claim on the original private
receipt; uncertain outcomes remain inspection-only. Never infer completed erasure
from absence alone or send physical index/key identities to Axis. See the
[operator guide](../../data/docs-v001/records/documentation/copilotKnowledgeDocumentationComponentData.js#permanently-remove-a-retired-index).

- `secure-source-registry-contract.md` defines mandatory registration,
  classification, scope, immutability, and pre-retrieval behavior.
- `secure-ingestion-and-retrieval-contract.md` defines source-provider,
  containment, secret inspection, chunk projection, pre-query filtering,
  post-query reauthorization, evidence, and runtime activation rules.

Generated context is descriptive only and must not weaken these contracts.

Scheduled source refresh follows [Process-backed refresh](../examples/process-backed-refresh.md).
Only a verified Workflow runtime can claim the exact opaque action. Service source
permissions, explicit SYSTEM admission, enterprise group ceilings, configured
definition version and source fingerprint remain independent gates. Process owns
durable instance/action history; process-local Studio status is not that history.

## Runtime Readiness

Copilot Knowledge owns assistant knowledge readiness for source registration,
ingestion/indexing state, retrieval enablement, and model-provider configuration
visibility. BackOffice may aggregate this readiness and Axis may render it, but
neither should infer whether Assistant can answer from UI state or documentation
publication state alone.

Readiness payloads must remain operator-safe:

- source counts, indexed/not-indexed/failed counts, and last refresh time;
- enabled retrieval/ingestion/source-registry flags;
- configured provider count, selected provider code, model configured flag, and
  model name when safe;
- bounded blocker metadata with governed repair operation/action descriptors.

Provider secrets, API keys, private prompts, raw evidence documents, and
unauthorized source paths must never be returned in readiness.
