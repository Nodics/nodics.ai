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
    "routerDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "routerDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "routerDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "routerDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "routerDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "routerDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "routerDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "routerDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "routerDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "routerDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "routerDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "routerDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "routerDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "routerDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
