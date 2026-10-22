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
`digitalCore.couponExpirySweep`. The existing local Process ACTION declaration
requires the service on the executing runtime; it is not a cross-runtime
service-name executor. Cron's `jobDetail.processTrigger` starts a reviewed Process.
No definition, allowed action, schedule, grant or template selection is activated.

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
this purpose to `DefaultDigitalCouponReminderDeliveryService`. The delivery runtime
must load that contribution/service and reviewed Profile access. Its hook uses
RPC, not local Commerce persistence; missing owners fail closed.

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
