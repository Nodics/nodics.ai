# wasteCore Contracts

Preserve shared Waste source-reference, enum, and lifecycle policy contracts.

`wasteCore` is the Waste business anchor. Common Waste reference data belongs in
`wasteCore/data`, even when the target schema authority is another module such
as Profile `enterprise`. Leaf Waste modules own only capability-specific data.


Operational access is owned by `DefaultWasteOperationalAccessService`. Require exact router permissions and Profile-resolved allow/deny scopes before exposing a submission or its evidence. Scopes remain request-local; missing scope resolution fails closed. Projects configure `waste.operations` and Profile assignments. See `wasteVerification/test/wasteOperationalRolesContract.test.js` in the sibling module for denied-centre, explicit-deny and read-only auditor evidence.

`DefaultWasteAssetReversalOperationService` owns a linked REVERSAL event and an
optimistic asset lock for an approved completed sale refund. Only the original
latest buyer-held sale can be reversed automatically. The domain coordinator
supplies settlement acknowledgements; Waste never writes wallet balances. The
former digital owner is restored only after the payment refund completes, and
the original ownership event remains unchanged.

## Composed business navigation

`waste-operations` is the stable Waste Management anchor owned by `wasteCore`. It contains the three generic operational views. Domain subgroups must attach with `parentModuleName: wasteCore`; the contributor retains ownership. Generic keyed view defaults are under `waste.reviewWorkspace.views`. Core must not declare Electronics, Clothing or future accelerator views. Native renderer dispatch comes from the validated `backendWorkspace` contract; configuration routes keep real schema-workbench targets.

The BackOffice capability source lives under `data/backoffice/`, declared as `SOURCE_CONTRIBUTION` in the module manifest. It is projected by the existing capability provider and is not part of an executable core import.
