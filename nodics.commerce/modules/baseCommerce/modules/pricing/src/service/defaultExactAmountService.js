/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module pricing/src/service/defaultExactAmountService @description Retains Pricing's mergeable exact-amount service over the shared deterministic decimal utility. @layer service @owner pricing @override Later layers may replace individual methods; currency and rounding policy remain capability-owned. */
module.exports = {
    ...require('../../../../../../../nodics.foundation/modules/nCommon/src/utils/exactAmount')
};
