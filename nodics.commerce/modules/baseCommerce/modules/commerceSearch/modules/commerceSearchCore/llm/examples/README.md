# Commerce Search Core examples

## Pin and boost

For category `agoraWomen`, pin `agoraLinenWrapDress` to position one and boost `agoraSatinMidiDress`. The ranked Product discovery result should show the pinned product first, boosted products before normal products, and buried products after normal products.

## Fail open

If the ranking projection service is unavailable, Product discovery returns the original customer-safe product cards unless `product.discovery.rankingFailureBehavior` is configured to `error`.

## Agreed Benefit

An approved rule references an existing commercialAgreement benefit, chooses a
query scope and supplies explicit start/end dates within that benefit period.
Keep its actions empty. Search resolves current terms and canonical issuer
membership on each query. An all-Enterprise benefit includes a newly available
coupon automatically; selected coverage does not include foreign coupons even
when an operator supplied their Product codes. A sold-out/expired coupon removed
by Product never reappears because of ranking.

## Recovery And Bounds

After an index failure, repeat publication: the approved source hash reuses its
immutable snapshot. Do not treat that snapshot as proof of successful indexing.
If a rule scan exceeds its bound or repeats pages, reject ranking and let the
Product failure policy decide the customer result. A later module can explicitly
increase maximumRuleScan or alter weights in properties; it must not copy other
defaults. A zero BOOST weight remains a no-op with either ranking engine.
