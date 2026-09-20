# profile AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.platform/modules/profile` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

When adding an enterprise business field in a project schema, retain Profile's
setup command and its principal-bound retry key. The effective Schema Utility
descriptor controls whether the field may be submitted and returned. Verify the
project field is retained, a managed tenant field is rejected, missing metadata
cannot create an enterprise, and interrupted activation retries without another
save. `test/enterpriseWorkbenchSetupContract.test.js` exercises these boundaries
with the Workbench service absent. Do not copy the descriptor builder into Profile.

For application-orchestrated sign-in, request the service-authenticated external
browser handoff with configured application/proof and the original allowed
browser origin. Return its opaque code to the browser, which completes it on
Profile's `/customer/browser/external/complete` route. Configure a 30-second
handoff lifetime in a later layer to shorten exposure; do not bypass atomic
consumption or link/account revalidation. The handoff contract test demonstrates
this override and replay rejection. Account-form adapters pass only email, name
and password to `/customer/registrations`; the form contract test demonstrates
Profile limit and identity-member customization.

For a long-lived channel journey, complete a fresh handoff once and call origin resolution with the resulting customer bearer token. A later expired launch must not prevent origin resolution for that bound session. Revoke its link and verify that both origin and refresh fail. Password sign-in followed by linking must finish another handoff before entering the journey.

`profileInitialization.requiredEmployeeLogins` owns initializer identity checks,
with admin/apiAdmin defaults matching Profile Init data. Runtime API-key login
metadata does not select the initializer employee. Custom identities require
matching governed Init data; partial checks never reset existing credentials.

Profile refresh sessions use the Profile-owned `auth` cache channel. Its module
configuration references nAuth's strict channel defaults through nConfig; do not
copy those defaults into a customer environment or redirect identity ownership.
The deployment must still enable the distributed provider. Later Profile channel
overrides use normal layering, preserving atomic consume and no local fallback.

Browser sessions resolve credentialed origins through nRouter's existing
`resolveCorsOrigins` service. Endpoint-derived origins and explicit origin lists
share one policy; explicit denials and endpoint disables take precedence.
Profile continues to enforce cookie security, CSRF and refresh rotation.

During a governed Local reset, the provider's private authority may reach scope
cleanup after Employee deletion. Profile must prove principal absence through an
authoritative read and await nAuth shared-stamp revocation. It must reject failed
reads or revocation, and a request field cannot forge reset authority. Existing
principals and ordinary scope mutations still require exactly one acknowledged
Employee update. This rule is independent of reset inventory ordering.

For a deployment serving both an approved HTTPS origin and local HTTP development,
keep browser-session `secure: true` and opt into `allowInsecureLoopback: true` in
the appropriate customer or employee session configuration. Only exact HTTP
localhost, IPv4 loopback and IPv6 loopback requests receive non-Secure cookies;
HTTPS retains Secure. This is resolved per request without changing shared
configuration. Exact credentialed CORS, CSRF, proof freshness and refresh rotation
remain required. Non-loopback HTTP and SameSite=None with non-Secure cookies fail.
