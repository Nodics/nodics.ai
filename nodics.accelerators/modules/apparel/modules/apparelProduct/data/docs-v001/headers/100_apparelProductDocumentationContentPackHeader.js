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
    "apparelProductDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "apparelProductDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "apparelProductDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "apparelProductDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "apparelProductDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "apparelProductDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "apparelProductDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "apparelProductDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "apparelProductDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "apparelProductDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "apparelProductDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "apparelProductDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "apparelProductDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "apparelProductDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
