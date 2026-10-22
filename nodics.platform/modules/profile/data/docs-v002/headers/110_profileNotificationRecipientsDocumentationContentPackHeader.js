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
 * @module profile/data/docs-v002/headers/110_profileNotificationRecipientsDocumentationContentPackHeader
 * @description Declares the optional notification documentation import order; installation and publication remain governed.
 * @layer data
 * @owner profile
 */
module.exports = {
  "cms": {
    "profileNotificationRecipientsDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "profileNotificationRecipientsDocumentationComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "profileNotificationRecipientsDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "profileNotificationRecipientsDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "profileNotificationRecipientsDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "profileNotificationRecipientsDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "profileNotificationRecipientsDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "profileNotificationRecipientsDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "profileNotificationRecipientsDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "profileNotificationRecipientsDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    },
    "profileNotificationRecipientsDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "profileNotificationRecipientsDocumentationSearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "profileNotificationRecipientsDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "profileNotificationRecipientsDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
