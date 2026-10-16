/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module engagementCore/data/accessGroups @description Owns userGroup seed records administered through Profile and Axis. @layer data @owner engagementCore @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "engagementOperatorUserGroup",
    "name": "engagementOperatorUserGroup",
    "active": true,
    "parentGroups": [
      "employeeUserGroup"
    ],
    "permissions": [
      "engagement.backoffice.view",
      "engagement.operator.read",
      "engagement.operator.act",
      "engagement.handoff.recover",
      "engagement.handoff.reconcile",
      "engagement.testimonial.read",
      "engagement.testimonial.edit",
      "engagement.testimonial.approve",
      "engagement.testimonial.publish",
      "engagement.testimonial.act",
      "engagement.review.read",
      "engagement.review.moderate",
      "engagement.review.respond",
      "engagement.review.abuse.resolve",
      "engagement.review.appeal.resolve",
      "engagement.review.migrate",
      "engagement.feedback.read",
      "engagement.feedback.act",
      "engagement.feedback.classify",
      "engagement.feedback.insight",
      "engagement.operations.read",
      "engagement.operations.batch",
      "engagement.operations.export",
      "engagement.operations.repair",
      "engagement.automation.review",
      "engagement.automation.evaluate",
      "engagement.resilience.read",
      "engagement.compatibility.read",
      "communication.delivery.retry"
    ]
  }
};
