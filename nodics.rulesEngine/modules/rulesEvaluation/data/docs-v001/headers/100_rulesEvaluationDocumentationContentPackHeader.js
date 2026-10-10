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
    "rulesEvaluationDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "rulesEvaluationDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "rulesEvaluationDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "rulesEvaluationDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "rulesEvaluationDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "rulesEvaluationDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "rulesEvaluationDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "rulesEvaluationDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "rulesEvaluationDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "rulesEvaluationDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "rulesEvaluationDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "rulesEvaluationDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "rulesEvaluationDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "rulesEvaluationDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
