/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/data/core-v001/records/groups/commerceCouponIssuerGroupData
 * @description Enterprise budget admission, seller consent and bounded secure issuance through qualified owners.
 * @layer data
 * @owner profile
 * @override Later governed releases may narrow this distinct group; installation never enables owner qualifications.
 */
module.exports = {
  commerceCouponIssuer: {
    code: "commerceCouponIssuerUserGroup",
    name: "Commerce Coupon Issuer",
    active: true,
    parentGroups: ["employeeUserGroup"],
    permissions: [
      "commerce.promotion.manage",
      "commerce.coupon.seller.manage",
      "commerce.promotion.read",
      "profile.scope.read",
      "import.sample.run",
      "import.release.view",
      "import.release.validate",
      "backoffice.application.initialization.view",
      "backoffice.application.initialization.initiate",
      "axis.view",
      "axis.dashboard.view",
      "backoffice.bootstrap.view",
    ],
  },
};
