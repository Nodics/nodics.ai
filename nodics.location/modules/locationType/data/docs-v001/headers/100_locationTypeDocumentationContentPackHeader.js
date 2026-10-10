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
    "locationTypeDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "locationTypeDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationTypeDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "locationTypeDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationTypeDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "locationTypeDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationTypeDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "locationTypeDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationTypeDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "locationTypeDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationTypeDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "locationTypeDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationTypeDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "locationTypeDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
