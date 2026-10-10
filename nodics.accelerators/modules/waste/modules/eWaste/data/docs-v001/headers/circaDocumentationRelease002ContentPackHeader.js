/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Optional Circa accelerator documentation import header. */
module.exports = {
  "cms": {
    "circaDocumentationSiteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsSite",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationSiteData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationProductData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationProduct",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationProductData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationAccessPolicyData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationAccessPolicy",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationAccessPolicyData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationNavigationData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNavigation",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationNavigationData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationDashboardData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationDashboard",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationDashboardData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationLegacyNavigationCleanupData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "remove",
        "dataFilePrefix": "circaDocumentationLegacyNavigationCleanupData"
      },
      "query": {
        "product": "circaDocumentationProduct",
        "navigation": "circaDocumentationNavigationTree",
        "nodeLevel": {
          "$in": [
            "GROUP",
            "SUBGROUP",
            "TOPIC"
          ]
        }
      }
    },
    "circaDocumentationNodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationNodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationRelease002PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationRelease002PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationRelease002PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationRelease002PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationRelease002SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationRelease002SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationTypeCodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsTypeCode",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationTypeCodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationRendererData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsTypeCode2Renderer",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationRendererData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationTemplateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageTemplate",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationTemplateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationSlotData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsSlotDefinition",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationSlotData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationRelease002ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationRelease002ComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
