/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module circa.ewaste/data/customerParticipation/header @description Selects Profile-owned credential-free customer group adoption for the Circa sample. @layer data-header @owner circa.ewaste */
module.exports = {
  profile: {
    circaCustomerParticipationData: {
      options: {
        enabled: true,
        schemaName: "customer",
        operation: "addReferenceGroupsAll",
        dataFilePrefix: "circaCustomerParticipationData",
        userGroups: ["adminGroup"],
      },
      query: { code: "$code", loginId: "$loginId" },
    },
  },
};
