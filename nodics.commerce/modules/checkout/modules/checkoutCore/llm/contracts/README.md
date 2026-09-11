# Checkout Core Contracts

Checkout owns placement, compensation and purchase idempotency. Bidding owns pre-checkout negotiation.
See [negotiated purchases](negotiated-purchase-contract.md), the Commerce checkout
contract and Pricing's private quote contract. Product remains the published
catalog authority; payment is reserved only during Checkout.

Provider authorization must return an explicit `AUTHORIZED` Payment transaction
before Checkout creates an order. Declined, cancelled, missing and unconfirmed
responses fail closed through Checkout-owned customer error codes and the existing
reservation compensation path. Payment remains the authority for provider outcome
evidence and attempt idempotency. Offline probes cover decline/cancel; projects
replace the provider adapter for credentialed integrations without bypassing this
Checkout condition.
