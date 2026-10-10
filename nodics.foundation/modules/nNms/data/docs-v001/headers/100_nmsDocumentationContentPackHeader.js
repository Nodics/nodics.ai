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
    "nmsDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "nmsDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nmsDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "nmsDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nmsDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "nmsDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nmsDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "nmsDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nmsDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "nmsDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nmsDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "nmsDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nmsDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "nmsDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
