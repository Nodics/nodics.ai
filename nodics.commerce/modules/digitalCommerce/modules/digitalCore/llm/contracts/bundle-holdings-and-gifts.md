# Bundle Holdings And Gifts

Digital Core owns immutable bundle manifests, original operation identities,
per-component receipts, recipient decisions and Enterprise gift preferences.
Generated `digitalBundleManifest`, `digitalBundleOperation` and
`digitalBundleOwnerPolicy` services persist these records. Generic HTTP CRUD is
disabled. Actual certificate/carbon holdings remain with their component owners.
Customer HTTP dispatch derives tenant and Enterprise namespace from authenticated
route authority before invoking these owners. Body, query or pre-existing request
fields never select a replacement persistence scope.

## Component Contract

`DefaultDigitalBundleService.create(request, input)` accepts:

```javascript
{
  ownerRef: { module: 'profile', schema: 'customer', code: 'owner' },
  idempotencyKey: 'original-owner-command',
  components: [{
    kind: 'CERTIFICATE',
    reference: { module: 'wasteCore', schema: 'wasteAsset', code: 'certificate' },
    quantity: '1',
    expectedRevision: 3
  }]
}
```

Enterprise owners use `schema: 'enterprise'`. The other admitted component kind
is `REALIZED_CARBON`, with required `unitOfMeasure` and a positive decimal quantity validated for precision
and realized/available eligibility by the carbon owner. References are unique;
empty bundles, rewards and purchased coupons reject. Carbon may be selected
independently of included certificates. The returned manifest has an immutable
`code`, `revision`, `digest`, `ownerRef` and ordered `components`.

Framework `digitalCore.bundles.componentProviders` selects services. A caller
cannot select service names. Providers expose `inspect`, `reserve`, `transfer`,
`release`, `finalize`, each receiving `(request, input)`.

`inspect` input is `{ component, ownerRef }`; result must include
`{ available, ownerRef, revision }`. Mutating input includes `component`,
`operationKey`, `bundleCode`, `manifestRevision`, `componentCount`, `ownerRef`, `recipientRef`,
`purpose`, and previous `hold` / `transfer` receipts. The immutable operation
key is reused across retries, including an interrupted acknowledgement.

Mutation receipts are `{ status, operationKey, reference, quantity, receiptCode }`.
Statuses respectively are `RESERVED`, `TRANSFERRED`, `RELEASED`, `COMPLETED`.
The receipt must identify the exact operation and original component quantity.
The provider independently enforces tenant, canonical owner, revision, realized
eligibility and competing holds, using its generated persistence/CAS authority.

Transfer changes ownership but keeps the component unavailable for onward
activity. Only `finalize` unlocks a transferred component, and Digital calls it
after every transfer receipt is retained. Release must refuse a transferred or
uncertain component. An unrecorded reserve may have succeeded remotely; release
must reconcile its original key even when no local reserve receipt exists.
No component operation transfers physical custody, original contributor history,
future carbon allocations or material-value entitlements.

`DefaultDigitalCertificateComponentService` dispatches fixed bundle phases
through the existing qualified Digital ownership transport. eWaste authenticates
the domain call and delegates to WasteCore's certificate component owner. That
owner retains the asset lock until finalization, including across a lost event
acknowledgement. Its generated asset/event records remain authoritative.

`DefaultDigitalCarbonComponentService` calls the actual WasteCarbon holdings,
reservation, transfer, release and transfer-finalization APIs through configured
Waste authority. Carbon qualification defaults false and is unchanged by this
source integration. The adapter declares `retainsTransferLock:true`: TRANSFERRED
evidence carries destinationHold HELD, and recipient quantity remains reserved
until Digital retains every transfer receipt. Mixed certificate/carbon and
multi-carbon manifests use the normal complete-bundle phases.

Finalize calls POST /carbon/transfers/finalize with identical lot, original owner,
recipient, quantity, unit, operation key and manifest reference. The coordinator
needs carbon.holdings.finalize; its explicit forward definition is in Carbon's
transferFinalizationPermission data section. Completion requires owner evidence
COMPLETED, destinationHold RELEASED and valid finalizedAt. Transfer lookup alone
never completes a bundle. Lost acknowledgements resume the same key without
another credit; release refuses transferred/completed holdings. Focused tests
load real Digital bundle/Carbon owners with generated-repository doubles and a
certificate-port fixture, including partial mixed transfer and lost finalization.
No live registry or cross-owner database atomicity is claimed.

## Authority And Gift API

The effective `DefaultDigitalBundleAuthorityService.matchesScope` member applies
the same wildcard capability and permission matching to Profile allows and
denials. Tenant and Enterprise qualifiers constrain GLOBAL/TENANT scopes as well
as ENTERPRISE scopes. A matching deny wins over an allow. The predicate performs
no admission: `authorize` retains the original-token Profile read, independent
permission checks and typed owner/actor separation. Later-layer overrides must
preserve those invariants; `test/digitalBundleAuthority.test.js` exercises wildcard
denials, foreign qualifiers, independent permissions and effective member dispatch.

Framework `digitalCore.bundles.ownerAuthorityService` supplies:

- `authorize(request, {ownerRef, action})` returns
  `{authorized:true, tenant, ownerRef, actorRef}` only after Profile admission.
- `resolveRecipient(request, {ownerRef})` returns `{active:true, ownerRef}` for
  an existing, visible canonical recipient. No invitations or placeholder owners.

Actions are `BUNDLE_CREATE`, `BUNDLE_LIST`, `GIFT_SEND`, `GIFT_RECEIVE`,
`GIFT_CANCEL`, `GIFT_CONFIGURE`. Enterprise receive/configure requires the
approved Enterprise Admin grant; the actor is retained separately from owner.

`POST /bundles` creates the manifest. `POST /gifts` accepts `manifestCode`,
`manifestRevision`, selected `recipientRef`, `idempotencyKey`, `confirmed:true`.
It reserves all components before returning `PENDING`. `POST /gifts/decision`
accepts `operationCode`, `expectedRevision`, `decision: ACCEPT|DECLINE|CANCEL`,
`confirmed:true`. Recipient acceptance competes with decline/cancel/expiry using
one revision fence. The sender retains ownership while pending. Completed gifts
are final; failed decisions resume the original operation.

`POST /gifts/query` accepts `{ownerRef,direction:SENT|RECEIVED,page,pageSize}`.
It returns owner-authorized paged summaries, immutable manifest components,
deadline, decision, `allowedActions` and `recoveryRequired`, without private
component receipts. Tenant isolation is fixed before the query; recipient access
can read the original gift's Enterprise partition only after authorizing that
recipient. Recipient selection uses Profile's `/participants/search` and
`/participants/resolve`, never a local contact or owner directory.

`POST /gifts/settings` accepts canonical Enterprise `ownerRef`, both independent
Boolean selections and `expectedRevision` for updates. Changes affect new gifts
only. Both switches default enabled exclusively in framework properties.

Gift expiry is retained from `digitalCore.bundles.giftExpirySeconds`. Its complete
framework default is 259200 seconds (72 hours), an engineering default, not a
negotiated pilot term. Intentional overrides may select another positive integer;
changing configuration never changes an existing gift's deadline. An explicit null
override refuses new gifts. Expiry uses the internal `expire` command;
it is not a public release API. Expiry requires a tenant-bound service token with
`commerce.digital.bundle.expire` and cannot undo acceptance. The
[owned inactive Cron definition and binding](gift-expiry-schedule.md) reaches this
persisted command through the existing trigger; installed scheduler/Communication
and provider qualification remain separate acceptance requirements.

## Recovery And Integration Limits

The account composer also supplies optional `composition` to manifest creation:
`{mode:GIFT,operationKey,recipientRef}` or `{mode:FIXED|AUCTION,operationKey,terms}`.
Digital normalizes and persists it plus `compositionDigest` in the existing
immutable manifest. Reusing the create key with different composition conflicts,
including insert races. Subsequent gifts/listings must match the retained
instruction. Other manifest consumers may omit composition; this is not a shim
for missing reviewed intent, and their manifests cannot be resumed as composer
commands without an original retained instruction.

Private participant POST `/bundles/commands/query` accepts only
`{ownerRef,manifestKey}`. It authorizes the current owner, derives the original
manifest identity in the signed participant namespace, verifies immutable
contents/instruction and reads the exact original operation across the retained
merchant namespace. Count must equal returned rows, at most one; failed,
truncated, foreign or changed evidence refuses. No pagination absence is used.
The response is `{contractVersion:1,ownerRef,manifestKey,status,canResume}` plus
allowlisted operation/product/round/deadline fields when present. No instruction,
credential, component receipt or private actor data is exposed.

UNCONFIRMED never authorizes replacement. A retained manifest without its next
operation is PREPARED, resumable using only the original instruction. Explicit
POST `/bundles/commands/resume {ownerRef,manifestKey,confirmed:true}` reauthorizes
and invokes existing gift/publication commands. Holds, recipient qualification,
governed context revision, precision and publication receipts remain owner checks.
Already confirmed outcomes are returned without redispatch; uncertain receipts
never justify a fresh operation key or automatic release. Framework
`bundles.commandRecovery` owns maximumKeyLength 200 and exactReadPageSize 2;
later layers may override defined mechanics only, never provide business defaults.

Private participant POST `/gifts/inspect {ownerRef,operationCode}` reads the exact
gift regardless of page movement. It authorizes sender/recipient, returns current
revision/decision/status and `canResume` only for that participant's already
retained decision in TRANSFERRING/TRANSFERRED/RELEASING. Continuing uses existing
`/gifts/decision` and the server-observed original decision/revision. It never
offers an inverse or claims acceptance from a PENDING/absent observation.

## Live Whole-Gift Acceptance

Digital owns `acceptance:digital-whole-bundle-gift`. The runner uses only the
installed `/bundles`, `/gifts`, `/gifts/inspect`, `/gifts/decision` and secured
gift-expiry APIs. It creates four fresh multi-component manifests under stable
keys and proves reservation plus ACCEPT, DECLINE, CANCEL and EXPIRE outcomes.
ACCEPT requires exact reserve, transfer and finalize receipts for every selected
component; decline and cancellation require exact release receipts. Expiry uses
the existing bounded owner sweep and accepts only the selected operation as its
result. It does not provision identities, holdings, permissions, runtime grants,
schedules or providers.

Replaying the original send key after a terminal decision returns the retained
terminal operation without re-entering the pending-notification handoff. This
lets interrupted acceptance reconcile exact owner receipts without creating a
second gift, decision, expiry command or misleading pending message.

Execution requires an explicit reviewed Local profile, an attested isolated
tenant/business partition, a short bounded expiry window, externally supplied
sender/recipient/scheduler sessions and `--execute`. Deployment identities and
fixtures remain customer-owned `tooling.acceptance` selections; secrets remain
environment inputs. A denied owner, partial receipt, foreign sweep result or
unknown HTTP outcome returns recovery-required evidence and never qualifies the
journey. Repeating the runner resumes the same manifest, gift and decision keys;
it creates no compatibility route or alternate gift authority.

The browser retains only opaque original keys/codes in sessionStorage, scoped by
actor, canonical owner and capability without bearer/revision. Save failure stops
dispatch; refresh/remount/reload require exact owner reads. PENDING gift submission,
COMPLETED gift, PUBLISHED listing or RELEASED original operation can clear a
matching composer hint; terminal gift decision can clear its matching gift hint.
Legitimate new work remains available after resolution. Cleared storage/new
devices and pre-persistence unknown outcomes still require original-reference
operator reconciliation, not fabricated history or another attempt with a new key.

Digital persists checkpoints after every confirmed component receipt. A lost
acknowledgement leaves `RESERVING`, `TRANSFERRING`, `TRANSFERRED` or `RELEASING`
and resumes the original key. No timeout alone unlocks a component. An active
listing hold has no checkout timeout; only its owning publication/purchase
coordinator may fence withdrawal or transfer after independent evidence.

The current source includes persisted bundle/gift coordination, Profile-backed
participant admission, certificate component locking and the retained-hold Carbon
adapter above. Product publication and Checkout/Payment/Loyalty settlement are
implemented by the linked [publication](bundle-publication.md) and
[settlement](bundle-settlement.md) owners. Gift messaging uses
[postcommit Communication delivery](bundle-gift-notifications.md), and the bounded
expiry sweep has an explicit inactive Cron contribution and start-node binding.
Installed owner qualification, recipient/template selection and schedule activation
remain separate acceptance requirements. Missing
qualification fails closed; configuration does not qualify a deployment. Focused unit tests establish source
behavior with isolated persistence, never installed database/provider acceptance.

Later layers may replace component providers, keeping receipt identity, locking,
replay and negative contracts intact. Customer/runtime configuration contains
only intentional overrides of framework-defined properties. Business participants,
amounts, selections and receipts remain governed records.
