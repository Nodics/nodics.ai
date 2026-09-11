# Negotiated checkout consumption

[Bidding](../../../../../bidding/llm/contracts/README.md) owns negotiation and
seller decisions. Checkout Core owns purchase placement and checkpoints only.
Before inventory or payment reservation, validate Pricing quote buyer, product,
store, currency, exact quantity, expiry, cart and order bindings. Preserve normal
checkout idempotency, compensation and settlement evidence. No bid lifecycle,
seller identity policy or bidding schema belongs in Checkout Core.
