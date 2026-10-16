# Email Communication Provider

This optional provider sends an existing Communication intent through either the
legacy injected sandbox transport or the explicit SMTP test mode. It remains
**disabled by default and not production-qualified**. Communication Core owns
intent identity, suppression, delivery claims, retry and recorded outcomes; Profile
owns verification, identity and business access. No SMTP code belongs in Axis.

## SMTP test mode

### Restricted Local Capture

`test/localSmtpCapture.mjs` is an explicitly operated test harness, not another
runtime provider. Supply an empty canonical directory owned by the operator with
mode `0700`, an explicit port, one reserved `.test` sender and approved `.test`
recipients:

```sh
node nodics.communication/modules/smtpCommsProvider/test/localSmtpCapture.mjs \
  --directory=/absolute/private/session --port=2525 \
  --sender=capture@approved.test --recipient=admin@approved.test \
  --recipient=operator@approved.test
```

It binds only `127.0.0.1`, refuses occupied ports, authenticates AUTH PLAIN with
a random capture-only binding, and enforces the exact sender/one approved recipient.
It never relays, forwards, renders templates or modifies business records.
Connections, command/message bytes, message count and idle time are bounded.
`ready.json` is content-free. `binding.json` and numbered `.eml` files are private
`0600` fixture artifacts; never print them or place values on a command line.
The exported `readBinding(directory)` validates private storage and returns only
the seven sending-process environment bindings. Merge those privately into the
approved backend launch; it does not enable SMTP or qualification. No shared
credential store is changed. SIGTERM/SIGINT closes owned sockets and removes only
this session's owned files, preserving unrelated files and the directory.

Before replacing an operated listener, preserve its validated binding privately
in another owner-only directory. `--binding-directory=/absolute/private/backup`
restores that binding only when port and sender match; validate replacement
equality before retiring the backup. Refusal is terminal: buffered or subsequent
input cannot resume a rejected transaction, even with a half-open client.

`test/helpers/localSmtpRolePreload.mjs` is the reviewable, explicitly selected
process-only launcher adapter. Its five `NODICS_LOCAL_SMTP_CAPTURE_*` selectors
choose directory, project, environment, server and npm script. The supervisor and
every nonmatching child lose provider bindings and both enable switches; only
the exact selected build/start command and cwd receive the private `readBinding`
values. It does not set qualification or onboarding policy. Do not preload it
into a sending child or expose its binding through logs/argv.

Use `secure=false`, `requireTLS=false`, `allowInsecureLoopback=true` only for this
loopback fixture. Keep the real provider's recipient allowlist independently exact,
test-only/non-live, certificate verification and no file/URL access. Start capture
only after explicit scope approval and fresh identity collision checks. Artificial
probes are not OTP, identity provisioning, inbox or registration qualification.

```sh
node --test nodics.communication/modules/smtpCommsProvider/test/localSmtpCapture.test.js nodics.communication/modules/smtpCommsProvider/test/localSmtpRolePreload.test.js
```

The provider accepts the durable dispatcher envelope `{ request, intent, policy }`
and uses the framework-owned Nodemailer dependency. The original three-argument
sandbox call remains supported. A selected sender, secret reference, test-recipient
allowlist and TLS policy are required; no live values are provided by this module.

`DELIVERED` with `SUC_COMMS_SMTP_ACCEPTED` means the SMTP server accepted the
message, not that an inbox was inspected. Unknown transport outcomes are
`UNCERTAIN`; only definite temporary SMTP rejections are retryable. Health reports
configuration without opening a connection or claiming mailbox delivery.

Read the [provider contract](llm/contracts/README.md) and the canonical detailed
[Communication provider runbook](../commsCore/data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js).
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
