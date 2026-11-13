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
    "nServiceDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nServiceDocumentationRelease002PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationRelease002PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nServiceDocumentationRelease002PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationRelease002PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nServiceDocumentationRelease002SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationRelease002SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nServiceDocumentationRelease002ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationRelease002ComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nServiceDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nServiceDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "nServiceDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
