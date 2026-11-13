/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module circa.ewaste/data/sample-v001/commerce/records/circaPromotionData.js
 * @description Supplies the unified Circa customer demonstration dataset through canonical owner imports.
 * @layer data
 * @owner circa.ewaste
 * @override Author a successor release for customer-specific sample data; preserve installed transactions.
 */
module.exports = {
  "record0": {
    "tenant": "default",
    "enterpriseCode": "RENEWWORKS_REPAIR_REUSE",
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_CPN-GRN-30_PROMO",
    "name": "AED 30 repair credit",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_CPN-GRN-30",
      "storeCodes": [
        "renewworks-repair"
      ]
    },
    "actions": {
      "discountType": "AMOUNT",
      "discountValue": "30",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "discountAmount": "30"
    },
    "budget": {
      "limit": "3000"
    },
    "validFrom": "2026-01-01T00:00:00.000Z",
    "validTo": "2026-12-31T23:59:59.000Z",
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "RENEWWORKS_REPAIR_REUSE"
    },
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "RENEWWORKS_REPAIR_REUSE"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "couponOffer": {
      "version": 1,
      "expiryReminderEnabled": true,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_CPN-GRN-30_POINTS"
      },
      "terms": [
        "Redeem AED 30 repair credit once at renewworks-repair.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value."
      ]
    }
  },
  "record1": {
    "tenant": "default",
    "enterpriseCode": "LOOPCYCLE_RECYCLING",
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_CPN-ECO-15_PROMO",
    "name": "15% recycled accessories offer",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_CPN-ECO-15",
      "storeCodes": [
        "loopcycle-accessories"
      ]
    },
    "actions": {
      "discountType": "PERCENT",
      "discountValue": "15",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "percent": "15",
      "maximumDiscountAmount": "30"
    },
    "budget": {
      "limit": "3000"
    },
    "validFrom": "2026-01-01T00:00:00.000Z",
    "validTo": "2026-11-15T23:59:59.000Z",
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "LOOPCYCLE_RECYCLING"
    },
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "LOOPCYCLE_RECYCLING"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_CPN-ECO-15_POINTS"
      },
      "terms": [
        "Redeem 15% recycled accessories offer once at loopcycle-accessories.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value."
      ]
    }
  },
  "record2": {
    "tenant": "default",
    "enterpriseCode": "RENEWWORKS_REPAIR_REUSE",
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_CPN-SVC-50_PROMO",
    "name": "AED 50 device diagnosis",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_CPN-SVC-50",
      "storeCodes": [
        "renewworks-repair"
      ]
    },
    "actions": {
      "discountType": "AMOUNT",
      "discountValue": "50",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "discountAmount": "50"
    },
    "budget": {
      "limit": "5000"
    },
    "validFrom": "2026-01-01T00:00:00.000Z",
    "validTo": "2027-01-20T23:59:59.000Z",
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "RENEWWORKS_REPAIR_REUSE"
    },
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "RENEWWORKS_REPAIR_REUSE"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_CPN-SVC-50_POINTS"
      },
      "terms": [
        "Redeem AED 50 device diagnosis once at renewworks-repair.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value."
      ]
    }
  },
  "record3": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-C01_PROMO",
    "name": "Espresso - Hills Cafe",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-C01",
      "storeCodes": [
        "greenperks-cafe"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Espresso",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_ESPRESSO",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-C01_POINTS"
      },
      "terms": [
        "Redeem Espresso once at GreenPerks Hills Cafe.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record4": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-C02_PROMO",
    "name": "Americano - Hills Cafe",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-C02",
      "storeCodes": [
        "greenperks-cafe"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Americano",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_AMERICANO",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-C02_POINTS"
      },
      "terms": [
        "Redeem Americano once at GreenPerks Hills Cafe.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record5": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-C03_PROMO",
    "name": "Cappuccino - Hills Cafe",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-C03",
      "storeCodes": [
        "greenperks-cafe"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Cappuccino",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_CAPPUCCINO",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-C03_POINTS"
      },
      "terms": [
        "Redeem Cappuccino once at GreenPerks Hills Cafe.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record6": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-C04_PROMO",
    "name": "Latte - Hills Cafe",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-C04",
      "storeCodes": [
        "greenperks-cafe"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Latte",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_LATTE",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-C04_POINTS"
      },
      "terms": [
        "Redeem Latte once at GreenPerks Hills Cafe.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record7": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-C05_PROMO",
    "name": "Tea - Hills Cafe",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-C05",
      "storeCodes": [
        "greenperks-cafe"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Tea",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_TEA",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-C05_POINTS"
      },
      "terms": [
        "Redeem Tea once at GreenPerks Hills Cafe.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record8": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-C06_PROMO",
    "name": "Iced coffee - Hills Cafe",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-C06",
      "storeCodes": [
        "greenperks-cafe"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Iced coffee",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_ICED_COFFEE",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-C06_POINTS"
      },
      "terms": [
        "Redeem Iced coffee once at GreenPerks Hills Cafe.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record9": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-C07_PROMO",
    "name": "Croissant - Hills Cafe",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-C07",
      "storeCodes": [
        "greenperks-cafe"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Croissant",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_CROISSANT",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-C07_POINTS"
      },
      "terms": [
        "Redeem Croissant once at GreenPerks Hills Cafe.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record10": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-C08_PROMO",
    "name": "Muffin - Hills Cafe",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-C08",
      "storeCodes": [
        "greenperks-cafe"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Muffin",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_MUFFIN",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-C08_POINTS"
      },
      "terms": [
        "Redeem Muffin once at GreenPerks Hills Cafe.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record11": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-C09_PROMO",
    "name": "Cookie pair - Hills Cafe",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-C09",
      "storeCodes": [
        "greenperks-cafe"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Cookie pair",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_COOKIE",
          "quantity": 2,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-C09_POINTS"
      },
      "terms": [
        "Redeem Cookie pair once at GreenPerks Hills Cafe.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record12": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-C10_PROMO",
    "name": "Coffee and croissant - Hills Cafe",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-C10",
      "storeCodes": [
        "greenperks-cafe"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Coffee and croissant",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_AMERICANO",
          "quantity": 1,
          "unit": "EACH"
        },
        {
          "sku": "GP_CROISSANT",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-C10_POINTS"
      },
      "terms": [
        "Redeem Coffee and croissant once at GreenPerks Hills Cafe.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record13": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-C11_PROMO",
    "name": "Tea and cake slice - Hills Cafe",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-C11",
      "storeCodes": [
        "greenperks-cafe"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Tea and cake slice",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_TEA",
          "quantity": 1,
          "unit": "EACH"
        },
        {
          "sku": "GP_CAKE_SLICE",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-C11_POINTS"
      },
      "terms": [
        "Redeem Tea and cake slice once at GreenPerks Hills Cafe.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record14": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-C12_PROMO",
    "name": "Breakfast sandwich and coffee - Hills Cafe",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-C12",
      "storeCodes": [
        "greenperks-cafe"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Breakfast sandwich and coffee",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_BREAKFAST_SANDWICH",
          "quantity": 1,
          "unit": "EACH"
        },
        {
          "sku": "GP_AMERICANO",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-C12_POINTS"
      },
      "terms": [
        "Redeem Breakfast sandwich and coffee once at GreenPerks Hills Cafe.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record15": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-B01_PROMO",
    "name": "Soup of the day - Hills Bistro",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-B01",
      "storeCodes": [
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Soup of the day",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_VEGETABLE_SOUP",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-B01_POINTS"
      },
      "terms": [
        "Redeem Soup of the day once at GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record16": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-B02_PROMO",
    "name": "Side salad - Hills Bistro",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-B02",
      "storeCodes": [
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Side salad",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_SIDE_SALAD",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-B02_POINTS"
      },
      "terms": [
        "Redeem Side salad once at GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record17": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-B03_PROMO",
    "name": "Starter plate - Hills Bistro",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-B03",
      "storeCodes": [
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Starter plate",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_STARTER_PLATE",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-B03_POINTS"
      },
      "terms": [
        "Redeem Starter plate once at GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record18": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-B04_PROMO",
    "name": "Sandwich - Hills Bistro",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-B04",
      "storeCodes": [
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Sandwich",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_SANDWICH",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-B04_POINTS"
      },
      "terms": [
        "Redeem Sandwich once at GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record19": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-B05_PROMO",
    "name": "Pasta dish - Hills Bistro",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-B05",
      "storeCodes": [
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Pasta dish",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_PASTA",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-B05_POINTS"
      },
      "terms": [
        "Redeem Pasta dish once at GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record20": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-B06_PROMO",
    "name": "Pizza - Hills Bistro",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-B06",
      "storeCodes": [
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Pizza",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_PIZZA",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-B06_POINTS"
      },
      "terms": [
        "Redeem Pizza once at GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record21": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-B07_PROMO",
    "name": "Main-course salad - Hills Bistro",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-B07",
      "storeCodes": [
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Main-course salad",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_MAIN_SALAD",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-B07_POINTS"
      },
      "terms": [
        "Redeem Main-course salad once at GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record22": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-B08_PROMO",
    "name": "Dessert - Hills Bistro",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-B08",
      "storeCodes": [
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Dessert",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_DESSERT",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-B08_POINTS"
      },
      "terms": [
        "Redeem Dessert once at GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record23": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-B09_PROMO",
    "name": "Main and soft drink - Hills Bistro",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-B09",
      "storeCodes": [
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Main and soft drink",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_PASTA",
          "quantity": 1,
          "unit": "EACH"
        },
        {
          "sku": "GP_SOFT_DRINK",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-B09_POINTS"
      },
      "terms": [
        "Redeem Main and soft drink once at GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record24": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-B10_PROMO",
    "name": "Two-course lunch - Hills Bistro",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-B10",
      "storeCodes": [
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Two-course lunch",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_VEGETABLE_SOUP",
          "quantity": 1,
          "unit": "EACH"
        },
        {
          "sku": "GP_PASTA",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-B10_POINTS"
      },
      "terms": [
        "Redeem Two-course lunch once at GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record25": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-B11_PROMO",
    "name": "Meal for two - Hills Bistro",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-B11",
      "storeCodes": [
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Meal for two",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_PASTA",
          "quantity": 2,
          "unit": "EACH"
        },
        {
          "sku": "GP_SOFT_DRINK",
          "quantity": 2,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-B11_POINTS"
      },
      "terms": [
        "Redeem Meal for two once at GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record26": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-B12_PROMO",
    "name": "AED 25 bill discount - Hills Bistro",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-B12",
      "storeCodes": [
        "greenperks-bistro"
      ],
      "minimumSubtotal": "100.00"
    },
    "actions": {
      "discountType": "AMOUNT",
      "discountValue": "25.00",
      "discountAmount": "25.00",
      "reasonCode": "CIRCA_SAMPLE_OFFER"
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "2500"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-B12_POINTS"
      },
      "terms": [
        "Redeem AED 25 bill discount once at GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Minimum eligible bill subtotal AED 100.00."
      ]
    }
  },
  "record27": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-A01_PROMO",
    "name": "Bottled water - GreenPerks",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-A01",
      "storeCodes": [
        "greenperks-cafe",
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Bottled water",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_BOTTLED_WATER",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-A01_POINTS"
      },
      "terms": [
        "Redeem Bottled water once at GreenPerks Hills Cafe or GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record28": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-A02_PROMO",
    "name": "Tea - GreenPerks",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-A02",
      "storeCodes": [
        "greenperks-cafe",
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Tea",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_TEA",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-A02_POINTS"
      },
      "terms": [
        "Redeem Tea once at GreenPerks Hills Cafe or GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record29": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-A03_PROMO",
    "name": "Americano - GreenPerks",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-A03",
      "storeCodes": [
        "greenperks-cafe",
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Americano",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_AMERICANO",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-A03_POINTS"
      },
      "terms": [
        "Redeem Americano once at GreenPerks Hills Cafe or GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record30": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-A04_PROMO",
    "name": "Fresh juice - GreenPerks",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-A04",
      "storeCodes": [
        "greenperks-cafe",
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Fresh juice",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_ORANGE_JUICE",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-A04_POINTS"
      },
      "terms": [
        "Redeem Fresh juice once at GreenPerks Hills Cafe or GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record31": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-A05_PROMO",
    "name": "Soft drink - GreenPerks",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-A05",
      "storeCodes": [
        "greenperks-cafe",
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Soft drink",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_SOFT_DRINK",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-A05_POINTS"
      },
      "terms": [
        "Redeem Soft drink once at GreenPerks Hills Cafe or GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record32": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-A06_PROMO",
    "name": "Dessert and tea - GreenPerks",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-A06",
      "storeCodes": [
        "greenperks-cafe",
        "greenperks-bistro"
      ]
    },
    "actions": {
      "benefitType": "ITEM",
      "benefitDescription": "Dessert and tea",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "items": [
        {
          "sku": "GP_DESSERT",
          "quantity": 1,
          "unit": "EACH"
        },
        {
          "sku": "GP_TEA",
          "quantity": 1,
          "unit": "EACH"
        }
      ]
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "0"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-A06_POINTS"
      },
      "terms": [
        "Redeem Dessert and tea once at GreenPerks Hills Cafe or GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Exact listed SKU quantities only; no substitutions."
      ]
    }
  },
  "record33": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-A07_PROMO",
    "name": "AED 10 bill discount - GreenPerks",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-A07",
      "storeCodes": [
        "greenperks-cafe",
        "greenperks-bistro"
      ],
      "minimumSubtotal": "40.00"
    },
    "actions": {
      "discountType": "AMOUNT",
      "discountValue": "10.00",
      "discountAmount": "10.00",
      "reasonCode": "CIRCA_SAMPLE_OFFER"
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "1000"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-A07_POINTS"
      },
      "terms": [
        "Redeem AED 10 bill discount once at GreenPerks Hills Cafe or GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Minimum eligible bill subtotal AED 40.00."
      ]
    }
  },
  "record34": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-A08_PROMO",
    "name": "AED 20 bill discount - GreenPerks",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-A08",
      "storeCodes": [
        "greenperks-cafe",
        "greenperks-bistro"
      ],
      "minimumSubtotal": "80.00"
    },
    "actions": {
      "discountType": "AMOUNT",
      "discountValue": "20.00",
      "discountAmount": "20.00",
      "reasonCode": "CIRCA_SAMPLE_OFFER"
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "2000"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-A08_POINTS"
      },
      "terms": [
        "Redeem AED 20 bill discount once at GreenPerks Hills Cafe or GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Minimum eligible bill subtotal AED 80.00."
      ]
    }
  },
  "record35": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-A09_PROMO",
    "name": "AED 30 bill discount - GreenPerks",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-A09",
      "storeCodes": [
        "greenperks-cafe",
        "greenperks-bistro"
      ],
      "minimumSubtotal": "120.00"
    },
    "actions": {
      "discountType": "AMOUNT",
      "discountValue": "30.00",
      "discountAmount": "30.00",
      "reasonCode": "CIRCA_SAMPLE_OFFER"
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "3000"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-A09_POINTS"
      },
      "terms": [
        "Redeem AED 30 bill discount once at GreenPerks Hills Cafe or GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Minimum eligible bill subtotal AED 120.00."
      ]
    }
  },
  "record36": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-A10_PROMO",
    "name": "10% bill discount - GreenPerks",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-A10",
      "storeCodes": [
        "greenperks-cafe",
        "greenperks-bistro"
      ],
      "minimumSubtotal": "50.00"
    },
    "actions": {
      "discountType": "PERCENT",
      "discountValue": "10.00",
      "maximumDiscountAmount": "20.00",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "percent": "10.00"
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "2000"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-A10_POINTS"
      },
      "terms": [
        "Redeem 10% bill discount once at GreenPerks Hills Cafe or GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Minimum eligible bill subtotal AED 50.00.",
        "Maximum discount AED 20.00."
      ]
    }
  },
  "record37": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "issuerEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "vendorEnterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    },
    "revision": 1,
    "active": true,
    "code": "CIRCA_COUPON_GP-A11_PROMO",
    "name": "15% bill discount - GreenPerks",
    "status": "ACTIVE",
    "priority": 25,
    "conditions": {
      "couponRequired": true,
      "customerOwnsCouponCode": true,
      "sourceProductCode": "CIRCA_COUPON_GP-A11",
      "storeCodes": [
        "greenperks-cafe",
        "greenperks-bistro"
      ],
      "minimumSubtotal": "100.00"
    },
    "actions": {
      "discountType": "PERCENT",
      "discountValue": "15.00",
      "maximumDiscountAmount": "40.00",
      "reasonCode": "CIRCA_SAMPLE_OFFER",
      "percent": "15.00"
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    },
    "budget": {
      "limit": "4000"
    },
    "couponOffer": {
      "version": 1,
      "supply": {
        "mode": "LIMITED",
        "quantity": 100
      },
      "ownerLimit": 1,
      "expiry": {
        "mode": "FIXED",
        "at": "2026-11-08T19:59:59.999Z"
      },
      "requirements": {
        "type": "REWARDS",
        "priceRef": "CIRCA_COUPON_GP-A11_POINTS"
      },
      "terms": [
        "Redeem 15% bill discount once at GreenPerks Hills Cafe or GreenPerks Hills Bistro.",
        "Valid through 8 November 2026, 23:59:59.999 Asia/Dubai (2026-11-08T19:59:59.999Z), independent of purchase time.",
        "Fictional local demonstration offer; no real-world venue participation or cash value.",
        "Minimum eligible bill subtotal AED 100.00.",
        "Maximum discount AED 40.00."
      ]
    }
  }
};
