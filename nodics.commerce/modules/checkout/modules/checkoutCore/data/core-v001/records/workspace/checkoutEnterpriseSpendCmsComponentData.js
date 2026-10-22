/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module checkoutCore/data/workspace/Component @description CMS copy for the employee purchase-limit control; never policy selections or access authority. @layer data @owner checkoutCore */
module.exports = {
  "record0": {
    "functionalModule": "nodics.commerce",
    "active": true,
    "code": "checkoutEnterpriseSpendCopy",
    "typeCode": "checkoutEnterpriseSpendCopyType",
    "accessMode": "AUTHENTICATED",
    "authoringScope": {
      "enterpriseCode": "default",
      "catalogCode": "axisContentCatalog",
      "siteCode": "axisCmsSite"
    },
    "properties": {
      "title": "Purchase limit",
      "currency": "Currency or reward code",
      "perPurchaseLimit": "Per-purchase limit",
      "noLimit": "No additional limit",
      "load": "Load limit",
      "review": "Review limit",
      "confirm": "Save limit",
      "cancel": "Cancel",
      "inspect": "Inspect current limit",
      "retry": "Retry original selection",
      "saved": "Purchase limit confirmed.",
      "uncertain": "The outcome is unconfirmed. Inspect the current limit before continuing.",
      "conflict": "The purchase limit changed. Review the current selection.",
      "unavailable": "Purchase limit could not be confirmed.",
      "invalid": "Enter a currency or reward code and a non-negative decimal limit.",
      "revision": "Revision",
      "actor": "Employee"
    }
  }
};
