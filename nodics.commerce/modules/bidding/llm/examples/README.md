# Bidding examples

- Success: publish an ordinary book or service with commerceBidding enabled and
  a Profile customer sellerRef. A buyer offers 12.50; the seller accepts; Pricing
  issues a private quote and Checkout pays 12.50 without changing the public price.
- Enterprise: use a Profile enterprise sellerRef. An employee needs bidding
  participation and management grants plus a matching effective enterprise scope.
  A customer whose code equals the enterprise code has no seller authority.
- Rejection: disabled eligibility, a different currency, self-bidding, missing
  confirmation, forged seller payloads, or another participant's code fail closed.
- Boundary: reject amounts beyond configured scale/maximum and expired decisions;
  the list is bounded to 100. Accepted terms do not promise inventory availability.
- Recovery: retry an interrupted ACCEPT with the same idempotency key. Reuse the
  one immutable quote and original checkout identity; never create another charge.
- Customization: configure a later module's identityService to return trusted
  sellerRefs for a merchant account schema, or offerService to enforce additional
  Product eligibility. Never take either service name from an HTTP body.

## Auctions

- A published AUCTION has price 300 and an existing offer of 500. Independent
  offers of 300, 450 and 500 qualify; 299 fails. Equal 500 offers use their
  successful server sequence, not request timestamps. A changed amount resets
  priority; a no-op update/retry does not.
- Publish with an end date and open the round through POST `/auctions`. Bidder
  PLACE/UPDATE/WITHDRAW and seller SELECT/CANCEL use the round command endpoint
  with reviewed round/bid revisions. All routes include the governed store.
- At end, an authorized scheduler closes intake. Seller selection remains during
  retained grace; at its deadline mandatory fallback selects highest/earliest.
  An original full hold is adopted by shared Checkout; acceptance is not payment.
- A missing Loyalty adjustment response leaves a pending command. Retry the same
  key or let authorized due work reconcile it. Never release and recreate the
  whole hold, start another selection, or treat an unknown response as success.
- The seller sees all offers; another bidder sees own offers and count/highest
  only. Employee login IDs, wallet details and competitors are not public fields.
- Cancel while intake is open, reconcile holds, then publish a new Product
  publication/round. Never carry old bids into the new round or re-award a failed
  selected purchase. See the exact ports and outstanding owner wiring in the
  [auction contract](../contracts/auction-round-contract.md).
