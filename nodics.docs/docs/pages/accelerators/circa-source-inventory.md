# Circa Source Release and Record Inventory

This is the detailed data index for the Circa reference product. Beginners can use
it to answer which module contributes a record, how many authored exports it has,
which runtime receives it and which release is selected. Business/operator teams
must not interpret these counts as installed users, current stock, live wallet
balances or completed transactions. Counts were inspected from current source on
30 September 2026, without imports, owner API calls or database reads.

## Manifest sections and destinations

The business problem is release reconciliation: teams need to know which source packages contribute records before deciding what to import or publish. This inventory supplies that context without claiming a successful deployment.

All paths below are beneath the customer backend
`modules/circa.ewaste/data`; the manifest, not the oldest directory name, selects
active contribution roots. The framework guide describes them without relocating
the application's data into a framework domain.

| Section | Source root | Version | Destination | Publication |
| --- | --- | --- | --- | --- |
| profile | sample-v001 | 0.0.4 | PLATFORM | NONE |
| location | sample-v001 | 0.0.4 | LOCATION | NONE |
| waste | sample-v004 | 0.0.5 | WASTE | NONE; EXPLICIT optional transaction sample |
| waste-policy | core-v002 | 0.0.1 | WASTE | NONE; EXPLICIT reference overlay |
| loyalty | sample-v001 | 0.0.4 | LOYALTY | NONE |
| content | sample-v001 | 0.0.9 | WCMS_STAGED | REQUIRED |
| commerce | sample-v001 | 0.0.4 | COMMERCE_STAGED | REQUIRED |
| operations | sample-v001 | 0.0.2 | PLATFORM | NONE |
| customer-workspace | core-v001 | 0.0.3 | WCMS_STAGED | REQUIRED |
| sunmarke-profile | sample-v001 | 0.0.2 | PLATFORM | NONE |
| sunmarke-location | sample-v003 | 0.0.3 | LOCATION | NONE |
| sunmarke-waste | sample-v001 | 0.0.1 | WASTE | NONE |

Waste policy has environmentScope ALL. The other listed sections are scoped to
LOCAL and LOCAL_PRODUCTION_SIMULATION. An ALL reference scope is not permission
to replay local transactional samples in production. PUBLISHABLE source requires
separate governed Online activation; importing Staged is not publishing.

## Profile, Location and operational files

| Section/records filename | Exports | Role of records |
| --- | ---: | --- |
| profile/circaAddressData.js | 3 | Address references for original three centres |
| profile/circaCustomerData.js | 3 | Reference customer identities; no passwords reproduced here |
| location/circaLocationData.js | 3 | Original three canonical locations |
| operations/circaOperationalEmployeeData.js | 7 | Operational employee templates |
| operations/circaOperationalScopeData.js | 8 | Seven employee scope templates plus existing platform-admin scope |
| sunmarke-profile/sunmarkeAddressData.js | 1 | Optional school address |
| sunmarke-location/sunmarkeLocationData.js | 1 | Optional school location |
| sunmarke-waste/sunmarkeWasteCollectionPointData.js | 1 | Optional school collection point |

For each section, filenames live under its source root and section's `records`
directory. Employee templates and scope principal identifiers need Profile lifecycle
resolution; counts do not prove current membership or credential availability.
Enterprise definitions are dependencies, not Circa profile records: Profile owns
default initialization; Waste Core contributes the two shared-network enterprises.

## Waste transaction and reference files

| Selected section/filename | Exports |
| --- | ---: |
| waste/circaWasteAssetData.js | 11 |
| waste/circaWasteAssetOwnershipEventData.js | 11 |
| waste/circaWasteCollectionPointData.js | 3 |
| waste/circaWasteEvidenceData.js | 21 |
| waste/circaWasteImpactResultData.js | 11 |
| waste/circaWasteSubmissionData.js | 21 |
| waste/circaWasteVerificationData.js | 16 |
| waste-policy/eWasteAcceptanceRuleData.js | 1 |
| waste-policy/eWasteCategoryData.js | 25 |
| waste-policy/eWasteCollectionPresetData.js | 2 |
| waste-policy/eWasteImpactProfileData.js | 2 |
| waste-policy/eWasteItemTypeData.js | 28 |

The selected submission field is `submissionStatus`: 11 APPROVED, 5 SUBMITTED,
5 REJECTED. Verification uses `verificationStatus`: 11 APPROVED, 5 REJECTED.
Asset uses `assetStatus`: 6 OWNED, 5 LISTED. Older prose describing 20 submissions
or ten approved records is a historical opening snapshot, not this successor count.
Do not query a generic `status` field and report undefined values as lifecycle state.

The policy counts describe Circa's source overlay exports, not total composed
taxonomy. nImport can inherit the selected eWaste reference predecessor. Matching
file names, export keys and header targets determine composition. Counting the
two files as two full taxonomies would be incorrect. Historical core-v001 roots
and earlier Waste samples are retained compatibility evidence, not extra active
records to import alongside the successor.

## Loyalty files

| Filename in loyalty/records | Exports |
| --- | ---: |
| circaLoyaltyProgramData.js | 1 |
| circaLoyaltyRewardTypeData.js | 1 |
| circaLoyaltyWalletData.js | 3 |
| circaLoyaltyWalletRewardBalanceData.js | 6 |
| circaRewardLedgerEntryData.js | 22 |

Configuration uses programme circa, reward type points and carbon reward type
circaCarbon. One Circa-authored reward-type export is not proof that the whole
deployment has only one reward type: inspect inherited owner reference data.
Opening ledger records are not repeatable top-ups. Preserve source references,
original reward/asset history and owner balance arithmetic.

## Commerce files

| Filename in commerce/records | Exports |
| --- | ---: |
| circaCategoryData.js | 2 |
| circaCategoryLocalizationData.js | 4 |
| circaProductData.js | 8 |
| circaProductLocalizationData.js | 16 |
| circaProductVariantData.js | 8 |
| circaProductVariantLocalizationData.js | 16 |
| circaPriceBookData.js | 1 |
| circaPriceRowData.js | 8 |
| circaInventoryBalanceData.js | 8 |
| circaCouponBatchData.js | 3 |
| circaCouponData.js | 150 |
| circaPromotionData.js | 3 |
| circaStoreData.js | 1 |
| circaTaxPolicyData.js | 1 |
| circaWarehouseData.js | 1 |

Eight products comprise five asset listings and three coupon offers. Two categories
are circaAssets and circaCoupons. Sixteen localized product and variant rows
represent English/Arabic contributions, not sixteen additional products.
The [catalogue record reference](circa-catalogue-reference.md) shows exact identities,
prices, inventory and promotion relationships. The 35-offer preparation plan has
not replaced these source releases or been imported by this documentation change.

## Content, assets and account composition

Content exports are circaCmsComponentData.js (10), circaCmsGroupData.js (1),
circaCmsPageData.js (3), circaCmsRendererData.js (9), circaCmsRouteData.js (3),
circaCmsSiteData.js (1), circaCmsSlotData.js (1), circaCmsTemplateData.js (1),
circaCmsTypeData.js (9) and circaContentCatalogData.js (1). The assetManifest declares
18 media assets; circaMediaData.js maps those entries to Media hydration records.
Do not count the asset manifest and hydration projection as 36 independent assets.

Customer-workspace exports one record each from circaWorkspaceComponentData.js,
GroupData.js, PageData.js, RendererData.js, RouteData.js, SlotData.js, TemplateData.js
and TypeData.js (all with the circaWorkspace prefix). These records supply the
published account composition, not eight customer transactions. The shared typed
renderer consumes safe backend configuration; it does not execute server-supplied
JavaScript or grant domain actions from copy.

## Customize and extend safely

Developers add a focused custom release and update its authoritative manifest with
existing tooling. A worked example changes only one account banner component while
leaving transaction and opening-wallet sections unselected. Validate checksums,
source keys, owner headers and generated artifacts before reviewing publication.
Reject unknown baseline or conflicting release versions; recover through owner
receipts rather than deleting history or editing generated hashes.

## Common mistakes

Summing overlapping historical/current roots; treating locale rows as products;
counting policy overlays as complete composed taxonomy; treating exported opening
balances as current balances; and reimporting transactions to update a banner are
incorrect. Source status counts are dated documentation evidence, not live telemetry.

## Verification

This inventory comes from the manifest's selected file lists and offline exported
data shapes, with no runtimes or credentials. Operators/DevOps must verify installed
receipts and authorized owner API inventory separately. Check source inventory again
after any release change and preserve counts/source-root/version in documentation.
See [collection centres](circa-collection-reference.md), [enterprise/staff](circa-enterprise-reference.md)
and [configuration](circa-configuration-reference.md) for field-level interpretation.
