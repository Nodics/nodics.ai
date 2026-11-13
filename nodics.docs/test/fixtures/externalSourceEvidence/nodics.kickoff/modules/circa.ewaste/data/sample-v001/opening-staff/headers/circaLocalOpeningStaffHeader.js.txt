/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/data/sample-v001/opening-staff/headers/circaLocalOpeningStaffHeader @description Selects only Profile's additive existing-employee owner action for the three approved issuer humans. @layer data @owner circa.ewaste */
module.exports = {
  profile: {
    circaLocalOpeningStaffData: {
      options: { enabled: true, schemaName: "employee", operation: "addReferenceGroupsAll",
        dataFilePrefix: "circaLocalOpeningStaffData", tenants: ["default"] },
      query: { code: "$code", loginId: "$loginId" },
    },
  },
};
