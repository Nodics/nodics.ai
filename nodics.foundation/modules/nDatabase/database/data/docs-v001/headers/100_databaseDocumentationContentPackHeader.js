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
    "databaseDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "databaseDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "databaseDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "databaseDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "databaseDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "databaseDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "databaseDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "databaseDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "databaseDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "databaseDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "databaseDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "databaseDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "databaseDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "databaseDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
