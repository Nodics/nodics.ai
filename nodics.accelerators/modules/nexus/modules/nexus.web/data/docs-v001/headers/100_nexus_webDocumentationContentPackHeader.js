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
    "nexus_webDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "nexus_webDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nexus_webDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "nexus_webDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nexus_webDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "nexus_webDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nexus_webDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "nexus_webDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nexus_webDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "nexus_webDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nexus_webDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "nexus_webDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nexus_webDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "nexus_webDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
