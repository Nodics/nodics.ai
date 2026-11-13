/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/data/sample-v001/refund-exception-staff/headers/circaLocalUnusedRefundExceptionStaffHeader @description Adds the approved Local review role through Profile without replaying an employee snapshot. @layer data @owner circa.ewaste */
module.exports = {
  profile: {
    circaLocalUnusedRefundExceptionStaffData: {
      options: { enabled: true, schemaName: "employee", operation: "addReferenceGroupsAll",
        dataFilePrefix: "circaLocalUnusedRefundExceptionStaffData", tenants: ["default"] },
      query: { code: "$code", loginId: "$loginId" },
    },
  },
};
