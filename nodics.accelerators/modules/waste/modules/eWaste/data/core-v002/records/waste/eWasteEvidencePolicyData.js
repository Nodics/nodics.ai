/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module eWaste/data/core-v001/records/eWasteEvidencePolicyData @description Provides reusable e-waste evidence policy records for nodics.waste. @layer data @owner eWaste */
module.exports = {
    record0: {
        code: 'EWASTE_STANDARD_PHOTO',
        ownerModule: 'eWaste',
        requiredEvidenceTypes: ['PHOTO'],
        requiredFields: ['categoryCode', 'itemTypeCode', 'conditionGrade'],
        minimumPhotoCount: 1,
        status: 'ACTIVE',
        revision: 1,
        active: true
    },
    record1: {
        code: 'EWASTE_BATTERY_PHOTO',
        ownerModule: 'eWaste',
        requiredEvidenceTypes: ['PHOTO'],
        requiredFields: ['categoryCode', 'itemTypeCode', 'conditionGrade', 'hazardFlags'],
        minimumPhotoCount: 1,
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
