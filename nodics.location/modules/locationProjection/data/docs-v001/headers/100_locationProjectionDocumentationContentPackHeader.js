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
    "locationProjectionDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "locationProjectionDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationProjectionDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "locationProjectionDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationProjectionDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "locationProjectionDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationProjectionDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "locationProjectionDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationProjectionDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "locationProjectionDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationProjectionDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "locationProjectionDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationProjectionDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "locationProjectionDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
