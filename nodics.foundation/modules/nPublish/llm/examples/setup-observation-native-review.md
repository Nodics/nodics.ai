# Native Exact-Plan Review

This is a source/configuration adoption recipe, not a credential, generator,
readiness store or mutation command. Nothing below grants permission automatically.
Framework defaults remain disabled. The maintainer explicitly adopted native
Kickoff source input authority below; runtime adoption and readiness must still
be proven independently through canonical startup and owner APIs.
Exact files, commands and local results are recorded in the
[verification checkpoint](setup-observation-verification.md).

## Participation

Select the existing `publish` capability on Platform, Process, Commerce,
CommerceStaged, Loyalty, Location, Waste and WCMSStaged. The original source-only
probe found six missing selections; the reviewed native source adoption now
selects all eight receivers and their endpoint/service/default configuration.
WCMSOnline's existing CMS target transport remains unchanged; no observer route
or Circa profile copy is required there for this plan.

Do not copy the Platform BackOffice profile to targets. Platform alone verifies
its complete effective profile; targets verify the same exact reviewed plan file
bytes plus their own receiving server/role and authoritative owner reads.

## Review Material

The adopted module-confined input is
`nodics.kickoff/modules/circa.ewaste/config/setup-observation/circa-native-reviewed.json`.
It contains 39 required declared stages; the four functional-module checks remain
BackOffice-owned, for 43 checks in total. Exact file checksum:
`24e1c32f778af0f96d600930f6b3d2df1d605ac9e6ce3e131d69d5cdec450151`.
Canonical private Platform profile digest:
`abe304d7584e04e469521ec0a44a1fe97983204d9a8298ddf023f1751cf9509b`.
The public GET profile is a presentation projection and must not replace that pin.
No final receipt, random operation key or readiness assertion is stored in the plan.

Common native configuration selects only tenant/home enterprise `default`,
`serviceId: apiAdmin`, project `nodics.kickoff`, environment `kickoffLocal`, server
`platformServer`, instance `kickoff-local-platform-1`, assignment
`kickoff-local-platform-runtime-deployment`, and plan `circa-native-reviewed`.
Platform's complete existing canonical permission selection is preserved, with
only `publish.setup.observe` added. No default grants or human groups receive it.
Canonical startup reconciliation owns grant adoption; this recipe does not write
grants, mint credentials or infer live readiness.

Use the helpers on their real source-only configuration projections or initialized
owner runtime. They are ordinary non-routed pure owner methods, not live API calls:

```js
// Platform: full current profile, including newly installed role prerequisites.
const observer = SERVICE.DefaultPublicationSetupObservationService;
const backoffice = SERVICE.DefaultBackofficeApplicationInitializationService;
const profile = backoffice.profile('circa');
const draft = observer.describePlan('circa', reviewedTenant, 'circa-native-reviewed', 1);

// For each current required step, resolve its declared alias through the owner.
stage.server = backoffice.applicationTargetBinding(
  step.targetServer, step.targetRuntimeRole, 'publish').connectionName;

// Run on that stage's own destination configuration graph, not Platform's graph.
stage.release = observer.describeRelease(stage.code, stage.descriptor.dataType);
```

Copy only the returned release identity into review material. Complete every
DATA_RELEASE stage, including shared BEFORE and issuer AFTER. A missing/null pin
is rejected by `resolvePlan`; a draft is never accepted as proof.

For each GOVERNED_PUBLICATIONS stage, preserve the full configured bounded plan
and operator enterprise. Its canonical serving destination is:

```js
stage.online = { server: 'commerceServer', runtimeRole: 'COMMERCE' };
// stage.publications is optional. Do not invent final revisions or operation keys.
```

Review shared `enterpriseCode` values from the actual installed owner scope.
Do not substitute a foreign human identity or select an enterprise from a request.
The Media stage must use the signed Platform service's unchanged home enterprise.

For MEDIA_ASSET_MANIFEST, use the existing confined manifest and the pure
BackOffice source descriptor helper. No bearer, upload or human context is needed:

```js
const manifestPath = backoffice.safeManifestPath(step);
const assets = require(manifestPath); // approved existing module source convention
stage.assets = assets.map(asset => backoffice.describeMediaAssetSource(step, asset).descriptor);
stage.manifest = { moduleName: step.manifestModule, path: step.manifestPath,
  checksum: sha256OfExactFileBytes(manifestPath) };
```

`sha256OfExactFileBytes` denotes an ordinary reviewed file hash, not a framework
API or generator. The actual observer never executes that manifest: it validates
its confined bytes and checks exact persisted Media metadata separately.

On WCMSStaged, take the current CMS descriptor from the canonical baseline owner:

```js
const descriptor = SERVICE.DefaultCmsPublicationBaselineService.descriptor(profile.baselineCode);
draft.baseline = { server: 'wcmsStagedServer', runtimeRole: 'WCMS_STAGED',
  enterpriseCode: reviewedSharedCmsEnterprise,
  descriptorDigest: observer.digest(descriptor) };
```

Persist only this reviewed input JSON under the Circa module, for example
`config/setup-observation/circa-native-reviewed.json`. Keep it outside installed
immutable Init/core/sample roots. Compute its exact file-byte SHA-256 after review.
All receiving graphs must have the same locally available bytes/checksum/revision.
Do not persist observed READY state, copied receipts or final operation claims.

The latest inspected Platform profile contains 39 required declared steps plus
4 functional-module checks: 29 BEFORE, 10 AFTER, total 43. Its observed profile
digest was `abe304d7584e04e469521ec0a44a1fe97983204d9a8298ddf023f1751cf9509b`.
These are inspection evidence only. Derive the digest and complete step set again
after all source/config/role-pack edits are stable, rather than copying this hash.
Functional-module checks remain BackOffice-owned and are not extra plan stages.

## Explicit Policy

On all eight observer receivers, adopt the exact plan/caller configuration below.
Only Platform needs `profilePlans`. Only Commerce needs `targetObservers` for
these five target-local read hooks. Other maps may remain empty.

```js
publish: { setup: { observation: {
  enabled: false, // maintainer sets true only after complete review and grant adoption
  maximumPlanBytes: 524288,
  maximumSourceBytes: 8388608,
  maximumSourcePayloadBytes: 4194304,
  profilePlans: { circa: 'circa-native-reviewed' }, // Platform only
  plans: { 'circa-native-reviewed': {
    moduleName: 'circa.ewaste',
    path: 'config/setup-observation/circa-native-reviewed.json',
    checksum: '<exact reviewed file-byte sha256>', revision: 1
  } },
  callers: { nativePlatform: {
    tenant: '<exact signed tenant>', enterpriseCode: '<unchanged service home enterprise>',
    serviceId: '<existing approved Platform service id>',
    projectCode: '<signed runtimeScope.projectCode>',
    environmentCode: '<signed runtimeScope.environmentCode>',
    serverCode: '<signed runtimeScope.serverCode>',
    instanceCode: '<signed runtimeScope.instanceCode / runtimeInstanceId>',
    assignmentCode: '<signed runtimeScope.assignmentCode>',
    plans: ['circa-native-reviewed']
  } },
  targetObservers: { // Commerce only; no source adapters/workflows are needed
    product: 'DefaultProductPublicationVersionProviderService',
    pricing: 'DefaultPricingPublicationService',
    inventory: 'DefaultInventoryPublicationService',
    tax: 'DefaultTaxPublicationService',
    promotion: 'DefaultPromotionPublicationService'
  }
} } }
```

The concrete reviewed Platform deployment assignment must explicitly authorize
module `publish` and permission `publish.setup.observe` in its signed service
claims. nAuth recognizes only the name; it creates no grant. Use the existing
canonical Profile deployment APIs, not runtime-admin group grants. No human
group, global import/core/CMS/upload permission or financial-action grant is
needed to observe. Do not change claims or global nImport installer limits.

The 8 MiB/4 MiB source read budgets cover the inspected Circa content (about
6 MiB total, largest file 2,098,421 bytes). Oversized/changed sources fail closed.
No budget, source qualification, role or runtime configuration is changed by tests.

## Acceptance

After explicit adoption/build/restart, qualify fresh signed route admission and
each shared BEFORE, Media, CMS baseline, SOURCE/TARGET/SOURCE and foreign installed
stage. Unperformed AFTER publications simply remain non-current. Final lifecycle
pins can remain omitted; actual revisions/operations come from fresh owner reads.
Selected local actions still require the real human, enterprise, exact selector
and existing action grants; no selection means no AFTER dispatch.

Negative acceptance must include wrong caller/deployment/tenant/enterprise,
plan/checksum/revision/source/root, revoked grant, changed owner state and missing
endpoint. Local tests prove source/configuration and generated authorization
composition, not native JWT/stamp, database/provider or financial qualification.
