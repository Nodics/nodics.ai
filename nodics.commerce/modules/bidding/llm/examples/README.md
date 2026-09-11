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
