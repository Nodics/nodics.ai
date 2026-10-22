/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module checkoutCore/data/workspace/header @description Explicit presentation imports only. @layer data @owner checkoutCore */
module.exports = {
  "cms": {
    "checkoutEnterpriseSpendCmsTypeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsTypeCode",
        "operation": "saveAll",
        "dataFilePrefix": "checkoutEnterpriseSpendCmsTypeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "checkoutEnterpriseSpendCmsRendererData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsTypeCode2Renderer",
        "operation": "saveAll",
        "dataFilePrefix": "checkoutEnterpriseSpendCmsRendererData"
      },
      "query": {
        "code": "$code"
      }
    },
    "checkoutEnterpriseSpendCmsComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "checkoutEnterpriseSpendCmsComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "checkoutEnterpriseSpendCmsPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "checkoutEnterpriseSpendCmsPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "checkoutEnterpriseSpendCmsRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "checkoutEnterpriseSpendCmsRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
