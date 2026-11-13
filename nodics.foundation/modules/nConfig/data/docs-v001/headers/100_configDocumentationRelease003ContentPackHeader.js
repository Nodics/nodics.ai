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
    "configDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "configDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "configDocumentationRelease002PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "configDocumentationRelease003PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "configDocumentationRelease002PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "configDocumentationRelease003PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "configDocumentationRelease002SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "configDocumentationRelease003SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "configDocumentationRelease002ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "configDocumentationRelease003ComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "configDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "configDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "configDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "configDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
