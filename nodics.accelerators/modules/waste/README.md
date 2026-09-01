# Waste Accelerator

The Waste accelerator is an umbrella for scenario-specific waste-management
accelerators built on `nodics.waste`.

`nodics.waste` provides the common framework foundation. Modules under this
umbrella provide readable, reusable presets for domains such as e-waste,
recycling, circular economy, battery waste, textile waste, and industrial waste.
Partner projects consume those presets and add their own policies, journeys,
branding, provider adapters, reward formulas, and seed data.

`eWaste` contributes reusable e-waste taxonomy and policy presets.
`wasteRecycling` contributes provider-neutral recycler/logistics handoff
contracts that connect Waste donation events to Movement and Compliance
references without owning any concrete provider integration.
`circa.eWaste` composes those contracts into the reusable Nodics Circa backend
application layer. The matching reusable frontend will live in `nodics.exp` as
`nodics.circa.eWaste`.

## Partner Customization

Projects customize Waste by adding later-loaded data releases that target
`nodics.waste` schemas with `destinationRole: "WASTE"`. Accelerator data
provides initial reusable presets; project data can add new codes or override
known codes by owning the later-loaded contribution.

Project-specific rewards, coupons, map providers, vendors, recycler adapters,
logistics adapters, and branded journeys belong in the project layer. The
accelerator stays reusable and only references common Waste schemas.

The reference flow is:

```text
nodics.waste
  -> nodics.accelerators/modules/waste
    -> modules/eWaste
    -> modules/wasteRecycling
    -> modules/circa.eWaste
      -> project overlay such as kickoffWaste
```

Runtime initialization must preserve that order. For Kickoff, the Waste server
loads Waste scenario accelerators first and `kickoffWaste:project-reference`
second so schema-driven project values can extend or intentionally override
accelerator presets.
