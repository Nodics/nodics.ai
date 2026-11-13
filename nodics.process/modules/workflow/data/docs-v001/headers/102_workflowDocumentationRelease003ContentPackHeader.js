/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Workflow documentation 0.0.3 search visibility successor; existing articles and prior publication history are unchanged. */
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
    "workflowDocumentationRelease002PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "workflowDocumentationRelease002PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "workflowDocumentationRelease003PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "workflowDocumentationRelease003PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "workflowDocumentationRelease003SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "workflowDocumentationRelease003SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "workflowDocumentationRelease002ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "workflowDocumentationRelease002ComponentData"
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
