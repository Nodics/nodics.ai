/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/data/sample-v001/staff-access/headers/circaCommerceStaffAssignmentHeader @description Selects Profile's additive, CAS-protected existing-employee role operation; no generic employee replacement. @layer data @owner circa.ewaste */
module.exports = {
  profile: {
    circaCommerceStaffAssignmentData: {
      options: {
        enabled: true,
        schemaName: "employee",
        operation: "addReferenceGroupsAll",
        dataFilePrefix: "circaCommerceStaffAssignmentData",
        tenants: ["default"],
      },
      query: { code: "$code", loginId: "$loginId" },
    },
  },
};
