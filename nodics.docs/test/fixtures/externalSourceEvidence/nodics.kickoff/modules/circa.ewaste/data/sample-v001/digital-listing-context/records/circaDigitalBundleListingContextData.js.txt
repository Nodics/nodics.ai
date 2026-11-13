/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module circa.ewaste/data/sample-v001/digital-listing-context/records/circaDigitalBundleListingContextData
 * @description Selects the existing Circa Store, category, price book and reward unit for participant bundles.
 * @layer data
 * @owner circa.ewaste
 * @override Maintain unreleased v001 selections; installed adoption uses exact governed owner commands, never release replay.
 */
module.exports = {
  record0: {
    tenant: "default",
    enterpriseCode: "default",
    code: "circa-points-marketplace",
    name: "Circa circular marketplace",
    status: "ACTIVE",
    revision: 1,
    active: true,
    storeCode: "circaMainStore",
    categoryCodes: ["circaAssets"],
    currency: "POINTS",
    priceBookCode: "circaPointsPriceBook",
    reward: {
      programCode: "circa",
      rewardTypeCode: "points",
    },
  },
  record1: {
    tenant: "default",
    enterpriseCode: "GREENPERKS_RETAIL",
    code: "circa-retail-points-marketplace",
    name: "Circa Retail circular marketplace",
    status: "ACTIVE",
    revision: 1,
    active: true,
    storeCode: "circaMainStore",
    categoryCodes: ["circaAssets"],
    currency: "POINTS",
    priceBookCode: "circaPointsPriceBook",
    reward: {
      programCode: "circa",
      rewardTypeCode: "points",
    },
  },
};
