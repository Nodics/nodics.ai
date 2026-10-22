/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module checkoutCore/data/workspace/Type @description CMS copy for the employee purchase-limit control; never policy selections or access authority. @layer data @owner checkoutCore */
module.exports = {
  "record0": {
    "functionalModule": "nodics.commerce",
    "active": true,
    "code": "checkoutEnterpriseSpendCopyType",
    "kind": "COMPONENT",
    "contractVersion": 1,
    "propertySchema": {
      "title": {
        "type": "string",
        "localized": true
      },
      "currency": {
        "type": "string",
        "localized": true
      },
      "perPurchaseLimit": {
        "type": "string",
        "localized": true
      },
      "noLimit": {
        "type": "string",
        "localized": true
      },
      "load": {
        "type": "string",
        "localized": true
      },
      "review": {
        "type": "string",
        "localized": true
      },
      "confirm": {
        "type": "string",
        "localized": true
      },
      "cancel": {
        "type": "string",
        "localized": true
      },
      "inspect": {
        "type": "string",
        "localized": true
      },
      "retry": {
        "type": "string",
        "localized": true
      },
      "saved": {
        "type": "string",
        "localized": true
      },
      "uncertain": {
        "type": "string",
        "localized": true
      },
      "conflict": {
        "type": "string",
        "localized": true
      },
      "unavailable": {
        "type": "string",
        "localized": true
      },
      "invalid": {
        "type": "string",
        "localized": true
      },
      "revision": {
        "type": "string",
        "localized": true
      },
      "actor": {
        "type": "string",
        "localized": true
      }
    }
  }
};
