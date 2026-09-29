# Order contracts

Order owns immutable order truth, append-only history, customer/operator
lifecycle intent, maker-checker policy, and cross-domain orchestration.
Product and Catalog never own cancellation, return, or refund actions.

Reverse-lifecycle orchestration is idempotent and checkpointed in owner order:
Fulfillment intent, Inventory disposition, then Payment intent. A failure after
any owner step must call the configured compensation recorder with only the
completed owner steps and their content-safe results. Order records the
recovery requirement; it must not directly mutate Fulfillment, Inventory, or
Payment persistence.

Later customer modules may replace individual owner ports or compensation
handling, but they must preserve tenant context, idempotency, maker-checker
separation, correlation evidence, and the domain ownership sequence.

The independent `test/orderReverseLifecycleDepthContract.test.js` covers
CANCELLATION, RETURN and REFUND through Fulfillment, Inventory and Payment in
that order. Its provider-failure probe preserves the original error and the
completed FULFILLMENT/INVENTORY compensation checkpoints. Customer fixture
qualification must not duplicate these synthetic owner-port scenarios or claim
that copying content objects proves publication execution.
