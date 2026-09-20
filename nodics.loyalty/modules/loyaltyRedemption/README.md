# Loyalty Redemption

`loyaltyRedemption` records successful or failed reward usage against a reservation or direct capture operation.

Rewards marketplace enterprise data is common Loyalty reference data and belongs
to `loyaltyCore`, not this leaf module. `loyaltyRedemption` consumes enterprise
associations from its redemption evidence and downstream target references.

This capability contributes an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
Deployment selection, environment and tenant checks, confirmation and required services remain mandatory.
