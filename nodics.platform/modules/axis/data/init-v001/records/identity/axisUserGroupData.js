/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module axis/data/accessGroups @description Owns userGroup seed records administered through Profile and Axis. @layer data @owner axis @override Import explicitly; preserve existing governed records on replay. */
module.exports = {
  "record0": {
    "code": "axisViewerUserGroup",
    "name": "axisViewerUserGroup",
    "active": true,
    "parentGroups": [
      "employeeUserGroup"
    ],
    "permissions": [
      "axis.view",
      "axis.dashboard.view",
      "axis.application.read",
      "axis.documentation.read",
      "backoffice.registry.view",
      "backoffice.bootstrap.view",
      "backoffice.axis.policy.view",
      "backoffice.axis.initialization.view",
      "backoffice.application.initialization.view",
      "backoffice.contract.view",
      "system.health.readiness.view",
      "system.contract.openapi.view",
      "system.contract.swagger.view",
      "system.schema.view",
      "profile.backoffice.view",
      "profile.enterprise.search",
      "profile.enterpriseAccess.search",
      "profile.enterpriseAccess.assign",
      "cms.backoffice.view",
      "publish.lifecycle.view",
      "publish.operations.view",
      "editorial.backoffice.read",
      "cronjob.backoffice.view",
      "process.backoffice.view",
      "process.definition.read",
      "process.incident.read",
      "engagement.backoffice.view",
      "engagement.operator.read",
      "engagement.testimonial.read",
      "engagement.review.read",
      "engagement.feedback.read",
      "engagement.operations.read",
      "engagement.resilience.read",
      "engagement.compatibility.read",
      "communication.customer.read",
      "commerce.backoffice.view",
      "commerce.store.read",
      "commerce.product.read",
      "commerce.search.read",
      "commerce.catalog.read",
      "commerce.pricing.read",
      "commerce.tax.read",
      "commerce.promotion.read",
      "commerce.inventory.read",
      "commerce.cart.read",
      "commerce.order.read",
      "commerce.lifecycle.read",
      "commerce.payment.read",
      "commerce.fulfillment.read",
      "waste.backoffice.view",
      "storefront.backoffice.read",
      "media.context.view",
      "media.storage.policy.view",
      "media.cleanup.view",
      "media.content.read",
      "import.contentPack.view",
      "import.release.view",
      "import.history.view",
      "import.history.detail.view",
      "discovery.config.read",
      "dynamo.class.view",
      "dynamo.class.snapshot.view",
      "ai.knowledge.read",
      "ai.assistant.read",
      "ai.assistant.operations.read",
      "ai.ledger.read",
      "ai.usage.readOwn"
    ]
  },
  "record1": {
    "code": "axisOperationalUserGroup",
    "name": "axisOperationalUserGroup",
    "active": true,
    "parentGroups": [
      "employeeUserGroup"
    ],
    "permissions": [
      "axis.view",
      "axis.dashboard.view",
      "backoffice.registry.view",
      "backoffice.bootstrap.view",
      "backoffice.axis.policy.view",
      "backoffice.axis.initialization.view",
      "backoffice.application.initialization.view",
      "backoffice.contract.view"
    ]
  }
};
