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
  "media": {
    "nodicsDocumentationMediaData": {
      "options": {
        "enabled": true,
        "schemaName": "media",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationMediaData"
      },
      "query": {
        "code": "$code"
      }
    }
  },
  "cms": {
    "nodicsDocumentationRelease002NodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationRelease002NodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationRelease002PageMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPage",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationRelease002PageMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationRelease002PublicationStateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationPublicationState",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationRelease002PublicationStateData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationRelease002SearchMetadataData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationSearchMetadata",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationRelease002SearchMetadataData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationRelease002ComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationRelease002ComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationRelease002PageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationRelease002PageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationRelease002RouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationRelease002RouteData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationSiteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsSite",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationSiteData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationProductData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationProduct",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationProductData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationAccessPolicyData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationAccessPolicy",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationAccessPolicyData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationNavigationData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNavigation",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationNavigationData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationDashboardData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationDashboard",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationDashboardData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationLegacyNavigationCleanupData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsDocumentationNode",
        "operation": "remove",
        "dataFilePrefix": "nodicsDocumentationLegacyNavigationCleanupData"
      },
      "query": {
        "product": "nodicsDocumentationProduct",
        "navigation": "nodicsDocumentationNavigation",
        "nodeLevel": {
          "$in": [
            "GROUP",
            "SUBGROUP",
            "TOPIC"
          ]
        }
      }
    },
    "nodicsDocumentationTypeCodeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsTypeCode",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationTypeCodeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationRendererData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsTypeCode2Renderer",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationRendererData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationSlotData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsSlotDefinition",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationSlotData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationTemplateBootstrapData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageTemplate",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationTemplateBootstrapData"
      },
      "query": {
        "code": "$code"
      }
    },
    "nodicsDocumentationTemplateData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageTemplate",
        "operation": "saveAll",
        "dataFilePrefix": "nodicsDocumentationTemplateData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
