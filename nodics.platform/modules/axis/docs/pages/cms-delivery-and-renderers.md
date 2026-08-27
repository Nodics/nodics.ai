# CMS Delivery and Renderer Integration

Axis renders CMS-managed Back Office pages without moving backend authority or
business logic into the browser.

| Reader need | What CMS controls | What Axis controls | What remains backend-owned |
| --- | --- | --- | --- |
| Business page structure | Site, route, page, template, component tree, labels, and safe content | Responsive rendering, focus behavior, empty states, and visual consistency | Publication workflow, approval, access mode, locale, channel, and lifecycle |
| Developer extension | Logical renderer keys and typed component properties | Compiled React renderer, registry mapping, parser, tests, and fallbacks | API destinations, schema contracts, validation rules, and permissions |
| Operator safety | Published content version and route availability | Bounded loading, cache isolation, retry, and safe failure presentation | Staged-to-Online activation, rollback, authentication, and audit evidence |
| Beginner understanding | Navigation and article content that explain the journey | A predictable browser surface that does not execute CMS code | Business decisions, data writes, and process state transitions |

## Runtime boundary

CMS owns routes, pages, templates, components, component properties, and the
logical renderer metadata attached to each page or component type. Axis owns
the executable React renderers. CMS never returns JavaScript, module paths, or
arbitrary renderer URLs.

Axis obtains the CMS endpoint from the approved runtime bootstrap flow. The CMS
client accepts that discovered endpoint as an input; it does not invent a
fallback URL or proxy CMS through the Axis server.

## Delivery validation

Before rendering, Axis validates the complete resolved-page response:

- delivery contract version;
- site, path, locale, and channel;
- page, template, and component renderer keys;
- renderer major versions and supported channels;
- required component properties;
- component graph depth and total component count.

Unknown renderer keys, unsupported versions or channels, malformed data, and
oversized graphs fail closed. A component rendering failure is isolated and
replaced with a safe error message. Deprecated renderer metadata is retained
for migration tooling; it does not allow CMS to select untrusted executable
code.

## Request and cache safety

The delivery client:

- sends bearer tokens only in the `Authorization` header;
- never places tokens in URLs, storage, or cache keys;
- omits browser credentials and rejects redirects;
- supports cancellation, timeouts, `ETag`, and `304 Not Modified`;
- separates cache keys by enterprise, tenant, site, path, locale, channel,
  access mode, principal, and authenticated session generation.

Authenticated cache keys require principal and session identity. This prevents
one employee or tenant from reusing another user's resolved page.

## Customize and extend safely

Create one project-owned renderer file in the relevant capability directory,
register its backend-issued logical key and supported contract version in the
typed renderer manifest, and add mirrored tests. Customize labels, help text,
layout options, and safe fragments through CMS component properties; keep API
destinations, authorization, validation, and business decisions in their
owning backend modules.

Never execute CMS HTML or JavaScript, accept arbitrary component imports, add a
fallback renderer for unknown keys, or duplicate CMS route resolution in Axis.
Verify valid, unknown, deprecated, incompatible, malformed, oversized,
unauthorized, cached-session, responsive, and renderer-isolation behavior.
Rollback removes the later project registration and restores the prior CMS
component version without editing the reusable renderer framework.

## Renderer development

Add a renderer only to the trusted Axis renderer manifest and implement it in
Axis source. Keep the renderer declarative: component properties may influence
content and presentation, but must not introduce API destinations, executable
scripts, authorization rules, or backend business decisions.

When a component can be reused across pages, promote it to a shared component
contract instead of creating a second page-local renderer. Schema Query
Builder is the reference pattern: the content catalog can place or configure a
query-builder component, and Axis can render it through a shared renderer or
shared primitive, but the owning backend module still supplies searchable
fields, allowed operators, sort rules, limits, and execution contracts. This
same reuse rule applies to future media pickers, relationship selectors,
record browsers, workflow selectors, and any other repeated business-control
surface.

Run the focused checks while changing this boundary:

```bash
npm run typecheck
npm test -- --run test/cms
```

Run `npm run verify` before handing off or committing the completed slice.

`/login` and `/forgot-password` are resolved from public CMS delivery. The
login renderer sends employee credentials only to Profile. After Profile issues
the human bearer token, Axis validates access through secured BackOffice
bootstrap before loading the authenticated CMS dashboard. Tokens remain in
memory and are cleared locally before logout revocation is sent to Profile.

The forgot-password page is presentation-ready, but submission remains disabled
until Profile owns an approved employee-recovery API. Axis does not simulate
recovery or create a second identity workflow.

For example, a CMS page may declare logical renderer
`axis.component.media-management-workspace`. Axis can map that key to a
compiled React renderer after validation. The CMS record cannot send JavaScript
that Axis executes, and the renderer still calls nMedia or WCMS contracts for
authoritative data.

## Common mistakes

- Putting page, component, catalog, route, or documentation import data in the
  frontend repository. Axis renders CMS contracts; backend modules or customer
  projects own importable content.
- Using CMS content as executable code. CMS can describe layout, copy,
  component properties, logical renderer keys, and safe links, but it must not
  ship scripts that Axis executes.
- Rendering an unknown logical component as a best-effort widget. Unknown or
  unauthorized renderers must fail safely with useful recovery information.
- Assuming public CMS delivery means authenticated BackOffice data is public.
  Login pages can be public; protected workspace content still requires
  Profile and BackOffice authorization.
- Creating one-off page components when an existing renderer contract can be
  extended with backend-owned properties.

## Verification

CMS delivery is verified when Axis can load public login pages, authenticate
through Profile, bootstrap secured navigation, render authorized CMS routes,
reject unknown renderers, reject unsafe links or executable content, survive
missing CMS data through recovery mode, and pass type, component,
accessibility, responsive, and production-build checks.
