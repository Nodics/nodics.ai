/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module promotion/data/jobs/promotionAcquisitionRefreshJobHeader
 * @description Explicit inactive Cron contribution, not automatic scheduler activation.
 * @owner promotion @layer module-data
 */
module.exports = { cronjob: { promotionAcquisitionRefreshJob: {
    options: { enabled: true, schemaName: 'cronJob', operation: 'saveAll', dataFilePrefix: 'promotionAcquisitionRefreshJobData' },
    query: { code: '$code' },
} } };
