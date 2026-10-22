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
    "wasteRewardDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "wasteRewardDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteRewardDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "wasteRewardDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteRewardDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "wasteRewardDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteRewardDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "wasteRewardDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteRewardDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "wasteRewardDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteRewardDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "wasteRewardDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteRewardDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "wasteRewardDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
