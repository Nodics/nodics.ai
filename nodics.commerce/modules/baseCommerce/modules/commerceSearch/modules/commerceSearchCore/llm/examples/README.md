# Commerce Search Core examples

## Pin and boost

For category `agoraWomen`, pin `agoraLinenWrapDress` to position one and boost `agoraSatinMidiDress`. The ranked Product discovery result should show the pinned product first, boosted products before normal products, and buried products after normal products.

## Fail open

If the ranking projection service is unavailable, Product discovery returns the original customer-safe product cards unless `product.discovery.rankingFailureBehavior` is configured to `error`.
