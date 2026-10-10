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
    "domainCommerceCoreDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "domainCommerceCoreDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "domainCommerceCoreDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "domainCommerceCoreDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "domainCommerceCoreDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "domainCommerceCoreDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "domainCommerceCoreDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "domainCommerceCoreDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "domainCommerceCoreDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "domainCommerceCoreDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "domainCommerceCoreDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "domainCommerceCoreDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "domainCommerceCoreDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "domainCommerceCoreDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
