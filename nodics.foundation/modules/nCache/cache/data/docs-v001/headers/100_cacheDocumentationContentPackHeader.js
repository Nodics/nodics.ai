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
    "cacheDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "cacheDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cacheDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "cacheDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cacheDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "cacheDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cacheDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "cacheDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cacheDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "cacheDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cacheDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "cacheDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cacheDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "cacheDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
