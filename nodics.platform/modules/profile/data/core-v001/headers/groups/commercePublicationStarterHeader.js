/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/data/core-v001/headers/groups/commercePublicationStarterHeader
 * @description Explicit forward Process starter group without changing installed publisher data or staff.
 * @layer data
 * @owner profile
 * @override Select explicitly and refuse conflicting existing group identities before installation.
 */
module.exports = {
  profile: {
    commercePublicationStarterGroup: {
      options: {
        enabled: true,
        schemaName: "userGroup",
        operation: "saveAll",
        dataFilePrefix: "commercePublicationStarterGroupData",
        userGroups: ["adminGroup"],
      },
      query: { code: "$code" },
    },
  },
};
