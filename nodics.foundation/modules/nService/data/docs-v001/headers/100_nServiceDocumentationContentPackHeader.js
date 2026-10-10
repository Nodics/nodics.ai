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
    "nServiceDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nServiceDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nServiceDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nServiceDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nServiceDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nServiceDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nServiceDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
