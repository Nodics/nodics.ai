# Gift Notification Recipients

Profile implements `POST /internal/bundles/gifts/notification-recipients` with
the exact Digital whole-gift contract. It accepts only
`{source:{enterpriseCode,operationCode,event,side},channel:"IN_APP"}`.
Events are PENDING, CANCELLED, ACCEPTED, DECLINED and EXPIRED; side is SENDER or
RECIPIENT. Operation codes retain Digital's `bundle-operation:<sha256>` identity.
No caller supplies an owner, Employee, contact, template or destination.

## Admission And Proof

The controller/facade preserve the original private request and return no-store
responses. Require genuine Profile/digitalCore-scoped runtime admission,
`profile.commerce.notification.recipient.resolve`, exact signed tenant and
Enterprise aliases, empty query and no transaction context. Default-off enablement
and qualification, complete selector policy and identifiers are checked before
source reads. Errors are redacted to `ERR_AUTH_00003`.

Profile calls Digital `POST /internal/bundles/gifts/notification-source` with
the four source fields plus channel flattened. The detached secure invocation
contains tenant and source coordinates only and requests real internal
authentication. No human bearer or fabricated service identity is substituted.
Digital independently requires `commerce.digital.notification.read`, Profile
scope, COMMERCE role and exactly one reviewed deployment/business sourceCaller
grant before reading original manifest and complete phase receipts.

The response preserves Digital's exact proof and adds opaque recipients:

```js
{ contractVersion: 1, tenant, sourceModule: "digitalCore",
  sourceType: "DIGITAL_BUNDLE_GIFT_" + event,
  source: { enterpriseCode, operationCode, event, side }, channel: "IN_APP",
  eligible: true, sourceDigest, ownerRef: { type: "CUSTOMER" | "ENTERPRISE", code },
  recipients: [{ recipientId, recipientAddressReference: "profile-inbox:<sha256>" }] }
```

Ineligible proof omits ownerRef/sourceDigest and returns no recipients. Profile
rejects contradictory ineligible evidence, rereads source and selections and pins
request/policy across awaits. Hashes bind tenant, exact source/event/side, digest,
typed owner and recipient. An unavailable source is an error, not a successful skip.

## Current Recipients

The [shared selector](notification-recipient-projections.md) enforces canonical
identity/locks, active same-tenant ownership, persisted permission groups and
allow/DENY scopes. Customer owners retain their own opted-in inbox. Enterprise
owners use only `giftNotificationRecipients:[{employeeCode}]` on the existing
Enterprise record. Customer, Employee and Enterprise independently use
`giftNotificationPreferences.IN_APP === true`; missing fields do not opt in.
Selected Employees require `commerce.digital.bundle.manage` and Digital scope,
the existing gift participant route permission. They use the existing
`profile-employee:<code>` inbox with collision protection. No Customer is created.

Gift-enable/receive policy is separate Digital business policy, not notification
consent. No purchaser, sender actor, recipient actor, administrator, all-staff or
contact fallback exists. Linked Employees require current accepted membership;
native Employees still require current persisted groups and scope.

## Definitions And Evidence

Complete `profileGiftNotifications` defaults live in Profile properties:
enabled/qualified false, Commerce connection, 10000ms timeout, secure-only
transport, 20 recipients, existing private route permission, five events and
recipientSelection field/permission/capability definitions. Customer/runtime layers
only intentionally override these definitions; rosters/preferences/grants remain
governed records. Public generic CRUD admission is unchanged.

`test/profileNotificationRecipients.test.js` composes the actual Profile HTTP and
identity owners with Digital source/manifest/receipt readers, recipient client,
postcommit notification coordinator and existing Communication rendering, durable
intent and inbox. Isolated storage and credential transport cover both original
sides, all events, missing grants/receipts, drift, denied permission, lost ack and
stale pending suppression. No production adapter double is introduced.

Canonical public guidance is in `data/docs-v002/records/documentation/` and the
selected documentation manifest. The v001 predecessor remains sealed. Source/unit
acceptance is not installed runtime qualification, provider activation, live
delivery or E2E acceptance. No notification changes gift ownership or decisions.
