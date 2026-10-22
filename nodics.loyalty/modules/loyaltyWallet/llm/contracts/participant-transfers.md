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

`POST /participant/transfer-policy/read` and `PUT /participant/transfer-policy`
require `loyalty.transfers.manage` in the represented Enterprise. Both identify
program/type. Update also requires `expectedRevision` (null for first creation)
and `selections`. Only incoming/outgoing switches, maximum transfer amount,
daily amount and daily count are permitted. Limits are shared across employees.
Governed selections may narrow but cannot lift effective framework ceilings.
Disabling new transfers does not invalidate existing receipts or recovery.

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
