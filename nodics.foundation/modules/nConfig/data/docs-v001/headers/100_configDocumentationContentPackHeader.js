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
    "configDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "configDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "configDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "configDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "configDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "configDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "configDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "configDocumentationComponentData"
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
