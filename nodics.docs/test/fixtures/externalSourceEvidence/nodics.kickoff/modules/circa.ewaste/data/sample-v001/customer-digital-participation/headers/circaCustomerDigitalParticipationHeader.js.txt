/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/data/customerDigitalParticipation/header @description Selects Profile-owned credential-free adoption of the Digital participant group for Circa sample customers. @layer data-header @owner circa.ewaste */
module.exports = {
  profile: {
    circaCustomerDigitalParticipationData: {
      options: {
        enabled: true,
        schemaName: "customer",
        operation: "addReferenceGroupsAll",
        dataFilePrefix: "circaCustomerDigitalParticipationData",
        userGroups: ["adminGroup"],
      },
      query: { code: "$code", loginId: "$loginId" },
    },
  },
};
