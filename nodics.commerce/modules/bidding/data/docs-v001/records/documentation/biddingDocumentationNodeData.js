/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Owner-authored auction documentation CMS Node records; Staged pending review. */
module.exports = {
  "record0": {
    "code": "nodicsDocsNodePagecommerceAuctionRounds",
    "product": "nodicsDocumentationProduct",
    "navigation": "nodicsDocumentationNavigation",
    "parentNode": "nodicsDocsNodeSeccommerceCartAndCheckout",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Private Auction Rounds and Settlement",
    "nodeSummary": "Private independent offers, Enterprise participation, protected holds, grace selection, deterministic fallback, recovery and selected Checkout handoff.",
    "nodeContentArea": {
      "route": "/docs/framework/commerce-auction-rounds",
      "documentType": "operations",
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
    "targetDocumentationPage": "nodicsDocsMetadatacommerceAuctionRounds",
    "targetPage": "nodicsDocsPagecommerceAuctionRounds",
    "targetRoute": "nodicsDocsRoutecommerceAuctionRounds",
    "nodeOrder": 90010,
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
      "auctions",
      "bidding",
      "private-offers",
      "grace",
      "settlement"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  }
};
