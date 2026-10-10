/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/data/core-v001/headers/groups/commerceRefundReviewerHeader
 * @description Explicit Profile permission-group contribution; does not assign an employee or expand existing groups.
 * @layer data
 * @owner profile
 * @override Later layers may narrow the group through a governed successor; preserve insert-only installation.
 */
module.exports = {
  profile: {
    commerceRefundReviewerGroup: {
      options: {
        enabled: true,
        schemaName: "userGroup",
        operation: "saveAll",
        dataFilePrefix: "commerceRefundReviewerGroupData",
        userGroups: ["adminGroup"],
      },
      query: { code: "$code" },
    },
  },
};
