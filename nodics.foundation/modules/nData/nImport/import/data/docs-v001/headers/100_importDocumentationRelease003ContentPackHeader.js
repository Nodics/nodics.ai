/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Selects the provenance successor including matching Staged search metadata. */
module.exports = {
  "cms": {
    "importDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "importDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "importDocumentationRelease003PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "importDocumentationRelease003PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "importDocumentationRelease003PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "importDocumentationRelease003PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "importDocumentationRelease003SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "importDocumentationRelease003SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "importDocumentationRelease003ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "importDocumentationRelease003ComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "importDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "importDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "importDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "importDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
