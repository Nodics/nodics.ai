/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module loyaltyWallet/data/workspace/Page @description Governed presentation only, never wallet, policy or authority data. @layer data @owner loyaltyWallet */
module.exports = {
  "record0": {
    "functionalModule": "nodics.loyalty",
    "active": true,
    "code": "loyaltyParticipationWorkspacePage",
    "name": "Loyalty participation",
    "cmsSite": [
      "axisCmsSite"
    ],
    "typeCode": "axisSchemaWorkbenchPageType",
    "template": "axisSchemaWorkbenchPageTemplate",
    "renderer": "axis.page.schema-workbench",
    "accessMode": "AUTHENTICATED",
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "axisContentCatalog",
      "siteCode": "axisCmsSite"
    },
    "cmsComponents": [
      {
        "target": "loyaltyParticipationWorkspaceCopy",
        "slot": "header",
        "index": 10,
        "active": true,
        "authoringScope": {
          "enterpriseCode": "default",
          "catalogCode": "axisContentCatalog",
          "siteCode": "axisCmsSite"
        }
      }
    ]
  }
};
