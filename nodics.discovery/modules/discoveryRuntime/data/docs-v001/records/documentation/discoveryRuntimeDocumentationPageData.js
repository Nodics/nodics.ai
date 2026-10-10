/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics framework documentation pages. */
module.exports = {
  "record0": {
    "code": "nodicsDocsPagediscoverySearchIndexing",
    "name": "Search, Indexing, and Discovery",
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
        "target": "nodicsDocsComponentdiscoverySearchIndexing",
        "slot": "article",
        "index": 10,
        "active": true
      }
    ],
    "active": true
  }
};
