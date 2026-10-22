# loyaltyWallet Contracts

Read-evidence customization dispatches through effective exported helpers.
Private invocation lifetime and exact admitted context remain nonserializable
authority: helper exposure is not an arbitrary generated-service/query API.
Recheck original signed aliases, selectors, policy and bounded result evidence
across awaits; revoke invocation authority on completion, including failure.
Stable lifecycle comparisons use owner definitions through effective `ENUMS`,
with independent transition guards and unchanged persisted/wire strings.

Wallets use `ownerType` and `ownerCode`; tenant/schema context comes from runtime authentication.

Current capability contracts:
- [Participant transfers and read-only wallet projection](participant-transfers.md)
- [Auction funding and protected original holds](auction-funds.md)
- [Partner reward conversion](partner-reward-conversion.md)
- [Isolated Enterprise test credit](enterprise-test-credit.md)

These source contracts do not activate permissions, environments, providers or
funding. Each command retains its own owner admission and verification boundary.

Reward transfers compare canonical `ownerType` plus `ownerCode`, not only wallet
codes. Distinct wallet records for the same owner cannot transfer to each other;
distinct related Enterprises remain independent owners. Both wallet identities
must resolve exactly and be open. The effective scale comes from Loyalty Core's
`loyalty.amount.scale` when not supplied; there is no transfer-local precision
default. Same-program/same-reward-type transfer is not a conversion. The private
service route remains private; customer/employee journeys require their own
owner-authorized admission and cannot bypass it by submitting a service marker.

Protected wallet evidence is owned here and exposed by the existing loyaltyApi
capability. See [exact read evidence](../../../loyaltyApi/llm/contracts/README.md#exact-read-evidence).
The same owner supplies `/reward-unit-evidence`: exact active Program/RewardType
reads with explicit precision validated by Loyalty Core, complete counts,
record revisions and repeated evidence checks. This read requires no wallet and
never provisions one. Stored consumer selections cannot override its scale.
Runtime authority and business namespace grants remain mandatory; evidence is
not a spending approval or a distributed snapshot.
An omitted wallet code selects only one exact existing CUSTOMER or ENTERPRISE
owner, with ownerType/ownerCode/program/reward selectors still mandatory. No
customerCode alias or fabricated Customer is permitted. Explicit code selection
remains exact and never falls back to owner discovery. Neither mode opens a wallet
or forwards caller queries. Tenantless canonical rows are projected into the
verified generated-read partition; conflicting tenant, ambiguous identity and
read-context drift refuse without storage changes.

The existing private ledger evidence route accepts `earningIdempotencyKey`
instead of an original entry/reversal selector for one exact typed participant wallet,
program, reward type and source. It reads EARN rows by source, not by the supplied
key, and rejects a different key or ambiguous rows. An explicit successful
generated count is mandatory, including zero. `ledgerSelection` retains the
checked selectors so consumers can distinguish confirmed absence from an omitted
read. This is read-only evidence, never earning cancellation or balance authority.

Reversal recovery binds to the original ledger entry as well as the retry key.
An existing full reversal is returned even when another retry key is submitted.
Balance writes use expected revisions. A reversal stores its pending immutable
ledger posting in the same balance write as the compensating delta, so a later
ledger-write failure can resume without applying the delta twice. Negative
balances remain forbidden. `test/loyaltyReversalRecoveryContract.test.js` covers
interrupted posting and concurrent duplicate requests. This does not claim
multi-record atomicity for unrelated earning/reservation paths.

Reviewed Local sample credits use the independent `LOYALTY_SAMPLE_CREDITS`
nImport contribution. See [sample credit admission](sample-credit-admission.md).
It requires the selected fail-closed Loyalty transaction provider. It never
imports a wallet/balance/ledger snapshot or funds carbon units.
