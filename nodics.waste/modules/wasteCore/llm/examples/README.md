# wasteCore Examples

Examples should show common source references and lifecycle policies reused by
Waste child modules.

## Read-Only Installed Inspection

An authorized tenant maintainer sends an access token to
`POST /nodics/wasteApi/v0/waste/installed-data/inspect` with:

```json
{ "resource": "wasteAssetCreationPolicy", "page": 1 }
```

Review the returned installed records against the provenance-qualified historical
baseline **and customer overlays**, then follow `nextPage` until null. To inspect
transactions without exposing payloads, use `resource: "wasteSubmission"` (also
assets, ownership events, impact results and selections as required). Preserve
all page hashes and reissue each request with its `expectedPageChecksum` before
any separately authorized import. A policy or page conflict means stop and
requalify, not overwrite. Missing permission is not permission to grant yourself
access. A later layer may set `waste.installedDataInspection.pageSize: 25` and
disable an unnecessary resource with `false`; unsupported resources reject.

See the [migration prerequisites](../contracts/README.md#migration-prerequisites)
for exact receipt/source qualification, concurrency limits and post-import checks.

Acceptance consumers read the selected environment through nTooling, then use
`projectRuntime(profile, { role: "WCMS_STAGED" })` (or the capability's own role).
Override an ambiguous role with an explicit server selection; reuse its port and
launch descriptor rather than repeating either in environment acceptance metadata.
