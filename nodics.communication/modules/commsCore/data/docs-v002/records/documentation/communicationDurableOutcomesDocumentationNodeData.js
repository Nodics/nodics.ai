/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module commsCore/data/docs-v002/records/documentation/communicationDurableOutcomesDocumentationNodeData
 * @description Owns canonical communicationDurableOutcomesDocumentationNodeData successor records; installation and publication remain governed.
 * @layer data
 * @owner commsCore
 */
module.exports = {
  "record0": {
    "code": "nodicsDocsNodePagecommunicationDurableOutcomes",
    "product": "nodicsDocumentationProduct",
    "navigation": "nodicsDocumentationNavigation",
    "parentNode": "nodicsDocsNodeSeccommunicationAndNotifications",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Durable Outcome Delivery and Typed Inboxes",
    "nodeSummary": "Outcome messages tell a participant what the business owner has already proven. Communication owns durable message identity, rendering, delivery attempts, suppression, inbox records and uncertain-send reconciliation. It does not own gift acceptance, coupon validity, reward balances, auction settlement or employee membership. Business operations retain their original authoritative state even when message delivery fails.",
    "nodeContentArea": {
      "route": "/docs/framework/communication-durable-outcomes",
      "documentType": "integration",
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ]
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "nodicsDocsMetadatacommunicationDurableOutcomes",
    "targetPage": "nodicsDocsPagecommunicationDurableOutcomes",
    "targetRoute": "nodicsDocsRoutecommunicationDurableOutcomes",
    "nodeOrder": 10090,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "allowedRoles": [],
    "allowedGroups": [],
    "allowedPermissions": [],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.navigation.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "NAVIGATION_CHANGE",
      "DASHBOARD_CHANGE",
      "ACCESS_POLICY_CHANGE"
    ],
    "lifecycleState": "STAGED",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "notification",
      "recipient",
      "permission",
      "gift",
      "auction",
      "coupon",
      "transfer",
      "employee"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  }
};
