# Auction Notifications And Consumers

## Committed Events

`DefaultBiddingAuctionNotificationService.capture` records immutable facts in
`biddingAuctionRound.notificationEvents` in the same revision CAS as selection,
cancellation and confirmed releases. There is no new outbox, timer or delivery
worker. Events are SELECTED (seller), WINNER_PENDING (selected buyer), CANCELLED
(seller and each cancelled offer's owner), UNSELECTED_RELEASED (each unsuccessful
offer's owner, only after exact release or no hold), and UNSOLD (seller after
complete cleanup). Selection is not payment confirmation. Events contain no
wallet, employee login, contact address or another buyer's private offer.

Auction `save` invokes `SERVICE.DefaultBiddingAuctionNotificationService.capture`
so the runtime's effective implementation participates in every revision write.
`capture` calls its exported `addEvent` and `hash` members through `this`. Overrides
must retain original round/event identities, existing frozen facts and atomic CAS
placement. Event construction has no persistence, delivery or private-admission
side effects. A capture error prevents the write. The owner auction contract tests
cover effective member dispatch, retained-event replay and failure before CAS.

The default-off, unqualified `bidding.auction.notifications` policy owns complete
transport, recipient/page bounds, locale and template selections. Framework
presentation lives in `src/templates/in_app/auction-*`; templates require explicit
Communication selection. Installing definitions never grants access or sends.

`flush` re-admits the participant or scheduler, reads committed events and asks
Profile for the exact source owner's approved recipients. Freeze the returned
opaque inbox references, template, variables and deterministic key by round CAS
before calling existing `/internal/communications`. Lost acknowledgement repeats
that same message; recorded intent pointers never request another intent. Intent
acceptance is not delivery. Failures remain `notificationPending`, independent of
financial state. The bounded Cron sweep retries outstanding handoffs. Communication
alone owns delivery, retries and operator decisions.

## Profile Boundary

Required Profile port: POST `/internal/auctions/notification-recipients` accepts
`{source:{roundCode,eventCode,storeCode},channel:"IN_APP"}`. No owner/actor/recipient
may be supplied. Profile must call Bidding's private POST
`/internal/auctions/notification-source` with the flattened source plus channel,
using original service credentials, `profile` module admission and
`commerce.bid.manage`. Bidding derives the governed store partition, validates
tenant and exact persisted event, and returns:

```js
{ contractVersion: 1, committed: true, tenant, sourceModule: "bidding",
  sourceType: "AUCTION_" + kind, sourceCode: eventCode, sourceDigest,
  roundCode, eventCode, storeCode, channel: "IN_APP",
  owner: { ownerType: "CUSTOMER" | "ENTERPRISE", ownerCode } }
```

Profile's response preserves those exact fields and adds `recipients`, each exactly
`{recipientId,recipientAddressReference:"profile-inbox:<64 hex>"}`. Resolve fresh
active typed owners, current auction preferences and an explicit Enterprise
roster. Do not reinterpret transfer-specific preferences, select all employees,
copy the bidder actor, fabricate inbox references or infer contact consent.
Profile implements this port in `DefaultProfileAuctionNotificationRecipientService`
and reuses `DefaultProfileNotificationRecipientService` for the current Customer
or explicit Employee roster. `profileAuctionNotifications` owns its inert defaults,
qualification, permission and recipient selection; records own preferences and
rosters. Bidding does not implement membership or infer a missing recipient.
The composed Bidding unit regression runs both actual Profile services, Bidding
source callbacks and Communication eligibility with isolated storage, membership,
scope and transport ports. It verifies Customer and Enterprise recipient identity,
deny/roster/preference revocation and immutable destinations.

The framework-contributed Communication `dispatchEligibilityOwners` map selects
`DefaultBiddingAuctionNotificationService.isDispatchEligible` for the five source
types. It calls Bidding's private `/internal/auctions/notification-eligibility`
using Communication's original runtime. That endpoint requires `commsApi` scope,
`commerce.bid.manage`, the exact retained event/message in the signed marketplace
partition and a fresh Profile recipient proof. Revocation can suppress but never
readdress the frozen intent. Unknown proof fails closed. Runtime composition must
make this adapter callable and qualify source trust, templates and both transports;
none is activated by these source contributions.

## Existing Scheduler

The explicit `auctionCloseSchedule` data section targets Cron's existing CRON_JOB
installer. `biddingAuctionCloseJob` is inactive, does not run on init, has one
node owner, and selects `DefaultBiddingCloseService.sweep`. Its reference cadence
is once per minute, subject to governed schedule review. No import was run.

The callable rechecks Cron's operational authority, exact original auth and token
before forwarding each bounded page to Commerce POST `/internal/auctions/close-due`
with `{afterCode}`. Commerce independently admits the signed service principal's
manage permission. Do not run Commerce persistence in the CRON runtime or forge
participant claims. OPEN end and GRACE deadline are separate due selectors;
indefinite rounds have no scheduled close. Deadline-based closure keys are stable.
Manual and scheduled selection use the same CAS and highest/earliest fallback.
Partial failure returns RECOVERY_REQUIRED and retained continuation, never a
replacement winner or unlocked hold. No job, capability or runtime was activated.

## Storefront And Purchase

POST `/internal/auctions/publication` is service-only and accepts exactly
`{productCode,publicationCode,storeCode}`. It revalidates published Product terms
and reads the deterministic persisted round. It returns only matching coordinates,
`roundCode` (null if not yet created) and status, never private offers or selection.
eWaste's BUNDLE projection preserves AUCTION even with no round, and reads this
owner proof instead of inventing an ID or turning the offer into fixed-price sale.

GET `/auction-publications/:productCode?storeCode=...` is participant-authenticated.
It returns an existing private round or reviewed published terms and OPEN only
for its current typed seller when prior cleanup permits. POST `/auctions` accepts
the reviewed publicationCode with productCode, variantCode, storeCode, confirmation
and original idempotency key. Changed publication rejects. A terminal round is
not reopened; fresh published terms are required. All original open-time authority,
Product/Digital holdings and prior-purchase reconciliation checks still apply.

Only the selected buyer receives `selection.purchase` after confirmed hold handoff:

```js
{ kind: "AUCTION", roundCode, bidCode, storeCode, productCode, variantCode,
  cartCode, orderCode, priceQuoteCode, amount, currency, expiresAt }
```

All fields except literal `kind` are strings; `amount` is the exact decimal string
and `expiresAt` the retained UTC intake deadline. The enclosing participant round
has `status:"SELECTED"`, `participantRole:"BUYER"` and
`selection.status:"CHECKOUT_READY"`. Cart exists at preparation; `orderCode` is
the reserved Order identity, not proof that a placed Order already exists.

`BidComposer` accepts `onSelectedPurchase(dto)` through Circa `AuctionJourney`,
which mounts the separate `AuctionPurchase` consumer. Without a callback, its link is
`/shop/:productCode?auctionRound=:roundCode&storeCode=:storeCode`; the destination
must reread Bidding under the current customer/Enterprise session. URL values are
selectors, never authority or terms. Use the original Cart/Order and normal
Checkout review/status APIs; do not create a second Cart, edit selected entries,
send owner/funding claims or assume selection means completed payment. Expired
intake/recovery belongs to Checkout, not browser re-award. `BidHistory` mounts
the same selected-purchase consumer directly when no custom callback is supplied,
including sold-out or no-longer-public listings. Its eWaste adapter forwards the
original signed Customer/Enterprise identity, follows bounded complete Bidding
pages including empty visible pages, and rejects partial or malformed histories.
Legacy Circa negotiation mutation adapters are closed; generic Bidding is intact.

The selected UI reads original command status before inspecting/calculating the
existing Cart. It never creates another Cart, sends funding selectors or treats a
reserved amount as newly available balance. The stable key is
`auction-purchase:<retained orderCode>`. An uncertain placement is status-only;
qualified `RESUME_ORIGINAL_PLACEMENT` with exact original Cart/Order permits
`POST /checkouts/:originalCommand/recovery/resume {confirmed:true}` only. An
uncertain cancellation fences placement and retains the original cancellation
key. Session transitions drop private state; no recovery token is persisted.

The existing private `GET /checkouts/:orderCode` also exposes the exact retained
`placementKey` or `cancellationKey`, including `CANCELLATION_PENDING` before a
release is confirmed. Reload recovers these owner records before Cart review;
a non-secret sessionStorage cancellation hint preserves a request whose owner
acknowledgement was lost and cannot authorize funds. Only the original cancellation
key may retry. A completed receipt must bind `code` and `orderCode` to the original
Order and `cartCode` to its original Cart, including direct placement responses.
Checkout derives payment preparation selectors from the retained commitment,
rejects browser funding selectors and does not check held funds as new balance.

Unit coverage runs actual Cron trigger and Communication eligibility source with
isolated transport/storage. It is not live, database, provider or E2E qualification.

## Canonical CMS Documentation

The owner-local `data/docs-v001` pack provides the auction business, developer,
operator and recovery guide at `/docs/framework/commerce-auction-rounds`.
Its direct CMS blocks, source metadata, search and publication records are Staged;
the manifest pins normalized final bytes. Installation, review and publication
remain explicit. Do not recreate prose through the retired documentation generator
or label source/unit evidence as deployed delivery.
