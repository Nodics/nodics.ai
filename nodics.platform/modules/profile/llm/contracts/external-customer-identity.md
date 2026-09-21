# External customer identity

Profile owns `externalIdentityLink`, signed provider proof, link/unlink and session exchange. Application configuration selects provider, permitted enterprise and logical credential reference. Runtime configuration resolves the credential value; authored source properties must not carry live provider secrets. Telegram launch validation rejects duplicate fields, invalid signatures, future/expired launches and malformed numeric subjects. Username is display information. An existing account must authenticate before linking; successful registration supplies the canonical customer for a new link. Email alone never authorizes linking.

Links are unique by provider/application/subject within the configured tenant. Conflicts fail closed. Exchange checks current customer activation, lock and authentication version before issuing the existing access/refresh session. Unlink revokes the binding; it does not duplicate or remove the customer. Customer browser refresh uses its own httpOnly cookie namespace; employee sessions remain separate. Full name registration accepts mononyms through Profile's name mapping.

The service-auth destination resolver returns an active eligible customer's numeric external subject and an allowlisted credential reference. Only Communication service permission permits resolution; body recipients cannot bypass customer/link checks. Never expose provider credentials, raw launch proof, refresh tokens or unrestricted link listings.

Validation: `test/profileExternalIdentity.test.js` covers proof, conflicts, disabled/locked/revoked customers, auth versions and destination isolation.

Authenticated link, unlink, origin and service-destination routes must declare `controller`, never the special-route `handler` field. The router dispatches special handlers before bearer authentication; `secured: true` alone does not enter the secured pipeline. Preserve access-token/customer group gates and the destination service-token/Communication permission gate. Public launch and browser bootstrap retain their explicit proof/cookie validation.


## Shared channel authentication

Web and embedded channels use the same customer email/password authentication
and name/email/password registration contract. An unlinked channel must present
the shared form and prove the customer account before calling the existing
secured link operation. There is no separate email-discovery or email-OTP route
for this journey. A previously verified link still supports seamless reopening
through signed provider proof. WhatsApp remains a future adapter of this shared
flow and is not implemented by the Telegram integration.

## Application-orchestrated browser entry

The application/domain chooses when to request seamless linked-channel sign-in,
when to display the shared account form, and what journey to resume. Profile has
no dependency on any accelerator, customer project or channel UI.

`POST /internal/external-identity/browser-handoff` requires a service token,
`serviceAccountUserGroup` and `profile.externalIdentity.prepare`. It validates
origin and provider proof, resolves an eligible current link, and either reports
`requiresProfileSession: true` or returns an opaque one-use handoff code. The
service principal must match the resolved enterprise and runtime tenant.

`POST /customer/browser/external/complete` takes that code plus fresh provider
proof. Profile atomically consumes the existing auth-cache entry, checks expiry,
origin, enterprise, application, link revision, principal and auth version, and
revalidates account eligibility before issuing its normal browser session.
Only this Profile browser response sets the existing HttpOnly refresh cookie;
access credentials remain in client memory. Preparation returns no credentials,
raw identity records or unvalidated redirect. The grant stores binding metadata,
not provider proof or refresh tokens. Invalid/replayed grants fail closed; cache
loss or an interrupted completion requires a new application entry.

`profileExternalIdentity.browserHandoffLifetimeSeconds` defaults to 60 and accepts
10–300 seconds. An application can set `requireBrowserHandoff: true` to prevent
its direct browser exchange endpoint from bypassing application orchestration.
Other applications retain the existing generic direct exchange by default.
Controllers never accept a caller-supplied expected link binding; the handoff
service supplies that internal constraint to the final session issuer.

Validation: `profileExternalBrowserHandoff.test.js` covers service and tenant
isolation, proof, expiry, replay/concurrency, account/link changes, origin binding,
HttpOnly cookie ownership and later-layer lifetime customization. Provider proof
and canonical identity tests remain in `profileExternalIdentity.test.js`.


## Established channel sessions

The provider assertion freshness window applies to launch, linking and session
issuance. It is not the lifetime of an already authenticated customer journey.
After verified external sign-in, Profile passes only `externalIdentityLinkCode`
to nAuth's bounded customer access-token payload and its existing refresh record.
Ordinary password authentication and caller body fields cannot create this claim.

For source origin, Profile resolves the claim through the existing link service
and rechecks active application/provider, enterprise/tenant, customer, account
lock and security stamp. The requested application must match the stored link.
A revoked link or disabled account fails closed. Normal refresh rotates the
existing credential, revalidates the binding and carries the same claim forward.
No new session store, raw provider subject or launch proof is placed in the JWT.
Unbound legacy sessions still require fresh proof for origin resolution.

After first-time account linking, the channel frontend completes the existing
Profile handoff again to receive its channel-bound session. All cookie issuance
remains with Profile. A changed account in that response must not silently switch
the authenticated customer. Current Mini Apps opened before this change must be
closed and reopened once to receive the new binding; saved domain records remain.

Acceptance includes origin resolution with a 15-minute-old launch after fresh
session issuance, rejection of that same proof for new sign-in/linking, scoped
link/account/application revocation, refresh preservation and caller injection
denial. See `profileExternalIdentity.test.js` and
`profileExternalSessionBinding.test.js`. Later providers reuse this binding and
must not extend the launch freshness window to solve journey continuation.

For a deployment serving both an approved HTTPS origin and local HTTP development,
keep browser-session `secure: true` and opt into `allowInsecureLoopback: true` in
the appropriate customer or employee session configuration. Only exact HTTP
localhost, IPv4 loopback and IPv6 loopback requests receive non-Secure cookies;
HTTPS retains Secure. This is resolved per request without changing shared
configuration. Exact credentialed CORS, CSRF, proof freshness and refresh rotation
remain required. Non-loopback HTTP and SameSite=None with non-Secure cookies fail.
