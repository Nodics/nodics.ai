# profile AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.platform/modules/profile` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

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
