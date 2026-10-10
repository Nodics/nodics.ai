/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Imports module-owned documentation Media followed by CMS records. */
module.exports = {
  "cms": {
    "shoppingListDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "shoppingListDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "shoppingListDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "shoppingListDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "shoppingListDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "shoppingListDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "shoppingListDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "shoppingListDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "shoppingListDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "shoppingListDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "shoppingListDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "shoppingListDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "shoppingListDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "shoppingListDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
