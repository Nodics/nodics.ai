/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module commsCore/data/docs-v002/headers/110_communicationDurableOutcomesDocumentationContentPackHeader
 * @description Declares the optional notification documentation import order; installation and publication remain governed.
 * @layer data
 * @owner commsCore
 */
module.exports = {
  "cms": {
    "communicationDurableOutcomesDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "communicationDurableOutcomesDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "communicationDurableOutcomesDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "communicationDurableOutcomesDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "communicationDurableOutcomesDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "communicationDurableOutcomesDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "communicationDurableOutcomesDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "communicationDurableOutcomesDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "communicationDurableOutcomesDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "communicationDurableOutcomesDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    },
    "communicationDurableOutcomesDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "communicationDurableOutcomesDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "communicationDurableOutcomesDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "communicationDurableOutcomesDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
