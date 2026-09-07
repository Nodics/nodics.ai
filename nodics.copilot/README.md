# nodics.copilot

Provider-neutral governed conversational assistance and agent execution framework.

Copilot supports Axis help and discovery, query/export, guided Schema Workbench
authoring, customer-experience assistance, and future conversational commerce.
It never makes a model authoritative for Nodics data or business mutations.

All channels are least privilege. Public Nexus assistance is limited to
explicitly public, published knowledge and public read-only capabilities.
Customer and Axis sessions receive only identity-, tenant-, project-, record-,
field-, and permission-scoped sources and tools. Authorization is enforced by
Nodics before retrieval, before provider tool exposure, and again by the owning
secured API at execution; confirmation never grants permission.

It extends only `nodics.foundation`. Knowledge consumes `nodics.discovery`,
while Platform, Commerce, WCMS, and Engagement expose permissioned adapters.
Axis consumes `copilotApi` and continues to own browser interaction only.

External providers are disabled by default. Mutations follow the governed flow
clarify -> prepare -> validate -> preview -> confirm -> execute -> audit.

Child modules own core orchestration, providers, conversations, capabilities,
policy, knowledge, workbench execution, evaluation, and the secured API.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

The mandatory security authority is
`llm/contracts/copilot-security-governance-contract.md`.
