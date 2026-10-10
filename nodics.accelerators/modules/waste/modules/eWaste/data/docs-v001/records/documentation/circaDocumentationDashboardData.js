/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Circa documentation hierarchy dashboards. */
module.exports = {
  "record0": {
    "code": "circaDocsDashboardProduct",
    "ownerType": "PRODUCT",
    "ownerCode": "circaDocumentationProduct",
    "title": "Circa Documentation",
    "summary": "Landing content for the Circa customer-reference documentation catalogue, including setup, runtime, publication, qualification, customization, and functional journeys.",
    "contentArea": {
      "intent": "Help customer teams and implementation partners choose the correct project-owned journey before opening detailed implementation pages."
    },
    "cards": [
      {
        "code": "circa-guides",
        "title": "Circa Guides",
        "summary": "Customer-owned Circa operating guidance.",
        "order": 10
      }
    ],
    "journeyLinks": [
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
    "statusSummary": {
      "sections": 1,
      "pages": 4,
      "lifecycleState": "STAGED"
    },
    "product": "circaDocumentationProduct",
    "accessPolicy": "circaDocsAccessAuthenticated",
    "accessMode": "PUBLIC",
    "lifecycleState": "STAGED",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "active": true
  },
  "record1": {
    "code": "circaDocsDashboardSeccircaGuides",
    "ownerType": "SECTION",
    "ownerCode": "circaDocsNodeSeccircaGuides",
    "title": "Circa Guides",
    "summary": "Customer-owned Circa operating guidance.",
    "contentArea": {
      "businessPurpose": "Customer-owned Circa operating guidance.",
      "technicalPurpose": "Project documentation section managed as backend content-catalog data with publication lifecycle and access metadata."
    },
    "cards": [
      {
        "code": "circa.catalogue",
        "title": "Circa Shop and Coupons",
        "summary": "Circa Shop and Coupons for the Circa reference customer application.",
        "order": 1
      },
      {
        "code": "circa.customer-journey",
        "title": "Circa customer journey",
        "summary": "Circa customer journey for the Circa reference customer application.",
        "order": 2
      },
      {
        "code": "circa.demo-data",
        "title": "Circa demonstration dataset",
        "summary": "Circa demonstration dataset for the Circa reference customer application.",
        "order": 3
      },
      {
        "code": "circa.customer-knowledge",
        "title": "Circa customer knowledge",
        "summary": "Circa customer knowledge for the Circa reference customer application.",
        "order": 4
      }
    ],
    "journeyLinks": [
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
    "statusSummary": {
      "pages": 4
    },
    "accessMode": "AUTHENTICATED",
    "lifecycleState": "STAGED",
    "product": "circaDocumentationProduct",
    "accessPolicy": "circaDocsAccessAuthenticated",
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.dashboard.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "DASHBOARD_CHANGE"
    ],
    "active": true
  }
};
