# loyaltyCore

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Own shared Loyalty enums, policies, validators, and service contracts. Do not place wallet balances, ledger history, reservation state, or Commerce payment behavior here.

Common Loyalty reference data belongs here when it serves the whole Loyalty
functional module. Leaf modules own only capability-local data.

This capability contributes an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
Deployment selection, environment and tenant checks, confirmation and required services remain mandatory.
