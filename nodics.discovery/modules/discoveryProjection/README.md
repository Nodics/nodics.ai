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

## Verification

Run the focused contract test from the repository root after changes:

```bash
node nodics.discovery/modules/discoveryProjection/test/discoveryProjectionContract.test.js
```
