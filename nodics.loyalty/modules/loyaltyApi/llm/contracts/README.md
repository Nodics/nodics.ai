# loyaltyApi Contracts

API routes expose Loyalty resources and operations for service-to-service integrations.

After route authorization, wallet-by-code reads use
`DefaultLoyaltyRewardOperationService.serviceRequest`, as do the other Loyalty
operations. Runtime tokens deliberately have no expanded groups; do not copy
them directly into generated storage requests or grant runtime administrator
groups to satisfy schema access. Preserve the authenticated tenant, wallet query,
route permissions and unchanged caller credential. Commerce separately proves
customer wallet ownership before a reward payment.

## Exact Read Evidence

`POST /wallet-evidence` requires exactly `customerCode`, `programCode`,
`rewardTypeCode`, with optional `walletCode` and the business enterprise selector
described below. An explicit wallet code must identify that exact customer's
existing OPEN CUSTOMER wallet; a missing or mismatched code never falls back.
When `walletCode` is absent, the owner reads only the exact
`ownerType:CUSTOMER`/`ownerCode:customerCode` identity in the verified tenant
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

The response echoes `customerCode`, `programCode` and `rewardTypeCode` alongside
the verified tenant/business envelope, allowlisted wallet and exact reward
balance. A missing balance is `null`, not a fabricated zero. Program/type echoes
bind the selected balance scope, not program activation or financial approval;
the consuming owner must retain its approved terms and the earning owner still
validates its current mutation prerequisites. It never calls wallet open or
owner wallet projection, and a missing wallet creates no record.

`POST /reward-ledger-evidence` accepts exactly `customerCode`, `programCode`,
`rewardTypeCode`, `sourceType`, `sourceCode`, and either `entryCode` or
`reversalOfEntryCode`. The original ledger determines the wallet, whose canonical
owner must match the exact customer. Reversal reads detect multiple movements
against the same original and refuse foreign sources rather than filtering them
away. Results contain bounded allowlisted fields, not arbitrary history/metadata.

Alternatively, `earningIdempotencyKey` selects an exact EARN source in that
customer's one existing wallet, with the same program, reward and source fields.
It cannot be combined with either original-entry selector. The owner reads by
source rather than filtering by key, rejects another key or multiple rows, and
requires an explicit successful generated count even for zero rows. The returned
`ledgerSelection` binds that read's entry type, source, key, program and reward
type. Empty `entries` proves only that exact read's observed absence; it grants
no cancellation, mutation or concurrency fence.

Both routes require a router-verified runtime principal scoped to `loyaltyApi`,
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

Transport request `enterpriseCode`, `entCode` and `x-enterprise-code` aliases,
when present, must match the signed principal enterprise, not the business body
selector. Leave that header absent when using canonical runtime transport so
the actual outgoing service token supplies its namespace. A pipeline-normalized
default principal may select a separately granted business enterprise in the body;
neither a business header nor a rewritten token can substitute for that grant.
