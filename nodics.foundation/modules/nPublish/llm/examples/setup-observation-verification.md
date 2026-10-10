# Exact-Plan Observation Verification

Local source-only checkpoint, 2026-10-09. Framework defaults remain disabled;
native Kickoff reviewed source policy is explicitly selected on eight receivers.
This records the observer work, not every concurrent change in the dirty checkout.
See [native configuration recipe](setup-observation-native-review.md).

## Owned Files

Paths below are relative to the framework checkout.

Core implementation and route admission:

- `nodics.foundation/modules/nPublish/src/service/defaultPublicationSetupObservationService.js`
- `nodics.foundation/modules/nPublish/src/service/defaultPublicationSetupService.js`
- `nodics.foundation/modules/nPublish/config/properties.js`
- `nodics.foundation/modules/nPublish/src/router/routers.js`
- `nodics.foundation/modules/nPublish/src/controller/defaultPublicationLifecycleController.js`
- `nodics.foundation/modules/nPublish/src/utils/statusDefinitions.js`
- `nodics.foundation/modules/nAuth/config/properties.js` (permission recognition only)
- `nodics.platform/modules/backoffice/src/service/defaultBackofficeApplicationInitializationService.js`
- `nodics.platform/modules/backoffice/src/router/routers.js`
- `nodics.platform/modules/backoffice/src/controller/defaultBackofficeApplicationInitializationController.js`
- `nodics.platform/modules/backoffice/src/schemas/apiContracts.js`

Read-only owner seams and uncached inspection:

- `nodics.wcms/modules/media/src/service/storage/defaultMediaReadinessService.js`
- `nodics.wcms/modules/cms/src/service/publication/defaultCmsPublicationManifestOrchestrationService.js`
- `nodics.wcms/modules/cms/src/service/publication/defaultCmsPublicationTargetService.js`
- `nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductPublicationVersionProviderService.js`
- `nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductPublicationGraphService.js`
- `nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductPublicationTargetService.js`
- `nodics.commerce/modules/baseCommerce/modules/pricing/src/service/defaultPricingPublicationService.js`
- `nodics.commerce/modules/baseCommerce/modules/inventory/src/service/defaultInventoryPublicationService.js`
- `nodics.commerce/modules/baseCommerce/modules/tax/src/service/defaultTaxPublicationService.js`
- `nodics.commerce/modules/baseCommerce/modules/promotion/src/service/defaultPromotionPublicationService.js`

Commerce owner files subsequently received concurrent owner-admission fixes from
their designated agent; this checkpoint does not claim ownership of those changes.
No callback, Process workflow-context, financial controller/transport, Profile
pack or installed Init bytes was edited. Kickoff source adoption is listed below;
no runtime or live grant changes were performed by this agent.

Focused tests added/extended:

- `nodics.foundation/modules/nPublish/test/publicationSetupObservation.test.js`
- `nodics.foundation/modules/nPublish/test/publicationSetupObservationProject.test.js`
- `nodics.foundation/modules/nPublish/test/publicationSetup.test.js`
- `nodics.foundation/modules/nPublish/test/publicationSetupOwners.test.js`
- `nodics.platform/modules/backoffice/test/applicationContributionReadiness.test.js`
- `nodics.platform/modules/backoffice/test/applicationModuleMediaManifest.test.js`

Contract/authority notes are in nPublish `AGENTS.md`, `README.md`,
`llm/contracts/publication-setup.md`, `llm/contracts/setup-observation.md`, this
example and its native recipe; BackOffice `AGENTS.md` and
`llm/contracts/governed-application-setup.md`; nAuth `AGENTS.md`, `README.md` and
`llm/contracts/README.md`; Media `llm/contracts/media-lifecycle-contracts.md`.

## Commands And Results

Run from `/Users/himkardwivedi/Apps/HimkarPrj/nodicsRoot/nodics.ai`.

```sh
env NODICS_OBSERVATION_PROJECT_ROOT=/Users/himkardwivedi/Apps/HimkarPrj/nodicsRoot/nodics.kickoff node --test \
  nodics.foundation/modules/nPublish/test/publicationSetupObservation.test.js \
  nodics.foundation/modules/nPublish/test/publicationSetupObservationProject.test.js \
  nodics.foundation/modules/nPublish/test/publicationSetup.test.js \
  nodics.foundation/modules/nPublish/test/publicationSetupOwners.test.js \
  nodics.platform/modules/backoffice/test/applicationContributionReadiness.test.js \
  nodics.platform/modules/backoffice/test/functionalModuleCatalogueService.test.js \
  nodics.platform/modules/backoffice/test/functionalModuleConcurrency.test.js \
  nodics.platform/modules/backoffice/test/functionalModuleEligibilityPagination.test.js \
  nodics.platform/modules/backoffice/test/functionalModuleLifecyclePagination.test.js \
  nodics.platform/modules/backoffice/test/backofficeApplicationInitializationContract.test.js \
  nodics.platform/modules/backoffice/test/backofficeRegistryRouteContract.test.js \
  nodics.platform/modules/backoffice/test/applicationPreparationOrder.test.js \
  nodics.platform/modules/backoffice/test/applicationPreparationReceipts.test.js \
  nodics.platform/modules/backoffice/test/applicationTargetBindingContract.test.js \
  nodics.platform/modules/backoffice/test/applicationSetupPlan.test.js \
  nodics.platform/modules/backoffice/test/applicationReadinessEvidenceContract.test.js \
  nodics.platform/modules/backoffice/test/applicationModuleMediaManifest.test.js \
  nodics.platform/modules/backoffice/test/applicationImportHistoryHandoffContract.test.js \
  nodics.wcms/modules/cms/test/cmsMediaDependencyReadinessContract.test.js \
  nodics.wcms/modules/cms/test/cmsPublicationContentPackBaselineService.test.js \
  nodics.wcms/modules/cms/test/cmsPublicationBaselineService.test.js \
  nodics.wcms/modules/cms/test/cmsPublicationManifestContract.test.js \
  nodics.wcms/modules/cms/test/cmsPublicationTargetRouteContract.test.js
```

Latest result: 188 passed, zero failed/skipped. Coverage includes disabled policy,
actual group-free generated access, explicit permission/module admission, all
five Commerce provider descendants, foreign/shared preparation, functional
modules, CMS/Media, current owner reads, source byte changes, profile/plan drift,
wrong tenant/principal/deployment/enterprise/root/source/revision and exact TARGET
operation selectors. No submit, decision, installer or financial grant is added.

The focused two-file observer/BackOffice command passed 103 tests. Regression
coverage includes distinct plan/release checksums through the actual installation
observer response and BackOffice aggregate; canonical typed receipts without
`runId`; missing legacy Product enterprise resolved only by its sealed owner;
foreign/null/empty stamps and wrong root tenant/code/version rejection; final
uncached journal equality; sealed response bindings; and bounded failure-code
projection without private diagnostics. Both production files passed
`node --check`; scoped `git diff --check` passed. They are frozen for main's
second native rebuild; further changes during that window are tests/docs only.

```sh
node --test \
  nodics.commerce/modules/baseCommerce/modules/pricing/test/pricingPublicationContract.test.js \
  nodics.commerce/modules/baseCommerce/modules/pricing/test/pricingPublicationPolicyBoundary.test.js \
  nodics.commerce/modules/baseCommerce/modules/inventory/test/inventoryPublicationContract.test.js \
  nodics.commerce/modules/baseCommerce/modules/inventory/test/inventoryPublicationPolicyBoundary.test.js \
  nodics.commerce/modules/baseCommerce/modules/tax/test/taxPublicationContract.test.js \
  nodics.commerce/modules/baseCommerce/modules/tax/test/taxPublicationPolicyBoundary.test.js \
  nodics.commerce/modules/baseCommerce/modules/promotion/test/promotionPublicationPolicyBoundary.test.js \
  nodics.commerce/modules/baseCommerce/modules/product/test/productGovernedPublicationContract.test.js
node node_modules/mocha/bin/mocha.js nodics.wcms/modules/media/test/mediaReadinessAggregateContract.test.js
```

Results: 48 Commerce tests and 9 Media tests passed. The 14 core/runtime files
above, excluding the seven Commerce owner files, passed `node --check` individually.
Scoped `git diff --check` passed for nPublish, nAuth recognition/docs, BackOffice
observer/routes/contracts and the three WCMS owner files. An initial syntax probe
used nonexistent flat WCMS service paths; the corrected owner paths all passed.

## Source Graph Evidence

The explicit project test reads configuration and source files only; it does not
start runtimes, use credentials, write configuration or generate packs.

- Platform: 39 required declared steps; profile digest
  `abe304d7584e04e469521ec0a44a1fe97983204d9a8298ddf023f1751cf9509b`.
- BackOffice additionally retains four functional-module checks: 43 total,
  with 33 BEFORE checks and 10 AFTER steps. Functional checks are not plan stages.
- Remote discovered Circa profiles have 25 steps, or are absent. They are not
  compared with Platform's full profile. Exact confined reviewed plan bytes are.
- Fresh destination source-byte/checksum pins: Platform 7, WCMSStaged 2,
  Process 6, Commerce 7, CommerceStaged 1, Loyalty 1, Location 4, Waste 6: 34 total.
- Online Commerce resolves all five selected target hooks with empty source
  version-provider, domain-adapter and workflow-provider registries.
- All eight receiving native graphs now select the reviewed policy and publish
  participation. WCMSOnline/Engagement do not select observer authority.

## Native Source Adoption

Kickoff-owned files, relative to `nodics.kickoff`:

- `modules/circa.ewaste/config/setup-observation/circa-native-reviewed.json`
- `envs/kickoffLocal/config/properties.js`
- `envs/kickoffLocal/platformServer/config/properties.js`
- `envs/kickoffLocal/processServer/config/properties.js`
- `envs/kickoffLocal/commerceServer/config/properties.js`
- `envs/kickoffLocal/commerceStagedServer/config/properties.js`
- `envs/kickoffLocal/loyaltyServer/config/properties.js`
- `envs/kickoffLocal/locationServer/config/properties.js`
- `envs/kickoffLocal/wasteServer/config/properties.js`
- `envs/kickoffLocal/wcmsStagedServer/config/properties.js`
- `test/circaNativeObservationSelection.test.js`

The exact plan checksum is
`24e1c32f778af0f96d600930f6b3d2df1d605ac9e6ce3e131d69d5cdec450151`.
The two production bug fixes above do not alter any native plan/config pins.
Platform retains its complete previous permission selection plus only
`publish.setup.observe`; all other financial/action grants are unchanged.
The new selection test covers exact caller/plan, all source pins, canonical full
Platform profile versus partial receivers, target-only Online registrations,
unselected receivers, Docker and no automatic/default grants.

Run from `nodics.kickoff`:

```sh
node --test test/circaNativeObservationSelection.test.js test/circaPublicationPreparationPrerequisites.test.js
```

Latest result: 8 passed, zero failed/skipped. The reviewed private profile and all
34 destination source-byte pins remain unchanged.

## Internal Token Lookup

`nConfig/bin/nodics.js` implements `getInternalAuthToken(tenant)` as a synchronous
lookup in the tenant's runtime token slot, not a fetch or validation. The canonical
`nService` internal authentication provider fetches current grant-bound tokens and
replaces each slot only on successful renewal. Failure retains the old slot and
backs off; the jittered renewal interval is bounded by half the remaining token
lifetime. No token was read, changed or refreshed for this verification. A fresh
direct observation passing does not prove a different cached token is current,
but the confirmed installation hash collision independently explains its binding
failure; this patch does not modify credential lifecycle behavior.

## Limitations

Native service JWT/stamp, actual persisted receipts, full aggregate positive UI
admission and endpoint exposure are qualified separately by main. Main reported
successful direct signed installation observation, all grants verified and all
84 publications CURRENT, but found the checksum collision and optional-run
receipt issue before this second rebuild. This source checkpoint does not claim
the rebuilt aggregate or financial preflight has passed.
No live calls, credentials, runtime mutation, grants or generators were used.
Local success does not qualify financial settlement, issuance or redemption.
The concurrent native callback/business-enterprise fix belongs to main and is
not included in this observer acceptance claim.
