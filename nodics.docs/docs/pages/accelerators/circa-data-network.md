# Circa Data, Enterprises and Collection Network

Circa composes records from several domain owners; it does not have one universal
Circa table. For beginners, distinguish a business enterprise, a sellable store,
a physical collection point and a coupon offer before importing data. Each has
its own lifecycle and permissions. The business value of this separation is that
one programme can change operators, locations or offers without rewriting customer
ownership, credentials or settlement history.

## Data ownership and record relationships

| Record or relationship | Owner | Meaning |
| --- | --- | --- |
| Enterprise, parent/child, employees and memberships | Profile | Organizational responsibility and explicit access, not automatic trade permissions |
| Location | Location | Canonical coordinates and location metadata |
| Waste collection point | Waste Collection | Collection eligibility, policies and references to a location/operator |
| Collection preset, taxonomy and acceptance policy | Waste with eWaste references | Supported items, evidence/receipt requirements and assessment selection |
| Submission, verification, evidence, receipt and asset | Waste | Customer facts, decisions, physical custody and ownership |
| Store, category, product, variant and localized copy | Commerce Product/Store | Published browsing and purchase context |
| Price book/rows, inventory and coupon batch | Commerce/Promotion | Cost and purchasable supply, separate from issued customer codes |
| Wallet, rewards and ledger | Loyalty | Governed value movement and immutable references |
| Page, route, renderer, component and media | WCMS/Media | Published presentation, not business transaction truth |

Collection-point references must resolve to real owner records. A map marker's
display text is not the location authority. A physical redemption outlet is also
not the online store that sold a coupon. A shared parent company does not make
every subsidiary an eligible coupon merchant or every employee an operator.

## Enterprises and employee access

The reference Commerce store `circaMainStore` currently declares tenant and
enterprise `default`. Existing centre records reference Profile enterprises; their
operator allocation must be inspected before changing it. Do not infer ownership
from an illustrative centre name or substitute a proposed company into old records.
Enterprise business roles can express multiple responsibilities without duplicating
the enterprise identity. Operational employee permissions still need explicit
membership, selected enterprise context and owner-governed resource scopes.

Profile already represents parent/child enterprises. Hierarchy alone grants no
membership, administrative delegation or outlet access. Consent-based ancestor
delegation has an accepted framework policy, but complete enforcement remains
unqualified in the current source batch. Keep existing exact-target/platform checks;
do not grant access by inserting an ancestor lookup. Authorized platform admins are
different from ordinary employees of a PLATFORM_OWNER enterprise.

## Collection-centre configuration

Across the reviewed sources there are three original Circa points, 17 shared
Waste Collection points and one separately selectable Sunmarke point: 21 authored
codes, not an installed total. Setup selects shared packages; the Circa transaction
sample is optional and Sunmarke sections are not selected in that setup list.
The [collection reference](circa-collection-reference.md) lists all point identities,
coordinates and associations. The [enterprise reference](circa-enterprise-reference.md)
documents operator ownership, `assetOwnerEnterpriseRef` and staff scope caveats.

The original Circa sample contains `cc-dxb-01`, `cc-dxb-02` and `cc-dxb-03`,
linked respectively to `cc-dxb-01-location`, `cc-dxb-02-location` and
`cc-dxb-03-location`. The collection record controls its eligible operations and
reference policy; the Location record supplies coordinates. Arrival uses fresh
reported customer coordinates and direct distance, not map route distance or an
assertion that the customer has arrived. Confirm the active runtime location after
an authorized coordinate change; editing source alone does not update persisted data.

For a new centre, create/approve the enterprise allocation, canonical location,
collection point and applicable presets through the existing owner tools/APIs.
Assign employee centre scope separately. Then verify visibility, nearby discovery,
eligible item handling and the inclusive arrival boundary. A missing or inactive
centre must not be treated as eligible just because a browser retains its card.

## Store and catalogue configuration

The reference selects `eWaste.marketplace.storeCode = circaMainStore`,
`catalogVersion = circaStaged`, `priceBookCode = circaPointsPriceBook` and
`warehouseCode = circaDigitalRegistry`. The Store record declares POINTS currency,
English locale and Asia/Dubai timezone. Product, variant, localized content, price,
inventory and promotion references must agree before publication. The source has
illustrative asset products and three coupon products; this is not evidence that
the separately prepared 35-offer network has been installed.

Author catalogue data in Commerce Staged and publish through the owning governed
projection. Publishing the website does not publish Commerce. An active source
product that is not in the Online projection can correctly be absent from Shop.
Optional localized offer copy includes terms, eligibility, exclusions,
redemptionInstructions and purchaseConditions. Copy is not enforcement of minimum
spend, a discount cap, stock or merchant authorization.

## Releases, inheritance and preservation

`circa.ewaste/data/manifest.json` is the source release authority. Sections route
Profile, Location, Waste, Loyalty, Commerce, operations and content to their
appropriate runtime roles. Source sample sections are limited to Local and Local
Production Simulation. Their environment scopes are not production-data approval.

The explicit reference sequence selects `eWaste:core-reference` and
`circa.ewaste:waste-policy`, currently version `0.0.1` from `core-v002`. Existing
nImport source-key composition uses matching filenames, exported keys and header
targets. It is not a JavaScript import of mutable framework records. Historical
`core-v001`/sample snapshots remain retained. The optional Waste transaction sample
uses `sample-v004`, version `0.0.5`, and excludes taxonomy/profile writes. Explicit
selection alone does not prove that the destination is fresh.

Before an upgrade, inventory installed receipts, checksum/version, existing codes,
customer references and operational overrides through owner APIs. Unknown provenance
blocks adoption. Never reimport opening wallets, submissions or ownership events
over transactional history merely to refresh a demo. Do not manually edit generated
manifest hashes or bypass import validation with direct database writes.

## Customize and extend safely

Developers add only intentional records/deltas under their custom backend module's
`data/<release>/headers` and `records` trees. Configure the module's governed release
manifest through existing tooling. A worked example is a fourth collection point:
use a new approved code, reference an approved Location and operator, select existing
eWaste policy, and leave the original three points and customers untouched. Do not
copy the entire eWaste taxonomy to change one collection profile.

Test composition against a fresh fixture and an installed-reference fixture with
divergent policy. Verify that only selected records change, old assessment/ledger
evidence remains intact, ambiguous references reject and retries retain receipts.
Rollback is an owner-reviewed release action, not deletion of records with history.

## Common mistakes

Confusing coupon offers with issued codes; conflating store and outlet; using a Maps
camera coordinate instead of the selected place; deriving access from enterprise
business roles; refreshing sample transactions on a live installation; and treating
configuration edits as installed data changes all produce misleading programmes.

## Verification

Operators and DevOps should inspect source manifests and installed owner receipts
separately. Review cross-domain references, tenant/enterprise separation, missing
references, duplicate codes, quantities and localization. Author negative and
failure/recovery fixtures before joint imports. Source validation and pack generation
do not execute imports. Continue with [submission](circa-submission-journey.md),
[coupon commerce](circa-coupons-commerce.md) and [customization](circa-customization.md).
