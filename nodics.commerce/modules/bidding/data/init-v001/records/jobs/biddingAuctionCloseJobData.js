/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module bidding/data/jobs/biddingAuctionCloseJobData @description Explicitly selected inactive Cron-owned auction close/recovery schedule. @layer module-data @owner bidding */
module.exports = { record1: {
  code: 'biddingAuctionCloseJob', name: 'Auction close and notification recovery',
  active: false, runOnInit: false, runOnNode: 'node0', logResult: true,
  jobDetail: { startNode: 'DefaultBiddingCloseService.sweep' },
  trigger: { expression: '0 * * * * *' }, start: new Date('2026-01-01T00:00:00.000Z'),
  priority: 900, status: 'NEW', state: 'NEW',
} };
