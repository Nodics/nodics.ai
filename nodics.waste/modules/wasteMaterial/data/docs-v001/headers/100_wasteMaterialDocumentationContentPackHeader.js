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
    "wasteMaterialDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "wasteMaterialDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteMaterialDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "wasteMaterialDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteMaterialDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "wasteMaterialDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteMaterialDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "wasteMaterialDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteMaterialDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "wasteMaterialDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteMaterialDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "wasteMaterialDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteMaterialDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "wasteMaterialDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
