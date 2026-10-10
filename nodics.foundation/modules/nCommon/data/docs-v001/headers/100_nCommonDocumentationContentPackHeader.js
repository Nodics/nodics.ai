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
    "nCommonDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "nCommonDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nCommonDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "nCommonDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nCommonDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "nCommonDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nCommonDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "nCommonDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nCommonDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "nCommonDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nCommonDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "nCommonDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nCommonDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "nCommonDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
