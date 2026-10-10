/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module profile/data/core-v001/records/groups/commerceRefundReviewerGroupData
 * @description Least-privilege enterprise purchase reviewer, installed only by explicit release selection and assigned only through Profile.
 * @layer data
 * @owner profile
 * @override Customer layers may narrow responsibility; never use this record as identity or global-scope authority.
 */
module.exports = {
  commerceRefundReviewer: {
    code: "commerceRefundReviewerUserGroup",
    name: "Commerce Refund Reviewer",
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
    ],
  },
};
