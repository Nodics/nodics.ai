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
    "loyaltyWalletDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "loyaltyWalletDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "loyaltyWalletDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "loyaltyWalletDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "loyaltyWalletDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "loyaltyWalletDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "loyaltyWalletDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "loyaltyWalletDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "loyaltyWalletDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "loyaltyWalletDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "loyaltyWalletDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "loyaltyWalletDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "loyaltyWalletDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "loyaltyWalletDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
