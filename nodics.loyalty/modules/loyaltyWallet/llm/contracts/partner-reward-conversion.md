# Partner Reward Conversion

Wallet owns durable conversion quotes and coordination. Profile owns the partner
Enterprise and authenticated customer/employee identity. Program and Reward Type
own eligibility and source precision. Reservation, Ledger and Redemption own
source accounting. A qualified framework adapter owns external protocol and
verified account mapping; Commerce coupon purchase is an independent route.
There is no internal partner-wallet credit, external balance mirror or new ledger.

## Integration Contract For The Shared Owner

The coordinator is `DefaultLoyaltyPartnerRewardConversionService`. Its public
methods are `options(request)`, `quote(request)`, `confirm(request)` and `status(request)`. They retain
the original authenticated request and tenant; they never mint a service token.
After participant admission, generated persistence uses the existing
`DefaultLoyaltyRewardOperationService.serviceRequest` private storage actor.
Original participant credentials still reach Profile and source command admission.
Do not grant customers generic generated CRUD or broaden `operational` schema
policy to make this command work.
`status` may reconcile an already confirmed operation, so expose it as a secured
POST command, not a cacheable GET. An authenticated provider callback may trigger
that same owner reconciliation after protocol-specific authentication; it must
never pass browser-supplied credit evidence directly into the coordinator.

Quote payload (all required): `integrationCode`, `accountLinkCode`, `walletCode`,
`programCode`, `rewardTypeCode`, `amount` (decimal string), `idempotencyKey`.
Confirm/status payload: `conversionCode` only. Unknown payload fields refuse.
Quote and confirm require `loyalty.partnerConversion.execute`; status requires
`loyalty.partnerConversion.read`. Admission delegates to the shared P02
`DefaultLoyaltyParticipantService.resolve(request, permission)` using unchanged
`authorization`, `authData` and tenant. That owner invokes Profile customer identity
or current granted/denied Enterprise scopes. Customer wallets bind to the
canonical customer's code, not login ID. Enterprise wallets bind to the acting
employee's selected Enterprise and explicit permission. Service
identities cannot impersonate these humans. Status retains current authority.

Public output: `conversionCode`, `status`, `simulated`, `owner` (typed canonical owner), `partnerEnterpriseCode`,
`integrationCode`, `accountLinkCode` (opaque internal link identity), `walletCode`, `programCode`, `rewardTypeCode`, `sourceAmount`,
`sourceScale`, `targetAmount`, `targetScale`, `targetUnit`, `termsReference`,
`termsRevision`, `quoteExpiresAt`, `confirmedAt`, `completedAt`. No external
account reference, credentials, raw provider response or private account evidence
is returned. Clients present the retained quote and poll the owner status.

### Participant Choice Projection

POST `/participant/partner-conversions/options` under LoyaltyAPI accepts `{}`
only, with `loyalty.partnerConversion.read` and the original participant bearer.
It reuses coordinator admission, canonical wallet ownership, verified account
links, issuer eligibility and qualified provider registration. It never creates
accounts or wallets, quotes a rate or dispatches a conversion. The result is
`{enabled, owner, walletCode, options}`; options contain only integration/partner/
internal-link/program/reward identities, source precision and terms references.
Private external-account and provider-binding evidence is never projected.

Framework definitions `partnerRewardConversion.selection.maximumAccounts` and
`maximumRewardsPerIntegration` both default to 100 in Wallet properties. Complete
bounded generated reads are mandatory; truncated, duplicate or foreign results
refuse. Current authority is checked again before returning populated results.
Disabled new conversion returns no choices while existing status recovery stays
available. An absent verified link requires later real partner onboarding, not a
frontend form that declares an account verified. Consumer quotes and confirmations
recheck eligibility; selection itself reserves nothing.

## Parent-Owned Configuration And Schema Additions

These are the integration requirements for the parallel Wallet/API owner, not
permission to write broad shared files from this packet. The parent has added
the shared configuration, schemas, routes, permissions and protected hold guards
in the checkout; this is source integration, not runtime activation or acceptance.
All reusable defaults
belong in `loyaltyWallet/config/properties.js`:

```js
loyalty: {
  partnerRewardConversion: {
    enabled: false,
    providers: { mock: "DefaultLoyaltyMockPartnerRewardProviderService" },
    mock: { enabled: false, outcome: "CREDITED", targetUnit: "SIMULATED_POINTS", quoteLifetimeMs: 60000 },
    selection: { maximumAccounts: 100, maximumRewardsPerIntegration: 100 }
  }
}
```

Validate `enabled` as a boolean and `providers` as a plain object whose values
are loader service names. Empty providers means no qualified adapter. Adapter
selection keys are retained in governed integration records. Enabling this
capability does not qualify a provider. Customer/runtime files may override only
these framework definitions. No rate, fee, timeout or partner policy default is
invented in the coordinator. Adapter-specific defaults and settings belong to
the implementing framework provider's properties, after protocol review. The
registered mock is simulation-only and disabled for new quotes by default.

Add the following schemas inside `loyaltyWallet/src/schemas/schemas.js`. Every
schema uses `super: 'base', model: true, service: {enabled: true},
router: {enabled: false}, cache: {enabled: false}, event: {enabled: false},
search: {enabled: false}, transaction: {enabled: true, sideEffects: 'none'}`.
Require a unique code index and owner-protected generated persistence. Do not
expose generic CRUD for private account links or conversion state. Tenant is the
authenticated storage partition, never a business field. All fields below are
required unless explicitly marked optional; base supplies `code` and `active`.

| Schema / generated service | Fields |
| --- | --- |
| `loyaltyPartnerRewardIntegration` / `DefaultLoyaltyPartnerRewardIntegrationService` | `partnerEnterpriseCode:string`, `providerKey:string`, `revision:int`, `status:string enum ACTIVE,PAUSED,RETIRED`, `conversionEnabled:bool`, `sourceRewards:array` of exact `{programCode,rewardTypeCode}` pairs, `termsReference:string`, `termsRevision:string`, `providerBindingReference:string`, `rules:object` (governed adapter-specific terms, no secret values) |
| `loyaltyPartnerRewardAccount` / `DefaultLoyaltyPartnerRewardAccountService` | `integrationCode:string`, `partnerEnterpriseCode:string`, `ownerType:string enum CUSTOMER,ENTERPRISE`, `ownerCode:string`, `revision:int`, `status:string enum VERIFIED,REVOKED`, `accountReference:string` (private opaque adapter locator), `verificationReference:string`, optional `validUntil:date` |
| `loyaltyPartnerRewardConversionRecord` / `DefaultLoyaltyPartnerRewardConversionRecordService` | `revision:int`, `status:string` enum below; `intent:object`, `ownerType:string`, `ownerCode:string`, `actorCode:string`, `integration:object` (immutable snapshot), `account:object` (immutable private snapshot), `sourceAmount:string`, `sourceScale:int`, `targetAmount:string`, `targetScale:int`, `targetUnit:string`, `quoteReference:string`, `quoteExpiresAt:date`, `termsReference:string`, `termsRevision:string`, `createdAt:date`; optional `confirmedAt:date`, `confirmedBy:string`, `reservationCode:string`, `providerEvidence:object`, `captureLedgerEntryCode:string`, `redemptionCode:string`, `releaseLedgerEntryCode:string`, `completedAt:date` |

Conversion status enum: `QUOTED`, `HOLDING`, `HELD`, `SUBMITTED`,
`CREDIT_CONFIRMED`, `NO_CREDIT_CONFIRMED`, `COMPLETED`, `REJECTED`, `EXPIRED`.
`intent` is the exact normalized quote payload. Snapshot shapes are those of the
two source records above. Constrain those nested records in the schema owner;
do not admit request-supplied snapshots. Program eligibility additionally needs
the governed `partnerConversionRewardTypeCodes:array` of reward-type codes on
`loyaltyProgram`; absence denies conversion. Program default reward type alone
must not imply issuer permission to convert every currency.

Add status definitions to the existing Loyalty status owner for
`ERR_LOYALTY_CONVERSION_UNAVAILABLE`, `ERR_LOYALTY_CONVERSION_INVALID`,
`ERR_LOYALTY_CONVERSION_FORBIDDEN`, `ERR_LOYALTY_CONVERSION_NOT_FOUND`,
`ERR_LOYALTY_CONVERSION_CONFLICT`, `ERR_LOYALTY_CONVERSION_INELIGIBLE`,
`ERR_LOYALTY_CONVERSION_PROVIDER`, `ERR_LOYALTY_CONVERSION_PERSISTENCE`.
Use generic private-safe messages. API routes must opt into sensitive-request
capture protection and map only the three strict commands above to the existing
controller/facade; require the corresponding permissions and original access
token. Add these permission contributions in the implementing owner, not Circa.

Exact API additions in `loyaltyApi/src/router/routers.js`, under the existing
`loyaltyApi.participation` group (reuse `loyaltyParticipation` exposure):

```js
partnerConversionQuote: {
  secured: true, authTokenTypes: ['access'],
  accessGroups: ['customerUserGroup', 'employeeUserGroup'],
  permission: 'loyalty.partnerConversion.execute', apiExposure: 'loyaltyParticipation',
  cache: { enabled: false }, requestPrivacy: { sensitive: true },
  key: '/participant/partner-conversions/quote', method: 'POST',
  controller: 'DefaultLoyaltyInternalController', operation: 'partnerConversionQuote'
},
partnerConversionConfirm: {
  secured: true, authTokenTypes: ['access'],
  accessGroups: ['customerUserGroup', 'employeeUserGroup'],
  permission: 'loyalty.partnerConversion.execute', apiExposure: 'loyaltyParticipation',
  cache: { enabled: false }, requestPrivacy: { sensitive: true },
  key: '/participant/partner-conversions/confirm', method: 'POST',
  controller: 'DefaultLoyaltyInternalController', operation: 'partnerConversionConfirm'
},
partnerConversionStatus: {
  secured: true, authTokenTypes: ['access'],
  accessGroups: ['customerUserGroup', 'employeeUserGroup'],
  permission: 'loyalty.partnerConversion.read', apiExposure: 'loyaltyParticipation',
  cache: { enabled: false }, requestPrivacy: { sensitive: true },
  key: '/participant/partner-conversions/status', method: 'POST',
  controller: 'DefaultLoyaltyInternalController', operation: 'partnerConversionStatus'
}
```

Controller delegates to the corresponding existing facade method without
constructing authority. Facade additions:

```js
partnerConversionQuote: function (request) {
  return this.service('DefaultLoyaltyPartnerRewardConversionService').quote(request);
},
partnerConversionConfirm: function (request) {
  return this.service('DefaultLoyaltyPartnerRewardConversionService').confirm(request);
},
partnerConversionStatus: function (request) {
  return this.service('DefaultLoyaltyPartnerRewardConversionService').status(request);
}
```

The canonical partner-Enterprise check uses
`DefaultLoyaltyParticipantService.recipient(context, {ownerType: 'ENTERPRISE',
ownerCode: partnerEnterpriseCode})`. This invokes Profile `/participants/resolve`
with the original token and requires an exact same-tenant active existing
Enterprise. It does not depend on local Profile models or an administrative search
endpoint. Unit evidence does not qualify remote runtime topology.

## Generated Quote Persistence

First quote creation uses the existing generated save with `options.insertOnly:
true`, retaining `recursive: false`, `skipItemCache: true` and `upsert: false`.
The generated pipeline derives an inherited primary-code query even when the
owner omits `query`; missing query never establishes insertion intent. Keep the
normal access/default/validation pipeline and its atomic create primitive, with
qualified unique identity indexes. Do not enable global or per-command upsert.

Storage-owned `_id` is excluded from every owner write model and acknowledgement
comparison. Generated reads may return BSON ObjectId values; structured cloning
cannot preserve their driver identity, and replaying them in MongoDB `$set` can
violate the immutable identifier. Keep all other expected owner fields checked,
including revision/status and immutable quote evidence. Do not weaken the generic
adapter or replace the canonical code selector with a cloned storage identifier.

The framework pre-save interceptor owns `updated`: require a finite Date in the
saved acknowledgement, but do not compare it to the old timestamp. Keep the
original `created`, business `createdAt`/confirmation/completion dates, all supplied
business fields, revision and status exact. Never compare against the mutable
request object after interceptors; it is not an independent intent snapshot.

Managed-field source audit: conversion inherits base defaults (`active`,
`accessGroups`, `created`, `updated`), which fill absent values only. The standard
pre-save interceptor refreshes only `updated`. This operational schema does not
select ownership attribution, versioned persistence or managed concurrency;
`ownerType`/`ownerCode` remain business ownership and revision stays owner-managed.
Do not broadly exempt `createdBy`, `updatedBy`, owner fields or `versionId` if a
later layer introduces them: reconcile its explicit policy while retaining exact
business intent. `_id` remains storage-owned and excluded from writes.

The accounting regression composes the actual timestamp interceptor, generic save
initializer, Mongo save adapter, participant/reward owners and transaction
compose/join with isolated driver I/O. It covers complete conversion/replay,
unchanged creation evidence, malformed timestamp and business-field response
refusal, rollback and original-key recovery. It is not live MongoDB qualification.

Existing transitions remain update-only with exact code, previous revision and
previous status. They never select insert-only or recreate a missing record.
Duplicate creation or lost acknowledgement triggers the existing exact-key
readback: recover only matching original intent and owner, reject conflicting
intent, and preserve the winning record. No quote retry authorizes source holds
or provider execution. See the framework
[insert-only contract](../../../../../nodics.foundation/modules/nDatabase/database/llm/examples/insert-only-save.md).

`loyaltyPartnerRewardConversion.test.js` composes the actual generic save
initializer with isolated storage adapters, including generated primary lookup,
insert-only dispatch, duplicate/lost-acknowledgement recovery, conflicting intent,
stale revision/status and absent-row update refusal. A BSON-identity regression
also composes the generic initializer and actual Mongo save adapter with isolated
driver I/O, exercising confirmation through completion and replay while retaining
the original database identity. This is source regression
evidence, not installed database or HTTP acceptance.

## Source Accounting Dependency

P02 must expose `DefaultLoyaltyRewardOperationService.partnerConversionCapabilities()`
returning `{ heldUntilOutcome: true, originalAuthority: true }`
only after implementing those guarantees. The coordinator calls existing
`reserve`, `capture`, `release`, each with original auth, stable keys suffixed
`:reserve`, `:capture`, `:release`, source type `PARTNER_REWARD_CONVERSION`,
source code equal to conversion code, target type `EXTERNAL_PARTNER_ACCOUNT`,
target code equal to the retained account-link code, and
`holdPolicy: 'EXTERNAL_OUTCOME'`. Amount and scale come from the retained quote.
Capture also receives the confirmed `providerReference` for Redemption evidence.

The coordinator now uses P02 `DefaultLoyaltyTransactionService.qualify/compose`
for each source posting together with its durable conversion state transition.
Generated conversion writes and all source reads/writes forward the same opaque
`transactionContext`; the existing operation `transaction` joins that context.
No external call occurs inside a database transaction. An accounting write that
fails rolls back the corresponding conversion state. All participating generated
schemas must be transaction-qualified on the same database connection.

The hold must survive quote expiry and elapsed time after confirmation. Restrict
this policy to owner-verified persisted conversion commands: the coordinator
exposes `ownsSourceRequest(request)`, which checks an ephemeral, unforgeable
`conversionContext` token and exact source/target/amount/identity/transaction
bindings during its active atomic callback. Operation request normalization must
preserve this token object; never persist it. A client choosing the same string
or passing a serialized token is not authority. Other release/expiry/reverse routes must not
release a protected hold while the provider can still credit. Source operations
must be atomic and replay-safe across crashes/concurrent calls and preserve the
original actor. Return `reservation`, `ledgerEntry`, and capture `redemption`
with their actual durable codes. This coordinator refuses confirm until the
declared owner guarantees exist; it does not modify the existing operation
service, introduce transaction fallbacks or claim that old reserve is safe.

Exact source-owner patch requirements: in `reserve`, only an admitted
`ownsSourceRequest(request)` may select `holdPolicy: 'EXTERNAL_OUTCOME'`;
retain that field on the reservation and omit `expiresAt` for this hold. Make
reservation `expiresAt` optional and add optional `holdPolicy:string` with enum
`EXTERNAL_OUTCOME` in `loyaltyReservation/src/schemas/schemas.js`. Keep ordinary
reservation expiry policy unchanged, with its complete default moved to the
implementing properties owner. In `capture` and `release`, a reservation with
that policy requires the same owner admission. Generic reversal and expiry must
refuse protected reservations; terminal outcome processing uses capture/release.
The coordinator validates the reservation's retained policy before submitting.
The capability method may return true only after these guards exist.

## Provider Contract And Recovery

Resolve the service solely through the framework registry, never a request or a
model's arbitrary service name. Required methods: `capabilities()`, `quote`,
`execute`, `reconcile`. Qualification is
`{contractVersion: 1, idempotentExecution: true, authoritativeOutcomes: true,
terminalNoCreditFence: true}`. `quote` is read-only and returns `quoteReference`,
`sourceAmount`, `sourceScale`, `targetAmount`, `targetScale`, `targetUnit`,
`termsReference`, `termsRevision`, `expiresAt`. All amounts are exact strings;
source precision is the Reward Type precision. Provider target precision is
explicit and validated by the existing amount owner. The adapter must enforce
its Enterprise-specific configured limits/rates/account evidence and quote terms.

`execute` and `reconcile` receive an immutable operation snapshot with
`operationReference` equal to the durable conversion code. Return an outcome
`PENDING`, `UNKNOWN`, `CREDITED` or `NOT_CREDITED`. Terminal outcomes must bind
`operationReference`, `integrationCode`, `partnerEnterpriseCode`,
`accountReference`, `targetAmount`, `targetUnit` exactly and include
`providerReference`. `NOT_CREDITED` additionally requires `cannotCredit: true`,
which means the reference is permanently fenced against delayed requests or
workers. Mere absence from a lookup, HTTP acceptance, timeout or a transient
failure is never a terminal no-credit decision. `CREDITED` must be confirmed
partner credit, not an accepted submission. No protocol-independent rollback is
assumed. Adapters normalize protocol-specific prepare/commit sequences internally
while maintaining these required semantics.

Confirm atomically claims the quote before holding funds. A persisted SUBMITTED
transition occurs before the external execute call; only that winning transition
may call execute. Subsequent confirm/status calls reconcile and never resubmit.
A crash in the send gap therefore remains uncertain until the provider can prove
credit or fence the reference. Concurrent responses use conditional revisions.
Terminal external evidence is persisted before local capture/release, so local
failures resume without another external credit. COMPLETED requires both partner
credit and durable source capture/redemption codes. REJECTED requires terminal
no-credit evidence plus durable release. No customer cancellation/refund method
is introduced. Paused or revised integrations block new confirmations; retained
confirmed operations recover against their original binding and terms. Setting
the framework `enabled` flag false stops new quotes/confirmation claims but permits
status and already-confirmed command recovery. Removing a qualified provider
still leaves pending operations uncertain; never release on missing transport.

## Audience And Verification

Business users review the quote and see honest pending/completed/rejected status.
Operators manage qualified Enterprise bindings and investigate pending outcomes;
they must not manually force success or release an uncertain hold. Framework and
partner developers implement only qualified adapters under this contract and
retain the owner boundaries when extending exported coordinator members. AI tools
must preserve original actor, tenant isolation, frozen terms and durable evidence.

Focused unit tests use explicitly synthetic providers and generated-store doubles
to cover persistence/restart, duplicate confirmation, uncertainty, terminal fences,
late credit, local posting failure, privacy, eligibility and boundary amounts.
`test/loyaltyPartnerRewardConversionAccounting.test.js` additionally connects the
real coordinator, participant resolver, reward operations and transaction
compose/join. It checks customer and represented Enterprise Profile contracts
with original signed credentials, private generated-storage admission, opaque
token retention through normalization, guarded release, no-expiry protected holds,
canonical capture/redemption and rollback/recovery after a redemption write fails.
They do not prove real database behavior, generated schema adoption, external
provider acceptance, API deployment or live conversion. The permanent mock below
supplies simulation evidence only. A real provider remains gated until its protocol,
credentials, account verification, concrete framework path and qualification are
reviewed. Parent-owned schema/config/API/hold integration must remain consistent
with these contracts; its presence does not constitute live provider qualification.

## Permanent Simulated Adapter

The opt-in [installed Local HTTP acceptance](installed-partner-reward-mock-acceptance.md)
uses existing signed human sessions and exact reviewed selections. It provisions
nothing and distinguishes fresh source accounting from retained-key recovery.

`src/service/defaultLoyaltyMockPartnerRewardProviderService.js` implements the
same `capabilities/quote/execute/reconcile` interface and is registered by Wallet
properties under `providers.mock`. There is no additional workflow, registry,
transport, external account store or simulated balance authority. Both conversion
and mock new-quote activation default to false. No customer identifiers, endpoints
or credentials are supplied by this adapter.

Administrators may explicitly override `loyalty.partnerRewardConversion.enabled`
and `.mock.enabled` to true, then select `providerKey: "mock"` in an existing
governed integration. Existing partner Enterprise resolution, issuer eligibility,
verified account-link ownership, participant permissions and transaction
qualification still apply. Mock eligibility additionally requires the persisted
wallet's `metadata.sample === true` and `metadata.testOnly === true`, checked
at quote and confirmation. Callers cannot provide these markers in commands.
This adapter does not provision or relabel any wallet/account. Source reservation,
capture and release remain actual local accounting on those test wallets.

Framework defaults and validation live in Wallet. Later configuration layers
provide only actual overrides:

| Setting under `.mock` | Default | Contract |
| --- | --- | --- |
| `enabled` | `false` | Explicit true permits new mock quotes; recovery uses retained terms. |
| `outcome` | `CREDITED` | Existing outcomes `CREDITED`, `NOT_CREDITED`, `PENDING`, `UNKNOWN` only. |
| `targetUnit` | `SIMULATED_POINTS` | Bounded owner identifier; never removes simulation labeling. |
| `quoteLifetimeMs` | `60000` | Positive safe integer producing a valid expiry date. |

The mock quotes one target unit per source unit at the canonical source scale,
using the loaded amount owner and exact decimal strings. No real exchange rate
or partner policy is implied. Outcome and target terms are frozen in the retained
quote. A `simulated:<outcome>:<digest>` reference binds tenant, operation, immutable
integration/account snapshots and amounts. Execute and reconcile derive the same
outcome without process-local maps, network requests or partner writes, including
after a send gap or restart. Configuration changes affect new quotes only.
PENDING/UNKNOWN scenarios intentionally remain unresolved and retain their holds;
changing defaults cannot turn them into terminal outcomes or authorize release.

Provider capabilities, quotes and outcomes mark `simulated: true`. Conversion
records require a `simulated:bool` field; choice projections and all public
conversion responses expose it. Terminal private evidence retains it, and the
Redemption provider receipt retains the `simulated:` prefix. COMPLETED means the
simulated credit scenario and local source capture finished; it never proves
external partner credit. Business users and downstream consumers must visibly
label every simulated option, quote and result. Target-unit wording alone is
insufficient. Runtime/schema adoption must include the new field before use;
existing historical records are not rewritten by this source change.

The coordinator rejects quote/outcome marker disagreement and refuses rebinding
a retained operation between simulated and real adapters. Missing/replaced
providers leave uncertain holds unresolved. A mocked CREDITED scenario can
recover a failed local capture from persisted evidence; NOT_CREDITED is a terminal
simulation fence and releases once. Neither asserts real external success.

Partner developers add later adapters through the existing loader service name
mapping and a distinct governed integration binding, keeping the same public
quote/confirm/status commands. Preserve contract-v1 idempotency, original frozen
terms, authoritative credit and terminal no-credit fences. Never remap the mock
key to a real provider for retained operations. Framework defaults belong to the
implementing owner; project layers select bindings or override defined values.
Exported mock methods and the amount owner remain customizable, but simulation
labeling and evidence binding are mandatory invariants.

Before real use, operators still need a qualified real adapter and protocol,
approved partner/account evidence, credential bindings in their existing owner,
deployed schema/services/API permissions and qualified atomic database behavior.
No real partner is qualified by mock tests. Focused conversion, accounting and
selection tests cover default refusal, configured outcomes, exact large amounts,
customization, replay, capture recovery, privacy and simulated/real separation.
