/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteVerificationPolicyData @description Provides reusable e-waste verification policy records for nodics.waste. @layer data @owner eWaste */
module.exports = {
    record0: {
        code: 'EWASTE_STANDARD_VERIFICATION',
        name: { en: 'E-Waste Standard Verification' },
        verificationRequired: true,
        allowedReviewerTypes: ['ADMIN', 'OPERATOR', 'VERIFIER'],
        requiredEvidenceTypes: ['PHOTO'],
        editableFactFields: ['categoryCode', 'itemTypeCode', 'conditionGrade', 'quantity', 'weight', 'brand', 'model'],
        requirePublicReasonOnReject: true,
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
