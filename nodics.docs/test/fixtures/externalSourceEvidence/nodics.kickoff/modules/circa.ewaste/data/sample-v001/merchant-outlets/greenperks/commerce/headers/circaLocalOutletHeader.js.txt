/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module circa.ewaste/data/sample-v001/merchant-outlets/greenperks/commerce/headers/circaLocalOutletHeader.js
 * @description Imports only approved outlet catalogue records; stock admission remains with Inventory.
 * @layer data
 * @owner circa.ewaste
 */
module.exports = {
  "product": {
    "circaLocalGreenPerksOutletProductData": {
      "options": {
        "enabled": true,
        "schemaName": "product",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalGreenPerksOutletProductData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaLocalGreenPerksOutletProductVariantData": {
      "options": {
        "enabled": true,
        "schemaName": "productVariant",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalGreenPerksOutletProductVariantData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaLocalGreenPerksOutletProductLocalizationData": {
      "options": {
        "enabled": true,
        "schemaName": "productLocalization",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalGreenPerksOutletProductLocalizationData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaLocalGreenPerksOutletProductVariantLocalizationData": {
      "options": {
        "enabled": true,
        "schemaName": "productVariantLocalization",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalGreenPerksOutletProductVariantLocalizationData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "pricing": {
    "circaLocalGreenPerksOutletPriceBookData": {
      "options": {
        "enabled": true,
        "schemaName": "priceBook",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalGreenPerksOutletPriceBookData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaLocalGreenPerksOutletPriceRowData": {
      "options": {
        "enabled": true,
        "schemaName": "priceRow",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalGreenPerksOutletPriceRowData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "tax": {
    "circaLocalGreenPerksOutletTaxPolicyData": {
      "options": {
        "enabled": true,
        "schemaName": "taxPolicy",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalGreenPerksOutletTaxPolicyData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "inventory": {
    "circaLocalGreenPerksOutletWarehouseData": {
      "options": {
        "enabled": true,
        "schemaName": "warehouse",
        "operation": "saveAll",
        "dataFilePrefix": "circaLocalGreenPerksOutletWarehouseData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
