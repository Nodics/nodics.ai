# Circa eWaste

`circa.eWaste` is the reusable backend application-composition module for
**Nodics Circa** e-waste journeys.

It composes `nodics.waste`, `eWaste`, and `wasteRecycling` contracts into
customer-facing use cases such as submission, approved asset dashboard,
marketplace listing, gift, donation/recycling, coupon redemption, and wallet
projection references.

It does not own Waste schemas, wallet ledgers, Commerce/Product catalog,
Promotion/Coupon entitlements, Media files, Location providers, recycler
adapters, or project branding. Partner projects extend this module with project
journeys, policy binding, providers, and content in later-loaded project
modules.
