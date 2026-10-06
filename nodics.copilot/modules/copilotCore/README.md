# copilotCore

Optional [natural-language preparation](llm/examples/natural-language-preparation.md)
interprets explicit enterprise, invitation, product, price and collection-centre requests without granting
execution authority or advertising arbitrary Axis automation.
Planning respects the selected provider profile's output limit and the existing
usage reservation; incomplete model output requires clarification.
Product proposals require explicit quantity, decimal price and active choice,
then reuse the existing Product/Pricing owner APIs and confirmation lifecycle.

Conversation supports explicit live database/incident reads through Knowledge
owners and Axis's query form. Results never enter later provider history; legacy
unmarked messages are excluded. Read Knowledge's
[`live-evidence-conversation.md`](../copilotKnowledge/llm/examples/live-evidence-conversation.md).

See [conversation context and Workspace attention](llm/examples/conversation-context-and-attention.md)
for active knowledge selection, broad grant summaries, bounded task attention,
failure behavior, customization and the remaining detailed-access limitations.

Core Copilot request, context, policy, and orchestration contracts.

The personal Workspace projects bounded enterprise-owned conversation activity,
authorized knowledge status, safe model configuration metadata, and explicit
unavailable accounting state. It never invokes a model on page load. Read the
[Workspace operations and migration guide](llm/examples/workspace-operations.md).

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

Confirmed product-plan execution now uses the Product and Pricing canonical
schema PUT APIs through `DefaultModuleService.invokeModule`. See
[the execution contract](llm/contracts/README.md#confirmed-source-record-execution).
The existing confirmation, policy, tenant, remote connection and action audit
remain authoritative; backend selective routes must be deployed before this caller.

Use copilot.api.enabled as the sole conversation API switch; reject retired group/core flags and preserve independent provider, source and permission gates.
## Operation Access

The conversation context exposes inert business-operation explanations for
independent grants, source availability, enablement, owner checks and unsupported
adapters. See [operation access and remediation](llm/examples/operation-access-and-remediation.md)
for user, administrator and customization journeys. Diagnostics never authorize
or execute a business operation.
