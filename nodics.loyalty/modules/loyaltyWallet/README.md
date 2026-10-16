# Loyalty Wallet

`loyaltyWallet` defines reward wallet ownership and balance projections per program and reward type. Balance changes must be explained by ledger entries.

Reviewed sample-credit contributions are disabled by default. A deployment may
explicitly select a Local or non-Local demo environment through the existing
`loyalty.sampleCredits.allowedEnvironments` and exact `approvedSources` pins;
environment class alone grants nothing. Human permission, sample ownership,
original balance, atomic posting and once-only replay remain mandatory. See
[Sample Credit Admission](llm/contracts/sample-credit-admission.md).

The first operation service owns balance mutation for `earn`, `reserve`, `capture`, `release`, and `reverse`. It coordinates reservation, redemption, and ledger persistence through generated services without storing tenant or enterprise fields in Loyalty models.

Wallet projections return up to 100 recent ledger entries, ordered by posting time descending with the code as a stable tie-breaker. The generated database request uses `searchOptions` for its page size and ordering; owner and runtime tenant scopes remain authoritative. This bounded projection is not a complete history export.

This capability contributes an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
Deployment selection, environment and tenant checks, confirmation and required services remain mandatory.
