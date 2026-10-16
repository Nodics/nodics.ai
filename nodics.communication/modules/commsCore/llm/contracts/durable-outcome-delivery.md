# Durable outcome delivery

## Non-HTTP Private Delivery Entry

Telegram acknowledgements that decode to null, primitives or arrays return
`UNCERTAIN` with `TELEGRAM_UNCERTAIN`, just like an unconfirmed transport response.
They never prove a no-send, authorize an automatic retry or supply a delivery
reference. Later-layer provider overrides must preserve this ambiguity boundary.

A thrown Profile destination invocation is caught strictly before Telegram
transport and returns `RETRY_PENDING` / `DESTINATION_RESOLUTION_FAILED`, without
private error text. This does not retry automatically or reinterpret earlier
`DELIVERY_INTERRUPTED` evidence. All post-transport ambiguity remains uncertain.

`deliver(request, code)` builds a detached runtime-owned tenant context and enters
the existing Logger `runSensitiveOperation` before reading private stored intents,
rendered content, resolving contacts or calling adapters. Only a bounded existing
enterprise routing code is retained; browser body, credentials and arbitrary
claims are not copied. `deliverPrivate` asserts exact admitted identity before
its first read. The operation includes storage diagnostics, provider execution
and outcome persistence, preserving original immutable content, claims, attempt
ceilings and uncertain-send reconciliation. Failures leaving this boundary use
the fixed `COMMUNICATION_PRIVATE_DELIVERY_UNCONFIRMED` error without private causes.

This is required even for queued workers without HTTP context. It does not
upgrade an incoming HTTP request, qualify external APM/SDK capture or enable a
provider. The existing request-privacy qualification remains false by default;
unqualified workers fail before intent reads/claims/sends. Sender credentials,
source grants, templates and provider enablement remain separately governed.
The [private worker fixtures](../../test/communicationPrivateWorkerDelivery.test.js)
and updated runtime fixtures are deferred, NOT RUN. Real SDK/APM suppression and
provider acceptance require the joint deployment session; direct legacy sandbox
injection is not claimed to be a qualified production delivery path.

`DefaultCommunicationRuntimeService` binds existing Communication schemas and Core primitives to generated repositories and configured provider adapters. Internal requests require service authentication and `communication.request`; trusted source-module policy and active versioned templates are mandatory. Stable idempotency identity is hashed; replay with a different payload is rejected. Inbox rows belong to canonical Profile customer codes, and customer reads resolve that code before querying.

Intent and delivery attempt records are the delivery authority. Revisioned leases serialize sends. Web IN_APP delivery uses an idempotent inbox key. Telegram resolves a currently eligible Profile link immediately before sending, validates the configured logical bot credential reference through runtime configuration and sends literal text. Successful delivery evidence stores provider reference, never secret credentials. Suppression is evaluated before sending.

Known rejected/transient failures enter bounded RETRY_PENDING with a due time and attempt ceiling. Retry is an explicit authorized operation; this binding does not install a scheduler. A timeout or expired external send lease enters UNCERTAIN and is never blindly resent. An authorized exact-revision reconciliation records evidence/reason and one of MARK_DELIVERED, AUTHORIZE_RESEND or CANCEL. Resend authorization does not itself send and cannot bypass the attempt ceiling. Manual MARK_DELIVERED is operator evidence, not a verified Telegram callback.

Domain decisions and settlement remain independent of notification failure. eWaste stores only the intent/status reference and derives source channel, recipient and public reviewer comment from the persisted submission. No customer overlay owns a second ledger or inbox.

## Reconciliation Acknowledgement Recovery

After a resolution commits, a lost acknowledgement or failed domain-pointer save
must not strand the original command. `resolveUncertain` recognizes the saved
reconciliation entry for the exact original intent revision, action, trimmed
reason and operator module/schema/code. An exact replay returns the current safe
owner projection without another write, authorization or transport. Altered
commands conflict, and the API still qualifies signed module/tenant/permission
and exact stored source on every invocation. Later states, including a subsequent
UNCERTAIN attempt, are returned honestly; replay never restores RETRY_PENDING or
authorizes a second resend. A genuinely new decision requires its new exact
revision and all ordinary admission and attempt limits.

Domain owners may repair their stale pointer from that acknowledgement using
their own current scope, source identity and CAS checks. They may not regress a
newer projection or infer delivery from resolution success. Runtime tests and
eWaste's real controller/facade composition tests cover all three decisions,
lost owner/gateway acknowledgement, source-write failure, conflicting actor/
reason/action, later uncertainty and zero provider effects. These are isolated
source tests, not live reconciliation. Provider customizations retain the same
durable owner protocol; no new configuration or permissions are required.

Validation: `test/communicationRuntime.test.js` exercises replay, conflicting payloads, concurrency, retry timing, suppression, uncertain sends and explicit reconciliation. Actual Telegram client acceptance is a deployment test.
