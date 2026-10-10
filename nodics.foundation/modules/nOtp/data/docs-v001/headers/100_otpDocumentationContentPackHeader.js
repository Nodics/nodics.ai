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
    "otpDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "otpDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "otpDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "otpDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "otpDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "otpDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "otpDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "otpDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "otpDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "otpDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "otpDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "otpDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "otpDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "otpDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
