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
    "wcmsDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wcmsDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wcmsDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wcmsDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wcmsDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wcmsDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wcmsDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
