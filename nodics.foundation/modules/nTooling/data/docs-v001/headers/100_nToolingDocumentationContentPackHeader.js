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
    "nToolingDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "nToolingDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nToolingDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "nToolingDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nToolingDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "nToolingDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nToolingDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "nToolingDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nToolingDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "nToolingDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nToolingDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "nToolingDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nToolingDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "nToolingDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
