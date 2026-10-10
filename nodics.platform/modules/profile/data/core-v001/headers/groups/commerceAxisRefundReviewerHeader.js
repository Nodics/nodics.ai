/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/data/core-v001/headers/groups/commerceAxisRefundReviewerHeader
 * @description Explicit insert-only Axis refund reviewer contribution; no existing identity or group mutation.
 * @layer data
 * @owner profile
 * @override Preserve separate explicit selection and least-privilege assignment through Profile.
 */
module.exports = {
  profile: {
    commerceAxisRefundReviewerGroup: {
      options: {
        enabled: true,
        schemaName: "userGroup",
        operation: "saveAll",
        dataFilePrefix: "commerceAxisRefundReviewerGroupData",
        userGroups: ["adminGroup"],
      },
      query: { code: "$code" },
    },
  },
};
