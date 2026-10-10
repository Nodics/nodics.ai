# commsCore

Communication orchestration and delivery governance. This module follows the active `nodics.communication` ownership contract. Read `AGENTS.md` and `llm/contracts/README.md`; verify through focused tests and the effective server build.

Module-owned HTML/text templates live under `src/templates/<channel>/<name>`.
Communication resolves framework defaults, customer overrides and runtime overrides
without activating resource owners. Read the [resource contract](llm/contracts/template-resources.md)
for manifests, parameters, locale fallback, safe HTML and pinned retry identity.
Legacy configured/published text remains compatible; new HTML belongs in resources.

Readable expiry text is opt-in through parameter `presentation: date-time`.
Layer `communication.rendering.dateTime.locale` and `.timeZone` on the sending
runtime (defaults `en-GB` and `UTC`). Canonical timestamps and frozen retry content
remain unchanged; full legacy manifest overrides keep literal values. See the
[timestamp contract](llm/contracts/template-resources.md#readable-timestamps).

For complete inventory, configuration, branding, locale overrides and new email/SMS
examples, use [the authoring guide](data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js).
New plain-text email/SMS copy also belongs in resources, not configuration.

The reusable Telegram delivery form is Communication-owned and projected for
the `ENGAGEMENT` runtime role. Applications contribute only their selected
credential reference/path binding; schema availability never enables sending.
See [delivery configuration authoring](llm/contracts/README.md#telegram-delivery-configuration-authoring)
for runtime targeting, customization, prerequisites and safe setup.
