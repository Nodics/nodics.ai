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
    "wasteImpactDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "wasteImpactDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteImpactDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "wasteImpactDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteImpactDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "wasteImpactDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteImpactDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "wasteImpactDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteImpactDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "wasteImpactDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteImpactDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "wasteImpactDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wasteImpactDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "wasteImpactDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
