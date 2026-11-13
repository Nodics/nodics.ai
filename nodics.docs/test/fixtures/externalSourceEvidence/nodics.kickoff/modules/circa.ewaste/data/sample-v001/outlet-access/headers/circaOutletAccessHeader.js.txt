/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/data/sample-v001/outlet-access/headers/circaOutletAccessHeader @description Explicitly installs reviewed demo outlet scopes without replaying staff or credentials. @layer data @owner circa.ewaste */
module.exports = {
  profile: {
    circaMerchantOutletScopeData: {
      options: {
        enabled: true,
        schemaName: "principalScopeAssignment",
        operation: "saveAll",
        dataFilePrefix: "circaMerchantOutletScopeData",
      },
      query: { code: "$code" },
    },
  },
};
