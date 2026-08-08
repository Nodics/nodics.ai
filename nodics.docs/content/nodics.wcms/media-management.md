# Media management

Media is the Nodics capability for governed files and assets. It lives inside
`nodics.wcms` because content experiences need images, documents, imports,
exports, and downloadable files, but the binary lifecycle must remain a backend
contract rather than a browser convention.

## Problem it solves

Without a media module, each application starts inventing its own file paths,
folder rules, validation, and download behavior. That quickly becomes risky:
frontends may leak storage locations, imports may accept unsafe files, and
business modules may duplicate asset records. Media creates one governed place
for upload policy, metadata, storage-provider resolution, source context, and
delivery safety.

## Core concepts

- Media record: metadata for a governed file or external asset.
- Folder policy: which purpose, path prefix, file types, size limits, access
  mode, and retention rules apply.
- Format policy: original, preview, responsive, import, export, document, or
  custom format vocabulary.
- Storage provider: the backend implementation that stores bytes locally, on
  NAS, S3, Azure Blob, GCP Storage, CDN-backed storage, or a custom provider.
- Source context: a safe backend projection that tells Axis which upload and
  selection choices are valid for data imports, content media, product media,
  utility media, and generated exports.

## Frontend boundary

Axis may display upload controls, folder choices, media records, and selection
dialogs. It must not decide absolute paths, bucket names, storage keys,
credentials, signed URLs, retention behavior, or provider details. Axis sends
the intended source context and allowed business target; Media resolves the
effective upload policy and storage behavior.

This is especially important for partners. A customer can remap storage from
local development folders to cloud storage without changing Axis renderers or
business modules.

## Upload and delivery lifecycle

The typical lifecycle is:

1. A user or module selects a source context, such as `contentMedia` or
   `dataImports`.
2. Media resolves the effective folder and format policy from layered Nodics
   configuration.
3. The upload validates extension, MIME type, size, access mode, and target
   schema expectations.
4. The provider writes bytes and returns safe provider-relative metadata.
5. Media persists the record, checksum, lifecycle state, and reference data.
6. Other modules reference the media record instead of storing file paths.
7. Delivery routes enforce authorization and expose only safe access details.

## Business value

Media lets business teams reuse assets across CMS, documentation, imports,
exports, product experiences, and future websites without losing governance.
It also keeps operating cost flexible: local storage can support a developer
machine, while production can move to cloud or CDN-backed storage under the
same module contract.

## DevOps considerations

Production storage should be explicit. Define provider roots, backup,
retention, size limits, virus scanning or approval workflows where required,
download authorization, cache headers, and lifecycle cleanup. Never rely on a
repository folder as production storage. Development defaults may write under
server temp paths, but those paths are disposable and environment-specific.

## Customization model

Customer projects may add or override media folder and format policy through
later module configuration. If behavior needs more than configuration, replace
the media storage policy or provider service in a later active module while
preserving the same safe API contract. Do not fork Axis to change storage
rules.
