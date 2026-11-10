/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/data/digitalCouponExpiryReminderJob @description Inactive reminder job for reviewed activation. @owner digitalCore @layer module-data */
module.exports = {
  "record1": {
    "code": "digitalCouponExpiryReminderJob",
    "name": "Coupon expiry reminder sweep",
    "active": false,
    "runOnInit": false,
    "runOnNode": "node0",
    "logResult": true,
    "jobDetail": {
      "processTrigger": {
        "triggerCode": "digitalCouponExpiryReminderTrigger"
      }
    },
    "trigger": {
      "expression": "0 0 * * * *"
    },
    "start": "2026-01-01T00:00:00.000Z",
    "priority": 900,
    "status": "NEW",
    "state": "NEW"
  }
};
