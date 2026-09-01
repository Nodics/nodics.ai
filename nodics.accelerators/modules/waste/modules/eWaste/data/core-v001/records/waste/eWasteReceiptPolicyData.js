/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteReceiptPolicyData @description Provides reusable e-waste receipt policy records for nodics.waste. @layer data @owner eWaste */
module.exports = {
    record0: {
        code: 'EWASTE_STANDARD_RECEIPT',
        name: { en: 'E-Waste Standard Receipt' },
        receiptRequired: true,
        measuredWeightRequired: true,
        measuredQuantityRequired: true,
        requiredEvidenceTypes: ['PHOTO', 'RECEIPT'],
        discrepancyHandling: 'REVIEW_REQUIRED',
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record1: {
        code: 'EWASTE_ASSUMED_RECEIPT',
        name: { en: 'E-Waste Assumed Receipt' },
        receiptRequired: false,
        measuredWeightRequired: false,
        measuredQuantityRequired: false,
        requiredEvidenceTypes: ['PHOTO'],
        discrepancyHandling: 'ALLOW_WITH_REASON',
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
