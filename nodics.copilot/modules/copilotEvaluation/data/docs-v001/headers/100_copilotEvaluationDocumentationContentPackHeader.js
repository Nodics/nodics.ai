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
    "copilotEvaluationDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "copilotEvaluationDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotEvaluationDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "copilotEvaluationDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotEvaluationDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "copilotEvaluationDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotEvaluationDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "copilotEvaluationDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotEvaluationDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "copilotEvaluationDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotEvaluationDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "copilotEvaluationDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotEvaluationDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "copilotEvaluationDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
