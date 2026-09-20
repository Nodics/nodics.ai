# media Contracts

This folder keeps AI/developer contract reminders for the Media module. Public, business, operator, and full implementation documentation belongs in `nodics.docs`.

## Contract Boundary

`POST /photos/encoded` supports bounded customer-authenticated JSON intake for
domain orchestration that validates an image before persistence. It accepts
only image bytes, MIME type, original filename and an idempotency key. Media
selects the owner, folder, storage key and generated identity. Replay is scoped
to the resolved customer and checks the original content checksum. The route
uses an explicit bounded JSON limit; storage still goes through the existing
customer upload and provider services. No domain analysis or approval is owned
by Media, and a failed domain analysis must not call this endpoint.

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

Internal evidence reads accept customer originals after domain authorization.
They may also read non-customer PUBLIC media with an allowed
`media.evidenceRead.publicPreviewMimeTypes` MIME type, returning bounded inline
bytes and `previewType: PUBLIC_MEDIA`. This does not grant customer-photo routes
access to application/private assets. Storage keys stay internal; callers
render public SVG only as an image, never injected markup.

Customer photo operations preserve the authenticated customer bearer header when
resolving the canonical owner through Profile. Missing credentials or a tenant
mismatch are rejected; request-body credentials are never trusted. Runtime
service credentials must not substitute for the customer session in this lookup.
