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

Documentation route records use CMS `deliveryState: DRAFT` before publication.
`STAGED` identifies publication placement and documentation lifecycle, but is not
a valid CMS route delivery state. Keep route target seals and the documentation
manifest hashes aligned; `test/documentationForwardPackaging.test.js` checks the
actual CMS route enum so source packaging cannot hide a runtime schema rejection.

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


## Explicit release source selection

Axis declares its two existing sections in ordinary
`data.dataReleases.contributions`, using the existing keyed collection operator.
`axis:axisBaseline` is Init; `axis:core-v001` is Core. The immutable headers target
CMS and Catalog models. Both releases require explicit STAGED publication context,
and the existing administrator publication workflow remains separate. Merely
loading this declaration does not activate Axis, import either release, or publish.

When Axis configuration is not already inherited, a selected server may use the
existing package selector `{ "moduleName": "axis", "namespace": "data" }` in
`nodics.runtimeConfigurationContributions`, with `nodics.platform` included in its
existing discovery roots. Keep Axis inactive on the CMS runtime. Preserve the
server's other metadata. nConfig permits one selected owner per namespace; do not
add multiple `data` namespace selectors to aggregate unrelated groups.

Alternatively, customer-owned properties may explicitly select only the required
source sections through the existing list, without loading other Axis namespaces:

```js
data: {
  dataReleases: {
    contributions: {
      $config: 'keyed',
      key: 'moduleName',
      entries: [{
        moduleName: 'axis',
        sections: { $config: 'replace', value: ['axisBaseline'] }
      }],
      remove: []
    }
  }
}
```

This is a deployment source selection, not a new framework property definition.
The source must be discoverable in the selected roots. If the owner contribution
is already inherited, supply only intentional narrowing/removal, not a duplicate.
Use both section names only when both are wanted; never put `core-v001` in an
Init-only startup selection. Validation/installation remains a separate authorized
nImport request, for example `{ dataType: 'init', releaseCodes: ['axis:axisBaseline'] }`.
The existing `axisDocumentationFoundation` template stays inert until explicitly
selected. Runtime-local receipts and history remain on the selected runtime.

Offline evidence: `test/axisReleaseContributionContract.test.js` and the cross-group
`nodics.commerce/test/frameworkReleaseContributionComposition.test.js`.

The Framework baseline explicitly shares the published static `/dashboard`,
`/lock-screen` and `/schema-workbench` composition with authorized employees in
their own enterprises. CMS privately reads only the project pointer and pinned
manifest. Schema discovery and business-record APIs preserve the original signed
realm, permissions and owner guards. Extend exact paths through the baseline
property; do not copy pages, change grants or introduce a default-tenant record
fallback. See CMS `test/cmsEmployeeCompositionDelivery.test.js`.

Axis owns inert `axisAccessDefinitions` and `axisContentAccessDefinitions` initialization templates for its employee-onboarding prerequisites. They select the existing Axis/CMS implementing-owner releases; those owners and Profile retain group, role and assignment authority. A deployment selects a named profile using only `{template: "axisAccessDefinitions"}` or `{template: "axisContentAccessDefinitions"}` and its explicit startup profile selection. Templates never select themselves, replay installed records, grant rights or install business content. Keep reusable copy/steps here, and only deployment choices in Kickoff. The Local fresh-bootstrap and guided-initialization owner tests cover effective plans.

Standard workflow copy belongs to this module in `src/service/localization/workflowMessages.json`. Its contribution exposes stable public-safe UI labels only, never records, permissions or internal errors. English definitions and Arabic reference values use the Localization contribution, draft, review, approval and release APIs; loading the module does not approve or publish translations. Later project layers may supply intentional scoped translations through the same owner workflow. Preserve exact message parameters, authorization and uncertainty guidance.
