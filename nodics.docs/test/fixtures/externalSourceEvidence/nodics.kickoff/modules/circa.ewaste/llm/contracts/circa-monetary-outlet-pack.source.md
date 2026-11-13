# Approved Fictional Local Outlet Packs

The human approved the exact four goods in
`test/fixtures/circaMonetaryOutletProposal.json` on 2026-10-09. Preserve that
historical proposal and its original review fields. Adoption is recorded in
`test/fixtures/circaMonetaryOutletSetupSelection.json`; source approval grants
no runtime permission, consent, stock, payment or delivery evidence.

All new business source remains in `data/sample-v001/merchant-outlets`, semantic
0.0.1, EXPLICIT and LOCAL only. Each issuer owns nine catalogue files, one
governed publication plan and one Inventory opening-instruction payload.

| Issuer | Outlet | Product | AED | Opening units |
| --- | --- | --- | --- | --- |
| GREENPERKS_RETAIL | greenperks-cafe | CIRCA_LOCAL_CAFE_GOODS | 300.00 | 100 |
| GREENPERKS_RETAIL | greenperks-bistro | CIRCA_LOCAL_BISTRO_GOODS | 300.00 | 100 |
| RENEWWORKS_REPAIR_REUSE | renewworks-repair | CIRCA_LOCAL_DEVICE_CARE_GOODS | 100.00 | 100 |
| LOOPCYCLE_RECYCLING | loopcycle-accessories | CIRCA_LOCAL_RECYCLED_ACCESSORIES | 300.00 | 100 |

Product and variant localization covers en/ar. These are ordinary physical goods
using the existing default path, without digital delivery fields or variant-level
pricing. CIRCA_LOCAL_DEMO / LOCAL_DEMO_ZERO is explicitly fictional zero tax,
not a UAE tax assertion. SHIP_TO_HOME warehouse policy does not prove delivery.

Record basenames and header prefixes include GreenPerks, RenewWorks or LoopCycle.
nImport expands header prefixes across a source root; shared basenames would
include sibling issuer files. Ordinary Commerce headers omit explicit placement
options, matching the original Circa/apparel packs. Records retain exact tenant
and enterpriseCode; Product/Pricing/Tax have no explicit placement validator.
Do not add broad validators or bypass importer guards. Each canonical
catalogue discovery must contain exactly its nine manifest files.

## Native Setup And Axis

Native Platform's Circa preparation contains all nine goods stages and Russell's
four independently checksummed bounded human-role releases. The original
`circaLocalDemoCredit` source is selected without changing its bytes or guard.
The group definitions precede their additive staff instructions; actual
`operations` employee preparation precedes the late staff batch. Profile owns
the existing additive CAS operation and subsequent genuine session refresh.

Catalogue source imports are BEFORE_PUBLICATION. The canonical setup owner
allows `operatorEnterpriseCode` only AFTER_PUBLICATION, so the catalogue headers
retain exact issuer ownership on their records. Publication and opening are separate required,
USER-triggered AFTER_PUBLICATION stages under each exact signed issuer. The
three publication plans add 14 roots: four Products, three PriceBooks containing
all four PriceRows, three TaxPolicies and four Warehouses. Original publication,
budget and issuance stages remain required. All selected issuer publication
roots must be CURRENT before that operator can select opening instructions.

Axis uses the same Platform profile; the nine stages are not confined to a helper
import script. Current observation revision 8 seals 57 required stages through the owner
`configuredSteps`, `stepIdentity`, nImport release inspection and profile digest.
The original revision-2, revision-3 and revision-4 bytes remain under
`config/setup-observation/history/`. Historical revision 4 changed only the three
never-installed goods catalogue source checksums. Revision 5 selects the current
owner access contributions and explicit demo/content successors for this refactor;
historical stage seals are not descriptions of that new selection.
This is a forward source selection, not a rewritten runtime journal or receipt.
An already admitted older setup still needs normal reviewed plan adoption;
never mutate its sealed profile or use a reset to bypass installed history.

The inert fixture also provides the exact Product activation scopes and
Pricing/Tax/Inventory Store-to-root declarations. Native deployment has selected
those four outlets. Preserve the marketplace, active Agora selections and
independent authority/provider settings when maintaining that deployment.
Declarations and flags are not retained activation or installed qualification.

## Main Operator Commands

These are handoff commands, not actions executed by this source task. Set each
URL to its existing native runtime origin. Use the genuine human token for the
current phase and issuer; do not inject enterprise or tenant headers.

First inspect the fresh Circa profile and prepare its BEFORE_PUBLICATION stages
through Axis or the same BackOffice API with the existing authorized setup human:

```sh
curl --fail-with-body -sS \
  -H "Authorization: Bearer $CIRCA_SETUP_TOKEN" \
  "$CIRCA_PLATFORM_URL/nodics/backoffice/v0/applications/circa/initialization"

curl --fail-with-body -sS -X POST \
  -H "Authorization: Bearer $CIRCA_SETUP_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"reason":"Approved fictional Local Circa setup"}' \
  "$CIRCA_PLATFORM_URL/nodics/backoffice/v0/applications/circa/initialization/prepare"
```

Complete the existing CMS baseline and normal Process approvals. Select one
exact publication stage in Axis under its issuer, then approve through the normal
workflow. For example, GREENPERKS_RETAIL selects:

```sh
curl --fail-with-body -sS -X POST \
  -H "Authorization: Bearer $CIRCA_OPERATOR_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"reason":"Approved fictional GreenPerks outlet publication","afterPublicationStepCode":"circa.ewaste:circaGreenPerksOutletPublicationPlan"}' \
  "$CIRCA_PLATFORM_URL/nodics/backoffice/v0/applications/circa/initialization/initiate"
```

After retained Product/warehouse activation and installed atomic Inventory
qualification, select the same issuer's separate opening stage:

```sh
curl --fail-with-body -sS -X POST \
  -H "Authorization: Bearer $CIRCA_OPERATOR_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"reason":"Approved fictional GreenPerks first intake","afterPublicationStepCode":"circa.ewaste:circaGreenPerksOutletOpening"}' \
  "$CIRCA_PLATFORM_URL/nodics/backoffice/v0/applications/circa/initialization/initiate"
```

Use the corresponding RenewWorks or LoopCycle stage and original signed issuer
for those outlets. Foreign stages remain required and visible. The existing
credit stage requires the original GREENPERKS_ONLINE human after role adoption
and normal authentication refresh, before buyer mutations; its original 118 /
revision-0 guard must still pass.

For owner-level diagnostics, the exact per-issuer `commerceRequest` and
`openingRequest` bodies are in the inert setup fixture. Submit only that one
release to `/nodics/import/v0/sample/validate`, then `/sample/install` on its
declared runtime. Governance uses the issuer's `publicationPlan.json` unchanged
at `/nodics/publish/v0/publications/setup/status` and `/setup/submit` on Staged;
normal Process review and retained Online evidence remain mandatory. These APIs
supplement the complete Axis setup; they do not replace its required stages.

Opening uses INVENTORY_OPENING_RECEIPTS with exactly nine instruction fields.
Tenant, enterprise and actor come from authentication. No balances, movements,
carts, entries, orders, captured payments or transaction snapshots are imported.
Exact replay verifies the original receipt without replenishing consumed stock.
Existing stock identities, changed intent, unqualified atomic persistence or
missing owner evidence must refuse. No real payment or physical delivery ran.

## Source Verification

```sh
npm run domains:manifests -- --module=circa.ewaste --check
node --test modules/circa.ewaste/test/circaMonetaryOutletPack.test.js modules/circa.ewaste/test/circaMonetaryOutletProposal.test.js modules/circa.ewaste/test/circaPublicationPlan.test.js test/circaNativeObservationSelection.test.js
git diff --check
```

The source handoff JSON under `test/evidence` lists every new payload hash, all
nine section checksums, combined manifest hash, forward observation hash and
remaining broader-suite gaps. Runtime imports, approvals, stock admission,
signed-in Axis and monetary journeys require their own installed evidence.
