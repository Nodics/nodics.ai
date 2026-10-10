# Layered Communication Template Resources

Mandatory framework placement follows
[Module-Owned Email And SMS Presentation](../../../../../nodics.foundation/modules/nSetup/llm/contracts/nodics-principles.md#module-owned-email-and-sms-presentation).
For end-to-end explanation, complete configuration and new notification examples,
read [Email and SMS Templates](../../data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js).
This contract is the implementation authority; the public guide explains adoption.

## Ownership

Communication owns resource resolution, parameter validation and rendering. Domain
modules own neutral default presentation. Profile supplies employee verification,
recovery, application-outcome and reset-confirmation files, not SMTP. Verification
proof generation/expiry/consumption stays with the existing verification owner.
Rendered messages never grant access.

This contract serves maintainers, customer developers and AI contributors. Business
users receive readable branded notifications without changed decisions. Operators
select resources and delivery independently: files do not enable SMTP or onboarding.

## Shape

```text
<module>/src/templates/
  email/<resource-name>/
    template.json
    en/subject.txt
    en/email.html
    en/email.txt
  sms/<resource-name>/
    template.json
    en/message.txt
```

Channel directories are lowercase; OTP is a purpose, not a channel. These are
deployable source resources, not configuration blobs or database imports.
`template.json` is inert JSON containing:

- `formatVersion: 1`, stable `code`, `ownerModule`, positive integer `version`;
- `status: ACTIVE`, `purpose`, `sourceModules`, channel `EMAIL` or `SMS`;
- `defaultLocale` and `parameters`, keyed by simple parameter name;
- optional boolean `requiresSelection`, immutable across presentation overrides;
- parameters declare `type: string`, `required`, `maximumLength`, optional
  `format: https-url`, and optional presentation `default` only when not required.
- Plain string parameters may opt into `presentation: date-time` for readable
  absolute timestamps. This cannot be combined with `format: https-url`.

The first manifest comes from its declared owner. A later manifest is complete,
not a partial configuration merge. It may change version, locale and optional
presentation defaults, but cannot change identity, owner, purpose, channel, sources
or parameter shape. Contract changes need an owner-defined new template identity
and migration, not a branding override.

## Discovery and precedence

`DefaultCommunicationTemplateService` consumes existing NODICS discovered paths
and indexed metadata; it neither discovers packages independently nor activates
services. Low-to-high resource precedence:

1. Explicit `communication.templateResources.modules` entries set to `true` for
   discovered non-active owners, supporting split-runtime resource delivery.
2. Indexed active modules in existing load order, excluding selected runtime
   scopes. Active concrete customer modules participate; application/project roots
   are excluded. Do not introduce a project-root `src/` directory for templates.
3. Selected environment/server-root, server and node resources, deduplicated in
   that order. Runtime resources are deliberately last even when customer modules
   have a later numeric service/config index.

Other discovered inactive modules do not participate. Unknown selected owners fail
closed. Discovery roots must include the owner package; availability does not activate
it. Resource selection never broadens trusted sources, enables providers, provisions
credentials or enables registration/recovery.

Overrides use the same channel/resource-name and can contain one changed file,
without a copied manifest. Each file resolves across layers for the requested
locale, falling back across layers to the manifest default locale. A lower-layer
exact locale outranks a higher-layer default locale. Missing files inherit; invalid,
oversized or unreadable existing files reject. Email requires all three files; SMS
requires text. Duplicate codes at different resource names reject.

commsCore properties bound file bytes, catalogue entries, layers, variables and
rendered bytes. Paths cannot traverse or follow symlinks below discovered roots.
Resources are read per request: no cross-tenant content cache or parallel registry.

## Rendering and customization

Restricted Handlebars `{{parameter}}` expressions escape dynamic HTML and preserve
literal text alternatives. Unknown, missing, non-string and oversized values reject
before persistence. Required values cannot default from presentation. Plain strings
belong in text nodes; dynamic attributes are restricted to quoted `href`/`src` whose
entire value is a declared `https-url` parameter. URLs require HTTPS without credentials.

HTML parsing rejects script/style blocks, embedded documents, forms, event attributes,
unsafe URLs and active inline CSS. Author inline email-compatible CSS and trusted
static markup. This is not a public arbitrary-HTML sanitizer/upload API. Helpers,
blocks, partials, raw expressions, prototype traversal and dynamic includes are not
supported in format version 1. Future syntax requires explicit security review.
Subjects reject CR/LF/NUL; errors omit supplied values.

### Readable timestamps

`DefaultCommunicationTemplateService.presentDateTime` owns opt-in timestamp
presentation. A manifest may add `presentation: date-time` to an existing string
parameter such as `expiresAt`; template files still use `{{expiresAt}}`, without
helpers. The input must be an ISO timestamp with seconds and an explicit `Z` or
numeric timezone offset. Missing/invalid timestamps, unsupported locales, invalid
timezones and oversized results reject before a new intent is persisted. Errors
do not echo the timestamp or configuration values.

The effective sending runtime's layered configuration selects the formatting:

```js
communication: {
  rendering: {
    dateTime: { locale: "en-GB", timeZone: "UTC" }
  }
}
```

Defaults are explicitly `en-GB` and `UTC`, never the process locale/timezone.
For example, `2026-10-02T09:40:17.000Z` displays as
`02 Oct 2026, 09:40:17 UTC`. A later-layer override of `timeZone: "Asia/Dubai"`
displays `02 Oct 2026, 13:40:17 GST` with the default locale. Standard Intl/ICU
controls localized punctuation and timezone names. Locale selection here controls
date formatting only; the existing command locale still selects translated files.
Configure the Communication sending runtime, not only the initiating Profile
runtime. No customer-specific formatter or provider code is needed.

Presentation is deliberately excluded from the immutable parameter security/shape
identity, just like optional branding defaults. Existing full manifest overrides
without this declaration remain valid and retain literal timestamp rendering;
file-only overrides inherit the selected manifest's presentation. Parameter names,
types, requiredness, length bounds and URL constraints stay unchanged. Legacy
configured/published text retains its original literal variables. There is no
new caller-supplied variable and no global formatting of arbitrary date-like text.

Rendering creates a separate escaped/bounded text value. It does not mutate the
command, canonical challenge/intent `expiresAt`, variables hash, idempotency key
or expiry admission. Rendered content remains frozen on the existing intent:
changing locale/timezone/templates affects new intents only, never retry/replay.
Later service layers may override the exported `presentDateTime` member; normal
parameter/output bounds and HTML escaping still apply. No helper execution inside
templates is introduced.

Profile opts in employee registration email, employee password-recovery code
email, canonical contact email and canonical contact SMS expiry parameters.
Recovery completion timestamps and messages without an expiry remain unchanged.
Neither the manifest version increments nor this presentation enable delivery,
contact selection, registration or recovery qualification.

Customize files or optional branding defaults in a compatible full manifest. Do not
copy rendering into customer projects. Service customizations override documented
members through normal merging; internal calls use `this`. Preserve all safeguards.

## Compatibility and durability

New intents select existing explicit configured templates first, resources second,
and the existing published store last. Configured/published legacy text delegates
to the same restricted renderer through `renderLegacy`; it never becomes HTML.
Legacy scalar values are converted to strings; unsafe syntax, reserved parameter
names and oversized inputs reject. New markup belongs in resources.

Optional notice and Engagement bundles declare `requiresSelection: true`. Files
alone never activate them. Select through trusted deployment
`templateResources.selections[code] = true`, or adopt an active published version
whose `resourceCode` equals its template code. Published references require an
explicit parent `sourceModules` allowlist, matching purpose/channel and resource
version. Missing source ownership fails closed; no wildcard legacy authorization.
Reference versions cannot also contain inline subject/body. Runtime validation owns
this exclusive representation contract because schema fields alone cannot express it.

The current core-v001 and optional sample-v001 releases select resources only for
EMAIL/SMS. Historical v001 files are retained unchanged, not active manifest inputs.
The IN_APP notice remains a text definition. Release checksums identify framework
bundles; later-layer presentation overrides are permitted, and every new intent pins
the actual effective bundle hash. Database adoption is an explicit operator gate.
Already queued messages keep their frozen content; no rewrite or resend is implied.

Default presentation owners: commsCore runtime notice (EMAIL/SMS), Profile employee
notifications, contactSubmission contact acknowledgement, customerFeedback feedback
acknowledgement, customerReview review acknowledgement, and testimonial consent
request. Only the domain decides whether/when to request a message.

`commsIntent.templateVersion` retains version. The existing private
`renderedContent.templateIdentity` retains checksum, owner and per-file module/locale/
resource provenance, without filesystem paths or variable values. All representations
are frozen in that private intent before delivery. Retries never re-render. Following
source authorization and command-hash validation, replay returns the existing intent
even if resource files change or disappear; changed commands under one key reject.
Actual sends still enforce recipient policy, expiry, suppression and managed claims.

SMTP receives literal `text` plus optional `html` as MIME alternatives. It never
loads template files or URLs. Its size limit counts both bodies. Existing TLS,
recipient allowlist, disabled defaults and uncertain-send rules remain mandatory.
SMS receives only bounded literal body text, never HTML or resource provenance.
Its durable adapter validates tenant, active claim and expiry before injected sandbox
ports. It remains disabled and not live-qualified; unknown send outcomes are uncertain.
Never put live credentials or real OTPs in previews, tests, logs or documents.

## Verification

Run `test/communicationTemplateResources.test.js`, `test/communicationRuntime.test.js`,
Profile template tests and SMTP provider tests. Cover default/partial/runtime overrides,
locale fallback, missing/malformed/oversized files, injection, source restrictions,
frozen retries and exported-member customization. Deployments additionally prove
actual discovery/effective policy and inspect desktop/mobile previews with fake values.

Browser previews and loopback MIME tests do not certify Outlook/Gmail rendering,
live mailbox delivery, generated database persistence or full employee journeys.
Those remain deployment acceptance gates. Template-management UI and executable
email experiences are outside this resource contract.
