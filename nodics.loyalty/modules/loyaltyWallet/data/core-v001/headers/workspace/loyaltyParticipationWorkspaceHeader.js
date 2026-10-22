/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module loyaltyWallet/data/workspace/header @description Explicit CMS import targets; no activation. @layer data @owner loyaltyWallet */
module.exports = {
  "cms": {
    "loyaltyParticipationCmsTypeData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsTypeCode",
        "operation": "saveAll",
        "dataFilePrefix": "loyaltyParticipationCmsTypeData"
      },
      "query": {
        "code": "$code"
      }
    },
    "loyaltyParticipationCmsRendererData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsTypeCode2Renderer",
        "operation": "saveAll",
        "dataFilePrefix": "loyaltyParticipationCmsRendererData"
      },
      "query": {
        "code": "$code"
      }
    },
    "loyaltyParticipationCmsComponentData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsComponent",
        "operation": "saveAll",
        "dataFilePrefix": "loyaltyParticipationCmsComponentData"
      },
      "query": {
        "code": "$code"
      }
    },
    "loyaltyParticipationCmsPageData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPage",
        "operation": "saveAll",
        "dataFilePrefix": "loyaltyParticipationCmsPageData"
      },
      "query": {
        "code": "$code"
      }
    },
    "loyaltyParticipationCmsRouteData": {
      "options": {
        "enabled": true,
        "schemaName": "cmsPageRoute",
        "operation": "saveAll",
        "dataFilePrefix": "loyaltyParticipationCmsRouteData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
