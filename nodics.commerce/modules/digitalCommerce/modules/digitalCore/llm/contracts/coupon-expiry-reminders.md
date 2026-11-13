# Coupon Expiry Reminders

Owner properties define `couponReminders.validation` ranges: lead time
1..31536000 seconds, candidates 1..1000 and trigger age 1..3600 seconds.
`couponReminders.delivery.validation` and `giftNotifications.validation` each
define timeout 1..60000ms and recipients 1..100. Consumers use those definitions,
not inline replacement bounds; incomplete/inverted ranges and invalid values
refuse. Intentional overrides are tested through the real settings consumers.
No range change enables delivery, supplies a recipient or qualifies a provider.

## Ownership

Digital owns coupon eligibility, central timing, source evidence and the
Cron-to-Process action. Promotion owns coupon state/rights. Profile owns canonical
identities, current staff authorization, explicit recipients and preferences.
Communication owns the only durable intent, frozen rendering, inbox, claim,
suppression and retry history. No value movement, contacts or second outbox.

Profile placement reuses its governed Enterprise notification-selection pattern,
not transfer notifications' Customer-only recipient or actor assumptions. Coupon
staff are explicit Employee references selected by
`DefaultProfileNotificationRecipientService.select`. Current native/accepted
membership, persisted active group ancestry and a governed Digital read permission
grant are required independently of current Enterprise scopes, including DENY.
An ALLOW scope alone grants no permission. Revoking the persisted permission also
suppresses an unsent retry. Missing/corrupt group or permission evidence remains
unconfirmed, not a successful empty roster. The purchaser is never a fallback. Business
selections stay on governed Profile records, not runtime properties.

## Execution

`DefaultDigitalCommerceCouponReminderService.sweep(request, execution)` implements
`digitalCore.couponExpirySweep`. The owner declaration uses the existing Process
remote ACTION protocol, targeting COMMERCE. Cron's `jobDetail.processTrigger`
starts the reviewed Process. Digital accepts only an opaque instance/execution
handle, claims its single-use retained Process context, then scans the selected
business Enterprise. `sweepCallers` must match the original signed runtime and
reviewed business partition; headers and token namespaces remain unchanged.
An optional reviewed `entitlementCode` narrows both eligibility reads. No definition,
allowed action, schedule, grant or template selection activates by default.

Require signed workflow/Digital scope, tenant/Enterprise aliases, Cron provenance,
bounded trigger age and empty payload. Completely read bounded entitlement pages
and exact current Promotion coupon, policy, owner, committed Checkout and delivery.
Only active unused delivered/claimed fixed-expiry units inside the window qualify.
NONE, expired, redeemed, revoked and outside-window units do not. Certificate-only
purchases do not require Payment. Incomplete/contradictory evidence refuses.

Occurrences hash tenant, entitlement and expiry, independent of scan time or
lead-time changes. Per-recipient/channel keys derive from that occurrence.
Profile callbacks independently verify Digital source before resolving recipients.
Communication's `isDispatchEligible` hook repeats current source and recipient
checks before claim and immediately before send, including retries. Changes
suppress unsent intents, never readdress or re-render their frozen contents.

Process records `SKIPPED/NO_ELIGIBLE_RECIPIENT`, `SKIPPED/SOURCE_INELIGIBLE`, or
technical `UNCONFIRMED`, plus accepted Communication receipts. `RECORDED` is not
necessarily delivered. Unavailable Profile is never an empty roster. A later sweep
reconciles lost acknowledgement with the same key; Communication's worker retries
pending intents and preserves uncertain-send review rules. Messaging never changes
purchase, expiry, supply, lifetime caps or redemption rights.

## Safe scheduled-action diagnostics

`notify` retains `failureStage` only on UNCONFIRMED: POLICY, RECIPIENT_PROOF,
SOURCE_BINDING, RECIPIENT_RECHECK, SUBMISSION or RECEIPT. The owner chooses the
stage before the operation; exception fields never choose it or enter the result.
`deliveryAttempted` remains false before submission and true once submission is
attempted, including an unknown acknowledgement. These values prove neither
intent absence nor delivery failure.

An enabled sweep adds top-level `diagnosticCode`: REMINDER_NO_CANDIDATES for an
empty eligible set, REMINDER_COMPLETE when no outcome is UNCONFIRMED, otherwise
REMINDER_UNCONFIRMED_<stage> for the first unconfirmed outcome in candidate order.
Later delivery overrides must retain the fixed failure-stage vocabulary; malformed
unconfirmed stage evidence refuses instead of becoming audit text. Disabled sweeps
retain their existing DISABLED result without a diagnostic code. COMPLETED and
output.sourceStatus semantics are unchanged. REMINDER_COMPLETE includes intentional
skips and recorded submissions; it is not delivery proof.

Process retains only this optional bounded static code in the existing
process.action.executed audit metadata. It never copies Digital output, occurrence,
intent or recipient IDs, errors, messages or raw responses. Source fixtures in
`digitalCouponReminderDiagnostics.test.js` compose the actual notify/sweep/Process
audit path with isolated source and RPC boundaries; they do not prove a scheduled
native run. An original-key manual DELIVERED receipt remains separate evidence.

SUBMISSION may additionally retain a fixed `failureReason`: AUTHORIZATION,
CREDENTIAL, ENDPOINT, TRANSPORT or OWNER_RESPONSE. RPC creates a fresh fixed-message
error with only `metadata.digitalReminderDelivery.failureReason`. It never attaches
the original error, cause, message, response or metadata. Notification copies only
this allowlisted classification and only at SUBMISSION; the six stages are unchanged.

Original nService `runtimeInvocationDiagnostic.failureCode` values
INTERNAL_TOKEN_UNAVAILABLE and REMOTE_ENDPOINT_UNAVAILABLE map to CREDENTIAL and
ENDPOINT. Original numeric HTTP 401/403 maps to AUTHORIZATION, 404 to ENDPOINT and
500..599 to OWNER_RESPONSE. Read actual `metadata.remoteHttpFailure.httpStatus`,
then transport HTTP evidence/native status; normalized exception `responseCode`
is not remote HTTP evidence. Network and other unclassified transport failures
map to TRANSPORT without echoing their codes. Failed ERR envelopes, invalid
envelopes and excessive nesting map to OWNER_RESPONSE before details are discarded.

The sweep appends an available reason to the existing code, for example
REMINDER_UNCONFIRMED_SUBMISSION_AUTHORIZATION. All fixed combinations remain under
64 characters and satisfy Process's leading-uppercase contract. Invalid later-layer
reason/stage combinations refuse instead of injecting audit data. Missing reason
retains the existing stage-only code. These observations never establish no-send,
authorize a replay or change the original occurrence/key. The new
`digitalReminderSubmissionClassification.test.js` regression covers classification
and privacy through actual RPC, notify, sweep and Process audit with isolated
source/transport fixtures; it does not repeat the earlier eight diagnostic tests.

## Private Source

Profile calls `POST /internal/coupons/reminder-source` with exactly:

```json
{"enterpriseCode":"business","entitlementCode":"entitlement","occurrenceKey":"COUPON_EXPIRY_<sha256>","channel":"IN_APP"}
```

Return version 1, tenant, sourceModule `digitalCore`, sourceType
`DIGITAL_COUPON_EXPIRING`, exact `source` input and `eligible`. Eligible responses
add canonical `{type,code}` ownerRef and retained expiresAt. No token/actor/contact.
Require private runtime capture, Profile/Digital scopes,
`commerce.digital.notification.read`, COMMERCE role and exactly one
`digitalCore.couponReminders.sourceCallers` grant matching tenant,
principalEnterpriseCode, business enterpriseCode, serviceId, projectCode,
environmentCode, serverCode, instanceCode and assignmentCode. Never rewrite signed
namespace headers to the business body. Foreign grants and request/policy drift refuse.

Digital calls Profile `/internal/coupons/notification-recipients` with
`{source:{enterpriseCode,entitlementCode,occurrenceKey},channel:"IN_APP"}`.
Source-bound recipients expose only recipientId and opaque address reference.
See [Profile recipients](../../../../../../../nodics.platform/modules/profile/llm/contracts/coupon-notification-recipients.md).
Submit to existing Communication `/internal/communications` with
`requiresSourceEligibility:true`. The framework dispatch-owner contribution maps
this purpose to `DefaultDigitalCouponReminderDeliveryService`. The ENGAGEMENT role contribution selects the remote Digital eligibility endpoint,
so Communication does not activate Digital services or create shadow Commerce
persistence. The existing source hook sends only frozen metadata and uses runtime
internal authentication. `dispatchCallers` separately admits the exact Engagement
runtime/business binding on Commerce. The Digital hook repeats Profile proof;
missing owners or unavailable proof fail closed without a local fallback.

## Defaults

`digitalCore.couponReminders` owns disabled enablement, 86400-second lead time,
200 candidates and 300-second trigger freshness; acquisition paging bounds remain
shared. Delivery defaults own IN_APP, English, template identifier, connection
names, 10000ms timeout, 20 recipients and secure transport. Source grants start
empty. Framework owners define/validate defaults; later layers override values
only. Actual recipients remain governed data.

`DIGITAL_COUPON_EXPIRING_IN_APP` is a selectable resource under
`src/templates/in_app/coupon-expiring`; Communication formats retained expiry.
Bodies are not configuration. Discovery does not select resources or enable
delivery. No secret coupon code or private purchaser data enters the message.

## Verification

`digitalCouponReminder.test.js` composes real Process registry, Digital source,
Profile shared recipient selection, persisted group/permission governance, scope
evaluation, Communication runtime and resource rendering
over isolated transport/storage. Coverage includes Customer/Enterprise delivery,
lost acknowledgement, replay, frozen retry, opt-out, empty roster, DENY/removal,
inherited grants, permission revocation, unavailable/cyclic group evidence,
redemption, expiry/NONE, drift, foreign grants and unchanged Commerce records.
Profile and Communication suites cover generated envelopes, self-only Employee
inbox identity, bearer isolation and absent personal Customer accounts.

`digitalCouponCheckoutComposition.test.js` also composes actual Digital acquisition
with the parent Waste coupon mutation/CAS owner, Digital source callback and
Promotion sale. Certificate-only/unlimited and BOTH are covered without unrelated
reward/carbon/custody mutation. This is source integration, not a required-port stub.

Internal IN_APP source and delivery are implemented. EMAIL/SMS/Telegram remain
unselected: coupon-purpose destinations, staff binding, presentation and external
provider qualification are separate. No live messages, schedules, imports,
databases, servers, providers or E2E acceptance were run.

Ownership review: PASS for Digital source/timing/resources, Profile governed
identities/recipients and Communication inbox/retry reuse. No customer defaults,
parallel outbox, financial state or unrelated workflow changes. Shared edits
preserve other agents' contributions. Unit proof is not installed acceptance.


## Runtime adoption

Platform needs the existing Profile recipient permission and Digital source-read
permission definitions; both belong to their v001 owner catalogues, with no
ordinary group grant. The sending Commerce runtime needs Profile recipient resolve
and Communication request; Process and Engagement need Digital notification read;
Platform needs Digital notification read for its callback. Module scopes remain
independent of permission grants. Reviewed deployment assignments and the existing
service-principal scope ceiling must permit these exact rights.

The Process claim response size comes from the existing Digital-owned
`couponReminders.actionAuthority.maxResponseBytes`, validated against
`couponReminders.validation.claimResponseBytes`. Defaults and range remain in
Digital config; later layers override only actual choices. Missing/invalid bounds
refuse at POLICY before the claim, with no inline size fallback or diagnostic change.

Process and Commerce share only opaque claim handles. Domain selection comes from
the claimed published Process context and explicit `sweepCallers`, never caller
payload. Communication uses its existing intent/claim/retry/inbox path and the
owner-selected remote eligibility metadata. Local transport may explicitly allow
loopback HTTP; secure defaults stay unchanged. A recorded Process outcome or intent
is not proof of delivery: inspect the persisted Communication outcome.

## Private sweep diagnostics

The remote sweep emits only registered `ERR_DIGITAL_REMINDER_*` stage codes:
PRIVACY, INPUT, AUTHORITY, POLICY, CLAIM_TRANSPORT, CLAIM_PROOF and SOURCE.
Stages are selected inside the owner, not from request fields or remote errors.
No original exception, cause, response, credential, recipient or payload is
attached. A transport-stage failure does not prove the remote claim was absent;
inspect the retained Process action before considering recovery. SOURCE does
not prove delivery absence or permit a replay.

The real private-entry guard requires an admitted exact request object and
operator-qualified `log.requestPrivacy` with capture disabled. Suppressed logs
alone do not prove qualification. Missing qualification fails before Process
claim; the diagnostic does not enable capture or grant private entry. The owner
regression composes the actual controller, logger and service-token guard and
checks internal token selection with the canonical ModuleService helper.

Claim transport further distinguishes only fixed CREDENTIAL, ENDPOINT,
HTTP_NOT_FOUND, HTTP_AUTHORITY, HTTP_CONFLICT, HTTP_SERVER, NETWORK and LOCAL
classes under `ERR_DIGITAL_REMINDER_CLAIM_*`. Unknown failures retain
CLAIM_TRANSPORT; remote messages/payloads are discarded. These classes convey
no no-effects or retry proof. Workflow remains the module identity; its owner
metadata supplies the `process` URL prefix through nRouter and registry endpoints.
Never replace the module identity with an HTTP prefix to repair a transport refusal.

The claim connection selects logical `workflow` with target role PROCESS. A
HTTP-prefix alias such as `process` can reject a valid registry lease whose
connection/server is `processServer`. A remote identity scope does not load raw
module metadata, so falling back may then lose the workflow-owned `process`
prefix. Select the canonical module connection and preserve the registered
endpoint; do not activate Workflow on Commerce or rename its module identity.
Before recovery, verify the live workflow registry owner is UP/client-callable
with the PROCESS role. Source composition tests are not proof of a live lease.

Transport classification consumes nService's bounded `metadata.remoteHttpFailure`
(code/httpStatus) and `metadata.transportFailure` (code/optional httpStatus).
Normalization can replace the original top-level code/status; the normalized
Nodics responseCode is not remote HTTP evidence. Actual fetch/normalization tests
replace network I/O only and verify no private message/cause is propagated.

Isolated Enterprise reminder composition uses Profile native locator/anchor and
an exact assignment lookup before persisted group/scope evaluation. Identity
lock or failed assignment lookup remains UNCONFIRMED with no Communication
intent or inbox write. Successful explicit assignment absence does not bypass
opt-in, persisted permissions or deny precedence.


The ordinary `communication.dispatchEligibilityOwners.digitalCore.DIGITAL_COUPON_EXPIRING`
descriptor selects module `digitalCore`, local service
`DefaultDigitalCouponReminderDeliveryService`, target publication `OPERATIONAL`,
and API `/internal/coupons/reminder-dispatch-eligibility`. Communication invokes
fixed `isDispatchEligible` through DMS; ownership chooses local versus remote.
The local request preserves the original actor, while the remote body contains
only frozen intent coordinates under internal runtime authentication. There is
no physical-role switch, hardcoded Commerce connection or catch/fallback. Fresh
source/recipient refusal continues to suppress or retain uncertainty before
claim and send; no reminder/provider enablement follows from this descriptor.


### Owner routing adoption

`digitalCore.couponReminders.actionAuthority` retains connectionName, timeoutMs and
maxResponseBytes; replace its physical runtimeRole with
`targetAuthority: { publication: "OPERATIONAL" }`. Optional server/environment
pins select an exact deployment. The logical owner is workflow; the fixed
`/instances/:instanceCode/actions/claim` API, opaque handle, original signed
runtimeInstanceId and exact sweepCallers admission remain mandatory. STAGED,
ONLINE, missing publication and legacy role selectors refuse before dispatch.
Profile and Communication delivery targets likewise use OPERATIONAL. This
migration does not select a schedule, enable delivery or grant a caller access.

## Offer selection and initialization

Promotion accepts the boolean `couponOffer.expiryReminderEnabled` on fixed-expiry
offers and captures it in the purchase policy. Digital requires the retained
value to be true during the sweep and each source recheck. Existing purchases
without the field are ineligible. Profile independently checks recipient consent.

Select `couponReminderWorkflow` for the Process definition installer,
`couponReminderTrigger` for Workflow's draft trigger, and
`couponReminderSchedule` for Cron's inactive hourly job. The schedule references
the trigger, which references the published Digital definition. Kickoff colocates Cron and Workflow. Split deployments select the Workflow
connection in Cron and allow the trigger code under Workflow's
`process.remoteCronTriggers`. The signed Cron principal requires both module
scopes and `process.trigger.execute`. Process checks the stored trigger/job
relationship before starting an instance. Its ACTION uses the existing opaque claim to
call the operational Digital owner on Commerce. Configure the authorized merchant
context, execution node, caller grants and recipient/template bindings before
activating the trigger and schedule. Import alone sends no messages.
