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
    "cmsDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cmsDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cmsDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cmsDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cmsDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cmsDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cmsDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
