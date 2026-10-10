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
    "contactSubmissionDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "contactSubmissionDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "contactSubmissionDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "contactSubmissionDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "contactSubmissionDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "contactSubmissionDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "contactSubmissionDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "contactSubmissionDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "contactSubmissionDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "contactSubmissionDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "contactSubmissionDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "contactSubmissionDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "contactSubmissionDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "contactSubmissionDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
