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
    "installerDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "installerDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "installerDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "installerDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "installerDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "installerDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "installerDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "installerDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "installerDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "installerDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "installerDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "installerDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "installerDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "installerDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
