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
    "locationMapDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "locationMapDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationMapDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "locationMapDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationMapDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "locationMapDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationMapDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "locationMapDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationMapDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "locationMapDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationMapDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "locationMapDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationMapDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "locationMapDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
