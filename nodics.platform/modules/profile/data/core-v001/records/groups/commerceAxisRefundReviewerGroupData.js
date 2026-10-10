/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/data/core-v001/records/groups/commerceAxisRefundReviewerGroupData
 * @description Explicit enterprise refund operations with narrowly bounded Axis presentation access.
 * @layer data
 * @owner profile
 * @override Later governed layers may narrow this distinct group; never broaden ordinary employees or API reviewers.
 */
module.exports = {
  commerceAxisRefundReviewer: {
    code: "commerceAxisRefundReviewerUserGroup",
    name: "Commerce Axis Refund Reviewer",
    active: true,
    parentGroups: ["employeeUserGroup"],
    permissions: [
      "commerce.dispute.review",
      "commerce.refund.execute",
      "commerce.fulfillment.return",
      "commerce.order.read",
      "commerce.lifecycle.read",
      "commerce.fulfillment.read",
      "profile.scope.read",
      "axis.view",
      "axis.dashboard.view",
      "backoffice.bootstrap.view",
    ],
  },
};
