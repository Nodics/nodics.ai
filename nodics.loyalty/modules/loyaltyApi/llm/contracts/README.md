# loyaltyApi Contracts

API routes expose Loyalty resources and operations for service-to-service integrations.

## Participant Commands

The separate `loyaltyParticipation` route category accepts original Customer or
Employee access tokens, never fabricated service identities. Its transfer,
original-result query and Enterprise settings commands delegate to Wallet's
[participant contract](../../../loyaltyWallet/llm/contracts/participant-transfers.md).
Quote/confirm/status delegate to Wallet's
[partner conversion contract](../../../loyaltyWallet/llm/contracts/partner-reward-conversion.md).
All commands use explicit permissions, sensitive input protection and no-store
responses. Conversion status is POST because reconciliation may finalize the
original operation; it cannot submit a new external credit.

These routes do not alter the service-only admission of internal ledger APIs.
Owner code validates original credentials and canonical ownership independently
of route groups. No route installs permissions, funds a wallet or qualifies an
external provider. Defaults for route exposure belong to LoyaltyAPI; downstream
configuration contains only intentional overrides.

After route authorization, wallet-by-code reads use
`DefaultLoyaltyRewardOperationService.serviceRequest`, as do the other Loyalty
operations. Runtime tokens deliberately have no expanded groups; do not copy
them directly into generated storage requests or grant runtime administrator
groups to satisfy schema access. Preserve the authenticated tenant, wallet query,
route permissions and unchanged caller credential. Commerce separately proves
customer wallet ownership before a reward payment.

## Exact Read Evidence

`POST /reward-unit-evidence` accepts exactly `programCode`, `rewardTypeCode` and
optional `enterpriseCode`. It uses the same private runtime admission, namespace
grants, protected capture, original credentials and bounded generated-read
contract as the evidence routes below. It is not participant-facing and accepts
no caller precision, owner or query. Wallet's existing read-evidence owner reads
one exact active, currently effective, spend-enabled Program and one active
RewardType twice, requiring complete counts and explicit revisions. The unit's
explicit precision is validated by Loyalty Core's amount service. Missing,
ambiguous, inactive, expired, malformed or drifting evidence refuses.

The response is `{contractVersion:1,tenant,enterpriseCode,programCode,rewardTypeCode,
scale,programRevision,rewardTypeRevision}`. No wallet, balance, ledger, reservation
or funding record is read or created. Digital uses this read for governed bundle
destinations and rechecks it on publication; a context record cannot redefine
precision. It is observed evidence, not a distributed snapshot or future spending
guarantee. Downstream layers override existing framework mechanics only; no new
default precision or business selection is supplied by this API.

`POST /wallet-evidence` requires exactly `ownerType`, `ownerCode`, `programCode`,
`rewardTypeCode`, with optional `walletCode` and the business enterprise selector
described below. `ownerType` is CUSTOMER or ENTERPRISE, always explicit; a Customer
and Enterprise sharing a code are different owners. An explicit wallet code must
identify that exact typed owner's existing OPEN wallet; a missing or mismatched
code never falls back. `customerCode` is not an accepted alias.
When `walletCode` is absent, the owner reads only the exact
`ownerType`/`ownerCode` identity in the verified tenant
partition, bounded to two rows to detect ambiguity. Missing, duplicate, inactive,
closed, foreign-owner or conflicting-tenant rows refuse. Present null, undefined,
empty and non-scalar wallet codes also refuse; only omission selects this mode.
This is an optional exact owner selector, not a general query, wallet history,
deterministic-code derivation or wallet-opening operation.
Generated reads may normalize the requested `pageSize:2,pageNumber:1` by adding
only `limit:2,skip:0,snapshot:false`. Both exact shapes are accepted; other paging,
offset, projection or snapshot changes refuse. Cover the real database get
initializer in addition to owner doubles so native normalization is not confused
with a widened read. This is read evidence, not a wallet or ledger mutation.

The response echoes `ownerType`, `ownerCode`, `programCode` and `rewardTypeCode` alongside
the verified tenant/business envelope, allowlisted wallet and exact reward
balance. A missing balance is `null`, not a fabricated zero. Program/type echoes
bind the selected balance scope, not program activation or financial approval;
the consuming owner must retain its approved terms and the earning owner still
validates its current mutation prerequisites. It never calls wallet open or
owner wallet projection, and a missing wallet creates no record.

`POST /reward-ledger-evidence` accepts exactly `ownerType`, `ownerCode`, `programCode`,
`rewardTypeCode`, `sourceType`, `sourceCode`, and either `entryCode` or
`reversalOfEntryCode`. The original ledger determines the wallet, whose canonical
owner must match both type and code; the response echoes that typed owner.
Reversal reads detect multiple movements
against the same original and refuse foreign sources rather than filtering them
away. Results contain bounded allowlisted fields, not arbitrary history/metadata.

Alternatively, `earningIdempotencyKey` selects an exact EARN source in that
participant's one existing wallet, with the same program, reward and source fields.
It cannot be combined with either original-entry selector. The owner reads by
source rather than filtering by key, rejects another key or multiple rows, and
requires an explicit successful generated count even for zero rows. The returned
`ledgerSelection` binds that read's entry type, source, key, program and reward
type. Empty `entries` proves only that exact read's observed absence; it grants
no cancellation, mutation or concurrency fence.

`POST /reward-reservation-evidence` accepts the typed owner, program, reward type
and one exact `reservationCode`. `POST /reward-redemption-evidence` accepts the
same owner/unit selectors and one exact `redemptionCode`. Each route first reads
one bounded lifecycle record, then resolves that record's wallet and requires the
same explicit CUSTOMER or ENTERPRISE owner. Missing, duplicate, inactive,
foreign-wallet or drifting evidence refuses. Responses project allowlisted
lifecycle fields, including reservation/redemption joins, status, amount and
target references. They do not enumerate holds, transition state, open wallets,
post ledger entries or authorize Payment settlement.

All exact evidence routes require a router-verified runtime principal scoped to `loyaltyApi`,
the authenticated tenant, `loyalty.wallet.read`, and the logger's private-entry
capture protection. Routes mark sensitive input and return `Cache-Control: no-store`.
Contradictory enterprise or
tenant aliases, caller queries and mid-read credential drift refuse. The signed
caller may be groupless and is unchanged; generated reads reuse Loyalty's existing
private operation storage context, not added caller groups or enabled CRUD.
Loyalty domain rows do not require a stored `tenant` field. The generated service
resolves models using the authenticated request tenant; evidence projects that
verified tenant onto returned wallet, balance and ledger DTOs without changing
stored rows. A supplied row tenant must agree, and a changed generated-read
tenant refuses. Original selectors, generated query, storage credentials,
bounded read options and private capture protection are rechecked across awaits.
Never add a domain tenant field to satisfy an evidence check.
Loyalty does not assert that a Waste sale event belongs to an Order: the consuming
domain must verify that relationship and original capture/refund approval.
These reads are not an atomic snapshot or payment/refund execution proof.

An optional exact `enterpriseCode` selector is supported by both evidence APIs.
Without it scope remains the original signed enterprise. A different enterprise
requires exactly one `loyalty.api.readEvidence.callers` grant matching tenant,
principalEnterpriseCode, enterpriseCode, serviceId and every original runtime
project/environment/server/instance/assignment coordinate. The receiving runtime
role must match the owner selection. Defaults contain no grants. Header-only
delegation, duplicate grants and mid-read policy/credential drift refuse. This
selects read-only business evidence, not issuer impersonation or reward mutation;
original principal enterprise and groups remain unchanged.

Enterprise wallet ownership does not change runtime namespace or grant authority.
The business enterprise selector and wallet ownerCode serve different purposes;
neither is copied into the signed principal. Digital whole-bundle capture uses
this exact ledger endpoint for both owner types. Source-composed tests retain
real runtime admission and all original grant coordinates, reject typed owner
collisions, and exercise the existing controller/facade without opening a wallet.

Transport request `enterpriseCode`, `entCode` and `x-enterprise-code` aliases,
when present, must match the signed principal enterprise, not the business body
selector. Leave that header absent when using canonical runtime transport so
the actual outgoing service token supplies its namespace. A pipeline-normalized
default principal may select a separately granted business enterprise in the body;
neither a business header nor a rewritten token can substitute for that grant.
