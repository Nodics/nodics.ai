# export AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nData/nExport/export` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.


For an authorized export, resolve the effective descriptor through
`DefaultSchemaUtilityService.getSchema` for the normalized target module/schema.
A later schema extension is reflected by that shared owner without a copied
export field registry. Keep caller tenant/auth context, bounded record reads,
export policy and media artifact storage. Removing the metadata owner must reject
before export rendering; do not call retired discovery adapters as a fallback.
