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
    "localizationCoreDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "localizationCoreDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "localizationCoreDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "localizationCoreDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "localizationCoreDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "localizationCoreDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "localizationCoreDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "localizationCoreDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "localizationCoreDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "localizationCoreDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "localizationCoreDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "localizationCoreDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "localizationCoreDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "localizationCoreDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
