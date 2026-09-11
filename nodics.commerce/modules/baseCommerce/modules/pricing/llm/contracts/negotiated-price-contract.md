# Private Negotiated Price Contract

`priceQuote` stores an immutable trusted quote. `DefaultNegotiatedPriceService`
issues it only from an authorized server-side Commerce operation; no public
route accepts a customer-selected price override. Canonical `DefaultExactAmountService`
normalizes and calculates amounts without floating point arithmetic.

Quote redemption requires matching enterprise, customer checkout principal,
product and (for new bidding quotes) variant, store, currency, quantity, cart, order and unexpired validity. Normal
catalog price discovery remains unchanged. The checkout preflight validates the
private order binding before any downstream reservation.

The unique command code and immutable terms hash prevent replay with altered
terms. Bid acceptance recovery reuses its quote, cart and order codes. Payment
and ownership settlement still belong to their existing owners.
