'use strict';

/** @description Nodics framework documentation template slots. */
module.exports = {
  "record0": {
    "code": "nodicsDocumentationNavigationSlot",
    "template": "nodicsDocumentationArticleTemplate",
    "name": "navigation",
    "minItems": 1,
    "maxItems": 1,
    "allowedComponentTypes": [
      "nodicsDocumentationNavigationComponentType"
    ],
    "active": true
  },
  "record1": {
    "code": "nodicsDocumentationArticleSlot",
    "template": "nodicsDocumentationArticleTemplate",
    "name": "article",
    "minItems": 1,
    "maxItems": 1,
    "allowedComponentTypes": [
      "nodicsDocumentationArticleComponentType"
    ],
    "active": true
  }
};
