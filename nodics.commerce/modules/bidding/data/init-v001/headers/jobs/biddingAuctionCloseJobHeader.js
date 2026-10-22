/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module bidding/data/jobs/biddingAuctionCloseJobHeader @description Contributes an inactive definition to the existing Cron owner only on explicit installation. @layer module-data @owner bidding */
module.exports = { cronjob: { biddingAuctionCloseJob: {
  options: { enabled: true, schemaName: 'cronJob', operation: 'saveAll', dataFilePrefix: 'biddingAuctionCloseJobData' },
  query: { code: '$code' },
} } };
