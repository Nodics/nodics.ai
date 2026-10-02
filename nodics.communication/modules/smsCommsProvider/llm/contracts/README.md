# SMS provider contract

Status: sandbox-capable, disabled by default, not live qualified. Secret values never enter configuration or evidence. Delivery requires an injected credential resolver and transport, a sandbox endpoint, sender reference, idempotency key, and recipient address reference.

The durable dispatcher calls `deliver({request, intent, policy})`. Before ports are
used, validate matching authenticated/request/intent tenant, SMS channel, DELIVERING
state, future lease, expiry and bounded identity fields. Project only frozen literal
body text; HTML and private template identity never reach the transport.

Select `SMS_SANDBOX` and a trusted `sandboxTransportService` with credential/send
functions. Exported service members remain mergeable and internal calls use `this`.
The legacy three-argument injected interface remains available. Neither interface
supplies a live client. Defaults stay disabled, sandbox-only and not live-qualified.
Missing configuration is UNCONFIGURED, expired intent SUPPRESSED, transport exceptions
UNCERTAIN. Never automatically resend an unknown outcome or claim handset receipt.

Run `smsCommsProviderContract.test.js`, `smsRuntimeAdapter.test.js` and the Core
durable runtime suite. These tests use injected ports, not real carrier delivery.
