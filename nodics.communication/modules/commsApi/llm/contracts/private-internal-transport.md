# Private Internal Communication Transport

## Protected Actual Routes

These existing commsApi routes declare requestPrivacy.sensitive true and cache
enabled false, under the normal module/version prefix:

- POST /internal/communications: source-bound durable intent request.
- POST /internal/communications/:intentCode/inspect: original stored status/revision.
- POST /internal/communications/:intentCode/retry: original frozen-intent retry.
- POST /internal/communications/:intentCode/resolution: authorized uncertainty resolution.
- POST /internal/verification/commands: existing purpose-bound verification RPC.

Verification ISSUE/VERIFY/CONSUME/RECEIPT/REPLACE/CANCEL remain on the existing
command route. Status/receipt evidence uses those existing operations and intent
inspection; no parallel status endpoint or challenge/intent registry is introduced.
The shared operator retry route also declares private capture. Provider callback
and customer inbox routes retain their existing admission, metadata and mappings;
ordinary callbacks do not gain a private-entry prerequisite from this increment.

## Exact Entry And Owner Context

DefaultCommunicationApiController checks DefaultLoggerService.assertSensitiveRequest
on the exact admitted request before reading or copying httpRequest, payload,
query, route identifiers or proof/destination values. Privacy absence/unqualified
capture refuses before facade dispatch. Caller body/header flags are not entry
proof. Only the existing qualified privacy middleware or trusted private owner
invocation may establish admission. Sensitive responses receive Cache-Control
no-store; normal controller mappings preserve the original admitted request.

DefaultCommunicationApiFacade additionally requires actual exact-object capture
protection for private operations and source/stored-intent admission. Overrides
cannot substitute requestPrivacy flags or an ordinary service group for that
proof. Existing signed source modules, tenant and explicit permission checks
remain unchanged. Successful capture is not authorization to request or inspect
another source's intent and does not qualify stored verification.

The verification API service refuses unprotected input before command parsing.
Only after its exact private, service-principal, tenant, explicit-permission and
both signed-module checks pass, its authorize operation calls the existing
`DefaultCommunicationRuntimeService.context(request)` storage owner. Signed
service JWTs need no user groups. The derived context carries Communication's
`serviceAccountUserGroup` storage authority; it never mutates the request/JWT,
copies that group into issued credentials or relaxes generic schema access.
Correlation is retained, then the adapter calls
inheritRequestPrivacy(context, request) and requires the derived context to retain
actual admission before dispatching the stored verifier. This adds no secret,
proof or address logging. Purpose, single-use, replay, receipt projection and
service/source-grant rules remain owned by their existing capabilities.
Missing storage-context ownership fails closed. Pure and directly invoked
verification-owner methods retain their existing caller-context policy; only
this authorized RPC adapter performs the storage projection. Later-layer runtime
context overrides remain selected through SERVICE and must preserve tenant and
private-context boundaries.

Trusted outbound owners should use the existing runSensitiveOperation boundary
and protected ModuleService transport. They must not turn an unprotected incoming
HTTP request into a newly admitted entry after its sensitive input was captured.
HTTPS selection and explicit loopback policy remain with existing transport/owner
configuration; this incoming increment creates no connection or provider mapping.

## Safe Errors And Extension

Private controller failures rebuild a fresh NodicsError from fixed existing
Communication integration or verification vocabularies only. Unknown driver,
provider and capture errors map to fixed context/storage refusals. Original
messages, metadata, errInfo, causes and stacks are never attached. Verification
owner/projection failures are also normalized by the service. Legitimate bounded
verification response secrets/proofs retain their operation-specific projection;
privacy enforcement does not alter their protocol or expose them through inspection.

Later controller/facade/service layers may narrow admission and projection, but
must preserve exact private proof, signed authority, context inheritance, safe
errors and no-cache behavior. No rollout/configuration or grant is changed here;
stored-verification default-OFF gates remain in force. Qualified capture, runtime
grants, TLS and installed acceptance remain deployment prerequisites.

## Deferred Evidence

The storage-context correction is covered by the executed persisted-verification
RPC fixture: real controller/facade/adapter, runtime context, verifier and
Foundation schema access with Communication's operational access policy. It
rejects the original group-free claims at the schema boundary and admits the
owner-projected context, without mutating those claims. Unauthorized/private-
unadmitted calls cannot project a storage context. Persistence is an injected
generated-service fixture, not live storage, mail or browser qualification.

communicationPrivateTransportContract.test.js is authored, NOT RUN. It covers
actual route metadata, refusal before secret getters are read, rejected caller
flags, same-object facade mapping, safe error reconstruction, inherited verifier
context and unchanged ordinary callback behavior. Existing inspection, integration
authority and verification customization fixtures now model legitimate private
admission, without enabling any runtime. Static checks prove syntax/format/source
contracts only. No behavioral suites, server, database, send or Git operation is
authorized by this increment. Joint acceptance must verify middleware admission
before logging, suppressed request/response capture, denied grants, frozen retry,
verification receipt/status and real callback transport.
