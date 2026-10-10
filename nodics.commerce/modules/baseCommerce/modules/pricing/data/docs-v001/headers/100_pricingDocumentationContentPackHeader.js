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
    "pricingDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "pricingDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "pricingDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "pricingDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "pricingDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "pricingDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "pricingDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "pricingDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "pricingDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "pricingDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "pricingDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "pricingDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "pricingDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "pricingDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
