# Purchase Review and Guarded Refunds

Order owns customer review cases, refund intent and outcome. Profile owns employee
membership, permissions and scope. Payment owns the original capture and refund;
Digital Core and Promotion own coupon revocation. Configured domain ports own
non-Commerce reversals. Clients never supply payment amounts, wallet references,
original ledger entries, asset owners or a provider implementation.

Customer cancellation, refund and dispute requests are stored as DISPUTE records
in the existing `orderLifecycleRequest` store. Requests require confirmation,
a bounded reason and stable idempotency. Manual resolution remains available and
does not execute financial changes. Operators require `commerce.dispute.review`
and current Profile scope; generic lifecycle actions cannot bypass these checks.

When a deployment explicitly enables `order.refunds`, a moderator can preview a
full refund for a configured order prefix. Payment reads the single successful
capture from the existing `paymentTransactionEntry` store. The first supported
automatic provider is Loyalty reward points; other provider and split-capture
cases require manual resolution. The captured total must exactly match the order.
No partial refunds are inferred.

Digital Core permits unused, unclaimed coupon entitlements only and locks them
before Promotion revocation. Mixed or incomplete digital orders fail closed.
A configured external domain port must supply preview, prepare, settle and
complete operations. Generic Commerce contains no Waste asset or carbon rules.

Execution requires `commerce.refund.execute`, fresh reviewed eligibility, a reason,
confirmation and a stable command. A canonical per-order REFUND record prevents a
second customer case from issuing another full refund. The existing
`DefaultOrderLifecycleService` processor calls owner ports. Each successful phase
is checkpointed in the existing request evidence. Payment completes before final
ownership/revocation projection. Failures remain RECONCILIATION_REQUIRED with
original approval and completed phases intact. Retry reuses the original command
and receipt/ledger identities; it does not create another refund.

The customer case becomes REFUNDED only after every owner completes. Otherwise
it shows REFUND_RECONCILIATION and linked recovery evidence. Original history is
retained. Raw provider credentials are never placed in customer responses.

Validation: `test/orderDisputeContract.test.js`,
`test/orderRefundRecoveryContract.test.js`, Payment original-capture tests,
Digital Core revocation tests and connected refund/replay qualification.
