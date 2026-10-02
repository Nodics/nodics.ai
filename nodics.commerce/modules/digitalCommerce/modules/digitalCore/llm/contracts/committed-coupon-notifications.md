# Committed Coupon Notifications

## Private Outbound Boundary

The existing `invoke` method admits a new detached tenant-only envelope through
Logger `runSensitiveOperation` before Module Service transport logging. It asserts
exact capture protection, uses HTTPS-required transport, disables redirects and
automatic retry, and normalizes private driver/provider errors to the fixed
`ERR_DIGITAL_NOTIFICATION_UNCONFIRMED`. `notifications.allowInsecureLoopback`
defaults false; only an explicit trusted runtime selection allows exact loopback
HTTP. Request/inspect/retry share this owner boundary without creating a generic
transport privacy policy. Original event, frozen intent and financial evidence
authorization are unchanged. Recipient resolution already has its own protected
boundary. All mail, recipient, workspace and privacy qualifications stay OFF.

The [private outbound fixtures](../../test/digitalCommercePrivateNotificationTransport.test.js)
are authored, NOT RUN. Capture attestation cannot certify external APM or custom
provider SDKs; those sinks require independent deployment suppression and joint
acceptance. No sender, credential, source grant or business approval is supplied.

## Ownership And Readiness

Digital Core owns coupon notification events and layered EMAIL/SMS templates.
Checkout owns financially committed placement, Order owns completed refunds,
Payment owns capture/refund evidence, Profile owns verified recipients and
Communication owns durable intent/rendering/delivery/reconciliation. Studied
sources include those owner services, existing entitlement/delivery/reversal
schemas, Communication internal routes and its immutable command-hash contract.
No new queue, contact registry or duplicate delivery engine is introduced.

`digitalCore.notifications` defaults disabled/unqualified, selects the inert
source-bound Profile recipient adapter and has empty event declarations. No deployment selection,
recipient, sender, grant, import or sending is performed. Runtime qualification
and approved business inputs remain gates. The new source authorizes nothing by
itself and behavioral suites have not been executed.

## Commit Triggers

Checkout invokes `notifyCommitted` only after its COMPLETED checkpoint is saved.
Same placement replay also permits the same original event request. The placement
owner catches notification failures independently: they cannot invoke financial
compensation. Digital Core then rereads the original order, complete bounded
order-unit multiset, checkpoint, successful capture and exact original delivery
records. It requires exact tenant/enterprise/buyer/order binding, original times,
currency and captured amount. A failed/ambiguous owner envelope, missing unit or
incomplete payment produces UNCONFIRMED, never a message request.

Order invokes refund notification after its lifecycle checkpoint is COMPLETED,
including original completed-command replay. Digital Core independently requires
REFUNDED order state, original refund lock/timestamp, COMPLETED refund checkpoint,
successful original Payment refund transaction and every entitlement/reversal
under the same canonical refund identity. Payment pending/delayed, partial
reversal and claimed/used coupon evidence cannot produce refund messaging.

Purchase emits one event per original entitlement/channel. Refund emits one event
per canonical full-order refund/channel. Mixed physical/digital orders are not
silently treated as complete digital orders. Current complete-read bounds remain
100 purchase units; larger qualified pagination is not claimed.

## Configuration And Presentation

Each selected declaration in `notifications.events.PURCHASED` or `.REFUNDED`
supplies `channel`, `templateCode`, `purpose`, `locale`, `nextStep`. There may be
at most one EMAIL and one SMS declaration per event. Purposes are exactly
`DIGITAL_COUPON_PURCHASED` and `DIGITAL_COUPON_REFUNDED`.

Select existing `DIGITAL_COUPON_PURCHASED_EMAIL` / `_SMS` or
`DIGITAL_COUPON_REFUNDED_EMAIL` / `_SMS` resources through the existing Communication
template selection. Keep HTML/text in layered `src/templates`, never properties.
All events provide purchaseReference/nextStep; purchase additionally provides the
retained offerName and purchase-derived validUntil. No raw coupon code, token,
hash, wallet credential or private payment reference is inserted into a message.

The explicitly selected `recipientService.resolve` must be an owning verified
recipient adapter. It receives only trusted tenant, enterprise, original buyer
and channel, not browser addresses. Its result must match those bindings and
include `verified:true`, recipientId and recipientAddressReference. The concrete
[Profile recipient v1](profile-notification-recipient-v1.md) adapter adds exact
committed source coordinates and requires Profile's independent Commerce callback
before canonical contact lookup. No default
email-guessing or automatic consent is supplied. Profile canonical identity,
channel verification, suppression and communication consent must be qualified
with the actual adapter. Missing approved contact inputs remain blank/gated.

Transport uses the selected existing connection, service authentication, exact
source module `digitalCore`, bounded timeout/response and no automatic transport
retry. Signed Communication runtime grants must include commsApi/digitalCore and
communication.request; presentation selection is not a grant.

## Durable Identity And Recovery

Event keys depend on tenant, enterprise, buyer, original order, event, original
entitlement or refund, and channel. They do not include the retry clock, transport
correlation or changing configuration. Communication's existing deterministic
intent identity and immutable command hash freeze accepted recipients/content.
A repeated REQUEST with changed declaration/recipient is a conflict, not a new
send. Communication retains the accepted rendered template and original provider
evidence. No second Commerce intent journal is created.

An uncertain transport acknowledgement is UNCONFIRMED. Original REQUEST may be
replayed with unchanged command material to discover the same durable intent;
it never creates a new event key. Intent RETRY uses the existing
`/internal/communications/:intentCode/retry` owner route with an empty body. It
does not resolve another recipient or re-render presentation. Communication owns
retry ceilings, idempotent provider handling and explicit uncertain-send review;
Commerce cannot turn UNCERTAIN into a resending authorization.

## Operator API And Evidence Limits

`commerceNotificationManagement` exposure defaults false. POST
`/orders/:code/notifications/inspect` accepts `{kind}` and performs no intent write.
POST `/orders/:code/notifications/retry` accepts
`{kind,expectedRevision,confirmed:true}`. Both require current human Order staff
scope and their own notification read/retry permission. Staff's existing
dispute-review permission is also required by that shared authority check.
Neither accepts tenant, recipient, amount, template, provider or intentCode.

Inspection reads the existing source-scoped Communication POST
`/internal/communications/:intentCode/inspect` with an empty body. It computes
original EMAIL/SMS identities from the original owner-bound order, buyer and
entitlement/refund, independent of current declarations or subsequent financial
state. It neither requests an intent, retries, resolves a recipient nor renders
content. Returned `outcomes` contain exact stored intentCode/status/revision plus
channel and an observed flag; `orderRevision` is explicitly separate from intent
revision. Financial completion is not notification delivery.

Historical inspection uses a separate committed-event proof, not the strict
creation/retry eligibility check. PURCHASED requires the original COMPLETED
Checkout checkpoint, exact original captured amount/currency, complete original
unit set and exactly one original DELIVERED COUPON_CODE record per unit. The
original purchase/expiry/delivery timestamps must be present. Later redeemed or
revoked units and REFUNDED orders do not erase this historical proof. Missing,
ambiguous or pending original records still refuse inspection before any private
Communication read. REFUNDED inspection requires the original completed refund
checkpoint, successful exact Payment refund and every original completed reversal.
This uses retained owner evidence, not a new Commerce intent or event journal.
Creation and retry continue to require current ACTIVE units and eligible order
state for PURCHASED, or current completed REFUNDED/REVOKED evidence for REFUNDED.
Historical proof never authorizes another delivery request or financial operation.

The dedicated version-one native operator workspace, fixed commands and precise
Axis integration contract are documented in
[order notification workspace v1](order-notification-workspace-v1.md).
Its independent `notifications.workspaceQualified` gate defaults false.

The exact durable runtime states admitted are ACCEPTED, DELIVERING, DELIVERED,
RETRY_PENDING, UNCERTAIN, SUPPRESSED, FAILED, UNCONFIGURED, DEAD_LETTER and CANCELLED.
Unknown states or absent/noninteger revisions on inspection reject rather than
being reported as success. QUEUED is not inferred as a durable commsCore state.
Inspection of both channels preserves access to existing intents even when current
template/channel declarations changed. No caller-supplied intent identity is used.

Disabled selection reports POLICY_DISABLED with no reads, not a claim that a
historical intent never existed. Missing original refund/unit sources report
NO_SOURCE_EVENT without constructing arbitrary references. An absent, denied or
failed private intent read remains UNCONFIRMED with observed:false: Commerce does
not infer nonexistence from a private authorization refusal. Successful independent
observations are preserved as PARTIALLY_INSPECTED; all observations must succeed
for INSPECTED. Retry targets the original event only after fresh financial source
and revision checks; an absent original intent cannot be created by RETRY.

The source-bound Profile recipient adapter and concrete native Cart/activated-
Pricing merchant adapter now exist. Profile-owned canonical contact integration,
approved business inputs and actual external POS connectivity remain distinct
integration/approval boundaries, not claims made by the native implementation.
Original lost-ack command recovery and connected operator UI also require
coordinated integration/acceptance. The new Communication inspection route must be
deployed with matching source-scoped service grants before it can return state.
Source existence is not a claim that these remaining gaps are completed.

## Extension And Acceptance

Override mergeable helpers or select owning adapters in later module/runtime
layers; keep customer projects limited to intentional selection. Never replace
financial owner evidence with cached UI state or request payload. Preserve exact
binding, retained rights, complete reads and immutable event identity.

`test/digitalCommerceNotificationContract.test.js` is authored, not executed. It
covers disabled defaults, stable event keys, retry without recipient/content
reconstruction, post-commit compensation isolation, rejected source evidence,
exact terminal states, read-only inspection, partial observations and disabled
inspection without false absence claims.
Joint acceptance must also exercise real captures/refunds, races, stale roles,
lost acknowledgements, duplicates, suppression, channel/template overrides,
uncertain sends and end-to-end Axis/Circa journeys. Static checks establish only
source shape; no runtime/database/email or release operations are authorized here.
