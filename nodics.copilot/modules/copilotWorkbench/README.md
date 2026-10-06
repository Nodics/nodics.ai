# copilotWorkbench

[Workflow trigger commands](llm/examples/process-triggers.md) provide reviewed
create/update/archive and explicit execution through native Workflow. They do
not create Cron schedules. Original receipts preserve restart and uncertainty
inspection without replay; new writes are independently default-disabled.

[Human task commands](llm/examples/process-tasks.md) provide reviewed claim,
assignment, completion and cancellation through Workflow. Native actor policy,
original employee identity and private command receipts remain authoritative;
uncertain decisions are never retried. The target is independently disabled by default.

[Governed selected-schema actions](../../../nodics.docs/docs/pages/nodics.copilot/governed-schema-actions.md)
provide opt-in single-record generated create, update, and delete for exact
Knowledge-selected and deployment-allowlisted collections. nDatabase retains
descriptor, authoring, validation, concurrency, persistence, and private receipt
authority. Wildcards, bulk mutation, business aggregate forms, arbitrary routes,
and automatic replay are excluded.

[Order-notification operations](../../../nodics.docs/docs/pages/nodics.copilot/order-notification-operations.md)
provide bounded workspace inspection and explicit retry of eligible Digital Core
delivery intents. The retry review binds the current order revision and exact
intent set. Uncertain outcomes are inspected once and remain unconfirmed; Copilot
never replays the retry automatically.

[Original Business Results and Safe Continuation](../../../nodics.docs/docs/pages/nodics.copilot/original-business-results.md)
documents opt-in native receipts, original-result inspection and fresh approval
of only never-started rows. Unknown and completed mutations are never replayed.

The [secure coupon guide](llm/examples/secure-coupon-fulfillment.md) covers masked
input, Commerce validation, immutable review, original-employee execution and
read-only receipt reconciliation. It is disabled until explicitly configured.

The [collection-centre guide](llm/examples/collection-centres.md) covers explicit
Waste preparation, full review, configuration, denial and uncertain outcomes.

Read the [governed action contract](llm/contracts/README.md) and
[step-by-step operator and customization guide](llm/examples/governed-actions.md).
For Profile-owned creation, read the [enterprise and invitation guide](llm/examples/enterprise-invitations.md).

Standalone existing-enterprise invitations and price rows use the same review,
native execution and receipt owners. Both admission flags default off. See the
[canonical business guide](../../../nodics.docs/docs/pages/nodics.copilot/standalone-business-actions.md)
for configuration, operator steps, recovery and local Ollama validation.
It documents explicit JSON, full-field review, pending invitations, runtime
enablement and uncertain outcomes, not active employee creation.

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
