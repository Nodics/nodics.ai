# Agreement Examples

- Create an agreement using an existing Product package version and Pricing
  price-row version. Choose either commercial model independently of prepaid
  or invoice terms. Supply explicit dates, service/allowance descriptions,
  renewal choice and agreement evidence. The result is a persisted assignment,
  not an activated Enterprise or a payment receipt.
- To change models next month, submit a new command with the current revision,
  full agreed replacement terms, future effective date and explicit financial
  treatment. Current benefit reads retain the previous version until that date.
- For selected-coupon coverage, supply exact Product codes and target type
  SELECTED_COUPONS. Search intersects these with Promotion-confirmed issuer
  membership and the already available Product candidates. A foreign or
  filtered-out product receives no effect.
- For all-Enterprise coverage, use ALL_ENTERPRISE_COUPONS and an empty selected
  list. A newly eligible coupon joins dynamically while coverage is effective.
  Coupon expiry and boost expiry remain independent.
- Retry a lost response with the same command, terms and actor. A committed
  command returns its retained version. Reusing its identity with changed terms
  is rejected. Concurrent stale updates never discard either original history.
- An unknown price version, missing automatic-renewal evidence, invalid time
  interval or unavailable persistence rejects without creating an agreement.
- A later layer may lower `commercialAgreement.maximumBenefits` intentionally.
  Do not copy the other defaults or put actual package prices in properties.
- Business users review retained terms; administrators manage authorized
  commands and Profile status; developers extend exported members; maintainers
  run owner unit tests; operators separately qualify installed behavior. AI tools
  must not claim billing, browser or live acceptance from these examples.
