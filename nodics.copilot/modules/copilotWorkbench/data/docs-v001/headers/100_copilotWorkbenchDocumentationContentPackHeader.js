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
  "media": {
    "copilotWorkbenchDocumentationMediaData": {
      "options": {
        "enabled": true,
        "schemaName": "media",
        "operation": "saveAll",
        "dataFilePrefix": "copilotWorkbenchDocumentationMediaData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "cms": {
    "copilotWorkbenchDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "copilotWorkbenchDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotWorkbenchDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "copilotWorkbenchDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotWorkbenchDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "copilotWorkbenchDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotWorkbenchDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "copilotWorkbenchDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotWorkbenchDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "copilotWorkbenchDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotWorkbenchDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "copilotWorkbenchDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotWorkbenchDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "copilotWorkbenchDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
