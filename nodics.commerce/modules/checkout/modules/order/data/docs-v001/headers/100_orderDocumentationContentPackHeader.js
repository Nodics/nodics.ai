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
    "orderDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "orderDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "orderDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "orderDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "orderDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "orderDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "orderDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "orderDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "orderDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "orderDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "orderDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "orderDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "orderDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "orderDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
