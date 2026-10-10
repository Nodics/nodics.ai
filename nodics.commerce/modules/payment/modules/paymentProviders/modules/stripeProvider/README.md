# Stripe Provider

Stripe Provider is the named, provider-specific adapter boundary under
Payment Providers. Payment Core retains transaction, callback, idempotency,
security, and reconciliation authority.

The included `DefaultStripeSandboxAdapterService` is a deterministic offline
simulator. Its legacy execute method accepts only opaque `tok_test_` tokens and
supports authorize, capture, void, and refund conformance. It does not call Stripe and must be
reported as `OFFLINE_CONFORMANCE`, never as live-qualified.

A project may enable the simulator only in isolated local/test configuration.
Production qualification requires a separate credentialed Stripe test-mode
adapter, secret-manager integration, signed webhook verification and replay,
ambiguous-timeout reconciliation, rate/capacity evidence, security and finance
review, operational runbooks, and named owner approval. Provider secrets and
raw payment credentials must never enter Nodics records, logs, documentation,
Axis configuration, or source control.

Archived gComm remains reference-only.

Offline checkout probes use `tok_test_storefront_4242` for success,
`tok_test_storefront_0002` for declined authorization, and
`tok_test_storefront_0000` for customer cancellation. These tokens never contact a
payment network. Payment Core persists each outcome; Checkout must reject every
non-authorized outcome before creating an order. A retry uses a new checkout
idempotency key while a replay preserves the prior attempt's outcome.

## Explicit Original-Capture Sandbox

A server-owned capture request may explicitly select
`sandboxMode: "LOCAL_SANDBOX_DEMO"`. It must carry tenant, enterprise, signed
checkout-derived owner, persisted Order, CARD method, exact amount/currency,
original capture idempotency key and authorization reference. Payment Core retains
the deterministic `ORIGINAL_CAPTURE_V1` receipt in the existing transaction-entry
evidence and requires readback. The purchase test token is never retained.

`refundOriginal` is tokenless and independently revalidates the existing guarded
Order paymentAuthority through Payment Core. `confirmOriginalCapture` reads the
protected original entry; `verifyRefundResponse` and `confirmRefund` check the
capture-bound refund receipt and retained transaction. Neither a caller digest
nor a mode flag supplies approval or remaining refundable authority.

Unbound historical receipts remain ineligible; generic legacy REFUND cannot
reverse a new bound capture. See the [owner contract](llm/contracts/README.md)
for stable replay, recovery and native integration requirements. Successful
refund means an offline simulated reversal only, never real financial execution.
