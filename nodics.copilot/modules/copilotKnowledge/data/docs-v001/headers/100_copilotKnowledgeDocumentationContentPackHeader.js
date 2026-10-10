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
    "copilotKnowledgeDocumentationMediaData": {
      "options": {
        "enabled": true,
        "schemaName": "media",
        "operation": "saveAll",
        "dataFilePrefix": "copilotKnowledgeDocumentationMediaData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "cms": {
    "copilotKnowledgeDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "copilotKnowledgeDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotKnowledgeDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "copilotKnowledgeDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotKnowledgeDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "copilotKnowledgeDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotKnowledgeDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "copilotKnowledgeDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotKnowledgeDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "copilotKnowledgeDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotKnowledgeDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "copilotKnowledgeDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "copilotKnowledgeDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "copilotKnowledgeDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
