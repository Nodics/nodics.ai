/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/data/digitalCouponExpiryReminderTriggerHeader @description Routes selected reminder data to its runtime owner. @owner digitalCore @layer module-data */
module.exports = {
  "workflow": {
    "digitalCouponExpiryReminderTrigger": {
      "options": {
        "enabled": true,
        "schemaName": "processTrigger",
        "operation": "saveAll",
        "insertOnly": true,
        "dataFilePrefix": "digitalCouponExpiryReminderTriggerData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
