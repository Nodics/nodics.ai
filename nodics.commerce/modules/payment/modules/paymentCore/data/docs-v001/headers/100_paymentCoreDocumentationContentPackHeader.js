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
    "paymentCoreDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "paymentCoreDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "paymentCoreDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "paymentCoreDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "paymentCoreDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "paymentCoreDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "paymentCoreDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "paymentCoreDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "paymentCoreDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "paymentCoreDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "paymentCoreDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "paymentCoreDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "paymentCoreDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "paymentCoreDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
