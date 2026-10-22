# Source-Proven Notification Recipients

Profile projects current canonical inbox identities for a source owner already
proved by a private domain wrapper. Communication retains its existing durable
intents, preferences/suppression, inbox records and delivery attempts. This is
not a new inbox, contact directory, source-proof API or notification queue.

## Internal Interface

```js
const ids = await SERVICE.DefaultProfileNotificationRecipientService.select(
  originalRequest,
  { type: 'CUSTOMER', code: canonicalOwnerCode }, // or ENTERPRISE
  { ...policy.recipientSelection, maximumRecipients: policy.maximumRecipients }
);
```

The exact original sensitive request must carry a genuine Profile-scoped runtime
service principal in its signed tenant. Source wrappers remain responsible for
domain permission/module admission, transport alias checks, independent fresh
source evidence, source rereads, default-off enablement and qualification.
Do not accept ownerRef or selection policy from the HTTP body. Do not substitute
service authData, use a tenant-only clone or treat this helper as source proof.

Output is a sorted unique `string[]`: Customer code for a Customer source owner,
or `profile-employee:<canonical Employee code>` for an explicit Enterprise roster.
No login, contact, name, credential, group, scope or balance leaves the selector.
Wrappers retain their source-bound opaque address-reference hashing and envelope.

Complete transfer wiring lives in `config/properties.js`:

```js
profileNotificationRecipients: { maximumGroups: 100 },
// Within profileTransferNotifications, which remains disabled and unqualified:
recipientSelection: {
  preferencesField: 'transferNotificationPreferences',
  recipientsField: 'transferNotificationRecipients',
  recipientPermission: 'loyalty.wallet.read',
  capabilityCodes: ['loyaltyWallet', 'loyaltyCore']
}
```

The transfer owner supplies its existing `maximumRecipients: 20`. Other purposes
must define their complete field/permission/capability selections in Profile's
framework properties. Customer/runtime layers only intentionally override those
definitions; actual rosters/preferences/grants remain governed Profile records.
There are no inline policy fallbacks. The helper rejects invalid paths, bounds,
identifiers and missing policy before identity reads.

## Current Authority

- Customer owners require active typed identity, canonical anchor/lock validation
  and explicit per-purpose `IN_APP === true`. They never become Employees.
- Enterprise owners require exact same-tenant placement in Profile's authority
  partition, active state, explicit opt-in and a bounded exact `[{employeeCode}]`
  roster. Customer mappings, contacts, actor/admin and all-staff fallbacks refuse.
- Each selected Employee must be an active human in the source tenant with its
  own per-purpose opt-in. Existing membership resolution checks the canonical
  identity and lock state. Native employees without an assignment still require
  fresh persisted groups and matching Enterprise/tenant/global scope. A linked
  projection requires exactly its current registered, active, COMPLETE accepted
  assignment, canonical identity, target projection and immutable grant digest.
- Group ancestry is bounded and reread from the Employee partition. Existing
  Profile graph and permission-catalogue owners validate it. The existing router
  evaluates the domain read permission; effective scopes independently require
  a matching allow and no matching denial. Scope alone grants no permission.
- Reserved Employee inbox IDs must not collide with any Customer record, including
  an inactive one. This uses the existing Communication Employee inbox convention,
  not a fabricated Customer identity or a second delivery adapter.

Only existing Profile private generated-read helpers cross storage admission.
Public customer CRUD is unchanged. Local effective-scope queries use persisted
principal facts, not an authenticated request sent under a manufactured identity.
No sessionContext, token issuance, membership stamp registration or writes occur.

The original request/policy and authority partition are pinned across awaits.
Two fresh selections must agree. Missing/inactive/unselected/opted-out identities
are omitted; malformed, cross-tenant, locked, ambiguous or unavailable authority
refuses resolution. Wrappers and dispatch hooks must preserve that distinction:
unknown evidence defers delivery, withdrawal suppresses a frozen recipient, and
new recipients never readdress an existing intent. Read agreement is not database
snapshot isolation; Communication must still recheck at dispatch.
All four wrappers validate the shared selection policy before their source call;
synthetic system admission cannot reach source reads or recipient projection.

## Consumers And Acceptance

Each notification wrapper's framework property definition includes
`maxResponseBytes: 8192` for its source callback. The effective value must be a
positive safe integer; absent or invalid configuration refuses before transport.
Later layers may override the value, for example to accommodate a larger
qualified response, without copying other defaults. One-attempt source reads,
redirect refusal and independent proof validation remain enforced. Owner tests
cover inherited limits, a larger override and invalid/missing limits.

Transfer resolution uses this selector after the committed Wallet source proof.
The existing Employee self-identity endpoint and Communication
`/employee/communications` reader preserve original human bearer authority and
read the same inbox store. Their source remains with the existing inbox owner.
No API, schema or frontend identity replacement is required for transfer delivery.

The [coupon wrapper](coupon-notification-recipients.md) and
[auction wrapper](auction-notification-recipients.md) also use this selector after
their independent Digital and Bidding source callbacks. Coupon policy selects
`couponReminderPreferences`, `couponReminderRecipients`,
`commerce.digital.own.read` and Digital capability codes. Auction policy selects
`auctionNotificationPreferences`, `auctionNotificationRecipients`,
`commerce.bid.participate` and `bidding`. Both definitions live in Profile's
framework properties; no legacy scope-only selection path remains. Each wrapper
retains exact domain-source admission, fresh proof and source-bound hashing.

The [whole-gift wrapper](gift-notification-recipients.md) proves Digital's exact
manifest/receipt-backed original participant, event and side. It selects
`giftNotificationPreferences`, `giftNotificationRecipients`,
`commerce.digital.bundle.manage` and Digital capabilities. Gift-enable settings
are not consent. Stale pending sources suppress without accepting or changing a
gift; the same existing Employee inbox and permission/scope checks apply.

Maintainers run `test/profileNotificationRecipients.test.js`,
`test/profileCouponNotificationRecipients.test.js`, Digital's
`test/digitalCouponReminder.test.js` and Wallet's
`test/loyaltyTransferNotifications.test.js`. They cover native/linked recipients,
inherited permission and deny precedence, namespace collision, canonical lock,
cross-tenant/malformed evidence, revocation between reads, bounded/custom policy,
real durable Communication inbox writes, suppression and frozen-plan recovery.
The composed transfer fixture also reads the resulting Employee message through
the actual Communication Employee inbox facade and Profile self-identity owner.
It preserves the human bearer and signed Enterprise, verifies the exact delivered
message/source, refuses a substituted bearer before Profile invocation and creates
no Customer identity. Credential validation and storage remain isolated ports;
this proves the owner interfaces compose, not live authentication or installation.
Persistence and credentials are isolated test ports, not production substitutes.
Auction cases compose the actual Bidding source/round reader and recipient client
with the Profile controller/facade and shared identity owners. They enforce the
same real permission/scope checks and exact immutable-source proof without
activating a scheduler or delivery provider.

Business users receive only opted-in messages; administrators govern selections
and domain grants through existing Profile records. Operators must separately
qualify membership/identity services, installed schema fields, runtime grants,
private connections and template selections. Source/unit acceptance does not
enable delivery, grant anyone access or establish live/E2E acceptance. EMAIL/SMS
still require a separately qualified destination/consent contract.
