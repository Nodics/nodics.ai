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
    "electronicsProductDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "electronicsProductDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "electronicsProductDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "electronicsProductDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "electronicsProductDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "electronicsProductDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "electronicsProductDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "electronicsProductDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "electronicsProductDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "electronicsProductDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    },
    "electronicsProductDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "electronicsProductDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "electronicsProductDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "electronicsProductDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
