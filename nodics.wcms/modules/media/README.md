# Media Management

Media owns governed asset records, folders, formats, storage providers, upload, download, delivery, publication transfer, references, and media sets.

## Responsibility

This module manages media metadata and storage policy. Product, CMS, engagement, and import/export modules own their domain relationship to a media code.

## Developer Notes

- Store physical artifacts through provider contracts and generated storage keys.
- Keep folder, format, source context, delivery policy, and access decisions explicit.
- Do not expose local storage roots or private provider paths through public documentation or APIs.
- Use project-layer provider configuration for local, NAS, S3, Azure, or Google Cloud style deployments.

## Documentation

Deep documentation lives in:

- `nodics.docs/docs/pages/nodics.wcms/media-management.md`
- `nodics.docs/docs/pages/nodics.wcms/publishing-lifecycle.md`
- `nodics.docs/docs/pages/nodics.foundation/data-import-export-migration.md`

## Verification

Run media lifecycle, transfer, delivery, reference, and provider tests when behavior changes, then run:

```bash
npm --prefix nodics.docs test
npm run quality:docs
```
