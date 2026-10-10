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
    "inventoryDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "inventoryDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "inventoryDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "inventoryDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "inventoryDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "inventoryDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "inventoryDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "inventoryDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "inventoryDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "inventoryDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "inventoryDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "inventoryDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "inventoryDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "inventoryDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
