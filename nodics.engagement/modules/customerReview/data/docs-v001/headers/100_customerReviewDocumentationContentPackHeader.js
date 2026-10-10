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
    "customerReviewDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "customerReviewDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "customerReviewDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "customerReviewDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "customerReviewDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "customerReviewDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "customerReviewDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "customerReviewDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "customerReviewDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "customerReviewDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "customerReviewDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "customerReviewDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "customerReviewDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "customerReviewDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
