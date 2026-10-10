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
    "telcoSubscriptionDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "telcoSubscriptionDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "telcoSubscriptionDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "telcoSubscriptionDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "telcoSubscriptionDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "telcoSubscriptionDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "telcoSubscriptionDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "telcoSubscriptionDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "telcoSubscriptionDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "telcoSubscriptionDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    },
    "telcoSubscriptionDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "telcoSubscriptionDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "telcoSubscriptionDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "telcoSubscriptionDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
