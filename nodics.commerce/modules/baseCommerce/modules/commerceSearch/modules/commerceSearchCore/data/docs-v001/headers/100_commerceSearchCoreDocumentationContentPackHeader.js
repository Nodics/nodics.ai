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
    "commerceSearchCoreDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "commerceSearchCoreDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commerceSearchCoreDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "commerceSearchCoreDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commerceSearchCoreDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "commerceSearchCoreDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commerceSearchCoreDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "commerceSearchCoreDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commerceSearchCoreDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "commerceSearchCoreDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commerceSearchCoreDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "commerceSearchCoreDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commerceSearchCoreDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "commerceSearchCoreDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
