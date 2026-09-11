# Waste Accelerator Contracts

- This umbrella is composition-only.
- `nodics.waste` owns common records, lifecycle services, API contracts, and
  events.
- Scenario accelerators under this group contribute data-driven presets into
  `nodics.waste` schemas.
- Partner projects must customize above scenario accelerators, not by changing
  this umbrella or `nodics.waste`.
- Partner project customization must follow `partner-customization.md`.

## Accelerator Scope

The Waste accelerator umbrella owns reusable composition rules for all waste
scenario accelerators:

- scenario accelerator folder governance, naming, load order, and readable
  grouping under the Waste accelerator
- initial-data packaging conventions for scenario reference releases
- shared fixtures proving `nodics.waste` -> scenario accelerator -> later
  project overlay behavior
- common default policy templates for approved waste assets, marketplace
  eligibility, transfer behavior, donation/recycling completion, reward/carbon
  settlement hooks, and coupon redemption settlement hooks
- documentation for how Media, Location, Wallet/Loyalty, Promotion/Coupon, and
  Commerce/Product consume Waste references and events without moving their
  ownership into Waste

Scenario accelerators such as `eWaste` may provide reusable domain-specific
families, categories, item types, materials, evidence policies, collection
presets, acceptance rules, impact profiles, asset-policy defaults, transfer
defaults, and coupon-redemption settlement defaults. They remain project-neutral; their services compose owning framework operations
without defining duplicate schemas or ledgers.

Scenario accelerators such as `wasteRecycling` may provide reusable
provider-neutral handoff contracts for recycler/logistics journeys. They may
shape movement intents and donation-completion payloads, but provider adapters,
credentials, tracking identifiers, certificates, and callbacks remain owned by
project modules or later provider-specific accelerators.

Keep one accelerator per domain. eWaste owns reusable electronic-waste journeys
alongside its presets. Application identity, branded site composition, site-form
adapters and deployment policy belong in customer modules above that accelerator.
Do not create a sibling application-named accelerator for the same domain.
