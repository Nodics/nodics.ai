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
    "bpmDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "bpmDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "bpmDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "bpmDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "bpmDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "bpmDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "bpmDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "bpmDocumentationComponentData"
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
