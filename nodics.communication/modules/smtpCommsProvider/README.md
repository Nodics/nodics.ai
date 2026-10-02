# Email Communication Provider

This optional provider sends an existing Communication intent through either the
legacy injected sandbox transport or the explicit SMTP test mode. It remains
**disabled by default and not production-qualified**. Communication Core owns
intent identity, suppression, delivery claims, retry and recorded outcomes; Profile
owns verification, identity and business access. No SMTP code belongs in Axis.

## SMTP test mode

The provider accepts the durable dispatcher envelope `{ request, intent, policy }`
and uses the framework-owned Nodemailer dependency. The original three-argument
sandbox call remains supported. A selected sender, secret reference, test-recipient
allowlist and TLS policy are required; no live values are provided by this module.

`DELIVERED` with `SUC_COMMS_SMTP_ACCEPTED` means the SMTP server accepted the
message, not that an inbox was inspected. Unknown transport outcomes are
`UNCERTAIN`; only definite temporary SMTP rejections are retryable. Health reports
configuration without opening a connection or claiming mailbox delivery.

Read the [provider contract](llm/contracts/README.md) and the canonical detailed
[Communication provider runbook](../../../nodics.docs/docs/pages/nodics.communication/provider-runbooks.md).
Project/runtime selections belong in the actual sending environment, not here.

## Verification

```sh
node --test nodics.communication/modules/smtpCommsProvider/test/smtpRuntimeAdapter.test.js nodics.communication/modules/smtpCommsProvider/test/smtpCommsProviderContract.test.js
```

The suite contains two temporary loopback SMTP server tests with artificial
recipients; other cases use injected transport/storage. It does not contact Gmail,
qualify a deployed runtime, publish a guide or prove external mailbox receipt.

Frozen intents may include HTML alongside required plain text. The provider sends
a MIME alternative, bounds both bodies and never resolves templates or remote
assets. The loopback suite verifies both MIME parts; client rendering is a separate
acceptance check.
