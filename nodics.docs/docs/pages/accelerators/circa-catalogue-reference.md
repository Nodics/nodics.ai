# Circa Store, Product, Price and Coupon Record Reference

This page lists the current authored catalogue rather than only explaining the
shopping flow. Beginners should read it alongside the purchase journey: a Product
name, a Price row and a Promotion action are different records. The business and
operator value is being able to reconcile what a customer sees with the actual
configured price, supply and eligibility before a programme is published.

## Store, warehouse and price book

The business decision is whether an authored offer is ready to sell. Product
copy, price, inventory and executable benefit conditions must agree; a sample
title alone is not evidence of an enforceable discount.

There is one Circa-authored Store, `circaMainStore`, named Circa eWaste. It declares
tenant default, enterpriseCode default, revision 1, ACTIVE status, active true,
defaultCurrency POINTS, defaultLocale en and timezone Asia/Dubai. The selected
authoring catalogVersion is circaStaged. The marketplace selects price book
circaPointsPriceBook and warehouse circaDigitalRegistry. The digital registry is
not a declaration of physical stock availability or delivery operations.

These are source identities and should not be renamed while upgrading an installed
programme. A fresh adopter can select its own approved store and programme through
custom data/configuration. Price currency POINTS does not establish an AED exchange
rate, carbon price or cash settlement policy.

## All eight source products and prices

| Product code | Authored name | unitAmount POINTS | Source availability |
| --- | --- | ---: | ---: |
| CIRCA_ASSET_EWA-1047 | Damaged ThinkPad T480 | 34 | 1 |
| CIRCA_ASSET_EWA-1051 | Office LED Monitor | 26 | 1 |
| CIRCA_ASSET_EWA-1052 | Home Wi-Fi Router | 16 | 1 |
| CIRCA_ASSET_EWA-1055 | Compact Digital Camera | 20 | 1 |
| CIRCA_ASSET_EWA-1092 | Mesh Router Pair | 16 | 1 |
| CIRCA_COUPON_CPN-GRN-30 | AED 30 repair credit | 14 | 50 |
| CIRCA_COUPON_CPN-ECO-15 | 15% recycled accessories offer | 9 | 50 |
| CIRCA_COUPON_CPN-SVC-50 | AED 50 device diagnosis | 20 | 50 |

Every Product declares DIGITAL and fulfillmentStrategy DIGITAL_COMMERCE. The
three coupon products additionally declare digitalDeliveryType COUPON_CODE. Asset
products use category circaAssets, coupon products circaCoupons. Exact current
availability comes from the owner, not the opening values in this table.

The product code maps to variant code `<product>_VARIANT`, SKU `<product>_SKU`
and price row `<product>_POINTS`. Price rows reference circaPointsPriceBook,
productCode, unitAmount as a decimal string, currency POINTS and minQuantity "1".
Product and variant localized content has English and Arabic rows. Missing offer
terms must not be invented from a product title.

## Inventory and coupon pool

Inventory code is `circaDigitalRegistry:<SKU>`, with warehouseCode, sku, onHand,
reserved, allocated, available and priority. The five source asset rows have
onHand/available "1", reserved/allocated "0". The three coupon rows have
onHand/available "50", reserved/allocated "0", inventoryStrategy COUPON_CODE_POOL,
digitalDeliveryType COUPON_CODE and explicit promotionCode/couponBatchCode.

For each coupon product prefix, the promotion code is `<product>_PROMO` and batch
code `<product>_BATCH`. Each batch declares issuedCount 50, reservedCount 0, ACTIVE,
tokenHashPolicy TENANT_UPPERCASE_SHA256 and sourceReference equal to the product code.
There are 150 authored coupon-unit records across three batches. Batch issuedCount
is pool issuance, not 150 completed customer purchases. Do not expose raw sample
tokens/hash details in public documentation or browser catalogue data.

## Promotion actions versus title claims

| Promotion suffix/product | validFrom | validTo | Authored action |
| --- | --- | --- | --- |
| CPN-GRN-30 | 2026-01-01 | 2026-12-31 23:59:59Z | AMOUNT, discountValue "1", discountAmount "1" |
| CPN-ECO-15 | 2026-01-01 | 2026-11-15 23:59:59Z | AMOUNT, discountValue "1", discountAmount "1" |
| CPN-SVC-50 | 2026-01-01 | 2027-01-20 23:59:59Z | AMOUNT, discountValue "1", discountAmount "1" |

All three are ACTIVE, revision 1, priority 25, with couponRequired and
customerOwnsCouponCode true, sourceProductCode matching the product, reasonCode
CIRCA_SAMPLE_OFFER and budget limit "1000"/spent "0". The authored dates are fixed
campaign dates, not purchase-relative expiry.

Important limitation: the title "15%" does not make the source action PERCENT;
the "AED 30"/"AED 50" names do not make the configured action 30/50 AED. These are
illustrative sample records with a nominal one-unit action. Do not sell them as a
qualified real benefit, infer settlement from their names or silently change old
issued rights. Production benefit validation and approved seller/outlet contracts
are separate required implementation/acceptance.

## What is not configured by this source catalogue

The three Promotion conditions contain no explicit storeCodes list, minimum-spend
receipt evidence, percentage cap or item/bundle fulfillment rule. The Store is
online browsing/purchase context, not a record of two new physical redemption outlets.
No source declaration here establishes the prepared GreenPerks network. Parent-child
enterprises cannot fill those missing commercial/outlet relationships automatically.

The separately staged purchased-rights capability remains disabled/unqualified by
default. Its policy can retain purchase-relative terms/expiry when qualified; it
does not retroactively convert these source campaign dates into 30 days after every
purchase. Preserve legacy compatibility and approved terms through owner operations.

## Customize and extend safely

A developer authors a new product/variant, price, inventory pool, batch and Promotion
policy in a custom backend release, keeping exact cross-references. For example,
add a new named repair benefit with approved currency/rate, eligible outlets and
enforceable receipt policy; do not merely change the display title to a richer offer.
Validate/approve Commerce Staged, then publish its projection independently of WCMS.

Reject missing variant/price, invalid currency, exhausted pool, wrong owner/outlet,
unsupported condition or incomplete persistence evidence. Recovery uses original
checkout/order keys and qualified owner compensation, not fresh purchases or raw
database edits. Test default and custom layers, price changes, fixed/retained expiry,
pool exhaustion, double redemption, terms display and interrupted reversal.

## Common mistakes

Assuming a title defines mathematical benefit; treating inventory opening values as
live stock; exposing coupon tokens; reporting the planned 35 offers as installed;
and publishing a website instead of the Commerce projection are incorrect.
Local sample stock is not a vendor promise or production acceptance.

## Verification

Counts and exact values come from Circa commerce Product, Variant, PriceRow,
InventoryBalance, CouponBatch and Promotion source files. No current customer
purchase, code or wallet was inspected. Operators and DevOps reconcile installed
receipt/version and owner projections before any import or commercial activation.
See [purchase journey](circa-coupons-commerce.md), [inventory](circa-source-inventory.md)
and [customization](circa-customization.md).
