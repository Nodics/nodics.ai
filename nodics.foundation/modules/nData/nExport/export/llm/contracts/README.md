# export AI Contracts

This folder contains module-specific AI/developer contracts for `nodics.foundation/modules/nData/nExport/export`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Generated export media boundary

- `nExport` owns source selection, schema-workbench reads, export-policy
  filtering, rendering, and creation of generated export artifacts.
- Generated export files must be stored through `media` as governed media
  records, normally under the `exportFiles` folder and `exportFile` format.
- Axis and other clients download generated exports through the media
  media-code route, for example `GET /nodics/media/v0/download/{mediaCode}`.
- Do not add export-specific binary streaming, `sendFile`, public static-file
  shortcuts, or a second download controller. Delivery remains media plus the
  shared router file-download response handler.
- Export responses may return safe media identity and summary fields, but must
  not expose provider paths, object keys, buckets, signed URL secrets,
  credentials, or backend-resolved full paths.


## Schema metadata owner

Source pages are evidence, not a best-effort empty-result fallback. Require an array
of records within the requested page bound, an integer total not below accumulated
records, optional exact page coordinates, and a consistent total across pages.
Reject failed/error/negative acknowledgement envelopes before rendering or Media
creation. A valid zero-total response remains an exportable empty selection.
The configured maximum cannot be widened by request-supplied limits. Preserve
safe-query authorization and distinguish preview-only column/page choices from the
full filtered, policy-projected export. The selection-bounds owner regression
protects these contracts without requiring a large live dataset.

`DataExportService.resolveSchemaDescriptor` calls the existing Schema Utility
`getSchema(request, schemaName)` with the normalized target module/schema and
existing export request scope. Missing metadata owner rejects with `ERR_EXP_00001`.
There is no raw-schema, Workbench discovery or old-route fallback. Protected-field
projection and schema authorization remain with the shared owner. Export policy,
record bounds, rendering and media storage remain unchanged; record collection
uses `DefaultSchemaSafeQueryService.searchGenerated`. Customize the existing
export service or schema metadata through normal inheritance, preserving these
boundaries. `dataExportCapabilityBehavior.test.js` proves metadata resolution with
Workbench absent and rejection when the shared owner is missing.

## Export workspace availability

`GET /workspace` is a secured read with `export.run` permission and the separate
`dataExportStatus` exposure category. Generation and history retain `dataExport`,
which is disabled by default. A status read never calls export, source search,
policy evaluation, storage, or delivery, and ignores caller-supplied settings.

The normal success envelope contains `data` with exactly the client-safe contract:
`contractVersion: 1`, `kind: "GOVERNED_EXPORT"`, `availability` of `AVAILABLE`,
`DISABLED`, or `UNAVAILABLE`, and unique `formats` from configured `csv`/`json`.
Non-available results include a bounded `reason`. AVAILABLE requires generation
configuration and HTTP exposure plus the current metadata, safe-query, export
policy and Media upload collaborators. It describes configured command
availability, not production provider qualification or a promise that future I/O
will succeed. Observation failures expose no private exception details.

Clients must scope this read to their current actor, enterprise and exact selected
runtime, reject incompatible metadata and hold generation on loading, denial,
failed refresh or unavailable evidence. Refresh performs GET only. It cannot grant
generation permission, activate the category, replay a command, or supply Media
download rights. `exportWorkspaceAvailability.test.js` protects these boundaries.

Each successful export command receives a unique Media artifact identity independently of its readable filename and content checksum. Identical concurrent exports must not collide on second-resolution display filenames. Artifact storage, download and history remain Media-owned.
