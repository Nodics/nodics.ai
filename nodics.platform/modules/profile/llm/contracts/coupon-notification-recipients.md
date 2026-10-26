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
before source transport. Private capture and exact runtime-principal validation run before policy reads.
Missing/invalid private entry, runtime identity, module scope or permission remains
`ERR_AUTH_00003`. After private runtime/module admission, POLICY identifies invalid
or disabled effective policy; after permission validation, INPUT identifies malformed
selectors. These use fixed `ERR_PROFILE_COUPON_RECIPIENT_POLICY` and `_INPUT`
HTTP 403 definitions. Existing post-input failures expose only registered
HTTP 403 `ERR_PROFILE_COUPON_RECIPIENT_SOURCE_RPC`, `_SOURCE_PROOF`, `_SELECTION`
or `_BOUND` codes. These represent the locally executing boundary, not a claimed
remote root cause. RPC covers automatic internal-authentication and transport;
proof covers envelope/coordinate validation and proof drift; selection covers
current persisted recipients and selection drift; binding covers original
request/policy rechecks. Dependency codes, messages, contacts, credentials, raw
causes and metadata are discarded, never logged or copied into diagnostics.
These fixed stages grant no authority and never turn errors into an empty list.
The self-inbox command retains its generic AccessDenied contract.

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

The focused controller regression uses the real runtime-principal guard and
registered NodicsError, proving HTTP 403 and no private cause propagation. The
composed Enterprise regression uses actual Profile source validation, generated
record reads, membership, permission ancestry and effective scope selection; only
external RPC and stored fixture records are substituted. These are source tests,
not proof of a live callback identity or delivered reminder.

`profileCouponRecipientHttpAdmission.test.js` composes real early privacy binding,
route privacy middleware, HTTP request-envelope construction, secured permission
checks, controller dispatch and private error serialization. Token verification
and persistence are isolated; invalid runtime identity or detached private entry
never expose a diagnostic stage. Only this focused regression needs running for
the admission-stage change; it does not qualify a live deployment.
