# Transfer Completion Notifications

Owner split: Wallet proves committed transfer/ledger evidence, freezes a message
plan on the existing transfer receipt and retains Communication intent pointers.
Profile resolves typed source owners and explicit recipient preferences.
Communication owns durable intent, inbox, suppression, attempts and delivery.
No new outbox, contacts in Wallet, service-identity substitution or rollback of
value movement is permitted. This contract supports real `IN_APP` delivery through
Communication's existing Customer/Employee inbox. Enterprise recipients are
explicitly selected authorized Employees, never Customer mappings, the acting
employee, adminEmail or owner login inferred as a destination. EMAIL/SMS delivery
remains unavailable without a qualified purpose-bound destination contract.

## Integration Interface

After `transaction.compose` has committed, call and await
`DefaultLoyaltyTransferNotificationService.notify(originalRequest, operationCode)`.
The method returns bounded progress and catches delivery failures. Never invoke
inside the value transaction. Exact transfer replays/status recovery may invoke
the same method again with current source-owner admission. It must not call earn,
reserve, capture, settle or any other value movement. A disabled policy returns
`NOT_REQUESTED`; uncertainty returns `UNCONFIRMED`, without rejecting the transfer.

Return interface: `{status:'NOT_REQUESTED'|'UNCONFIRMED'|'RECORDED',outcomes?:
Array<{side:'SENDER'|'RECIPIENT',status:string,intentCode?:string}>}`. `RECORDED`
means source selections and returned Communication outcomes are recorded, not
that every message was delivered. `ACCEPTED`, `UNCERTAIN`, `RETRY_PENDING` and
terminal failure/suppression statuses retain their actual Communication meaning.
No recipient identifiers, addresses or content are in this progress projection.
Do not overwrite the immutable transfer accounting result with notification state.

The existing Wallet `rewardTransferOperation.definition` includes:

```js
notificationPlan: {
  type: 'object', required: false,
  description: 'Frozen source-bound recipient/message selections and Communication intent pointers; no delivery attempt state.'
}
```

The revision description is `Optimistic receipt revision for
notification pointers; accounting intent and result remain immutable.`
The plan contains version 1, immutable
sourceDigest, resolvedSides (SENDER/RECIPIENT) and frozen per-side entries, each with canonical recipientId,
opaque recipientAddressReference, deterministic idempotencyKey, templateCode,
purpose/channel/locale, variables, and optional Communication intentCode/status.
Update only this field plus revision using existing generated CAS; never replace
the receipt result/intent or create another delivery ledger. This is a source
pointer snapshot, not an independent retry/attempt/lease state machine.

Complete integrated defaults in Wallet `config/properties.js` under `loyalty`:

```js
transferNotifications: {
  enabled: false, qualified: false,
  profileConnectionName: 'profile', communicationConnectionName: 'commsApi',
  timeoutMs: 5000, maxResponseBytes: 16384, allowInsecureLoopback: false,
  locale: 'en', maximumRecipients: 20,
  sourcePermission: 'loyalty.transfer.notification.source',
  templates: { SENDER: 'LOYALTY_TRANSFER_SENT_IN_APP', RECIPIENT: 'LOYALTY_TRANSFER_RECEIVED_IN_APP' }
}
```

Framework Communication contributions (no enabling/trusted runtime grant):

Wallet owns `maxResponseBytes` for both recipient and Communication RPCs. Require
a positive safe integer from effective properties, with no service-local fallback.
An invalid limit refuses before private transport. Response-size customization does
not change internal authentication, single-attempt or no-redirect guards.
`loyaltyTransferNotifications.test.js` checks the inherited value, overrides and
invalid values. The distinct Profile callback remains Profile-owned.

```js
communication: {
  dispatchEligibilityOwners: {
    loyaltyWallet: { LOYALTY_TRANSFER_COMPLETED: 'DefaultLoyaltyTransferNotificationService' }
  },
  templateResources: { modules: { loyaltyWallet: true } }
}
```

The eligibility method uses Profile RPC, not Wallet database loading in an
ENGAGEMENT runtime. Its implementing module must be available in that runtime.
Template selections and trusted runtime source/module/permission grants remain
explicit deployment choices; installing definitions does not send anything.

Loyalty API private command: POST `/internal/transfers/notification-source`,
secured service token, serviceAccountUserGroup, permission
`loyalty.transfer.notification.source`, sensitive/no-store, existing loyaltyInternal
exposure. Controller preserves verified authData/tenant, maps HTTP body to payload;
facade delegates unchanged to `DefaultLoyaltyTransferNotificationService.source`.
Exact body `{operationCode,side,channel:'IN_APP'}`; side SENDER or RECIPIENT.
Source admission requires runtime module grants for both loyaltyApi and profile.
The source is independently checked from durable receipt and debit/credit ledgers.

Exact router entry under `loyaltyApi.internal` (reuse existing controller/facade
dispatch conventions, with `transferNotificationSource` invoking `.source`):

```js
transferNotificationSource: {
  secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
  permission: 'loyalty.transfer.notification.source', apiExposure: 'loyaltyInternal',
  cache: { enabled: false }, requestPrivacy: { sensitive: true },
  key: '/internal/transfers/notification-source', method: 'POST',
  controller: 'DefaultLoyaltyInternalController', operation: 'transferNotificationSource'
}
```

Profile private command: POST `/internal/transfers/notification-recipients`,
secured service token, serviceAccountUserGroup, permission
`profile.transfer.notification.recipient.resolve`, sensitive/no-store. Exact body
`{source:{operationCode,side},channel:'IN_APP'}`. Both profile and loyaltyWallet
runtime module grants are required. Profile independently requests the Loyalty
source endpoint using `requireInternalAuth:true`, never forwarded human credentials
or a fabricated authData service principal.

Integrated Profile schema fields:

```js
// Present on profile.customer, profile.employee and profile.enterprise.
transferNotificationPreferences: {
  type: 'object', required: false,
  description: 'Explicit per-channel transfer completion notification opt-in; IN_APP must be true.'
}
// Add only to profile.enterprise.definition.
transferNotificationRecipients: {
  type: 'array', required: false,
  description: 'Explicit same-tenant Employee selections: employeeCode; current domain permission, Enterprise scope and personal opt-in required; no fallback.'
}
```

- `customer.transferNotificationPreferences`: optional object; `IN_APP === true`
  is explicit opt-in. Missing/false never implies consent.
- `enterprise.transferNotificationPreferences`: same optional object/opt-in.
- `employee.transferNotificationPreferences`: same optional object/opt-in.
- `enterprise.transferNotificationRecipients`: optional array of exact
  `{employeeCode:<existing canonical Employee code>}` entries.
  No actor/Customer/email/phone fallback. Enterprise and each selected Employee
  must be active in the source tenant, and each Employee independently opted in
  and currently authorized for the source Enterprise's Wallet read capability.
  Keep selection writes with existing Profile owner-authorized management; these
  fields are business records, never deployment properties or Wallet data.

Profile's `DefaultProfileNotificationRecipientService.select` owns reusable
canonical identity, fresh group/permission, accepted membership and allow/DENY
scope checks. Its transfer `recipientSelection` defaults are framework-owned
Profile properties. See Profile's `llm/contracts/notification-recipient-projections.md`.
It returns existing Customer or `profile-employee:<code>` inbox IDs, with reserved
namespace collision checks. No new Communication adapter, API or inbox is added.

Owner permission definitions for both private routes are integrated but assign nobody.
Do not activate providers, select templates, assign runtime grants or modify live
preferences. Communication still applies current suppression before delivery.

## Recovery And Verification

Freeze each owner's recipient/message choices before requesting its delivery.
An unresolved side remains unconfirmed without holding up the other side. A
resolved side with no opted-in recipients is frozen empty; later preferences do
not retroactively add recipients. `resolvedSides` records only this snapshot
completeness, never delivery attempts or a second delivery state machine.
Retry immutable Communication keys after lost acknowledgements; changed intent
must conflict. Never readdress a frozen plan when Enterprise recipients change.
Dispatch eligibility rechecks source and current Profile opt-in/roster; removal
suppresses that frozen recipient. Unknown evidence defers, never proves consent.
Both sides are independent; failure on one cannot undo or hide the other.

Notification status is Communication-owned. Existing intent pointers are inspected
through its source-scoped inspect API; requesting/recovering a pointer does not
retry an UNCERTAIN or RETRY_PENDING delivery. Delivery retry/reconciliation stays
with Communication's explicit owner commands. No scheduler is installed.

## Implementation Status

Implemented: new Wallet coordinator/source proof, Profile recipient
service/controller/facade/private route/default-off properties, two module-owned
IN_APP template bundles, and the cross-owner unit contract. Profile administrator
evidence and the earlier Enterprise test-credit implementation are separate;
their integration is documented in `enterprise-test-credit.md`.

Shared source integration is implemented: Wallet defaults/Communication
contributions, receipt field, post-commit/replay/status hook, Loyalty private
source route/controller/facade, Profile governed schema fields and the two
ungranted permission releases. No public schema CRUD policy was broadened.
Unit fixtures now inherit the real owner defaults and deliberately qualify only
their isolated environment. They are not evidence that schemas, grants or
endpoints are installed. Post-commit tests prove notification failure cannot
roll back settlement and failed accounting never triggers delivery.

Source owner admission currently uses fresh `loyalty.wallet.read` participant
authority, which permits status recovery without reauthorizing a payment. Keep
the original request/token at the hook. Both Customer and represented Enterprise
contexts are covered; a recipient is never admitted as the sender.

Live delivery remains separately gated by default-off qualified policies,
explicit template selections, runtime grants, actual internal connections,
installed storage schemas and opted-in Profile records. No activation, database,
external provider, server or E2E qualification was performed.

## Exact Changed Paths

Paths below are relative to the shared `nodics.ai` checkout. Parent-owned Wallet
configuration, schemas, routes, controllers, facades and transfer/accounting
services were not edited by this notification implementation.

```text
nodics.loyalty/modules/loyaltyWallet/src/service/defaultLoyaltyTransferNotificationService.js
nodics.loyalty/modules/loyaltyWallet/test/loyaltyTransferNotifications.test.js
nodics.loyalty/modules/loyaltyWallet/llm/contracts/transfer-notifications.md
nodics.loyalty/modules/loyaltyWallet/src/templates/in_app/loyalty-transfer-sent/template.json
nodics.loyalty/modules/loyaltyWallet/src/templates/in_app/loyalty-transfer-sent/en/subject.txt
nodics.loyalty/modules/loyaltyWallet/src/templates/in_app/loyalty-transfer-sent/en/message.txt
nodics.loyalty/modules/loyaltyWallet/src/templates/in_app/loyalty-transfer-received/template.json
nodics.loyalty/modules/loyaltyWallet/src/templates/in_app/loyalty-transfer-received/en/subject.txt
nodics.loyalty/modules/loyaltyWallet/src/templates/in_app/loyalty-transfer-received/en/message.txt
nodics.platform/modules/profile/src/service/identity/defaultProfileTransferNotificationRecipientService.js
nodics.platform/modules/profile/src/service/identity/defaultProfileNotificationRecipientService.js
nodics.platform/modules/profile/test/profileNotificationRecipients.test.js
nodics.platform/modules/profile/llm/contracts/notification-recipient-projections.md
nodics.platform/modules/profile/src/controller/identity/defaultProfileTransferNotificationRecipientController.js
nodics.platform/modules/profile/src/facade/identity/defaultProfileTransferNotificationRecipientFacade.js
nodics.platform/modules/profile/llm/contracts/transfer-notification-recipients.md
nodics.platform/modules/profile/config/properties.js
nodics.platform/modules/profile/src/schemas/schemas.js
nodics.platform/modules/profile/src/router/routers.js
nodics.platform/modules/profile/README.md
nodics.platform/modules/profile/AGENTS.md
```

The administrator-evidence completion additionally created or updated:

```text
nodics.platform/modules/profile/src/service/identity/defaultProfilePlatformAdministratorEvidenceService.js
nodics.platform/modules/profile/src/controller/identity/defaultProfilePlatformAdministratorEvidenceController.js
nodics.platform/modules/profile/src/facade/identity/defaultProfilePlatformAdministratorEvidenceFacade.js
nodics.platform/modules/profile/test/profilePlatformAdministratorEvidence.test.js
nodics.platform/modules/profile/llm/contracts/platform-administrator-evidence.md
nodics.platform/modules/profile/llm/contracts/identity-access-lifecycle.md
nodics.loyalty/modules/loyaltyWallet/llm/contracts/enterprise-test-credit.md
nodics.loyalty/modules/loyaltyWallet/test/loyaltyEnterpriseTestCredit.test.js
```

Profile configuration/router/README/AGENTS are shared with that completion; the
parent's participant-directory additions remain intact.

## Local Unit Evidence

The earlier focused suite passed 163/163 (20 notification, 14 administrator evidence,
23 test credit, 28 conversion including 4 actual-accounting bridges, and 78
existing Profile/router/Communication regression cases). This is unit/contract
evidence only, not installed-database or signed-network/live acceptance.

The Employee-recipient change additionally passes 41 focused tests: 20 shared
Profile projection cases and 21 migrated Wallet/Profile/Communication delivery
contracts. Existing inbox-reader/coupon contracts remain separately owned;
their adoption of the shared selector is not implied by transfer integration.
The combined recipient, transfer, coupon, private-transport and Communication
inbox regression command passed 110 tests, with no live provider or database.
The additional bridge reads the delivered Employee message through real
Communication/Profile self-identity implementations with isolated credential and
storage ports. It proves exact source/message isolation without a personal
Customer account, and rejects a substituted original bearer before Profile lookup.

```sh
node --test \
  nodics.loyalty/modules/loyaltyWallet/test/loyaltyTransferNotifications.test.js \
  nodics.platform/modules/profile/test/profilePlatformAdministratorEvidence.test.js \
  nodics.platform/modules/profile/test/profileParticipantDirectoryContract.test.js \
  nodics.platform/modules/profile/test/platformAdministratorFullAccess.test.js \
  nodics.foundation/modules/nRouter/test/platformAdministratorAccess.test.js \
  nodics.loyalty/modules/loyaltyWallet/test/loyaltyEnterpriseTestCredit.test.js \
  nodics.loyalty/modules/loyaltyWallet/test/loyaltyPartnerRewardConversion.test.js \
  nodics.loyalty/modules/loyaltyWallet/test/loyaltyPartnerRewardConversionAccounting.test.js \
  nodics.communication/modules/commsCore/test/communicationRuntime.test.js \
  nodics.communication/modules/commsApi/test/communicationIntentInspection.test.js
```
