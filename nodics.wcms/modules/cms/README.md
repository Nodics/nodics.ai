# cms Module

Generic authoring follows effective schema publication metadata and the existing
runtime role: publishable sources are Staged-only; publication projections and
receipts are read-only to Workbench/generated HTTP CRUD. Owning publication and
approved import services retain their governed paths. Project customization and
failure cases are documented in
`nodics.foundation/modules/nDatabase/database/llm/contracts/schema-authoring-authority.md`
and the canonical Foundation schema-data-modeling guide.

CMS owns content sites, catalogs, routes, pages, templates, slots, components, renderer metadata, localized content, and resolved delivery behavior.

## Responsibility

This module provides the WCMS content model used by Axis authoring, staged publication, Online delivery, Nexus rendering, and documentation-as-content use cases.

## Developer Notes

- Model content through CMS records and content packs.
- Keep page designer metadata backend-owned and renderable by Axis.
- Use media references instead of embedding physical storage paths.
- Preserve publication, localization, route resolution, and renderer mapping contracts.

## Documentation

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.wcms/overview.md`
- `nodics.docs/docs/pages/nodics.wcms/publishing-lifecycle.md`
- `nodics.docs/docs/pages/nodics.wcms/media-management.md`

## Verification

Run CMS/WCMS contract tests when content model behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

CMS owns generic guided-publication acceptance defaults: select the WCMS_STAGED
runtime and an enabled initialization profile using the framework `foundation`
template. Application publication selections, Site identities and delivery probes
belong to their accelerator or customer pack. Defaults never install or publish data.
