# Digital Core Agents

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Digital Core coordinates checkout-time digital unit allocation. Keep this layer small and contract-driven.

- Do not duplicate Product or Promotion models.
- Do not reserve digital units during add-to-cart or calculate-cart.
- Reserve at checkout only, immediately before payment authorization.
- Release reserved units during checkout compensation before returning a failure.
