/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical digitalCore documentation CMS records; business setup remains independently selectable. */
module.exports = {
  "bundleGuide0": {
    "code": "nodicsDocsPagedigitalBundleHoldingsGifts",
    "name": "Whole Bundles, Gift Decisions and Delivery Evidence",
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
        "target": "nodicsDocsComponentdigitalBundleHoldingsGifts",
        "slot": "article",
        "index": 10,
        "active": true
      }
    ],
    "active": true
  },
  "record0": {
    "code": "nodicsDocsPagedigitalPurchaseDeliveryReveal",
    "name": "Digital Purchase, Delivery and Private Reveal",
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
        "target": "nodicsDocsComponentdigitalPurchaseDeliveryReveal",
        "slot": "article",
        "index": 10,
        "active": true
      }
    ],
    "active": true
  }
};
