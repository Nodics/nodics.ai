/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Selects the provenance successor including matching Staged search metadata. */
module.exports = {
  "media": {
    "cronjobDocumentationMediaData": {
      "options": {
        "enabled": true,
        "schemaName": "media",
        "operation": "saveAll",
        "dataFilePrefix": "cronjobDocumentationMediaData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "cms": {
    "cronjobDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "cronjobDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cronjobDocumentationRelease003PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "cronjobDocumentationRelease003PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cronjobDocumentationRelease003PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "cronjobDocumentationRelease003PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cronjobDocumentationRelease003SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "cronjobDocumentationRelease003SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cronjobDocumentationRelease003ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "cronjobDocumentationRelease003ComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cronjobDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "cronjobDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "cronjobDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "cronjobDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
