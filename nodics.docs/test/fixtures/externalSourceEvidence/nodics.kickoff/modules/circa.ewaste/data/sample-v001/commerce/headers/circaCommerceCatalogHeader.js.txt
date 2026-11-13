/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module circa.ewaste/data/sample-v001/commerce/headers/circaCommerceCatalogHeader.js
 * @description Supplies the unified Circa customer demonstration dataset through canonical owner imports.
 * @layer data
 * @owner circa.ewaste
 * @override Author a successor release for customer-specific sample data; preserve installed transactions.
 */
module.exports = {
  pricing: {
    circaPriceBookData: {
      options: {
        enabled: true,
        schemaName: "priceBook",
        operation: "saveAll",
        dataFilePrefix: "circaPriceBookData",
      },
      query: {
        code: "$code",
      },
    },
    circaPriceRowData: {
      options: {
        enabled: true,
        schemaName: "priceRow",
        operation: "saveAll",
        dataFilePrefix: "circaPriceRowData",
      },
      query: {
        code: "$code",
      },
    },
  },
  tax: {
    circaTaxPolicyData: {
      options: {
        enabled: true,
        schemaName: "taxPolicy",
        operation: "saveAll",
        dataFilePrefix: "circaTaxPolicyData",
      },
      query: {
        code: "$code",
      },
    },
  },
  inventory: {
    circaWarehouseData: {
      options: {
        enabled: true,
        schemaName: "warehouse",
        operation: "saveAll",
        dataFilePrefix: "circaWarehouseData",
      },
      query: {
        code: "$code",
      },
    },
  },
  product: {
    circaCategoryData: {
      options: {
        enabled: true,
        schemaName: "category",
        operation: "saveAll",
        dataFilePrefix: "circaCategoryData",
      },
      query: {
        code: "$code",
      },
    },
    circaCategoryLocalizationData: {
      options: {
        enabled: true,
        schemaName: "categoryLocalization",
        operation: "saveAll",
        dataFilePrefix: "circaCategoryLocalizationData",
      },
      query: {
        code: "$code",
      },
    },
    circaProductData: {
      options: {
        enabled: true,
        schemaName: "product",
        operation: "saveAll",
        dataFilePrefix: "circaProductData",
      },
      query: {
        code: "$code",
      },
    },
    circaProductLocalizationData: {
      options: {
        enabled: true,
        schemaName: "productLocalization",
        operation: "saveAll",
        dataFilePrefix: "circaProductLocalizationData",
      },
      query: {
        code: "$code",
      },
    },
    circaProductVariantData: {
      options: {
        enabled: true,
        schemaName: "productVariant",
        operation: "saveAll",
        dataFilePrefix: "circaProductVariantData",
      },
      query: {
        code: "$code",
      },
    },
    circaProductVariantLocalizationData: {
      options: {
        enabled: true,
        schemaName: "productVariantLocalization",
        operation: "saveAll",
        dataFilePrefix: "circaProductVariantLocalizationData",
      },
      query: {
        code: "$code",
      },
    },
  },
  promotion: {
    circaPromotionData: {
      options: {
        enabled: true,
        schemaName: "promotion",
        operation: "saveAll",
        dataFilePrefix: "circaPromotionData",
      },
      query: {
        code: "$code",
      },
    },
  },
};
