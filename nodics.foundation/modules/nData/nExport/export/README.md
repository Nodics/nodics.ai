# Export Module

**Maturity: Guarded implementation.** It provides the common export boundary,
schema-workbench read path, access-policy hook, file rendering, and media-backed
generated-file storage. It remains fail-closed when disabled or when required
runtime collaborators are not active.

`export` is the executable export engine inside `nData/nExport`. It owns shared export orchestration, export access policy checks, dispatch behavior, and the framework contracts that format modules plug into.

Use this module when changing export lifecycle behavior that applies across CSV, Excel, JSON, JavaScript, or future export formats. Format-specific parsing and rendering belongs in the sibling format modules.

Export definitions should remain source-of-truth driven and tenant-aware. Generated export artifacts must be regenerated from definitions rather than edited by hand.

## Capability

The module currently contributes:

- `DataExportController.export`, which normalizes HTTP body and query data into `request.export`;
- `DataExportFacade.export`, which delegates to the active `DataExportService`;
- `DataExportService.export`, which executes bounded schema exports through
  Schema Workbench and stores generated files through media;
- `DataExportService.applyExportAccessPolicies`, which delegates to `DefaultSchemaReadAccessPolicyService.applyExportPolicies` when that service is active;
- standard router, schema, pipeline, utility, status, enum, lifecycle, and test extension files.

The default implementation is intentionally conservative: it accepts only
configured formats, reads data through the authorized schema workbench, applies
export policy to model copies, and stores generated files as media `exportFiles`
records. It does not accept arbitrary filesystem paths, database names,
credentials, URLs, or custom destination instructions from the caller.

For the full engineering contract, read
Export Process Framework (canonical documentation: `capability.data-exchange.technical-reference`).

## Runtime Flow

1. A caller invokes the export controller through a route, internal service, scheduled process, or test.
2. When an HTTP request is present, the controller copies the request body into `request.export`.
3. HTTP query parameters are preserved under `request.export.query`.
4. The facade delegates to `SERVICE.DataExportService.export`.
5. The service resolves the descriptor through `DefaultSchemaUtilityService.getSchema`.
6. Records are collected through bounded `DefaultSchemaSafeQueryService.searchGenerated` pages using the
   configured maximum export size.
7. Each source page must contain bounded records and a consistent nonnegative total.
   Missing, failed, wrong-page or changing-count evidence stops generation before
   Media creation. An acknowledged zero-count selection may produce an empty file.
   Export access-policy filtering runs against export-safe model copies so
   source models are not mutated in memory.
8. The service renders CSV or JSON and asks media to create a generated media
   object under the configured export folder.
9. The response returns file name, media summary, exported count, available
   count, and truncation status.
10. When a user or integration downloads that generated file, the caller uses
    the generic media media-code download contract. Export does not implement a
    second file-delivery path.
11. media resolves the provider, file path, MIME type, access policy, and
    content-disposition metadata. nRouter streams the file through the existing
    `fileDownloadResponseHandler`.

## Generated Export Downloads

Before offering generation, clients may read `GET /nodics/export/v0/workspace`.
This secured observation requires the same `export.run` permission as generation,
but uses the separate, enabled-by-default `dataExportStatus` route category.
The generation category `dataExport` remains disabled by default; a deployment
must opt in intentionally. The observation returns version 1 `GOVERNED_EXPORT`
availability and supported configured CSV/JSON formats. It reads no records,
invokes no policy or storage operation, and grants no Media download access.
See the [availability contract](llm/contracts/README.md#export-workspace-availability).

Generated export files are media records. Export owns the source read,
transformation, rendering, and target-write lifecycle that creates those media
records. It does not own delivery after the media record exists.

Axis and other clients download generated files through the generic media
download route:

```http
GET /nodics/media/v0/download/{mediaCode}
Authorization: Bearer <employee-token>
```

This route is governed by media permissions and delivery policy, such as
`media.content.download`. Granting `export.run` allows export generation; it
does not automatically grant broad media download rights. Do not add export
download routes, export binary streaming, or export-specific file-response
handlers. Use media delivery and the framework `fileDownloadResponseHandler`.

## Extension Path

Projects or provider modules may override or extend the export service through
later active modules. A real implementation should:

- validate the selected schema, format, query, and export policy;
- verify tenant context, access group, and permission requirements;
- resolve source data through governed services or schemas;
- call `applyExportAccessPolicies` before data is serialized;
- delegate format rendering to CSV, Excel, JSON, JavaScript, or custom format services;
- write only through governed media/storage provider aliases;
- return a traceable result with status, counts, destination metadata, and diagnostics.

Keep delivery-provider details in their own services. Keep format rendering in format modules. Keep request normalization and cross-format policy in this module.

## Tests

Focused behavior is covered by `test/dataExportCapabilityBehavior.test.js`, which verifies HTTP request normalization, the default fail-closed service behavior, access-policy delegation, export-safe model copy handling, and the rule that generated file downloads remain owned by media.

`test/exportSelectionBounds.test.js` additionally verifies inherited record limits,
multi-page truncation, original query/actor preservation, confirmed empty results,
and refusal of malformed or changed source evidence. Preview pagination and visible
table columns do not narrow the generated export; filters and sort select records,
and the owning schema/export policy selects permitted fields.

Run:

```bash
node nodics.foundation/modules/nData/nExport/export/test/dataExportCapabilityBehavior.test.js
npm run test:export
npm run quality:docs
```

Project implementations should add tests for successful export, access-policy filtering, tenant isolation, destination validation, retry behavior, and sanitized failure reporting.

## What To Avoid

Avoid:

- enabling a public export route before access control and schema/property export policy are proven;
- accepting arbitrary request-supplied URLs, credentials, or filesystem paths;
- putting CSV, Excel, JSON, or JavaScript rendering logic in the shared engine;
- bypassing the facade/service override path;
- returning raw internal errors or credentials in export diagnostics.

## Continue

- Export family and completion gate: [nExport](../README.md)
- Public data guide: [How To Work With Data](https://github.com/Nodics/nodics.docs)
- Data access policy: [database](../../../nDatabase/database/README.md)
- Maturity matrix: [Provider And Capability Maturity Matrix](https://github.com/Nodics/nodics.docs)


Metadata lookup does not depend on Workbench discovery. Missing Schema Utility
fails with `ERR_EXP_00001`; it never falls back to raw schemas or removed routes.
Bounded record collection uses the same safe-query owner as generated APIs.
See [the metadata contract](llm/contracts/README.md#schema-metadata-owner).

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Each successful export command receives a unique Media artifact identity independently of its readable filename and content checksum. Identical concurrent exports must not collide on second-resolution display filenames. Artifact storage, download and history remain Media-owned.
Export history is scoped to the signed enterprise. It pages Media by creation
time and supports a read of one exact Media identity for artifact continuation.
