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
    "emsClientDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "emsClientDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "emsClientDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "emsClientDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "emsClientDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "emsClientDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "emsClientDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "emsClientDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "emsClientDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "emsClientDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "emsClientDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "emsClientDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "emsClientDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "emsClientDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
