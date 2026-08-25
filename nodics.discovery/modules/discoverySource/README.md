# discoverySource

`discoverySource` owns the generic source-provider registry and eligibility
contract for Discovery. It defines how a module can advertise searchable source
records without making Discovery own those records.

## Ownership

- Owns provider registration and generic source eligibility contracts.
- Does not own the actual domain record, source extraction, or business
  publication decision.
- Keeps source-provider contracts safe for multiple domains and tenants.

## Extension

Domain modules register source providers in their own layer and keep
entity-specific extraction close to the domain authority. Do not copy domain
source logic into this generic Discovery module.

## Verification

Run the focused contract test from the repository root after changes:

```bash
node nodics.discovery/modules/discoverySource/test/discoverySourceContract.test.js
```
