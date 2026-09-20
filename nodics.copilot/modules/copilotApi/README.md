# copilotApi

Secured Copilot HTTP and streaming API boundary for Axis and future channels.

The current employee API exposes owned conversation history and replay,
turn submission and cancellation, governed knowledge status/refresh, product
plan preparation, and confirmation get/approve/reject/execute operations. Each
route declares a specific Copilot permission. Axis renders structured citation,
usage, export, clarification, and confirmation events; it does not infer
authorization or execute a mutation directly.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
