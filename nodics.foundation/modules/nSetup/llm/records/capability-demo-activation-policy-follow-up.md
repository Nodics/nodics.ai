# Capability Demo Activation Policy Follow-Up

## Recorded Action

Decide and document how optional business capabilities participate in default demo activation. The reference project currently needs Waste enabled to demonstrate collection centres, but reusable framework modules must remain optional and independently composable.

## Migration Target

- Define whether `nodics.waste` is enabled by default in the local demo profile or activated explicitly through BackOffice.
- Ensure capability-owned enterprise seed data is imported only when the owning capability is selected.
- Keep `default` enterprise globally available as the platform owner baseline.
- Keep `NODICS_WASTE_MANAGEMENT_CO` under Waste Core and `NODICS_REWARDS_MARKETPLACE_CO` under Loyalty Core.
- Avoid creating capability-specific enterprises when the project has not selected that capability.

## Status

Implemented for Kickoff Local. Waste remains optional in Platform active modules, while BackOffice activation declares the Waste-to-Location dependency and imports Waste-owned Profile enterprise data when the capability is selected.
