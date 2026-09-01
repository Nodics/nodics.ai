/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module partnerWasteOverlay/data/project-v001/records/partnerWasteCollectionPresetData @description Fixture project collection preset extension and override for Waste. @layer test-fixture @owner waste */
module.exports = {
    record0: {
        code: 'EWASTE_DROP_OFF_STANDARD',
        name: { en: 'Partner E-Waste Drop-Off' },
        collectionPointType: 'E_WASTE_DROP_OFF',
        receiptPolicyCode: 'EWASTE_STANDARD_RECEIPT',
        verificationPolicyCode: 'EWASTE_STANDARD_VERIFICATION',
        evidencePolicyCode: 'EWASTE_STANDARD_PHOTO',
        impactProfileCode: 'PARTNER_VERIFIED_DEVICE_RECOVERY',
        acceptanceRuleCodes: ['EWASTE_DROP_OFF_MOBILE_DEVICE', 'EWASTE_DROP_OFF_LAPTOP', 'PARTNER_DROP_OFF_SMART_HOME'],
        serviceCapabilities: ['DROP_OFF', 'RECEIPT', 'PROJECT_ONBOARDING'],
        operatingMode: 'DROP_OFF',
        status: 'ACTIVE',
        revision: 2,
        active: true
    },
    record1: {
        code: 'PARTNER_MALL_DROP_OFF',
        name: { en: 'Partner Mall Drop-Off' },
        collectionPointType: 'E_WASTE_DROP_OFF',
        receiptPolicyCode: 'EWASTE_STANDARD_RECEIPT',
        verificationPolicyCode: 'EWASTE_STANDARD_VERIFICATION',
        evidencePolicyCode: 'EWASTE_STANDARD_PHOTO',
        impactProfileCode: 'PARTNER_VERIFIED_DEVICE_RECOVERY',
        acceptanceRuleCodes: ['EWASTE_DROP_OFF_MOBILE_DEVICE', 'PARTNER_DROP_OFF_SMART_HOME'],
        serviceCapabilities: ['DROP_OFF', 'RECEIPT', 'PUBLIC_COUNTER'],
        operatingMode: 'DROP_OFF',
        status: 'ACTIVE',
        revision: 1,
        active: true
    }
};
