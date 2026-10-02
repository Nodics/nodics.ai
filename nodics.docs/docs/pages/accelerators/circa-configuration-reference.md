# Circa Configuration and Extension Reference

This page indexes every top-level contribution in Circa's backend configuration,
so beginners can locate a setting instead of searching unrelated framework defaults.
The source is `modules/circa.ewaste/config/properties.js` in the customer backend.
Values describe authored reference choices as reviewed on 30 September 2026; they
are not an effective runtime export. Business/operator policy, environment layers,
server/module load order and governed runtime configuration can change the outcome.

## Application and journey settings

The business value of layered configuration is adapting the Circa journey without
copying authoritative domain engines. Developers and operators must distinguish
project defaults from effective runtime policy and persisted records.

| Property | Source choice and meaning |
| --- | --- |
| circaEWaste.application.code | CIRCA_EWASTE; preserve on installed upgrades |
| application.frontendModuleName | nodics.circa.eWaste |
| application.projectModuleName | circa.ewaste |
| application.backendModuleName | eWaste; reusable domain owner |
| application.frameworkModuleName | nodics.waste; generic Waste authority |
| application.requiredScenarioModules | eWaste and wasteRecycling; dependency selection is not journey acceptance |
| presentation.brandName/brandByline | Circa / by Nodics |
| presentation.sampleMode | true; do not hide illustrative limitations |
| presentation.walletLabels | Reward points / Carbon units |
| journey.contractVersion | 2 |
| journey.arrivalRadiusMetres | Environment descriptor CIRCA_EWASTE_ARRIVAL_RADIUS_METRES, numeric fallback 50 |
| journey.conversationMaximumCharacters | 1500 |
| journey.reviewAssignment.queueCode | CIRCA_EWASTE_REVIEW |
| journey.depositInstruction | Parameterized centre-name display instruction, not receipt evidence |
| journeys | submission, approvedAsset, marketplace, gift, donation, couponRedemption and recyclingHandoff enabled source flags |

Enabled journey flags describe selection, not completed production integration.
Radius is distance-based and inclusive; reported accuracy does not replace direct
distance or fresh coordinates. Do not assume historical values in old notes are
the effective radius. The existing eWaste/Location owners define timing and validity
requirements; the Circa module cannot manufacture an arrival proof.

## Marketplace, rewards and review policy

`eWaste.marketplace` selects circaPointsPriceBook, circaDigitalRegistry,
CIRCA_LOCAL_DIGITAL_OWNERSHIP_V1, circaMainStore and circaStaged. Currency is POINTS,
programme circa, reward type points and carbon reward type circaCarbon. rewardScale
is 2, carbonScale 3, jurisdiction CIRCA_SAMPLE, saleMode DIGITAL_OWNERSHIP,
couponCarbonMode UNCHANGED, orderCodePrefix CIRCA_ORDER_ and refundsEnabled true.
autoPublishListings is a source policy choice, not permission to bypass publication
approval. Listing presentation explicitly says no physical delivery is included.

`circaEWaste.rewardValuation` declares illustrative true, version
circa-weight-rewards-v2, pointsPerKg 10 and carbonUnitsPerEstimatedKg 1. The
selected provider is DefaultCircaEWasteRewardValuationService. These are sample
valuation settings, not cash conversion or certified carbon issuance. Owner Rules/
Loyalty evidence governs actual assessment and settlement. Later reassessments do
not recalculate old balances automatically.

`waste.projectOverlay` selects circa.ewaste:waste-policy as a PROJECT layer.
`waste.operations` requires scopes and verification and does not require different
approver. Broader business-role or application flags cannot relax those checks.

## Full top-level configuration ownership index

| Configuration subtree | Purpose and owner interpretation |
| --- | --- |
| tooling.acceptance.wasteManagement.fixture | Inert acceptance fixture codes, expected metrics and receipt prerequisite; not automatic test execution |
| data.dataReleases.runtimeRoleProfiles | WASTE initialization profile selecting material/eWaste/Circa references |
| product.runtimeRoleProfiles | COMMERCE_STAGED authoring, circaStaged, en/ar locales |
| cart.runtimeRoleProfiles | COMMERCE customer default jurisdiction AE and currency AED; not the marketplace POINTS price book |
| fulfillmentCore.runtimeRoleProfiles | Configured physical shipping/return options; does not make digital ownership physically delivered |
| circaEWaste | App/presentation/journey/sample valuation; see above |
| order.disputes/order.refunds | CIRCA_ORDER_ scope and configured eWaste owner port/target authority |
| promotion.legacyTokenHashPolicies | TENANT_COLON_UPPERCASE_SHA256 compatibility; not permission to expose tokens |
| digitalCore.merchantRedemption | Source enabled flag; complete merchant/outlet qualification remains independent |
| profileExternalIdentity | Circa TELEGRAM application binding and one-use browser-handoff requirement |
| runtimeConfigurationSchemas | telegramExternalIdentity and telegramDelivery governance; sensitive secret fields, permissions and refresh behavior |
| bidding | Enabled bid policy, exact amount scale/maximum and per-store choices |
| cms.publication | Project publication choices; nPublish remains generic authority |
| backofficeApplicationInitialization.profiles | Circa setup identity, capabilities, user-triggered packages and Online approval requirement |
| media.customerUploads | Source enabled choice; Media still authorizes upload/storage |
| waste | Project overlay and operational checks |
| wasteImpact.calculation | Provider selection, fallback chain, timeout and explicit mock compatibility policy |
| eWaste | Domain policy deltas, owner authorities, marketplace, communication/channel/guidance composition |
| apiExposure.categories.circaCustomer | App route exposure; each route still enforces its permission/auth contract |
| copilot.runtimeRoleProfiles | WASTE ingestion, scoped knowledge registry, provider references and generation profiles |
| wasteSubmission.runtimeRoleProfiles | WASTE metadata suggestion enable/adapter/profile |

This is a discovery index, not an invitation to duplicate those framework owners
inside a project service. Read the owner contract for each subtree before changing
it. Project configuration should contain actual selection/deltas, not copied default
endpoints, service credentials or alternative authentication registries.

## Providers, communication and secrets

`wasteImpact.calculation` selects DefaultEWasteOpenAiImpactProviderService, then
DefaultEWasteWarmImpactProviderService fallback, timeoutMs 90000 and failureMode
RESULT. Its mock compatibility subtree defines illustrative weights/factors but does
not activate a mock provider. Metadata suggestion separately selects OpenAI with
profile eWastePhotoMetadata. Copilot profiles also include structuredTool and
customerGuidance; guidance uses scoped customer knowledge and configured runtime
provider choices. Provider/model configuration is not evidence of a successful call.

`eWaste.channelAuthentication` selects TELEGRAM with Circa application binding and
seamlessSignIn choice. Outcome communication selects engagement and
WASTE_REVIEW_OUTCOME_V1. Target authorities separately identify ENGAGEMENT, COMMERCE,
COMMERCE_STAGED and WCMS_STAGED. Optional coupon EMAIL/SMS resources do not become
active lifecycle triggers through these waste-outcome settings.

Telegram bot and provider secrets are referenced through governed runtime fields.
This guide does not reproduce secret values, sample passwords or effective bearer
tokens. Runtime configuration permissions and refresh/restart policy must be honored;
source field declarations alone do not prove current credentials are present.

## Customize and extend safely

Developers export a focused project config delta. For example, select a custom
published Store and price book together while preserving original installed order
prefix/application identity during an upgrade. Use `$config` replace/ref/env/path
descriptors only under their existing contracts; replacing an array can remove
required predecessors and must be tested. Never let a customer request choose
provider or service identifiers. Validate effective merge, rejected values, missing
provider recovery and default-versus-later-layer behavior before activation.

## Common mistakes

Using Cart AED defaults as the coupon POINTS currency; treating mock settings as an
active provider; changing a flag as proof of integration; copying secret values;
and confusing source policy with installed data are incorrect. Production DevOps
must inspect the effective runtime and owner release evidence independently.

## Verification

Review this index whenever properties.js gains/removes a subtree. Check selected
module/server order, environment references, governed runtime values and actual
owner availability during joint acceptance. Documentation generation does not
start providers or mutate runtime configuration. Continue with
[customization](circa-customization.md), [record inventory](circa-source-inventory.md)
and [deployment](circa-deployment-verification.md).
