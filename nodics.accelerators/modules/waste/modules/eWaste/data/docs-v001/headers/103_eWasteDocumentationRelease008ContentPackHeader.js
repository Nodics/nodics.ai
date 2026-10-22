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
    "eWasteDocumentationRelease008NodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease008NodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease008PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease008PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease008PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease008PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease008SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease008SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease008ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease008ComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease008PageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease008PageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease008RouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease008RouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
