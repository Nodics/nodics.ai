# cms Module

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
