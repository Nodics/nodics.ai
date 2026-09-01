/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module loyaltyCore/data/core-v001/records/loyaltyOperationPolicyCoreData @description Provides default operation policies for points wallet movement. @layer data @owner loyaltyCore */
const policy = operationType => ({
    code: ['default', 'points', operationType].join(':'),
    programCode: 'default',
    rewardTypeCode: 'points',
    operationType,
    enabled: true,
    idempotencyRequired: true,
    status: 'ACTIVE',
    revision: 1,
    active: true
});

module.exports = {
    record0: policy('EARN'),
    record1: Object.assign(policy('RESERVE'), { reservationTtlSeconds: 900 }),
    record2: policy('CAPTURE'),
    record3: policy('RELEASE'),
    record4: policy('REVERSE')
};
