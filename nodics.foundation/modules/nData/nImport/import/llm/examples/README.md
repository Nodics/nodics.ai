# import AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nData/nImport/import` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## Axis file import example

The Back Office file import journey is a composition of two backend
capabilities.

First, upload through media:

```text
POST /nodics/media/v0/storage/upload
Content-Type: multipart/form-data

file=<supplier-products.xlsx>
folderCode=importSources
formatCode=importFile
name=Supplier products July upload
```

Then start import with a media reference:

```json
{
  "mediaCode": "supplier-products-july",
  "definitionCode": "supplierProductImport",
  "options": {
    "validateOnly": true
  },
  "importFinalizeData": true
}
```

Install or update uses the same route without validation-only mode:

```text
POST /nodics/import/v0/media
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "mediaCode": "supplier-products-july",
  "definitionCode": "supplierProductImport",
  "importFinalizeData": true
}
```

Do not design the route like this for a browser-facing workflow:

```json
{
  "inputPath": {
    "rootPath": "/tmp/browser-uploaded-file"
  }
}
```

`inputPath.rootPath` remains a backend-local/trusted operational contract.
Axis should never become the authority for that path.

A deployment profile selects `template: "foundation"` and supplies its own label, description, completion message and explicit enabled state. An optional complete steps array replaces template mechanics. Missing templates and wrong destination roles fail before execution.

## Minimal project content pack

A project declares `data.contentPacks.packs.projectGuide = { source: { manifestSection: 'guide' } }`. Its existing `package.json` supplies identity, `data/manifest.json` identifies the selected section, and that section's `contentPath` points to the release folder. The runtime separately enables content-pack imports.

To change wording, add only `presentation: { title: 'Partner guide' }`; the remaining messages/actions inherit. To change all selected packs, override `data.contentPacks.defaults.presentation.retryAction` in a later layer. An individual pack may override that field again. A nonstandard layout can explicitly set `source.manifestPath` and `source.contentPath`. Such overrides remain subject to containment and manifest validation.

Sample releases are available to authorized manual operators by default, with optional deployment restriction. Only Init can auto-run at startup. Environment scope reads the canonical `environment.class`; never derive it from the selected environment name or another capability policy. Permissions, roles, tenant isolation, release checksums and durable receipts remain mandatory.
