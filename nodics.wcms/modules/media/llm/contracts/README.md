# media Contracts

This folder keeps AI/developer contract reminders for the Media module. Public, business, operator, and full implementation documentation belongs in `nodics.docs`.

## Contract Boundary

Media owns asset metadata, source context, provider configuration, storage root resolution, generated storage keys, delivery access policy, publication transfer, reference lookup, and media-set contracts.

## AI Guidance

- Treat media codes as governed references, not physical file paths.
- Keep provider secrets, root paths, and private storage keys out of generated documentation.
- Preserve source context so imports, WCMS components, product galleries, and exports can explain why a media record exists.
- Do not let consuming modules mutate media relationships they do not own.

## Documentation

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.wcms/media-management.md`
- `nodics.docs/docs/pages/nodics.foundation/data-import-export-migration.md`
- `nodics.docs/docs/pages/reference/source-map-glossary.md`

## Verification

Run media contract tests and documentation validation after changing this contract:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```
