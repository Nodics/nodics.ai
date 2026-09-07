# Axis Location And Waste Live Smoke Follow-Up

## Recorded Action

Add repeatable browser-level smoke coverage for Axis Location and Waste views once runtime orchestration is stable. The smoke should verify the operator can navigate to collection centres, inspect map/table/detail content, and traverse from a collection centre operator enterprise to the enterprise relationship view.

## Migration Target

- Cover `/waste/collection-centres` with live API data from Waste, Location, Profile Address, and Profile Enterprise.
- Cover `/enterprises/NODICS_WASTE_MANAGEMENT_CO` with reverse relationship traversal for collection centres.
- Treat unavailable optional Promotion/Coupon services as nonfatal unless their capability is activated in the topology being tested.
- Keep the smoke outside reusable backend contracts; it validates the integrated Axis/reference-runtime experience.
- Capture evidence using the governed API and browser route behavior, not direct database reads.

## Status

Completed. The opt-in smoke coverage now validates the Waste collection-centre route, active navigation discovery, composed Location coordinates, and absence of unavailable composed sources. The page was also browser-verified through the Axis left navigation by expanding Sustainability Operations and opening Collection Centres; the rendered page showed 14 centres and 14 visible map markers.
