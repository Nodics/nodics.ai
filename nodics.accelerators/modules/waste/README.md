# Waste Accelerator

The Waste accelerator is an umbrella for scenario-specific waste-management
accelerators built on `nodics.waste`.

`nodics.waste` provides the common framework foundation. Modules under this
umbrella provide readable, reusable presets for domains such as e-waste,
recycling, circular economy, battery waste, textile waste, and industrial waste.
Partner projects consume those presets and add their own policies, journeys,
branding, provider adapters, reward formulas, and seed data.

`eWaste` contributes reusable e-waste taxonomy, policy presets and domain journey orchestration.
`wasteRecycling` contributes provider-neutral recycler/logistics handoff
contracts that connect Waste donation events to Movement and Compliance
references without owning any concrete provider integration.
Application branding, website composition and deployment-specific adapters belong
in customer backend modules. Circa consumes eWaste through its customer module
and the separate `nodics.circa.eWaste` frontend.

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
      -> customer backend overlay and application composition
```

Runtime initialization must preserve that order. For Kickoff, the Waste server
loads Waste scenario accelerators first and `kickoffWaste:project-reference`
second so schema-driven project values can extend or intentionally override
accelerator presets.


## Domain accelerator discovery

Waste domain accelerators are ordinary Nodics capability modules discovered and
composed through the existing module loader, `nodics.extends`, runtime module
roots, and layered data releases. There is no separate Waste-specific accelerator
registry.

The generic `wasteFamily` taxonomy is the domain/family identity used by Waste
records. Accelerator modules add owned presets, providers, policies, navigation
and journey orchestration for selected families without creating duplicate
schemas. Before adding a domain registry, domain schema, or accelerator discovery
mechanism, review the existing Waste taxonomy and standard Nodics module
composition and prove a concrete gap.
