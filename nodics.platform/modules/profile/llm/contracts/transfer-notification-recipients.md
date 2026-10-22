# Transfer Notification Recipients

Profile owns typed identity, Enterprise recipient selections and preferences.
Wallet owns completed transfer and ledger evidence; Communication owns durable
delivery and the existing Customer/Employee inbox. Neither the acting employee nor an
Enterprise email field establishes a notification destination.

## Private Endpoint

`POST /internal/transfers/notification-recipients` delegates through
`DefaultProfileTransferNotificationRecipientController`, its facade, and
`DefaultProfileTransferNotificationRecipientService.resolve(request)`.
It requires sensitive/no-store handling, a real runtime service token scoped to
`profile` and `loyaltyWallet`, exact tenant and explicit
`profile.transfer.notification.recipient.resolve` permission. A caller-supplied
service flag is insufficient. Definitions are default-off in
`config/properties.js.profileTransferNotifications` and require qualification.

Exact body:

```json
{"source":{"operationCode":"TRANSFER_<reference>","side":"RECIPIENT"},"channel":"IN_APP"}
```

`side` is `SENDER` or `RECIPIENT`. No owner, destination, contact, tenant or
alternative source selector is accepted. Contradictory transport body aliases
and query parameters refuse. The original runtime context and policy are pinned
across all asynchronous reads.

Profile calls Wallet's private `/internal/transfers/notification-source` using
the existing `DefaultModuleService` with `requireInternalAuth:true`, explicit
LOYALTY authority, protected transport and bounded response. It never substitutes
authData, constructs service credentials or forwards a human token. Wallet must
prove a committed receipt with matching canonical debit and credit ledgers.
Profile reads it again after resolving identities/preferences; changes refuse.

The response envelope is `SUC_PRFL_00000` with `data` containing version 1,
tenant, sourceCode, sourceDigest, side, typed owner, channel and recipients.
Each recipient contains exactly canonical `recipientId` and opaque
`recipientAddressReference`. The reference binds tenant, immutable source digest,
side, typed owner and canonical inbox ID. There are no contacts, login identifiers,
balances, credentials, employee details or recipient names in this projection.

## Governed Selections

- Customer source owner: its own active Customer inbox, with explicit
  `transferNotificationPreferences.IN_APP === true`.
- Enterprise source owner: the active same-tenant Enterprise in Profile's
  authority partition, explicit Enterprise opt-in, and explicit
  `transferNotificationRecipients` entries `{employeeCode}`. Each selected Employee
  must be an active same-tenant human, independently opted in, with current
  canonical identity/membership, persisted `loyalty.wallet.read` and matching
  effective scope without a matching denial. Employee inbox IDs use the existing
  `profile-employee:` namespace and cannot collide with Customer records.
- Missing/false preferences or an absent Enterprise roster yield no recipients.
  Missing/inactive Employees are omitted; malformed, unavailable, cross-tenant,
  duplicate or ambiguous authority refuses. No acting employee, adminEmail,
  Customer mapping, contact-list or login fallback is permitted.

The [shared recipient selector](notification-recipient-projections.md) owns this
read-only identity projection. Complete `recipientSelection` defaults live in
Profile properties; the domain wrapper retains committed-source proof and hashing.

These selections belong in governed Profile records, never Wallet or runtime
properties. The parent integration field declarations are in Wallet's
`llm/contracts/transfer-notifications.md`. This read-only endpoint does not
create, mutate or assign recipients, or add a public Customer CRUD grant.

## Delivery Boundary

Wallet freezes each side once on the original transfer receipt. Communication's
source eligibility check calls this same Profile contract again before delivery.
Withdrawal suppresses the frozen target; unknown evidence defers delivery. A new
Enterprise roster cannot readdress an existing intent. Communication owns all
suppression, retry, uncertainty decisions, inbox records and attempts.

The existing canonical Customer/Employee `IN_APP` transport is implemented.
Employee inbox reads use the original human bearer through Profile's self-identity
endpoint and Communication's existing employee reader, without a personal Customer
account. EMAIL/SMS require a separately qualified destination/consent contract.

## Verification

`nodics.loyalty/modules/loyaltyWallet/test/loyaltyTransferNotifications.test.js`
exercises this actual router declaration, controller, facade, service, runtime
principal validator, existing Profile generated-read boundary, Wallet source
proof and real Communication facade/runtime/template/inbox logic. Storage and
credential transport are isolated test ports. These tests do not issue tokens,
access a database, start a runtime, configure grants or activate delivery.
`test/profileNotificationRecipients.test.js` additionally exercises actual canonical
membership identity, group ancestry/catalogue and persisted effective-scope owners.
The Wallet fixture now follows a delivered Employee message through Communication's
actual Employee inbox facade and Profile's self-identity method. It checks exact
message/source isolation and unchanged original human bearer; a forged bearer
cannot invoke Profile. No Customer account is provisioned for the Employee.
