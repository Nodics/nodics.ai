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
    "fulfillmentCoreDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "fulfillmentCoreDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "fulfillmentCoreDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "fulfillmentCoreDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "fulfillmentCoreDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "fulfillmentCoreDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "fulfillmentCoreDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "fulfillmentCoreDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "fulfillmentCoreDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "fulfillmentCoreDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "fulfillmentCoreDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "fulfillmentCoreDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "fulfillmentCoreDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "fulfillmentCoreDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
