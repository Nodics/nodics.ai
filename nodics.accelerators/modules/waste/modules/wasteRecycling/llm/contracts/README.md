# Waste Recycling Contracts

`wasteRecycling` bridges Waste asset donation/recycling decisions to operational
handoff contracts:

- `nodics.waste` owns the asset, donation transfer state, movement references,
  and compliance evidence references.
- `wasteMovement` owns movement records such as pickup, transfer, recycler
  receipt, and disposal.
- `wasteCompliance` owns compliance evidence records and decision/provenance
  references.
- Provider adapters, credentials, tracking identifiers, certificates, external
  callbacks, and recycler execution belong to project modules or later provider
  accelerators.

The accelerator may create provider-neutral handoff intents and normalize
provider completion callbacks into references that can be passed to the Waste
donation completion contract. It must never mutate Wallet/Loyalty ledgers or
store provider secrets.
