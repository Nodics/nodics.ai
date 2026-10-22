# Coupon Notification Recipients

Profile resolves coupon expiry recipients after Digital independently proves
current owner, unused state and fixed expiry. No recipient/contact is accepted
from the scheduler, browser, Digital request or purchasing employee.

`POST /internal/coupons/notification-recipients` accepts exactly
`{source:{enterpriseCode,entitlementCode,occurrenceKey},channel:"IN_APP"}`.
Require private runtime capture, Profile/digitalCore scopes, existing
`profile.commerce.notification.recipient.resolve` and matching signed namespace.
`profileCouponNotifications` defines disabled enablement, Commerce connection,
10000ms timeout, secure transport and 20 recipients. Its `recipientSelection`
defines `couponReminderPreferences`, `couponReminderRecipients`, recipient
permission `commerce.digital.own.read` and capabilities `digitalCore` and
`digitalCommerce`. It delegates to the
[shared Profile selector](notification-recipient-projections.md), including the
framework `profileNotificationRecipients.maximumGroups` bound. No inline default
or former scope-only selection path remains. Digital's source callback enforces exact
deployment/business grants. Failed envelopes or request/policy/source drift refuse.
Malformed occurrence identifiers and incomplete shared-selection policy refuse
before source transport. Unexpected storage/transport diagnostics are redacted
to `ERR_AUTH_00003`; private errors never become a successful empty recipient list.

## Governed Records

- Customer: active canonical Customer, current identity and explicit
  `couponReminderPreferences.IN_APP === true`. Use its own canonical inbox code.
- Enterprise: active same-tenant Enterprise in Profile's authority partition,
  explicit Enterprise opt-in and unique bounded
  `couponReminderRecipients: [{employeeCode}]`. Read each Employee in the business
  tenant; require active human identity, canonical membership/lock proof, personal
  opt-in, current persisted valid group ancestry granting the Digital read
  permission and an effective Digital scope without matching DENY. Linked
  projections require the current COMPLETE accepted assignment; native identities
  require persisted groups and matching scope. Plain enterpriseCode metadata is
  not membership proof. Use existing Profile identity/catalogue/group/scope and
  router permission owners; a scope alone never grants a permission.
- Missing, inactive, unselected or opted-out recipients yield an empty list.
  Unavailable identity/scope services or malformed evidence remain errors.
  No purchaser, administrator, all-staff, hierarchy or contact fallback exists.

These fields extend existing Profile identity records and governed administrative
mutation paths. This reuses Profile's existing Enterprise notification-selection
ownership with a separate explicit staff roster and coupon purpose. No new
identity tables, runtime business configuration, contacts or permission grants.
Selections/preferences/scopes are reread before returning. Communication's dispatch
hook repeats resolution and suppresses changes instead of readdressing an intent.

The response includes tenant, source, channel, eligibility and ownerRef/expiry when
eligible. Each recipient is only recipientId and `profile-inbox:<sha256>`, bound to
tenant/source/owner/recipient. No login, contact, employee name or credential leaves
this endpoint. It neither sends nor stores a second delivery queue.

## Employee Inbox

Staff use `profile-employee:<canonical Employee code>`, a reserved namespace which
must not collide with an existing Customer. No personal Customer account is needed.
`GET /employee/inbox-identity` accepts only the original authenticated human access
context, empty selectors and the existing `communication.customer.read` inbox
permission. Fresh membership and exact Employee login/code are checked; return
only own recipientId, tenant and enterprise. Communication forwards the original
bearer for `/employee/communications`. The permission is not automatically assigned.
No Employee directory/schema lookup grant or service-token substitution is added.
Revalidate the original actor after the Employee and namespace-collision reads.
Identity/storage errors remain `ERR_AUTH_00003`; they must not expose private
dependency messages through the self-identity controller.

## Verification

`profileCouponNotificationRecipients.test.js` covers real generated read envelopes,
foreign authority, source/body/policy drift, opt-out and Employee identity/namespace
safeguards. Digital's composed reminder tests cover inherited persisted permission,
missing/invalid grants, Enterprise allow/DENY, permission revocation, roster
removal, retries and actual Communication inbox writes. Communication tests verify
the original-bearer Employee self-identity path. Defaults stay off; isolated opt-in
fixtures do not qualify an installed runtime. IN_APP is implemented. Other channels
require independently verified purpose-bound destinations and explicit consent;
email and phone fields are never implicit fallbacks.
