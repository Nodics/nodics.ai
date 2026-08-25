# discoveryQuery

`discoveryQuery` owns provider-neutral query preparation for configured
Discovery profiles. It turns safe business search intent into a reusable query
contract before execution is delegated to the runtime/search layer.

## Ownership

- Owns generic query profile preparation and request normalization.
- Does not own customer-facing API DTOs, domain response projection, or
  low-level search-engine clients.
- Keeps query configuration reusable across Commerce, content, and future
  domains.

## Extension

Add new query behavior through profile configuration and owning domain APIs.
Do not bind this module to one storefront, catalogue, language, or provider
shape.

## Verification

Run the focused contract test from the repository root after changes:

```bash
node nodics.discovery/modules/discoveryQuery/test/discoveryQueryContract.test.js
```
