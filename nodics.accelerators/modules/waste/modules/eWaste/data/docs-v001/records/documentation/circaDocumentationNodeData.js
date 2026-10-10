/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Circa documentation hierarchy nodes. */
module.exports = {
  "record0": {
    "code": "circaDocsNodeRoot",
    "product": "circaDocumentationProduct",
    "navigation": "circaDocumentationNavigationTree",
    "nodeLevel": "SECTION",
    "nodeType": "CONTAINER",
    "nodeTitle": "Circa Documentation",
    "nodeSummary": "Root for the eWaste-owned reusable Circa reference guide family; canonical backend CMS records, not a customer deployment runbook.",
    "nodeContentArea": {
      "dashboard": "circaDocsDashboardProduct"
    },
    "nodeDashboard": "circaDocsDashboardProduct",
    "childSummaryCards": [
      {
        "code": "circa-guides",
        "title": "Circa Guides",
        "summary": "Reusable eWaste reference journeys, preset adoption and customer knowledge with explicit owner and live acceptance boundaries.",
        "order": 10
      }
    ],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 1,
      "pages": 4
    },
    "nodeOrder": 10,
    "expandable": true,
    "expandedByDefault": true,
    "nodeIcon": "book-open",
    "nodeAudience": [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "accessPolicy": "circaDocsAccessPublic",
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
      "eWaste",
      "reusable accelerator",
      "documentation"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record1": {
    "code": "circaDocsNodeSeccircaGuides",
    "product": "circaDocumentationProduct",
    "navigation": "circaDocumentationNavigationTree",
    "parentNode": "circaDocsNodeRoot",
    "nodeLevel": "SECTION",
    "nodeType": "CONTAINER",
    "nodeTitle": "Circa Guides",
    "nodeSummary": "Reusable eWaste reference journeys, preset adoption and customer knowledge with explicit owner and live acceptance boundaries.",
    "nodeContentArea": {
      "dashboard": "circaDocsDashboardSeccircaGuides",
      "pages": [
        "circa.catalogue",
        "circa.customer-journey",
        "circa.demo-data",
        "circa.customer-knowledge"
      ]
    },
    "nodeDashboard": "circaDocsDashboardSeccircaGuides",
    "childSummaryCards": [
      {
        "code": "circa.catalogue",
        "title": "Circa Shop and Coupons",
        "summary": "Reusable eWaste published-offer composition, native versus full-catalogue boundaries, safe projection, bounded reads and project-owned customization.",
        "order": 1
      },
      {
        "code": "circa.customer-journey",
        "title": "Circa customer journey",
        "summary": "Reusable eWaste customer, evidence and review orchestration with explicit arrival wiring, limited eligibility, real reviewer policy and separate live acceptance gates.",
        "order": 2
      },
      {
        "code": "circa.demo-data",
        "title": "Circa demonstration dataset",
        "summary": "Reusable eWaste preset inventory, explicit nImport adoption, aligned customer deltas and recovery without replaying customer history or inventing owner qualification.",
        "order": 3
      },
      {
        "code": "circa.customer-knowledge",
        "title": "Circa customer knowledge",
        "summary": "Reusable customer knowledge for advisory photo/guidance, known and unknown facts, confirmation, real review/settlement and explicitly unqualified retrieval/live journeys.",
        "order": 4
      }
    ],
    "childJourneyLinks": [
      {
        "label": "Circa Shop and Coupons",
        "targetPage": "circa.catalogue",
        "route": "/docs/circa-ewaste"
      },
      {
        "label": "Circa customer journey",
        "targetPage": "circa.customer-journey",
        "route": "/docs/circa-ewaste/circa-customer-journey"
      },
      {
        "label": "Circa demonstration dataset",
        "targetPage": "circa.demo-data",
        "route": "/docs/circa-ewaste/circa-demo-data"
      },
      {
        "label": "Circa customer knowledge",
        "targetPage": "circa.customer-knowledge",
        "route": "/docs/circa-ewaste/circa-customer-knowledge"
      }
    ],
    "childStatusSummary": {
      "childCount": 4,
      "pages": 4
    },
    "nodeOrder": 10,
    "expandable": true,
    "expandedByDefault": false,
    "nodeIcon": "folder",
    "nodeAudience": [
      "architect",
      "developer",
      "operator"
    ],
    "accessPolicy": "circaDocsAccessAuthenticated",
    "accessMode": "AUTHENTICATED",
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
      "eWaste",
      "reusable reference",
      "circa"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record2": {
    "code": "circaDocsNodePagecircaCatalogue",
    "product": "circaDocumentationProduct",
    "navigation": "circaDocumentationNavigationTree",
    "parentNode": "circaDocsNodeSeccircaGuides",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Circa Shop and Coupons",
    "nodeSummary": "Reusable eWaste published-offer composition, native versus full-catalogue boundaries, safe projection, bounded reads and project-owned customization.",
    "nodeContentArea": {
      "route": "/docs/circa-ewaste",
      "documentType": "how-to"
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "circaDocsMetadatacircaCatalogue",
    "targetPage": "circaDocsPagecircaCatalogue",
    "targetRoute": "circaDocsRoutecircaCatalogue",
    "nodeOrder": 1,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business-user",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "accessPolicy": "circaDocsAccessAuthenticated",
    "accessMode": "AUTHENTICATED",
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
      "eWaste",
      "reusable accelerator",
      "catalogue",
      "source-reviewed"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record3": {
    "code": "circaDocsNodePagecircaCustomerJourney",
    "product": "circaDocumentationProduct",
    "navigation": "circaDocumentationNavigationTree",
    "parentNode": "circaDocsNodeSeccircaGuides",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Circa customer journey",
    "nodeSummary": "Reusable eWaste customer, evidence and review orchestration with explicit arrival wiring, limited eligibility, real reviewer policy and separate live acceptance gates.",
    "nodeContentArea": {
      "route": "/docs/circa-ewaste/circa-customer-journey",
      "documentType": "how-to"
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "circaDocsMetadatacircaCustomerJourney",
    "targetPage": "circaDocsPagecircaCustomerJourney",
    "targetRoute": "circaDocsRoutecircaCustomerJourney",
    "nodeOrder": 2,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business-user",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "accessPolicy": "circaDocsAccessAuthenticated",
    "accessMode": "AUTHENTICATED",
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
      "eWaste",
      "reusable accelerator",
      "customer-journey",
      "source-reviewed"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record4": {
    "code": "circaDocsNodePagecircaDemoData",
    "product": "circaDocumentationProduct",
    "navigation": "circaDocumentationNavigationTree",
    "parentNode": "circaDocsNodeSeccircaGuides",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Circa demonstration dataset",
    "nodeSummary": "Reusable eWaste preset inventory, explicit nImport adoption, aligned customer deltas and recovery without replaying customer history or inventing owner qualification.",
    "nodeContentArea": {
      "route": "/docs/circa-ewaste/circa-demo-data",
      "documentType": "how-to"
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "circaDocsMetadatacircaDemoData",
    "targetPage": "circaDocsPagecircaDemoData",
    "targetRoute": "circaDocsRoutecircaDemoData",
    "nodeOrder": 3,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business-user",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "accessPolicy": "circaDocsAccessAuthenticated",
    "accessMode": "AUTHENTICATED",
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
      "eWaste",
      "reusable accelerator",
      "demo-data",
      "source-reviewed"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  },
  "record5": {
    "code": "circaDocsNodePagecircaCustomerKnowledge",
    "product": "circaDocumentationProduct",
    "navigation": "circaDocumentationNavigationTree",
    "parentNode": "circaDocsNodeSeccircaGuides",
    "nodeLevel": "PAGE_LINK",
    "nodeType": "PAGE",
    "nodeTitle": "Circa customer knowledge",
    "nodeSummary": "Reusable customer knowledge for advisory photo/guidance, known and unknown facts, confirmation, real review/settlement and explicitly unqualified retrieval/live journeys.",
    "nodeContentArea": {
      "route": "/docs/circa-ewaste/circa-customer-knowledge",
      "documentType": "how-to"
    },
    "childSummaryCards": [],
    "childJourneyLinks": [],
    "childStatusSummary": {
      "childCount": 0
    },
    "targetDocumentationPage": "circaDocsMetadatacircaCustomerKnowledge",
    "targetPage": "circaDocsPagecircaCustomerKnowledge",
    "targetRoute": "circaDocsRoutecircaCustomerKnowledge",
    "nodeOrder": 4,
    "expandable": false,
    "expandedByDefault": false,
    "nodeIcon": "file-text",
    "nodeAudience": [
      "business-user",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "accessPolicy": "circaDocsAccessAuthenticated",
    "accessMode": "AUTHENTICATED",
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
      "eWaste",
      "reusable accelerator",
      "customer-knowledge",
      "source-reviewed"
    ],
    "relatedNodes": [],
    "locale": "en",
    "channel": "web",
    "active": true
  }
};
