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
    "commercialAgreementDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "commercialAgreementDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commercialAgreementDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "commercialAgreementDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commercialAgreementDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "commercialAgreementDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commercialAgreementDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "commercialAgreementDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commercialAgreementDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "commercialAgreementDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commercialAgreementDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "commercialAgreementDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "commercialAgreementDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "commercialAgreementDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
