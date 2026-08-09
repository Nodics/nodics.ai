/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Nodics Process documentation template slots. */
module.exports = {
  "record0": {
    "code": "processDocumentationNavigationSlot",
    "template": "processDocumentationArticleTemplate",
    "name": "navigation",
    "minItems": 1,
    "maxItems": 1,
    "allowedComponentTypes": [
      "processDocumentationNavigationComponentType"
    ],
    "active": true
  },
  "record1": {
    "code": "processDocumentationArticleSlot",
    "template": "processDocumentationArticleTemplate",
    "name": "article",
    "minItems": 1,
    "maxItems": 1,
    "allowedComponentTypes": [
      "processDocumentationArticleComponentType"
    ],
    "active": true
  }
};
