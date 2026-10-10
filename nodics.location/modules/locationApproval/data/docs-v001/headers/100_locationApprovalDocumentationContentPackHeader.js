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
    "locationApprovalDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "locationApprovalDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationApprovalDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "locationApprovalDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationApprovalDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "locationApprovalDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationApprovalDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "locationApprovalDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationApprovalDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "locationApprovalDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationApprovalDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "locationApprovalDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationApprovalDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "locationApprovalDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
