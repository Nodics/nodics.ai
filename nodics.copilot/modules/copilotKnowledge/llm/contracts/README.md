# copilotKnowledge contracts

- `secure-source-registry-contract.md` defines mandatory registration,
  classification, scope, immutability, and pre-retrieval behavior.
- `secure-ingestion-and-retrieval-contract.md` defines source-provider,
  containment, secret inspection, chunk projection, pre-query filtering,
  post-query reauthorization, evidence, and runtime activation rules.

Generated context is descriptive only and must not weaken these contracts.

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
