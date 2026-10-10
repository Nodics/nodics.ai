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
    "circaDocumentationPageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationPageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationPublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationPublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "circaDocumentationSearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationSearchMetadataData"
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
    "circaDocumentationComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "circaDocumentationComponentData"
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
