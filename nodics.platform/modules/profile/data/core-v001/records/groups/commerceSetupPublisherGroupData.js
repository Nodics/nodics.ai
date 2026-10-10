/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/data/core-v001/records/groups/commerceSetupPublisherGroupData
 * @description Enterprise publication submission and owner reads with narrow Axis presentation access.
 * @layer data
 * @owner profile
 * @override Later governed releases may narrow this distinct group, never broaden Employee ancestry.
 */
module.exports = {
  commerceSetupPublisher: {
    code: "commerceSetupPublisherUserGroup",
    name: "Commerce Setup Publisher",
    active: true,
    parentGroups: ["employeeUserGroup"],
    permissions: [
      "publish.lifecycle.create",
      "publish.lifecycle.view",
      "publish.lifecycle.validate",
      "publish.lifecycle.requestApproval",
      "commerce.product.publish",
      "commerce.product.read",
      "commerce.promotion.read",
      "profile.scope.read",
      "backoffice.application.initialization.view",
      "backoffice.application.initialization.initiate",
      "axis.view",
      "axis.dashboard.view",
      "backoffice.bootstrap.view",
    ],
  },
};
