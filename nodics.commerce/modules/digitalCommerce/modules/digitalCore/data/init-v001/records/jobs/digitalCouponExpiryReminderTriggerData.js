/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/data/digitalCouponExpiryReminderTrigger @description Inactive reminder trigger for reviewed activation. @owner digitalCore @layer module-data */
module.exports = {
  "record1": {
    "code": "digitalCouponExpiryReminderTrigger",
    "name": "Coupon expiry reminder trigger",
    "definitionCode": "digitalCouponExpiryReminder",
    "triggerType": "CRON",
    "ownerModule": "digitalCore",
    "cronJobCode": "digitalCouponExpiryReminderJob",
    "status": "DRAFT",
    "active": false
  }
};
