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
    "wcmsExperienceDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsExperienceDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wcmsExperienceDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsExperienceDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wcmsExperienceDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsExperienceDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wcmsExperienceDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsExperienceDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wcmsExperienceDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsExperienceDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wcmsExperienceDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsExperienceDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "wcmsExperienceDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "wcmsExperienceDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
