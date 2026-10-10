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
    "eWasteDocumentationMediaData": {
      "options": {
        "enabled": true,
        "schemaName": "media",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationMediaData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "cms": {
    "eWasteDocumentationRelease003NodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease003NodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease003PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease003PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease003PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease003PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease003SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease003SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease003ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease003ComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
