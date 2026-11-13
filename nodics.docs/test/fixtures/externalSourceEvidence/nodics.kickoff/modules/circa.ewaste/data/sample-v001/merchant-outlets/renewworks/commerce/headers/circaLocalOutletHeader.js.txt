/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module circa.ewaste/data/sample-v001/merchant-outlets/renewworks/commerce/headers/circaLocalOutletHeader.js
 * @description Imports only approved outlet catalogue records; stock admission remains with Inventory.
 * @layer data
 * @owner circa.ewaste
 */
module.exports = {
  "product": {
    "circaLocalRenewWorksOutletProductData": {
      "options": {
        "enabled": true,
        "schemaName": "product",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalRenewWorksOutletProductData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaLocalRenewWorksOutletProductVariantData": {
      "options": {
        "enabled": true,
        "schemaName": "productVariant",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalRenewWorksOutletProductVariantData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaLocalRenewWorksOutletProductLocalizationData": {
      "options": {
        "enabled": true,
        "schemaName": "productLocalization",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalRenewWorksOutletProductLocalizationData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaLocalRenewWorksOutletProductVariantLocalizationData": {
      "options": {
        "enabled": true,
        "schemaName": "productVariantLocalization",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalRenewWorksOutletProductVariantLocalizationData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "pricing": {
    "circaLocalRenewWorksOutletPriceBookData": {
      "options": {
        "enabled": true,
        "schemaName": "priceBook",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalRenewWorksOutletPriceBookData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaLocalRenewWorksOutletPriceRowData": {
      "options": {
        "enabled": true,
        "schemaName": "priceRow",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalRenewWorksOutletPriceRowData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "tax": {
    "circaLocalRenewWorksOutletTaxPolicyData": {
      "options": {
        "enabled": true,
        "schemaName": "taxPolicy",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalRenewWorksOutletTaxPolicyData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "inventory": {
    "circaLocalRenewWorksOutletWarehouseData": {
      "options": {
        "enabled": true,
        "schemaName": "warehouse",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalRenewWorksOutletWarehouseData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
