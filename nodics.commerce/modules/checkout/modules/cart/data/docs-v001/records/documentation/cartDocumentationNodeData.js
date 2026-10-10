/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical cart documentation CMS records; business setup remains independently selectable. */
module.exports = {
  "record0": {
    "code": "nodicsDocsNodePagecartCustomerIntentCalculation",
    "product": "nodicsDocumentationProduct",
    "navigation": "nodicsDocumentationNavigation",
    "parentNode": "nodicsDocsNodeSeccommerceCartAndCheckout",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Cart Customer Intent and Calculation",
    "nodeSummary": "Persist buyer and Store intent, validate pinned Product identities, calculate exact owner decisions without reservations, and recover safely when an entry response fails after its write.",
    "nodeContentArea": {
      "route": "/docs/framework/cart-customer-intent-calculation",
      "documentType": "how-to",
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
    "targetDocumentationPage": "nodicsDocsMetadatacartCustomerIntentCalculation",
    "targetPage": "nodicsDocsPagecartCustomerIntentCalculation",
    "targetRoute": "nodicsDocsRoutecartCustomerIntentCalculation",
    "nodeOrder": 29305,
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
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "searchKeywords": [
      "cart.customer-intent-calculation",
      "cart",
      "original-replay",
      "scope",
      "recovery"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  }
};

