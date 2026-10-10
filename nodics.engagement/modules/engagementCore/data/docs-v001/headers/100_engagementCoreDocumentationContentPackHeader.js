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
    "engagementCoreDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "engagementCoreDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "engagementCoreDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "engagementCoreDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "engagementCoreDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "engagementCoreDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "engagementCoreDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "engagementCoreDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "engagementCoreDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "engagementCoreDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "engagementCoreDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "engagementCoreDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "engagementCoreDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "engagementCoreDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
