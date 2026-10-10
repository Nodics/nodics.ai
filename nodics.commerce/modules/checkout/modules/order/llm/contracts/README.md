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

Every orchestration port must exist before the first owner effect. Policy decisions
require explicit Boolean eligibility and approval selection. Only confirmed
approval/rejection/pending outcomes may be returned. Each owner phase must return
an explicit recognized success; Payment also retains its transaction reference.
Pending, missing or errored responses stop later owners. Compensation evidence
retains confirmed prior steps plus the unconfirmed phase, including a lost
acknowledgment. A recorder failure never replaces the original owner failure.
Completed replay evidence must bind the exact tenant, order and idempotency key;
partial or mismatched evidence requires reconciliation, not replay success.

Lifecycle action persistence uses the observed tenant, request code and revision.
Require one acknowledged modified record, then confirm its identity, next revision
and intended fields through a cache-bypassing generated-owner read. Return that
persisted request to the caller. An acknowledgment alone is not a lifecycle state;
failed, unmatched, ambiguous or divergent evidence requires reread/reconciliation.
Transport retries of the same blocked action by the same operator retain the
original action correlation and revision; a new HTTP correlation is not a new
business action. Changed operators or actions remain separate recorded attempts.

The processor's synthetic ports are not proof of a connected physical reversal.
Generic reverse operator actions currently fail closed; guarded original-capture
refunds have separate policy, Profile and financial gates. See the
[purchase review and reverse safety contract](manual-purchase-review-contract.md).

Later customer modules may replace individual owner ports or compensation
handling, but they must preserve tenant context, idempotency, maker-checker
separation, correlation evidence, and the domain ownership sequence.

The independent `test/orderReverseLifecycleDepthContract.test.js` covers
CANCELLATION, RETURN and REFUND through Fulfillment, Inventory and Payment in
that order. Its provider-failure probe preserves the original error and the
completed FULFILLMENT/INVENTORY compensation checkpoints. Customer fixture
qualification must not duplicate these synthetic owner-port scenarios or claim
that copying content objects proves publication execution.
