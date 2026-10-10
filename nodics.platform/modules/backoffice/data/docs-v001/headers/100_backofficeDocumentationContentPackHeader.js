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
    "backofficeDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
