# Bidding

Generic Commerce negotiation for published physical products, services, digital
products and other eligible Product offers. Buyers submit exact single-unit
terms; authorized customer or enterprise sellers accept or reject them. Buyers
can withdraw open bids. This is negotiated purchase, not a timed auction engine.

Product owns offer eligibility and typed seller identity. Bidding persists the
negotiation; Pricing issues private accepted prices; Checkout performs normal
reservation and payment. Domain accelerators consume these APIs and perform
their own fulfillment after payment.

Configure `bidding` in a later module to enable stores, currency limits, expiry,
and trusted identity/offer services. The default is disabled. Read the
[contract](llm/contracts/README.md) and [examples](llm/examples/README.md).
Run `npm test` in this module for participant isolation, generic products,
enterprise scopes, retries, legacy records and negotiated-price checkout tests.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
