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
    "rulesEvaluationDocumentationRelease002PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "rulesEvaluationDocumentationRelease002PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "rulesEvaluationDocumentationRelease002PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "rulesEvaluationDocumentationRelease002PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "rulesEvaluationDocumentationRelease002SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "rulesEvaluationDocumentationRelease002SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "rulesEvaluationDocumentationRelease002ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "rulesEvaluationDocumentationRelease002ComponentData"
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
