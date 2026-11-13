/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Immutable documentation provenance correction 0.0.3; article bodies preserved, normal Staged review and Online publication required. */
module.exports = {
  "media": {
    "profileDocumentationMediaData": {
      "options": {
        "enabled": true,
        "schemaName": "media",
        "operation": "saveAll",
        "dataFilePrefix": "profileDocumentationMediaData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "cms": {
    "profileDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "profileDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "profileDocumentationRelease003PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "profileDocumentationRelease003PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "profileDocumentationRelease003PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "profileDocumentationRelease003PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "profileDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "profileDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "profileDocumentationRelease003ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "profileDocumentationRelease003ComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "profileDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "profileDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "profileDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "profileDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
