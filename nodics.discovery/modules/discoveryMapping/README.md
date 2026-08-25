# discoveryMapping

`discoveryMapping` owns the provider-neutral mapping rules that turn a domain
record into a Discovery document. It describes field mappings, analyzer intent,
display fields, and sensitive-field handling without owning the domain record
itself.

## Ownership

- Owns generic mapping policy for Discovery documents.
- Does not own product, content, profile, order, or other domain source data.
- Keeps customer-sensitive fields explicit so source providers cannot
  accidentally index private data.

## Extension

Domain modules contribute their own source-provider mappings through the
supported Discovery contracts. Keep reusable mapping behavior here and put
entity-specific eligibility or transformation decisions in the owning domain.

## Verification

Run the focused contract test from the repository root after changes:

```bash
node nodics.discovery/modules/discoveryMapping/test/discoveryMappingContract.test.js
```
