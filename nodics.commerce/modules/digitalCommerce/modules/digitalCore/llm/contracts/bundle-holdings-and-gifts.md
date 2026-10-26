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

Unqualified Carbon transport (or incomplete existing transport settings) refuses
before RPC with `ERR_DIGITAL_BUNDLE_OWNER_UNAVAILABLE` (HTTP 503). This is owner
service unavailability, not the 409 component quantity/revision refusal. Keep the
qualification guard and fixed public message; do not turn downstream failures
into availability evidence or expose transport internals.

Qualification remains a separate deployment boundary. Digital's Carbon adapter
calls `DefaultModuleService.invokeModule` without forwarding the human bearer;
the existing transport obtains its runtime service credential. The selected
Commerce-to-Waste service principal must be admitted in the same tenant with the
exact Carbon endpoint permissions: read for inspection, then reserve/transfer/
release/finalize for their respective phases, with route exposure, target routing
and private owner persistence independently qualified. Native human Admin Carbon
reads or synthetic lot availability do not qualify that service-to-service path.
Human bundle authorization remains an independent Digital/Profile gate. This
error correction neither activates qualification nor creates a service profile,
role, runtime grant, or authority substitution. Resolve any missing existing
service authority separately; never forward Admin credentials as a workaround.

The focused Carbon adapter test uses the real NodicsError/status convention and
asserts HTTP 503 with zero RPC calls for false qualification and malformed
existing settings. This is source evidence, not installed transport acceptance.

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
gift regardless of page movement. It requires `HOLDINGS_READ`
(`commerce.digital.own.read`) with fresh Profile admission before and after the
exact read, then verifies the owner is the retained sender or recipient. Reading
a gift never requires create, cancel or Enterprise configuration permissions.
It authorizes sender/recipient, returns current
revision/decision/status and `canResume` only for that participant's already
retained decision in TRANSFERRING/TRANSFERRED/RELEASING. Continuing uses existing
`/gifts/decision` and the server-observed original decision/revision. It never
offers an inverse or claims acceptance from a PENDING/absent observation.
`canResume` describes retained-state eligibility only; `/gifts/decision` still
independently requires the existing sender/recipient decision authority. No
inspection result grants acceptance, cancellation or configuration privileges.
Confirmed permission, represented-owner and scope denials use nAuth's existing
`ERR_AUTH_00003` (HTTP403, Access denied). Exact inspection returns that same
non-disclosing denial for absent or nonparticipant gifts. Do not catch all errors
and relabel them as authorization failures: unavailable/malformed Profile evidence,
incomplete persistence and transport faults remain distinct failures. No customer
configuration or alternate error-response authority is required.
Regression coverage uses the real Digital authority and permission matcher with
isolated Profile/persistence I/O, including a recipient in a different Enterprise
namespace, missing read permission, foreign owner/tenant and revoked/denied scope.

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

## Prepayment purchase cancellation

Checkout's existing compensation/recover route owns orchestration. Digital's
`recoverPrepayment` independently requires the exact original prepayment phases,
false Inventory/true Digital uncertainty, original index-zero key, owner/Cart/Order
and RUNNING bundle recovery claim (or COMPLETED for read-only replay). Fresh zero
original Payment reads bracket the operation; attempted Payment denial recovery
is a separate contract and must never be fabricated for a prepayment failure.

Reuse the canonical deterministic PURCHASE operation. No-claim cleanup inserts a
CANCELLED purchase fence with original retained listing terms and scope. Claim-only
interruption uses the same operation and original digest; a real reservation goes
through `fenceCompensation` and `release`. These operations clear only the original
purchase claim, never seller listing content holds. The listing revision CAS
invalidates outstanding pre-cancellation reserve snapshots. Reserve rejects
CANCELLING/CANCELLED both on initial lookup and final insertion readback.

Read-only replay rechecks original cancelled purchase and no original claim. Wrong
owner/type, changed digest, late claim, incomplete reads, paid evidence and CAS
loss fail closed. Coupon absence cannot establish bundle cleanup. No new schema,
parallel recovery store, Payment execution or second placement key is introduced.

### Same-attempt prepayment reconciliation and the real CAS fence

A no-claim cancellation must write a real bounded `purchaseCancellation` marker
in the existing listing evidence. The managed concurrency owner deliberately
returns modifiedCount zero without advancing revision for identical business
fields; changing updated alone does not create a fence. Do not weaken successor
readback or force a counter outside its owner. Preserve the listing component
checkpoints and original purchase cancellation record.

For an original revision-two UNCONFIRMED bundle attempt, read-only
RECONCILE_PREFLIGHT requires CANCELLED original purchase, full command/digest and
owner identity, original published listing and no claim. It returns fixed original
purchase/listing revision and digest pins. After Checkout's same-attempt revision
three CAS, Digital rechecks these pins and history before the listing marker CAS
and existing cancellation/release/readback operations. Fresh owner and zero-Payment
proof remain mandatory. The original attempt UUID and complete prior receipt are
retained; revision-four failure cannot be automatically retried again.

Owner failures carry only an allowlisted recoveryStage and the common unconfirmed
error code. Checkout retains that sanitized diagnostic and never raw exceptions.
Tests use the real updated interceptor, generated update initializer, concurrency
service and Mongo CAS adapter with isolated BSON storage; no live database writes
are required to reproduce the suppressed no-op and validate the marker fix.

## Attempted Payment bundle reconciliation

The existing compensation/recover command also admits exactly one original
DIGITAL_OWNERSHIP reservation. Digital verifies the canonical PURCHASE digest,
original key, buyer/actor, Cart entry, merchant, listing and matching purchase claim,
then durably fences the original purchase through its existing compensation owner.
It never releases seller listing content holds. Changed claims, captured/transferred
purchases, existing Orders and mixed reservation sets refuse.

Checkout durably inserts and reads back `evidence.originalAuthorization` from the
exact prepared original Payment request before dispatch: walletCode, programCode,
rewardTypeCode and amount. The existing original-key checkpoint also retains its
claim UUID, typed identities, original phases and reservation references. Only the
successful insertion claimant dispatches; failed/uncertain acknowledgements or
readback never grant dispatch authority. Success/compensation CAS the same row,
retaining this evidence without credentials. Recovery never prepares a new
payment method or reads current Cart totals to reconstruct it. Existing checkpoints
without that tuple cannot reconcile a historical CANCELLED/noEffects:false decision;
do not backfill them with caller selections, current balances or a new calculation.

Payment sends the retained tuple and exact original PAYMENT/ORDER key binding to
`/reward-reservation-decisions/reconcile` through its existing runtime transport,
with reservationDecisionContract LOYALTY_RESERVATION_DECISION_V1 and one attempt.
The result must be the distinct LOYALTY_RESERVATION_RECONCILIATION_V1,
CANCELLED/noEffects:true with identical intent and valid atomic accounting proof.
Never relabel it DENIED. The existing `paymentDenialDecision` evidence field retains
the actual typed receipt unchanged apart from canonical ISO proof time formatting.
Original atomic DENIED receipts remain supported through their existing path.

Fresh reconciliation of the same retained tuple rechecks proof before release,
after release and on replay. Ordinary cancel/inspect cannot confirm a reconciled
cancellation; they deliberately return conservative legacy receipts. Digital also
requires the retained proof independently, including when release is called directly.
Checkpoint CAS preserves original evidence, advances monotonically, and leaves
unknown outcomes fenced. No authorization retry, Payment denial fabrication,
refund, wallet funding, owner replacement or checkpoint reset occurs.

Focused source tests use isolated owner fixtures and synthetic canonical Loyalty
receipts. They do not establish live adoption, historical authorization retention,
or native Loyalty transaction qualification.


Qualified Carbon delegation obtains the existing internal token for the original
tenant through nService; it does not mint from a bootstrap key or forward the
customer token. Registered ERR_DIGITAL_CARBON_* stages distinguish CREDENTIAL,
TARGET, AUTHORIZATION, TRANSPORT, EVIDENCE and HOLDINGS failures. These expose
only static diagnostics without dependency messages, headers or payloads. They
retain failure/no-retry behavior and do not prove whether a mutation occurred.

Transport classification reads nService's retained `remoteHttpFailure.httpStatus`
before the normalized error status: remote 401/403 remains AUTHORIZATION and
404 remains TARGET. Remote response contents never cross this boundary.
