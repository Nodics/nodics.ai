/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Selects the provenance successor including matching Staged search metadata. */
module.exports = {
  "cms": {
    "bpmDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "bpmDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "bpmDocumentationRelease002PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "bpmDocumentationRelease002PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "bpmDocumentationRelease002PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "bpmDocumentationRelease002PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "bpmDocumentationRelease002SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "bpmDocumentationRelease002SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "bpmDocumentationRelease002ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "bpmDocumentationRelease002ComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "bpmDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "bpmDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "bpmDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "bpmDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
