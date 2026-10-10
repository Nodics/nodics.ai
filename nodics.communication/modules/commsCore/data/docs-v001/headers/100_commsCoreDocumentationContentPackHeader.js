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
    "commsCoreDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "commsCoreDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commsCoreDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "commsCoreDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commsCoreDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "commsCoreDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commsCoreDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "commsCoreDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commsCoreDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "commsCoreDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commsCoreDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "commsCoreDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commsCoreDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "commsCoreDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
