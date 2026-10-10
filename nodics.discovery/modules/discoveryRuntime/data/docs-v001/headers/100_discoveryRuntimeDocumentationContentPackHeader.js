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
    "discoveryRuntimeDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "discoveryRuntimeDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "discoveryRuntimeDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "discoveryRuntimeDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "discoveryRuntimeDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "discoveryRuntimeDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "discoveryRuntimeDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "discoveryRuntimeDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "discoveryRuntimeDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "discoveryRuntimeDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "discoveryRuntimeDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "discoveryRuntimeDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "discoveryRuntimeDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "discoveryRuntimeDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
