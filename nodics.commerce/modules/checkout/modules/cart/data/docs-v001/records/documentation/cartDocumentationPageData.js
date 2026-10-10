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
    "code": "nodicsDocsPagecartCustomerIntentCalculation",
    "name": "Cart Customer Intent and Calculation",
    "cmsSite": [
      "nodicsDocumentationSite"
    ],
    "typeCode": "nodicsDocumentationArticlePageType",
    "template": "nodicsDocumentationArticleTemplate",
    "renderer": "documentation.page.article",
    "cmsComponents": [
      {
        "target": "nodicsDocumentationNavigation",
        "slot": "navigation",
        "index": 5,
        "active": true
      },
      {
        "target": "nodicsDocsComponentcartCustomerIntentCalculation",
        "slot": "article",
        "index": 10,
        "active": true
      }
    ],
    "active": true
  }
};

