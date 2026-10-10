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
    "customerFeedbackDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "customerFeedbackDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "customerFeedbackDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "customerFeedbackDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "customerFeedbackDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "customerFeedbackDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "customerFeedbackDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "customerFeedbackDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "customerFeedbackDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "customerFeedbackDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "customerFeedbackDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "customerFeedbackDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "customerFeedbackDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "customerFeedbackDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
