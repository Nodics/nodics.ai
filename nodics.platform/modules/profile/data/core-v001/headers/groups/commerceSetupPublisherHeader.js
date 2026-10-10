/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/data/core-v001/headers/groups/commerceSetupPublisherHeader
 * @description Explicit new enterprise setup publisher group, without employee assignment.
 * @layer data
 * @owner profile
 * @override Select this distinct release explicitly; preserve installed groups and identity authority.
 */
module.exports = {
  profile: {
    commerceSetupPublisherGroup: {
      options: {
        enabled: true,
        schemaName: "userGroup",
        operation: "saveAll",
        dataFilePrefix: "commerceSetupPublisherGroupData",
        userGroups: ["adminGroup"],
      },
      query: { code: "$code" },
    },
  },
};
