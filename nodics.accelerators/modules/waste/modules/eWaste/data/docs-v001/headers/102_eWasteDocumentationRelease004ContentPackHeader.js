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
    "eWasteDocumentationRelease004NodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease004NodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease004PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease004PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease004PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease004PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease004SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease004SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "eWasteDocumentationRelease004ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "eWasteDocumentationRelease004ComponentData"
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
