# Payment Core contracts

Payment owns original capture evidence, financial replay identity and provider
outcomes. Order owns signed staff scope, independent refund policy, approval and
domain checkpoints. Neither browser fields nor a sandbox provider token confer
refund authority. Generated Payment reads remain protected and owner-scoped.

Fresh Payment transaction and entry evidence retains the original operation's
`enterpriseCode` and unchanged operation `idempotencyKey`. Legacy records are not
backfilled from a later caller. Digital ownership settlement requires the original
merchant, Checkout key, authorization and captured-ledger chain; enterprise-less
historical payment evidence cannot qualify that path. Retention grants no policy
approval or provider qualification.
Every supplied operation `enterpriseCode/entCode` and signed auth alias must be
an equal bounded identifier (1..128 letters/digits or `_.:@-`) before dispatch or
transaction retention. Conflicting, null, empty or malformed aliases refuse;
missing scope stays absent rather than being invented for a historical record.

`executeRefund` refuses generic callers before reads, writes or provider dispatch.
`refundOrder` revalidates `DefaultOrderRefundRecoveryService.paymentAuthority`
using the caller's original signed staff context. It requires current
`commerce.refund.execute`, the original persisted case/command/reason, exact Order
owner/enterprise/total/currency, the refund lock and successful domain settlement.
`preflightOrder` checks the same persisted approval and original financial evidence
before domain preparation; it cannot dispatch a provider operation.

Connected paths are one full `LOYALTY_REWARD` capture with its stored wallet and
original ledger reference, or one explicitly bound `LOCAL_SANDBOX_DEMO` CARD
capture under the offline contract below. The persisted approval pins that capture.
Caller financial/provider identity overrides are rejected; caller totals are not
authority. The SHA-256 financial key binds tenant, enterprise, Order and canonical
approval, independent of action names. Stored intent additionally binds capture,
amount, currency, provider, wallet, program, reward type, original ledger and
approval command. Replays must match that intent before accepting stored outcomes.

Both `paymentTransaction` and checkout's `paymentTransactionEntry` refund evidence
are checked before dispatch. Prior partial, ambiguous, legacy/unbound or checkout
compensation refunds block another full refund pending manual remaining-authority
reconciliation. Read errors, malformed/oversized result sets and missing owners do
not mean zero prior refunds. This bounded implementation does not infer partial
refunds or extend real-CARD/split-capture authority.

Persisted financial intent and provider outcome are read back before success.
Failed, delayed, unknown and success-without-receipt results stay reconciliation
work. Repeat calls retain the original transaction and one recovery record;
same-process concurrent replays share the complete provider/persistence result.
Cross-worker durability still depends on canonical owner uniqueness and the
provider's original-reference/idempotency contract; isolated tests do not prove
distributed atomicity or live settlement. A persistence failure after provider
dispatch requires recovery with the original identity, never a fresh refund key.

Missing gates remain explicit: generic/partial/real-CARD/split-capture authority,
qualified physical reversal and provider-confirmed recovery/native acceptance.
Do not enable disabled `order.refunds`, fabricate customer/Profile context, accept
arbitrary provider tokens or relax protected reads to work around those gates.

Validation: `test/paymentRefundSafetyContract.test.js`,
`test/paymentRefundExecutionContract.test.js`, and the real Order/Payment
composition in Order's `test/orderRefundRecoveryContract.test.js`. Native provider
qualification and release readiness are separate gates.

## CARD Original-Capture Gate

Real CARD and historical unbound sandbox captures remain intentionally refused
by orderCapture, preflightOrder and refundOrder before dispatch or financial
writes. The legacy Stripe-shaped receipt binds only tenant, operation and key;
it is not original-capture authority. Visa, CyberSource and PayPal remain declared
provider boundaries without executable network adapters. Card prepare validates
a token but supplies no captured-transaction lookup. Callback signature checking
does not supply a receipt resolver or financial reconciliation worker.

A separate **offline-only** original-capture path is connected through
DefaultStripeSandboxAdapterService. A trusted server capture request must
explicitly select sandboxMode: LOCAL_SANDBOX_DEMO and supply tenant, enterprise,
owner, persisted Order, CARD method, exact amount/currency, capture idempotency
and authorization reference. DefaultPaymentExecutionService retains its
ORIGINAL_CAPTURE_V1 receipt in the existing PaymentTransactionEntry.evidence,
then reads it back. Replays must preserve the complete binding and explicit mode.
No enabling flag, schema/ledger or caller receipt becomes financial authority.

Order's existing paymentAuthority interface is unchanged. A current approval must
pin the exact protected capture and bind its owner/order/enterprise/amount/currency.
Payment re-reads it, checks both financial owners for prior refunds, derives one
stable SHA-256 key and rejects caller provider/token/receipt/mode overrides.
refundOriginal independently revalidates that authority before constructing the
tokenless ORIGINAL_CAPTURE_REFUND_V1 receipt. It binds original capture
code/reference/key, scope, amount/currency/provider, canonical approval and
financial idempotency. verifyRefundResponse checks it before persistence;
confirmRefund re-reads the generated transaction and original capture before
success, including stored replays. A deterministic digest is not a signature:
only protected owner evidence plus guarded approval establish this offline intent.

Preflight, result, transaction and recovery evidence preserve sandbox: true,
sandboxMode: LOCAL_SANDBOX_DEMO and maturity: OFFLINE_CONFORMANCE.
REFUND_SUCCEEDED on this path means **confirmed offline simulation only**.
It is never provider-confirmed financial execution or settlement. Order/channel
owners must preserve those labels and redact private receipt/financial intent.

## Offline Recovery And Integration

An optional server/test-only sandboxRefundOutcome is pinned at capture. REFUNDED
is the default; REFUND_PENDING, REFUND_FAILED and RECONCILIATION_REQUIRED exercise
delayed, failed and ambiguous recovery. A refund caller cannot select an outcome.
Valid pending/failed receipts and unconfirmed/thrown results retain the original
transaction and one reconciliation record. An unconfirmed outcome has no invented
receipt and explicitly requires manual recovery. Replay does not redispatch or
upgrade pending to success. No polling or real settlement worker is implied.

Protected read failure, foreign/changed/missing capture, prior refunds and changed
retained refund receipts fail closed. Missing durable persistence/readback is
recovery work; retry never changes the financial key. Local in-flight guards are
not proof of cross-worker exactly-once execution or provider/database atomicity.

Native checkout integration is outside Payment: its capturePayment must set the
explicit mode from trusted local-demo configuration, not browser payload, while
keeping signed owner, Order, amount/currency and enterprise context. Legacy checkout
compensation REFUND against a new bound capture is refused; an owning guarded
compensation bridge or manual recovery is required, not manufactured approval.
Payment does not grant policy, fabricate Profile context or relax protected reads.

## Real Provider Qualification

Real CARD still lacks a credentialed provider-owned original capture/account/
merchant lookup, original-reference refund and receipt/status reconciliation
contract. Required evidence includes exact original capture/amount/currency/
provider matching, stable idempotency, ambiguous-outcome recovery, signed callback
replay, runtime-only secrets, security/finance review and owner sign-off.
Provider declarations or liveQualified assertions cannot satisfy those gates.
Split and partial refunds remain outside this full-capture implementation.

Validation: paymentOriginalCaptureSandboxContract.test.js exercises bound capture,
tokenless refund, exact scope/amount/currency, remaining authority, altered receipts,
replay/concurrency, error envelopes and failed persistence using real services and
isolated owners. paymentCardOriginalCaptureContract.test.js preserves historical/
real-CARD refusal and legacy simulator compatibility. Payment refund safety tests
remain mandatory. No isolated proof qualifies native deployment or actual funds.
