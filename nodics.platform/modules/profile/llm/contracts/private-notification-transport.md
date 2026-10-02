# Private Notification Transport

Profile's existing Enterprise Management owner exports
`invokePrivateCommunication(invocation, policy)` for fixed POST commands to
`commsApi` at `/internal/communications` and `/internal/verification/commands`.
It creates a detached tenant-only request, enters the existing Logger
`runSensitiveOperation`, asserts exact private admission, then invokes the
existing Module Service. Neither a browser privacy flag nor an already admitted
HTTP object is reused as the outbound entry. No generic transport is altered.

Covered actual callers are enterprise invitation/account-ready notifications,
registration email verification (also reused by employee recovery), recovery
completion confirmation, application decision notifications and registration/
recovery verification commands carrying destination, secret or proof.
Contact verification/delivery and Commerce recipient resolution already use
their own detached private boundaries and remain unchanged. Authentication
services do not introduce an additional direct templated-mail transport.

HTTPS is mandatory by default; redirects and automatic retries are disabled.
The corresponding notification, registration mail, recovery mail, review mail
and registration-verification policies each default `allowInsecureLoopback`
to false. A later trusted runtime overlay may explicitly allow exact loopback
HTTP through the existing Module Service policy. This does not approve external
HTTP, senders, templates, business data, credentials or source grants.
Transport errors become a new fixed `ERR_PRFL_00003` without private cause or
provider response; registration/recovery delivery maps this to its existing
safe DELIVERY code. Frozen lifecycle evidence and post-commit independence are
unchanged. No failed delivery grants access or repeats a credential write.

`log.requestPrivacy.qualified` must be true with `captureMode: "disabled"`
before entry is available. Its default remains false. This is an operator
attestation, not proof that external APM, SMTP SDKs, custom transports or agents
never capture. Operators must independently disable/qualify those sinks.
Mail/identity/contact/source-grant/provider qualifications remain gated.
Approved sender credentials, recipient/business inputs and live provider
acceptance are not invented here. No delivery or runtime qualification occurred.

Deferred fixtures: [private outbound transport](../../test/profilePrivateNotificationTransport.test.js),
[lifecycle intents](../../test/enterpriseNotificationContract.test.js),
[registration](../../test/enterpriseRegistrationJourney.test.js) and
[recovery](../../test/employeeRecoveryContract.test.js). These are source-authored,
NOT RUN. Joint acceptance must include lost acknowledgements, frozen retries,
capture suppression before transport, provider failure and post-commit isolation.
