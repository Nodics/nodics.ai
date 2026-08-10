# Stripe Provider

Stripe Provider is the named, provider-specific adapter boundary under
Payment Providers. Payment Core retains transaction, callback, idempotency,
security, and reconciliation authority.

The included `DefaultStripeSandboxAdapterService` is a deterministic offline
simulator. It accepts only opaque `tok_test_` tokens and supports authorize,
capture, void, and refund conformance. It does not call Stripe and must be
reported as `OFFLINE_CONFORMANCE`, never as live-qualified.

A project may enable the simulator only in isolated local/test configuration.
Production qualification requires a separate credentialed Stripe test-mode
adapter, secret-manager integration, signed webhook verification and replay,
ambiguous-timeout reconciliation, rate/capacity evidence, security and finance
review, operational runbooks, and named owner approval. Provider secrets and
raw payment credentials must never enter Nodics records, logs, documentation,
Axis configuration, or source control.

Archived gComm remains reference-only.
