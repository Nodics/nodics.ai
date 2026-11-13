/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/data/sample-v001/store/headers/circaStoreReferenceHeader @description Selects only Store master references through canonical generated services; no stock, coupons or consent are imported. @layer data-header @owner circa.ewaste */
module.exports = {
  store: {
    circaStoreData: {
      options: {
        enabled: true,
        schemaName: "store",
        operation: "saveAll",
        dataFilePrefix: "circaStoreData",
      },
      query: { code: "$code", tenant: "$tenant" },
    },
  },
};
