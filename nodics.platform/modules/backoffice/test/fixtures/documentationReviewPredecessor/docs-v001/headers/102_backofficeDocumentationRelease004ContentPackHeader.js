/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Selects BackOffice 0.0.3 corrected metadata with unchanged article/composition bytes through existing CMS import dispatch. */
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
    "backofficeDocumentationRelease004PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationRelease004PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationRelease004PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationRelease004PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationRelease004SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationRelease004SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "backofficeDocumentationRelease004ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "backofficeDocumentationRelease004ComponentData"
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
