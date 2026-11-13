/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Nodics framework documentation page and component types. */
module.exports = {
  "record0": {
    "code": "nodicsDocumentationArticlePageType",
    "kind": "PAGE",
    "contractVersion": 0,
    "active": true
  },
  "record1": {
    "code": "nodicsDocumentationArticleComponentType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record2": {
    "code": "nodicsDocumentationNavigationComponentType",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "active": true
  },
  "record3": {
    "code": "cmsRichTextComponent",
    "kind": "COMPONENT",
    "contractVersion": 0,
    "propertySchema": {
      "content": "object",
      "blocks": "array",
      "plainText": "string",
      "format": "string"
    },
    "active": true
  }
};
