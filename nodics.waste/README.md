# Nodics Waste

`nodics.waste` is the common Nodics Waste Management framework capability. It
provides generic waste-domain contracts for taxonomy, collection points,
accepted material rules, submissions, evidence links, verification, receipt,
impact, downstream movement, and compliance evidence.

The group is intentionally independent of accelerators and partner projects.
Waste accelerators can package e-waste, recycling, circular-economy, ESG, and
collection-program presets above this common layer. A partner project such as
I2E can then extend the accelerator with project categories, earning policy,
campaign rules, app journeys, and provider adapters without changing the
out-of-the-box Waste framework source.

Location, Loyalty, Commerce, Profile, Media, Notification, Workflow, and
provider integrations remain separate owners. Waste emits and stores operational
facts; other capabilities decide map rendering, rewards, products, actors,
documents, notifications, durable workflow, and external integration.

`wasteCore` publishes the Waste Management BackOffice capability metadata for
Axis discovery. The metadata exposes schema-workbench navigation for taxonomy,
collection rules, submissions, verification, receipts, impact, customer-owned
assets, policy records, movement, and compliance evidence while preserving
`waste.backoffice.view` permission filtering. It does not add frontend screens
or make BackOffice a proxy for Waste business APIs.

Approved submissions can become customer-owned `wasteAsset` records through a
schema-driven `wasteAssetCreationPolicy`. Waste creates the asset contract,
initial ownership event, audit entries, and outbox event payloads; Wallet,
Commerce/Product, and Promotion/Coupon still own ledger posting, marketplace
listing, bidding, coupon entitlement, and POS claim behavior.

When a customer lists an asset for sale, Waste creates a
`wasteAssetMarketplaceProjection` relationship request. Commerce/Product owns
the resulting product, listing, bid, order, and payment lifecycle; Waste stores
only the projection reference and advances asset status when Commerce confirms,
cancels, fails, expires, or sells the listing.

Commerce sale callbacks then reserve, complete, cancel, or reverse Waste asset
ownership through policy-driven `wasteAssetTransferPolicy` rules. Reward points
and carbon credits are emitted as Wallet/Loyalty settlement references, never as
embedded balances or ledger mutations inside Waste.

Customer-to-customer gifts use the same policy model without Commerce
involvement: Waste moves assets through `GIFT_PENDING` and `GIFTED`, while
reward and carbon movement remains Wallet/Loyalty-owned settlement work.

Donation/recycling uses `DONATE` transfer policies to move assets through
`DONATION_PENDING` and policy-configured completion states such as `DONATED`
and `TRANSFERRED_TO_RECYCLER`. Waste references movement and compliance
evidence, while logistics, recycler execution, certificates, and wallet ledgers
remain with their owning frameworks or accelerators.

Coupon redemption uses `wasteCouponRedemptionSettlementPolicy` to reserve or
debit reward value, route carbon value to the configured enterprise, and request
a Promotion/Coupon-owned customer entitlement. Waste records only the asset
state, settlement references, and entitlement reference.
