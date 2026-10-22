# commsApi Agent Contract

Verification dispatch uses `DefaultCommunicationVerificationOperationService`.
Keep service identities operation-oriented; API exposure belongs to controllers,
facades and routes. Rename current callers together, never retain a duplicate
API-named service alias. Preserve private admission and projection override tests.

Employee identity transport inherits `communicationApi.employeeInbox.maxResponseBytes`
from this module's properties. Validate the effective positive safe integer
before transport; customer configuration must not supply a missing default.
Keep inherited/overridden/invalid-value coverage in `communicationInboxSource.test.js`.

Employee inbox reads use Profile's private `/employee/inbox-identity` self-read
with the original admitted bearer, exact tenant/Enterprise and canonical
`profile-employee:` recipient. Never infer an employee inbox from a Customer,
purchasing actor or caller selector. Preserve existing customer behavior and
run `test/communicationInboxSource.test.js` for both identity paths.

Follow the root Nodics AI agent contract before changing this boundary:

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow global AI/development guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the Communication group contract: `../../AGENTS.md`.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

Preserve tenant isolation, idempotency, content-free events, provider neutrality, secured callbacks, and domain ownership. Do not use archived Notify code as authority. Update source, tests, documentation, and generated evidence together.

Customer inbox Profile reads must forward the admitted HTTP customer bearer,
matching normalized router credentials and signed access-token customer/tenant
context. Never substitute runtime auth, add service groups/grants, trust body
identity or weaken schema access. Reuse Communication's generated-result parser;
require a successful envelope and unique matching canonical customer before
inbox/source reads. Preserve `test/communicationInboxSource.test.js` and the
[identity contract](llm/contracts/README.md#customer-inbox-identity).

Read [private internal transport](llm/contracts/private-internal-transport.md).
Require exact qualified private admission before reading sensitive internal input;
preserve it into derived verification contexts. Caller privacy flags are not proof.
Rebuild safe errors without private causes; do not impose this gate on ordinary
provider callbacks. Keep stored-verification rollout and source grants unchanged.

Internal intent creation/inspection/retry/resolution require signed service tenant, explicit
permission and both Communication/source module scopes. Retry and resolution
authorize the private stored source before effects; a configured source name,
body authority or generic service group is not delegation. Preserve this boundary
in effective facade overrides and runtime grant qualification.

Resolution's optional sourceModule/sourceCode pair is an exact stored-intent
binding, never payload-derived authority. Validate the pair, require signed source
scope, and compare both with the stored intent before the existing runtime guards.

Inspection reuses the same bounded uncached owner read and stored-source admission.
Require exactly an empty object body and project only intentCode, actual persisted
status and managed revision. No recipient, rendered content, proof, provider data,
send, retry or uncertainty resolution belongs in inspection. Missing/unreadable
evidence is refusal, never NOT_OBSERVED. Read the source-scoped intent contract.

Route-category defaults belong to this capability; deployments supply only intentional overrides.

Static attempt diagnosis is a separate source-scoped `/diagnostic` read; never
widen `/inspect`'s three-field DTO. Its only body is the exact sourceModule,
sourceType and sourceCode binding; compare all three with persisted intent before
attempt reads. Match one exact current attempt and recheck
the intent revision/source after reading it. Return only registered static
classification/copy and attempt number. Missing or conflicting evidence must
remain unknown/refused, never successful delivery or resend authorization.
No raw provider response, exception, destination, credential or message content
belongs in this diagnostic. See the source-scoped intent contract.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Durable-delivery acceptance belongs to Comms API and must use the existing
source-bound request, retry and inspection routes. Register defaults here;
projects provide reviewed scenario selections and runtime service sessions.
Exercise and post-restart inspection are separate phases. Never import a domain
eligibility service, create an acceptance outbox or replay a send during inspect.
