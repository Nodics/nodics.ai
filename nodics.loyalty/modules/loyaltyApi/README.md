# Loyalty API

`loyaltyApi` exposes Loyalty operations such as wallet lookup, reward reservation, capture, release, and exact reservation/redemption evidence. Commerce payment providers should integrate here.

Private `/reward-unit-evidence` projects exact active Program/RewardType precision
and revisions without requiring or opening a wallet. It retains runtime-only
admission and existing namespace grants; it is not a spending authorization.

Private `/wallet-evidence` and `/reward-ledger-evidence` accept exact
`ownerType`/`ownerCode` selectors for CUSTOMER and ENTERPRISE. Runtime authority,
reviewed business-namespace grants and tenant isolation remain mandatory; typed
ownership is evidence, not an access grant. See [exact read evidence](llm/contracts/README.md#exact-read-evidence).

Private `/reward-reservation-evidence` and `/reward-redemption-evidence` read one
exact lifecycle record and independently bind its wallet to the selected typed
participant. They do not transition a hold, post rewards or expose history.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
