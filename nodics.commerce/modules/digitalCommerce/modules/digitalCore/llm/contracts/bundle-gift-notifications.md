# Whole-Gift Notifications

Digital owns gift state/evidence; Profile owns current participants, explicit
recipient selections and opt-in preferences; Communication owns immutable intents,
rendering, inbox delivery, suppression and retries. No second outbox, contact
registry, wallet writer, timer or automatic activation is introduced.

## Commit Boundary

`DefaultDigitalBundleGiftService` requests handoff after all reserve receipts
(`PENDING`), all transfer/finalize receipts (`ACCEPTED`), or all release receipts
(`CANCELLED`, `DECLINED`, `EXPIRED`) are persisted. Expiry retains `decidedAt`.
Opening a message is never acceptance. Partial or uncertain ownership operations
emit no successful terminal event; recover their original owner operation.

`DefaultDigitalBundleGiftNotificationService` independently reads the operation,
original manifest partition/digest/revision and every exact component receipt.
Unexpired undecided PENDING sources become ineligible when a decision wins.
Terminal sources must match retained decision and status. Transaction-bound
dispatch refuses. Messaging failure never undoes committed holdings.

Both original sides use Profile-selected opted-in recipients only; the actor is
never a fallback. Frozen event selections and Communication pointers live on the
original operation's `evidence.giftNotifications`. An explicit empty selection is
frozen. Unavailable/contradictory Profile evidence is UNCONFIRMED, not empty. CAS
saves preserve concurrent decisions. Public results remove private plans and
refresh the operation revision after pointer saves.

## Profile Contract

Digital calls Profile `POST /internal/bundles/gifts/notification-recipients`:

```json
{"source":{"enterpriseCode":"business","operationCode":"bundle-operation:<sha256>","event":"PENDING","side":"RECIPIENT"},"channel":"IN_APP"}
```

Events: `PENDING|CANCELLED|ACCEPTED|DECLINED|EXPIRED`. Sides: `SENDER|RECIPIENT`.
Profile independently calls Digital
`POST /internal/bundles/gifts/notification-source` with the four source fields
plus channel flattened into the body. Never accept an owner from a caller.

```javascript
{
  contractVersion: 1, tenant, sourceModule: 'digitalCore',
  sourceType: 'DIGITAL_BUNDLE_GIFT_' + event,
  source: { enterpriseCode, operationCode, event, side }, channel: 'IN_APP',
  eligible: true, sourceDigest,
  ownerRef: { type: 'CUSTOMER', code: 'original-participant' }
}
```

Ineligible responses omit ownerRef/sourceDigest. Enterprise references use
`type:'ENTERPRISE'`. Profile preserves exact source, tenant, channel, eligibility,
digest and ownerRef and adds `recipients:[{recipientId,recipientAddressReference}]`.
References are opaque `profile-inbox:<sha256>`. Profile owns current membership,
permission/ALLOW/DENY and explicit owner/employee opt-in, independently of gift
enable preferences. Missing selection never chooses an administrator/purchaser.

The source route requires private sensitive runtime admission, Profile scope,
`commerce.digital.notification.read`, COMMERCE role and exactly one
`digitalCore.giftNotifications.sourceCallers` grant matching tenant,
principalEnterpriseCode, business enterpriseCode, serviceId, projectCode,
environmentCode, serverCode, instanceCode and assignmentCode. Signed namespace
aliases remain the runtime identity; only the reviewed body selects business.
Request, headers, auth and policy remain bound across reads.

## Delivery And Recovery

Source codes encode business partition, operation, event and side; they are not
authorization tokens. Stable per-recipient/channel keys exclude clocks, attempts,
locale and template changes. Freeze template, variables, locale and recipient
before Communication admission. Lost acknowledgement reuses the exact request.
Once an intent code is retained, owner replay inspects only; Communication alone
retries delivery. `RECORDED` is not a delivered claim.

Digital `POST /gifts/notifications/retry` accepts exactly
`{operationCode,event,side}` and requires fresh authority for that participant.
It calls no reserve/release/decision/transfer/finalize method. Results expose only
handoff status and side/status outcomes, not recipient IDs or message bodies.

Five IN_APP resources live under `src/templates/in_app/gift-*`. The configured
dispatch-owner hook repeats source/current-recipient checks before claim/send,
including retries. Changed source, revoked authority or opt-out suppress unsent
intents; they cannot change a frozen recipient or repeat holdings transfer.
EMAIL/SMS/Telegram are not selected or implemented by this contribution.

## Defaults And Qualification

Framework `giftNotifications` owns enabled/qualified false, empty sourceCallers,
IN_APP, English, five template codes, Profile/Communication connection names,
10000ms timeout, 20 recipients per side and insecure loopback false. Validation
bounds recipients to 1..100 and timeout to 1..60000ms. Later layers override values
only. Business recipients/preferences remain governed Profile records.

The delivery runtime must load the dispatch-owner service/contribution and
reviewed private Profile transport. Source presence/template discovery/module
activation do not qualify installation. Digital reuses notification.read and
bundle.manage permissions; Profile owns its route/selection contribution. No
automatic permission assignment or schedule is added.

## Unit Evidence

`test/digitalBundleLifecycle.test.js` composes real bundle persistence/CAS, source,
Communication rendering/runtime/intents/inbox with isolated storage/transport.
Coverage includes all five events, hidden plans/current revisions, notification-only
replay, lost acknowledgement/frozen content, empty selections, opt-out, pending
suppression, foreign proof/grants/aliases, partial transfer and inert defaults.
That focused fixture's Profile protocol double is not installed identity acceptance.
Profile's `test/profileNotificationRecipients.test.js` separately composes the
actual recipient controller/facade, current identity and consent selectors,
Digital source/receipt readers and recipient client with Communication intents
and inbox delivery. It covers Customer and Enterprise participants, all five
events, explicit rosters, permission/opt-in revocation, source drift, lost
acknowledgement and stale pending suppression. Run both owners' suites together;
neither unit composition qualifies installed credentials, routing or delivery.
No live import, provider, message, timer, server, E2E or release action was run.
