# Source-Scoped Intent Authority

All internal intent and verification transport requires
[exact private entry](private-internal-transport.md) before input mapping.
Capture qualification never substitutes for the source authority below.

The internal communication request, inspection, retry and uncertainty-resolution routes require
signed service token/principal type, service identity, exact authenticated/request
tenant, explicit communication.request permission and signed commsApi module scope.
A new intent additionally requires its configured trusted sourceModule in the same
signed module scopes. A configured allowlist alone is not delegation.

Retry/resolution first validate the service context, then read exactly one stored
COMM intent through the generated owner and authorize its stored source. They do
not trust source names supplied in the body. Missing, duplicated or unreadable
intent evidence refuses the operation without exposing recipient/content. Human
tokens, wildcard-only permissions and unrelated integration credentials cannot
request, retry or resolve another source's messages.

Resolution may include the paired, bounded `sourceModule` and `sourceCode` from
its domain owner. These are binding assertions, not delegation: signed module
scope and trusted-source policy must admit the asserted module before reading;
both fields must exactly match the stored intent before reconciliation. The
runtime still checks current revision, explicit confirmation, reason and operator
reference. Resolution records the decision only and never invokes transport.
The real HTTP controller/facade/runtime regression preserves these checks.

This uses existing nAuth/nRouter runtime credentials and Communication persistence;
it adds no grant registry, delivery queue or source-domain mutation. Later facade
overrides must retain these checks. Configure deployment grants through the existing
runtime authority owner rather than broadening ordinary service groups. Source
availability is not installed token validation or delivery qualification.
The authored communicationIntegrationAuthority fixture covers admission, denial,
private stored-source isolation and effective later-layer narrowing; joint execution
remains required.

## Read-only intent inspection

The service-only route is `POST /internal/communications/:intentCode/inspect`
relative to the existing commsApi module/version prefix. Send `Content-Type:
application/json` and exactly `{}`. Missing, null, array and additional-field
bodies are refused; neither the body nor headers select source authority.
Permission remains explicitly `communication.request`, token type service,
exposure communicationIntegration and signed scopes commsApi plus the stored
sourceModule, with the existing configured trusted-source admission.

The existing controller calls facade `inspectDelivery`; the facade validates the
empty body and admits the signed caller, then uses `authorizeIntent`'s single bounded, nonrecursive,
uncached generated CommsIntent read (page size two for ambiguity detection).
It authorizes that exact record's stored source before passing it internally to
the existing operations service's `inspect` projection. No second read, queue,
authority, provider polling, retry or domain mutation is introduced. This is a
point-in-time owner observation, not a lock or a guarantee against later changes.

The controller returns its normal `{data: {...}}` envelope. The inner result is
exactly `{intentCode, status, revision}`. intentCode matches the requested
`COMM_` plus 64 lowercase hexadecimal digits. revision is a nonnegative safe
integer from persisted evidence, not a local counter or fabricated default.
Supported actual states are ACCEPTED, SUPPRESSED, QUEUED, DELIVERING, DELIVERED,
FAILED, CANCELLED, RETRY_PENDING, UNCERTAIN, DEAD_LETTER and UNCONFIGURED.
No recipient identifier/address, rendered text, variables, proof, hashes,
provider reference, source details or private mutation evidence is projected.
The facade retains a hard three-field ceiling even if an operation override adds
fields; generic configurable operation projections are not used for inspection.

Missing, ambiguous and unauthorized intents use the existing context refusal;
they do not disclose absence or return NOT_OBSERVED. Failed owner reads and
malformed persisted status/revision return stable ERR_COMMS_INTEGRATION_STORAGE,
without raw provider errors. Invalid bodies return ERR_COMMS_INTEGRATION_INPUT.
Inspection never repairs the record or resolves UNCERTAIN into delivery success.
DELIVERED is Communication's persisted state, not independent mailbox receipt.
Commerce may consume this authoritative DTO for its existing notification evidence;
it must not infer financial commitment, fulfillment or retry eligibility from it.

Customize through existing later-loaded facade/operations members to narrow
admission while preserving signed source checks, the DTO ceiling, persisted
status/revision and no-effects guarantees. Runtime grants remain with Profile
and nAuth; adding this route neither creates a grant nor qualifies deployment.
The authored communicationIntentInspection.test.js fixture covers the actual
controller/facade/operations/runtime list with injected generated persistence,
all schema states, denial, malformed evidence, privacy and later-layer narrowing.
Isolated execution is not installed HTTP/token/cache, database or consumer
acceptance; those remain separately qualified in the joint session.

## Static Attempt Diagnosis

`POST /internal/communications/:intentCode/diagnostic` is a separate read-only
operation under the existing commsApi module/version prefix. Its body must be
exactly `{sourceModule, sourceType, sourceCode}`, derived by the calling source
owner from its authorized persisted record, never browser diagnostic selectors.
All three match the stored intent before any attempt read and again after it.
Private admission, explicit `communication.request`, signed service
tenant/module/source authority and uncached response match status inspection.
It is not an employee/browser route and adds no runtime grant. Call through the
authorized source owner; never use generic database access or a retry operation
to inspect an uncertain message. Query selectors and extra body controls refuse.
The existing `/inspect` contract remains exactly three fields.

The normal envelope is `{data: {intentCode, status, revision, diagnostic}}`.
`diagnostic` contains only `classification`, `attempt` and fixed `message` text.
No provider reference/body/error, recipient, credential, link or rendered content
is returned. The facade reapplies the fixed copy projection even if effective
operations add fields. This is a diagnostic observation, not delivery proof,
permission to resend, or a lock against future state changes.

The owner performs a bounded exact intent read with source authorization, then
reads only the current `CommsDeliveryAttempt` selected by persisted attempt
number, exact code, intent and tenant (page size two to detect ambiguity). The
final intent/source/revision recheck refuses concurrent changes. Malformed,
duplicate, foreign or unreadable evidence returns the existing safe storage
refusal. Missing completed-attempt evidence is explicitly ATTEMPT_NOT_RECORDED;
it cannot distinguish an expired claim from other incomplete attempt evidence.

| Classification | Retained evidence meaning |
| --- | --- |
| TRANSPORT_ACK_UNCONFIRMED | Telegram transport/JSON decoding or unrecognized acknowledgement; these causes cannot be separated retrospectively. |
| DELIVERY_INTERRUPTED | Adapter or destination lookup exception; whether a provider send occurred is not established. |
| INVALID_PROVIDER_OUTCOME | Adapter result was not a supported outcome. |
| PROVIDER_ACCEPTED | Recognized provider acceptance on a matching delivered attempt, not independent human receipt. |
| PROVIDER_CONFIGURATION_REQUIRED | Provider credential selection was not qualified before send. |
| DESTINATION_UNAVAILABLE | The destination owner did not qualify an allowed recipient. |
| PROVIDER_UNAVAILABLE | Missing adapter or provider server failure. |
| PROVIDER_THROTTLED | Explicit provider rate-limit refusal. |
| PROVIDER_REJECTED | Explicit provider client-error refusal. |
| ATTEMPT_STATUS_DIFFERS | Latest attempt and current intent differ, including possible later reconciliation; attempt alone is not current outcome proof. |
| ATTEMPT_UNCLASSIFIED | No supported static code matches; raw text is never echoed. |

Diagnosis has no writes, provider requests, retries, resends or uncertainty
resolution. Native review must inspect actual Telegram receipt before recording
delivery, or use the existing separately confirmed uncertainty workflow. The
focused source tests protect private admission, cross-source/tenant refusal,
exact attempt identity, no-effects behavior, failed reads and fixed projection.
Installed runtime execution remains separate from isolated source evidence.

New Telegram `DESTINATION_RESOLUTION_FAILED` attempts map to
`DESTINATION_UNAVAILABLE`: only a thrown Profile destination invocation before
transport starts produces this code. They retain bounded `RETRY_PENDING`, not
automatic resend authority. Historical `DELIVERY_INTERRUPTED` evidence is not
reclassified and remains uncertain about whether a send occurred.
