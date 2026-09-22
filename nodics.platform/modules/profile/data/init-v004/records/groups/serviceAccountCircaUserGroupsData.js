/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/data/init-v004/records/groups/serviceAccountCircaUserGroupsData
 * @description Extends service-account permissions for Circa browser registration and customer-owned evidence storage.
 * @layer data
 * @owner profile
 */
module.exports = {
  record1: {
    code: "serviceAccountUserGroup",
    name: "serviceAccountUserGroup",
    active: true,
    parentGroups: ["userGroup"],
    permissions: [
      "communication.request",
      "profile.externalIdentity.prepare",
      "profile.customer.register",
      "auth.internal.token.read",
      "auth.internal.token.read.anyTenant",
      "import.init.run",
      "import.core.run",
      "import.sample.run",
      "import.release.validate",
      "engagement.review.request.create",
      "engagement.review.syndication.import",
      "communication.callback.receive",
      "commerce.payment.callback.receive",
      "loyalty.wallet.open",
      "loyalty.rewards.earn",
      "loyalty.wallet.read",
      "loyalty.rewards.reserve",
      "loyalty.rewards.capture",
      "loyalty.rewards.release",
      "loyalty.rewards.reverse",
      "location.location.read",
      "location.location.search",
      "media.customer.upload",
      "media.customer.read",
      "waste.submission.create",
      "waste.submission.transition",
      "profile.scope.read",
      "waste.review.queue.read",
      "waste.review.evidence.read",
      "waste.verification.record",
      "waste.review.approve",
      "waste.audit.read",
      "waste.marketplace.moderate",
      "waste.collectionPoint.acceptance.check",
      "waste.collectionCentre.search",
      "waste.impact.calculate",
      "waste.asset.create",
      "waste.asset.own.read",
      "waste.asset.marketplace.project",
      "waste.asset.gift.transfer",
      "waste.asset.coupon.redeem",
      "waste.asset.sale.transfer",
      "waste.asset.donation.transfer",
    ],
  },
};
