# nodics.copilot Agents

## Inheritance

- Follow the repository agent contract: `../AGENTS.md`.
- Follow global AI/development guidance:
  `../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This group owns provider-neutral Copilot orchestration. It must not duplicate
Discovery search/index authority, nData import/export, Schema Workbench APIs,
Workflow, or domain business logic. Domain modules contribute permissioned
adapters; Axis consumes `copilotApi` and never calls model providers directly.

Every ambiguous material request must pause for conversational clarification.
Every mutation must be prepared, validated, previewed, explicitly confirmed,
executed through the owning Nodics API, and audited. External providers remain
disabled unless an effective runtime selects an adapter and secret resolver.

## Mandatory Security Governance

Before implementing or enabling any knowledge source, channel, capability,
tool, export, confirmation, or mutation, read and apply
`llm/contracts/copilot-security-governance-contract.md`. This is a
non-configurable security invariant for every child module and customer
adapter. The model interprets intent but never decides authorization.

Security must fail closed and be enforced before retrieval, before the provider
receives its tool catalogue, and again at operation execution. Public Nexus
sessions are public-read-only and must never receive internal/restricted
sources, employee/user/customer records, exports, or create/update/delete
tools. Authentication, model selection, prompt text, retrieved instructions,
or confirmation must never elevate authority.

Every implementation must prove allowed and denied paths. A test that merely
redacts an unauthorized final answer is insufficient; tests must prove the
forbidden source was not retrieved and the forbidden tool was not exposed or
invoked.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.
