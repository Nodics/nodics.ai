/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Nodics Process documentation template. */
module.exports = {
  "record0": {
    "code": "processDocumentationArticleTemplate",
    "name": "Nodics Process Documentation Article",
    "renderer": "documentation.template.article",
    "contractVersion": 2,
    "slots": [
      "processDocumentationNavigationSlot",
      "processDocumentationArticleSlot"
    ],
    "active": true
  }
};
