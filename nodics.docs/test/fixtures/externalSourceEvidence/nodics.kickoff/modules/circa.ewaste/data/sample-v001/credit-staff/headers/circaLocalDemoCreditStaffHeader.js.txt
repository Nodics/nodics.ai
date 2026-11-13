/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/data/sample-v001/credit-staff/headers/circaLocalDemoCreditStaffHeader @description Selects Profile's additive CAS-protected existing employee operation, never saveAll. @layer data @owner circa.ewaste */
module.exports = {
  profile: {
    circaLocalDemoCreditStaffData: {
      options: { enabled: true, schemaName: "employee", operation: "addReferenceGroupsAll",
        dataFilePrefix: "circaLocalDemoCreditStaffData", tenants: ["default"] },
      query: { code: "$code", loginId: "$loginId" },
    },
  },
};
