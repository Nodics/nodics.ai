# copilotCore contracts

Deterministic module inventory routes apply to counts, lists and exports.
Explanations of module ownership/responsibility stay on governed knowledge
retrieval, even when the question contains "which" or "what". This routing
decision does not grant source access or let the model choose a live API.

Natural-language preparation is an opt-in interpreter, not a tool registry or
executor. Filter the catalogue before provider invocation, account through the
existing usage owner, validate returned literals against the human input and
the known preparer, and recheck permissions after inference. Unsupported or
invented material values require clarification. Every mutation still requires
complete review, confirmation and owner API authorization.
Resolve the output ceiling through the existing Provider configuration owner;
intent planning may narrow it to 2,048 tokens but must never exceed it.

Live-read conversation commands delegate to Knowledge's existing database and
incident services with the original employee and selected groups. They never
invoke a model or business mutation. Both messages in the exchange are excluded
from provider history; only explicitly eligible messages enter historical model
context. Legacy unmarked records fail closed. Recording/transcript access remains
independently governed. See Knowledge's live-evidence-conversation guide.

Product/PriceRow owner writes explicitly use `maxAttempts: 1`; transport retry
defaults must not replay an ambiguously acknowledged business mutation.

Generated documentation entry for copilotCore.

## Confirmed source record execution

Opt-in Product language extraction and typed `commerce.product.create` commands
reuse Request's `productCommandInput` and the existing Product/PriceRow plan.
They require explicit integer count, exact decimal string, required identifiers,
and boolean active choice. Omitted lifecycle is clarification, not activation.
The provider only proposes known inputs; it chooses no transport or permissions.
Before each native row, recheck current API admission, confirmation policy and
unchanged configured target. A completed draft write is not reference resolution
or publication. See [the product journey](../examples/natural-language-preparation.md#products-and-their-prices).

`DefaultCopilotOrchestrationService.createOwnedSchemaRecord` invokes the configured
owning module remotely with PUT on the lowercased schema resource (`/product`,
`/pricerow`) and the raw model body. It preserves connection name, tenant,
`targetAuthority` and the Idempotency-Key header. There is no Workbench mutation
fallback. Backend selective schema routes must exist first; rejection propagates
without an alternate write. The existing approved plan, fresh policy check,
confirmation, tenant binding and action audit remain unchanged.

The former `createOwnedWorkbenchRecord` extension point is replaced by
`createOwnedSchemaRecord`. Move overrides to that existing orchestration helper;
custom route paths can be handled there while retaining canonical API semantics.
Do not introduce a new frontend/backend operation registry. Existing target-module
and connection configuration remains the deployment boundary. Schema writes are
Staged-only; publication is a separate domain operation. Idempotency forwarding
is not durable replay protection and ordered plan writes are not a transaction.
## Non-Authoritative Access Explanations

Core may compose bounded initial-prerequisite diagnostics from existing grants
and policy-filtered source metadata. It must not expose hidden sources, query
records, register tools, infer domain permission from Copilot permission, or
convert a diagnostic to an executable action. Missing grants precede configuration
or source detail. A satisfied initial check means `OWNER_CHECK_REQUIRED`, never
ready/authorized. Unimplemented adapters must be distinct from missing access.
