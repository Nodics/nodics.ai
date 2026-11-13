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
    "redisCacheDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "redisCacheDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "redisCacheDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "redisCacheDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "redisCacheDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "redisCacheDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "redisCacheDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "redisCacheDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "redisCacheDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "redisCacheDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "redisCacheDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "redisCacheDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "redisCacheDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "redisCacheDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
