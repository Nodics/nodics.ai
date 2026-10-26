# Participant Reward Transfers

## Profile Transport Configuration

`loyalty.transfers.identityTarget` defines the Profile module, connection,
authority, API version and attempt count in Wallet properties. Existing
`identityTimeoutMs` remains the timeout override; it is not renamed or copied.
`transfers.validation` owns its 1..60000ms range and the one-attempt contract.
The consumer validates complete settings and selects only transport fields,
never spreads overrides over the original bearer, tenant, method or body.
Missing definitions, invalid numbers and incomplete targets refuse before RPC.
Intentional connection/authority/timeout overrides remain supported; defaults
and validation ranges must not be supplied by customer modules. The focused
`loyaltyParticipantConfiguration.test.js` covers inheritance and invalid values.

## Ownership And Admission

One Loyalty wallet belongs to a canonical `ownerType`/`ownerCode`; program and
reward type identify each balance. This is not a cash wallet or carbon registry.
The participant owner uses the original access bearer with Profile's customer
self-read or current Enterprise scope evidence. Signed tenant/Enterprise aliases,
live permission and explicit denials remain authoritative. Browser owner fields
never select the debit wallet. Related Enterprises remain distinct owners.

Profile owns bounded existing-recipient search and exact revalidation. The
recipient is `{ownerType: CUSTOMER|ENTERPRISE, ownerCode}`. Search output contains
display identity only, not contacts, logins or wallet balances. Loyalty resolves
an existing open recipient wallet and rejects the same canonical owner.

## Commands

`GET /participant/wallet` requires `loyalty.wallet.read` and returns the currently
authenticated owner, existing wallet, program/type balances and recent ledger
entries. It never provisions a wallet. Missing wallets return null with empty
balances; suspended, ambiguous or unconfirmed records refuse. The projection
strips private ledger metadata, preserves material-value source classification,
and exposes canonical precision, transfer eligibility and the effective fee.
Wallet defines bounded reads in `loyalty.participantWallet`; clients cannot
override the owner, page capacity, issuer policy or arithmetic. Profile authority
is checked before reading and again before returning nonempty holdings.

`POST /participant/reward-transfers` through LoyaltyAPI requires
`loyalty.rewards.transfer`. Input contains `recipient`, `programCode`,
`rewardTypeCode`, exact decimal `amount`, `idempotencyKey`, and `confirmed: true`.
For a nonzero fee, `confirmedFeeAmount` must match the effective fee. Optional
`scale` must equal canonical Reward Type precision. Currency/program conversion
is a separate operation. Source wallet, actor, fee and daily counter period are
not browser authority.

`GET /participant/reward-transfers/:operationKey` requires `loyalty.wallet.read`
and resolves the current source owner before returning its original receipt.
`UNCONFIRMED` is not proof that nothing happened and must not trigger a new key.
Completed transfers are final; recovery is inspection/retry of the original key,
not a refund or opposite-direction compensating transfer.

Exceeding the per-transfer amount ceiling emits registered owner code
`ERR_LOYALTY_TRANSFER_AMOUNT_LIMIT` with HTTP 409. Sensitive responses expose
registered status messages, not dynamic internal diagnostics. The acceptance
runner requires this exact HTTP/code pair, never message text or any generic 409.
A rejected-before-posting command may have UNCONFIRMED status; that alone is not
proof of the limit branch or permission to change the original operation key.
Keep sensitive logging unchanged; qualify the public code through the real router
response test rather than exposing private request/error internals.

`POST /participant/transfer-policy/read` and `PUT /participant/transfer-policy`
require `loyalty.transfers.manage` in the represented Enterprise. Both identify
program/type. Update also requires `expectedRevision` (null for first creation)
and `selections`. Only incoming/outgoing switches, maximum transfer amount,
daily amount and daily count are permitted. Limits are shared across employees.
Governed selections may narrow but cannot lift effective framework ceilings.
Disabling new transfers does not invalidate existing receipts or recovery.

The existing read endpoint additionally accepts the exact administrative shape
`{enterpriseCode, programCode, rewardTypeCode}`. This is read-only target selection,
not impersonation: a native Super Admin retains the original default-Enterprise
PASSWORD bearer. Wallet obtains fresh nonce-bound Profile platform-administrator
proof for the existing `loyalty.transfers.manage` permission, then resolves the
exact active target through Profile's same-tenant participant directory. Both
authority and target are revalidated after policy reads. Optional Enterprise
membership need not be enabled. Non-native, stale, denied, foreign, inactive,
ambiguous and substituted contexts fail closed; no target records are created.
The evidence path is defined in Wallet `config/properties.js`; Profile defines
its proof-consumer allowlist. Neither setting grants a role or participant access.

`PUT /participant/transfer-policy` also admits the exact native administrative
shape `{enterpriseCode, programCode, rewardTypeCode, expectedRevision, selections}`
using the same original-context proof and target resolution. Omitting the target
retains the existing represented-owner path. `expectedRevision` is null only for
first creation, otherwise the exact revision from the owner read. Stale revisions
refuse: read and reconcile original intent rather than silently overwriting.
Only the existing incoming/outgoing switches and three limit fields are writable;
fee, timezone, ownership, actor and framework defaults are not writable selections.

The existing policy record and qualified transaction owner persist the selected
target with the actual administrator as `updatedBy`. Native authority and target
are revalidated inside the transaction before persistence and again after readback;
revocation, target loss, request mutation or framework-policy drift rolls back.
Framework ceilings still apply. A policy update does not move funds or grant
operating access. Acceptance fixtures are expectations, never persisted policy:
operators must explicitly approve missing selections, use this owner command,
then verify the returned and freshly read effective limits before acceptance.
Never supply missing selections through global defaults, synthetic responses or
direct persistence. An uncertain update requires an exact target read and revision
reconciliation, not an unconditional retry or a new transfer key.

### Acceptance Credential Separation

The owner acceptance runner requires a third, independently authorized policy-read
session through `NODICS_LOYALTY_ACCEPTANCE_POLICY_READ_TOKEN`. Existing administrator
authority performs policy and OpenAPI contract inspection; Customer and employee business sessions retain
only their existing participant permissions and perform all wallet, transfer and
receipt operations. The runner never substitutes the policy bearer for either
participant or requests additional grants to make acceptance pass.

The runner sends the reviewed `enterpriseCode` through the administrative read
shape, while preserving each bearer and its own Enterprise transport header.
Decoding the session for transport grants no authority; the APIs verify it.
A default-context policy without the explicit target is not target evidence.
Before any limit probe or transfer,
the runner requires exact owner type/code, program and reward type in the policy
response, then compares effective policy with the reviewed selection. Missing,
reused, denied or wrong-target policy credentials fail closed. A fresh native
Super Admin session is a prerequisite; the runner does not create membership,
impersonate, alter policy or bypass consent.
Original deterministic transfer keys remain unchanged on recovery. Unit tests
prove credential routing and pre-mutation refusal, not deployed authorization.

## Persistence And Recovery

Internal service transfers and participant commands share
`DefaultLoyaltyRewardTransferService.settle`, using reserve/capture/earn and stable
suffix keys. Participant commands atomically compose both postings, the owner-wide
daily counter and one immutable transfer receipt through the canonical database
transaction owner. No disabled-transaction fallback is allowed. Fee value is
separately disclosed and consumed; it is not silently credited to the recipient.

`rewardTransferOperation` retains immutable normalized intent, ledger references,
original actor and completion time. `rewardTransferUsage` counts once by source
owner/program/type/calendar-day/timezone. `rewardTransferPolicy` stores selections,
revision and modifying actor. These private generated schemas have no generic
HTTP mutation routes. Qualified same-connection schemas and unique indexes remain
deployment prerequisites; unit doubles do not qualify storage or concurrency.

Owner writes include required base lifecycle fields before generated persistence.
`loyaltyParticipantTransferNativePersistenceAcceptance.test.js` is an explicit
loopback-only persistence slice selected by `NODICS_LOYALTY_NATIVE_MONGO_URI`.
It creates and drops one random database, uses the canonical transaction owner,
real Loyalty schemas and generated save/update pipelines, and proves fee and
limit refusal, one concurrent original settlement, atomic rollback, reconnect,
original-key recovery and no double movement. It does not qualify Profile,
router authorization, a deployed topology or production MongoDB.

## Configuration And Extension

Wallet `config/properties.js` defines `loyalty.transfers` and
`loyalty.transactions`. Reward precision defaults are owned by Loyalty Core;
ordinary hold duration is owned by Reservation. Issuer `transferEnabled` and
eligible types are Program records, not framework properties. Customer/runtime
configuration contains only intentional overrides, never copied defaults or
property definitions. Owner selections are governed records, not environment data.

The explicit `transferPermissions` data release installs definitions only. It
does not assign roles, enable database transactions, fund wallets or activate a
partner. Axis/Circa consume these commands and must not calculate balances,
increment authoritative counters, or retry uncertain commands with fresh keys.

Unit coverage includes owner isolation, forged identities, exact precision,
fee confirmation, duplicate replay, counter limits, conditional settings and
rollback on recipient credit failure. Native owner-persistence coverage is
separate from live deployed APIs, consumer screens and notification dispatch/retry;
none is implied by another layer's result.

Circa's source transfer renderer selects an eligible program/type, searches
Profile's existing-recipient directory and confirms the recipient, amount and
fee. After an uncertain submission it queries the original operation; it never
changes the key or repeats a debit automatically. Before dispatch it must retain
only `{operationKey}` through the shared pending-reference helper. Its tab-local
key uses canonical wallet owner and actor/capability, excluding token or revision.
Token refresh, remount and reload restore only that hint, then use this existing
exact owner status route; they never recreate a transfer from a local amount or
receipt. Storage failure prevents dispatch, and malformed hints fail closed.
UNCONFIRMED/denied/failed reads retain the original hint and permit no new command.
An owner-confirmed COMPLETED receipt clears the matching hint and makes New
transfer available. Another owner/actor does not inherit private hints. Clearing
storage or moving to another device still requires original owner reconciliation.
Isolated renderer tests are not browser/live acceptance.
