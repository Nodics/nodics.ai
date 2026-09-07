# copilotPolicy

Clarification, mutation approval, safety, tenancy, audit, and execution policy.

This module produces provider-neutral, fail-closed decisions for knowledge
retrieval, tool exposure, field access, export, confirmation, and execution.
It consumes trusted Nodics identity and authorization context; the model never
grants authority, and the owning secured domain API always performs the final
authorization check.

The policy service currently normalizes immutable security contexts for public
Nexus, authenticated Nexus customers, Axis employees, and system identities.
It makes explicit allow/deny decisions for classified sources and risk-classed
capabilities, including channel, tenant, enterprise, customer, project,
environment, permission, role, and group restrictions. Public contexts discard
presented permissions and can receive only explicitly public read-only
capabilities and Online public sources.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.
