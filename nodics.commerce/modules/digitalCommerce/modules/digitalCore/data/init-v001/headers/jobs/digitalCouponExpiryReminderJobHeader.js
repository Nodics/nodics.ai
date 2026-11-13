/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/data/digitalCouponExpiryReminderJobHeader @description Routes selected reminder data to its runtime owner. @owner digitalCore @layer module-data */
module.exports = {
  "cronjob": {
    "digitalCouponExpiryReminderJob": {
      "options": {
        "enabled": true,
        "schemaName": "cronJob",
        "operation": "saveAll",
        "insertOnly": true,
        "dataFilePrefix": "digitalCouponExpiryReminderJobData"
      },
      "query": {
        "code": "$code"
      }
    }
  }
};
