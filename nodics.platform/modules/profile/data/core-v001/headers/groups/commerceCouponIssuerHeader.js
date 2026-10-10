/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/data/core-v001/headers/groups/commerceCouponIssuerHeader
 * @description Explicit new enterprise coupon issuer group, without employee assignment.
 * @layer data
 * @owner profile
 * @override Select this distinct release explicitly; preserve installed groups and identity authority.
 */
module.exports = {
  profile: {
    commerceCouponIssuerGroup: {
      options: {
        enabled: true,
        schemaName: "userGroup",
        operation: "saveAll",
        dataFilePrefix: "commerceCouponIssuerGroupData",
        userGroups: ["adminGroup"],
      },
      query: { code: "$code" },
    },
  },
};
