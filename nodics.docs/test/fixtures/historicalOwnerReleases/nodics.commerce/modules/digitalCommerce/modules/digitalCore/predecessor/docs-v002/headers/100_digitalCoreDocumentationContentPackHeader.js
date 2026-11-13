/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical digitalCore documentation import header; shared foundation is selected by the content-pack manifest. */
module.exports = {
  "cms": {
    "digitalCoreDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "digitalCoreDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "digitalCoreDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "digitalCoreDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "digitalCoreDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "digitalCoreDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "digitalCoreDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "digitalCoreDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "digitalCoreDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "digitalCoreDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "digitalCoreDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "digitalCoreDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "digitalCoreDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "digitalCoreDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
