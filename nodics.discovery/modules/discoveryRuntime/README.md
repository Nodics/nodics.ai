# discoveryRuntime

`discoveryRuntime` owns the runtime seam that resolves active Discovery
profiles and delegates execution to the configured search capability. It keeps
Discovery orchestration separate from source ownership and low-level provider
implementation.

## Ownership

- Owns runtime profile resolution and nSearch delegation seams.
- Does not own domain source providers, search-engine client packages, or
  customer-facing API response contracts.
- Keeps runtime behavior configurable through the active module hierarchy.

## Extension

Project and domain modules should customize profile selection, source
eligibility, and response projection in their owning layers. Use this module
only for reusable Discovery runtime orchestration behavior.

## Verification

Run the focused contract test from the repository root after changes:

```bash
node nodics.discovery/modules/discoveryRuntime/test/discoveryRuntimeContract.test.js
```
