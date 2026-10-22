/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module promotion/data/backoffice/couponOfferPresentation @description Declarative workspace copy and choices; source contribution only, never an executable import or grant. @owner promotion */
module.exports = {
    "contractVersion": 1,
    "labels": {
        "title": "Coupon offers",
        "code": "Offer code",
        "name": "Offer name",
        "product": "Source Product code",
        "inspect": "Inspect offer",
        "prefill": "New from existing",
        "create": "Create offer",
        "saveName": "Save name",
        "benefit": "Benefit",
        "value": "Benefit value",
        "item": "Item SKU",
        "itemQuantity": "Item quantity",
        "unlimited": "Unlimited supply",
        "supply": "Total supply",
        "capped": "Lifetime owner limit",
        "ownerLimit": "Maximum per owner",
        "noExpiry": "No expiry",
        "expiry": "Fixed expiry (UTC)",
        "requirements": "Purchase requirements",
        "price": "Pricing reference",
        "certificates": "Certificate quantity",
        "category": "Certificate category",
        "milestone": "Required milestone",
        "brands": "Accepted brand codes",
        "models": "Accepted model codes",
        "stores": "Eligible Store codes",
        "allStores": "All eligible Stores",
        "terms": "Terms",
        "review": "Review new offer",
        "confirm": "Confirm creation",
        "cancel": "Cancel",
        "created": "Offer created",
        "immutable": "Saved benefits, requirements, supply and expiry are immutable.",
        "uncertain": "The result is unconfirmed. Inspect the original offer code before another command.",
        "reportTitle": "Coupon acquisition",
        "channel": "Channel code",
        "issuer": "Issuer activity",
        "redeemer": "Redeemer acquisition",
        "loadReport": "Refresh report",
        "exportReport": "Export aggregate",
        "protected": "Protected",
        "unknown": "Unknown",
        "purchases": "Purchases",
        "redemptions": "Redemptions",
        "newThroughChannel": "New through this channel",
        "returningThroughChannel": "Returning through this channel",
        "dataUpdatedThrough": "Data updated through",
        "fromDate": "From date (UTC)",
        "toDate": "Before date (UTC)",
        "scopeType": "Reporting scope",
        "scopeCode": "Scope code",
        "enterpriseScope": "Enterprise",
        "outletScope": "Outlet",
        "groupScope": "Enterprise group",
        "breakdown": "Breakdown",
        "noBreakdown": "Total",
        "dayBreakdown": "UTC day",
        "issuances": "Issued units",
        "distinctOwners": "Redeeming owners",
        "redemptionRate": "Purchased cohort redeemed (%)",
        "newThroughChannelRate": "New through channel (%)",
        "returningThroughChannelRate": "Returning through channel (%)",
        "unknownRate": "Unknown cohort (%)",
        "numerator": "Numerator",
        "denominator": "Denominator",
        "percent": "Percent",
        "reportDimension": "Dimension"
    },
    "benefitOptions": [
        {
            "value": "PERCENT",
            "label": "Percentage discount"
        },
        {
            "value": "FIXED",
            "label": "Fixed discount"
        },
        {
            "value": "ITEM",
            "label": "Item benefit"
        }
    ],
    "requirementOptions": [
        {
            "value": "REWARDS",
            "label": "Rewards"
        },
        {
            "value": "CERTIFICATES",
            "label": "Certificates"
        },
        {
            "value": "BOTH",
            "label": "Rewards and certificates"
        }
    ]
};
