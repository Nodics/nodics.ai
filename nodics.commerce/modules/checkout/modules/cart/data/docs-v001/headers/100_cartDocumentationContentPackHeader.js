/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical cart documentation import header; shared foundation is selected by the content-pack manifest. */
module.exports = {
  "cms": {
    "cartDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "cartDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cartDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "cartDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cartDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "cartDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cartDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "cartDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cartDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "cartDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cartDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "cartDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cartDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "cartDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
