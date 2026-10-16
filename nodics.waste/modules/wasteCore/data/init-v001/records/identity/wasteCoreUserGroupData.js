/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module wasteCore/data/accessGroups @description Owns userGroup seed records administered through Profile and Axis. @layer data @owner wasteCore @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "wasteOperatorUserGroup",
    "name": "wasteOperatorUserGroup",
    "active": true,
    "parentGroups": [
      "employeeUserGroup"
    ],
    "permissions": [
      "waste.backoffice.view",
      "waste.collectionCentre.search",
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
      "waste.impact.calculate",
      "waste.asset.create",
      "waste.asset.own.read",
      "waste.asset.marketplace.project",
      "waste.asset.gift.transfer",
      "waste.asset.coupon.redeem",
      "waste.asset.sale.transfer",
      "waste.asset.donation.transfer"
    ]
  },
  "record1": {
    "code": "wasteEnterpriseAdministratorUserGroup",
    "name": "wasteEnterpriseAdministratorUserGroup",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "commerce.dispute.review",
      "commerce.refund.execute",
      "commerce.backoffice.view",
      "commerce.coupon.pos.redeem",
      "commerce.order.read",
      "commerce.product.read",
      "commerce.promotion.manage",
      "commerce.promotion.read",
      "profile.scope.read",
      "waste.audit.read",
      "waste.backoffice.view",
      "waste.marketplace.moderate",
      "waste.review.approve",
      "waste.review.evidence.read",
      "waste.review.queue.read",
      "waste.verification.record"
    ]
  },
  "record2": {
    "code": "wasteCentreOperatorUserGroup",
    "name": "wasteCentreOperatorUserGroup",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "waste.backoffice.view",
      "profile.scope.read",
      "waste.review.queue.read",
      "waste.review.evidence.read"
    ]
  },
  "record3": {
    "code": "wasteVerifierUserGroup",
    "name": "wasteVerifierUserGroup",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "waste.backoffice.view",
      "profile.scope.read",
      "waste.review.queue.read",
      "waste.review.evidence.read",
      "waste.verification.record"
    ]
  },
  "record4": {
    "code": "wasteApproverUserGroup",
    "name": "wasteApproverUserGroup",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "waste.backoffice.view",
      "profile.scope.read",
      "waste.review.queue.read",
      "waste.review.evidence.read",
      "waste.review.approve"
    ]
  },
  "record5": {
    "code": "wasteCouponManagerUserGroup",
    "name": "wasteCouponManagerUserGroup",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "commerce.backoffice.view",
      "commerce.promotion.read",
      "commerce.promotion.manage",
      "profile.scope.read",
      "commerce.coupon.pos.redeem"
    ]
  },
  "record6": {
    "code": "wasteMarketplaceModeratorUserGroup",
    "name": "wasteMarketplaceModeratorUserGroup",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "commerce.dispute.review",
      "commerce.refund.execute",
      "waste.backoffice.view",
      "profile.scope.read",
      "waste.review.queue.read",
      "waste.marketplace.moderate",
      "commerce.backoffice.view",
      "commerce.product.read",
      "commerce.order.read"
    ]
  },
  "record7": {
    "code": "wasteAuditorUserGroup",
    "name": "wasteAuditorUserGroup",
    "active": true,
    "parentGroups": [
      "axisOperationalUserGroup"
    ],
    "permissions": [
      "waste.backoffice.view",
      "profile.scope.read",
      "waste.review.queue.read",
      "waste.audit.read"
    ]
  }
};
