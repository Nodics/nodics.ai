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
    "checkoutCoreDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "checkoutCoreDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "checkoutCoreDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "checkoutCoreDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "checkoutCoreDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "checkoutCoreDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "checkoutCoreDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "checkoutCoreDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "checkoutCoreDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "checkoutCoreDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "checkoutCoreDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "checkoutCoreDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "checkoutCoreDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "checkoutCoreDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
