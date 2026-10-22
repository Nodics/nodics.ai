/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module loyaltyWallet/data/workspace/Route @description Governed presentation only, never wallet, policy or authority data. @layer data @owner loyaltyWallet */
module.exports = {
  "record0": {
    "functionalModule": "nodics.loyalty",
    "active": true,
    "code": "loyaltyParticipationWorkspaceRoute0",
    "site": "axisCmsSite",
    "path": "/loyalty/wallet",
    "locale": "en",
    "channel": "web",
    "page": "loyaltyParticipationWorkspacePage",
    "routeType": "PAGE",
    "deliveryState": "ONLINE",
    "accessMode": "AUTHENTICATED",
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "axisContentCatalog",
      "siteCode": "axisCmsSite"
    }
  },
  "record1": {
    "functionalModule": "nodics.loyalty",
    "active": true,
    "code": "loyaltyParticipationWorkspaceRoute1",
    "site": "axisCmsSite",
    "path": "/loyalty/transfer-settings",
    "locale": "en",
    "channel": "web",
    "page": "loyaltyParticipationWorkspacePage",
    "routeType": "PAGE",
    "deliveryState": "ONLINE",
    "accessMode": "AUTHENTICATED",
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "axisContentCatalog",
      "siteCode": "axisCmsSite"
    }
  },
  "record2": {
    "functionalModule": "nodics.loyalty",
    "active": true,
    "code": "loyaltyParticipationWorkspaceRoute2",
    "site": "axisCmsSite",
    "path": "/loyalty/enterprise-test-credits",
    "locale": "en",
    "channel": "web",
    "page": "loyaltyParticipationWorkspacePage",
    "routeType": "PAGE",
    "deliveryState": "ONLINE",
    "accessMode": "AUTHENTICATED",
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "axisContentCatalog",
      "siteCode": "axisCmsSite"
    }
  }
};
