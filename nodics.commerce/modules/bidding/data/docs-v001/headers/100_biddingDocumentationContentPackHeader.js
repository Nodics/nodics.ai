/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Imports explicitly selected owner CMS documentation into Staged. */
module.exports = {
  "cms": {
    "biddingDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "biddingDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "biddingDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "biddingDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "biddingDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "biddingDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "biddingDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "biddingDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "biddingDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "biddingDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "biddingDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "biddingDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "biddingDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "biddingDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
