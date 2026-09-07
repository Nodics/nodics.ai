# Nodics Circa Application Contract

**Nodics Circa** is the reusable customer-facing application experience for
e-waste and circular asset journeys.

Circa composes reusable Nodics frameworks. It must not become the owner of Waste
truth, wallet ledger, coupon, commerce, media, location, or customer-project
policy records.

## Application Responsibilities

Circa owns reusable customer experience contracts for:

- presenting a public single-page Circa site that explains the business idea,
  customer participation model, environmental outcome, customer benefit, trust
  model, eligibility, and support path
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
- showing customer asset dashboard listings, filters, detail pages, and
  policy-driven asset actions
- showing tradeable approved assets in Circa Shop through Product/Commerce
  listing projections
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

## Public Customer Journey

The first-time visitor lands on a single-page public Circa experience. The page
must explain what Circa is, what problem it solves, how e-waste submission
works, how customers participate, what environmental difference they make, how
they benefit, and where they can get help.

The primary navigation must include:

- `Submit Waste`
- `Find Collection Center`
- `Shop`
- `Help`

`Submit Waste` opens the guided e-waste journey. The user is asked to login
with username or email and password. A new customer registration asks only for
email, name, and password, then registers and logs in the customer. OTP remains
deferred and must not be forced into the MVP journey.

After login, Circa shows a conversational submission UI. Before asking for an
image, Circa requests or confirms customer location and checks for nearby
collection centers through Location/Waste Collection contracts. If no collection
center is nearby, Circa shows visible collection centers and a motivational
message asking the customer to reach out or visit an available center.

When location is confirmed, the customer can capture a photo with camera or
upload a file. AI extracts suggested metadata from the image and Circa shows a
minimal confirmation summary:

- generated item name
- e-waste type, category, family, or material
- estimated reward points
- estimated carbon credits
- customer and environmental benefit summary

These values are estimates until admin approval. When the customer confirms,
Circa creates the submission, sends it for approval, and shows an under-approval
message explaining that the customer will be notified.

## Admin Approval Journey

Axis BackOffice must expose a separate waste asset/submission review section for
business users. Admin lists are status-driven and should include:

- `Pending Review`
- `Approved Assets`
- `Rejected Assets`
- `Needs More Info` when policy enables it

From a submitted asset, the business user can open the detail page, view the
original customer evidence, AI-extracted data, customer-submitted fields,
collection-center context, impact estimates, policy matches, and audit history.
The business user can update the final verified data and then approve or reject
the submission.

Approval creates or updates the customer-owned asset, triggers wallet settlement
for reward points and carbon credits through Loyalty/Wallet contracts, and sends
an approval notification. Rejection requires a reason and sends a rejection
notification to the customer.

Original photo/evidence and raw AI output are immutable evidence. Admin final
data is a verified overlay with audit history, not a silent overwrite.

## Customer Asset Dashboard

After login, customers have a dashboard where they can see their own submitted
and approved assets. The dashboard should behave like a product-listing style
component while keeping the domain object as a waste asset.

Customer dashboard filters should support:

- approval status
- ownership status
- tradeability status
- family, category, material, and item type
- collection center or region
- reward-point range
- carbon-credit range
- submission date
- verification result

Asset cards should show the image thumbnail, verified or generated item name,
status, category/material, reward-point summary, carbon-credit summary,
submission date, and available primary action.

Clicking an asset opens the asset detail page. The detail page shows the image,
status, ownership badge, reward and carbon summary, original evidence,
AI-suggested data, admin-verified data, notifications, wallet references,
ownership history, and available actions.

For approved assets, policy may enable:

- trade or list for sale
- gift
- donate or recycle
- redeem rewards for coupon
- view ownership and wallet history
- view verification certificate/evidence

Wallet balance and ledger truth remain owned by Loyalty/Wallet. Circa only shows
wallet projections and transaction references.

## Circa Shop Journey

When a customer marks an approved asset as tradeable, Waste validates ownership
and policy eligibility, creates or requests a Product/Commerce projection, and
stores the projection reference. The waste asset moves to listed status and the
projected item appears in Circa `Shop`.

Circa `Shop` shows all tradeable approved assets using Product/Commerce listing
contracts. Listing, bid, cart, order, payment, and sale completion remain owned
by Product/Commerce. Waste owns the asset lifecycle and ownership transition.

Shop cards should show asset image, verified name, category/material, carbon
credits attached, asking reward points or bid state, seller display name or
masked identity, collection/transfer mode, and verification badge.
