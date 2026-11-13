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
    "workflowDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "workflowDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "workflowDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "workflowDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "workflowDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "workflowDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "workflowDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "workflowDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "workflowDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "workflowDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "workflowDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "workflowDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "workflowDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "workflowDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
