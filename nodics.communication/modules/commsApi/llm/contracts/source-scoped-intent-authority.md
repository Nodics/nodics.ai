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
It is NOT RUN in this source-only batch. Behavioral, installed HTTP/token/cache,
database and consumer acceptance remain for the joint session.
