# Stripe Provider contracts

## Offline Original Capture

No method in this adapter contacts Stripe or moves funds. Provider properties
remain `sandboxOnly: true`, `liveQualified: false`; no enabling flags are changed.
Legacy execute behavior is unchanged unless explicit new mode is selected.

`captureBinding` / `captureOriginal` accept only CARD captures explicitly marked
`LOCAL_SANDBOX_DEMO`. Binding includes tenant, enterprise, owner, Order, method,
exact amount, currency, authorization reference and original capture idempotency.
The authorization reference must have the existing offline AUTHORIZE reference
shape (`sim_` plus 24 hexadecimal characters); a credential/token is rejected
instead of being retained in the receipt. Format checking is not authorization:
the owning signed checkout flow and protected retained capture remain mandatory.
The deterministic receipt is `ORIGINAL_CAPTURE_V1`, maturity
`OFFLINE_CONFORMANCE`. It is a consistency checksum, not a signature or authority.
Only the protected generated Payment owner's retained row can establish original
capture evidence. `validateCaptureRecord` checks replay and Payment requires fresh
repository readback before qualifying the capture. Missing or altered receipt,
foreign scope, amount/currency changes and mode downgrade fail closed.

The optional server/test-only `sandboxRefundOutcome` is pinned at capture, not
chosen by a refund caller. Allowed values are REFUNDED (default), REFUND_PENDING,
REFUND_FAILED and RECONCILIATION_REQUIRED. This is deterministic offline scenario
coverage, not a provider settlement switch. Tokens and credentials are not stored.

## Guarded Refund And Readback

`confirmOriginalCapture` reads the bounded protected transaction-entry owner.
`refundOriginal(request, ownerCommand)` independently re-enters Payment Core's
guarded refundContext, requiring current Order paymentAuthority, canonical
persisted approval and remaining refundable authority. It rejects caller tokens;
its financial request must match the newly derived approved intent. No alternate
ledger or caller-provided receipt is used.

`ORIGINAL_CAPTURE_REFUND_V1` binds the original capture code/reference/key,
tenant/enterprise/owner/Order, exact amount/currency/provider, canonical refund
approval/command and stable refund key. `verifyRefundResponse` checks the entire
response before persistence. `confirmRefund` reads the generated transaction
owner and checks its receipt/status before reporting success, including replay.

Pending, failed and unconfirmed outcomes stay recovery work. An unconfirmed or
thrown adapter result is conservatively retained as manual reconciliation with
no invented provider receipt; replay cannot dispatch another operation. A valid
pending receipt remains pending: this adapter does not poll a network or complete
real settlement. Changed persisted receipts fail closed. Persistence failure is
recovery work under the original identity, never permission for a fresh key.

## Native Integration And Proof Limits

Checkout must set the mode from trusted server-owned local-demo configuration,
not forward a browser selection. Capture already needs a persisted Order and
trusted owner/amount/currency; enterprise can come from the existing signed
authData.entCode/enterpriseCode. Order must propagate `sandbox: true`,
`sandboxMode: LOCAL_SANDBOX_DEMO` and `maturity: OFFLINE_CONFORMANCE` from Payment
preflight/results without exposing private receipts to customer channels.

Legacy checkout compensation REFUND is refused for a bound capture. It requires
an owning guarded compensation/recovery design, not an invented Order approval
or test token. No cross-owner bridge is implemented by this provider contract.

Real CARD needs a separate credentialed provider-owned capture/account lookup,
original-reference refund and receipt/status reconciliation contract, signed
callbacks, runtime secrets and operational/security/finance qualification. A
simulated receipt cannot satisfy those gates. Split/partial refunds are outside
this bounded full-capture contract. Isolated tests do not prove native acceptance,
cross-worker atomicity or live financial execution.

Validation lives in Payment Core's paymentOriginalCaptureSandboxContract and
paymentCardOriginalCaptureContract tests, using the real adapter with isolated
generated owners and guarded authority fixtures. No runtime or network is needed.
