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
    "pipelineDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "pipelineDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "pipelineDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "pipelineDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "pipelineDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "pipelineDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "pipelineDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "pipelineDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "pipelineDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "pipelineDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "pipelineDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "pipelineDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "pipelineDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "pipelineDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
