/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Selects the immutable BackOffice 0.0.2 documentation successor through existing CMS import dispatch. */
module.exports = {
  "cms": {
    "backofficeDocumentationRelease002NodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationRelease002NodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationRelease002PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationRelease002PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationRelease002PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationRelease002PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationRelease002SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationRelease002SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationRelease002ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationRelease002ComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};

