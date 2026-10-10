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
    "locationDraftDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "locationDraftDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationDraftDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "locationDraftDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationDraftDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "locationDraftDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationDraftDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "locationDraftDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationDraftDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "locationDraftDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationDraftDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "locationDraftDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "locationDraftDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "locationDraftDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
