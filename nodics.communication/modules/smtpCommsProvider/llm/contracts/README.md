# Email provider contract

Durable sandbox dispatch applies tenant/channel/lease/expiry checks before injected
ports. Only bounded subject/body/HTML strings reach the transport; private template
identity remains in the intent. This does not live-qualify sandbox delivery.
The sandbox-specific regression is in `smtpRuntimeAdapter.test.js`.

## Ownership and compatibility

The canonical owner is `nodics.communication/modules/smtpCommsProvider`.
Preserve the legacy `deliver(request, ports, configuration)` sandbox boundary.
The durable form is `deliver({ request, intent, policy })`; trusted provider
selection comes from Communication, never a browser body. Do not place adapter
shims or credentials in Profile, Axis or a separate email registry.

`SANDBOX` is disabled by default. `SMTP` is explicitly selected and remains a
controlled test capability, not production qualification. Defaults and provider
registration are in this module's `config/properties.js`. Later runtime layers
supply only intended differences. The real sending worker must resolve them.

## Required SMTP boundary

Before transport creation, require a matching authenticated/request/intent tenant,
a current claimed `DELIVERING` intent, unexpired lease, valid single recipient,
explicit approved-recipient allowlist and sender-to-authenticated-account match.
An expired intent is suppressed. The provider does not generate or approve a code,
activate an employee, repeat a review or change the source-domain operation.

`runtimeConfiguration.credentials[credentialReference]` has precedence over the
existing `secureConfiguration.credentials` store. The resolved object is a local
password/app-password credential `{user, pass}` or OAuth2 `{type, user,
accessToken}`. Renew tokens through the approved secret owner. Resolve on each
send; do not retain credentials in a pool. Authoring literal live secrets in
source, examples, logs or evidence remains prohibited.

`communication.senders[senderReference]` resolves a plain mailbox or an
`{address, name}` object. Headers, display-name syntax in a mailbox, multiple
recipients and user-selected envelope destinations are rejected. The initial test
policy requires the sender address to match the authentication username; aliases
need separate provider qualification rather than silently bypassing that rule.

TLS certificate verification is mandatory. Use implicit TLS or required STARTTLS;
plaintext requires an explicit loopback-only test selection. Insecure remote
connections, arbitrary TLS overrides and production-mode flags are rejected.
Timeouts, subject/body size and recipient count remain bounded.
HTML and plain text are separate MIME alternatives from the frozen private intent.
When HTML is present it must be a string, and the size bound includes both bodies.
The provider never resolves templates or rerenders parameters. Plain text remains
required. Test HTML/text MIME delivery and legacy text-only compatibility.

Nodemailer owns
SMTP/MIME mechanics; it receives no arbitrary raw payload, attachment path, URL,
transport logger or debug option. File/URL access remains disabled.

## Outcome and retry semantics

One provider invocation performs one send. An exact one-recipient acceptance with
no rejection maps to `DELIVERED` / `SUC_COMMS_SMTP_ACCEPTED`; this is server
acceptance, not independently observed mailbox receipt. A failed configuration or
authentication maps to `UNCONFIGURED`; an explicit temporary SMTP rejection may
map to `RETRY_PENDING`; a definite permanent rejection maps to `FAILED`.
Malformed or lost replies map to `UNCERTAIN`. Do not guess that a timeout means
nothing was sent. Transport cleanup must not erase an acknowledged acceptance.

The existing runtime owns retries and uncertainty reconciliation. It must prove
its exact managed revision and private write marker before invoking the provider.
A zero-match update or rereading another writer's claimed record cannot authorize
sending. Schema vocabulary must include every persisted provider outcome.

## Safe customization and tests

Later layers can replace documented exported members or tighten test policy.
A custom sender/credential resolver must preserve references, least privilege and
redacted results. A custom transport cannot loosen tenant, expiry, recipient, TLS
or non-replay guarantees. Do not add callbacks that grant employee permissions.

Test default-disabled configuration, later-layer selection, original sandbox
compatibility, durable-envelope invocation, invalid/missing secrets, sender and
recipient restrictions, TLS downgrade refusal, uncertain outcomes and rotation.
The real loopback exchange verifies the installed library/protocol path only.
Runtime grants, generated database persistence, external provider authentication,
mailbox delivery and business-user walkthroughs remain separate acceptance.

The durable dispatcher composition fixture supplies exact private worker entry
through a WeakSet-backed Logger double. It asserts the provider receives that
admitted detached envelope, rather than the original caller request. This models
the existing non-HTTP private boundary without certifying external APM capture.
Provider acceptance uses injected transports or disposable loopback SMTP only;
test execution never enables live mail or changes deployment qualification.

Detailed setup, examples, operator recovery and evidence interpretation are in
`nodics.communication/modules/commsCore/data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js`.
