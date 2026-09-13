# Bidding agent contract

- Follow `../../../AGENTS.md`, `../../AGENTS.md` and `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read this README, contracts, examples and generated context before edits.

Bidding is a generic Commerce capability. Own bids and seller decisions here;
Product owns published eligibility, Pricing owns private quotes, and Checkout
owns inventory/payment reservations. Never import Waste, reward, or customer
application behavior. Typed seller references must be authorized through trusted
identity services, with Profile deny scopes overriding grants. Payloads never
choose a provider or establish ownership. Preserve the existing checkoutBid
storage identity and command hashes until an explicit owner-governed migration.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
