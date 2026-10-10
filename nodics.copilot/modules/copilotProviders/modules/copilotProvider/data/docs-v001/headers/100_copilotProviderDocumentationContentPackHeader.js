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
    "copilotProviderDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "copilotProviderDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotProviderDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "copilotProviderDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotProviderDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "copilotProviderDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotProviderDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "copilotProviderDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotProviderDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "copilotProviderDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotProviderDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "copilotProviderDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotProviderDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "copilotProviderDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
