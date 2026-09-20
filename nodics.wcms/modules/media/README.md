# Media Management

Media owns governed asset records, folders, formats, storage providers, upload, download, delivery, publication transfer, references, and media sets.

## Responsibility

This module manages media metadata and storage policy. Product, CMS, engagement, and import/export modules own their domain relationship to a media code.

## Developer Notes

- Store physical artifacts through provider contracts and generated storage keys.
- Keep folder, format, source context, delivery policy, and access decisions explicit.
- Do not expose local storage roots or private provider paths through public documentation or APIs.
- Use project-layer provider configuration for local, NAS, S3, Azure, or Google Cloud style deployments.
- Customer photo orchestration may use bounded encoded intake after its own
  analysis succeeds. Media retains upload policy, original filename, private
  storage, owner identity and checksum-checked idempotent replay.

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

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Customer photo operations preserve the authenticated customer bearer header when
resolving the canonical owner through Profile. Missing credentials or a tenant
mismatch are rejected; request-body credentials are never trusted. Runtime
service credentials must not substitute for the customer session in this lookup.
