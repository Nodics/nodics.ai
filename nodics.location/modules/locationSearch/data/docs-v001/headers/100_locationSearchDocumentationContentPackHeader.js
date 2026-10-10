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
    "locationSearchDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "locationSearchDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationSearchDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "locationSearchDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationSearchDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "locationSearchDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationSearchDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "locationSearchDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationSearchDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "locationSearchDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationSearchDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "locationSearchDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationSearchDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "locationSearchDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
