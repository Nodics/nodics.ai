# loyaltyWallet Contracts

Wallets use `ownerType` and `ownerCode`; tenant/schema context comes from runtime authentication.

Protected wallet evidence is owned here and exposed by the existing loyaltyApi
capability. See [exact read evidence](../../../loyaltyApi/llm/contracts/README.md#exact-read-evidence).
An omitted wallet code selects only one exact existing CUSTOMER owner, with
customer/program/reward selectors still mandatory. Explicit code selection
remains exact and never falls back to owner discovery. Neither mode opens a wallet
or forwards caller queries. Tenantless canonical rows are projected into the
verified generated-read partition; conflicting tenant, ambiguous identity and
read-context drift refuse without storage changes.

The existing private ledger evidence route accepts `earningIdempotencyKey`
instead of an original entry/reversal selector for one exact CUSTOMER wallet,
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
