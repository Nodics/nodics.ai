# axis

`axis` is the backend-owned data/support module for the Nodics Axis product.

It keeps Axis-specific CMS composition, documentation content, importable
records, and BackOffice capability metadata out of the frontend repository while
preserving a clean split from BackOffice API authority.

## Owns

- Axis documentation CMS content pack.
- Axis documentation Site/catalog/page/component/route records.
- The immutable `axis:axisBaseline` release containing the CMS-driven login,
  recovery, shell, and administration composition. It is discoverable only as
  an explicitly selected contribution on WCMS Staged, is never imported
  directly into WCMS Online, and requires an administrator-initiated normal
  publication workflow for its first Online baseline.
- Axis-specific BackOffice documentation/navigation metadata.
- Future Axis product seed, init, sample, and presentation metadata that must be
  imported into backend persistence.

## Does not own

- React source or executable browser renderers.
- Axis frontend build/deployment.
- BackOffice registry/bootstrap/discovery APIs.
- Framework documentation unrelated to Axis.
- Customer/project documentation content.

## Data lifecycle

`data/manifest.json` is the routing authority. The `axisBaseline` section is
Platform-owned `PUBLISHABLE` data with destination `WCMS_STAGED`; its physical
`data/init` location does not grant another runtime permission to install it.
WCMS continues to own the target schemas, governed import execution, version
resolution, publication manifests, and Online delivery. The frontend never
loads these source files or writes either persistence boundary.

The Axis baseline manifest also owns its client-safe publication review:
included entity counts, Staged-to-Online scope, expected impact, recovery
guidance, and the capabilities available after publication. nImport validates
that immutable metadata and WCMS binds it to the qualified release checksum,
publication identity, and Process workflow reference. Axis must refuse approval
when that exact review projection is absent or mismatched.

## Verify

```bash
npm test
```
