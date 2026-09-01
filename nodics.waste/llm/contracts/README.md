# Waste Contracts

- Waste owns reusable waste-domain meaning: material taxonomy, collection
  semantics, submission lifecycle, verification, receipt, impact profile/result,
  movement, and compliance evidence.
- Accepted material rules are authoritative. Collection point accepted-material
  summaries are projections only when used for search or display.
- Submission, receipt, impact, movement, and compliance are separate lifecycles.
- Waste must not create reward ledger entries, coupon records, Commerce orders,
  raw media assets, identity records, or map-provider state.
- Waste accelerators package industry presets above `nodics.waste`.
- Partner projects customize by extending accelerator/project schemas, policies,
  seed data, provider adapters, and journeys in later active modules.

## Reusable Ownership

Common frameworks remain outside Waste:

- Profile/Auth owns actors and authenticated submitter/verifier/recipient
  context.
- Media owns photo/document upload, storage, access, thumbnails, retention, and
  raw file security.
- Location owns coordinates, nearby search, map providers, visibility, and
  location approval.
- Loyalty/Wallet owns reward points, carbon credits, ledger, reserve, debit,
  transfer, reversal, expiry, and balance.
- Promotion/Coupon owns coupon marketplace listings, issuer enterprise, coupon
  entitlement, claim, and store/POS redemption.
- Commerce/Product owns product/listing projections, bids, orders, payment,
  settlement, and commerce lifecycle.
- BackOffice/Axis owns business-user management of schema-backed policy records.

Waste owns reusable waste-domain records and events only:

- submitted, suggested, confirmed, verified, received, moved, and
  compliance-linked waste facts
- evidence references to Media, not raw files
- approved/verified waste asset or certificate records that reference the
  originating submission, verification, evidence, and impact source
- asset lifecycle and transfer-policy schemas for sale, gift, donation,
  redemption, expiry, reward handling, carbon handling, approval, acceptance,
  and compliance-review requirements
- event contracts consumed by wallet, coupon, commerce, notification, reporting,
  and integration modules

All asset-transfer, marketplace-eligibility, reward-settlement, carbon-credit
settlement, and coupon-redemption settlement behavior must be data/policy driven
and manageable from Axis BackOffice. Default policies may ship from Waste
accelerators, but runtime behavior must not be hardcoded in `nodics.waste`.

## Approval To Asset

`wasteCore` owns the generic approval-to-asset contract:

- `wasteAssetCreationPolicy` decides when an approved submission can create an
  owned asset, including evidence, receipt, impact, duplicate, numbering, and
  settlement-reference failure rules.
- `DefaultWasteAssetCreationService` builds a `wasteAsset`, the initial
  `CREATE` ownership event, audit entries, and domain events from an approved
  submission.
- The service returns reward and carbon settlement references only. Wallet or
  Loyalty posts the actual reward/carbon ledger entries later.
- Marketplace/Product projection and coupon entitlement records remain optional
  references owned by Commerce/Product and Promotion/Coupon.
- The idempotency contract is source-submission based: repeating the same
  approved submission returns the existing asset when policy allows it.

## Marketplace Projection

Waste assets are sold through Commerce/Product, not by turning Waste into a
catalog owner:

- `wasteAssetMarketplaceProjection` stores the relationship between a
  `wasteAsset` and Commerce/Product listing records.
- Waste validates owner, asset status, custody status, compliance requirement,
  listing mode, visibility, and projection mode from
  `wasteMarketplaceEligibilityPolicy`.
- A projection request moves the Waste asset to `LISTING_REQUESTED` and emits a
  Commerce/Product request payload containing asset, owner, evidence, transfer,
  reward, and carbon policy references.
- Commerce/Product creates the sellable product/listing/bid/order records and
  calls Waste back with `commerceProductRef` or `commerceListingRef`.
- Completing the projection moves the Waste asset to `LISTED`. Closing a failed,
  cancelled, or expired projection returns the asset to `OWNED` or
  `LISTING_FAILED`.
- Waste must not own product names, prices, bid rules, orders, or payment
  settlement; it only owns asset state and the relationship reference.

## Sale Transfer

Commerce owns the sellable product/listing, bidding, order, payment, and
commercial settlement lifecycle. Waste reacts to Commerce callbacks through a
policy-driven asset transfer contract:

- Sale reservation requires a listed Waste asset, a listed marketplace
  projection, a buyer reference, and Commerce order/payment references.
- Reservation moves the Waste asset and projection to `SALE_PENDING` and emits
  ownership and settlement-intent references without mutating Wallet/Loyalty.
- Completion transfers Waste asset ownership to the buyer, marks the asset
  `SOLD`, marks the projection `SOLD`, and preserves reward/carbon behavior from
  transfer, reward-settlement, and carbon-settlement policies.
- Cancellation returns a pending sale to the policy-configured asset/projection
  status, normally `LISTED`.
- Reversal moves the sold asset back to the seller according to the
  policy-configured reversal status and emits reversal settlement references.
- Idempotency is driven by the Commerce order/idempotency reference so repeated
  callbacks do not create duplicate transfer events.
- Waste must not store price, bid rules, payment amount, coupon code, wallet
  balances, or wallet ledger entries in sale-transfer records.

## Gift Transfer

Gift is a customer-to-customer Waste asset ownership flow. It does not need a
Commerce product, listing, order, bid, or payment record:

- Gift request requires the current asset owner, receiver, and a `GIFT`
  transfer policy.
- Requesting a gift moves an `OWNED` or `LISTED` asset to `GIFT_PENDING` and
  emits `PENDING_ACCEPTANCE` ownership and settlement-intent references.
- Accepting a gift requires the configured receiver and moves ownership to the
  receiver with asset status `GIFTED`.
- Cancelling a pending gift returns the asset to the policy-configured
  cancellation status, normally `OWNED`.
- Reward and carbon transfer behavior comes from policy records and is emitted
  as Wallet/Loyalty settlement references only.
- Waste must not store Commerce price, bid, order, payment, coupon, wallet
  balance, or wallet ledger fields in gift-transfer records.

## Donation And Recycling Transfer

Donation/recycling is a Waste asset transfer flow that may hand ownership or
physical custody to a recycler, donation program, enterprise, or policy-resolved
counterparty:

- Donation request requires the current asset owner, receiver/recycler
  reference, and a `DONATE` transfer policy.
- The transfer policy controls eligible asset statuses, owner approval,
  receiver acceptance, receipt confirmation, compliance-review requirement,
  completion asset status, completion custody status, cancellation status, and
  reward/carbon settlement modes.
- Requesting donation moves an eligible asset to `DONATION_PENDING` and emits a
  `PENDING_ACCEPTANCE` ownership event plus settlement-intent references.
- Completion requires the configured receiver and, when policy requires them,
  `movementRef` and `complianceEvidenceRef` references. It moves the asset to
  the policy-configured status, normally `DONATED`, and the configured custody
  status, normally `TRANSFERRED_TO_RECYCLER`.
- Cancelling a pending donation returns the asset to the policy-configured
  cancellation status, normally `OWNED`.
- Waste must not own logistics providers, recycler adapters, shipment tracking
  numbers, certificates, wallet balances, reward ledger entries, or carbon
  ledger entries. It stores references for those owners to reconcile.

## Coupon Redemption

Coupon redemption lets a customer use the reward/carbon value attached to an
approved Waste asset to request a customer-owned coupon entitlement:

- Redemption request requires the current asset owner, a Promotion/Coupon
  listing reference, a `REDEEM` transfer policy, and a
  `wasteCouponRedemptionSettlementPolicy`.
- The redemption policy controls eligible asset statuses, reward debit mode,
  reward reservation requirement, carbon receiver mode, carbon transfer quantity
  mode, and entitlement mode.
- Requesting redemption moves an eligible asset to `REDEMPTION_PENDING`, emits
  reward debit and carbon transfer settlement-intent references, and emits a
  Promotion/Coupon entitlement request.
- Completion requires a Promotion/Coupon-owned entitlement reference, records
  that reference on the Waste asset, and moves the asset to `REDEEMED`.
- Cancellation returns a pending redemption to the transfer-policy configured
  cancellation status, normally `OWNED`.
- Waste must not create coupon codes, coupon tokens, coupon claim records,
  wallet balances, reward ledger entries, carbon ledger entries, store/POS
  claims, product pricing, or payment records.
