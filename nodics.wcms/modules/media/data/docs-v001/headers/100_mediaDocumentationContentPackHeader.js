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
    "mediaDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "mediaDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "mediaDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "mediaDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "mediaDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "mediaDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "mediaDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "mediaDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "mediaDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "mediaDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "mediaDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "mediaDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "mediaDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "mediaDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
