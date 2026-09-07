# copilotWorkbench

Conversational schema workbench preparation, validation, preview, and governed API submission.

Product authoring follows `clarify -> prepare -> validate -> preview -> approve
-> execute`. Approval is actor-, tenant-, digest-, revision-, and expiry-bound;
it never grants a missing execution permission. Copilot persists the immutable
plan as an action and, after fresh authorization, submits Product and Pricing
records through the Commerce Staged runtime's secured Schema Workbench API.
Copilot does not call another runtime's generated services or database.

The owning Commerce APIs remain responsible for schema validation, generated
service persistence, idempotency, and audit. Partial multi-schema execution
must remain visible in action audit evidence; a future Workflow-backed batch
adapter may add compensating or atomic domain behavior without moving Commerce
authority into Copilot.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.
