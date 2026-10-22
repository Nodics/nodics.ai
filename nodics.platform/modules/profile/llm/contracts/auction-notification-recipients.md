# Auction Notification Recipients

Profile implements `POST /internal/auctions/notification-recipients`. Bidding
retains the committed auction event; Profile owns current identity, permission,
scope and consent; Communication owns its existing durable intents and inbox.
This endpoint neither sends messages nor creates identities, grants or an outbox.

## Private API

The body is exactly:

```js
{ source: { roundCode, eventCode, storeCode }, channel: "IN_APP" }
```

Require sensitive request capture, a genuine signed Profile-scoped runtime token,
the `bidding` module grant, `profile.commerce.notification.recipient.resolve`, and
the exact signed tenant/Enterprise context. Human/system principals, conflicting
body/header/query aliases, caller-selected owners and contact selectors refuse.
The controller preserves the original request through the facade and sets
`Cache-Control: no-store`. Errors expose only `ERR_AUTH_00003`.

Profile calls Bidding's existing private
`POST /internal/auctions/notification-source` with the flattened source and
channel. The detached transport contains only tenant and source coordinates;
`requireInternalAuth` requests genuine owner-managed runtime authentication.
It never manufactures service claims or forwards a human bearer. Bidding requires
Profile scope and `commerce.bid.manage`, derives the governed Store partition,
and reads the retained event. Its proof is checked and reread before returning:

```js
{ contractVersion: 1, committed: true, tenant, sourceModule: "bidding",
  sourceType: "AUCTION_" + kind, sourceCode: eventCode, sourceDigest,
  roundCode, eventCode, storeCode, channel: "IN_APP",
  owner: { ownerType: "CUSTOMER" | "ENTERPRISE", ownerCode },
  recipients: [{ recipientId, recipientAddressReference: "profile-inbox:<sha256>" }] }
```

Kinds are SELECTED, CANCELLED, UNSELECTED_RELEASED, WINNER_PENDING and UNSOLD.
The proof owner is the event's typed participant, not the Store issuer or the
employee who submitted the bid. The opaque reference binds tenant, event code,
immutable source digest, typed owner and recipient. Changing immutable facts
cannot retain the same delivery address proof. No contact/login/group escapes.

## Framework Policy And Records

Complete `profileAuctionNotifications` definitions live in Profile
`config/properties.js`: `enabled:false`, `qualified:false`, Commerce connection,
5000ms timeout, secure-only transport (loopback override false), 20 recipients,
the existing private permission and the five source types. `recipientSelection`
defines `auctionNotificationPreferences`, `auctionNotificationRecipients`,
`commerce.bid.participate` and capability `bidding`. The shared selector's
`maximumGroups:100` is also Profile-owned. Missing policy refuses; deployments
may intentionally override definitions, but business rosters/grants are records.

Customer, Employee and Enterprise schemas carry optional
`auctionNotificationPreferences`; only explicit `IN_APP === true` opts in.
Enterprise carries optional `auctionNotificationRecipients:[{employeeCode}]`.
The existing [shared selector](notification-recipient-projections.md) requires:

- Active exact Customer identity and canonical lock/anchor proof for Customer
  events; the Customer receives only its own existing inbox.
- Active same-tenant Enterprise in the authority partition, explicit roster and
  both Enterprise and Employee opt-in for Enterprise events.
- Fresh canonical human Employee membership, persisted valid group ancestry and
  Bidding participant permission, plus a matching effective scope without denial.
  A scope does not grant a missing permission. The participant permission is the
  existing Bidding read/participation route contract, not the private manage grant
  used by the runtime callback; runtime authority never confers recipient access.
- Existing `profile-employee:<code>` inbox identity with no Customer collision.
  No personal Customer creation, seller/bidder actor, administrator, all-staff or
  contact fallback.

Profile rereads selections and source proof and pins policy/request authority
across awaits. Opt-out/inactive/no grant produces no eligible recipient;
unavailable or ambiguous evidence fails, not a successful skip. This is not
database snapshot isolation. Bidding's Communication eligibility hook calls this
endpoint again; revocation suppresses the frozen recipient and never readdresses
an existing intent. Public generic CRUD admission is unchanged.

## Acceptance And Operation

`test/profileNotificationRecipients.test.js` composes the actual Profile
controller/facade/shared selector with canonical membership, generated-record
reader, persisted group/catalogue/router/scopes and runtime-token validators.
Auction cases use Bidding's actual source, round reader, proof and recipient
client. Only persistence and authenticated transport are isolated unit ports.
Coverage includes independent permission/scope checks, all event kinds, default
gates, source/error/tenant drift, private admission, no fallback, source-bound
hashes and redacted callback errors. Digital reminder and Wallet transfer suites
separately cover their wrappers with real Communication durable inbox behavior.
The auction fixture also calls Bidding's real Communication dispatch-eligibility
adapter and endpoint: revoked grants or removed roster entries suppress the
retained recipient, and unavailable source evidence remains an error.

Installed schema/index readiness, governed recipient preferences and grants,
runtime scopes/permissions, secure connections, Bidding qualification, template
selection and Communication trust still require operator qualification. No source
change activates these gates or runs delivery. Live/database/provider/E2E tests
remain deferred; EMAIL/SMS require their own destination and consent contract.
