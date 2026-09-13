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

`DataExportService.resolveSchemaDescriptor` calls the existing Schema Utility
`getSchema(request, schemaName)` with the normalized target module/schema and
existing export request scope. Missing metadata owner rejects with `ERR_EXP_00001`.
There is no raw-schema, Workbench discovery or old-route fallback. Protected-field
projection and schema authorization remain with the shared owner. Export policy,
record bounds, rendering and media storage remain unchanged; record collection
still uses the current bounded Workbench search operation. Customize the existing
export service or schema metadata through normal inheritance, preserving these
boundaries. `dataExportCapabilityBehavior.test.js` proves metadata resolution with
Workbench absent and rejection when the shared owner is missing.
