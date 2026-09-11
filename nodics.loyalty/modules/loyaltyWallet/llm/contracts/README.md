# loyaltyWallet Contracts

Wallets use `ownerType` and `ownerCode`; tenant/schema context comes from runtime authentication.

Reversal recovery binds to the original ledger entry as well as the retry key.
An existing full reversal is returned even when another retry key is submitted.
Balance writes use expected revisions. A reversal stores its pending immutable
ledger posting in the same balance write as the compensating delta, so a later
ledger-write failure can resume without applying the delta twice. Negative
balances remain forbidden. `test/loyaltyReversalRecoveryContract.test.js` covers
interrupted posting and concurrent duplicate requests. This does not claim
multi-record atomicity for unrelated earning/reservation paths.
