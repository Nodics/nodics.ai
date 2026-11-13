/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module circa.ewaste/data/sample-v001/digital-listing-context/headers/circaDigitalBundleListingContextHeader
 * @description Imports Circa's reviewed participant listing destination through Digital Core's generated owner.
 * @layer data-header
 * @owner circa.ewaste
 * @override Maintain unreleased v001 source; existing installations adopt exact new owner records without replay.
 */
module.exports = {
  digitalCore: {
    circaDigitalBundleListingContextData: {
      options: {
        enabled: true,
        schemaName: "digitalBundleListingContext",
        operation: "saveAll",
        dataFilePrefix: "circaDigitalBundleListingContextData",
      },
      query: { code: "$code", tenant: "$tenant", enterpriseCode: "$enterpriseCode" },
    },
  },
};
