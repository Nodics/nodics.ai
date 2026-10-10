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
    "copilotCapabilityDocumentationMediaData": {
      "options": {
        "enabled": true,
        "schemaName": "media",
        "operation": "saveAll",
        "dataFilePrefix": "copilotCapabilityDocumentationMediaData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "cms": {
    "copilotCapabilityDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "copilotCapabilityDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotCapabilityDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "copilotCapabilityDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotCapabilityDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "copilotCapabilityDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotCapabilityDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "copilotCapabilityDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotCapabilityDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "copilotCapabilityDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotCapabilityDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "copilotCapabilityDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotCapabilityDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "copilotCapabilityDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
