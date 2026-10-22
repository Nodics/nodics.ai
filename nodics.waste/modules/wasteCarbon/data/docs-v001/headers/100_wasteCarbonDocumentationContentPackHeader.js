/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @description Imports explicitly selected owner documentation records without business activation. */
module.exports = {
  "cms": {
    "wasteCarbonDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "wasteCarbonDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteCarbonDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "wasteCarbonDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteCarbonDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "wasteCarbonDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteCarbonDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "wasteCarbonDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteCarbonDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "wasteCarbonDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteCarbonDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "wasteCarbonDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteCarbonDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "wasteCarbonDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
