# Nodics Circa Application Contract

**Nodics Circa** is the reusable customer-facing application experience for
e-waste and circular asset journeys.

Circa composes reusable Nodics frameworks. It must not become the owner of Waste
truth, wallet ledger, coupon, commerce, media, location, or customer-project
policy records.

## Application Responsibilities

Circa owns reusable customer experience contracts for:

- creating e-waste submissions with photos, description, quantity or weight,
  category or item type, condition, and preferred collection point when
  available
- showing staged, submitted, approved, rejected, received, and
  impact-calculated submission states
- showing approved customer-owned waste assets and certificate-style evidence
- showing reward-point and carbon-credit wallet projections without owning the
  ledger
- starting sell, gift, donate, redeem, and coupon-purchase flows when policy
  allows them
- surfacing coupon marketplace offers and customer-owned coupon entitlements
  through Promotion/Coupon contracts

## Ownership Boundaries

Circa does not own:

- `nodics.waste` taxonomy, submission truth, verification, receipt, impact,
  movement, compliance, or approved asset records
- Media upload, file storage, thumbnails, secure access, retention, or raw
  photo/document records
- Wallet/Loyalty reward points, carbon credits, reserve, debit, transfer,
  reversal, expiry, or balance
- Promotion/Coupon coupon listings, issuer enterprise rules, coupon entitlement,
  coupon claim, or store/POS redemption
- Commerce/Product listings, bids, orders, payment, settlement, or fulfillment
- Location/map coordinates, geocoding, nearby search, visibility, or map-provider
  state
- customer-project-specific branding, campaign copy, partner contracts, provider
  secrets, or regulatory certification claims

## Policy Rule

Marketplace eligibility, asset transfer, reward settlement, carbon-credit
settlement, and coupon-redemption settlement behavior must resolve from
schema-backed policy records that business users can manage in Axis BackOffice.

Default e-waste policies may ship with the `eWaste` accelerator, but Circa must
not hardcode sale, gift, donation, reward consumption, carbon transfer, coupon
purchase, issuer-enterprise settlement, or default-enterprise settlement
behavior.

Before implementation, use `circa-reusable-backlog.md` as the roadmap for
asset, wallet, marketplace, coupon, customer experience, governance, security,
compliance, and operational requirements.
