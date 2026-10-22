/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical promotion documentation import header; shared foundation is selected by the content-pack manifest. */
module.exports = {
  "cms": {
    "promotionDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "promotionDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "promotionDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "promotionDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "promotionDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "promotionDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "promotionDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "promotionDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "promotionDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "promotionDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "promotionDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "promotionDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "promotionDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "promotionDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
