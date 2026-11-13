/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module circa.ewaste/data/sample-v001/merchant-outlets/loopcycle/commerce/headers/circaLocalOutletHeader.js
 * @description Imports only approved outlet catalogue records; stock admission remains with Inventory.
 * @layer data
 * @owner circa.ewaste
 */
module.exports = {
  "product": {
    "circaLocalLoopCycleOutletProductData": {
      "options": {
        "enabled": true,
        "schemaName": "product",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalLoopCycleOutletProductData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaLocalLoopCycleOutletProductVariantData": {
      "options": {
        "enabled": true,
        "schemaName": "productVariant",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalLoopCycleOutletProductVariantData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaLocalLoopCycleOutletProductLocalizationData": {
      "options": {
        "enabled": true,
        "schemaName": "productLocalization",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalLoopCycleOutletProductLocalizationData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaLocalLoopCycleOutletProductVariantLocalizationData": {
      "options": {
        "enabled": true,
        "schemaName": "productVariantLocalization",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalLoopCycleOutletProductVariantLocalizationData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "pricing": {
    "circaLocalLoopCycleOutletPriceBookData": {
      "options": {
        "enabled": true,
        "schemaName": "priceBook",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalLoopCycleOutletPriceBookData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaLocalLoopCycleOutletPriceRowData": {
      "options": {
        "enabled": true,
        "schemaName": "priceRow",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalLoopCycleOutletPriceRowData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "tax": {
    "circaLocalLoopCycleOutletTaxPolicyData": {
      "options": {
        "enabled": true,
        "schemaName": "taxPolicy",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalLoopCycleOutletTaxPolicyData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "inventory": {
    "circaLocalLoopCycleOutletWarehouseData": {
      "options": {
        "enabled": true,
        "schemaName": "warehouse",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalLoopCycleOutletWarehouseData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
