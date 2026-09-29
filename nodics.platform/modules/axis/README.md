# axis

The project is still pre-production, so the latest Axis dashboard composition is
the local baseline truth. The `/dashboard` route, page, workspace template,
workspace slot, dashboard component graph, and renderer/type contracts are folded
into `axisBaseline` under `data/init-v001`.

Do not add historical dashboard `core-v00x` releases while this product has not
gone to PROD. Replace the baseline dashboard records instead, update the manifest
hashes, and keep `test/axisDashboardComposition.test.js` green. The governed
Staged-to-Online publication policy remains intact; local import owns the latest
Staged data, and Online activation still goes through the normal publication
workflow.

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
- The immutable `axis:axisAssistantKnowledge` update release that adds the
  governed Assistant knowledge-status presentation without modifying the
  accepted baseline.
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

`axisBaseline` installs the current dashboard experience into WCMS Staged:
Framework Overview, Applications, and Technical tabs are delivered by one closed
CMS component graph rooted at `axisFrameworkDashboardWorkspaceComponent`.
Documentation stays a separate section, outside application metrics.

Install the baseline into WCMS Staged and use the normal administrator-reviewed
publication workflow for Online. Deploy the matching Axis renderer before
publication; import alone does not update Online. Later production releases can
customize composition through governed CMS records, not custom services or
frontend accelerator lists. Run `node --test test/axisDashboardComposition.test.js`
from this module for the composition, schema, and checksum regression checks.

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
