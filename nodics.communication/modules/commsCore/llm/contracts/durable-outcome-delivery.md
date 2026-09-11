# Durable outcome delivery

`DefaultCommunicationRuntimeService` binds existing Communication schemas and Core primitives to generated repositories and configured provider adapters. Internal requests require service authentication and `communication.request`; trusted source-module policy and active versioned templates are mandatory. Stable idempotency identity is hashed; replay with a different payload is rejected. Inbox rows belong to canonical Profile customer codes, and customer reads resolve that code before querying.

Intent and delivery attempt records are the delivery authority. Revisioned leases serialize sends. Web IN_APP delivery uses an idempotent inbox key. Telegram resolves a currently eligible Profile link immediately before sending, validates the configured bot credential reference and sends literal text. Successful delivery evidence stores provider reference, never secret credentials. Suppression is evaluated before sending.

Known rejected/transient failures enter bounded RETRY_PENDING with a due time and attempt ceiling. Retry is an explicit authorized operation; this binding does not install a scheduler. A timeout or expired external send lease enters UNCERTAIN and is never blindly resent. An authorized exact-revision reconciliation records evidence/reason and one of MARK_DELIVERED, AUTHORIZE_RESEND or CANCEL. Resend authorization does not itself send and cannot bypass the attempt ceiling. Manual MARK_DELIVERED is operator evidence, not a verified Telegram callback.

Domain decisions and settlement remain independent of notification failure. eWaste stores only the intent/status reference and derives source channel, recipient and public reviewer comment from the persisted submission. No customer overlay owns a second ledger or inbox.

Validation: `test/communicationRuntime.test.js` exercises replay, conflicting payloads, concurrency, retry timing, suppression, uncertain sends and explicit reconciliation. Actual Telegram client acceptance is a deployment test.
