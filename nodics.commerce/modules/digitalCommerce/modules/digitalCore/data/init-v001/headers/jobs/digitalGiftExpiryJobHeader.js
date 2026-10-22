/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module digitalCore/data/jobs/digitalGiftExpiryJobHeader @description Explicit inactive schedule contribution to the existing Cron owner. @owner digitalCore @layer module-data */
module.exports = { cronjob: { digitalGiftExpiryJob: {
  options: { enabled: true, schemaName: "cronJob", operation: "saveAll", dataFilePrefix: "digitalGiftExpiryJobData" },
  query: { code: "$code" },
} } };
