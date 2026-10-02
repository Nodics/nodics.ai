# discoveryProjection

`discoveryProjection` owns the normalized Discovery document shape used before
records are handed to a search engine. It keeps projection validation generic
so Commerce, WCMS, Profile, and later domains can publish searchable documents
without copying search-specific logic.

## Ownership

- Owns generic projection structure and validation helpers.
- Does not own source records, storefront DTOs, or search-engine provider
  clients.
- Keeps projection contracts tenant-safe and reusable across domains.

## Extension

Add domain-specific source fields in the owning source/provider module, then
map them into the generic projection contract. Do not hardcode one domain's
shape into this module.

Physical provider indexes may be customized through nSearch's layered index
definitions while retaining the logical `typeName`. Projection services resolve
that logical identity rather than treating the physical index as a registry key.
See the [binding contract](llm/contracts/README.md) and
`test/customPhysicalIndexBinding.test.js` for customization and failure coverage.

## Verification

Run the focused contract test from the repository root after changes:

```bash
node nodics.discovery/modules/discoveryProjection/test/discoveryProjectionContract.test.js
```

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
