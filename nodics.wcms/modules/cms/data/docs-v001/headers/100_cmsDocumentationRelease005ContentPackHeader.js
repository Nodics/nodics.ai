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
    "cmsDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cmsDocumentationRelease005PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationRelease005PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cmsDocumentationRelease005PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationRelease005PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cmsDocumentationRelease005SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationRelease005SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cmsDocumentationRelease005ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationRelease005ComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cmsDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cmsDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "cmsDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
