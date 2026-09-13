# copilotCore

Core Copilot request, context, policy, and orchestration contracts.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

Confirmed product-plan execution now uses the Product and Pricing canonical
schema PUT APIs through `DefaultModuleService.invokeModule`. See
[the execution contract](llm/contracts/README.md#confirmed-source-record-execution).
The existing confirmation, policy, tenant, remote connection and action audit
remain authoritative; backend selective routes must be deployed before this caller.
