/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module circa.ewaste/data/sample-v001/store/records/circaStoreData.js
 * @description Supplies Circa Store master references independently of coupon issuance and inventory balances.
 * @layer data
 * @owner circa.ewaste
 * @override Author a successor release for customer-specific sample data; preserve installed transactions.
 */
module.exports = {
  "record0": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_ONLINE",
    "revision": 1,
    "active": true,
    "code": "circaMainStore",
    "name": "Circa eWaste",
    "status": "ACTIVE",
    "defaultCurrency": "POINTS",
    "defaultLocale": "en",
    "timezone": "Asia/Dubai",
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_ONLINE"
    }
  },
  "record1": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "revision": 1,
    "active": true,
    "code": "greenperks-cafe",
    "name": "GreenPerks Hills Cafe",
    "status": "ACTIVE",
    "defaultCurrency": "AED",
    "defaultLocale": "en",
    "timezone": "Asia/Dubai",
    "primaryLocationRef": {
      "moduleName": "locationCore",
      "schemaName": "location",
      "code": "greenperks-cafe-location"
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    }
  },
  "record2": {
    "tenant": "default",
    "enterpriseCode": "GREENPERKS_RETAIL",
    "revision": 1,
    "active": true,
    "code": "greenperks-bistro",
    "name": "GreenPerks Hills Bistro",
    "status": "ACTIVE",
    "defaultCurrency": "AED",
    "defaultLocale": "en",
    "timezone": "Asia/Dubai",
    "primaryLocationRef": {
      "moduleName": "locationCore",
      "schemaName": "location",
      "code": "greenperks-bistro-location"
    },
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "GREENPERKS_RETAIL"
    }
  },
  "record3": {
    "tenant": "default",
    "enterpriseCode": "RENEWWORKS_REPAIR_REUSE",
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "RENEWWORKS_REPAIR_REUSE"
    },
    "revision": 1,
    "active": true,
    "code": "renewworks-repair",
    "name": "RenewWorks fictional repair outlet",
    "status": "ACTIVE",
    "defaultCurrency": "AED",
    "defaultLocale": "en",
    "timezone": "Asia/Dubai"
  },
  "record4": {
    "tenant": "default",
    "enterpriseCode": "LOOPCYCLE_RECYCLING",
    "enterpriseRef": {
      "moduleName": "profile",
      "schemaName": "enterprise",
      "code": "LOOPCYCLE_RECYCLING"
    },
    "revision": 1,
    "active": true,
    "code": "loopcycle-accessories",
    "name": "LoopCycle fictional accessories outlet",
    "status": "ACTIVE",
    "defaultCurrency": "AED",
    "defaultLocale": "en",
    "timezone": "Asia/Dubai"
  }
};
