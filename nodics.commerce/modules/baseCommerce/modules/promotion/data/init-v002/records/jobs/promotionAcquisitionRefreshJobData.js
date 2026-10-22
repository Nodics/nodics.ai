/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module promotion/data/jobs/promotionAcquisitionRefreshJobData
 * @description Inactive governed Cron definition. Operators select the channel, tenant, node and cadence before activation.
 * @owner promotion @layer module-data
 */
module.exports = { record1: {
    code: 'promotionAcquisitionRefreshJob', name: 'Coupon acquisition projection refresh',
    active: false, runOnInit: false, runOnNode: 'node0', logResult: true,
    jobDetail: { startNode: 'DefaultCouponAcquisitionRefreshService.run', channelCode: null },
    trigger: { expression: '0 0 * * * *' }, start: new Date('2026-01-01T00:00:00.000Z'),
    priority: 900, status: 'NEW', state: 'NEW',
} };
