# Loyalty Core

`loyaltyCore` defines shared Loyalty concepts used by the child capabilities: operation types, owner types, policy rules, amount handling, and status definitions.

Common Loyalty reference data belongs here. `loyaltyCore` contributes
`NODICS_REWARDS_MARKETPLACE_CO` into Profile's `enterprise` schema as the shared
Loyalty demo/reference enterprise for rewards marketplace and coupon redemption
flows.

This capability contributes an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
Deployment selection, environment and tenant checks, confirmation and required services remain mandatory.
